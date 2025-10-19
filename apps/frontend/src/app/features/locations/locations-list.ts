import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AsyncStateComponent, AsyncStateStatus } from '@org/ui';
import * as L from 'leaflet';
import {
  Location,
  LocationsService,
} from '../../core/services/locations.service';

@Component({
  selector: 'app-locations-list',
  standalone: true,
  imports: [FormsModule, MatIconModule, AsyncStateComponent],
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
  filters = {
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
  geolocating = false;
  geolocationError: string | null = null;

  ngOnInit(): void {
    console.log('[LocationsList] Component initialized');
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
      this.map.remove();
      this.map = null;
    }

    // Set default icon path for Leaflet
    L.Icon.Default.imagePath = 'assets/leaflet/';

    console.log('[LocationsList] Creating Leaflet map...');

    // Center on Brussels - create map with specific options
    this.map = L.map('map', {
      center: [50.8503, 4.3517],
      zoom: 13,
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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>${location.capacity} personnes</span>
        </div>
      `
      : '';

    const websiteHtml = location.website
      ? `
        <a href="${location.website}" target="_blank" rel="noopener" class="popup-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
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
    const iconMap: Record<string, string> = {
      WiFi: `
        <div class="amenity-icon" title="WiFi">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
            <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
            <line x1="12" y1="20" x2="12.01" y2="20"></line>
          </svg>
          <span>WiFi</span>
        </div>
      `,
      Tables: `
        <div class="amenity-icon" title="Tables de jeu">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 2h20v20H2z"></path>
            <path d="M6 6h12v12H6z"></path>
          </svg>
          <span>Tables</span>
        </div>
      `,
      Food: `
        <div class="amenity-icon" title="Restauration">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line x1="6" y1="1" x2="6" y2="4"></line>
            <line x1="10" y1="1" x2="10" y2="4"></line>
            <line x1="14" y1="1" x2="14" y2="4"></line>
          </svg>
          <span>Food</span>
        </div>
      `,
      Drinks: `
        <div class="amenity-icon" title="Boissons">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 2H6v20h12V2z"></path>
            <path d="M6 7h12"></path>
          </svg>
          <span>Drinks</span>
        </div>
      `,
      Parking: `
        <div class="amenity-icon" title="Parking">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
            <path d="M9 17V7h4a3 3 0 0 1 0 6H9"></path>
          </svg>
          <span>Parking</span>
        </div>
      `,
    };

    return (
      iconMap[amenity] ||
      `<div class="amenity-icon"><span>${amenity}</span></div>`
    );
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

    // Scroll to the location card
    const element = document.getElementById(`location-${locationId}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Add temporary highlight animation
      element.classList.add('highlight');
      setTimeout(() => {
        element.classList.remove('highlight');
      }, 2000);
    }
  }

  /**
   * Get user's current position using geolocation API
   */
  getUserLocation(): void {
    if (!navigator.geolocation) {
      this.geolocationError =
        "La géolocalisation n'est pas supportée par votre navigateur";
      return;
    }

    this.geolocating = true;
    this.geolocationError = null;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userPosition = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        this.addUserMarker();
        this.findNearestLocation();
        this.geolocating = false;
      },
      (error) => {
        this.geolocating = false;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.geolocationError = 'Permission de géolocalisation refusée';
            break;
          case error.POSITION_UNAVAILABLE:
            this.geolocationError = 'Position non disponible';
            break;
          case error.TIMEOUT:
            this.geolocationError = 'Délai de géolocalisation dépassé';
            break;
          default:
            this.geolocationError = 'Erreur de géolocalisation inconnue';
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  /**
   * Add a marker for user's position
   */
  private addUserMarker(): void {
    if (!this.userPosition || !this.map) return;

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
    this.map.setView([this.userPosition.lat, this.userPosition.lon], 13, {
      animate: true,
      duration: 1,
    });
  }

  /**
   * Find and zoom to nearest location
   */
  private findNearestLocation(): void {
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
