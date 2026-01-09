# Refactor: Suppression du badge de filtres actifs

**Date**: 9 janvier 2026  
**Type**: UI Refactoring  
**Fichiers modifiés**:
- `apps/frontend/src/app/features/locations/locations-list.html`

---

## Changement

Suppression du badge affichant le nombre de filtres actifs dans la carte de filtres de la page Lieux.

### Avant

```html
<div class="locations-filters-card__title">
  <mat-icon aria-hidden="true">filter_alt</mat-icon>
  <div class="locations-filters-card__title-text">
    <h1>Lieux de jeu</h1>
    <p>Trouvez l'endroit idéal pour vos sessions</p>
  </div>
  @if (getActiveFiltersCount() > 0) {
  <span
    class="locations-filters-card__badge"
    aria-label="Nombre de filtres actifs"
  >
    {{ getActiveFiltersCount() }}
  </span>
  }
</div>
```

### Après

```html
<div class="locations-filters-card__title">
  <mat-icon aria-hidden="true">filter_alt</mat-icon>
  <div class="locations-filters-card__title-text">
    <h1>Lieux de jeu</h1>
    <p>Trouvez l'endroit idéal pour vos sessions</p>
  </div>
</div>
```

---

## Raison

Simplification de l'interface utilisateur. Le badge était redondant car :
- Les filtres actifs sont visuellement identifiables (checkboxes cochées, champ de recherche rempli)
- Le bouton "Réinitialiser" indique déjà s'il y a des filtres actifs (activé/désactivé)

---

## Impact

- **HTML** : Suppression du bloc `@if` avec le `<span>` badge
- **CSS** : Aucun style orphelin (le badge n'avait pas de styles définis dans `locations-list.css`)
- **TypeScript** : La méthode `getActiveFiltersCount()` est conservée car elle est toujours utilisée pour désactiver le bouton "Réinitialiser"
- **Tests** : Les tests unitaires de `getActiveFiltersCount()` restent valides et pertinents

---

## Code conservé

```html
<button
  type="button"
  class="locations-filters-card__reset"
  (click)="resetFilters()"
  [disabled]="getActiveFiltersCount() === 0"
>
  <mat-icon aria-hidden="true">refresh</mat-icon>
  Réinitialiser
</button>
```

Le bouton "Réinitialiser" utilise toujours `getActiveFiltersCount()` pour sa logique de désactivation.
