Pour rendre la navigation plus fluide, notre application doit être en mesure de stocker des données localement pour pouvoir afficher les pages même lorsque la connectivité internet n'est pas bonne. Pour cela, on implémente plusieurs stratégies:

1. **Service Worker via `@angular/pwa`** : C'est la fondation idéale. La configuration ngsw-config.json avec la stratégie `freshness` pour les données API est parfaite pour votre cas d'usage (sessions, groupes, lieux).

2. **`shareReplay` pour le cache mémoire** : Très bon choix pour éviter les appels réseau redondants pendant une session. C'est léger et efficace.

3. **IndexedDB en phase 3** : Sage décision de le garder pour plus tard. C'est plus complexe et pas toujours nécessaire au début.

## 🔧 Suggestions d'Amélioration

### Pour le Service Worker (ngsw-config.json)

Ajoutez une stratégie `performance` pour les ressources statiques qui changent rarement :

```json
{
  "dataGroups": [
    {
      "name": "api-freshness",
      "urls": ["/api/sessions", "/api/groups", "/api/locations"],
      "cacheConfig": {
        "maxSize": 100,
        "maxAge": "3d",
        "timeout": "5s",
        "strategy": "freshness"
      }
    },
    {
      "name": "api-performance",
      "urls": ["/api/game-systems", "/api/cities"],
      "cacheConfig": {
        "maxSize": 50,
        "maxAge": "7d",
        "strategy": "performance"
      }
    }
  ]
}
```

**Pourquoi** : Les données comme la liste des systèmes de jeu ou des villes changent rarement. La stratégie `performance` sert d'abord le cache (charge instantanée) puis rafraîchit en arrière-plan.

### Pour `shareReplay`

Ajoutez un mécanisme d'invalidation manuelle :

```typescript
import { BehaviorSubject, switchMap } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

export class SessionsService {
  private refresh$ = new BehaviorSubject<void>(undefined);

  private sessions$ = this.refresh$.pipe(
    switchMap(() => this.http.get<Session[]>('/api/sessions')),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  getSessions() {
    return this.sessions$;
  }

  // Permet de forcer un rafraîchissement (ex: après création d'une session)
  invalidateCache() {
    this.refresh$.next();
  }
}
```

**Pourquoi** : Quand un utilisateur crée/modifie une session, vous voulez rafraîchir le cache sans recharger la page.

### Pour le Zoneless

Dans votre spec `home-page.spec.ts`, vous créez des fixtures fraîches pour tester les états loading/error. C'est correct, mais avec le Service Worker + `shareReplay`, ces états seront très rares en production (données servies instantanément du cache).

Considérez plutôt de tester :

- Le **stale-while-revalidate** : données affichées du cache pendant que le réseau se met à jour en arrière-plan
- La **notification de mise à jour** : prévenir l'utilisateur quand de nouvelles données arrivent

## 📋 Plan d'Action Affiné

1. **Installez `@angular/pwa`** :

   ```bash
   npx nx g @angular/pwa:ng-add --project=frontend
   ```

2. **Configurez ngsw-config.json** avec les deux stratégies (freshness + performance)

3. **Ajoutez `shareReplay` + invalidation** dans vos services principaux

4. **Testez hors-ligne** :

   - Build production : `npx nx build frontend --configuration=production`
   - Servez avec un serveur HTTP : `npx http-server dist/apps/frontend -p 4200`
   - Ouvrez DevTools > Application > Service Workers
   - Activez "Offline" et naviguez

5. **(Optionnel) Indicateur de fraîcheur** : Affichez un badge discret quand les données viennent du cache et sont en cours de rafraîchissement

Avec cette approche, vous aurez une PWA solide qui charge instantanément du cache et se synchronise intelligemment en arrière-plan. Parfait pour les connexions intermittentes ! 🚀

---

Plan cohérent : combiner service worker (`@angular/pwa` avec stratégies freshness/performance), cache mémoire via `shareReplay` + invalidation, puis IndexedDB pour persistance. Bonne base pour PWA hors-ligne sans complexifier prématurément.

---

Cree un commit pour faire une snapshot du projet, puis met en place le plan
