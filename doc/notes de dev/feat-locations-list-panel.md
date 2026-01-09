# Feature: Liste des lieux dans le panneau latéral

**Date**: 9 janvier 2026  
**Type**: Feature / UX Improvement  
**Commit**: `3eb29ff`  
**Fichiers modifiés**:
- `apps/frontend/src/app/features/locations/locations-list.html`

---

## Contexte

Le panneau latéral de la page Lieux affichait un placeholder statique ("Sélectionnez un lieu sur la carte") quand aucun lieu n'était sélectionné. Cette approche obligeait l'utilisateur à interagir uniquement via la carte.

### Historique

- **Commit `22b3206`** : Design "map fullscreen" avec overlays flottants
- **Commit `4d1bb48`** : Tentative d'ajout d'une liste (design sidebar classique)
- **Commit `9a0563b`** : Revert immédiat (38s après) sans explication
- Le CSS `.location-card` et `.location-cards` existait mais n'était plus utilisé

---

## Problème

L'utilisateur voyait un panneau avec :
- Une pill "Liste des lieux (2/2)" indiquant le nombre de lieux
- Un titre "Détails du lieu"
- Un placeholder invitant à cliquer sur la carte

**Incohérence UX** : Le panneau suggère une "liste" mais n'en affiche aucune.

---

## Solution implémentée

Afficher la liste scrollable des lieux quand aucun lieu n'est sélectionné.

### Comportement

| État | Contenu du panneau |
|------|-------------------|
| Aucun lieu sélectionné | Liste des `location-card` cliquables |
| Lieu sélectionné | Détails du lieu (carte détaillée) |
| Aucun résultat (filtres) | Message "Aucun lieu trouvé" |

### Titre dynamique

```html
<h2 class="locations-details__heading">
  {{ selectedLocation ? 'Détails du lieu' : 'Lieux disponibles' }}
</h2>
```

---

## Code ajouté

```html
@else {
<!-- Liste des lieux (quand aucun lieu sélectionné) -->
<div class="location-cards">
  @for (location of filteredLocations; track location.id) {
  <article
    class="location-card"
    [class.selected]="selectedLocationId === location.id"
    (click)="onLocationClick(location.id)"
    role="button"
    tabindex="0"
    (keydown.enter)="onLocationClick(location.id)"
    (keydown.space)="onLocationClick(location.id)"
  >
    <header class="location-header">
      <h3>{{ location.name }}</h3>
      <span class="location-type">{{ getLocationTypeLabel(location.type) }}</span>
    </header>
    <!-- ... contenu de la carte ... -->
  </article>
  } @empty {
  <div class="locations-list__empty">
    <mat-icon>search_off</mat-icon>
    <div>
      <h3>Aucun lieu trouvé</h3>
      <p>Essayez de modifier vos filtres de recherche.</p>
    </div>
  </div>
  }
</div>
}
```

---

## Détails d'implémentation

### Accessibilité
- `role="button"` et `tabindex="0"` pour navigation clavier
- `(keydown.enter)` et `(keydown.space)` pour activation clavier

### Performance
- `track location.id` pour optimiser le rendu de la liste
- Amenities limitées à 3 avec indicateur `+N` pour éviter le débordement

### CSS réutilisé
Le CSS existant dans `locations-list.css` a été réutilisé :
- `.location-cards` : conteneur flex
- `.location-card` : carte avec hover et selected states
- `.location-header`, `.location-info`, `.amenities`, `.amenity-tag`
- `.locations-list__empty` : état vide

---

## Revert

Si ce changement pose problème :

```bash
git revert 3eb29ff
```

Ou pour revenir au placeholder statique, remplacer le bloc `@else { ... }` par :

```html
@else {
<div class="locations-details__placeholder">
  <mat-icon aria-hidden="true">touch_app</mat-icon>
  <div>
    <h3>Sélectionnez un lieu sur la carte</h3>
    <p>Cliquez sur un indicateur pour afficher ses informations.</p>
  </div>
</div>
}
```

---

## Impact

- **UX** : L'utilisateur peut maintenant parcourir les lieux via le panneau OU la carte
- **Cohérence** : La pill "Liste des lieux" correspond maintenant à une vraie liste
- **Mobile** : La liste est particulièrement utile sur mobile où la carte est plus difficile à manipuler
