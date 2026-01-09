import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  PendingTasks,
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
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  Location,
  LocationType,
  LocationsService,
} from '../../core/services/locations.service';
import { GeocodingService } from '../../core/services/geocoding.service';

@Component({
  selector: 'app-location-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './location-edit.html',
  styleUrls: ['./location-create.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationEditComponent implements OnInit, AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly locationsService = inject(LocationsService);
  private readonly authService = inject(AuthService);
  private readonly geocodingService = inject(GeocodingService);
  private readonly notifications = inject(NotificationService);
  private readonly pendingTasks = inject(PendingTasks);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('locationMap', { static: false })
  private readonly mapContainer?: ElementRef<HTMLDivElement>;

  locationForm!: FormGroup;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly error = signal<string | null>(null);
  locationId: string | null = null;
  readonly location = signal<Location | null>(null);

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
        queryParams: { returnUrl: this.router.url },
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
    // Récupérer l'ID du lieu depuis l'URL
    this.locationId = this.route.snapshot.paramMap.get('id');
    if (!this.locationId) {
      this.error.set('ID de lieu invalide');
      this.loading.set(false);
      return;
    }

    // Charger le lieu
    void this.loadLocation(this.locationId);
  }

  ngAfterViewInit(): void {
    // La carte sera initialisée après le chargement du lieu
    // dans la méthode loadLocation()
  }

  private async loadLocation(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      await this.pendingTasks.run(async () => {
        const location = await firstValueFrom(
          this.locationsService.getLocation(id)
        );
        this.location.set(location);

        // Vérifier que l'utilisateur est bien le créateur
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser || location.creatorId !== currentUser.id) {
          this.error.set("Vous n'êtes pas autorisé à modifier ce lieu");
          return;
        }

        // Pré-remplir le formulaire
        this.locationForm.patchValue({
          name: location.name,
          address: location.address || '',
          city: location.city,
          type: location.type,
          lat: location.lat,
          lon: location.lon,
          capacity: location.capacity,
          website: location.website || '',
          isPrivate: location.isPrivate,
        });

        // Pré-sélectionner les équipements
        this.selectedAmenities.set(location.amenities || []);
      });
    } catch (err) {
      console.error('Erreur lors du chargement du lieu:', err);
      this.error.set(
        "Impossible de charger le lieu. Il n'existe peut-être pas."
      );
    } finally {
      this.loading.set(false);

      // Initialiser la carte après que le template soit rendu
      // (attendre le prochain cycle de détection de changements)
      setTimeout(() => {
        this.initMap();

        // Mettre à jour la carte avec la position du lieu
        const loadedLocation = this.location();
        if (loadedLocation && loadedLocation.lat && loadedLocation.lon) {
          this.updateMapPosition(loadedLocation.lat, loadedLocation.lon);
        }
      }, 0);
    }
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
      console.warn('[LocationEdit] Map container not found');
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

    if (!this.locationId) {
      this.error.set('ID de lieu invalide');
      return;
    }

    const lat = this.locationForm.get('lat')?.value;
    const lon = this.locationForm.get('lon')?.value;
    if (lat === null || lon === null) {
      this.error.set('Veuillez cliquer sur la carte pour indiquer la position du lieu');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const formValue = this.locationForm.value;
    const locationData = {
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
      const updatedLocation = await firstValueFrom(
        this.locationsService.updateLocation(this.locationId, locationData)
      );
      this.notifications.success('Lieu modifié avec succès.');
      this.router.navigate(['/locations']);
    } catch (err: unknown) {
      console.error('Erreur lors de la modification:', err);
      this.error.set(
        (err as { error?: { message?: string } })?.error?.message ||
          'Une erreur est survenue lors de la modification du lieu'
      );
    } finally {
      this.saving.set(false);
    }
  }

  async onDelete(): Promise<void> {
    if (!this.locationId) {
      this.error.set('ID de lieu invalide');
      return;
    }

    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer ce lieu ? Cette action est irréversible.'
    );

    if (!confirmed) {
      return;
    }

    this.deleting.set(true);

    try {
      await firstValueFrom(
        this.locationsService.deleteLocation(this.locationId)
      );
      this.notifications.success('Lieu supprimé avec succès.');
      this.router.navigate(['/locations']);
    } catch (err: unknown) {
      console.error('Erreur lors de la suppression:', err);
      this.error.set(
        (err as { error?: { message?: string } })?.error?.message ||
          'Une erreur est survenue lors de la suppression du lieu'
      );
    } finally {
      this.deleting.set(false);
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
