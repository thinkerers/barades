# Fix: Dashboard bloqué sur "Chargement des données..."

## Date
9 janvier 2026

## Problème
Le dashboard restait bloqué sur l'état de chargement ("Chargement des données...") même après que les données API soient reçues avec succès.

### Symptômes
- Le spinner de chargement restait affiché indéfiniment
- Les données étaient bien récupérées (visible dans les logs console)
- Le `finally` block s'exécutait **avant** la complétion du `forkJoin`

### Logs observés
```
[Dashboard] Starting loadDashboardData
[Dashboard] Starting pendingTasks.run
[Dashboard] Inside pendingTasks.run, calling forkJoin
[Dashboard] Finally block reached          ← Exécuté trop tôt !
[Dashboard] Loading timeout triggered
[Dashboard] forkJoin completed with data   ← Données arrivées après
```

## Cause racine
**`PendingTasks.run()` retourne `void`, pas une `Promise`.**

Le code original avait cette structure :

```typescript
async loadDashboardData(): Promise<void> {
  try {
    await this.pendingTasks.run(async () => {
      const data = await firstValueFrom(forkJoin({...}));
      // traitement des données
    });
  } finally {
    this.loading.set(false);  // ← Exécuté immédiatement !
  }
}
```

Le `await this.pendingTasks.run(...)` n'attendait pas la fin du callback async car `run()` retourne `void`. Le `finally` s'exécutait donc immédiatement, mettant `loading` à `false` avant que les données ne soient traitées.

## Solution
Déplacer le `try/catch/finally` **à l'intérieur** du callback de `pendingTasks.run()` :

```typescript
async loadDashboardData(): Promise<void> {
  const loadingTimeout = setTimeout(() => {
    this.loading.set(true);
  }, 100);

  this.error.set(null);

  await this.pendingTasks.run(async () => {
    try {
      const data = await firstValueFrom(forkJoin({...}));
      clearTimeout(loadingTimeout);
      // traitement des données
    } catch (err) {
      clearTimeout(loadingTimeout);
      console.error('Error loading dashboard data:', err);
      this.error.set('Impossible de charger les données du dashboard');
    } finally {
      this.loading.set(false);  // ← Maintenant exécuté après forkJoin
    }
  });
}
```

## Fichiers modifiés
- `apps/frontend/src/app/features/dashboard/dashboard-page.ts`

## Leçon apprise
Quand on utilise `PendingTasks.run()` d'Angular avec des opérations async :

1. **Ne pas** mettre de logique dépendante dans un `try/finally` externe
2. **Toujours** mettre la gestion d'erreur et le cleanup **à l'intérieur** du callback
3. `PendingTasks.run()` est utilisé pour le SSR hydration tracking, pas pour synchroniser des Promises

## Pattern recommandé
```typescript
// ✅ Correct
await this.pendingTasks.run(async () => {
  try {
    // opérations async
  } catch (err) {
    // gestion d'erreur
  } finally {
    // cleanup (loading state, etc.)
  }
});

// ❌ Incorrect
try {
  await this.pendingTasks.run(async () => {
    // opérations async
  });
} finally {
  // Ce code s'exécute AVANT la fin du callback !
}
```

## Références
- [Angular PendingTasks API](https://angular.dev/api/core/PendingTasks)
- Autres usages dans le projet : `home-page.ts`, `sessions-list.ts`, `groups-list.ts`
