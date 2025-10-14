# Jour 3 - Services Angular

[← Vue d'ensemble](./rapport-jour3-01-overview.md) | [→ Composants](./rapport-jour3-03-components.md)

---

## 📦 Architecture des services

Les services Angular sont des **singletons** injectables qui encapsulent la logique de communication avec l'API backend. Ils utilisent le **HttpClient** d'Angular avec le **fetch API** pour les requêtes HTTP.

---

## 🔧 Configuration HttpClient

### 1. Activation dans `app.config.ts`

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withFetch()), // ✅ Activation HttpClient avec fetch API
  ],
};
```

**Justification :**
- `withFetch()` utilise l'API native `fetch()` au lieu de `XMLHttpRequest`
- Meilleure performance
- Compatible avec les Service Workers (PWA)

### 2. Configuration de l'environnement

**`apps/frontend/src/environments/environment.ts`**

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

**`apps/frontend/src/environments/environment.prod.ts`**

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-url.onrender.com/api' // À configurer lors du déploiement
};
```

---

## 📋 SessionsService

### Interface TypeScript

```typescript
export interface Session {
  id: string;
  game: string;
  title: string;
  description: string;
  date: string;  // ISO 8601 date string
  recurrenceRule: string | null;
  recurrenceEndDate: string | null;
  online: boolean;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'OPEN';
  playersMax: number;
  playersCurrent: number;
  tagColor: 'RED' | 'GREEN' | 'BLUE' | 'PURPLE' | 'GRAY';
  createdAt: string;
  updatedAt: string;
  hostId: string;
  locationId: string | null;
  
  // Relations Prisma
  host?: {
    id: string;
    username: string;
    avatar: string | null;
  };
  location?: {
    id: string;
    name: string;
    address: string | null;
    city: string;
  };
  reservations?: Array<{
    id: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    user: {
      id: string;
      username: string;
      avatar: string | null;
    };
  }>;
}
```

### Implémentation du service

**`apps/frontend/src/app/core/services/sessions.service.ts`**

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'  // Service singleton au niveau racine
})
export class SessionsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/sessions`;

  /**
   * Récupère toutes les sessions avec leurs relations
   * GET /api/sessions
   */
  getSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(this.apiUrl);
  }

  /**
   * Récupère une session par ID
   * GET /api/sessions/:id
   */
  getSession(id: string): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée une nouvelle session (à implémenter Jour 4)
   */
  createSession(session: Partial<Session>): Observable<Session> {
    return this.http.post<Session>(this.apiUrl, session);
  }

  /**
   * Met à jour une session existante (à implémenter Jour 4)
   */
  updateSession(id: string, session: Partial<Session>): Observable<Session> {
    return this.http.patch<Session>(`${this.apiUrl}/${id}`, session);
  }

  /**
   * Supprime une session (à implémenter Jour 4)
   */
  deleteSession(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

**Points clés :**
- ✅ `inject()` au lieu de constructor injection (Angular moderne)
- ✅ Typage fort avec `Observable<Session[]>`
- ✅ Utilisation de `environment.apiUrl` pour la configuration
- ✅ Méthodes POST/PATCH/DELETE implémentées (validation Zod à ajouter Jour 4)

---

## 📍 LocationsService

### Interface TypeScript

```typescript
export interface Location {
  id: string;
  name: string;
  address: string | null;
  city: string;
  type: 'GAME_STORE' | 'CAFE' | 'BAR' | 'COMMUNITY_CENTER' | 'PRIVATE' | 'OTHER';
  rating: number;
  amenities: string[];  // Array de services (WiFi, Food, etc.)
  capacity: number | null;
  openingHours: Record<string, string> | null;  // { "monday": "10:00-22:00", ... }
  icon: string;
  lat: number;  // Latitude pour Leaflet
  lon: number;  // Longitude pour Leaflet
  website: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Implémentation

**`apps/frontend/src/app/core/services/locations.service.ts`**

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/locations`;

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(this.apiUrl);
  }

  getLocation(id: string): Observable<Location> {
    return this.http.get<Location>(`${this.apiUrl}/${id}`);
  }

  // CRUD methods stubbed for Day 4
  createLocation(_data: Partial<Location>): Observable<Location> {
    throw new Error('Not implemented yet');
  }

  updateLocation(_id: string, _data: Partial<Location>): Observable<Location> {
    throw new Error('Not implemented yet');
  }

  deleteLocation(_id: string): Observable<void> {
    throw new Error('Not implemented yet');
  }
}
```

**Particularités :**
- ✅ Gère les coordonnées GPS (lat/lon) pour Leaflet
- ✅ `openingHours` typé comme `Record<string, string>`
- ✅ `amenities` typé comme `string[]` (array JSON)

---

## 👥 GroupsService

### Interface TypeScript

```typescript
export interface Group {
  id: string;
  name: string;
  description: string;
  playstyle: 'COMPETITIVE' | 'CASUAL' | 'STORY_DRIVEN' | 'SANDBOX';
  isRecruiting: boolean;
  maxMembers: number | null;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  
  // Relations Prisma
  creator?: {
    id: string;
    username: string;
    avatar: string | null;
  };
  _count?: {
    members: number;  // Count agrégé par Prisma
  };
}
```

### Implémentation

**`apps/frontend/src/app/core/services/groups.service.ts`**

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/groups`;

  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.apiUrl);
  }

  getGroup(id: string): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${id}`);
  }

  // CRUD methods stubbed for Day 4
  createGroup(_data: Partial<Group>): Observable<Group> {
    throw new Error('Not implemented yet');
  }

  updateGroup(_id: string, _data: Partial<Group>): Observable<Group> {
    throw new Error('Not implemented yet');
  }

  deleteGroup(_id: string): Observable<void> {
    throw new Error('Not implemented yet');
  }
}
```

**Particularités :**
- ✅ `_count.members` pour afficher le nombre de membres
- ✅ `isRecruiting` pour le statut d'ouverture du groupe
- ✅ `playstyle` pour catégoriser les groupes

---

## 🔄 Gestion des erreurs

Tous les services utilisent les **Observables RxJS** qui permettent une gestion élégante des erreurs :

```typescript
this.sessionsService.getSessions().subscribe({
  next: (data) => {
    this.sessions = data;
    this.loading = false;
  },
  error: (err) => {
    console.error('Error loading sessions:', err);
    this.error = 'Impossible de charger les sessions. Veuillez réessayer.';
    this.loading = false;
  }
});
```

**Avantages :**
- ✅ Séparation claire entre succès et échec
- ✅ Messages d'erreur utilisateur-friendly
- ✅ État de chargement géré proprement
- ✅ Possibilité de retry automatique (RxJS operators)

---

## 📊 Comparaison avec le prototype

| Aspect | Prototype HTML/JS | Services Angular |
|--------|-------------------|------------------|
| **Requêtes HTTP** | `fetch()` natif | `HttpClient` |
| **Typage** | ❌ Aucun | ✅ TypeScript strict |
| **Gestion async** | `async/await` | `Observable` (RxJS) |
| **État global** | Variables globales | Services singleton |
| **Tests** | ❌ Aucun | ✅ Jest + mocking |
| **Réutilisabilité** | ❌ Faible | ✅ Forte (injection) |

---

## 🔗 Navigation

- [← Retour à Vue d'ensemble](./rapport-jour3-01-overview.md)
- [→ Continuer avec Composants](./rapport-jour3-03-components.md)
