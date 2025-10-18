# Barades Monorepo

Barades regroupe une PWA Angular, une API NestJS et une base PostgreSQL exposée via Prisma. Nx orchestre l'ensemble du monorepo pour faciliter le développement full‑stack et la génération des livrables techniques.

## Prérequis

- Node.js 22+
- npm 10+
- PostgreSQL (local ou distant via `DATABASE_URL` et `DIRECT_URL`)

## Installation

```sh
npm install
```

## Développement

```sh
# Démarrer front + back en parallèle
npx nx dev

# Front uniquement (http://localhost:4200)
npx nx serve frontend

# Backend uniquement (http://localhost:3000)
npx nx serve backend
```

## Tests & Qualité

```sh
# Lancer tous les tests unitaires
npx nx run-many --target=test --all

# Lancer tous les linters
npx nx run-many --target=lint --all
```

## Builds de production

```sh
# Construire tous les projets déclarés
npx nx run-many --target=build --all

# Construire seulement la PWA Angular
npx nx build frontend --configuration=production

# Construire seulement l'API NestJS
npx nx build backend --configuration=production
```

## Documentation technique

Les diagrammes métiers se génèrent directement depuis le dépôt pour rester alignés avec le code source.

### Diagramme ERD Prisma

Le générateur `prisma-erd-generator` défini dans `apps/backend/prisma/schema.prisma` exporte le schéma de données vers `doc/database-erd.svg`.

```sh
# Re-génère le client Prisma ET l'ERD
npx prisma generate --schema apps/backend/prisma/schema.prisma

# Limiter la génération au diagramme ERD uniquement
npx prisma generate --schema apps/backend/prisma/schema.prisma --generator erd
```

### Parcours utilisateurs (Mermaid)

- Les sources `.mmd` vivent dans `doc/diagrams/`.
- Les `.svg` générés sont versionnés avec la documentation.
- `@mermaid-js/mermaid-cli` est invoqué via une cible Nx dédiée.

```sh
# Convertir tous les fichiers .mmd en .svg
npx nx run barades:journey-diagrams

# Exemple : ajouter un nouveau diagramme puis regénérer
echo "journey\n  title Mon parcours" > doc/diagrams/nouveau.mmd
npx nx run barades:journey-diagrams
```

Astuce : lance la cible Mermaid dans un hook Git ou un job CI pour garder les exports synchronisés avec les sources `.mmd`.

## Astuces Nx

- `npx nx graph` pour visualiser les dépendances des projets.
- `npx nx show project <nom>` pour lister toutes les cibles disponibles.
- `npm run lint` / `npm run test` pour lancer les raccourcis Nx définis dans `package.json`.
