import { provideHttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { LocationsService } from '../../core/services/locations.service';
import { LocationsListComponent } from './locations-list';

describe('LocationsListComponent', () => {
  let component: LocationsListComponent;
  let fixture: ComponentFixture<LocationsListComponent>;
  let locationsService: LocationsService;

  const mockLocations = [
    {
      id: '1',
      name: 'Brussels Game Store',
      address: 'Rue de la Montagne 52',
      city: 'Brussels',
      type: 'GAME_STORE' as const,
      rating: 4.5,
      amenities: ['WiFi', 'Gaming Tables', 'Food', 'Drinks', 'Parking'],
      capacity: 30,
      openingHours: { monday: '10:00-22:00', tuesday: '10:00-22:00' },
      icon: 'store',
      lat: 50.8476,
      lon: 4.3572,
      website: 'https://example.com',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'Café Joystick',
      address: 'Avenue Louise 123',
      city: 'Brussels',
      type: 'CAFE' as const,
      rating: 4.2,
      amenities: ['WiFi', 'Food', 'Drinks', 'Board Games Library'],
      capacity: 20,
      openingHours: { monday: '09:00-20:00', tuesday: '09:00-20:00' },
      icon: 'cafe',
      lat: 50.8366,
      lon: 4.3589,
      website: 'https://example.com',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: '3',
      name: 'Le Dé à Coudre',
      address: 'Rue des Bouchers 8',
      city: 'Brussels',
      type: 'BAR' as const,
      rating: 4.8,
      amenities: ['WiFi', 'Drinks', 'Gaming Tables'],
      capacity: 40,
      openingHours: { monday: '14:00-02:00', tuesday: '14:00-02:00' },
      icon: 'bar',
      lat: 50.8503,
      lon: 4.3517,
      website: 'https://example.com',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: '4',
      name: 'Online (Discord/Roll20)',
      address: '',
      city: '',
      type: 'PRIVATE' as const,
      rating: 0,
      amenities: [],
      capacity: 0,
      openingHours: { monday: '', tuesday: '' },
      icon: 'online',
      lat: 0,
      lon: 0,
      website: '',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationsListComponent, HttpClientTestingModule],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationsListComponent);
    component = fixture.componentInstance;
    locationsService = TestBed.inject(LocationsService);

    // Mock the initMap method to prevent Leaflet initialization
    jest
      .spyOn<LocationsListComponent, never>(component, 'initMap' as never)
      .mockImplementation();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load locations on init', () => {
    jest
      .spyOn(locationsService, 'getLocations')
      .mockReturnValue(of(mockLocations));

    fixture.detectChanges();

    // Should exclude online location (PRIVATE with lat=0, lon=0)
    expect(component.locations.length).toBe(3);
    expect(
      component.locations.every(
        (loc) => !(loc.type === 'PRIVATE' && loc.lat === 0 && loc.lon === 0)
      )
    ).toBe(true);
    expect(component.loading).toBe(false);
  });

  it('should handle error when loading locations fails', () => {
    jest
      .spyOn(locationsService, 'getLocations')
      .mockReturnValue(throwError(() => new Error('Failed to load')));

    fixture.detectChanges();

    expect(component.error).toBeTruthy();
    expect(component.loading).toBe(false);
  });

  it('should get correct location type label', () => {
    expect(component.getLocationTypeLabel('GAME_STORE')).toBe(
      'Boutique de jeux'
    );
    expect(component.getLocationTypeLabel('CAFE')).toBe('Café');
    expect(component.getLocationTypeLabel('BAR')).toBe('Bar');
  });

  describe('Filtering', () => {
    beforeEach(() => {
      // Filter out online location (same logic as component)
      const validLocations = mockLocations.filter(
        (loc) => !(loc.type === 'PRIVATE' && loc.lat === 0 && loc.lon === 0)
      );
      component.locations = [...validLocations];
      component.filteredLocations = [...validLocations];
    });

    describe('Search filtering', () => {
      it('should filter locations by name', () => {
        component.searchTerm = 'Joystick';
        component.applyFilters();

        expect(component.filteredLocations.length).toBe(1);
        expect(component.filteredLocations[0].name).toBe('Café Joystick');
      });

      it('should filter locations by address', () => {
        component.searchTerm = 'Bouchers';
        component.applyFilters();

        expect(component.filteredLocations.length).toBe(1);
        expect(component.filteredLocations[0].address).toBe(
          'Rue des Bouchers 8'
        );
      });

      it('should filter locations by city', () => {
        component.searchTerm = 'Brussels';
        component.applyFilters();

        expect(component.filteredLocations.length).toBe(3); // Exclut la location en ligne
      });

      it('should be case-insensitive', () => {
        component.searchTerm = 'brussels';
        component.applyFilters();

        expect(component.filteredLocations.length).toBe(3);
      });

      it('should return all locations when search term is empty', () => {
        component.searchTerm = '';
        component.applyFilters();

        expect(component.filteredLocations.length).toBe(3); // Exclut la location en ligne
      });
    });

    describe('Type filtering', () => {
      it('should filter locations by GAME_STORE type', () => {
        component.selectedType = 'GAME_STORE';
        component.applyFilters();

        expect(component.filteredLocations.length).toBe(1);
        expect(component.filteredLocations[0].type).toBe('GAME_STORE');
      });

      it('should filter locations by CAFE type', () => {
        component.selectedType = 'CAFE';
        component.applyFilters();

        expect(component.filteredLocations.length).toBe(1);
        expect(component.filteredLocations[0].type).toBe('CAFE');
      });

      it('should filter locations by BAR type', () => {
        component.selectedType = 'BAR';
        component.applyFilters();

        expect(component.filteredLocations.length).toBe(1);
        expect(component.filteredLocations[0].type).toBe('BAR');
      });

      it('should return all locations when type is empty', () => {
        component.selectedType = '';
        component.applyFilters();

        expect(component.filteredLocations.length).toBe(3); // Exclut la location en ligne
      });
    });

    describe('Amenities filtering', () => {
      it('should filter locations with WiFi', () => {
        component.filters.wifi = true;
        component.applyFilters();

        expect(component.filteredLocations.length).toBe(3);
        component.filteredLocations.forEach((loc) => {
          expect(loc.amenities).toContain('WiFi');
        });
      });

      it('should filter locations with Gaming Tables', () => {
        component.filters.tables = true;
        component.applyFilters();

        expect(component.filteredLocations.length).toBe(2);
        component.filteredLocations.forEach((loc) => {
          expect(loc.amenities).toContain('Gaming Tables');
        });
      });

      it('should filter locations with Food', () => {
        component.filters.food = true;
        component.applyFilters();

        expect(component.filteredLocations.length).toBe(2);
        component.filteredLocations.forEach((loc) => {
          expect(loc.amenities).toContain('Food');
        });
      });

      it('should filter locations with Drinks', () => {
        component.filters.drinks = true;
        component.applyFilters();

        expect(component.filteredLocations.length).toBe(3);
        component.filteredLocations.forEach((loc) => {
          expect(loc.amenities).toContain('Drinks');
        });
      });

      it('should filter locations with Parking', () => {
        component.filters.parking = true;
        component.applyFilters();

        expect(component.filteredLocations.length).toBe(1);
        expect(component.filteredLocations[0].name).toBe('Brussels Game Store');
      });

      it('should combine multiple amenity filters (AND logic)', () => {
        component.filters.wifi = true;
        component.filters.food = true;
        component.applyFilters();

        expect(component.filteredLocations.length).toBe(2);
        component.filteredLocations.forEach((loc) => {
          expect(loc.amenities).toContain('WiFi');
          expect(loc.amenities).toContain('Food');
        });
      });

      it('should return one location when all strict amenities required', () => {
        component.filters.wifi = true;
        component.filters.food = true;
        component.filters.parking = true;
        component.applyFilters();

        expect(component.filteredLocations.length).toBe(1);
        expect(component.filteredLocations[0].name).toBe('Brussels Game Store');
      });
    });

    describe('Combined filtering', () => {
      it('should combine search and type filters', () => {
        component.searchTerm = 'Brussels';
        component.selectedType = 'GAME_STORE';
        component.applyFilters();

        expect(component.filteredLocations.length).toBe(1);
        expect(component.filteredLocations[0].name).toBe('Brussels Game Store');
      });

      it('should combine search and amenities filters', () => {
        component.searchTerm = 'Café';
        component.filters.food = true;
        component.applyFilters();

        expect(component.filteredLocations.length).toBe(1);
        expect(component.filteredLocations[0].name).toBe('Café Joystick');
      });

      it('should combine type and amenities filters', () => {
        component.selectedType = 'BAR';
        component.filters.wifi = true;
        component.applyFilters();

        expect(component.filteredLocations.length).toBe(1);
        expect(component.filteredLocations[0].name).toBe('Le Dé à Coudre');
      });

      it('should combine all filters (search + type + amenities)', () => {
        component.searchTerm = 'Brussels';
        component.selectedType = 'GAME_STORE';
        component.filters.parking = true;
        component.applyFilters();

        expect(component.filteredLocations.length).toBe(1);
        expect(component.filteredLocations[0].name).toBe('Brussels Game Store');
      });

      it('should return empty when combined filters match nothing', () => {
        component.searchTerm = 'Café';
        component.selectedType = 'BAR';
        component.applyFilters();

        expect(component.filteredLocations.length).toBe(0);
      });
    });

    describe('Reset filters', () => {
      it('should reset all filter values', () => {
        component.searchTerm = 'Brussels';
        component.selectedType = 'GAME_STORE';
        component.filters.wifi = true;
        component.filters.food = true;

        component.resetFilters();

        expect(component.searchTerm).toBe('');
        expect(component.selectedType).toBe('');
        expect(component.filters.wifi).toBe(false);
        expect(component.filters.food).toBe(false);
        expect(component.filters.drinks).toBe(false);
        expect(component.filters.tables).toBe(false);
        expect(component.filters.parking).toBe(false);
      });

      it('should restore all locations after reset', () => {
        component.searchTerm = 'Joystick';
        component.applyFilters();
        expect(component.filteredLocations.length).toBe(1);

        component.resetFilters();

        expect(component.filteredLocations.length).toBe(3); // Exclut la location en ligne
      });
    });

    describe('Active filters count', () => {
      it('should return 0 when no filters are active', () => {
        expect(component.getActiveFiltersCount()).toBe(0);
      });

      it('should count search term as 1 filter', () => {
        component.searchTerm = 'Brussels';
        expect(component.getActiveFiltersCount()).toBe(1);
      });

      it('should count type selection as 1 filter', () => {
        component.selectedType = 'CAFE';
        expect(component.getActiveFiltersCount()).toBe(1);
      });

      it('should count each active amenity filter', () => {
        component.filters.wifi = true;
        component.filters.food = true;
        expect(component.getActiveFiltersCount()).toBe(2);
      });

      it('should count all filters combined', () => {
        component.searchTerm = 'Brussels';
        component.selectedType = 'GAME_STORE';
        component.filters.wifi = true;
        component.filters.parking = true;
        expect(component.getActiveFiltersCount()).toBe(4);
      });
    });

    describe('Online/Private location exclusion', () => {
      it('should exclude locations with lat=0 and lon=0 on load', () => {
        jest
          .spyOn(locationsService, 'getLocations')
          .mockReturnValue(of(mockLocations));

        component.ngOnInit();

        expect(component.locations.length).toBe(3);
        expect(
          component.locations.every((loc) => loc.lat !== 0 || loc.lon !== 0)
        ).toBe(true);
      });

      it('should exclude PRIVATE locations with no coordinates on load', () => {
        jest
          .spyOn(locationsService, 'getLocations')
          .mockReturnValue(of(mockLocations));

        component.ngOnInit();

        const hasPrivateWithNoCoords = component.locations.some(
          (loc) => loc.type === 'PRIVATE' && loc.lat === 0 && loc.lon === 0
        );
        expect(hasPrivateWithNoCoords).toBe(false);
      });

      it('should not exclude PRIVATE locations with valid coordinates', () => {
        const privateLocationWithCoords = {
          ...mockLocations[3],
          lat: 50.8503,
          lon: 4.3517,
        };
        jest
          .spyOn(locationsService, 'getLocations')
          .mockReturnValue(
            of([...mockLocations.slice(0, 3), privateLocationWithCoords])
          );

        component.ngOnInit();

        const hasPrivateWithCoords = component.locations.some(
          (loc) => loc.type === 'PRIVATE' && loc.lat !== 0 && loc.lon !== 0
        );
        expect(hasPrivateWithCoords).toBe(true);
      });
    });

    describe('Amenity name mapping', () => {
      it('should map wifi to WiFi', () => {
        expect(component.getAmenityName('wifi')).toBe('WiFi');
      });

      it('should map tables to Gaming Tables', () => {
        expect(component.getAmenityName('tables')).toBe('Gaming Tables');
      });

      it('should map food to Food', () => {
        expect(component.getAmenityName('food')).toBe('Food');
      });

      it('should map drinks to Drinks', () => {
        expect(component.getAmenityName('drinks')).toBe('Drinks');
      });

      it('should map parking to Parking', () => {
        expect(component.getAmenityName('parking')).toBe('Parking');
      });
    });
  });

  describe('Map Interactivity', () => {
    beforeEach(() => {
      // Mock scrollIntoView for JSDOM
      if (!Element.prototype.scrollIntoView) {
        Element.prototype.scrollIntoView = jest.fn();
      }

      // Mock initMap to prevent Leaflet initialization errors
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(component as any, 'initMap').mockImplementation(jest.fn());

      jest
        .spyOn(locationsService, 'getLocations')
        .mockReturnValue(of(mockLocations));
      fixture.detectChanges();

      // Setup a mock map and marker for testing
      component['map'] = {
        setView: jest.fn().mockReturnThis(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const mockMarker = {
        openPopup: jest.fn(),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component['markersByLocationId'].set('1', mockMarker as any);
    });

    describe('onLocationClick', () => {
      it('should set selectedLocationId and zoom to marker for valid location', () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const setViewSpy = jest.spyOn(component['map']!, 'setView');

        component.onLocationClick('1');

        expect(component.selectedLocationId).toBe('1');
        expect(setViewSpy).toHaveBeenCalledWith(
          [50.8476, 4.3572], // Brussels Game Store coordinates
          15,
          { animate: true, duration: 0.5 }
        );
      });

      it('should not set selectedLocationId if location not found', () => {
        component.onLocationClick('nonexistent');
        expect(component.selectedLocationId).toBeNull();
      });

      it('should not set selectedLocationId if map is not initialized', () => {
        component['map'] = null;
        component.onLocationClick('1');
        expect(component.selectedLocationId).toBeNull(); // Returns early
      });

      it('should not set selectedLocationId for online locations (PRIVATE with 0,0 coords)', () => {
        component.onLocationClick('4'); // Online location
        // The method returns early for online locations before setting selectedLocationId
        expect(component.selectedLocationId).toBeNull();
      });
    });

    describe('onMarkerClick', () => {
      it('should set selectedLocationId', () => {
        component.onMarkerClick('1');
        expect(component.selectedLocationId).toBe('1');
      });

      it('should call scrollIntoView if element exists', fakeAsync(() => {
        const mockElement = {
          scrollIntoView: jest.fn(),
          classList: {
            add: jest.fn(),
            remove: jest.fn(),
          },
        };

        jest
          .spyOn(document, 'getElementById')
          .mockReturnValue(mockElement as unknown as HTMLElement);

        component.onMarkerClick('1');

        tick();

        expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
          behavior: 'smooth',
          block: 'center',
        });

        jest.restoreAllMocks();
      }));

      it('should add and remove highlight class', fakeAsync(() => {
        const mockElement = {
          scrollIntoView: jest.fn(),
          classList: {
            add: jest.fn(),
            remove: jest.fn(),
            contains: jest.fn(),
          },
        };

        jest
          .spyOn(document, 'getElementById')
          .mockReturnValue(mockElement as unknown as HTMLElement);

        component.onMarkerClick('1');

        tick();

        // Verify class is added after scroll handler runs
        expect(mockElement.classList.add).toHaveBeenCalledWith('highlight');

        // Fast-forward time by 2 seconds
        tick(2000);

        // Verify class is removed after 2 seconds
        expect(mockElement.classList.remove).toHaveBeenCalledWith('highlight');

        jest.restoreAllMocks();
      }));

      it('should handle missing element gracefully', () => {
        jest.spyOn(document, 'getElementById').mockReturnValue(null);
        expect(() => component.onMarkerClick('nonexistent')).not.toThrow();
        jest.restoreAllMocks();
      });
    });

    describe('calculateDistance', () => {
      it('should calculate distance between two points correctly', () => {
        // Brussels to Antwerp (approximately 45 km)
        const distance = component['calculateDistance'](
          50.8476,
          4.3572,
          51.2194,
          4.4025
        );
        expect(distance).toBeGreaterThan(40);
        expect(distance).toBeLessThan(50);
      });

      it('should return 0 for same coordinates', () => {
        const distance = component['calculateDistance'](
          50.8476,
          4.3572,
          50.8476,
          4.3572
        );
        expect(distance).toBe(0);
      });

      it('should work with negative coordinates', () => {
        const distance = component['calculateDistance'](
          40.7128,
          -74.006,
          34.0522,
          -118.2437
        );
        // New York to Los Angeles (approximately 3935 km)
        expect(distance).toBeGreaterThan(3900);
        expect(distance).toBeLessThan(4000);
      });

      it('should handle equator crossing', () => {
        const distance = component['calculateDistance'](10, 0, -10, 0);
        expect(distance).toBeGreaterThan(2200);
        expect(distance).toBeLessThan(2300);
      });
    });

    describe('getAmenityIcon', () => {
      it('should return WiFi icon HTML', () => {
        const html = component['getAmenityIcon']('WiFi');
        expect(html).toContain('amenity-icon');
        expect(html).toContain('material-icons');
        expect(html).toContain('WiFi');
      });

      it('should return Tables icon HTML', () => {
        const html = component['getAmenityIcon']('Tables');
        expect(html).toContain('amenity-icon');
        expect(html).toContain('Tables');
      });

      it('should return Food icon HTML', () => {
        const html = component['getAmenityIcon']('Food');
        expect(html).toContain('amenity-icon');
        expect(html).toContain('Restauration');
      });

      it('should return Drinks icon HTML', () => {
        const html = component['getAmenityIcon']('Drinks');
        expect(html).toContain('amenity-icon');
        expect(html).toContain('Boissons');
      });

      it('should return Parking icon HTML', () => {
        const html = component['getAmenityIcon']('Parking');
        expect(html).toContain('amenity-icon');
        expect(html).toContain('Parking');
      });

      it('should return generic HTML for unknown amenity', () => {
        const html = component['getAmenityIcon']('Unknown');
        expect(html).toContain('amenity-icon');
        expect(html).toContain('Unknown');
        expect(html).not.toContain('<svg');
      });
    });
  });

  describe('Geolocation', () => {
    type LocationsListPrivateApi = {
      handleLocateSuccess(event: {
        latlng: { lat: number; lng: number };
      }): void;
      handleLocateError(event: { message: string }): void;
      triggerInitialLocate(): void;
      addUserMarker(options?: { animate?: boolean }): void;
      findNearestLocation(options?: { adjustMap?: boolean }): void;
      persistUserPosition(position: { lat: number; lon: number }): void;
      locateControl: { start: jest.Mock } | null;
      map: { locate: jest.Mock } | null;
      skipNextNearestAdjust: boolean;
      initialLocateRequested: boolean;
      restoredUserPosition: boolean;
    };

    const originalGeolocation = navigator.geolocation;
    let componentPrivate: LocationsListPrivateApi;

    beforeEach(() => {
      jest
        .spyOn(component as unknown as { initMap: () => void }, 'initMap')
        .mockImplementation(() => undefined);

      jest
        .spyOn(locationsService, 'getLocations')
        .mockReturnValue(of(mockLocations));

      fixture.detectChanges();

      componentPrivate = component as unknown as LocationsListPrivateApi;
    });

    afterEach(() => {
      jest.restoreAllMocks();
      Object.defineProperty(global.navigator, 'geolocation', {
        configurable: true,
        writable: true,
        value: originalGeolocation,
      });
    });

    describe('handleLocateSuccess', () => {
      it('should update user position, clear error, persist position and adjust map', () => {
        componentPrivate.skipNextNearestAdjust = true;

        const addUserMarkerSpy = jest
          .spyOn(componentPrivate, 'addUserMarker')
          .mockImplementation(() => undefined);
        const findNearestLocationSpy = jest
          .spyOn(componentPrivate, 'findNearestLocation')
          .mockImplementation(() => undefined);
        const persistUserPositionSpy = jest
          .spyOn(componentPrivate, 'persistUserPosition')
          .mockImplementation(() => undefined);

        const event = { latlng: { lat: 50.8476, lng: 4.3572 } };

        componentPrivate.handleLocateSuccess(event);

        expect(component.userPosition).toEqual({
          lat: 50.8476,
          lon: 4.3572,
        });
        expect(component.geolocationError).toBeNull();
        expect(componentPrivate.restoredUserPosition).toBe(true);
        expect(componentPrivate.skipNextNearestAdjust).toBe(false);
        expect(addUserMarkerSpy).toHaveBeenCalledWith({ animate: false });
        expect(findNearestLocationSpy).toHaveBeenCalledWith({
          adjustMap: false,
        });
        expect(persistUserPositionSpy).toHaveBeenCalledWith({
          lat: 50.8476,
          lon: 4.3572,
        });
      });
    });

    describe('handleLocateError', () => {
      it('should store error message and reset skipNextNearestAdjust', () => {
        componentPrivate.skipNextNearestAdjust = true;

        componentPrivate.handleLocateError({ message: 'Location failed' });

        expect(component.geolocationError).toBe('Location failed');
        expect(componentPrivate.skipNextNearestAdjust).toBe(false);
      });
    });

    describe('triggerInitialLocate', () => {
      it('should start locate control when available', () => {
        const startMock = jest.fn();
        componentPrivate.locateControl = {
          start: startMock,
        };

        componentPrivate.triggerInitialLocate();

        expect(startMock).toHaveBeenCalled();
        expect(componentPrivate.initialLocateRequested).toBe(true);
        expect(componentPrivate.skipNextNearestAdjust).toBe(true);
      });

      it('should fall back to map.locate when control unavailable', () => {
        const mapLocate = jest.fn();
        componentPrivate.locateControl = null;
        componentPrivate.map = { locate: mapLocate };

        Object.defineProperty(global.navigator, 'geolocation', {
          configurable: true,
          writable: true,
          value: { getCurrentPosition: jest.fn() },
        });

        componentPrivate.triggerInitialLocate();

        expect(mapLocate).toHaveBeenCalledWith({
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
          setView: false,
        });
      });
    });
  });
});
