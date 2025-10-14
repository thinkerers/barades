# Jour 3 - Vue d'ensemble

[← Retour à l'index](./rapport-jour3-00-index.md) | [→ Services Angular](./rapport-jour3-02-services.md)

---

## 🎯 Objectif principal

Migrer les pages du prototype HTML/JavaScript vers l'application Angular en créant :
- Les **services** pour consommer l'API NestJS
- Les **composants** de pages avec leur logique métier
- L'intégration de la **carte Leaflet** pour afficher les lieux
- Les **tests unitaires** pour garantir la qualité

---

## 🏗️ Architecture mise en place

### Structure des dossiers

```
apps/frontend/src/app/
├── core/
│   ├── services/
│   │   ├── sessions.service.ts       ✅ Service Sessions
│   │   ├── locations.service.ts      ✅ Service Locations
│   │   └── groups.service.ts         ✅ Service Groups
│   ├── layouts/
│   │   ├── app-layout.ts            ✅ Layout principal
│   │   ├── app-layout.html
│   │   └── app-layout.css
│   └── navigation/
│       ├── top-bar.ts               ✅ Barre de navigation
│       ├── side-nav.ts              ✅ Menu latéral
│       └── footer.ts                ✅ Pied de page (nouveau)
├── features/
│   ├── sessions/
│   │   ├── sessions-list.ts         ✅ Page liste sessions
│   │   ├── sessions-list.html       (130 lignes)
│   │   ├── sessions-list.css        (230 lignes)
│   │   └── sessions-list.spec.ts    ✅ Tests
│   ├── locations/
│   │   ├── locations-list.ts        ✅ Page lieux + Leaflet
│   │   ├── locations-list.html      (96 lignes)
│   │   ├── locations-list.css       (300 lignes)
│   │   └── locations-list.spec.ts   ✅ Tests
│   └── groups/
│       ├── groups-list.ts           ✅ Page groupes
│       ├── groups-list.html         (107 lignes)
│       ├── groups-list.css          (250 lignes)
│       └── groups-list.spec.ts      ✅ Tests
└── environments/
    ├── environment.ts               apiUrl: localhost:3000
    └── environment.prod.ts          apiUrl: TBD
```

---

## 📦 Technologies utilisées

### Framework et outils

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Angular** | 20.2 | Framework frontend |
| **HttpClient** | 20.2 | Requêtes HTTP vers NestJS |
| **RxJS** | 7.x | Gestion asynchrone (Observables) |
| **Leaflet** | 1.9.4 | Carte interactive pour les lieux |
| **Jest** | 29.x | Tests unitaires |
| **Nx** | 21.5.3 | Monorepo tooling |

### Dépendances installées

```bash
npm install leaflet @types/leaflet
```

---

## 🔄 Flux de données

```
┌─────────────────────────────────────────────────────────┐
│                    ANGULAR FRONTEND                      │
│                   (localhost:4200)                       │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HttpClient (fetch API)
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   NESTJS BACKEND                         │
│                   (localhost:3000)                       │
│                                                          │
│  Routes:                                                 │
│    GET /api/sessions     → SessionsController            │
│    GET /api/locations    → LocationsController           │
│    GET /api/groups       → GroupsController              │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Prisma Client
                          ▼
┌─────────────────────────────────────────────────────────┐
│               SUPABASE POSTGRESQL                        │
│                  (eu-west-3)                             │
│                                                          │
│  Tables: sessions, locations, groups, users,             │
│          reservations, group_members, polls              │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Pages implémentées

### 1. Sessions (`/sessions`)

**Fonctionnalités :**
- ✅ Liste des 5 sessions du seed
- ✅ Cartes Material Design avec tags colorés
- ✅ Dates formatées en français (Intl.DateTimeFormat)
- ✅ Compteurs de joueurs (playersCurrent/playersMax)
- ✅ Badges de niveau (Débutant, Intermédiaire, Avancé)
- ✅ RouterLink vers page détail (/sessions/:id)

**Données affichées :**
- Titre de la session
- Jeu (badge bleu)
- Date et heure
- Organisateur (username + avatar)
- Lieu (nom de la location)
- Niveau de difficulté
- Tag coloré (Red, Green, Blue, Purple, Gray)
- Nombre de joueurs inscrits

### 2. Lieux (`/locations`)

**Fonctionnalités :**
- ✅ Liste des 3 lieux (Brussels Game Store, Café Joystick, Online)
- ⚠️ Carte Leaflet interactive (tuiles partiellement chargées)
- ✅ Markers avec popups (nom, adresse, rating, capacité)
- ✅ Filtrage par type de lieu (GAME_STORE, CAFE, etc.)
- ✅ Affichage des amenities (WiFi, Food, Drinks, etc.)
- ✅ Horaires d'ouverture formatés

**Données affichées :**
- Nom du lieu
- Type de lieu (badge coloré)
- Adresse complète
- Rating (étoiles)
- Capacité
- Équipements (amenities)
- Horaires d'ouverture (7 jours)
- Lien vers le site web

### 3. Groupes (`/groups`)

**Fonctionnalités :**
- ✅ Liste des 2 groupes du seed
- ✅ Badges playstyle (Competitive, Casual, Story-Driven)
- ✅ Statut de recrutement (ouvert/fermé)
- ✅ Nombre de membres (_count.members)
- ✅ Créateur du groupe (username)
- ✅ Description complète

**Données affichées :**
- Nom du groupe
- Playstyle (badge coloré)
- Statut recrutement (badge rouge/vert)
- Nombre de membres
- Créateur
- Description
- Boutons "Rejoindre" / "Voir détails"

---

## 🎨 Design System

### Couleurs des tags (Sessions)

```typescript
const tagColors = {
  RED: '#ef4444',      // Sessions urgentes/importantes
  GREEN: '#10b981',    // Sessions ouvertes
  BLUE: '#3b82f6',     // Sessions en ligne
  PURPLE: '#8b5cf6',   // Sessions D&D/RPG
  GRAY: '#6b7280'      // Sessions par défaut
};
```

### Couleurs des playstyles (Groups)

```typescript
const playstyleColors = {
  COMPETITIVE: '#ef4444',     // Rouge
  CASUAL: '#10b981',          // Vert
  STORY_DRIVEN: '#8b5cf6',    // Violet
  SANDBOX: '#f59e0b'          // Orange
};
```

---

## ⏱️ Temps passé

| Tâche | Durée estimée | Durée réelle |
|-------|---------------|--------------|
| Configuration HttpClient | 15 min | 10 min |
| SessionsService + Page | 1h | 1h15 |
| LocationsService + Page | 1h | 2h30* |
| GroupsService + Page | 1h | 45 min |
| Footer component | 30 min | 25 min |
| Tests unitaires | 1h | 1h30 |
| Debugging Leaflet | - | 1h30* |
| **TOTAL** | **~5h** | **~8h** |

\* *Temps supplémentaire dû au problème de chargement des tuiles Leaflet*

---

## 🔗 Navigation

- [← Retour à l'index](./rapport-jour3-00-index.md)
- [→ Continuer avec Services Angular](./rapport-jour3-02-services.md)
