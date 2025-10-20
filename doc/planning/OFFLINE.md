# Gestion du Mode Hors-ligne (Offline)

Pour garantir une expérience utilisateur fluide et résiliente, même en cas de connectivité Internet faible ou intermittente, l'application Barades implémente une stratégie de mise en cache multi-niveaux. L'objectif est de servir le contenu essentiel instantanément depuis le cache local, tout en assurant une synchronisation intelligente des données en arrière-plan.

Notre approche repose sur la combinaison de deux mécanismes principaux :

1.  Un **Service Worker** pour la mise en cache des ressources de l'application (assets) et des données API.
2.  Un **cache mémoire (in-memory)** pour optimiser la session de navigation en cours et éviter les appels réseau redondants.

---

## 1\. Service Worker (via `@angular/pwa`)

La base de notre capacité hors-ligne est le Service Worker fourni par le module `@angular/pwa`. Il agit comme un proxy réseau, interceptant les requêtes HTTP et servant les ressources depuis un cache local avant de solliciter le réseau.

La configuration est gérée dans le fichier `ngsw-config.json`, qui définit des groupes de données (`dataGroups`) avec des stratégies de cache distinctes.

### Stratégie `freshness` (Données dynamiques)

Pour les données qui changent fréquemment et nécessitent d'être à jour, nous utilisons la stratégie `freshness`.

- **Cas d'usage** : Listes de sessions, groupes, lieux (`/api/sessions`, `/api/groups`, etc.).
- **Comportement** :
  1.  Le Service Worker tente d'abord de récupérer les données depuis le **réseau**.
  2.  Si le réseau est indisponible ou ne répond pas dans le délai imparti (`timeout`), il sert la version la plus récente présente dans le **cache**.
- **Objectif** : Privilégier la fraîcheur des données, tout en assurant un affichage en cas de problème réseau.

### Stratégie `performance` (Données statiques)

Pour les données considérées comme plus statiques (listes de référence), nous privilégions la stratégie `performance`.

- **Cas d'usage** : Listes des systèmes de jeu, listes de villes (`/api/game-systems`, `/api/cities`).
- **Comportement** :
  1.  Le Service Worker sert _immédiatement_ les données depuis le **cache** (chargement instantané).
  2.  En parallèle, il tente de rafraîchir ces données depuis le **réseau** en arrière-plan et met le cache à jour pour la prochaine visite.
- **Objectif** : Privilégier la vitesse de chargement et l'accès immédiat aux données.

### Exemple de configuration `ngsw-config.json`

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

---

## 2\. Cache Mémoire via `shareReplay`

Pour compléter le cache "disque" du Service Worker, nous utilisons un cache en mémoire (RAM) au sein des services Angular.

- **Objectif** : Éviter les appels réseau multiples pour la _même_ donnée au cours d'une _même_ session de navigation.
- **Implémentation** : L'opérateur RxJS `shareReplay({ bufferSize: 1, refCount: true })` est appliqué aux Observables retournant les données des appels HTTP. Il conserve la dernière réponse émise et la sert immédiatement à tout nouvel abonné.

### Mécanisme d'invalidation du cache

Un cache mémoire doit pouvoir être invalidé, par exemple lorsqu'un utilisateur crée ou modifie une ressource (comme une nouvelle session). Pour cela, nous combinons `shareReplay` avec un `BehaviorSubject` qui sert de déclencheur de rafraîchissement.

L'appel à `invalidateCache()` (par exemple, après une requête POST ou PUT réussie) force l'observable `sessions$` à s'exécuter à nouveau, mettant ainsi à jour le cache partagé.

### Exemple d'implémentation (Service Angular)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap, shareReplay } from 'rxjs/operators';
import { Session } from './session.model';

@Injectable({ providedIn: 'root' })
export class SessionsService {
  // 1. Sujet pour déclencher le rafraîchissement
  private refresh$ = new BehaviorSubject<void>(undefined);

  // 2. Observable mis en cache
  private sessions$: Observable<Session[]> = this.refresh$.pipe(
    // 3. switchMap annule la requête précédente et lance la nouvelle
    switchMap(() => this.http.get<Session[]>('/api/sessions')),
    // 4. Partage la dernière réponse avec tous les abonnés
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private http: HttpClient) {}

  /**
   * Récupère les sessions (depuis le cache mémoire ou le réseau).
   */
  getSessions(): Observable<Session[]> {
    return this.sessions$;
  }

  /**
   * Force le rafraîchissement du cache des sessions.
   * (À appeler après une création, modification ou suppression)
   */
  invalidateCache(): void {
    this.refresh$.next();
  }
}
```

---

## 3\. Validation du Comportement Hors-ligne

Pour tester l'implémentation du mode hors-ligne :

1.  Générez un build de production de l'application :
    ```bash
    npx nx build frontend --configuration=production
    ```
2.  Servez les fichiers statiques générés avec un serveur HTTP local (le Service Worker ne s'active pas avec `nx serve`) :
    ```bash
    npx http-server dist/apps/frontend -p 4200
    ```
3.  Ouvrez l'application dans votre navigateur (ex: `http://localhost:4200`).
4.  Ouvrez les Outils de Développement (DevTools) et accédez à l'onglet **Application**.
5.  Vérifiez dans **Service Workers** que le script `ngsw-worker.js` est bien activé et en cours d'exécution.
6.  Cochez la case **Offline** pour simuler une absence de connexion.
7.  Naviguez dans l'application. Les pages et les données mises en cache (via les stratégies `freshness` et `performance`) doivent rester accessibles.

---

## 4\. Évolutions Futures (IndexedDB)

Pour des besoins de persistance de données plus complexes (par exemple, la sauvegarde de brouillons créés entièrement hors-ligne), l'utilisation d'**IndexedDB** est envisagée.

Cette base de données intégrée au navigateur offre un contrôle plus fin et une capacité de stockage supérieure au cache du Service Worker. Son intégration est planifiée pour une phase ultérieure du projet, en raison de sa complexité d'implémentation accrue.
