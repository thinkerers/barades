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
      amenities: ['WiFi', 'Gaming Tables', 'Food'],
      capacity: 30,
      openingHours: { monday: '10:00-22:00', tuesday: '10:00-22:00' },
      icon: 'store',
      lat: 50.8476,
      lon: 4.3572,
      website: 'https://example.com',
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

    expect(component.locations).toEqual(mockLocations);
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
});
