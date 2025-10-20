# Jour 3 - Intégration Leaflet

[← Composants](rapport-jour3-03-components.md) | [→ Navigation](rapport-jour3-05-navigation.md)

---

## 🗺️ Introduction à Leaflet

**Leaflet** est une bibliothèque JavaScript open-source pour les cartes interactives. Elle est :

- ✅ **Légère** : ~42 KB (vs Google Maps ~350 KB)
- ✅ **Mobile-first** : Conçue pour le tactile
- ✅ **Open-source** : Licence BSD-2-Clause
- ✅ **Extensible** : Centaines de plugins disponibles

**Use case dans Bar à Dés** : Afficher les lieux de jeu sur une carte interactive avec markers colorés.

---

## 📦 Installation

### 1. Packages NPM

```bash
npm install leaflet @types/leaflet
```

**Versions installées :**
- `leaflet@1.9.4`
- `@types/leaflet@1.9.15`

### 2. Configuration Nx

**`apps/frontend/project.json`** - Ajout des assets CSS et images

```json
{
  "targets": {
    "build": {
      "options": {
        "assets": [
          {
            "glob": "**/*",
            "input": "apps/frontend/public"
          },
          {
            "glob": "**/*",
            "input": "node_modules/leaflet/dist/images",
            "output": "/assets/leaflet/"
          }
        ],
        "styles": [
          "apps/frontend/src/styles.css",
          "node_modules/leaflet/dist/leaflet.css"
        ]
      }
    }
  }
}
```

**Explication :**
- ✅ `leaflet.css` : Styles de la carte (markers, popups, contrôles)
- ✅ `leaflet/dist/images` : Icônes de markers et ombres (PNG)
- ✅ Copié vers `/assets/leaflet/` pour que Leaflet puisse les charger

### 3. Import dans le composant

**`locations-list.ts`**

```typescript
import * as L from 'leaflet';
```

---

## 🏗️ Implémentation

### 1. Template HTML

**`locations-list.html`**

```html
<div class="locations-container">
  <!-- Carte Leaflet -->
  <div id="map" [class.hidden]="!mapVisible" class="locations-map"></div>

  <!-- Toggle map/list -->
  <button (click)="toggleMap()" class="btn-toggle">
    {{ mapVisible ? 'Voir la liste' : 'Voir la carte' }}
  </button>
</div>
```

**Points importants :**
- ✅ `id="map"` : Requis pour `L.map('map')`
- ✅ `[class.hidden]` : Masquage conditionnel (préféré à `*ngIf` pour Leaflet)
- ✅ Hauteur fixe : `600px` (obligatoire pour l'affichage)

### 2. Styles CSS

**`locations-list.css`**

```css
.locations-map {
  width: 100%;
  height: 600px;  /* ⚠️ CRITIQUE: Leaflet nécessite une hauteur explicite */
  margin-bottom: 2rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.locations-map.hidden {
  display: none;  /* Préserve l'instance Leaflet en mémoire */
}
```

**Pourquoi pas `*ngIf` ?**

| Méthode | Avantages | Inconvénients |
|---------|-----------|---------------|
| `*ngIf="mapVisible"` | ❌ Détruit/recrée le DOM | ❌ Leaflet perd la carte à chaque toggle |
| `[class.hidden]` | ✅ Préserve le DOM | ✅ Leaflet reste en mémoire |

---

## 🎯 Initialisation de la carte

### Code TypeScript

**`locations-list.ts`**

```typescript
export class LocationsListComponent implements OnInit, AfterViewInit {
  map: L.Map | null = null;
  mapVisible = true;
  locations: Location[] = [];

  ngOnInit() {
    this.loadLocations();
  }

  ngAfterViewInit() {
    // ⚠️ TIMING CRITIQUE: Attendre que le DOM soit rendu
    setTimeout(() => this.initMap(), 100);
  }

  initMap() {
    const container = document.getElementById('map');
    if (!container) {
      console.error('[LocationsList] Map container not found');
      return;
    }

    console.log('[LocationsList] Container dimensions:', container.clientWidth, container.clientHeight);

    // Centre par défaut: Bruxelles (50.8503°N, 4.3517°E)
    this.map = L.map('map', {
      center: [50.8503, 4.3517],
      zoom: 12,
      scrollWheelZoom: true,
      dragging: true
    });

    console.log('[LocationsList] Map initialized');

    // Tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 3
    }).addTo(this.map);

    console.log('[LocationsList] Tiles added');

    // Ajouter les markers si les données sont déjà chargées
    if (this.locations.length > 0) {
      this.addMarkers();
    }
  }
}
```

**Options de la carte :**
- `center`: Coordonnées GPS `[latitude, longitude]`
- `zoom`: Niveau de zoom (1 = monde, 19 = rue)
- `scrollWheelZoom`: Zoom avec molette souris
- `dragging`: Déplacement avec souris/doigt

---

## 📍 Ajout des markers

### Markers colorés custom

**Code TypeScript**

```typescript
addMarkers() {
  if (!this.map) return;

  console.log('[LocationsList] Adding markers for', this.locations.length, 'locations');

  this.locations.forEach((location, index) => {
    console.log(`[LocationsList] Adding marker ${index + 1}:`, location.name, location.lat, location.lon);

    const marker = L.marker([location.lat, location.lon], {
      icon: this.getLocationIcon(location.icon)
    }).addTo(this.map!);

    marker.bindPopup(this.createPopupContent(location));

    console.log(`[LocationsList] Marker ${index + 1} added`);
  });

  console.log('[LocationsList] All markers added');
}

/**
 * Retourne une icône colorée custom
 * Utilise leaflet-color-markers (GitHub)
 */
getLocationIcon(iconColor: string): L.Icon {
  return L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${iconColor}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],        // Taille de l'icône
    iconAnchor: [12, 41],      // Point d'ancrage (bas du marker)
    popupAnchor: [1, -34],     // Position du popup
    shadowSize: [41, 41]       // Taille de l'ombre
  });
}
```

**Couleurs disponibles :**
- `red` : Boutique de jeux
- `orange` : Café ludique
- `green` : Bar
- `blue` : Centre communautaire
- `gray` : Privé

**Mapping dans les seeds Prisma :**

```typescript
// prisma/seeds/locations.ts
{ icon: 'red', type: 'GAME_STORE' },
{ icon: 'orange', type: 'CAFE' },
{ icon: 'green', type: 'BAR' }
```

---

## 💬 Popups HTML

### Code TypeScript

```typescript
/**
 * Génère le contenu HTML du popup
 */
createPopupContent(location: Location): string {
  const openingHoursHtml = location.openingHours
    ? `<div class="popup-hours">
         <strong>Horaires:</strong><br>
         ${this.formatOpeningHours(location.openingHours)}
       </div>`
    : '';

  const amenitiesHtml = location.amenities.length > 0
    ? `<div class="popup-amenities">
         ${location.amenities.map(a => `<span class="amenity-tag">${a}</span>`).join('')}
       </div>`
    : '';

  return `
    <div class="location-popup">
      <h3 class="popup-title">${location.name}</h3>
      <p class="popup-address">${location.address || ''}, ${location.city}</p>
      <p class="popup-type">${this.getTypeLabel(location.type)}</p>
      <div class="popup-rating">
        <span class="star">★</span>
        <span>${location.rating}/5</span>
      </div>
      ${openingHoursHtml}
      ${amenitiesHtml}
      ${location.website ? `<a href="${location.website}" target="_blank" class="popup-link">Site web →</a>` : ''}
    </div>
  `;
}

/**
 * Formate les horaires d'ouverture
 */
formatOpeningHours(hours: Record<string, string>): string {
  const dayLabels: Record<string, string> = {
    'monday': 'Lun',
    'tuesday': 'Mar',
    'wednesday': 'Mer',
    'thursday': 'Jeu',
    'friday': 'Ven',
    'saturday': 'Sam',
    'sunday': 'Dim'
  };

  return Object.entries(hours)
    .map(([day, time]) => `${dayLabels[day]}: ${time}`)
    .join('<br>');
}
```

**Styles CSS pour les popups**

```css
/* apps/frontend/src/app/features/locations/locations-list.css */

/* ⚠️ Classes globales car popups générés dynamiquement hors Angular */
:global(.location-popup) {
  font-family: var(--font-family);
  min-width: 200px;
}

:global(.popup-title) {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

:global(.popup-rating) {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

:global(.popup-rating .star) {
  color: #fbbf24; /* Jaune étoile */
  font-size: 1.25rem;
}

:global(.amenity-tag) {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 4px;
  font-size: 0.75rem;
  margin-right: 0.25rem;
}
```

**Rendu HTML généré :**

```html
<div class="location-popup">
  <h3 class="popup-title">Outpost Brussels</h3>
  <p class="popup-address">Place du Luxembourg 16, Bruxelles</p>
  <p class="popup-type">Boutique de jeux</p>
  <div class="popup-rating">
    <span class="star">★</span>
    <span>4.8/5</span>
  </div>
  <div class="popup-hours">
    <strong>Horaires:</strong><br>
    Lun: 10:00-20:00<br>
    Mar: 10:00-20:00<br>
    ...
  </div>
  <div class="popup-amenities">
    <span class="amenity-tag">WiFi</span>
    <span class="amenity-tag">Parking</span>
  </div>
  <a href="https://outpost.be" target="_blank" class="popup-link">Site web →</a>
</div>
```

---

## ⚙️ Toggle map/list

### Code TypeScript

```typescript
toggleMap() {
  this.mapVisible = !this.mapVisible;

  // ⚠️ CRITIQUE: Recalculer les dimensions après affichage
  if (this.mapVisible && this.map) {
    console.log('[LocationsList] Toggling map to visible');
    setTimeout(() => {
      this.map!.invalidateSize();
      console.log('[LocationsList] Map invalidateSize called');
    }, 100);
  }
}
```

**Pourquoi `invalidateSize()` ?**

Leaflet calcule les dimensions de la carte à l'initialisation. Si la carte est masquée puis ré-affichée, les dimensions peuvent être incorrectes (0x0 ou anciennes valeurs). `invalidateSize()` force Leaflet à recalculer.

---

## ⚠️ Problème connu : Tuiles partielles

### Symptômes

- ✅ La carte s'affiche (dimensions 571x600)
- ✅ Les 3 markers sont présents
- ❌ Seulement 2 tuiles OpenStreetMap chargées (au lieu de ~12)
- ❌ Reste de la carte grise

### Diagnostics effectués

**1. Logs de debugging**

```typescript
console.log('[LocationsList] Container dimensions:', container.clientWidth, container.clientHeight);
// → Output: 571 600 ✅ OK

console.log('[LocationsList] Map initialized');
// → Output: Map initialisé ✅ OK

console.log('[LocationsList] Tiles added');
// → Output: Tiles ajoutés ✅ OK

console.log('[LocationsList] Adding markers for', this.locations.length, 'locations');
// → Output: 3 locations ✅ OK
```

**2. Tentatives de résolution**

| Tentative | Action | Résultat |
|-----------|--------|----------|
| 1 | `*ngIf="mapVisible"` → `[class.hidden]` | ❌ Pas d'amélioration |
| 2 | `calc(100vh - 150px)` → `600px` fixe | ❌ Pas d'amélioration |
| 3 | `setTimeout(..., 100)` → `setTimeout(..., 500)` | ❌ Pas d'amélioration |
| 4 | Ajout `map.invalidateSize()` après `addTo()` | ❌ Pas d'amélioration |
| 5 | Logs de debugging extensifs | ✅ Confirmé: dimensions OK, markers OK |

**3. Hypothèses**

- **H1: Container caché au chargement** → Container visible dès le départ (mapVisible = true)
- **H2: Hauteur CSS incorrecte** → Hauteur fixe 600px, dimensions vérifiées
- **H3: Timing d'initialisation** → setTimeout + AfterViewInit, devrait suffire
- **H4: Problème réseau OpenStreetMap** → ❓ À vérifier dans les DevTools Network

### Solutions potentielles (à tester Jour 4+)

```typescript
// 1. Force reload des tuiles
this.map.eachLayer(layer => {
  if (layer instanceof L.TileLayer) {
    layer.redraw();
  }
});

// 2. Event listener après chargement des tuiles
const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '...'
});

tileLayer.on('load', () => {
  console.log('Tiles loaded');
  this.map!.invalidateSize();
});

tileLayer.addTo(this.map);

// 3. Attendre le resize du navigateur
window.dispatchEvent(new Event('resize'));

// 4. Utiliser CDN différent pour les tuiles
// https://tile.openstreetmap.org au lieu de https://{s}.tile.openstreetmap.org
```

### Impact utilisateur

- ✅ **Fonctionnel** : Les markers sont cliquables, popups affichés
- ⚠️ **Visuel** : Tuiles partielles = carte grise (peu esthétique)
- ✅ **Fallback** : Toggle vers liste fonctionne parfaitement

**Décision Jour 3 :** Problème documenté mais non bloquant. Priorité à la création des autres pages.

---

## 📊 Tableau récapitulatif

| Fonctionnalité | Status | Détails |
|----------------|--------|---------|
| Installation Leaflet | ✅ | v1.9.4 + @types |
| Configuration assets | ✅ | CSS + images copiées |
| Initialisation carte | ✅ | Centre Bruxelles, zoom 12 |
| Markers colorés | ✅ | 5 couleurs (red, orange, green, blue, gray) |
| Popups HTML | ✅ | Nom, adresse, horaires, amenities, lien web |
| Toggle map/list | ✅ | Avec `invalidateSize()` |
| Tuiles OpenStreetMap | ⚠️ | Chargement partiel (2/12 tuiles) |

---

## 🔗 Navigation

- [← Retour à Composants](rapport-jour3-03-components.md)
- [→ Continuer avec Navigation](rapport-jour3-05-navigation.md)
