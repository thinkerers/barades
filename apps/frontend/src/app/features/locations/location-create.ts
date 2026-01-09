import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import {
  CreateLocationData,
  LocationType,
  LocationsService,
} from '../../core/services/locations.service';
import { GeocodingService } from '../../core/services/geocoding.service';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-location-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './location-create.html',
  styleUrls: ['./location-create.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationCreateComponent implements OnInit, AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly locationsService = inject(LocationsService);
  private readonly authService = inject(AuthService);
  private readonly geocodingService = inject(GeocodingService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('locationMap', { static: true })
  private readonly mapContainer?: ElementRef<HTMLDivElement>;

  locationForm!: FormGroup;
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  readonly locationTypes: { value: LocationType; label: string }[] = [
    { value: 'GAME_STORE', label: 'Boutique de jeux' },
    { value: 'CAFE', label: 'Café' },
    { value: 'BAR', label: 'Bar' },
    { value: 'COMMUNITY_CENTER', label: 'Centre communautaire' },
    { value: 'PRIVATE', label: 'Lieu privé' },
  ];

  // Équipements disponibles
  readonly availableAmenities = [
    'WiFi',
    'Parking',
    'Accessible PMR',
    'Terrasse',
    'Cuisine',
    'Prêt de jeux',
    'Vente de jeux',
    'Snacks',
    'Boissons',
  ];

  readonly selectedAmenities = signal<string[]>([]);

  constructor() {
    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/locations/new' },
      });
      return;
    }

    this.locationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      address: [''],
      city: ['', [Validators.required, Validators.minLength(2)]],
      type: ['GAME_STORE', Validators.required],
      lat: [null as number | null, Validators.required],
      lon: [null as number | null, Validators.required],
      capacity: [null as number | null],
      website: [''],
      isPrivate: [false],
    });

    this.destroyRef.onDestroy(() => {
      this.map?.remove();
      this.map = null;
    });
  }

  ngOnInit(): void {
    // Écouter les changements d'adresse et de ville pour géolocaliser automatiquement
    this.locationForm.valueChanges
      .pipe(
        debounceTime(1000),
        filter((val) => val.city && val.city.length > 2),
        distinctUntilChanged(
          (prev, curr) =>
            prev.city === curr.city && prev.address === curr.address
        ),
        switchMap((val) => {
          const query = val.address
            ? `${val.address}, ${val.city}`
            : `${val.city}`;
          return this.geocodingService.searchAddress(query);
        })
      )
      .subscribe((results) => {
        if (results && results.length > 0) {
          const bestMatch = results[0];
          this.updateMapPosition(bestMatch.lat, bestMatch.lon);
        }
      });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private updateMapPosition(lat: number, lon: number): void {
    // Mettre à jour le formulaire
    this.locationForm.patchValue({ lat, lon }, { emitEvent: false });

    // Mettre à jour la carte
    if (this.map) {
      this.map.setView([lat, lon], 16);
      this.setMarkerPosition(lat, lon);
    }
  }

  private initMap(): void {
    const container = this.mapContainer?.nativeElement;
    if (!container) {
      console.warn('[LocationCreate] Map container not found');
      return;
    }

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    L.Icon.Default.imagePath = 'assets/leaflet/';

    // Centre par défaut : Bruxelles
    const defaultCenter: L.LatLngExpression = [50.8503, 4.3517];

    this.map = L.map(container, {
      center: defaultCenter,
      zoom: 12,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    // Permettre de cliquer sur la carte pour placer le marqueur
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.setMarkerPosition(e.latlng.lat, e.latlng.lng);
    });

    // Essayer de géolocaliser l'utilisateur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.map?.setView([latitude, longitude], 14);
        },
        () => {
          // Géolocalisation refusée, garder la vue par défaut
        }
      );
    }
  }

  private setMarkerPosition(lat: number, lon: number): void {
    // Mettre à jour le formulaire
    this.locationForm.patchValue({ lat, lon });

    // Créer ou déplacer le marqueur
    if (this.marker) {
      this.marker.setLatLng([lat, lon]);
    } else if (this.map) {
      const customIcon = L.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      this.marker = L.marker([lat, lon], {
        icon: customIcon,
        draggable: true,
      }).addTo(this.map);

      // Permettre de déplacer le marqueur
      this.marker.on('dragend', () => {
        const pos = this.marker?.getLatLng();
        if (pos) {
          this.locationForm.patchValue({ lat: pos.lat, lon: pos.lng });
        }
      });
    }
  }

  toggleAmenity(amenity: string): void {
    this.selectedAmenities.update((amenities) => {
      if (amenities.includes(amenity)) {
        return amenities.filter((a) => a !== amenity);
      }
      return [...amenities, amenity];
    });
  }

  isAmenitySelected(amenity: string): boolean {
    return this.selectedAmenities().includes(amenity);
  }

  async onSubmit(): Promise<void> {
    if (this.locationForm.invalid) {
      Object.keys(this.locationForm.controls).forEach((key) => {
        const control = this.locationForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    const lat = this.locationForm.get('lat')?.value;
    const lon = this.locationForm.get('lon')?.value;
    if (lat === null || lon === null) {
      this.error.set('Veuillez cliquer sur la carte pour indiquer la position du lieu');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.locationForm.value;
    const locationData: CreateLocationData = {
      name: formValue.name,
      address: formValue.address || undefined,
      city: formValue.city,
      type: formValue.type,
      lat: formValue.lat,
      lon: formValue.lon,
      amenities: this.selectedAmenities(),
      capacity: formValue.capacity || undefined,
      website: formValue.website || undefined,
      isPrivate: formValue.isPrivate || false,
    };

    try {
      const location = await firstValueFrom(
        this.locationsService.createLocation(locationData)
      );
      console.log('Lieu créé:', location);
      this.router.navigate(['/locations']);
    } catch (err: unknown) {
      console.error('Erreur création lieu:', err);
      this.error.set(
        (err as { error?: { message?: string } })?.error?.message ||
          'Erreur lors de la création du lieu'
      );
    } finally {
      this.loading.set(false);
    }
  }

  cancel(): void {
    this.router.navigate(['/locations']);
  }

  getErrorMessage(field: string): string {
    const control = this.locationForm.get(field);
    if (!control?.touched || !control.errors) return '';

    if (control.errors['required']) return 'Ce champ est requis';
    if (control.errors['minlength'])
      return `Minimum ${control.errors['minlength'].requiredLength} caractères`;

    return 'Champ invalide';
  }
}
