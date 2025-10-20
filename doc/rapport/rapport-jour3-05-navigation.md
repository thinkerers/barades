# Jour 3 - Navigation et Layout

[← Leaflet](rapport-jour3-04-leaflet.md) | [→ Tests](rapport-jour3-06-tests.md)

---

## 🧭 Architecture de navigation

L'application utilise le **Angular Router** avec des **Standalone Components**. La navigation se compose de 3 éléments principaux :

1. **TopBar** : Barre de navigation horizontale (logo + liens principaux)
2. **SideNav** : Menu latéral pour mobile (drawer)
3. **Footer** : Pied de page avec 4 sections

---

## 📐 AppLayout

### Structure globale

**`apps/frontend/src/app/core/layouts/app-layout.ts`** (12 lignes)

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideNav } from '../navigation/side-nav';
import { TopBar } from '../navigation/top-bar';
import { Footer } from '../navigation/footer';

@Component({
  standalone: true,
  imports: [RouterOutlet, TopBar, SideNav, Footer],
  selector: 'app-app-layout',
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css',
})
export class AppLayout {}
```

**Template HTML** (11 lignes)

```html
<div class="app-layout">
	<app-top-bar class="app-layout__top-bar"></app-top-bar>
	<div class="app-layout__body">
		<app-side-nav class="app-layout__side-nav"></app-side-nav>
		<main class="app-layout__content">
			<router-outlet></router-outlet>
		</main>
	</div>
	<app-footer class="app-layout__footer"></app-footer>
</div>
```

**Note :** Structure réelle avec SideNav dans un conteneur flexible à côté du contenu principal.

**Styles CSS**

```css
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-layout__header {
  flex: 0 0 auto;
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-layout__body {
  flex: 1 0 auto;
  padding: 0;
}

.app-layout__footer {
  flex: 0 0 auto;
  margin-top: auto;
}
```

**Architecture Flexbox :**
- ✅ `flex: 0 0 auto` : Header et footer ne grandissent/rétrécissent pas
- ✅ `flex: 1 0 auto` : Body prend tout l'espace restant
- ✅ `min-height: 100vh` : Footer toujours en bas même avec peu de contenu

---

## 🔝 TopBar

### Composant

**`apps/frontend/src/app/core/navigation/top-bar.ts`** (12 lignes)

```typescript
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-top-bar',
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})
export class TopBar {}
```

**Note :** Composant simple sans logique - juste navigation déclarative avec RouterLink.

### Template avec navigation

**`apps/frontend/src/app/core/navigation/top-bar.html`** (11 lignes)

```html
<header class="top-bar">
	<a routerLink="/" class="top-bar__logo">Bar à Dés</a>
	<nav class="top-bar__nav">
		<a routerLink="/sessions" routerLinkActive="active" class="top-bar__link">Sessions</a>
		<a routerLink="/locations" routerLinkActive="active" class="top-bar__link">Lieux</a>
		<a routerLink="/groups" routerLinkActive="active" class="top-bar__link">Groupes</a>
	</nav>
	<nav class="top-bar__actions">
		<button type="button" class="top-bar__action">Se connecter</button>
	</nav>
</header>
```

**Fonctionnalités :**
- ✅ `routerLink` : Navigation déclarative Angular
- ✅ `routerLinkActive="active"` : Classe CSS active sur lien actif
- ✅ Bouton "Se connecter" (non fonctionnel Jour 3)
- ✅ Responsive : Navigation adaptée desktop/mobile avec media queries CSS

### Styles

```css
.top-bar {
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.top-bar__container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.nav-link--active {
  color: var(--color-primary);
  font-weight: 600;
}

/* Mobile: Cacher la nav, afficher le bouton */
@media (max-width: 768px) {
  .top-bar__nav {
    display: none;
  }

  .top-bar__menu-btn {
    display: block;
  }
}

/* Desktop: Afficher la nav, cacher le bouton */
@media (min-width: 769px) {
  .top-bar__nav {
    display: flex;
    gap: 0.5rem;
  }

  .top-bar__menu-btn {
    display: none;
  }
}
```

---

## 📱 SideNav (Mobile)

### Composant

**`apps/frontend/src/app/core/navigation/side-nav.ts`** (12 lignes)

```typescript
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-side-nav',
  templateUrl: './side-nav.html',
  styleUrl: './side-nav.css',
})
export class SideNav {}
```

**Note :** Composant simple sans gestion d'état - drawer statique affiché/caché via CSS.

### Template avec overlay

**`apps/frontend/src/app/core/navigation/side-nav.html`** (14 lignes)

```html
<aside class="side-nav">
	<nav class="side-nav__menu">
		<a
			routerLink="/"
			routerLinkActive="side-nav__link--active"
			class="side-nav__link"
			[routerLinkActiveOptions]="{ exact: true }"
		>
			Accueil
		</a>
		<a routerLink="/sessions" class="side-nav__link">Sessions</a>
		<a routerLink="/groups" class="side-nav__link">Groupes</a>
		<a routerLink="/profile" class="side-nav__link">Profil</a>
	</nav>
</aside>
```

**Note :** Menu latéral permanent affiché à côté du contenu - pas d'overlay ni d'animation toggle.

### Styles avec transitions

```css
.side-nav {
  /* Position et affichage selon viewport */
  display: none;  /* Caché par défaut sur desktop */
}

.side-nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
}

.side-nav-link:hover {
  background: var(--color-bg-hover);
  color: var(--color-primary);
}

.side-nav-link--active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
  border-left: 4px solid var(--color-primary);
}

/* Mobile: afficher le side-nav */
@media (max-width: 768px) {
  .side-nav {
    display: block;
  }
}
```

**Note :** Version simplifiée sans overlay ni animation slide-in - affichage conditionnel via media queries uniquement.

---

## 🦶 Footer

### Composant (créé Jour 3)

**`apps/frontend/src/app/core/navigation/footer.ts`** (14 lignes)

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  currentYear = new Date().getFullYear();
}
```

**Note :** Nom de classe `Footer` (pas `FooterComponent`).

### Template avec 4 sections

**`apps/frontend/src/app/core/navigation/footer.html`** (96 lignes)

```html
<footer class="footer">
  <div class="footer-container">
    <!-- Grille 4 colonnes -->
    <div class="footer-grid">
      
      <!-- Section 1: Bar à Dés -->
      <div class="footer-section">
        <h3 class="footer-heading">Bar à Dés</h3>
        <ul class="footer-links">
          <li><a routerLink="/about" class="footer-link">À propos</a></li>
          <li><a routerLink="/contact" class="footer-link">Contact</a></li>
          <li>
            <a 
              href="https://github.com/username/barades" 
              target="_blank"
              rel="noopener noreferrer"
              class="footer-link">
              Code source
            </a>
          </li>
        </ul>
      </div>

      <!-- Section 2: Communauté -->
      <div class="footer-section">
        <h3 class="footer-heading">Communauté</h3>
        <ul class="footer-links">
          <li><a routerLink="/charter" class="footer-link">Charte</a></li>
          <li><a routerLink="/sessions" class="footer-link">Sessions</a></li>
          <li><a routerLink="/groups" class="footer-link">Groupes</a></li>
        </ul>
      </div>

      <!-- Section 3: Ressources -->
      <div class="footer-section">
        <h3 class="footer-heading">Ressources</h3>
        <ul class="footer-links">
          <li><a routerLink="/help" class="footer-link">Aide</a></li>
          <li><a routerLink="/locations" class="footer-link">Lieux</a></li>
          <li><a routerLink="/partner" class="footer-link">Devenir partenaire</a></li>
        </ul>
      </div>

      <!-- Section 4: Légal -->
      <div class="footer-section">
        <h3 class="footer-heading">Légal</h3>
        <ul class="footer-links">
          <li><a routerLink="/privacy" class="footer-link">Confidentialité</a></li>
          <li><a routerLink="/terms" class="footer-link">CGU</a></li>
          <li><a routerLink="/cookies" class="footer-link">Cookies</a></li>
        </ul>
      </div>
    </div>

    <!-- Section inférieure -->
    <div class="footer-bottom">
      <!-- Copyright -->
      <p class="footer-copyright">
        © {{ currentYear }} Bar à Dés. Tous droits réservés.
      </p>

      <!-- Réseaux sociaux -->
      <div class="footer-social">
        <a href="https://twitter.com/barades" target="_blank" rel="noopener" class="social-link">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <!-- Twitter icon -->
          </svg>
        </a>
        <a href="https://instagram.com/barades" target="_blank" rel="noopener" class="social-link">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <!-- Instagram icon -->
          </svg>
        </a>
        <a href="https://facebook.com/barades" target="_blank" rel="noopener" class="social-link">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <!-- Facebook icon -->
          </svg>
        </a>
        <a href="https://discord.gg/barades" target="_blank" rel="noopener" class="social-link">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <!-- Discord icon -->
          </svg>
        </a>
      </div>
    </div>
  </div>
</footer>
```

**Contenu :**
- ✅ **4 sections** : Bar à Dés, Communauté, Ressources, Légal
- ✅ **13 liens internes** : routerLink vers pages Angular
- ✅ **5 liens externes** : GitHub, Twitter, Instagram, Facebook, Discord
- ✅ **Copyright dynamique** : `{{ currentYear }}` mis à jour automatiquement

### Styles responsive

```css
.footer {
  background: var(--color-bg-dark);
  color: var(--color-text-light);
  padding: 3rem 0 1.5rem;
  margin-top: 4rem;
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);  /* 2 colonnes mobile */
  gap: 2rem;
  margin-bottom: 2rem;
}

/* Desktop: 4 colonnes */
@media (min-width: 768px) {
  .footer-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.footer-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--color-primary);
}

.footer-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border-dark);
}

/* Desktop: Flex row pour copyright + social */
@media (min-width: 640px) {
  .footer-bottom {
    flex-direction: row;
    justify-content: space-between;
  }
}

.footer-social {
  display: flex;
  gap: 1rem;
}

.social-link {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--color-bg-hover);
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.social-link:hover {
  background: var(--color-primary);
  color: white;
  transform: translateY(-2px);
}
```

**Responsive design :**
- ✅ **Mobile** : 2 colonnes, footer-bottom en colonne
- ✅ **Tablet (768px)** : 4 colonnes
- ✅ **Desktop (640px)** : footer-bottom en row

---

## 🗺️ Configuration des routes

**`apps/frontend/src/app/app.routes.ts`**

```typescript
import { Route } from '@angular/router';
import { AppLayoutComponent } from './core/layouts/app-layout';

export const appRoutes: Route[] = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./nx-welcome').then(m => m.NxWelcomeComponent)
      },
      {
        path: 'sessions',
        loadComponent: () => import('./features/sessions/sessions-list').then(m => m.SessionsListComponent)
      },
      {
        path: 'locations',
        loadComponent: () => import('./features/locations/locations-list').then(m => m.LocationsListComponent)
      },
      {
        path: 'groups',
        loadComponent: () => import('./features/groups/groups-list').then(m => m.GroupsListComponent)
      }
    ]
  }
];
```

**Architecture :**
- ✅ **Layout route** : AppLayout englobe toutes les pages
- ✅ **Lazy loading** : `loadComponent()` pour code-splitting
- ✅ **Nested routes** : Children routes pour réutiliser le layout

---

## 📊 Tableau récapitulatif

| Composant | Fonctionnalités | Responsive |
|-----------|----------------|------------|
| **TopBar** | Logo, nav principale, bouton menu | ✅ Desktop: nav visible, Mobile: bouton menu |
| **SideNav** | Drawer latéral, overlay, liens avec icônes | ✅ Mobile uniquement |
| **Footer** | 4 sections, 13 liens, social, copyright dynamique | ✅ 2→4 colonnes, column→row |

---

## 🔗 Navigation

- [← Retour à Leaflet](rapport-jour3-04-leaflet.md)
- [→ Continuer avec Tests](rapport-jour3-06-tests.md)
