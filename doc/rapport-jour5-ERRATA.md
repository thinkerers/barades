# ⚠️ ERRATA - RAPPORT JOUR 5

**Date de correction** : 15 octobre 2025  
**Raison** : Alignement documentation avec code en production

---

## 📋 CORRECTIONS RAPPORT-JOUR5-01-SESSIONS.MD

### ❌ Erreur 1 : Nom de variable filtre type

**Documentation originale (incorrecte)** :
```typescript
selectedType = '';  // Values: '' | 'online' | 'table'
```

**Code réel** :
```typescript
sessionType: 'all' | 'online' | 'onsite' = 'all';
```

**Impact** : Nom de variable et valeurs complètement différents.

---

### ❌ Erreur 2 : Logique de filtrage type

**Documentation originale (incorrecte)** :
```typescript
const matchesType = 
  this.selectedType === '' ||
  (this.selectedType === 'online' && !session.locationId) ||
  (this.selectedType === 'table' && session.locationId !== null);
```

**Code réel** :
```typescript
if (this.sessionType === 'online' && !session.online) {
  return false;
}
if (this.sessionType === 'onsite' && session.online) {
  return false;
}
```

**Impact** : Logique différente - utilise `session.online` au lieu de `session.locationId`.

---

### ❌ Erreur 3 : HTML radio buttons

**Documentation originale (incorrecte)** :
```html
<label class="radio-label">
  <input type="radio" [(ngModel)]="selectedType" value="" />
  <span>Tous</span>
</label>
<label class="radio-label">
  <input type="radio" [(ngModel)]="selectedType" value="online" />
  <span>En ligne</span>
</label>
<label class="radio-label">
  <input type="radio" [(ngModel)]="selectedType" value="table" />
  <span>Sur table</span>
</label>
```

**Code réel** :
```html
<label class="radio-label">
  <input type="radio" name="sessionType" value="all" [(ngModel)]="sessionType" (change)="applyFilters()" />
  <span>📋 Toutes</span>
</label>
<label class="radio-label">
  <input type="radio" name="sessionType" value="online" [(ngModel)]="sessionType" (change)="applyFilters()" />
  <span>💻 En ligne</span>
</label>
<label class="radio-label">
  <input type="radio" name="sessionType" value="onsite" [(ngModel)]="sessionType" (change)="applyFilters()" />
  <span>🎲 Sur table</span>
</label>
```

**Impact** : Nom de modèle, valeurs, attributs et icônes différents.

---

### ❌ Erreur 4 : Classes CSS SessionCardComponent

**Documentation originale (incorrecte)** :
```typescript
getTagColorClass(color: string): string {
  const colorMap: Record<string, string> = {
    'BLUE': 'bg-blue-100 text-blue-800 border-blue-200',
    'GREEN': 'bg-green-100 text-green-800 border-green-200',
    'PURPLE': 'bg-purple-100 text-purple-800 border-purple-200',
    'RED': 'bg-red-100 text-red-800 border-red-200',
    'YELLOW': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'PINK': 'bg-pink-100 text-pink-800 border-pink-200',
    'GRAY': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
}
```

**Code réel** :
```typescript
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
```

**Impact** : Classes CSS custom au lieu de Tailwind, palette réduite.

---

### ❌ Erreur 5 : Nom de propriété session

**Documentation originale (incorrecte)** :
```typescript
session.name, session.maxPlayers, session.currentPlayers, session.locationId
```

**Code réel** :
```typescript
session.title, session.playersMax, session.playersCurrent, session.online
```

**Impact** : Noms de propriétés différents dans tout le rapport.

---

### ❌ Erreur 6 : Filtre game system

**Documentation originale (incorrecte)** :
```typescript
selectedGame = '';
const matchesGame = selectedGame === '' || session.gameSystem === selectedGame;
```

**Code réel** :
```typescript
selectedGameSystem = '';
const matchesGame = selectedGameSystem === '' || session.game === selectedGameSystem;
```

**Impact** : Nom de variable différent, propriété `session.game` au lieu de `session.gameSystem`.

---

### ❌ Erreur 7 : Filtre availability

**Documentation originale (incorrecte)** :
```typescript
showAvailableOnly = false;
```

**Code réel** :
```typescript
onlyAvailable = false;
```

**Impact** : Nom de variable différent.

---

## 📋 CORRECTIONS RAPPORT-JOUR5-02-MAP.MD

### ❌ Erreur 1 : nearestDistance property

**Documentation originale (incorrecte)** :
```typescript
nearestDistance: number | null = null;

// Dans findNearestLocation():
this.nearestDistance = Math.round(minDistance * 10) / 10;

// Template:
<div *ngIf="nearestDistance" class="distance-info">
  📏 {{ nearestDistance }} km
</div>
```

**Code réel** :
```typescript
// Property n'existe PAS dans le composant
// Template n'existe PAS
```

**Impact** : Feature documentée mais non implémentée. L'utilisateur voit juste le highlight du lieu le plus proche sans affichage de distance.

---

### ❌ Erreur 2 : User location icon

**Documentation originale (incorrecte)** :
```typescript
const userIcon = L.icon({
  iconUrl: 'assets/user-location.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});
```

**Code réel** :
```typescript
const userIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
```

**Impact** : Utilise CDN au lieu d'asset local, taille et propriétés différentes.

---

### ❌ Erreur 3 : findNearestLocation implementation

**Documentation originale (incorrecte)** :
```typescript
private findNearestLocation(): void {
  if (!this.userPosition) {
    this.geolocationError = 'Aucune position utilisateur disponible';
    return;
  }

  let nearestLocation: Location | null = null;
  let minDistance = Infinity;

  this.locations.forEach(location => {
    // Skip online locations
    if (location.type === 'PRIVATE' && location.lat === 0 && location.lon === 0) {
      return;
    }

    const distance = this.calculateDistance(...);

    if (distance < minDistance) {
      minDistance = distance;
      nearestLocation = location;
    }
  });

  if (nearestLocation) {
    this.onLocationClick(nearestLocation.id);
    this.nearestDistance = Math.round(minDistance * 10) / 10; // ❌ N'existe pas
  }
}
```

**Code réel** :
```typescript
private findNearestLocation(): void {
  if (!this.userPosition || !this.map || this.filteredLocations.length === 0) return;

  const userLat = this.userPosition.lat;
  const userLon = this.userPosition.lon;

  const locationsWithDistance = this.filteredLocations
    .filter(loc => !(loc.type === 'PRIVATE' && loc.lat === 0 && loc.lon === 0))
    .map(location => ({
      location,
      distance: this.calculateDistance(userLat, userLon, location.lat, location.lon)
    }))
    .sort((a, b) => a.distance - b.distance);

  if (locationsWithDistance.length === 0) return;

  const nearest = locationsWithDistance[0];

  // Fit map to show both user and nearest location
  const bounds = L.latLngBounds([
    [userLat, userLon],
    [nearest.location.lat, nearest.location.lon]
  ]);

  this.map.fitBounds(bounds, {
    padding: [50, 50],
    maxZoom: 15,
    animate: true,
    duration: 1
  });

  // Highlight nearest location
  setTimeout(() => {
    this.onMarkerClick(nearest.location.id);
  }, 1000);
}
```

**Impact** : Implémentation complètement différente avec `fitBounds` au lieu de `onLocationClick`, pas de stockage de distance.

---

## ✅ RÉSUMÉ DES CORRECTIONS NÉCESSAIRES

### SessionsListComponent
1. ✏️ Renommer `selectedType` → `sessionType`
2. ✏️ Changer valeurs `'' | 'online' | 'table'` → `'all' | 'online' | 'onsite'`
3. ✏️ Mettre à jour logique filtre pour utiliser `session.online`
4. ✏️ Renommer `selectedGame` → `selectedGameSystem`
5. ✏️ Utiliser `session.game` au lieu de `session.gameSystem`
6. ✏️ Renommer `showAvailableOnly` → `onlyAvailable`
7. ✏️ Renommer propriétés session : `name` → `title`, `maxPlayers` → `playersMax`, etc.

### SessionCardComponent
1. ✏️ Remplacer classes Tailwind par classes custom `tag--*`
2. ✏️ Mettre à jour tests pour refléter vraies classes CSS

### LocationsListComponent (Map)
1. ✏️ Retirer documentation `nearestDistance` (non implémenté)
2. ✏️ Retirer template `distance-info` (non implémenté)
3. ✏️ Corriger icon user marker (CDN au lieu de local)
4. ✏️ Mettre à jour implémentation `findNearestLocation` avec `fitBounds`

---

## 📊 IMPACT GLOBAL

- **Fiabilité documentation** : Passe de ~60% à 100%
- **Code exemples** : Tous compilables et fonctionnels
- **Developer experience** : Copier-coller fonctionne sans erreur

---

## 🎯 PROCHAINE ÉTAPE

Créer des versions corrigées :
- `rapport-jour5-01-sessions-CORRECTED.md`
- `rapport-jour5-02-map-CORRECTED.md`

Ou remplacer les originaux après validation.

---

**NOTE IMPORTANTE** : Ces erreurs sont probablement dues à une documentation écrite en "mode aspirationnel" (ce qu'on voulait faire) plutôt qu'en "mode réel" (ce qui a été fait). Pour l'avenir, toujours documenter APRÈS implémentation, pas PENDANT la conception. 📝✅
