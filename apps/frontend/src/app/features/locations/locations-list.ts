import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { LocationsService, Location } from '../../core/services/locations.service';

@Component({
  selector: 'app-locations-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './locations-list.html',
  styleUrl: './locations-list.css'
})
export class LocationsListComponent implements OnInit {
  private locationsService = inject(LocationsService);
  
  locations: Location[] = [];
  loading = true;
  error: string | null = null;
  
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];

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
        console.log('[LocationsList] Locations loaded:', data.length, 'locations');
        this.locations = data;
        this.loading = false;
        
        // CRITICAL: Wait for Angular to remove the 'hidden' class, then force map resize
        setTimeout(() => {
          if (this.map) {
            console.log('[LocationsList] Container now visible, forcing map resize...');
            const container = document.getElementById('map');
            console.log('[LocationsList] Container dimensions NOW:', container?.offsetWidth, 'x', container?.offsetHeight);
            this.map.invalidateSize(true);
            console.log('[LocationsList] Map size after visibility change:', this.map.getSize());
          }
          
          console.log('[LocationsList] Adding markers to map...');
          this.addMarkers();
        }, 100);
      },
      error: (err) => {
        console.error('[LocationsList] Error loading locations:', err);
        this.error = 'Impossible de charger les lieux. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  private initMap(): void {
    console.log('[LocationsList] initMap() called');
    
    // Check if map container exists
    const container = document.getElementById('map');
    console.log('[LocationsList] Map container:', container);
    console.log('[LocationsList] Container dimensions:', container?.offsetWidth, 'x', container?.offsetHeight);
    
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
      attributionControl: true
    });

    console.log('[LocationsList] Map created:', this.map);

    // Add OpenStreetMap tiles
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

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
          console.log('[LocationsList] Map size after invalidate:', mapSizeAfter);
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
    console.log('[LocationsList] Clearing', this.markers.length, 'existing markers');
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    console.log('[LocationsList] Processing', this.locations.length, 'locations');
    
    this.locations.forEach(location => {
      // Skip online locations
      if (location.type === 'PRIVATE' && location.lat === 0 && location.lon === 0) {
        console.log('[LocationsList] Skipping online location:', location.name);
        return;
      }

      console.log('[LocationsList] Adding marker for:', location.name, 'at', location.lat, location.lon);

      // Create custom icon based on location type
      const icon = this.getLocationIcon(location.type);

      if (this.map) {
        const marker = L.marker([location.lat, location.lon], { icon })
          .addTo(this.map)
          .bindPopup(this.createPopupContent(location));

        this.markers.push(marker);
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
      popupAnchor: [0, -32]
    });
  }

  private getIconUrl(type: string): string {
    // Using colored markers from leaflet CDN
    const colors: Record<string, string> = {
      'GAME_STORE': 'red',
      'CAFE': 'orange',
      'BAR': 'green',
      'COMMUNITY_CENTER': 'blue',
      'PRIVATE': 'gray',
      'OTHER': 'gray'
    };
    
    const color = colors[type] || 'gray';
    return `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`;
  }

  private createPopupContent(location: Location): string {
    const amenitiesHtml = location.amenities.length > 0
      ? `<p><strong>Équipements:</strong> ${location.amenities.join(', ')}</p>`
      : '';

    const capacityHtml = location.capacity
      ? `<p><strong>Capacité:</strong> ${location.capacity} personnes</p>`
      : '';

    const websiteHtml = location.website
      ? `<p><a href="${location.website}" target="_blank" rel="noopener">Site web</a></p>`
      : '';

    const hoursHtml = location.openingHours
      ? this.formatOpeningHours(location.openingHours)
      : '';

    return `
      <div class="location-popup">
        <h3>${location.name}</h3>
        <p><strong>${this.getLocationTypeLabel(location.type)}</strong></p>
        ${location.address ? `<p>${location.address}, ${location.city}</p>` : ''}
        <p>⭐ ${location.rating.toFixed(1)}/5</p>
        ${capacityHtml}
        ${amenitiesHtml}
        ${hoursHtml}
        ${websiteHtml}
      </div>
    `;
  }

  private formatOpeningHours(hours: Record<string, string>): string {
    const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const daysLabels: Record<string, string> = {
      'monday': 'Lun',
      'tuesday': 'Mar',
      'wednesday': 'Mer',
      'thursday': 'Jeu',
      'friday': 'Ven',
      'saturday': 'Sam',
      'sunday': 'Dim'
    };

    const hoursHtml = daysOrder
      .map(day => {
        const label = daysLabels[day];
        const time = hours[day] || 'Fermé';
        return `<div><strong>${label}:</strong> ${time}</div>`;
      })
      .join('');

    return `<div class="opening-hours"><strong>Horaires:</strong>${hoursHtml}</div>`;
  }

  getLocationTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'GAME_STORE': 'Boutique de jeux',
      'CAFE': 'Café',
      'BAR': 'Bar',
      'COMMUNITY_CENTER': 'Centre communautaire',
      'PRIVATE': 'Privé',
      'OTHER': 'Autre'
    };
    return labels[type] || type;
  }

  retry(): void {
    this.loadLocations();
  }
}
