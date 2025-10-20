# Jour 3 - Composants de page

[← Services](rapport-jour3-02-services.md) | [→ Leaflet](rapport-jour3-04-leaflet.md)

---

## 🧩 Architecture des composants

Les composants de page (pages) sont des **Standalone Components** Angular qui affichent les données récupérées par les services. Ils suivent le pattern **Smart Component** avec :

- **Gestion de l'état** : loading, error, data
- **Injection de services** : via `inject()`
- **Templating** : HTML avec directives Angular
- **Styling** : CSS scoped au composant

---

## 📅 SessionsListComponent

### Fichier TypeScript

**`apps/frontend/src/app/features/sessions/sessions-list.ts`** (70 lignes)

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SessionsService, Session } from '../../core/services/sessions.service';

@Component({
  selector: 'app-sessions-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sessions-list.html',
  styleUrl: './sessions-list.css',
})
export class SessionsListPage implements OnInit {
  private readonly sessionsService = inject(SessionsService);
  
  sessions: Session[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    this.error = null;
    
    this.sessionsService.getSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
        this.error = 'Impossible de charger les sessions. Vérifiez que le backend est démarré.';
        this.loading = false;
      }
    });
  }

  getTagColorClass(color: string): string {
    const colorMap: Record<string, string> = {
      'RED': 'tag--red',
      'GREEN': 'tag--green',
      'PURPLE': 'tag--purple',
      'BLUE': 'tag--blue',
      'GRAY': 'tag--gray'
    };
    return colorMap[color] || 'tag--gray';
  }

  getLevelLabel(level: string): string {
    const labels: Record<string, string> = {
      'BEGINNER': 'Débutant',
      'INTERMEDIATE': 'Intermédiaire',
      'ADVANCED': 'Avancé',
      'OPEN': 'Tous niveaux'
    };
    return labels[level] || level;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}
```

**Points clés :**
- ✅ Standalone component (pas besoin de NgModule)
- ✅ Injection moderne avec `inject()` au lieu de constructor
- ✅ Gestion de l'état : `loading`, `error`, `sessions`
- ✅ Méthodes utilitaires : `formatDate()`, `getLevelLabel()`, `getTagColorClass()`
- ✅ Classe nommée `SessionsListPage` (convention Nx)

### Template HTML

**`apps/frontend/src/app/features/sessions/sessions-list.html`** (140 lignes)

```html
<div class="sessions-page">
  <header class="sessions-page__header">
    <h1 class="sessions-page__title">Sessions de jeu</h1>
    <p class="sessions-page__subtitle">
      Découvrez les parties organisées près de chez vous ou en ligne
    </p>
  </header>

  <!-- Loading State -->
  <div *ngIf="loading" class="sessions-page__loading">
    <div class="spinner"></div>
    <p>Chargement des sessions...</p>
  </div>

  <!-- Error State -->
  <div *ngIf="error && !loading" class="sessions-page__error">
    <p>{{ error }}</p>
    <button type="button" (click)="loadSessions()" class="button button--primary">
      Réessayer
    </button>
  </div>

  <!-- Sessions List -->
  <div *ngIf="!loading && !error" class="sessions-list">
    <div *ngIf="sessions.length === 0" class="sessions-list__empty">
      <p>Aucune session disponible pour le moment.</p>
    </div>

    <article 
      *ngFor="let session of sessions" 
      class="session-card"
      [class]="'session-card--' + session.tagColor.toLowerCase()"
    >
      <!-- Tag Color Indicator -->
      <div class="session-card__tag" [ngClass]="getTagColorClass(session.tagColor)"></div>

      <!-- Header -->
      <header class="session-card__header">
        <h2 class="session-card__title">{{ session.title }}</h2>
        <span class="session-card__game">{{ session.game }}</span>
      </header>

      <!-- Details with icons -->
      <div class="session-card__details">
        <!-- Date, Host, Location, Level, Players -->
        <div class="session-card__detail">
          <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z"/>
          </svg>
          <span>{{ formatDate(session.date) }}</span>
        </div>

        <div class="session-card__detail" *ngIf="session.host">
          <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          <span>Organisé par {{ session.host.username }}</span>
        </div>

        <div class="session-card__detail">
          <span class="level-badge">{{ getLevelLabel(session.level) }}</span>
        </div>

        <div class="session-card__detail">
          <span>{{ session.playersCurrent }}/{{ session.playersMax }} joueurs</span>
        </div>
      </div>

      <!-- Actions -->
      <footer class="session-card__actions">
        <a [routerLink]="['/sessions', session.id]" class="button button--primary">
          Voir les détails
        </a>
        <button 
          type="button" 
          class="button button--secondary"
          [disabled]="session.playersCurrent >= session.playersMax"
        >
          {{ session.playersCurrent >= session.playersMax ? 'Complet' : 'Réserver' }}
        </button>
      </footer>
    </article>
  </div>
</div>
```

**Techniques Angular utilisées :**
- ✅ `*ngIf` pour affichage conditionnel (loading, error, empty)
- ✅ `*ngFor` pour itération sur les sessions
- ✅ `[ngClass]` pour classes CSS dynamiques
- ✅ `{{ }}` interpolation pour les données
- ✅ `[routerLink]` pour navigation vers page détail
- ✅ `[disabled]` pour désactiver les boutons si session complète
- ✅ `(click)` pour les événements (retry)

### Styling CSS

**Aperçu de `sessions-list.css`** (200+ lignes, extrait)

```css
.sessions-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.sessions-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.session-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.session-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

/* Tags de couleur */
.session-card__tag {
  height: 4px;
  border-radius: 2px;
  margin-bottom: 1rem;
}

.tag--red { background-color: #ef4444; }
.tag--green { background-color: #10b981; }
.tag--blue { background-color: #3b82f6; }
.tag--purple { background-color: #8b5cf6; }
.tag--gray { background-color: #6b7280; }

/* Responsive */
@media (max-width: 768px) {
  .sessions-list {
    grid-template-columns: 1fr;
  }
}
```

---

## 📍 LocationsListComponent

### TypeScript avec Leaflet

**`apps/frontend/src/app/features/locations/locations-list.ts`** (260 lignes)

```typescript
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
    this.locationsService.getLocations().subscribe({
      next: (data) => {
        this.locations = data;
        this.loading = false;
        
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize(true);
          }
          this.addMarkers();
        }, 100);
      },
      error: (err) => {
        console.error('Error loading locations:', err);
        this.error = 'Impossible de charger les lieux. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  private initMap(): void {
    const container = document.getElementById('map');
    if (!container) return;

    // Centre par défaut: Bruxelles
    this.map = L.map('map', {
      center: [50.8503, 4.3517],
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    this.addMarkers();
  }

  private addMarkers(): void {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    this.locations.forEach(location => {
      // Skip online locations
      if (location.type === 'PRIVATE' && location.lat === 0 && location.lon === 0) {
        return;
      }

      const icon = this.getLocationIcon(location.type);

      if (this.map) {
        const marker = L.marker([location.lat, location.lon], { icon })
          .addTo(this.map)
          .bindPopup(this.createPopupContent(location));

        this.markers.push(marker);
      }
    });
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
    return `
      <div class="location-popup">
        <h3>${location.name}</h3>
        <p>${location.address || ''}, ${location.city}</p>
        <p>⭐ ${location.rating.toFixed(1)}/5</p>
        ${location.website ? `<a href="${location.website}" target="_blank">Site web</a>` : ''}
      </div>
    `;
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
```

**Particularités :**
- ✅ Initialisation Leaflet dans `ngOnInit` avec `setTimeout`
- ✅ Pas de toggle map/list (carte toujours visible)
- ✅ Markers colorés basés sur `location.type` (pas `location.icon`)
- ✅ Popups HTML avec informations de base
- ✅ Extensive console logging pour debugging
```

**Particularités :**
- ✅ `AfterViewInit` pour initialisation Leaflet après le rendu
- ✅ `setTimeout()` pour éviter les problèmes de dimensions
- ✅ Markers colorés avec icônes custom
- ✅ Popups HTML avec données de location
- ✅ Toggle map/list pour affichage flexible

### Template avec carte Leaflet

**`apps/frontend/src/app/features/locations/locations-list.html`** (110 lignes)

```html
<div class="locations-container">
  <header class="locations-header">
    <h1>Lieux de jeu</h1>
    <p>Découvrez les lieux où se déroulent les sessions</p>
  </header>

  <!-- Loading State -->
  <div *ngIf="loading" class="loading-container">
    <div class="spinner"></div>
    <p>Chargement des lieux...</p>
  </div>

  <!-- Error State -->
  <div *ngIf="error && !loading" class="error-container">
    <p>{{ error }}</p>
    <button (click)="retry()" class="retry-button">Réessayer</button>
  </div>

  <!-- Map and List - Always rendered but hidden during loading -->
  <div class="content-wrapper" [class.hidden]="loading || error">
    <!-- Map Container (always visible) -->
    <div class="map-container">
      <div id="map" class="map"></div>
    </div>

    <!-- Locations List -->
    <div class="locations-list">
      <h2>Liste des lieux ({{ locations.length }})</h2>
      
      <div class="location-cards">
        <div *ngFor="let location of locations" class="location-card">
          <div class="location-header">
            <h3>{{ location.name }}</h3>
            <span class="location-type">{{ getLocationTypeLabel(location.type) }}</span>
          </div>

          <div class="location-info">
            <div class="info-row" *ngIf="location.address">
              <span>{{ location.address }}, {{ location.city }}</span>
            </div>

            <div class="info-row">
              <span>⭐ {{ location.rating.toFixed(1) }}/5</span>
            </div>

            <div class="info-row" *ngIf="location.capacity">
              <span>Capacité: {{ location.capacity }} personnes</span>
            </div>
          </div>

          <div class="amenities" *ngIf="location.amenities.length > 0">
            <span *ngFor="let amenity of location.amenities" class="amenity-tag">
              {{ amenity }}
            </span>
          </div>

          <div class="location-actions">
            <a *ngIf="location.website" 
               [href]="location.website" 
               target="_blank" 
               rel="noopener" 
               class="website-button">
              Site web
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Points clés :**
- ✅ Carte et liste affichées simultanément (pas de toggle)
- ✅ Map container avec ID `map` pour Leaflet
- ✅ États loading/error gérés avec `*ngIf`
- ✅ Liste des locations avec amenities et website

---

## 👥 GroupsListComponent

### TypeScript

**`apps/frontend/src/app/features/groups/groups-list.ts`** (60 lignes)

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GroupsService, Group } from '../../core/services/groups.service';

@Component({
  selector: 'app-groups-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './groups-list.html',
  styleUrl: './groups-list.css'
})
export class GroupsListComponent implements OnInit {
  private groupsService = inject(GroupsService);
  
  groups: Group[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadGroups();
  }

  private loadGroups(): void {
    this.loading = true;
    this.error = null;

    this.groupsService.getGroups().subscribe({
      next: (data) => {
        this.groups = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading groups:', err);
        this.error = 'Impossible de charger les groupes. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  getPlaystyleLabel(playstyle: string): string {
    const labels: Record<string, string> = {
      'COMPETITIVE': 'Compétitif',
      'CASUAL': 'Décontracté',
      'STORY_DRIVEN': 'Narratif',
      'SANDBOX': 'Bac à sable'
    };
    return labels[playstyle] || playstyle;
  }

  getPlaystyleColor(playstyle: string): string {
    const colors: Record<string, string> = {
      'COMPETITIVE': 'red',
      'CASUAL': 'green',
      'STORY_DRIVEN': 'purple',
      'SANDBOX': 'blue'
    };
    return colors[playstyle] || 'gray';
  }

  retry(): void {
    this.loadGroups();
  }
}
```

**Points clés :**
- ✅ Méthode `loadGroups()` privée
- ✅ Méthode `retry()` publique pour le template
- ✅ `getPlaystyleColor()` retourne 'blue' pour SANDBOX (pas 'orange')

### Template avec badges

**`apps/frontend/src/app/features/groups/groups-list.html`** (120 lignes, extrait)

```html
<div class="groups-container">
  <header class="groups-header">
    <h1>Groupes de jeu</h1>
    <p>Rejoignez une communauté de joueurs passionnés</p>
  </header>

  <!-- Loading State -->
  <div *ngIf="loading" class="loading-container">
    <div class="spinner"></div>
    <p>Chargement des groupes...</p>
  </div>

  <!-- Error State -->
  <div *ngIf="error && !loading" class="error-container">
    <p>{{ error }}</p>
    <button (click)="retry()" class="retry-button">Réessayer</button>
  </div>

  <!-- Groups List -->
  <div *ngIf="!loading && !error" class="groups-list">
    <div *ngIf="groups.length === 0" class="empty-state">
      <h3>Aucun groupe disponible</h3>
      <p>Soyez le premier à créer un groupe !</p>
    </div>

    <div *ngIf="groups.length > 0" class="groups-grid">
      <div *ngFor="let group of groups" class="group-card">
        <div class="group-header">
          <div class="group-title-section">
            <h2>{{ group.name }}</h2>
            <span class="playstyle-badge" 
                  [ngClass]="'playstyle-' + getPlaystyleColor(group.playstyle)">
              {{ getPlaystyleLabel(group.playstyle) }}
            </span>
          </div>
          <span class="recruiting-badge" 
                [ngClass]="group.isRecruiting ? 'recruiting-yes' : 'recruiting-no'">
            {{ group.isRecruiting ? 'Recrutement ouvert' : 'Recrutement fermé' }}
          </span>
        </div>

        <p class="group-description">{{ group.description }}</p>

        <div class="group-info">
          <div class="info-item" *ngIf="group.creator">
            <span>Créé par <strong>{{ group.creator.username }}</strong></span>
          </div>

          <div class="info-item" *ngIf="group._count">
            <span>
              {{ group._count.members }} membre{{ group._count.members > 1 ? 's' : '' }}
              <span *ngIf="group.maxMembers"> / {{ group.maxMembers }}</span>
            </span>
          </div>
        </div>

        <div class="group-actions">
          <button class="btn-primary" [disabled]="!group.isRecruiting">
            {{ group.isRecruiting ? 'Rejoindre' : 'Groupe complet' }}
          </button>
          <a [routerLink]="['/groups', group.id]" class="btn-secondary">
            Voir détails
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Points clés :**
- ✅ Empty state quand aucun groupe
- ✅ Badge playstyle avec couleur dynamique via `[ngClass]`
- ✅ Badge recruiting avec état ouvert/fermé
- ✅ Pluralisation automatique des membres

---

## 📊 Tableau récapitulatif

| Composant | Lignes TS | Lignes HTML | Lignes CSS | Tests | Fonctionnalités clés |
|-----------|-----------|-------------|------------|-------|----------------------|
| SessionsListPage | 70 | 140 | 200+ | ✅ 3 | formatDate, getLevelLabel, getTagColorClass |
| LocationsListComponent | 260 | 110 | 300+ | ✅ 4 | Leaflet map, markers basés sur type, popups |
| GroupsListComponent | 60 | 120 | 250+ | ✅ 5 | playstyle badges, recruiting status, retry |

---

## 🔗 Navigation

- [← Retour à Services](rapport-jour3-02-services.md)
- [→ Continuer avec Leaflet](rapport-jour3-04-leaflet.md)
