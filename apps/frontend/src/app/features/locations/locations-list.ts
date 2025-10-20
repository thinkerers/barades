import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  PendingTasks,
  afterNextRender,
  inject,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import {
  AsyncStateComponent,
  AsyncStateStatus,
  SearchInputComponent,
} from '@org/ui';
import * as L from 'leaflet';
import 'leaflet.locatecontrol';
import { EmptyError, Subject, firstValueFrom, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  Location,
  LocationsService,
} from '../../core/services/locations.service';

type AmenityFilterKey = 'wifi' | 'tables' | 'food' | 'drinks' | 'parking';

interface AmenityConfig {
  key: AmenityFilterKey;
  label: string;
  icon: string;
  amenityName: string;
}

type AmenityFilterState = Record<AmenityFilterKey, boolean>;

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
  setView?: boolean | 'once' | 'always' | 'untilPan' | 'untilPanOrZoom';
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
    MatSelectModule,
    AsyncStateComponent,
    SearchInputComponent,
  ],
  templateUrl: './locations-list.html',
  styleUrl: './locations-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationsListComponent implements OnInit, OnDestroy {
  private static readonly LOCATION_TYPE_LABELS: Record<string, string> = {
    GAME_STORE: 'Boutique de jeux',
    CAFE: 'Café',
    BAR: 'Bar',
    COMMUNITY_CENTER: 'Centre communautaire',
    PRIVATE: 'Privé',
    OTHER: 'Autre',
  };

  private static readonly FILTERABLE_LOCATION_TYPES = [
    'GAME_STORE',
    'CAFE',
    'BAR',
    'COMMUNITY_CENTER',
    'OTHER',
  ] as const;

  private static readonly AMENITY_CONFIG = [
    {
      key: 'wifi',
      label: 'WiFi',
      icon: 'wifi',
      amenityName: 'WiFi',
    },
    {
      key: 'tables',
      label: 'Tables de jeu',
      icon: 'table_restaurant',
      amenityName: 'Gaming Tables',
    },
    {
      key: 'food',
      label: 'Nourriture',
      icon: 'restaurant',
      amenityName: 'Food',
    },
    {
      key: 'drinks',
      label: 'Boissons',
      icon: 'local_cafe',
      amenityName: 'Drinks',
    },
    {
      key: 'parking',
      label: 'Parking',
      icon: 'local_parking',
      amenityName: 'Parking',
    },
  ] as const satisfies ReadonlyArray<AmenityConfig>;

  private static readonly AMENITY_NAME_LOOKUP =
    LocationsListComponent.AMENITY_CONFIG.reduce(
      (lookup, { key, amenityName }) => {
        lookup[key] = amenityName;
        return lookup;
      },
      {} as Record<AmenityFilterKey, string>
    );

  private static createAmenityFilterState(): AmenityFilterState {
    return LocationsListComponent.AMENITY_CONFIG.reduce((state, { key }) => {
      state[key] = false;
      return state;
    }, {} as AmenityFilterState);
  }

  private locationsService = inject(LocationsService);
  private readonly injector = inject(Injector);
  private readonly pendingTasks = inject(PendingTasks);

  readonly locationTypeOptions: ReadonlyArray<{
    value: string;
    label: string;
  }> = [
    { value: '', label: 'Tous les types' },
    ...LocationsListComponent.FILTERABLE_LOCATION_TYPES.map((value) => ({
      value,
      label: LocationsListComponent.LOCATION_TYPE_LABELS[value],
    })),
  ];

  readonly amenityFilters: ReadonlyArray<AmenityConfig> =
    LocationsListComponent.AMENITY_CONFIG;

  private readonly locationsSignal = signal<Location[]>([]);
  private readonly filteredLocationsSignal = signal<Location[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly refreshingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly searchTermSignal = signal('');
  private readonly selectedTypeSignal = signal('');
  private readonly filtersSignal = signal<AmenityFilterState>(
    LocationsListComponent.createAmenityFilterState()
  );
  private readonly geolocationErrorSignal = signal<string | null>(null);
  private readonly isDetailsCollapsedSignal = signal(false);
  private readonly selectedLocationIdSignal = signal<string | null>(null);
  private readonly pendingDelayCancelers = new Set<() => void>();

  readonly loadingMessage = 'Chargement des lieux...';
  readonly defaultErrorMessage =
    'Impossible de charger les lieux. Veuillez réessayer.';

  private scheduleAfterNextRender(
    callback: () => void,
    options?: { waitForRender?: boolean }
  ): void {
    const waitForRender = options?.waitForRender ?? false;
    let executed = false;
    const runOnce = () => {
      if (executed) {
        return;
      }
      executed = true;
      callback();
    };

    runInInjectionContext(this.injector, () =>
      afterNextRender(() => runInInjectionContext(this.injector, runOnce))
    );

    const scheduleFallback = () => {
      if (!executed) {
        this.scheduleAfterDelay(runOnce, waitForRender ? 16 : 0);
      }
    };

    if (typeof queueMicrotask === 'function') {
      queueMicrotask(() =>
        runInInjectionContext(this.injector, scheduleFallback)
      );
    } else {
      void Promise.resolve().then(() =>
        runInInjectionContext(this.injector, scheduleFallback)
      );
    }

    this.scheduleAfterDelay(runOnce, waitForRender ? 50 : 0);
  }

  private scheduleAfterDelay(callback: () => void, delayMs: number): void {
    const delay = Math.max(0, delayMs);
    const cancel$ = new Subject<void>();
    let cancelled = false;
    let settled = false;

    const cancel = () => {
      if (cancelled) {
        return;
      }

      cancelled = true;
      cancel$.next();
      if (!cancel$.closed) {
        cancel$.complete();
      }
      this.pendingDelayCancelers.delete(cancel);
    };

    this.pendingDelayCancelers.add(cancel);

    const finalize = () => {
      if (settled) {
        return;
      }

      settled = true;
      if (!cancel$.closed) {
        cancel$.complete();
      }
      this.pendingDelayCancelers.delete(cancel);
    };

    void this.pendingTasks.run(async () => {
      try {
        try {
          await firstValueFrom(timer(delay).pipe(takeUntil(cancel$)));
        } catch (error) {
          if (error instanceof EmptyError) {
            return;
          }
          throw error;
        }

        if (!cancelled) {
          runInInjectionContext(this.injector, callback);
        }
      } finally {
        finalize();
      }
    });
  }

  private cancelScheduledDelays(): void {
    this.pendingDelayCancelers.forEach((cancel) => cancel());
    this.pendingDelayCancelers.clear();
  }

  get locations(): Location[] {
    return this.locationsSignal();
  }

  set locations(value: Location[]) {
    this.locationsSignal.set(value);
  }

  get filteredLocations(): Location[] {
    return this.filteredLocationsSignal();
  }

  set filteredLocations(value: Location[]) {
    this.filteredLocationsSignal.set(value);
  }

  get loading(): boolean {
    return this.loadingSignal();
  }

  get refreshing(): boolean {
    return this.refreshingSignal();
  }

  get error(): string | null {
    return this.errorSignal();
  }

  get searchTerm(): string {
    return this.searchTermSignal();
  }

  set searchTerm(value: string) {
    this.searchTermSignal.set(value);
  }

  get selectedType(): string {
    return this.selectedTypeSignal();
  }

  set selectedType(value: string) {
    this.selectedTypeSignal.set(value);
  }

  get filters(): AmenityFilterState {
    return this.filtersSignal();
  }

  get geolocationError(): string | null {
    return this.geolocationErrorSignal();
  }

  get isDetailsCollapsed(): boolean {
    return this.isDetailsCollapsedSignal();
  }

  set isDetailsCollapsed(value: boolean) {
    this.isDetailsCollapsedSignal.set(value);
  }

  get selectedLocationId(): string | null {
    return this.selectedLocationIdSignal();
  }

  set selectedLocationId(value: string | null) {
    this.selectedLocationIdSignal.set(value);
  }

  private map: L.Map | null = null;
  private mapInitialized = false;
  private markers: L.Marker[] = [];
  private markersByLocationId: Map<string, L.Marker> = new Map();
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

  onSearchTermChange(value: string): void {
    this.searchTerm = value;
    this.applyFilters();
  }

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
    this.scheduleAfterNextRender(
      () => {
        console.log('[LocationsList] Attempting to initialize map...');
        this.initMap();
      },
      { waitForRender: true }
    );

    void this.loadLocations();
  }

  ngOnDestroy(): void {
    this.cancelScheduledDelays();

    if (this.locateControl) {
      if (typeof this.locateControl.stop === 'function') {
        this.locateControl.stop();
      }
      this.locateControl = null;
    }

    const mapRef = this.map as Partial<L.Map> | null;

    if (this.mapLocationFoundHandler) {
      if (mapRef && typeof mapRef.off === 'function') {
        mapRef.off('locationfound', this.mapLocationFoundHandler);
      }
      this.mapLocationFoundHandler = undefined;
    }

    if (this.mapLocationErrorHandler) {
      if (mapRef && typeof mapRef.off === 'function') {
        mapRef.off('locationerror', this.mapLocationErrorHandler);
      }
      this.mapLocationErrorHandler = undefined;
    }

    this.userMarker?.remove();
    this.userMarker = null;

    if (this.map) {
      if (mapRef && typeof mapRef.off === 'function') {
        mapRef.off();
      }
      if (mapRef && typeof mapRef.remove === 'function') {
        mapRef.remove();
      }
      this.map = null;
    }

    this.mapInitialized = false;
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
    this.markersByLocationId.clear();
  }

  private async loadLocations(): Promise<void> {
    console.log('[LocationsList] Loading locations...');
    this.errorSignal.set(null);

    const cachedLocations = this.locationsService.getCachedLocationsSnapshot();
    const hasCachedData =
      Array.isArray(cachedLocations) && cachedLocations.length > 0;

    if (hasCachedData && cachedLocations) {
      const filtered = this.normalizeLocations(cachedLocations);
      this.locationsSignal.set(filtered);
      this.filteredLocationsSignal.set(filtered);
      this.scheduleMapRefresh();
    }

    this.loadingSignal.set(!hasCachedData);
    this.refreshingSignal.set(hasCachedData);

    await this.pendingTasks.run(async () => {
      try {
        const data = await firstValueFrom(this.locationsService.getLocations());
        console.log(
          '[LocationsList] Locations loaded:',
          data.length,
          'locations'
        );
        const filtered = this.normalizeLocations(data);
        this.locationsSignal.set(filtered);
        this.filteredLocationsSignal.set(filtered);
        this.scheduleMapRefresh();
      } catch (error) {
        console.error('[LocationsList] Error loading locations:', error);
        if (!hasCachedData) {
          this.errorSignal.set(this.defaultErrorMessage);
        }
      } finally {
        this.loadingSignal.set(false);
        this.refreshingSignal.set(false);
      }
    });
  }

  private normalizeLocations(data: Location[]): Location[] {
    return data.filter(
      (loc) => !(loc.type === 'PRIVATE' && loc.lat === 0 && loc.lon === 0)
    );
  }

  private scheduleMapRefresh(): void {
    this.scheduleAfterNextRender(
      () => {
        if (!this.map && !this.mapInitialized) {
          this.initMap();
        }

        if (this.map) {
          console.log('[LocationsList] Refreshing map size and markers');
          this.map.invalidateSize(true);
        }

        this.addMarkers();
        this.maybeRestoreUserPosition();
      },
      { waitForRender: true }
    );
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
    if (this.map || this.mapInitialized) {
      console.log(
        '[LocationsList] Map already exists or initialized, skipping reinit'
      );
      return;
    }

    // Set default icon path for Leaflet
    L.Icon.Default.imagePath = 'assets/leaflet/';

    console.log('[LocationsList] Creating Leaflet map...');
    this.mapInitialized = true;

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
      this.scheduleAfterDelay(() => {
        if (!this.map) {
          return;
        }

        console.log('[LocationsList] Calling invalidateSize()');
        const mapSize = this.map.getSize();
        console.log('[LocationsList] Map size before invalidate:', mapSize);
        this.map.invalidateSize(true);
        const mapSizeAfter = this.map.getSize();
        console.log('[LocationsList] Map size after invalidate:', mapSizeAfter);
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
        flyTo: false,
        keepCurrentZoomLevel: true,
        setView: false,
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

    if (typeof (this.map as Partial<L.Map>).locate === 'function') {
      (this.map as L.Map).locate({
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
        setView: false,
      });
    }
  }

  private handleLocateSuccess(event: L.LocationEvent): void {
    this.geolocationErrorSignal.set(null);
    this.userPosition = {
      lat: event.latlng.lat,
      lon: event.latlng.lng,
    };

    const hasLocations = this.filteredLocations.length > 0;
    const animateUserMarker = !this.skipNextNearestAdjust;
    const adjustMap = !this.skipNextNearestAdjust && hasLocations;
    const centerOnUser = !adjustMap;

    this.addUserMarker({
      animate: animateUserMarker,
      center: centerOnUser,
    });
    this.skipNextNearestAdjust = false;
    this.findNearestLocation({ adjustMap });
    this.persistUserPosition(this.userPosition);
    this.restoredUserPosition = true;

    if (this.locateControl && typeof this.locateControl.stop === 'function') {
      try {
        this.locateControl.stop();
      } catch (error) {
        console.warn('[LocationsList] Failed to stop locate control', error);
      }
    }
  }

  private handleLocateError(event: L.ErrorEvent): void {
    console.error('[LocationsList] Locate failed:', event.message);
    this.geolocationErrorSignal.set(event.message);
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
    return LocationsListComponent.LOCATION_TYPE_LABELS[type] || type;
  }

  retry(): void {
    void this.loadLocations();
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

    const searchTerm = this.searchTerm.trim().toLowerCase();
    const selectedType = this.selectedType;
    const filters = this.filters;

    const selectedAmenities = this.amenityFilters
      .filter(({ key }) => filters[key])
      .map(({ amenityName }) => amenityName);

    const filtered = this.locations.filter((location) => {
      if (searchTerm) {
        const matchesSearch =
          location.name.toLowerCase().includes(searchTerm) ||
          (location.address &&
            location.address.toLowerCase().includes(searchTerm)) ||
          location.city.toLowerCase().includes(searchTerm);

        if (!matchesSearch) {
          return false;
        }
      }

      if (selectedType && location.type !== selectedType) {
        return false;
      }

      if (selectedAmenities.length > 0) {
        const hasAllAmenities = selectedAmenities.every((amenity) =>
          location.amenities.some((item) =>
            item.toLowerCase().includes(amenity.toLowerCase())
          )
        );

        if (!hasAllAmenities) {
          return false;
        }
      }

      return true;
    });

    this.filteredLocationsSignal.set(filtered);

    if (
      this.selectedLocationId &&
      !filtered.some((location) => location.id === this.selectedLocationId)
    ) {
      this.selectedLocationId = null;
    }

    this.scheduleAfterNextRender(() => {
      this.updateMarkers();
    });
  }

  /**
   * Reset all filters to default values
   */
  resetFilters(): void {
    this.searchTermSignal.set('');
    this.selectedTypeSignal.set('');
    this.filtersSignal.set(LocationsListComponent.createAmenityFilterState());
    this.applyFilters();
  }

  toggleAmenity(filterKey: AmenityFilterKey): void {
    this.filtersSignal.update((filters) => ({
      ...filters,
      [filterKey]: !filters[filterKey],
    }));
    this.applyFilters();
  }

  toggleDetailsCollapse(): void {
    this.isDetailsCollapsedSignal.update((current) => !current);
    this.scheduleAfterNextRender(
      () => {
        this.map?.invalidateSize(true);
      },
      { waitForRender: true }
    );
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
    return (
      LocationsListComponent.AMENITY_NAME_LOOKUP[
        filterKey as AmenityFilterKey
      ] || filterKey
    );
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
      const mapRef = this.map;
      if (mapRef) {
        const openPopup = () => marker.openPopup();

        const mapWithOnce = mapRef as Partial<Pick<L.Map, 'once' | 'on'>>;
        if (typeof mapWithOnce.once === 'function') {
          mapWithOnce.once('moveend', openPopup);
        } else if (typeof mapRef.on === 'function') {
          mapRef.on('moveend', openPopup);
        }
        mapRef.setView([location.lat, location.lon], 15, {
          animate: true,
          duration: 0.5,
        });

        this.scheduleAfterDelay(() => {
          const markerWithPopup = marker as Partial<L.Marker>;
          const isOpen =
            typeof markerWithPopup.isPopupOpen === 'function'
              ? markerWithPopup.isPopupOpen()
              : false;
          if (!isOpen) {
            openPopup();
          }
        }, 300);
      }
    }
  }

  /**
   * Handle click on marker - scroll to and highlight location card
   */
  onMarkerClick(locationId: string): void {
    this.selectedLocationId = locationId;

    this.scheduleAfterNextRender(() => {
      const element = document.getElementById(`location-${locationId}`);
      if (!element) {
        return;
      }

      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      element.classList.add('highlight');
      this.scheduleAfterDelay(() => {
        let isElementStillConnected = true;
        const body = typeof document !== 'undefined' ? document.body : null;
        if (
          body &&
          typeof body.contains === 'function' &&
          typeof (element as { nodeType?: number }).nodeType === 'number'
        ) {
          try {
            isElementStillConnected = body.contains(element as unknown as Node);
          } catch (error) {
            console.warn(
              '[LocationsList] Failed to check element containment',
              error
            );
            isElementStillConnected = true;
          }
        }

        if (isElementStillConnected) {
          element.classList.remove('highlight');
        }
      }, 2000);
    });
  }

  /**
   * Add a marker for user's position
   */
  private addUserMarker(
    options: { animate?: boolean; center?: boolean } = {}
  ): void {
    if (!this.userPosition || !this.map) return;

    const { animate = true, center = true } = options;
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

    if (center) {
      // Center map on user position when requested
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

    const highlightNearest = () => this.onMarkerClick(nearest.location.id);

    if (adjustMap && this.map) {
      // Create bounds to include both user position and nearest location
      const bounds = L.latLngBounds([
        [userLat, userLon],
        [nearest.location.lat, nearest.location.lon],
      ]);

      const mapRef = this.map;
      let handled = false;

      const handleMoveEnd = () => {
        handled = true;
        highlightNearest();
      };

      mapRef.once('moveend', handleMoveEnd);

      mapRef.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
        animate: true,
        duration: 1,
      });

      this.scheduleAfterDelay(() => {
        if (!handled) {
          highlightNearest();
        }
      }, 1000);
    } else {
      this.scheduleAfterNextRender(highlightNearest);
    }
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
