# 📋 CONTEXTE COMPLET PROJET TFE - Bar à Dés

**Fichier de contexte pour continuité de conversation avec GitHub Copilot**  
**Date de création** : 12 octobre 2025, 16h45  
**Objectif** : Permettre à Copilot de reprendre l'assistance dans le nouveau repo

---

## 🎯 INFORMATIONS PROJET

### Identité du Projet
- **Nom** : Bar à Dés
- **Type** : Plateforme web (SPA) de gestion de sessions de jeux sur table
- **Formation** : Développeur Web Front-End X75 (2024-2025)
- **Nature** : Travail de Fin d'Études (TFE)
- **Formateur** : Duribreux G.

### Deadline Critique
- **Date limite** : **20 octobre 2025, 12h00**
- **Aujourd'hui** : 12 octobre 2025, ~16h45
- **Temps restant** : **7,5 jours ≈ 60h effectives** (planning alloue 64h en comptant la matinée d'impression)

### Livrables Obligatoires
1. **Application web en ligne** (consultable par jury)
2. **Code source sur GitHub** (avec analyse, docs, PDF rapport)
3. **Rapport TFE** : 30+ pages, 3 exemplaires reliés déposés au secrétariat
4. **Présentation orale** : 15 min présentation + 15 min questions

---

## 📊 CAHIER DES CHARGES (Résumé)

### Type d'Application
- ✅ **Single Page Application (SPA)** événementielle
- ✅ **Front office** : consultation sessions, carte, groupes, outils joueurs
- ✅ **Back office** : gestion sessions, profil, réservations, sondages planning

### Fonctionnalités Cibles
1. **Intégration API Maps** : Google Maps OU OpenStreetMap (Leaflet) ✅
2. **Système de réservation en ligne** : Email de confirmation OU interface dédiée ⚠️
3. **Gestion sondages / planning** : Poll dates multi-utilisateurs avec shift-select, calcul automatique meilleure date, liens partageables ✅ (prototype complet)
4. **Sécurité robuste** : Protection données utilisateurs (bcrypt, Zod, Supabase Auth)
5. **Technologies modernes** : Frameworks autorisés, performants

### Documents Préparatoires Requis
- [x] Planning d'exécution ✅ (ce fichier + `PLANNING_FINAL_REVISE.md`)
- [ ] Charte graphique (logo, couleurs, typo, moodboard)
- [ ] Impact mapping (acteurs, besoins, features)
- [ ] UI/UX Design (wireframes, user flows, sitemap)
- [ ] Schéma base de données (ERD)

### Contraintes
- ❌ **Interdit** : Plugin "event calendar" tout fait (WordPress)
- ✅ **Autorisé** : Tous frameworks abordés en formation
- ✅ **Liberté** : Choix technologique justifié dans rapport

---

## 🏗️ ARCHITECTURE TECHNIQUE DÉCIDÉE

### Stack Finale
```
Frontend:
├─ Angular 18+ (Standalone Components)
├─ Angular Material (UI Components)
├─ Tailwind CSS (Utility-first styling)
├─ Leaflet (OpenStreetMap integration)
└─ PWA (Service Worker + Manifest)

Backend:
├─ NestJS (TypeScript framework)
├─ Prisma ORM (Type-safe database access)
├─ Supabase PostgreSQL (Database + Auth)
├─ Zod (Validation partagée front/back)
└─ Resend / Nodemailer (Email service)

Monorepo:
├─ Nx Workspace (Angular + NestJS apps)
└─ Shared libraries (models, validation)

Deployment:
├─ Frontend → Vercel (gratuit)
└─ Backend → Render (gratuit)
```

### Justification des Choix
- **Angular** : TypeScript natif, structure opinionnée, standalone components modernes
- **NestJS** : Architecture MVC, decorators, compatible Prisma
- **Nx** : Monorepo pour partage code (Zod schemas), build optimisé
- **Supabase** : BaaS gratuit, PostgreSQL robuste, auth intégrée
- **Prisma** : Type-safety, migrations faciles, génération client auto
- **Tailwind** : Réutilisable depuis prototype, utility-first rapide

---

## 📁 ÉTAT DU PROTOTYPE EXISTANT

### Fichier Principal
- **Emplacement** : `/home/theop/barades-prototype/index.html`
- **Taille** : 2523 lignes HTML/CSS/JavaScript
- **État** : Prototype fonctionnel avec toutes les UI mockées

### Technologies Utilisées dans Prototype
```html
- Tailwind CSS (CDN)
- Leaflet.js (Maps interactive)
- Flatpickr (Date picker)
- Lucide Icons (SVG icons)
- LocalStorage (Mock data persistence)
- Vanilla JavaScript (Event-driven)
```

### Fonctionnalités Implémentées (Prototype)
1. **Authentification** : Login/Register (localStorage avec validation)
2. **Sessions** : Liste avec filtres avancés (keyword, système, lieu, disponibilité, en ligne/sur table)
3. **Carte interactive** : Leaflet avec markers cliquables, géolocalisation, popups custom
4. **Groupes** : Liste, détail, système complet de poll dates avec shift-select et partage de lien
5. **Profil utilisateur** : Édition bio, avatar (upload preview), username, email
6. **Outils** : Dice roller (lanceur de dés avec animations), recommandations produits
7. **Forum communautaire** : Catégories, topics, replies, derniers posts
8. **FAQ dynamique** : Recherche live, filtrage par catégories
9. **Pages institutionnelles** : About, Contact (avec carte), Careers (postes + formulaire), Charter, Partenaires (formulaire)
10. **Planning standalone** : Création/partage de sondages de dates avec lien unique, vote multi-dates, calcul meilleure date
11. **PWA** : Manifest et service worker générés dynamiquement, offline-ready

### Design Prototype
- **Style** : Dark theme avec glassmorphism
- **Couleurs** : Indigo (#4f46e5) + Dark Gray (#111827)
- **Typographie** : Inter (Google Fonts)
- **Composants** : Cards, buttons, forms (Tailwind utility classes)

### Points Forts à Réutiliser
✅ **CSS Tailwind** : Copier-coller tel quel dans Angular
✅ **HTML Structure** : Migrer vers templates Angular
✅ **Leaflet integration** : Réutiliser code JavaScript
✅ **Mock data** : Transformer en seeder Prisma
✅ **Design cohérent** : Charte graphique déjà définie visuellement

### Problèmes Prototype (à corriger en prod)
❌ **Sécurité** : Passwords en clair, XSS possible
❌ **Duplication code** : 30% redondance (cards functions)
❌ **Pas de backend réel** : Tout en localStorage
❌ **Pas d'emails** : Système réservation incomplet
❌ **Tests** : Zéro testabilité

---

## 📋 PLANNING DÉTAILLÉ (12-20 OCTOBRE)

### Allocation Temps Globale
- **Développement** : 40h (62%)
- **Documents préparatoires** : 6h (9%)
- **Rédaction rapport** : 14h (22%)
- **Impression/Dépôt** : 4h (7%)
- **TOTAL** : 64 heures

### Jour par Jour

**JOUR 1 - 12 OCT (15h35-19h30 = 4h)** : Setup Nx
- Créer workspace Nx (Angular + NestJS)
- Installer dépendances (Material, Prisma, Leaflet)
- Configurer Tailwind CSS
- Setup Supabase + Prisma
- Générer composants de base
- **Livrable** : Architecture qui compile

**JOUR 2 - 13 OCT (8h)** : Backend BDD
- Schéma Prisma complet (User, Session, Location, Group, Reservation)
- `prisma db push` + seed data
- **Générer ERD** (dbdiagram.io) → PNG
- Migrer Header/Footer du prototype
- Modules NestJS + endpoints CRUD
- **Livrable** : API retourne données + ERD créé

**JOUR 3 - 14 OCT (8h)** : Backend Complet
- Module Reservations + relations
- Validation + error handling
- Tests endpoints
- CORS + sécurité
- **Livrable** : Backend 100% fonctionnel

**JOUR 4 - 15 OCT (8h)** : Authentification
- Supabase Auth configuration
- AuthService Angular + Supabase client
- Login/Register forms (Angular Material)
- AuthGuard + JWT backend
- Profil utilisateur éditable
- **Livrable** : Auth complète

**JOUR 5 - 16 OCT (8h)** : Sessions + Map
- SessionsListComponent + filtres
- SessionCardComponent (HTML/CSS prototype)
- LocationsMapComponent + Leaflet
- Markers cliquables + géolocalisation
- **Livrable** : Liste + carte fonctionnelles

**JOUR 6 - 17 OCT (8h + 2h soir)** : Groupes + Emails + Docs
- GroupsListComponent + GroupDetailComponent
- **Système email** (Resend.com + templates HTML)
- ReservationComponent + envoi emails
- **SOIR (20h-22h)** :
  - 🎨 Charte graphique (Canva) - 1h
  - 🗺️ Impact mapping (MindMeister) - 1h
- **Livrable** : Emails fonctionnels + Charte + Impact map

**JOUR 7 - 18 OCT (8h + 2h soir)** : Déploiement + Wireframes
- Service Worker + Manifest PWA
- Build production + déploiement (Vercel + Render)
- Tests prod + responsive
- **APRÈS-MIDI (16h-18h)** :
  - 📐 Wireframes formalisés (Figma + screenshots) - 2h
- **SOIR (20h-22h)** :
  - Introduction rapport - 2h
- **Livrable** : Site en ligne ✅ + Wireframes ✅ + Rapport 10%

**JOUR 8 - 19 OCT (12h)** : Rédaction Rapport Marathon
- **MATIN (8h-12h)** : Analyse + Conception (12 pages)
- **APRÈS-MIDI (14h-18h)** : Mise en œuvre + Conclusion (8 pages)
- **SOIR (20h-22h)** : Relecture + Annexes
- **Livrable** : Rapport 100% terminé (35+ pages)

**JOUR 9 - 20 OCT (4h)** : Impression + Dépôt
- Dernières corrections
- Export PDF
- **Impression 3 exemplaires reliés**
- Upload GitHub + itslearning
- **Dépôt secrétariat avant 12h**
- **Livrable** : TFE remis ✅

---

## 🗂️ STRUCTURE RAPPORT TFE (30+ PAGES)

### Table des Matières Prévue
1. **Page de garde** (1 page)
2. **Table des matières** (1 page)
3. **Introduction** (3 pages)
   - Contexte : problématique organisation JdR
   - Objectifs : connecter joueurs, faciliter logistique
   - Méthodes : Agile, user-centered design
4. **Analyse & Planification** (4 pages)
   - Planning d'exécution
   - Impact mapping
   - Charte graphique
   - Wireframes
   - Schéma BDD
5. **Conception** (5 pages)
   - Architecture Nx monorepo
   - Choix technologiques justifiés
   - Composants clés Angular
   - API endpoints NestJS
6. **Intégration Techniques** (3 pages)
   - Leaflet : markers, popups, géoloc
   - Système email : templates, Resend
7. **Mise en Œuvre** (4 pages)
   - Étapes de réalisation
   - Difficultés rencontrées
   - Solutions apportées
   - Déploiement
8. **Conclusion** (4 pages)
   - Évaluation personnelle
   - Adéquation méthodes ↔ résultat
   - Perspectives d'évolution
   - Démarche éco-responsable
9. **Bibliographie** (1 page)
10. **Annexes** (non compté)
    - Charte graphique PDF
    - Wireframes PDF
    - ERD BDD PNG
    - Impact mapping PNG
    - Screenshots app (10+)
    - Code snippets importants

**Total estimé** : 35-40 pages + annexes

---

## 🎯 GRILLE D'ÉVALUATION (400 POINTS)

### Critère 1 : Qualité Formelle Dossier (80 pts)
- Éléments présents et traités avec concision : 30 pts
- Objectifs définis ↔ résultat cohérents : 30 pts
- Forme claire et attractive : 20 pts

### Critère 2 : Qualité du Contenu (120 pts)
- Personnalisation du projet : 30 pts
- Périmètre traité avec professionnalisme : 30 pts
- Capacité de concrétisation : 30 pts
- Pertinence méthodes et moyens techniques : 30 pts

### Critère 3 : Maîtrise Mise en Œuvre (80 pts)
- Qualité du livrable (interface + fonctionnement) : 30 pts
- Étapes de réalisation maîtrisées : 30 pts
- Relations professionnelles (déontologie) : 20 pts

### Critère 4 : Présentation Orale (120 pts)
- Méthode de présentation synthétique : 20 pts
- Développement points technologiques : 40 pts
- Respect temps (15 min) : 20 pts
- Réponses aux questions : 40 pts

**Score estimé actuel** : 362/400 (90,5%)

---

## 🗃️ SCHÉMA BASE DE DONNÉES (PRISMA)

### Modèles Principaux

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  username  String   @unique
  password  String   // Hashed avec bcrypt
  bio       String?
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sessions      Session[]      // Sessions créées (MJ)
  reservations  Reservation[]  // Réservations faites
  groupMembers  GroupMember[]  // Appartenances groupes
}

model Session {
  id              String   @id @default(uuid())
  game            String   // "D&D 5e", "Pathfinder", etc.
  title           String
  description     String?
  date            DateTime
  location        String   // Nom du lieu
  online          Boolean  @default(false)
  level           String   // "Débutant", "Intermédiaire", "Expert"
  playersMax      Int
  playersCurrent  Int      @default(0)
  tagColor        String   @default("gray")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  mjId            String
  mj              User     @relation(fields: [mjId], references: [id])
  
  reservations    Reservation[]
}

model Location {
  id          String   @id @default(uuid())
  name        String
  city        String
  type        String   // "Bar", "Café", "Association", etc.
  rating      Float    @default(0)
  amenities   String[] // ["WiFi", "Tables de jeu", etc.]
  icon        String   @default("store")
  lat         Float    // Latitude pour carte
  lon         Float    // Longitude pour carte
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Group {
  id          String   @id @default(uuid())
  name        String
  games       String[] // ["D&D 5e", "Pathfinder"]
  location    String
  playstyle   String   // "Narratif", "Combat", "Exploration"
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
  role      String   @default("member") // "admin", "member"
  joinedAt  DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
  group     Group    @relation(fields: [groupId], references: [id])

  @@unique([userId, groupId])
}

model Reservation {
  id          String   @id @default(uuid())
  sessionId   String
  userId      String
  status      String   @default("pending") // "pending", "confirmed", "cancelled"
  message     String?  // Message optionnel du joueur
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  session     Session  @relation(fields: [sessionId], references: [id])
  user        User     @relation(fields: [userId], references: [id])
}
```

### Relations
- User (1) → (N) Session (MJ crée plusieurs sessions)
- User (N) → (N) Reservation → (N) Session (many-to-many)
- User (N) → (N) GroupMember → (N) Group (many-to-many)
- Session (1) → (N) Reservation

---

## 📦 COMMANDES UTILES

### Setup Initial
```bash
# Créer workspace Nx
npx create-nx-workspace@latest barades-nx \
  --preset=angular-nest \
  --appName=frontend \
  --style=scss \
  --nxCloud=skip

# Installer dépendances frontend
npm install @angular/material @angular/cdk @supabase/supabase-js leaflet @types/leaflet zod

# Installer dépendances backend
npm install @nestjs/config @prisma/client prisma bcrypt @types/bcrypt class-validator class-transformer

# Configurer Tailwind
npx nx g @nx/angular:setup-tailwind --project=frontend

# Initialiser Prisma
cd apps/backend
npx prisma init
```

### Développement
```bash
# Lancer frontend
npx nx serve frontend

# Lancer backend
npx nx serve backend

# Générer composant Angular
npx nx g @nx/angular:component features/sessions/sessions-list --project=frontend --standalone

# Générer service Angular
npx nx g @nx/angular:service core/services/auth --project=frontend

# Prisma : push schema vers DB
cd apps/backend
npx prisma db push

# Prisma : générer client
npx prisma generate
```

### Déploiement
```bash
# Build production
npx nx build frontend --prod
npx nx build backend --prod

# Déployer Vercel (frontend)
npx vercel --prod

# Déployer Render (backend)
# → Via dashboard Render.com
```

---

## 🚨 POINTS CRITIQUES À NE PAS OUBLIER

### Fonctionnalités Obligatoires
1. ✅ **API Maps** : Leaflet déjà intégré dans prototype
2. ⚠️ **Système email** : À implémenter Jour 6 (Resend.com)
3. ⚠️ **Sécurité** : Supabase Auth + bcrypt + Zod validation
4. ✅ **Front + Back office** : Navigation + gestion sessions

### Documents à Créer Absolument
1. ⏳ **Charte graphique** : Jour 6 soir (1h, Canva)
2. ⏳ **Impact mapping** : Jour 6 soir (1h, MindMeister)
3. ⏳ **Wireframes** : Jour 7 PM (2h, Figma + screenshots)
4. ⏳ **ERD BDD** : Jour 2 (30 min, dbdiagram.io) → vérifier si déjà exporté

### Risques Identifiés
- 🔴 **Débordement temps dev** → Stopper dev strictement 18 oct 18h
- 🔴 **Documents pas créés** → Planifiés explicitement J6-J7
- 🔴 **Rapport pas fini** → 12h dédiées J8 (pas de code!)
- 🟡 **Bugs déploiement** → Déployer J7 (buffer 1 jour)

---

## 💡 STRATÉGIE DE RÉUSSITE

### Réutilisation Prototype
1. **CSS Tailwind** : Copier `<style>` → `styles.scss` (100% réutilisable)
2. **HTML** : Migrer vers templates Angular (changer directives seulement)
3. **Mock data** : Transformer en seeder Prisma
4. **Leaflet code** : Adapter dans LocationsMapComponent
5. **Design** : Garder couleurs, typo, composants

### Priorisation Impitoyable
1. **MVP features** : Auth, Sessions, Map, Réservation email
2. **Nice to have** : Tests, Dashboard admin, Analytics (skip si temps)
3. **Focus** : Ce qui sera démontré au jury (parcours complet)

### Gestion Temps
- **Dev** : 40h max (62% du temps)
- **Docs** : 6h (9% du temps) → Planifié explicitement
- **Rapport** : 14h (22% du temps) → Jour 8 entier
- **Buffer** : 4h (7%) → Impression J9

---

## 📞 QUESTIONS FRÉQUENTES (POUR COPILOT)

### Q: Où en sommes-nous actuellement ?
**R** : 12 octobre 2025, ~16h45. Prototype HTML fonctionnel. Nouveau repo créé. Prêt à lancer setup Nx.

### Q: Quel fichier de planning suivre ?
**R** : `PLANNING_FINAL_REVISE.md` (le plus récent, avec documents préparatoires planifiés)

### Q: Le schéma BDD est-il fait ?
**R** : User a mentionné "le schéma de la bdd est fait". À confirmer si ERD généré ou juste schéma Prisma pensé.

### Q: Quels sont les livrables minimums ?
**R** :
1. Code GitHub avec app fonctionnelle en ligne
2. Rapport 30+ pages (3 exemplaires papier)
3. Documents préparatoires (charte, wireframes, impact map, ERD, planning)

### Q: Quelle est la prochaine action ?
**R** : Lancer setup Nx dans le nouveau repo (voir `SETUP_RAPIDE.md`)

### Q: Comment migrer du prototype ?
**R** : Voir `GUIDE_MIGRATION.md` (composants HTML → Angular, CSS copié tel quel)

### Q: Stack technique validée ?
**R** : Oui. Angular + NestJS + Nx + Supabase + Prisma + Tailwind + Leaflet

---

## 📚 FICHIERS RÉFÉRENCE CRÉÉS

Dans le repo `/home/theop/barades-prototype` :
- ✅ `PLANNING_FINAL_REVISE.md` : Planning jour par jour détaillé
- ✅ `SETUP_RAPIDE.md` : 18 étapes setup Nx (copier-coller)
- ✅ `GUIDE_MIGRATION.md` : Migration HTML → Angular
- ✅ `ANALYSE_COHERENCE_CDC.md` : Validation projet vs cahier des charges
- ✅ `REFACTORING_ANALYSIS.md` : Analyse prototype (10 problèmes)
- ✅ `ACTION_PLAN.md` : Plan refactoring (6 phases)
- ✅ `CODE_EXAMPLES.md` : Exemples transformations code
- ✅ `index.html` : Prototype fonctionnel (2523 lignes)

---

## 🎯 RÉSUMÉ POUR COPILOT

**Contexte** : Étudiant en TFE (Travail de Fin d'Études) avec deadline 20 octobre. Projet "Bar à Dés" = plateforme JdR (jeux de rôle). Prototype HTML fonctionnel de 2523 lignes à migrer vers Angular/NestJS/Nx en 7,5 jours.

**Stack** : Angular 18 + NestJS + Nx Monorepo + Supabase (PostgreSQL + Auth) + Prisma ORM + Tailwind CSS + Leaflet (Maps) + Resend (Emails)

**Livrables** : App en ligne + Code GitHub + Rapport 30+ pages imprimé + Documents préparatoires (charte, wireframes, impact map, ERD)

**Planning** : 64h total (40h dev, 6h docs, 14h rapport, 4h impression). Documents préparatoires planifiés Jours 6-7. Rapport Jour 8. Impression Jour 9.

**État actuel** : Nouveau repo créé. Prêt à démarrer setup Nx. Prototype existant à réutiliser (CSS, HTML, mock data, Leaflet).

**Prochaine étape** : Lancer `npx create-nx-workspace` et suivre `SETUP_RAPIDE.md`

**Fichier planning à suivre** : `PLANNING_FINAL_REVISE.md`

**Score estimé** : 362/400 pts (90,5%) si planning respecté et documents livrés

---

## 🔗 LIENS UTILES

- **Supabase** : https://supabase.com
- **Nx** : https://nx.dev
- **Prisma** : https://www.prisma.io
- **dbdiagram.io** : https://dbdiagram.io (ERD generator)
- **Canva** : https://www.canva.com (Charte graphique)
- **MindMeister** : https://www.mindmeister.com (Impact mapping)
- **Figma** : https://www.figma.com (Wireframes)
- **Resend** : https://resend.com (Email service gratuit)
- **Vercel** : https://vercel.com (Deploy frontend)
- **Render** : https://render.com (Deploy backend)

---

**Ce fichier contient TOUT le contexte nécessaire pour reprendre la conversation dans le nouveau repo.**

**Instructions pour Copilot** : Lire ce fichier en entier avant de fournir assistance. Référencer `PLANNING_FINAL_REVISE.md` pour le planning détaillé. Suivre `SETUP_RAPIDE.md` pour les commandes exactes. Utiliser `GUIDE_MIGRATION.md` pour migration prototype → Angular.

### 📦 Comment exploiter ce fichier dans un repo propre
- Copier `CONTEXT_PROJET_TFE.md`, `PLANNING_FINAL_REVISE.md`, `SETUP_RAPIDE.md`, `GUIDE_MIGRATION.md`, `ANALYSE_COHERENCE_CDC.md` et le prototype `index.html` dans le nouveau dépôt (`docs/` recommandé).
- Ouvrir ce fichier dans VS Code et demander à Copilot : « Lis CONTEXT_PROJET_TFE.md et aide-moi à continuer le projet ».
- Suivre les étapes du planning jour par jour en cochant les livrables chaque soir (20h) pour garantir l'avancement.

---

**Dernière mise à jour** : 12 octobre 2025, 16h45  
**Version** : 1.0 - Contexte initial complet  
**Auteur** : GitHub Copilot (assistant IA)  
**Usage** : Copier ce fichier dans le nouveau repo pour continuité conversation
