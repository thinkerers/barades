# Barades - Plateforme de Rencontre de Joueur sur Table

[![Rapport de TFE](https://img.shields.io/badge/📄_Rapport_de_TFE-2025-blue?style=flat-square)](TFE%20Barades%202025.pdf)
[![Production](https://img.shields.io/badge/🌐_Production-www.barades.com-success?style=flat-square)](https://www.barades.com)

## Stack Technique

### Frontend

[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Angular Material](https://img.shields.io/badge/Angular_Material-009688?style=for-the-badge&logo=angular&logoColor=white)](https://material.angular.io/)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)

### Backend

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

### DevOps & Outils

[![Nx](https://img.shields.io/badge/Nx-143055?style=for-the-badge&logo=nx&logoColor=white)](https://nx.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=for-the-badge&logo=storybook&logoColor=white)](https://storybook.js.org/)

**Barades** est une Progressive Web App (PWA) conçue pour connecter les joueurs de jeux de société et de jeux de rôle. Elle permet de créer des groupes de joueurs, de trouver des parties (sessions) près de chez soi ou en ligne, et d'organiser facilement des événements ludiques.

## Architecture

Ce monorepo **Nx** est constitués des applications et packages suivants:

- `apps/frontend` : PWA Angular standalone (Tailwind CSS, Angular Material, Leaflet) servie par Vercel.
- `apps/backend` : API NestJS (Prisma, JWT, Zod) déployée sur Render et connectée à Supabase.
- `apps/*-e2e` : suites Playwright pilotées par Nx pour valider les parcours critiques.
- `packages/ui` : design system Angular documenté avec Storybook et réutilisé dans l’app.
- `doc/` : documentation technique versionnée (rapports TFE, guides de déploiement, diagrammes Mermaid).

Nx gère les dépendances et builds, les tests Jest/Playwright et les tâches de linting. Les artefacts de production sont poussés vers Vercel (frontend), Render (backend) et Supabase (PostgreSQL + Prisma migrations).

---

## Fonctionnalités Clés

- **Gestion de Groupes** : Créez, rejoignez ou gérez des groupes de joueurs. Chaque groupe dispose de son espace dédié avec membres et sondages.
- **Recherche de Sessions** : Trouvez des parties de jeux de rôle ou de société à proximité ou en ligne grâce à la carte interactive Leaflet et aux filtres avancés.
- **Organisation d'Événements** : Créez des sessions, invitez des membres et utilisez les sondages pour déterminer la meilleure date.
- **Sondages de Planification** : Système de vote intégré pour faciliter les décisions de groupe (dates, jeux, lieux).
- **Mode Hors-Ligne (PWA)** : Accédez aux informations essentielles même sans connexion grâce au Service Worker Angular.
- **Authentification Sécurisée** : Gestion complète des comptes utilisateurs avec tokens JWT et protection des routes.
- **Notifications Email** : Envoi automatique d'emails de confirmation via Resend lors des réservations.
- **Carte Interactive** : Visualisation géographique des lieux de jeu avec géolocalisation.

---

## Démarrage Rapide

### Prérequis

- Node.js 22.14.0
- Base PostgreSQL/Supabase et variables `DATABASE_URL`, `DIRECT_URL`
- (Optionnel) Clé API Resend (`RESEND_API_KEY`) pour les emails transactionnels

Remarque : le développement se fait avec Visual Studio Code sous Windows 11 (via WSL2). Le dépôt fournit un fichier de workspace pour une configuration prête à l’emploi.

### Installation

Clonez le dépôt et installez les dépendances.

```sh
npm install
```

---

## 💻 Développement

### Lancer l'application complète

Cette commande démarre le frontend Angular et le backend NestJS en parallèle avec rechargement à chaud.

```sh
# Front (http://localhost:4200) + Back (http://localhost:3000)
npx nx dev
```

### Lancer les projets séparément

```sh
# Frontend uniquement
npx nx serve frontend

# Backend uniquement
npx nx serve backend
```

---

## 🧪 Tests et Qualité

Le monorepo est configuré pour lancer les tests et les linters sur l'ensemble des projets de manière optimisée.

```sh
# Lancer tous les tests unitaires (343 tests : frontend, backend, ui)
npx nx run-many --target=test --all

# Lancer tous les linters
npx nx run-many --target=lint --all

# Tests End-to-End (Playwright)
npx nx e2e frontend-e2e
npx nx e2e backend-e2e
```

---

## 📦 Builds de Production

Générez les livrables optimisés pour le déploiement.

```sh
# Construire tous les projets (frontend, backend)
npx nx run-many --target=build --all

# Construire seulement la PWA Angular
npx nx build frontend --configuration=production

# Construire seulement l'API NestJS
npx nx build backend
```

---

## 🗄️ Base de Données

Le projet utilise Prisma comme ORM pour gérer la base PostgreSQL (7 tables avec relations complètes).

```sh
# Appliquer les migrations
npx prisma migrate dev --schema apps/backend/prisma/schema.prisma

# Peupler la base avec des données de démonstration
npx prisma db seed

# Ouvrir Prisma Studio pour explorer les données
npx prisma studio --schema apps/backend/prisma/schema.prisma
```

---

## 🎨 Documentation et Diagrammes

La documentation technique est générée automatiquement pour garantir qu'elle reste synchronisée avec le code.

### Diagramme de Base de Données (ERD)

Le schéma de la base de données est visualisé à l'aide de `prisma-erd-generator`.

```sh
# Re-génère le client Prisma ET le diagramme ERD
npx prisma generate --schema apps/backend/prisma/schema.prisma

# Limiter la génération au diagramme ERD uniquement
npx prisma generate --schema apps/backend/prisma/schema.prisma --generator erd
```

Le diagramme est exporté dans `doc/database-erd.svg`.

### Parcours Utilisateurs (Mermaid)

Les parcours utilisateurs clés sont décrits dans des fichiers `.mmd` et convertis en SVG.

```sh
# Convertir tous les diagrammes .mmd en .svg
npx nx run barades:journey-diagrams
```

Les sources se trouvent dans `doc/diagrams/` :

- `journey-signup.mmd` : Parcours membre (inscription → réservation)
- `journey-group-poll.mmd` : Parcours organisateur (groupe → sondage)
- `journey-offline.mmd` : Utilisation hors-ligne de la PWA

---

## 🛠️ Astuces Nx

- `npx nx graph` : Visualisez le graphe des dépendances entre les projets.
- `npx nx show project <nom>` : Listez toutes les cibles (build, test, lint...) d'un projet.
- `npm run lint` / `npm run test` : Raccourcis pratiques définis dans `package.json`.

---

## 📚 Documentation Complète

Consultez le dossier `doc/` pour accéder aux rapports techniques détaillés :

- **Charte graphique** : `doc/charte-graphique.md`
- **Impact mapping** : `doc/impact-mapping.md`
- **Rapports journaliers** : `doc/rapport-jour*.md`
- **Tests manuels** : `doc/TESTS_MANUELS.md`
- **Bonnes pratiques CI** : `doc/CI_BEST_PRACTICES.md`

---

## 🚢 Déploiement

Le projet est configuré pour être déployé sur :

- **Frontend** : Vercel (configuration dans `vercel.json`)
- **Backend** : Render (configuration dans `render.yaml`)

Les fichiers de configuration sont prêts ; il suffit de connecter les repos et de définir les variables d'environnement requises.

---

## 📄 Licence

MIT
