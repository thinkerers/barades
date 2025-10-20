# Guide de Migration HTML → Angular

**Objectif** : Réutiliser au maximum le prototype HTML dans la nouvelle architecture Angular

---

## 🎯 Stratégie de Migration

### Principe : Copy-Paste Intelligent

Au lieu de refaire from scratch, on va :
1. **Découper** le HTML monolithique en composants Angular
2. **Réutiliser** le CSS Tailwind tel quel
3. **Migrer** le JavaScript vers des services TypeScript
4. **Connecter** à l'API NestJS au lieu du localStorage

**Gain de temps estimé** : 60-70% vs développement from scratch

---

## 📦 Mapping HTML → Angular Components

### Structure Cible

```
apps/frontend/src/app/
├── core/
│   ├── services/
│   │   ├── auth.service.ts           # Migration de la logique auth JS
│   │   ├── storage.service.ts        # Migration localStorage → API
│   │   └── api.service.ts            # HttpClient wrapper
│   ├── guards/
│   │   └── auth.guard.ts             # Protection des routes
│   └── interceptors/
│       └── auth.interceptor.ts       # Ajout token JWT
├── shared/
│   ├── components/
│   │   ├── header/                   # Migration du <header>
│   │   ├── footer/                   # Migration du <footer>
│   │   ├── card/                     # Migration createSessionCardHTML()
│   │   ├── modal/                    # Migration des modales
│   │   └── filter/                   # Migration des filtres
│   └── models/
│       ├── user.model.ts
│       ├── session.model.ts
│       └── location.model.ts
├── features/
│   ├── home/                         # Section #hero
│   ├── sessions/                     # Section #find-session-view
│   │   ├── sessions-list/
│   │   ├── session-detail/
│   │   └── session-card/
│   ├── locations/                    # Section #find-location-view
│   │   ├── locations-map/
│   │   └── location-card/
│   ├── groups/                       # Section #find-groups-view
│   │   ├── groups-list/
│   │   └── group-detail/
│   ├── tools/                        # Section #tools-view
│   ├── profile/                      # Section #profile-view
│   └── auth/                         # Modales login/register
│       ├── login/
│       └── register/
└── app.component.ts
```

---

## 🔄 Migration Étape par Étape

### Étape 1 : Layout (Header + Footer)

#### HTML Original (lignes 206-228)
```html
<header class="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-700">
    <nav class="container mx-auto px-4 lg:px-6 py-3">
        <div class="flex justify-between items-center">
            <a href="#/" class="text-2xl font-bold text-white tracking-wider">
                <span class="text-indigo-400">Bar</span> à Dés
            </a>
            <!-- Navigation -->
        </div>
    </nav>
</header>
```

#### Angular Component (header.component.html)
```html
<header class="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-700">
    <nav class="container mx-auto px-4 lg:px-6 py-3">
        <div class="flex justify-between items-center">
            <a routerLink="/" class="text-2xl font-bold text-white tracking-wider">
                <span class="text-indigo-400">Bar</span> à Dés
            </a>
            <div class="hidden lg:flex items-center space-x-6">
                <a routerLink="/sessions" routerLinkActive="text-indigo-400" 
                   class="text-gray-300 hover:text-indigo-400 transition">
                   Trouver une Partie
                </a>
                <a routerLink="/map" routerLinkActive="text-indigo-400"
                   class="text-gray-300 hover:text-indigo-400 transition">
                   Lieux de Jeu
                </a>
                <!-- ... autres liens -->
            </div>
            <div class="flex items-center space-x-4">
                <!-- Auth buttons ou User menu -->
                <div *ngIf="!(authService.currentUser$ | async); else userMenu">
                    <button (click)="openLoginModal()" class="btn-secondary px-4 py-2 rounded-lg">
                        Connexion
                    </button>
                    <button (click)="openRegisterModal()" class="btn-primary px-4 py-2 rounded-lg">
                        Inscription
                    </button>
                </div>
                <ng-template #userMenu>
                    <a routerLink="/profile" class="font-semibold text-white hover:text-indigo-400">
                        {{ (authService.currentUser$ | async)?.username }}
                    </a>
                    <button (click)="authService.logout()" class="btn-secondary p-2 rounded-full">
                        <mat-icon>logout</mat-icon>
                    </button>
                </ng-template>
            </div>
        </div>
    </nav>
</header>
```

#### TypeScript (header.component.ts)
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';
import { LoginComponent } from '../../features/auth/login/login.component';
import { RegisterComponent } from '../../features/auth/register/register.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(
    public authService: AuthService,
    private dialog: MatDialog
  ) {}

  openLoginModal() {
    this.dialog.open(LoginComponent, { width: '400px' });
  }

  openRegisterModal() {
    this.dialog.open(RegisterComponent, { width: '400px' });
  }
}
```

**Temps estimé** : 1h pour header + footer

---

### Étape 2 : Card Component Générique

#### JavaScript Original (lignes 1100+)
```javascript
const createSessionCardHTML = (session) => {
    const isFull = session.players_current >= session.players_max;
    const tagColors = { red: 'bg-red-800 text-red-100', /* ... */ };
    return `<div class="glass-card p-6">...</div>`;
};
```

#### Angular Component (card.component.ts)
```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type CardType = 'session' | 'location' | 'group';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="glass-card p-6 flex flex-col hover:border-indigo-500 
                transition-all duration-300 transform hover:-translate-y-1">
      
      <!-- Session Card -->
      <ng-container *ngIf="type === 'session' && data">
        <div class="flex justify-between items-start mb-4">
          <div>
            <span [class]="'tag ' + getTagColor(data.tagColor)">{{ data.game }}</span>
            <h3 class="text-xl font-bold text-white mt-2">{{ data.title }}</h3>
          </div>
          <div class="text-center">
            <img [src]="data.mjAvatar || 'https://placehold.co/48x48'" 
                 alt="Avatar du MJ" class="rounded-full mx-auto">
            <span class="text-xs text-gray-400 mt-1 block">{{ data.mj }}</span>
          </div>
        </div>
        <div class="space-y-3 text-sm text-gray-300 mb-4 flex-grow">
          <p class="flex items-center">
            <mat-icon class="w-4 h-4 mr-2 text-indigo-400">calendar_today</mat-icon>
            {{ data.date }}
          </p>
          <p class="flex items-center">
            <mat-icon class="w-4 h-4 mr-2 text-indigo-400">
              {{ data.online ? 'language' : 'place' }}
            </mat-icon>
            {{ data.location }}
          </p>
          <p class="flex items-center">
            <mat-icon class="w-4 h-4 mr-2 text-indigo-400">check_circle</mat-icon>
            Niveau : {{ data.level }}
          </p>
        </div>
        <div class="flex justify-between items-center mt-auto pt-4 border-t border-gray-700">
          <div class="flex items-center space-x-1">
            <mat-icon class="w-5 h-5 text-gray-400">group</mat-icon>
            <span class="font-semibold text-white">
              {{ isFull() ? 'COMPLET' : data.players_current + ' / ' + data.players_max + ' joueurs' }}
            </span>
          </div>
          <button 
            [class]="isFull() ? 'btn-secondary' : 'btn-primary'"
            class="px-4 py-2 rounded-lg text-sm font-semibold"
            [disabled]="isFull()"
            (click)="onAction.emit(data)">
            {{ isFull() ? 'Complet' : 'Rejoindre' }}
          </button>
        </div>
      </ng-container>

      <!-- Location Card -->
      <ng-container *ngIf="type === 'location' && data">
        <!-- Similar structure for location -->
      </ng-container>

      <!-- Group Card -->
      <ng-container *ngIf="type === 'group' && data">
        <!-- Similar structure for group -->
      </ng-container>
    </div>
  `,
  styles: []
})
export class CardComponent {
  @Input() type: CardType = 'session';
  @Input() data: any;
  @Output() onAction = new EventEmitter<any>();

  getTagColor(color: string): string {
    const colorMap: Record<string, string> = {
      red: 'bg-red-800 text-red-100',
      green: 'bg-green-800 text-green-100',
      purple: 'bg-purple-800 text-purple-100',
      blue: 'bg-blue-800 text-blue-100',
      gray: 'bg-gray-700 text-gray-200'
    };
    return colorMap[color] || colorMap.gray;
  }

  isFull(): boolean {
    return this.type === 'session' && 
           this.data.players_current >= this.data.players_max;
  }
}
```

**Temps estimé** : 2h pour les 3 types de cartes

---

### Étape 3 : Sessions List (Feature)

#### JavaScript Original (lignes 1350+)
```javascript
const renderSessions = (sessions) => {
    sessionsGrid.innerHTML = '';
    if (sessions.length === 0) {
        noSessionsMessage.classList.remove('hidden');
    } else {
        sessions.forEach(session => sessionsGrid.innerHTML += createSessionCardHTML(session));
    }
    lucide.createIcons();
};
```

#### Angular Component (sessions-list.component.ts)
```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SessionsService } from '../../../core/services/sessions.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { Session } from '../../../shared/models/session.model';

@Component({
  selector: 'app-sessions-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent],
  template: `
    <div class="my-10">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-bold text-white">Trouver une Partie</h2>
        <button class="btn-primary px-5 py-2 rounded-lg" (click)="createSession()">
          Créer une session
        </button>
      </div>

      <!-- Filters -->
      <div class="glass-card p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Mot-clé</label>
            <input 
              type="text" 
              [formControl]="keywordControl"
              placeholder="Ex: 'Tombeau', 'Night City'..."
              class="form-input">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Système de jeu</label>
            <select [formControl]="gameSystemControl" class="form-select">
              <option value="">Tous les systèmes</option>
              <option *ngFor="let system of gameSystems" [value]="system">
                {{ system }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Lieu</label>
            <input 
              type="text" 
              [formControl]="locationControl"
              placeholder="Ex: 'Paris', 'En ligne'..."
              class="form-input">
          </div>
          <div class="flex flex-col justify-end">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" [formControl]="availabilityControl" class="form-checkbox">
              <span>Places disponibles</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Results Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" *ngIf="filteredSessions.length > 0">
        <app-card 
          *ngFor="let session of filteredSessions"
          type="session"
          [data]="session"
          (onAction)="joinSession($event)">
        </app-card>
      </div>

      <!-- No Results -->
      <div *ngIf="filteredSessions.length === 0" class="glass-card p-12 text-center">
        <mat-icon class="w-24 h-24 text-indigo-400 mx-auto mb-6">search_off</mat-icon>
        <h3 class="text-2xl font-bold text-white mb-2">Aucune partie trouvée</h3>
        <p class="text-gray-400 mb-6">Essayez d'élargir vos critères</p>
        <button class="btn-primary px-6 py-3 rounded-lg" (click)="createSession()">
          Créer une nouvelle session
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class SessionsListComponent implements OnInit {
  sessions: Session[] = [];
  filteredSessions: Session[] = [];
  gameSystems: string[] = [];

  // Form Controls
  keywordControl = new FormControl('');
  gameSystemControl = new FormControl('');
  locationControl = new FormControl('');
  availabilityControl = new FormControl(false);

  constructor(private sessionsService: SessionsService) {}

  ngOnInit() {
    this.loadSessions();
    this.setupFilters();
  }

  loadSessions() {
    this.sessionsService.getSessions().subscribe(sessions => {
      this.sessions = sessions;
      this.filteredSessions = sessions;
      this.gameSystems = [...new Set(sessions.map(s => s.game))];
    });
  }

  setupFilters() {
    // Debounce pour ne pas filtrer à chaque frappe
    const filters = [
      this.keywordControl.valueChanges,
      this.gameSystemControl.valueChanges,
      this.locationControl.valueChanges,
      this.availabilityControl.valueChanges
    ];

    filters.forEach(filter => {
      filter.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(() => this.applyFilters());
    });
  }

  applyFilters() {
    const keyword = this.keywordControl.value?.toLowerCase() || '';
    const gameSystem = this.gameSystemControl.value || '';
    const location = this.locationControl.value?.toLowerCase() || '';
    const availabilityOnly = this.availabilityControl.value || false;

    this.filteredSessions = this.sessions.filter(session => {
      const matchKeyword = !keyword || 
        session.title.toLowerCase().includes(keyword) ||
        session.game.toLowerCase().includes(keyword);
      
      const matchGame = !gameSystem || session.game === gameSystem;
      
      const matchLocation = !location || 
        session.location.toLowerCase().includes(location);
      
      const matchAvailability = !availabilityOnly || 
        session.players_current < session.players_max;

      return matchKeyword && matchGame && matchLocation && matchAvailability;
    });
  }

  joinSession(session: Session) {
    // TODO: Implement join logic
    console.log('Joining session:', session);
  }

  createSession() {
    // TODO: Open create session modal/page
    console.log('Create new session');
  }
}
```

**Temps estimé** : 3h pour la liste + filtres

---

### Étape 4 : Auth Service (Migration de la logique)

#### JavaScript Original (lignes 1900+)
```javascript
const handleLogin = (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const user = allUsers.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem('loggedInUser', user.email);
        updateAuthStateUI();
    }
};
```

#### Angular Service (auth.service.ts)
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private apiUrl = 'http://localhost:3000/api/auth'; // NestJS backend

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  login(email: string, password: string): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(`${this.apiUrl}/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  register(username: string, email: string, password: string): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(`${this.apiUrl}/register`, {
      username,
      email,
      password
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  checkAuthStatus() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch {
        this.logout();
      }
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
```

**Temps estimé** : 2h (service + interceptor + guards)

---

## 📊 Récapitulatif de Migration

| Composant HTML | Angular Équivalent | Temps | Réutilisation CSS |
|----------------|-------------------|-------|-------------------|
| Header/Footer | HeaderComponent, FooterComponent | 1h | 100% |
| Card générique | CardComponent | 2h | 100% |
| Sessions list | SessionsListComponent | 3h | 95% |
| Location map | LocationsMapComponent (Leaflet) | 4h | 90% |
| Groups list | GroupsListComponent | 2h | 95% |
| Auth modals | LoginComponent, RegisterComponent | 2h | 95% |
| Profile page | ProfileComponent | 1h | 100% |
| Tools (dice) | ToolsComponent | 1h | 100% |
| Static pages | AboutComponent, ContactComponent | 1h | 100% |

**Total estimé** : 17h de migration frontend

**Gain vs from scratch** : ~25h économisées (60% plus rapide)

---

## 🎨 Réutilisation du CSS

### Copier le CSS Global

Le CSS du prototype (lignes 26-203) peut être copié **tel quel** dans :

**`apps/frontend/src/styles.scss`**
```scss
// Copier tout le contenu de la balise <style> du prototype
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: #111827;
  color: #d1d5db;
}

.glass-card {
  background: rgba(31, 41, 55, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
}

.btn-primary {
  background-color: #4f46e5;
  color: white;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #4338ca;
  }
}

.btn-secondary {
  background-color: #374151;
  color: #d1d5db;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #4b5563;
  }
}

// ... copier tout le reste
```

**Gain** : 100% du design réutilisé, 0 réécriture CSS

---

## 🚀 Commandes de Génération Nx

### Générer les Composants

```bash
# Shared components
npx nx g @nx/angular:component shared/components/header --standalone
npx nx g @nx/angular:component shared/components/footer --standalone
npx nx g @nx/angular:component shared/components/card --standalone
npx nx g @nx/angular:component shared/components/modal --standalone

# Feature components
npx nx g @nx/angular:component features/sessions/sessions-list --standalone
npx nx g @nx/angular:component features/sessions/session-detail --standalone
npx nx g @nx/angular:component features/locations/locations-map --standalone
npx nx g @nx/angular:component features/groups/groups-list --standalone
npx nx g @nx/angular:component features/auth/login --standalone
npx nx g @nx/angular:component features/auth/register --standalone

# Services
npx nx g @nx/angular:service core/services/auth
npx nx g @nx/angular:service core/services/sessions
npx nx g @nx/angular:service core/services/locations
npx nx g @nx/angular:service core/services/groups

# Guards
npx nx g @nx/angular:guard core/guards/auth
```

---

## 📝 Checklist de Migration

### Jour 1-2 : Structure de Base
- [ ] Créer le workspace Nx
- [ ] Configurer Tailwind CSS
- [ ] Copier le CSS global du prototype
- [ ] Créer Header/Footer components
- [ ] Setup routing de base

### Jour 2-3 : Composants Shared
- [ ] Créer CardComponent générique
- [ ] Créer ModalComponent
- [ ] Créer FilterComponent
- [ ] Tester tous les types de cartes

### Jour 3-4 : Features Principales
- [ ] Migrer Sessions (liste + filtres)
- [ ] Migrer Locations (carte Leaflet)
- [ ] Migrer Groups (liste + détail)
- [ ] Connecter aux API NestJS

### Jour 4-5 : Auth + Profile
- [ ] Créer Login/Register modals
- [ ] Implémenter AuthService
- [ ] Créer AuthGuard
- [ ] Créer ProfileComponent

### Jour 5-6 : Pages Secondaires
- [ ] Migrer Tools (dice roller)
- [ ] Créer pages statiques (About, Contact)
- [ ] Polir l'UI/UX

---

## 💡 Astuces pour Gagner du Temps

### 1. Copier/Coller Intelligent
Ne réécrivez PAS le HTML, copiez-le et adaptez :
- `href="#/..."` → `routerLink="/..."`
- `onclick="..."` → `(click)="..."`
- `id="element"` → `#element` (template ref) ou `[formControl]`
- `class="..."` → Garder tel quel (Tailwind)

### 2. Mock Data Initial
Au début, gardez les données mockées :
```typescript
// sessions.service.ts
getSessions(): Observable<Session[]> {
  // TODO: Replace with API call
  return of(MOCK_SESSIONS);
}
```

Puis remplacez par :
```typescript
getSessions(): Observable<Session[]> {
  return this.http.get<Session[]>(`${this.apiUrl}/sessions`);
}
```

### 3. Angular Material pour les Modales
Au lieu de recoder les modales, utilisez MatDialog :
```typescript
const dialogRef = this.dialog.open(LoginComponent, {
  width: '400px',
  data: { /* data */ }
});
```

### 4. Leaflet Integration
```bash
npm install leaflet @types/leaflet
```

```typescript
import * as L from 'leaflet';

ngAfterViewInit() {
  this.map = L.map('map').setView([48.8, 2.35], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
}
```

---

## ⚠️ Pièges à Éviter

1. **Ne pas tout refaire** : Réutilisez le HTML/CSS au max
2. **Ne pas sur-architecturer** : Keep it simple
3. **Ne pas gérer les cas complexes** : Focus sur le happy path
4. **Ne pas passer des heures sur un détail** : Avancez, polissez plus tard

---

**Avec cette approche, la migration du frontend devrait prendre 15-20h au lieu de 35-40h from scratch.**

**Prochaine étape** : Commencer par le setup Nx + Header/Footer (Jour 1 matin)
