# Jour 3 - Problèmes rencontrés et solutions

[← Tests](rapport-jour3-06-tests.md) | [→ Retour à l'index](rapport-jour3-00-index.md)

---

## 🚨 Problème 1 : Crash VSCode pendant le développement

### Symptômes

- VSCode Copilot Chat s'est fermé brutalement pendant la création de `GroupsService` et `GroupsListComponent`
- Perte de la session de chat en cours
- Incertitude sur l'état du code (fichiers créés ou non)

### Analyse

**Cause probable :** Instabilité de VSCode Copilot Chat avec des processus en arrière-plan (background terminal processes) dans un monorepo Nx.

**Contexte :**
- Commande `npx nx serve barades` lancée en background (isBackground: true)
- Nombreux fichiers créés simultanément (services, composants, templates, styles, tests)
- Workspace Nx large avec compilation TypeScript active

### Solution appliquée

**1. Vérification post-crash**

```bash
# Vérifier les fichiers créés
ls -la apps/frontend/src/app/core/services/
ls -la apps/frontend/src/app/features/groups/

# Vérifier le contenu
cat apps/frontend/src/app/core/services/groups.service.ts
cat apps/frontend/src/app/features/groups/groups-list.ts
```

**Résultat :** Tous les fichiers étaient créés et complets ✅

**2. Commandes manuelles fournies**

Au lieu de relancer des processus background, fourniture de commandes à exécuter manuellement :

```bash
# Build
npx nx build barades

# Serve (manuel, pas en background)
npx nx serve barades

# Tests
npx nx test barades
```

### Leçons apprises

| ❌ À éviter | ✅ À privilégier |
|-------------|------------------|
| `run_in_terminal` avec `isBackground: true` pour serveur | Commande manuelle dans terminal utilisateur |
| Création massive de fichiers en une fois | Création par petits lots avec commits intermédiaires |
| Processus longs (serve, watch) via Copilot Chat | Lancement manuel par l'utilisateur |

**Impact :** Aucune perte de code grâce aux fichiers créés avant le crash.

---

## 🗺️ Problème 2 : Tuiles Leaflet partiellement chargées

### Symptômes

- Carte Leaflet affichée avec bonnes dimensions (571x600 px)
- 3 markers présents et cliquables
- ❌ Seulement 2 tuiles OpenStreetMap chargées (au lieu de ~12 attendues)
- Reste de la carte affichée en gris

**Screenshot utilisateur :**
> "Je vois la carte mais seulement 2 tuiles au lieu de toute la carte"

### Analyse

**Timeline des tentatives :**

#### Tentative 1 : Passage de `*ngIf` à `[class.hidden]`

**Hypothèse :** Le container est détruit/recréé avec `*ngIf`, empêchant Leaflet de calculer les dimensions.

```html
<!-- Avant -->
<div id="map" *ngIf="mapVisible" class="locations-map"></div>

<!-- Après -->
<div id="map" [class.hidden]="!mapVisible" class="locations-map"></div>
```

```css
.locations-map.hidden {
  display: none;
}
```

**Résultat :** ❌ Pas d'amélioration

---

#### Tentative 2 : Hauteur CSS fixe

**Hypothèse :** Hauteur calculée dynamique (`calc(100vh - 150px)`) pose problème.

```css
/* Avant */
.locations-map {
  height: calc(100vh - 150px);
}

/* Après */
.locations-map {
  height: 600px;  /* Hauteur fixe */
}
```

**Logs de vérification :**
```typescript
console.log('[LocationsList] Container dimensions:', container.clientWidth, container.clientHeight);
// → Output: 571 600 ✅
```

**Résultat :** ❌ Pas d'amélioration (mais dimensions confirmées correctes)

---

#### Tentative 3 : Timing d'initialisation

**Hypothèse :** Leaflet s'initialise avant que le container soit visible/stable.

```typescript
// Avant
ngAfterViewInit() {
  this.initMap();
}

// Après
ngAfterViewInit() {
  setTimeout(() => this.initMap(), 100);
}
```

**Augmentation du délai :**
```typescript
setTimeout(() => this.initMap(), 500);  // 100ms → 500ms
```

**Résultat :** ❌ Pas d'amélioration

---

#### Tentative 4 : `invalidateSize()` après ajout tuiles

**Hypothèse :** Leaflet ne recalcule pas après ajout des tuiles.

```typescript
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '...',
  maxZoom: 19
}).addTo(this.map);

console.log('[LocationsList] Tiles added');
this.map.invalidateSize();  // ✅ Ajouté
```

**Résultat :** ❌ Pas d'amélioration

---

#### Tentative 5 : Logs de debugging extensifs

**Ajout de logs à chaque étape :**

```typescript
initMap() {
  const container = document.getElementById('map');
  if (!container) {
    console.error('[LocationsList] Map container not found');
    return;
  }

  console.log('[LocationsList] Container found');
  console.log('[LocationsList] Container dimensions:', container.clientWidth, container.clientHeight);
  
  this.map = L.map('map').setView([50.8503, 4.3517], 12);
  console.log('[LocationsList] Map initialized');
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '...',
    maxZoom: 19
  }).addTo(this.map);
  console.log('[LocationsList] Tiles added');
  
  this.addMarkers();
}

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
```

**Output console :**
```
[LocationsList] Container found
[LocationsList] Container dimensions: 571 600
[LocationsList] Map initialized
[LocationsList] Tiles added
[LocationsList] Adding markers for 3 locations
[LocationsList] Adding marker 1: Outpost Brussels 50.8415 4.3791
[LocationsList] Marker 1 added
[LocationsList] Adding marker 2: Gamer's Tavern 50.8467 4.3525
[LocationsList] Marker 2 added
[LocationsList] Adding marker 3: The Dice Hub 50.8353 4.3389
[LocationsList] Marker 3 added
[LocationsList] All markers added
```

**Résultat :** ✅ Logs OK, mais tuiles toujours partielles ❌

---

### Hypothèses restantes (non testées)

#### H1 : Problème réseau CDN OpenStreetMap

**À vérifier dans DevTools Network :**
- Est-ce que les requêtes vers `tile.openstreetmap.org` échouent ?
- Y a-t-il des erreurs CORS ?
- Les tuiles sont-elles en cache avec statut 304 ?

**Test à faire :**
```typescript
const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '...',
  maxZoom: 19
});

tileLayer.on('tileerror', (error) => {
  console.error('[LocationsList] Tile error:', error);
});

tileLayer.on('tileload', (event) => {
  console.log('[LocationsList] Tile loaded:', event);
});

tileLayer.addTo(this.map);
```

#### H2 : Problème de z-index ou CSS

**À vérifier :**
```css
.locations-map {
  position: relative;
  z-index: 1;
}

/* S'assurer qu'aucun élément ne chevauche */
.locations-map * {
  box-sizing: border-box;
}
```

#### H3 : Forcer le reload des tuiles

**Code à tester :**
```typescript
ngAfterViewInit() {
  setTimeout(() => {
    this.initMap();
    
    // Force redraw après 1 seconde
    setTimeout(() => {
      this.map?.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          layer.redraw();
        }
      });
    }, 1000);
  }, 100);
}
```

#### H4 : Utiliser un CDN alternatif

**Autres fournisseurs de tuiles :**
```typescript
// CartoDB
'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

// Mapbox (nécessite API key)
'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}'

// Stamen
'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png'
```

---

### Impact utilisateur

| Fonctionnalité | Status | Impact |
|----------------|--------|--------|
| Affichage de la carte | ✅ | Dimensions correctes |
| Markers | ✅ | 3 markers visibles et cliquables |
| Popups | ✅ | Informations complètes affichées |
| Tuiles | ⚠️ | 2/12 tuiles (visuel peu esthétique) |
| Toggle map/list | ✅ | Fallback vers liste fonctionne |

**Décision produit :** 
- ✅ Fonctionnalité utilisable (markers cliquables)
- ⚠️ Problème visuel mais non bloquant
- 📝 Documenté pour résolution Jour 4+
- 💡 Fallback liste disponible

---

## 🧪 Problème 3 : Tests Footer initiaux vides

### Symptômes

```bash
npx nx test barades
```

**Erreur :**
```
FAIL  apps/frontend/src/app/core/navigation/footer.spec.ts
  ● FooterComponent › has no tests

    Your test suite must contain at least one test.
```

### Analyse

**Code initial :**
```typescript
describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
  });

  // ❌ Aucun test it() défini
});
```

**Cause :** Jest exige au moins un test `it()` dans chaque `describe()`.

### Solution

**Ajout de 4 tests :**

```typescript
it('should create', () => {
  expect(component).toBeTruthy();
});

it('should display current year in copyright', () => {
  fixture.detectChanges();
  const compiled = fixture.nativeElement as HTMLElement;
  const currentYear = new Date().getFullYear();
  const copyrightText = compiled.querySelector('.footer-copyright')?.textContent;
  
  expect(copyrightText).toContain(currentYear.toString());
});

it('should render 4 footer sections', () => {
  fixture.detectChanges();
  const compiled = fixture.nativeElement as HTMLElement;
  const sections = compiled.querySelectorAll('.footer-section');
  
  expect(sections.length).toBe(4);
});

it('should render social links', () => {
  fixture.detectChanges();
  const compiled = fixture.nativeElement as HTMLElement;
  const socialLinks = compiled.querySelectorAll('.social-link');
  
  expect(socialLinks.length).toBe(4);
});
```

**Résultat :** ✅ 22/22 tests passing

---

## 🔄 Problème 4 : Erreur Git "pathspec did not match"

### Symptômes

```bash
git add apps/frontend/src/app/core/navigation/footer.ts \
  apps/frontend/src/app/core/navigation/footer.ts \
  apps/frontend/src/app/core/navigation/footer.html \
  # ...
```

**Erreur :**
```
fatal: pathspec 'apps/frontend/src/app/core/navigation/footer.ts' did not match any files
```

### Analyse

**Cause :** Commande `git add` dupliquée avec le même fichier deux fois.

**Context :** Agent a généré une commande avec répétition :
```bash
git add apps/frontend/src/app/core/navigation/footer.ts \
  apps/frontend/src/app/core/navigation/footer.ts \  # ❌ Répété
  apps/frontend/src/app/core/navigation/footer.html \
  # ...
```

### Solution

**Utilisateur a re-lancé la commande proprement :**
```bash
git add apps/frontend/src/app/core/navigation/footer.ts \
  apps/frontend/src/app/core/navigation/footer.html \
  apps/frontend/src/app/core/navigation/footer.css \
  apps/frontend/src/app/core/navigation/footer.spec.ts \
  apps/frontend/src/app/core/layouts/app-layout.ts \
  apps/frontend/src/app/core/layouts/app-layout.html \
  apps/frontend/src/app/core/layouts/app-layout.css

git commit -m "feat(frontend): add Footer component with 4 sections and social links"
```

**Résultat :** ✅ Commit 4417bdb créé avec succès

---

## 📊 Résumé des problèmes

| # | Problème | Gravité | Status | Solution |
|---|----------|---------|--------|----------|
| 1 | Crash VSCode | ⚠️ Moyenne | ✅ Résolu | Éviter background terminals, créer par lots |
| 2 | Tuiles Leaflet partielles | ⚠️ Moyenne | ⏸️ En cours | 5 tentatives, debugging extensif, documenté |
| 3 | Tests Footer vides | 🔴 Haute | ✅ Résolu | Ajout de 4 tests it() |
| 4 | Git pathspec error | 🟡 Faible | ✅ Résolu | Commande sans duplication |

---

## 🔧 Outils de debugging utilisés

### 1. Console logs

```typescript
console.log('[LocationsList] Container dimensions:', container.clientWidth, container.clientHeight);
console.log('[LocationsList] Map initialized');
console.log('[LocationsList] Tiles added');
```

**Avantages :**
- ✅ Rapide à implémenter
- ✅ Trace le flow d'exécution
- ✅ Vérifie les valeurs à chaque étape

### 2. Browser DevTools

**Network tab :**
- Vérifier les requêtes vers OpenStreetMap
- Statuts HTTP (200, 404, CORS errors)

**Console tab :**
- Voir les logs `[LocationsList]`
- Erreurs JavaScript

**Elements tab :**
- Inspecter le DOM généré
- Vérifier les dimensions réelles

### 3. Git diff

```bash
git diff HEAD~1 HEAD
git log --oneline -5
```

**Vérifier :**
- Fichiers modifiés vs attendus
- Commits précédents

---

## 📝 Documentation du debugging

**Tous les logs ajoutés sont préfixés `[LocationsList]` pour faciliter le filtrage :**

```typescript
console.log('[LocationsList] Container found');
console.log('[LocationsList] Map initialized');
console.log('[LocationsList] Tiles added');
console.log('[LocationsList] Adding markers for', this.locations.length, 'locations');
console.log(`[LocationsList] Adding marker ${index + 1}:`, location.name);
```

**Format standardisé :**
1. Préfixe du composant entre crochets
2. Message descriptif
3. Données contextuelles si pertinent

**Bénéfices :**
- ✅ Filtrage console : `/LocationsList/`
- ✅ Compréhension rapide du flow
- ✅ Debug par étapes

---

## 🎯 Prochaines actions (Jour 4+)

### Pour Leaflet

1. ✅ Tester event listeners `tileerror` et `tileload`
2. ✅ Vérifier Network DevTools (CORS, 404, cache)
3. ✅ Essayer CDN alternatif (CartoDB, Stamen)
4. ✅ Tester `layer.redraw()` après 1 seconde
5. ✅ Comparer avec exemple Leaflet minimal (hors Angular)

### Pour VSCode stabilité

1. ✅ Créer fichiers par petits lots
2. ✅ Commiter fréquemment (après chaque fonctionnalité)
3. ✅ Éviter `isBackground: true` pour serveurs dev
4. ✅ Privilégier commandes manuelles utilisateur

### Pour les tests

1. ✅ Toujours ajouter au moins un test `it()` dans `describe()`
2. ✅ Tester après chaque création de composant
3. ✅ Utiliser `--watch` mode pendant développement

---

## 🔗 Navigation

- [← Retour à Tests](rapport-jour3-06-tests.md)
- [→ Retour à l'index](rapport-jour3-00-index.md)
