import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationsListComponent } from './locations-list';
import { provideHttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LocationsService } from '../../core/services/locations.service';
import { of, throwError } from 'rxjs';

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
      updatedAt: '2025-01-01T00:00:00.000Z'
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
      updatedAt: '2025-01-01T00:00:00.000Z'
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
      updatedAt: '2025-01-01T00:00:00.000Z'
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
      updatedAt: '2025-01-01T00:00:00.000Z'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationsListComponent, HttpClientTestingModule],
      providers: [provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationsListComponent);
    component = fixture.componentInstance;
    locationsService = TestBed.inject(LocationsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load locations on init', () => {
    jest.spyOn(locationsService, 'getLocations').mockReturnValue(of(mockLocations));
    
    fixture.detectChanges();

    // Should exclude online location (PRIVATE with lat=0, lon=0)
    expect(component.locations.length).toBe(3);
    expect(component.locations.every(loc => !(loc.type === 'PRIVATE' && loc.lat === 0 && loc.lon === 0))).toBe(true);
    expect(component.loading).toBe(false);
  });

  it('should handle error when loading locations fails', () => {
    jest.spyOn(locationsService, 'getLocations').mockReturnValue(
      throwError(() => new Error('Failed to load'))
    );

    fixture.detectChanges();

    expect(component.error).toBeTruthy();
    expect(component.loading).toBe(false);
  });

  it('should get correct location type label', () => {
    expect(component.getLocationTypeLabel('GAME_STORE')).toBe('Boutique de jeux');
    expect(component.getLocationTypeLabel('CAFE')).toBe('Café');
    expect(component.getLocationTypeLabel('BAR')).toBe('Bar');
  });

  describe('Filtering', () => {
    beforeEach(() => {
      // Filter out online location (same logic as component)
      const validLocations = mockLocations.filter(loc => 
        !(loc.type === 'PRIVATE' && loc.lat === 0 && loc.lon === 0)
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
        expect(component.filteredLocations[0].address).toBe('Rue des Bouchers 8');
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
        component.filteredLocations.forEach(loc => {
          expect(loc.amenities).toContain('WiFi');
        });
      });

      it('should filter locations with Gaming Tables', () => {
        component.filters.tables = true;
        component.applyFilters();
        
        expect(component.filteredLocations.length).toBe(2);
        component.filteredLocations.forEach(loc => {
          expect(loc.amenities).toContain('Gaming Tables');
        });
      });

      it('should filter locations with Food', () => {
        component.filters.food = true;
        component.applyFilters();
        
        expect(component.filteredLocations.length).toBe(2);
        component.filteredLocations.forEach(loc => {
          expect(loc.amenities).toContain('Food');
        });
      });

      it('should filter locations with Drinks', () => {
        component.filters.drinks = true;
        component.applyFilters();
        
        expect(component.filteredLocations.length).toBe(3);
        component.filteredLocations.forEach(loc => {
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
        component.filteredLocations.forEach(loc => {
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
        jest.spyOn(locationsService, 'getLocations').mockReturnValue(of(mockLocations));
        
        component.ngOnInit();
        
        expect(component.locations.length).toBe(3);
        expect(component.locations.every(loc => loc.lat !== 0 || loc.lon !== 0)).toBe(true);
      });

      it('should exclude PRIVATE locations with no coordinates on load', () => {
        jest.spyOn(locationsService, 'getLocations').mockReturnValue(of(mockLocations));
        
        component.ngOnInit();
        
        const hasPrivateWithNoCoords = component.locations.some(
          loc => loc.type === 'PRIVATE' && loc.lat === 0 && loc.lon === 0
        );
        expect(hasPrivateWithNoCoords).toBe(false);
      });

      it('should not exclude PRIVATE locations with valid coordinates', () => {
        const privateLocationWithCoords = {
          ...mockLocations[3],
          lat: 50.8503,
          lon: 4.3517
        };
        jest.spyOn(locationsService, 'getLocations').mockReturnValue(
          of([...mockLocations.slice(0, 3), privateLocationWithCoords])
        );
        
        component.ngOnInit();
        
        const hasPrivateWithCoords = component.locations.some(
          loc => loc.type === 'PRIVATE' && loc.lat !== 0 && loc.lon !== 0
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
});
