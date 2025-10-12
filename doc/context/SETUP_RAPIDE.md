# Script de Démarrage Rapide - Jour 1

Ce fichier contient toutes les commandes pour démarrer le projet en 1h.

---

## ⚡ Setup Automatique (Copier-Coller)

### 1. Créer le Workspace Nx (5 min)

```bash
# Créer un nouveau dossier pour le projet final
cd ~
npx create-nx-workspace@latest barades-nx \
  --preset=angular-nest \
  --appName=frontend \
  --style=scss \
  --nxCloud=skip \
  --packageManager=npm

cd barades-nx
```

---

### 2. Installer les Dépendances (5 min)

```bash
# Frontend dependencies
npm install @angular/material @angular/cdk \
            @supabase/supabase-js \
            leaflet @types/leaflet \
            zod

# Backend dependencies
npm install @nestjs/config \
            @prisma/client \
            prisma \
            bcrypt @types/bcrypt \
            class-validator class-transformer

# Dev dependencies
npm install -D @tailwindcss/forms @tailwindcss/typography
```

---

### 3. Configurer Tailwind CSS (3 min)

```bash
# Ajouter Tailwind au projet Angular
npx nx g @nx/angular:setup-tailwind --project=frontend
```

Puis éditer `apps/frontend/tailwind.config.js` :

```javascript
const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
```

---

### 4. Configurer Angular Material (3 min)

```bash
npx nx g @angular/material:ng-add --project=frontend --theme=indigo-pink
```

---

### 5. Configurer Prisma (Backend) (5 min)

```bash
# Initialiser Prisma
cd apps/backend
npx prisma init

# Revenir à la racine
cd ../..
```

Éditer `apps/backend/prisma/schema.prisma` :

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../../node_modules/.prisma/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User model
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  username  String   @unique
  password  String
  bio       String?
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sessions  Session[]
  groups    GroupMember[]
}

// Session model
model Session {
  id              String   @id @default(uuid())
  game            String
  title           String
  description     String?
  date            DateTime
  location        String
  online          Boolean  @default(false)
  level           String
  playersMax      Int
  playersCurrent  Int      @default(0)
  tagColor        String   @default("gray")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  mjId            String
  mj              User     @relation(fields: [mjId], references: [id])
}

// Location model
model Location {
  id          String   @id @default(uuid())
  name        String
  city        String
  type        String
  rating      Float    @default(0)
  amenities   String[]
  icon        String   @default("store")
  lat         Float
  lon         Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Group model
model Group {
  id          String   @id @default(uuid())
  name        String
  games       String[]
  location    String
  playstyle   String
  description String
  recruiting  Boolean  @default(true)
  avatar      String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  members     GroupMember[]
}

model GroupMember {
  id        String   @id @default(uuid())
  userId    String
  groupId   String
  role      String   @default("member")
  joinedAt  DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
  group     Group    @relation(fields: [groupId], references: [id])

  @@unique([userId, groupId])
}
```

---

### 6. Créer le fichier .env (2 min)

Créer `apps/backend/.env` :

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_KEY="your-service-key"
```

**Note** : Vous remplirez ces valeurs après avoir créé le projet Supabase

---

### 7. Générer le Client Prisma (1 min)

```bash
cd apps/backend
npx prisma generate
cd ../..
```

---

### 8. Créer un Projet Supabase (5 min)

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un compte (gratuit)
3. Créer un nouveau projet "barades"
4. Attendre ~2 min que la DB soit prête
5. Copier les credentials dans `.env`

**Récupérer les valeurs** :
- `Settings` → `Database` → Connection string (mode Transaction)
- `Settings` → `API` → Project URL et anon key

---

### 9. Pousser le Schema Prisma vers Supabase (2 min)

```bash
cd apps/backend
npx prisma db push
cd ../..
```

Cela crée toutes les tables dans votre DB Supabase.

---

### 10. Copier le CSS du Prototype (3 min)

Copier tout le contenu de la balise `<style>` du prototype (lignes 26-203 de index.html) 
dans `apps/frontend/src/styles.scss` :

```scss
@import '@angular/material/prebuilt-themes/indigo-pink.css';
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
  margin: 0;
  padding: 0;
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
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary:hover:not(:disabled) {
  background-color: #4338ca;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #374151;
  color: #d1d5db;
  transition: background-color 0.3s;
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #4b5563;
}

.tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.form-input, .form-select, .form-textarea {
  background-color: #374151;
  border: 1px solid #4b5563;
  color: #d1d5db;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  width: 100%;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.5);
}

.form-checkbox {
  accent-color: #4f46e5;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
```

---

### 11. Créer la Structure de Dossiers (5 min)

```bash
# Shared
mkdir -p apps/frontend/src/app/shared/components
mkdir -p apps/frontend/src/app/shared/services
mkdir -p apps/frontend/src/app/shared/models
mkdir -p apps/frontend/src/app/shared/guards

# Features
mkdir -p apps/frontend/src/app/features/home
mkdir -p apps/frontend/src/app/features/sessions
mkdir -p apps/frontend/src/app/features/locations
mkdir -p apps/frontend/src/app/features/groups
mkdir -p apps/frontend/src/app/features/tools
mkdir -p apps/frontend/src/app/features/auth
mkdir -p apps/frontend/src/app/features/profile

# Core
mkdir -p apps/frontend/src/app/core/services
mkdir -p apps/frontend/src/app/core/guards
mkdir -p apps/frontend/src/app/core/interceptors
```

---

### 12. Générer les Composants de Base (5 min)

```bash
# Shared components
npx nx g @nx/angular:component shared/components/header --project=frontend --standalone --skip-tests
npx nx g @nx/angular:component shared/components/footer --project=frontend --standalone --skip-tests

# Feature modules (standalone components)
npx nx g @nx/angular:component features/home/home --project=frontend --standalone --skip-tests
npx nx g @nx/angular:component features/sessions/sessions-list --project=frontend --standalone --skip-tests
npx nx g @nx/angular:component features/locations/locations-map --project=frontend --standalone --skip-tests

# Auth
npx nx g @nx/angular:component features/auth/login --project=frontend --standalone --skip-tests
npx nx g @nx/angular:component features/auth/register --project=frontend --standalone --skip-tests
```

---

### 13. Générer les Services (3 min)

```bash
npx nx g @nx/angular:service core/services/auth --project=frontend --skip-tests
npx nx g @nx/angular:service core/services/sessions --project=frontend --skip-tests
npx nx g @nx/angular:service core/services/locations --project=frontend --skip-tests
npx nx g @nx/angular:service core/services/api --project=frontend --skip-tests
```

---

### 14. Configurer le Routing (5 min)

Éditer `apps/frontend/src/app/app.routes.ts` :

```typescript
import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home/home.component';
import { SessionsListComponent } from './features/sessions/sessions-list/sessions-list.component';
import { LocationsMapComponent } from './features/locations/locations-map/locations-map.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'sessions', component: SessionsListComponent },
  { path: 'map', component: LocationsMapComponent },
  { path: '**', redirectTo: '' }
];
```

---

### 15. Mettre à Jour app.component.html (2 min)

Éditer `apps/frontend/src/app/app.component.html` :

```html
<app-header></app-header>
<main class="min-h-screen">
  <router-outlet></router-outlet>
</main>
<app-footer></app-footer>
```

---

### 16. Importer les Modules Nécessaires (3 min)

Éditer `apps/frontend/src/app/app.component.ts` :

```typescript
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  standalone: true,
  imports: [RouterModule, HeaderComponent, FooterComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Bar à Dés';
}
```

---

### 17. Lancer le Frontend (1 min)

```bash
npx nx serve frontend
```

Ouvrir http://localhost:4200

**Vous devriez voir** : Page blanche avec header/footer (vides pour l'instant)

---

### 18. Lancer le Backend (1 min)

Dans un nouveau terminal :

```bash
npx nx serve backend
```

Backend disponible sur http://localhost:3000

---

## ✅ Checkpoint Jour 1 Matin (Total : ~1h)

Vous devriez avoir :
- ✅ Workspace Nx créé
- ✅ Angular + NestJS configurés
- ✅ Tailwind CSS fonctionnel
- ✅ Prisma connecté à Supabase
- ✅ Structure de dossiers créée
- ✅ Composants de base générés
- ✅ Routing configuré
- ✅ Frontend et Backend lancés

---

## 🚀 Prochaine Étape (Jour 1 Après-midi)

1. Créer le Header component avec le contenu du prototype
2. Créer le Footer component
3. Créer le HomeComponent avec la section hero
4. Tester que tout fonctionne

**Temps estimé** : 3h

---

## 🆘 Troubleshooting

### Erreur "Module not found: @angular/material"
```bash
npm install @angular/material @angular/cdk --force
```

### Erreur Prisma "Environment variable not found"
Vérifier que le fichier `.env` existe dans `apps/backend/`

### Port déjà utilisé (4200 ou 3000)
```bash
# Tuer le processus
npx kill-port 4200
npx kill-port 3000
```

### Tailwind ne s'applique pas
Vérifier que `tailwind.config.js` est bien à la racine de `apps/frontend/`

---

## 📝 Commits Git

Après chaque étape importante :

```bash
git add .
git commit -m "feat: initial Nx setup with Angular + NestJS + Prisma + Supabase"
git commit -m "feat: add Tailwind CSS and Angular Material"
git commit -m "feat: setup project structure and generate base components"
```

---

**Vous êtes prêt à démarrer ! 🚀**

**Suivant** : [GUIDE_MIGRATION.md](./GUIDE_MIGRATION.md) pour migrer les composants du prototype
