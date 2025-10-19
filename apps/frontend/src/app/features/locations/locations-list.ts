import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AsyncStateComponent, AsyncStateStatus } from '@org/ui';
import * as L from 'leaflet';
import 'leaflet.locatecontrol';
import {
  Location,
  LocationsService,
} from '../../core/services/locations.service';

type AmenityFilterKey = 'wifi' | 'tables' | 'food' | 'drinks' | 'parking';

type LeafletLocateControl = L.Control & {
  start(): void;
  stop(): void;
  on(
    type: 'locationfound',
    fn: (event: L.LocationEvent) => void
  ): LeafletLocateControl;
  on(
    type: 'locationerror',
    fn: (event: L.ErrorEvent) => void
  ): LeafletLocateControl;
};

interface LeafletLocateOptions extends L.ControlOptions {
  flyTo?: boolean;
  keepCurrentZoomLevel?: boolean;
  drawCircle?: boolean;
  drawMarker?: boolean;
  showCompass?: boolean;
  strings?: {
    title?: string;
    popup?: string;
    outsideMapBoundsMsg?: string;
  };
  locateOptions?: PositionOptions & { maxZoom?: number };
}

type LeafletControlWithLocate = typeof L.control & {
  locate?: (options?: LeafletLocateOptions) => LeafletLocateControl;
};

interface StoredUserPosition {
  lat: number;
  lon: number;
  timestamp: number;
}

@Component({
  selector: 'app-locations-list',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    AsyncStateComponent,
  ],
  templateUrl: './locations-list.html',
  styleUrl: './locations-list.css',
})
export class LocationsListComponent implements OnInit {
  private locationsService = inject(LocationsService);

  locations: Location[] = [];
  filteredLocations: Location[] = [];
  loading = true;
  error: string | null = null;
  readonly loadingMessage = 'Chargement des lieux...';
  readonly defaultErrorMessage =
    'Impossible de charger les lieux. Veuillez réessayer.';

  // Filter properties
  searchTerm = '';
  selectedType = '';
  filters: Record<AmenityFilterKey, boolean> = {
    wifi: false,
    tables: false,
    food: false,
    drinks: false,
    parking: false,
  };

  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  private markersByLocationId: Map<string, L.Marker> = new Map();
  selectedLocationId: string | null = null;
  userPosition: { lat: number; lon: number } | null = null;
  private userMarker: L.Marker | null = null;
  private locateControl: LeafletLocateControl | null = null;
  private mapLocationFoundHandler?: (event: L.LocationEvent) => void;
  private mapLocationErrorHandler?: (event: L.ErrorEvent) => void;
  private preloadedUserPositionFromStorage = false;
  private restoredUserPosition = false;
  private initialLocateRequested = false;
  private skipNextNearestAdjust = false;
  private readonly userLocationStorageKey = 'barades.locations.userPosition';
  geolocationError: string | null = null;
  isDetailsCollapsed = false;

  ngOnInit(): void {
    console.log('[LocationsList] Component initialized');
    const storedPosition = this.readStoredUserPosition();
    if (storedPosition) {
      this.userPosition = {
        lat: storedPosition.lat,
        lon: storedPosition.lon,
      };
      this.preloadedUserPositionFromStorage = true;
    }
    // Initialize map immediately since container is always in DOM
    setTimeout(() => {
      console.log('[LocationsList] Attempting to initialize map...');
      this.initMap();
    }, 100);

    this.loadLocations();
  }

  private loadLocations(): void {
    console.log('[LocationsList] Loading locations...');
    this.loading = true;
    this.error = null;

    this.locationsService.getLocations().subscribe({
      next: (data) => {
        console.log(
          '[LocationsList] Locations loaded:',
          data.length,
          'locations'
        );
        // Filter out online/private locations with no coordinates
        this.locations = data.filter(
          (loc) => !(loc.type === 'PRIVATE' && loc.lat === 0 && loc.lon === 0)
        );
        this.filteredLocations = [...this.locations]; // Initialize filtered list
        this.loading = false;

        // CRITICAL: Wait for Angular to remove the 'hidden' class, then force map resize
        setTimeout(() => {
          if (this.map) {
            console.log(
              '[LocationsList] Container now visible, forcing map resize...'
            );
            const container = document.getElementById('map');
            console.log(
              '[LocationsList] Container dimensions NOW:',
              container?.offsetWidth,
              'x',
              container?.offsetHeight
            );
            this.map.invalidateSize(true);
            console.log(
              '[LocationsList] Map size after visibility change:',
              this.map.getSize()
            );
          }

          console.log('[LocationsList] Adding markers to map...');
          this.addMarkers();
          this.maybeRestoreUserPosition();
        }, 100);
      },
      error: (err) => {
        console.error('[LocationsList] Error loading locations:', err);
        this.error = this.defaultErrorMessage;
        this.loading = false;
      },
    });
  }

  private initMap(): void {
    console.log('[LocationsList] initMap() called');

    // Check if map container exists
    const container = document.getElementById('map');
    console.log('[LocationsList] Map container:', container);
    console.log(
      '[LocationsList] Container dimensions:',
      container?.offsetWidth,
      'x',
      container?.offsetHeight
    );

    if (!container) {
      console.error('[LocationsList] Map container not found!');
      return;
    }

    // Avoid reinitializing if map already exists
    if (this.map) {
      console.log('[LocationsList] Map already exists, removing old instance');
      if (this.mapLocationFoundHandler) {
        this.map.off('locationfound', this.mapLocationFoundHandler);
        this.mapLocationFoundHandler = undefined;
      }
      if (this.mapLocationErrorHandler) {
        this.map.off('locationerror', this.mapLocationErrorHandler);
        this.mapLocationErrorHandler = undefined;
      }
      this.map.remove();
      this.map = null;
      this.locateControl = null;
    }

    // Set default icon path for Leaflet
    L.Icon.Default.imagePath = 'assets/leaflet/';

    console.log('[LocationsList] Creating Leaflet map...');

    const initialCenter: [number, number] = this.userPosition
      ? [this.userPosition.lat, this.userPosition.lon]
      : [50.8503, 4.3517];
    const initialZoom = this.userPosition ? 15 : 7;

    // Center on Brussels or stored user position - create map with specific options
    this.map = L.map('map', {
      center: initialCenter,
      zoom: initialZoom,
      preferCanvas: false,
      attributionControl: true,
    });

    console.log('[LocationsList] Map created:', this.map);

    // Add OpenStreetMap tiles
    const tileLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }
    ).addTo(this.map);

    console.log('[LocationsList] Tile layer added:', tileLayer);

    // Critical: Force map to recognize its container size
    this.map.whenReady(() => {
      console.log('[LocationsList] Map is ready');
      this.setupLocateControl();
      this.triggerInitialLocate();
      setTimeout(() => {
        if (this.map) {
          console.log('[LocationsList] Calling invalidateSize()');
          const mapSize = this.map.getSize();
          console.log('[LocationsList] Map size before invalidate:', mapSize);
          this.map.invalidateSize(true);
          const mapSizeAfter = this.map.getSize();
          console.log(
            '[LocationsList] Map size after invalidate:',
            mapSizeAfter
          );
        }
      }, 100);
    });

    // Debug tile loading
    tileLayer.on('load', () => {
      console.log('[LocationsList] Tiles loaded successfully');
    });

    tileLayer.on('tileerror', (error) => {
      console.error('[LocationsList] Tile loading error:', error);
    });
  }

  private setupLocateControl(): void {
    if (!this.map) return;

    if (this.locateControl) {
      this.locateControl.stop();
      this.locateControl = null;
    }

    if (this.mapLocationFoundHandler) {
      this.map.off('locationfound', this.mapLocationFoundHandler);
      this.mapLocationFoundHandler = undefined;
    }

    if (this.mapLocationErrorHandler) {
      this.map.off('locationerror', this.mapLocationErrorHandler);
      this.mapLocationErrorHandler = undefined;
    }

    const controlFactory = L.control as LeafletControlWithLocate;
    const locate = controlFactory.locate;

    if (!locate) {
      console.warn('[LocationsList] Locate control plugin not available');
      return;
    }
    try {
      this.locateControl = locate({
        position: 'topleft',
        flyTo: true,
        showCompass: true,
        drawCircle: false,
        drawMarker: false,
        strings: {
          title: 'Trouver ma position',
          popup: 'Vous êtes ici (±{distance} {unit})',
          outsideMapBoundsMsg: 'Vous êtes hors des limites de la carte',
        },
        locateOptions: {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        },
      }).addTo(this.map);

      this.mapLocationFoundHandler = (event: L.LocationEvent) => {
        this.handleLocateSuccess(event);
      };

      this.mapLocationErrorHandler = (event: L.ErrorEvent) => {
        this.handleLocateError(event);
      };

      this.map.on('locationfound', this.mapLocationFoundHandler);
      this.map.on('locationerror', this.mapLocationErrorHandler);

      const container = this.locateControl.getContainer();
      if (container) {
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);
      }

      this.triggerInitialLocate();
    } catch (error) {
      console.error('[LocationsList] Failed to setup locate control:', error);
      this.locateControl = null;
      if (this.mapLocationFoundHandler) {
        this.map.off('locationfound', this.mapLocationFoundHandler);
        this.mapLocationFoundHandler = undefined;
      }
      if (this.mapLocationErrorHandler) {
        this.map.off('locationerror', this.mapLocationErrorHandler);
        this.mapLocationErrorHandler = undefined;
      }
    }
  }

  private triggerInitialLocate(): void {
    if (this.initialLocateRequested) {
      return;
    }

    this.initialLocateRequested = true;
    this.skipNextNearestAdjust = true;

    if (this.locateControl) {
      try {
        this.locateControl.start();
        return;
      } catch (error) {
        console.warn(
          '[LocationsList] Locate control start failed, falling back to map.locate()',
          error
        );
      }
    }

    if (!this.map) {
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      console.warn('[LocationsList] Geolocation API not available');
      return;
    }

    this.map.locate({
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
      setView: false,
    });
  }

  private handleLocateSuccess(event: L.LocationEvent): void {
    this.geolocationError = null;
    this.userPosition = {
      lat: event.latlng.lat,
      lon: event.latlng.lng,
    };

    const animateUserMarker = !this.skipNextNearestAdjust;
    this.addUserMarker({ animate: animateUserMarker });
    const adjustMap = !this.skipNextNearestAdjust;
    this.skipNextNearestAdjust = false;
    this.findNearestLocation({ adjustMap });
    this.persistUserPosition(this.userPosition);
    this.restoredUserPosition = true;
  }

  private handleLocateError(event: L.ErrorEvent): void {
    console.error('[LocationsList] Locate failed:', event.message);
    this.geolocationError = event.message;
    this.skipNextNearestAdjust = false;
  }

  private persistUserPosition(position: { lat: number; lon: number }): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    const payload: StoredUserPosition = {
      lat: position.lat,
      lon: position.lon,
      timestamp: Date.now(),
    };

    try {
      window.localStorage.setItem(
        this.userLocationStorageKey,
        JSON.stringify(payload)
      );
    } catch (error) {
      console.warn('[LocationsList] Failed to persist user position', error);
    }
  }

  private readStoredUserPosition(): StoredUserPosition | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    const raw = window.localStorage.getItem(this.userLocationStorageKey);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<StoredUserPosition>;
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        typeof parsed.lat !== 'number' ||
        typeof parsed.lon !== 'number'
      ) {
        return null;
      }

      return {
        lat: parsed.lat,
        lon: parsed.lon,
        timestamp:
          typeof parsed.timestamp === 'number' ? parsed.timestamp : Date.now(),
      };
    } catch (error) {
      console.warn('[LocationsList] Failed to read stored position', error);
      return null;
    }
  }

  private maybeRestoreUserPosition(): void {
    if (this.restoredUserPosition) {
      return;
    }

    if (!this.map) {
      return;
    }

    if (this.preloadedUserPositionFromStorage && this.userPosition) {
      this.restoredUserPosition = true;
      this.preloadedUserPositionFromStorage = false;
      this.addUserMarker({ animate: false });
      this.findNearestLocation({ adjustMap: false });
      return;
    }

    const stored = this.readStoredUserPosition();
    if (!stored) {
      return;
    }

    this.userPosition = { lat: stored.lat, lon: stored.lon };
    this.restoredUserPosition = true;
    this.addUserMarker({ animate: false });
    this.findNearestLocation({ adjustMap: false });
  }

  private addMarkers(): void {
    console.log('[LocationsList] addMarkers() called, map exists:', !!this.map);

    if (!this.map) return;

    // Clear existing markers
    console.log(
      '[LocationsList] Clearing',
      this.markers.length,
      'existing markers'
    );
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
    this.markersByLocationId.clear();

    console.log(
      '[LocationsList] Processing',
      this.locations.length,
      'locations'
    );

    this.locations.forEach((location) => {
      // Skip online locations
      if (
        location.type === 'PRIVATE' &&
        location.lat === 0 &&
        location.lon === 0
      ) {
        console.log('[LocationsList] Skipping online location:', location.name);
        return;
      }

      console.log(
        '[LocationsList] Adding marker for:',
        location.name,
        'at',
        location.lat,
        location.lon
      );

      // Create custom icon based on location type
      const icon = this.getLocationIcon(location.type);

      if (this.map) {
        const marker = L.marker([location.lat, location.lon], { icon })
          .addTo(this.map)
          .bindPopup(this.createPopupContent(location));

        // Add click handler to marker
        marker.on('click', () => {
          this.onMarkerClick(location.id);
        });

        this.markers.push(marker);
        this.markersByLocationId.set(location.id, marker);
        console.log('[LocationsList] Marker added successfully');
      }
    });

    console.log('[LocationsList] Total markers added:', this.markers.length);
  }

  private getLocationIcon(type: string): L.Icon {
    const iconUrl = this.getIconUrl(type);

    return L.icon({
      iconUrl,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  }

  private getIconUrl(type: string): string {
    // Using colored markers from leaflet CDN
    const colors: Record<string, string> = {
      GAME_STORE: 'red',
      CAFE: 'orange',
      BAR: 'green',
      COMMUNITY_CENTER: 'blue',
      PRIVATE: 'gray',
      OTHER: 'gray',
    };

    const color = colors[type] || 'gray';
    return `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`;
  }

  private renderMaterialIcon(name: string, extraClass = ''): string {
    const classes = ['material-icons'];
    if (extraClass) {
      classes.push(extraClass);
    }
    return `<span class="${classes.join(
      ' '
    )}" aria-hidden="true">${name}</span>`;
  }

  private createPopupContent(location: Location): string {
    // Amenities with icons
    const amenitiesHtml =
      location.amenities.length > 0
        ? `
        <div class="popup-amenities">
          ${location.amenities
            .map((amenity) => this.getAmenityIcon(amenity))
            .join('')}
        </div>
      `
        : '';

    const capacityHtml = location.capacity
      ? `
        <div class="popup-row">
          ${this.renderMaterialIcon('groups', 'popup-icon')}
          <span>Capacité: ${location.capacity} personnes</span>
        </div>
      `
      : '';

    const websiteHtml = location.website
      ? `
        <a href="${
          location.website
        }" target="_blank" rel="noopener" class="popup-link">
          ${this.renderMaterialIcon('public', 'popup-icon')}
          <span>Site web</span>
        </a>
      `
      : '';

    const hoursHtml = location.openingHours
      ? this.formatOpeningHours(location.openingHours)
      : '';

    const addressHtml = location.address
      ? `
        <div class="popup-row">
          ${this.renderMaterialIcon('place', 'popup-icon')}
          <span>${location.address}, ${location.city}</span>
        </div>
      `
      : '';

    return `
      <div class="location-popup">
        <div class="popup-header">
          <h3>${location.name}</h3>
          <span class="popup-badge">${this.getLocationTypeLabel(
            location.type
          )}</span>
        </div>

        <div class="popup-rating">
          ${this.renderMaterialIcon('star', 'popup-rating__icon')}
          <span>${location.rating.toFixed(1)}/5</span>
        </div>

        ${addressHtml}
        ${capacityHtml}
        ${amenitiesHtml}
        ${hoursHtml}
        ${websiteHtml}
      </div>
    `;
  }

  private getAmenityIcon(amenity: string): string {
    const iconMap: Record<string, { icon: string; label: string }> = {
      WiFi: { icon: 'wifi', label: 'WiFi' },
      Tables: { icon: 'table_restaurant', label: 'Tables' },
      Food: { icon: 'restaurant', label: 'Restauration' },
      Drinks: { icon: 'local_cafe', label: 'Boissons' },
      Parking: { icon: 'local_parking', label: 'Parking' },
    };

    const match = iconMap[amenity];
    if (!match) {
      return `<div class="amenity-icon"><span>${amenity}</span></div>`;
    }

    return `
      <div class="amenity-icon" title="${match.label}">
        ${this.renderMaterialIcon(match.icon, 'amenity-icon__glyph')}
        <span>${match.label}</span>
      </div>
    `;
  }

  getAmenityIconName(amenity: string): string {
    const normalized = amenity.toLowerCase();
    const iconMatchers: Array<{ keywords: string[]; icon: string }> = [
      { keywords: ['wifi'], icon: 'wifi' },
      { keywords: ['table'], icon: 'table_restaurant' },
      { keywords: ['food', 'resto', 'restaurant'], icon: 'restaurant' },
      { keywords: ['drink', 'bar', 'café', 'coffee'], icon: 'local_cafe' },
      { keywords: ['parking'], icon: 'local_parking' },
      { keywords: ['board', 'game'], icon: 'casino' },
      { keywords: ['library'], icon: 'local_library' },
      { keywords: ['shop', 'store'], icon: 'storefront' },
      { keywords: ['tournament'], icon: 'emoji_events' },
    ];

    for (const matcher of iconMatchers) {
      if (matcher.keywords.some((keyword) => normalized.includes(keyword))) {
        return matcher.icon;
      }
    }

    return 'check_circle';
  }

  private formatOpeningHours(hours: Record<string, string>): string {
    const daysOrder = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    const daysLabels: Record<string, string> = {
      monday: 'Lun',
      tuesday: 'Mar',
      wednesday: 'Mer',
      thursday: 'Jeu',
      friday: 'Ven',
      saturday: 'Sam',
      sunday: 'Dim',
    };

    const hoursHtml = daysOrder
      .map((day) => {
        const label = daysLabels[day];
        const time = hours[day] || 'Fermé';
        return `<div><strong>${label}:</strong> ${time}</div>`;
      })
      .join('');

    return `<div class="opening-hours"><strong>Horaires:</strong>${hoursHtml}</div>`;
  }

  getLocationTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      GAME_STORE: 'Boutique de jeux',
      CAFE: 'Café',
      BAR: 'Bar',
      COMMUNITY_CENTER: 'Centre communautaire',
      PRIVATE: 'Privé',
      OTHER: 'Autre',
    };
    return labels[type] || type;
  }

  retry(): void {
    this.loadLocations();
  }

  get locationsState(): AsyncStateStatus {
    if (this.loading) {
      return 'loading';
    }

    if (this.error) {
      return 'error';
    }

    return 'ready';
  }

  /**
   * Apply all filters to the locations list and update markers
   */
  applyFilters(): void {
    console.log('[LocationsList] Applying filters...', {
      searchTerm: this.searchTerm,
      selectedType: this.selectedType,
      filters: this.filters,
    });

    this.filteredLocations = this.locations.filter((location) => {
      // Search filter (name, address, city)
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        const matchesSearch =
          location.name.toLowerCase().includes(term) ||
          (location.address && location.address.toLowerCase().includes(term)) ||
          location.city.toLowerCase().includes(term);

        if (!matchesSearch) return false;
      }

      // Type filter
      if (this.selectedType && location.type !== this.selectedType) {
        return false;
      }

      // Amenities filters
      const selectedAmenities = Object.entries(this.filters)
        .filter(([, checked]) => checked)
        .map(([amenity]) => this.getAmenityName(amenity));

      if (selectedAmenities.length > 0) {
        const hasAllAmenities = selectedAmenities.every((amenity) =>
          location.amenities.some((a) =>
            a.toLowerCase().includes(amenity.toLowerCase())
          )
        );
        if (!hasAllAmenities) return false;
      }

      return true;
    });

    console.log(
      '[LocationsList] Filtered locations:',
      this.filteredLocations.length,
      '/',
      this.locations.length
    );

    if (
      this.selectedLocationId &&
      !this.filteredLocations.some(
        (location) => location.id === this.selectedLocationId
      )
    ) {
      this.selectedLocationId = null;
    }

    // Update markers on map
    this.updateMarkers();
  }

  /**
   * Reset all filters to default values
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.filters = {
      wifi: false,
      tables: false,
      food: false,
      drinks: false,
      parking: false,
    };
    this.applyFilters();
  }

  toggleAmenity(filterKey: AmenityFilterKey): void {
    this.filters[filterKey] = !this.filters[filterKey];
    this.applyFilters();
  }

  toggleDetailsCollapse(): void {
    this.isDetailsCollapsed = !this.isDetailsCollapsed;
  }

  get selectedLocation(): Location | null {
    if (!this.selectedLocationId) {
      return null;
    }

    return (
      this.filteredLocations.find(
        (location) => location.id === this.selectedLocationId
      ) || null
    );
  }

  /**
   * Get the count of active filters
   */
  getActiveFiltersCount(): number {
    let count = 0;

    if (this.searchTerm) count++;
    if (this.selectedType) count++;

    // Count active amenity filters
    count += Object.values(this.filters).filter((checked) => checked).length;

    return count;
  }

  /**
   * Map filter key to amenity name (as stored in database)
   */
  getAmenityName(filterKey: string): string {
    const amenityMap: Record<string, string> = {
      wifi: 'WiFi',
      tables: 'Gaming Tables',
      food: 'Food',
      drinks: 'Drinks',
      parking: 'Parking',
    };
    return amenityMap[filterKey] || filterKey;
  }

  /**
   * Update markers on the map based on filtered locations
   */
  private updateMarkers(): void {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
    this.markersByLocationId.clear();

    // Add markers only for filtered locations
    this.filteredLocations.forEach((location) => {
      // Skip online locations
      if (
        location.type === 'PRIVATE' &&
        location.lat === 0 &&
        location.lon === 0
      ) {
        return;
      }

      const icon = this.getLocationIcon(location.type);

      if (this.map) {
        const marker = L.marker([location.lat, location.lon], { icon })
          .addTo(this.map)
          .bindPopup(this.createPopupContent(location));

        // Add click handler to marker
        marker.on('click', () => {
          this.onMarkerClick(location.id);
        });

        this.markers.push(marker);
        this.markersByLocationId.set(location.id, marker);
      }
    });

    console.log('[LocationsList] Markers updated:', this.markers.length);
  }

  /**
   * Handle click on location card - zoom to marker and open popup
   */
  onLocationClick(locationId: string): void {
    const location = this.locations.find((l) => l.id === locationId);
    if (!location || !this.map) return;

    // Skip online locations
    if (
      location.type === 'PRIVATE' &&
      location.lat === 0 &&
      location.lon === 0
    ) {
      return;
    }

    this.selectedLocationId = locationId;

    // Get the marker for this location
    const marker = this.markersByLocationId.get(locationId);
    if (marker) {
      // Zoom to marker location
      this.map.setView([location.lat, location.lon], 15, {
        animate: true,
        duration: 0.5,
      });

      // Open popup after a short delay to allow zoom animation
      setTimeout(() => {
        marker.openPopup();
      }, 500);
    }
  }

  /**
   * Handle click on marker - scroll to and highlight location card
   */
  onMarkerClick(locationId: string): void {
    this.selectedLocationId = locationId;

    // Allow the template to render the selected card before attempting to scroll
    setTimeout(() => {
      const element = document.getElementById(`location-${locationId}`);
      if (!element) {
        return;
      }

      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      element.classList.add('highlight');
      setTimeout(() => {
        element.classList.remove('highlight');
      }, 2000);
    });
  }

  /**
   * Add a marker for user's position
   */
  private addUserMarker(options: { animate?: boolean } = {}): void {
    if (!this.userPosition || !this.map) return;

    const { animate = true } = options;
    const targetZoom = animate ? 13 : this.map.getZoom();

    // Remove existing user marker if any
    if (this.userMarker) {
      this.userMarker.remove();
    }

    // Create custom icon for user position
    const userIcon = L.icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Add user marker
    this.userMarker = L.marker([this.userPosition.lat, this.userPosition.lon], {
      icon: userIcon,
    })
      .addTo(this.map)
      .bindPopup('<strong>📍 Votre position</strong>')
      .openPopup();

    // Center map on user position
    this.map.setView(
      [this.userPosition.lat, this.userPosition.lon],
      targetZoom,
      {
        animate,
        duration: animate ? 1 : 0,
        noMoveStart: !animate,
      }
    );
  }

  /**
   * Find and zoom to nearest location
   */
  private findNearestLocation(options: { adjustMap?: boolean } = {}): void {
    const { adjustMap = true } = options;

    if (!this.userPosition || !this.map || this.filteredLocations.length === 0)
      return;

    const userLat = this.userPosition.lat;
    const userLon = this.userPosition.lon;

    // Calculate distances to all filtered locations
    const locationsWithDistance = this.filteredLocations
      .filter(
        (loc) => !(loc.type === 'PRIVATE' && loc.lat === 0 && loc.lon === 0)
      )
      .map((location) => ({
        location,
        distance: this.calculateDistance(
          userLat,
          userLon,
          location.lat,
          location.lon
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

    if (locationsWithDistance.length === 0) return;

    const nearest = locationsWithDistance[0];

    if (adjustMap) {
      // Create bounds to include both user position and nearest location
      const bounds = L.latLngBounds([
        [userLat, userLon],
        [nearest.location.lat, nearest.location.lon],
      ]);

      // Fit map to show both markers with padding
      this.map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
        animate: true,
        duration: 1,
      });
    }

    // Highlight nearest location in list
    setTimeout(() => {
      this.onMarkerClick(nearest.location.id);
    }, 1000);
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * Returns distance in kilometers
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
