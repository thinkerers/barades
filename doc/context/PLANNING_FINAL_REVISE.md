# 🎯 PLANNING RÉVISÉ FINAL - TFE Bar à Dés

**DEADLINE ABSOLUE** : 20 octobre 2025 - Code en ligne + Rapport imprimé déposé  
**TEMPS DISPONIBLE** : 64 heures (12 oct 15h35 → 20 oct 12h00)

---

## ⚠️ CONTRAINTES CRITIQUES

1. **Code finalisé + site en ligne** : 18 octobre maximum (J+6)
2. **Rapport complet** : 19 octobre soir (J+7)
3. **Impression + dépôt** : 20 octobre matin (J+8)

---

## 📊 ALLOCATION TEMPS RÉVISÉE

| Phase | Heures | % | Deadline |
|-------|--------|---|----------|
| **Développement app** | 40h | 62% | 18 oct 18h |
| **Documents préparatoires** | 6h | 9% | 17-18 oct |
| **Rédaction rapport** | 14h | 22% | 19 oct 20h |
| **Impression/Dépôt** | 4h | 7% | 20 oct 12h |
| **TOTAL** | 64h | 100% | |

---

## 📅 PLANNING DÉTAILLÉ JOUR PAR JOUR

### 🔴 AUJOURD'HUI : 12 OCT (15h35-19h30 = 4h)
**PHASE 1A : SETUP ARCHITECTURE**

**15h35-16h00** : Préparation (25 min)
- [x] Créer compte Supabase (supabase.com)
- [x] Lire `SETUP_RAPIDE.md`

**16h00-17h30** : Setup Nx (1h30)
```bash
npx create-nx-workspace@latest barades-nx \
  --preset=angular-nest \
  --appName=frontend \
  --style=scss \
  --nxCloud=skip
```
- [x] Installer dépendances (Angular Material, Prisma, Leaflet)
- [x] Configurer Tailwind CSS

**17h30-18h30** : Configuration (1h)
- [x] Setup Prisma + .env Supabase
- [x] Copier CSS prototype → `styles.scss`
- [x] Créer structure dossiers

**18h30-19h30** : Premiers composants (1h)
- [x] Générer Header/Footer
- [x] Routing de base
- [x] Test compilation (`nx serve frontend`)

**19h30** : Commit Git
```bash
git add .
git commit -m "feat: initial Nx setup"
```

- [x] **✅ Livrable J1** : Workspace Nx qui compile

---

### 📌 JOUR 2 : 13 OCT (8h)
**PHASE 1B + 2A : BACKEND BASE + BDD**

**Matin (8h-12h)** : Base de données
- [ ] **8h-10h** : Schéma Prisma complet + relations
  ```prisma
  User, Session, Location, Group, Reservation, GroupMember, Poll (nouveau!)
  ```
  - Table `Poll` : id, title, dates (String[]), votes (Json), groupId, createdAt
  - Relations : Group → Poll (one-to-many), User → Session (MJ), etc.
- [ ] **10h-10h30** : `prisma db push` + génération client Prisma
- [ ] **10h30-11h** : 📊 **GÉNÉRER ERD** (dbdiagram.io) → Export PNG (7 tables)
- [ ] **11h-12h** : Seed data réaliste (transformé du prototype)
  - 6 sessions mock (D&D, Cthulhu, Cyberpunk, Vampire, Pathfinder)
  - 5 locations avec coordonnées GPS réelles
  - 4 groupes avec descriptions
  - 3 users de test
  - 1 poll exemple pour démo

**Après-midi (14h-18h)** : Backend API + Migration Header/Footer
- [ ] **14h-15h30** : Modules NestJS de base (sessions, locations, groups)
  - Générer resources : `nx g @nestjs/schematics:resource sessions`
  - Structure controllers + services + entities
- [ ] **15h30-17h** : DTOs + Zod schemas partagés
  - Créer lib Nx shared : `nx g @nx/js:library shared-models`
  - Zod schemas : CreateSessionDto, LocationDto, GroupDto
  - Exporter depuis lib pour réutilisation frontend
- [ ] **17h-17h30** : Tests Thunder Client (GET endpoints basiques)
- [ ] **17h30-18h** : Migrer Header/Footer HTML → Angular components
  - Copier HTML structure dans TopBar/SideNav
  - Adapter classes Tailwind (déjà configuré)

**✅ Livrable J2** : API retourne données + ERD 7 tables créé + Seed data + Header/Footer migrés

---

### 📌 JOUR 3 : 14 OCT (8h)
**PHASE 2B : BACKEND COMPLET**

**Matin (8h-12h)** : Finaliser API
- [ ] **8h-10h** : Module Reservations + relations
- [ ] **10h-11h** : Middleware validation + error handling
- [ ] **11h-12h** : Tests endpoints complets

**Après-midi (14h-18h)** : Backend finalisé
- [ ] **14h-16h** : CORS + env vars + sécurité
- [ ] **16h-17h** : Documentation API endpoints
- [ ] **17h-18h** : Seed data réaliste (10+ sessions, 5+ lieux)

**✅ Livrable J3** : Backend API 100% fonctionnel

---

### 📌 JOUR 4 : 15 OCT (8h)
**PHASE 3 : AUTHENTIFICATION**

**Matin (8h-12h)** : Supabase Auth
- [ ] **8h-9h** : Config Supabase Authentication
- [ ] **9h-11h** : AuthService Angular + Supabase client
- [ ] **11h-12h** : Login/Register forms (Angular Material)

**Après-midi (14h-18h)** : Sécurisation
- [ ] **14h-15h** : AuthGuard routes protégées
- [ ] **15h-16h30** : Backend NestJS JWT strategy
- [ ] **16h30-18h** : Profil utilisateur éditable

**✅ Livrable J4** : Auth complète fonctionnelle

---

### 📌 JOUR 5 : 16 OCT (8h)
**PHASE 4A : SESSIONS + MAP**

**Matin (8h-12h)** : Sessions
- [ ] **8h-10h** : SessionsListComponent + **filtres avancés**
  - Radio buttons (En ligne / Sur table / Tous)
  - Keyword search
  - Game system dropdown
  - Availability checkbox
- [ ] **10h-11h** : SessionCardComponent (HTML/CSS prototype)
- [ ] **11h-12h** : Connexion API backend

**Après-midi (14h-18h)** : Carte interactive
- [ ] **14h-16h** : LocationsMapComponent + Leaflet + **filtres lieux**
  - Checkboxes amenities (WiFi, Tables, Nourriture)
  - Type de lieu dropdown (Bar, Café, Boutique)
  - Keyword search
- [ ] **16h-17h** : Markers cliquables + popups custom (dark theme)
- [ ] **17h-18h** : Géolocalisation + zoom auto + sync liste ↔ carte

**✅ Livrable J5** : Liste sessions + carte fonctionnelles

---

### 📌 JOUR 6 : 17 OCT (8h + 2h soir)
**PHASE 4B : GROUPES + EMAILS + DOCUMENTS PRÉPARATOIRES**

**Matin (8h-12h)** : Groupes + Planning
- [ ] **8h-10h** : GroupsListComponent + GroupCardComponent
- [ ] **10h-12h** : GroupDetailComponent + **système poll dates complet**
  - Shift-select multi-dates (Flatpickr custom config)
  - Vote tracking par utilisateur
  - Calcul automatique meilleure date
  - Lien partageable généré
  - Page standalone `/plan/:id`

**Après-midi (14h-18h)** : 🔥 SYSTÈME EMAIL (CRITIQUE!)
- [ ] **14h-15h** : NestJS + Resend.com (gratuit, simple)
- [ ] **15h-16h30** : Templates HTML emails
- [ ] **16h30-17h30** : ReservationComponent + formulaire
- [ ] **17h30-18h** : Test envoi emails réels

**Soir (20h-22h)** : 📋 DOCUMENTS PRÉPARATOIRES (2h)
- [ ] **20h-21h** : 🎨 **CHARTE GRAPHIQUE** (Canva)
  - Moodboard (3-4 images inspiration)
  - Logo "Bar à Dés" (simple, lisible)
  - Palette couleurs (#4f46e5, #111827, #8b5cf6)
  - Typographie (Inter)
  - Composants UI (screenshots boutons, cartes)
  - Export PDF
- [ ] **21h-22h** : 🗺️ **IMPACT MAPPING** (MindMeister/Excalidraw)
  - Objectif central : faciliter organisation JdR
  - Acteurs : Joueurs, MJ, Lieux
  - Besoins → Features
  - Export PNG

**✅ Livrable J6** : Emails fonctionnels + Groupes avec poll complet + Charte + Impact map créés

---

### 📌 JOUR 7 : 18 OCT (10h)
**PHASE 5 : PWA + DÉPLOIEMENT + WIREFRAMES + RAPPORT DÉBUT + FEATURES BONUS**

**Matin (8h-12h)** : Déploiement + Bonus
- [ ] **8h-9h** : Service Worker + Manifest PWA
- [ ] **9h-10h** : Build production
- [ ] **10h-11h** : Déployer Vercel (frontend) + Render (backend)
- [ ] **11h-12h** : Tests prod + corrections bugs critiques
- [ ] *(Bonus si temps)* : Forum communautaire (catégories, topics, replies) OU FAQ dynamique avec recherche live

**Après-midi (14h-18h)** : Polish + Wireframes
- [ ] **14h-15h** : Tests production + responsive mobile
- [ ] **15h-16h** : Polish UI/UX (animations, transitions, loading states)
- [ ] **16h-18h** : 📐 **WIREFRAMES FORMALISÉS** (2h)
  - Screenshots prototype (10+ écrans : home, sessions, carte, groupes, profil, planning)
  - Annotations Figma/Excalidraw (zones cliquables, interactions)
  - User flows (parcours inscription → réservation → notification email)
  - Sitemap (architecture pages : 11 routes principales)
  - Export PDF
- [ ] *(Option bonus si avance)* : `npx nx g @nx/angular:setup-ssr frontend` puis `npx nx g @nx/angular:setup-app-shell frontend` (App Shell / SSR)

**Soir (20h-22h)** : Rapport Introduction (2h)
- [ ] **20h-22h** : **Introduction** (3 pages)
  - Contexte : problématique organisation JdR (coordination joueurs, recherche lieux)
  - Objectifs : connecter communauté, faciliter logistique, système planning collaboratif
  - Méthodes : Agile, user-centered design, prototypage rapide HTML → migration Angular
  - Périmètre : MVP (Auth, Sessions, Map, Groupes, Poll dates, Emails) + Bonus (Forum, FAQ)

**✅ Livrable J7** : Site en ligne ✅ + Wireframes ✅ + Rapport 10% + Features bonus potentielles

---

### 📌 JOUR 8 : 19 OCT (12h - JOURNÉE MARATHON RAPPORT)
**PHASE 6 : RÉDACTION RAPPORT COMPLÈTE**

**Matin (8h-12h)** : Développement (4h → 12 pages)
- [ ] **8h-9h30** : **Analyse & Planification** (4 pages)
  - Planning d'exécution (Gantt visuel)
  - Impact mapping (intégrer PNG créé J6)
  - Charte graphique (intégrer PDF créé J6)
  - Wireframes (intégrer PDF créé J7)
  - Schéma BDD (intégrer ERD créé J2)
- [ ] **9h30-11h30** : **Conception** (5 pages)
  - Architecture Nx monorepo (diagramme apps + libs)
  - Choix technologiques justifiés
    - Angular : TypeScript, standalone components, signals (Angular 18)
    - NestJS : MVC, scalable, decorators, compatible Prisma
    - Supabase : BaaS gratuit, PostgreSQL robuste, auth intégrée
    - Prisma : type-safe, migrations faciles, génération client auto
    - Tailwind : utility-first, réutilisable du prototype
    - Leaflet : open-source, lightweight, custom markers
    - Flatpickr : date picker personnalisable (shift-select)
  - Composants clés Angular (code snippets : AppLayout, SessionCard, PollDatePicker)
  - API endpoints NestJS (table endpoints : GET /sessions, POST /reservations, etc.)
  - Pattern de communication (HttpClient + RxJS Observables)
- [ ] **11h30-12h** : **Intégrations techniques critiques** (3 pages)
  - Leaflet : markers dynamiques, popups custom dark theme, géolocalisation, sync liste ↔ carte
  - Flatpickr : configuration shift-select multi-dates, locale FR, dark theme
  - Resend : templates HTML emails, envoi asynchrone, gestion erreurs
  - System de planning : algorithme calcul meilleure date (max votes), génération liens partageables

**Après-midi (14h-18h)** : Conclusion + Finitions (4h → 8 pages)
- [ ] **14h-15h30** : **Mise en œuvre** (4 pages)
  - Étapes de réalisation (prototype HTML → architecture Nx → migration composants)
  - Difficultés rencontrées
    - Migration HTML → Angular (solution : copie CSS Tailwind direct, adaptation directives)
    - Gestion temps serré (solution : priorisation MVP strict, features bonus conditionnelles)
    - Système email (solution : Resend gratuit, templates HTML inline CSS)
    - Système poll dates complexe (solution : Flatpickr custom config avec shift-select)
    - Synchronisation carte ↔ liste (solution : EventEmitter + state management)
  - Tests et débogage (Thunder Client API, tests manuels UI)
  - Déploiement (Vercel zero-config Angular + Render Dockerfile NestJS)
- [ ] **15h30-17h** : **Conclusion** (4 pages)
  - Évaluation personnelle (compétences acquises : Angular 18 signals, NestJS decorators, Prisma ORM, Leaflet API)
  - Adéquation méthodes ↔ résultat (prototypage validé, architecture monorepo efficace)
  - Perspectives d'évolution
    - Tests automatisés (Jest unit tests, Playwright e2e)
    - Système de paiement (Stripe pour premium features)
    - Notifications push (Web Push API + service worker)
    - Messagerie in-app (WebSockets pour chat groupes)
    - Analytics (Plausible privacy-friendly)
    - Système de rating/reviews lieux et MJ
    - Intégration calendrier (Google Calendar, iCal export)
    - Mode hors-ligne complet (IndexedDB sync)
  - Section éco-responsable (Vercel carbon-neutral, Render green hosting, PWA offline-first réduit data transfer)
- [ ] **17h-17h30** : **Bibliographie**
  - Angular docs, NestJS docs, Prisma docs
  - Articles, tutorials utilisés
- [ ] **17h30-18h** : **Table des matières** + numérotation

**Soir (20h-22h)** : Relecture + Annexes (2h)
- [ ] **20h-21h** : **Annexes**
  - Charte graphique (PDF J6) : logo, palette, typo, composants UI
  - Wireframes (PDF J7) : 11+ écrans annotés, user flows, sitemap
  - ERD BDD (PNG J2) : 6 tables avec relations
  - Impact mapping (PNG J6) : acteurs, besoins, features
  - Screenshots app (12+ captures) :
    - Home hero
    - Sessions liste + filtres
    - Carte interactive + popups
    - Groupe détail + poll dates
    - Planning standalone
    - Profil édition
    - Login/Register modals
    - Forum (si implémenté)
    - FAQ recherche (si implémenté)
    - Mobile responsive
  - Code snippets importants :
    - Shift-select Flatpickr config
    - Leaflet marker custom popup
    - Resend email template
    - Prisma schema complet
    - AuthGuard Angular
    - NestJS DTO + Zod validation
- [ ] **21h-22h** : **Relecture complète**
  - Orthographe + grammaire (Antidote/LanguageTool)
  - Cohérence sections
  - Vérif numérotation pages
  - Images bien intégrées

**✅ Livrable J8** : Rapport TFE 100% terminé (35+ pages)

---

### 📌 JOUR 9 : 20 OCT (4h) - JOUR DE REMISE
**PHASE 7 : IMPRESSION + DÉPÔT**

**Matin (8h-12h)** : Finalisation
- [ ] **8h-8h30** : Dernières corrections mineures
- [ ] **8h30-9h** : Export PDF final (vérif toutes pages OK)
- [ ] **9h-10h30** : 🖨️ **IMPRESSION 3 EXEMPLAIRES RELIÉS**
  - Repérer imprimerie proche (Copyshop, Bureau Vallée)
  - Reliure thermique ou spirale
  - Vérifier qualité impression
- [ ] **10h30-11h** : Upload final
  - GitHub : code + docs + PDF
  - itslearning : PDF rapport
- [ ] **11h-12h** : 📦 **DÉPÔT SECRÉTARIAT** (3 exemplaires papier)

**✅ MISSION ACCOMPLIE** : TFE remis dans les délais ! 🎉

---

## 📋 CHECKLIST FINALE LIVRABLES

### Code & Application
- [ ] Workspace Nx avec Angular + NestJS
- [ ] Frontend Angular déployé sur Vercel
- [ ] Backend NestJS déployé sur Render
- [ ] Base de données Supabase PostgreSQL
- [ ] Système authentification fonctionnel (Supabase Auth)
- [ ] Liste sessions avec filtres avancés (keyword, game, location, online/table, availability)
- [ ] Carte Leaflet avec markers + popups custom + sync liste
- [ ] Système de réservation avec emails (Resend templates HTML)
- [ ] Groupes avec poll dates complet (shift-select, calcul meilleure date, liens partageables)
- [ ] Page standalone planning `/plan/:id`
- [ ] Profil utilisateur éditable (bio, avatar upload preview, username)
- [ ] PWA (manifest + service worker + offline-ready)
- [ ] Responsive mobile + desktop + tablette
- [ ] URL accessible publiquement (HTTPS)
- [ ] Compte de test fonctionnel (email: demo@barades.com, mdp: demo123)
- [ ] *(Bonus si temps)* Forum communautaire OU FAQ dynamique

### Documents Préparatoires (Annexes)
- [ ] 📊 **Schéma BDD (ERD)** - Créé Jour 2 ✅
- [ ] 🎨 **Charte graphique** - Créé Jour 6 soir ⚠️
- [ ] 🗺️ **Impact mapping** - Créé Jour 6 soir ⚠️
- [ ] 📐 **Wireframes + User flows** - Créé Jour 7 après-midi ⚠️
- [ ] 📅 **Planning d'exécution** - Déjà fait (`PLANNING_FINAL_TFE.md`) ✅

### Rapport TFE (30+ pages)
- [ ] **Page de garde**
- [ ] **Table des matières**
- [ ] **Introduction** (3 pages) - Jour 7 soir
- [ ] **Analyse & Planification** (4 pages) - Jour 8 matin
- [ ] **Conception** (5 pages) - Jour 8 matin
- [ ] **Intégration techniques** (3 pages) - Jour 8 matin
- [ ] **Mise en œuvre** (4 pages) - Jour 8 après-midi
- [ ] **Conclusion** (4 pages) - Jour 8 après-midi
- [ ] **Bibliographie** (1 page) - Jour 8 après-midi
- [ ] **Annexes** (non compté) - Jour 8 soir

### Impression & Dépôt
- [ ] 3 exemplaires reliés imprimés
- [ ] PDF uploadé sur itslearning
- [ ] Code + PDF sur GitHub
- [ ] Déposé au secrétariat avant 12h le 20/10

---

## ⚠️ POINTS CRITIQUES À NE PAS MANQUER

### 🔴 ABSOLUMENT OBLIGATOIRE

1. **Système email fonctionnel** (Jour 6 après-midi)
   - Sans ça → -30 pts minimum
   - Utiliser Resend.com (gratuit, 100 emails/jour, templates HTML simples)
   
2. **Système poll dates complet** (Jour 6 matin)
   - Feature complexe : shift-select, calcul auto meilleure date, liens partageables
   - Justifie "Gestion planning collaboratif" dans le rapport
   - Démo impressionnante pour jury
   
3. **Documents préparatoires créés** (Jours 6-7)
   - Charte graphique : 1h (Jour 6 soir) → logo, palette, typo, composants
   - Impact mapping : 1h (Jour 6 soir) → acteurs, besoins, features
   - Wireframes : 2h (Jour 7 après-midi) → 11+ écrans annotés, user flows, sitemap
   - Sans ça → -20 pts minimum

3. **Site en ligne AVANT Jour 8** (Jour 7)
   - Jour 8 = 100% rédaction rapport
   - Pas le temps de débugger déploiement le Jour 8

4. **Rapport terminé Jour 8 soir** (19 oct 22h)
   - Jour 9 matin = impression uniquement
   - Pas de rédaction de dernière minute

---

## 🎯 RÉPARTITION TEMPS DOCUMENTS PRÉPARATOIRES

| Document | Quand | Durée | Outil | Livrable |
|----------|-------|-------|-------|----------|
| **ERD BDD** | Jour 2, 10h30 | 30 min | dbdiagram.io | PNG exporté |
| **Charte graphique** | Jour 6, 20h | 1h | Canva | PDF 2-3 pages |
| **Impact mapping** | Jour 6, 21h | 1h | MindMeister | PNG exporté |
| **Wireframes** | Jour 7, 16h | 2h | Figma + screenshots | PDF 5-10 pages |
| **Planning** | Déjà fait | ✅ | Markdown | Ce fichier |

**TOTAL** : 4h30 de création documents (planifié explicitement)

---

## 💡 TEMPLATES RAPIDES

### Charte Graphique (Structure Canva - 1h)

**Page 1 : Identité**
- Logo "Bar à Dés" (créé avec typo bold + icône dé stylisé)
- Nom du projet + sous-titre
- Baseline : "Votre plateforme de Jeu de Rôle"
- Moodboard (3-4 images ambiance JdR/dark theme)

**Page 2 : Couleurs**
```
Primaire : #4f46e5 (Indigo) - CTA, liens, hover states
Secondaire : #111827 (Dark Gray) - Background principal
Surface : #1f2937 (Gray-800) - Cards, modals
Accent : #8b5cf6 (Purple) - Highlights, tags
Succès : #10b981 (Green) - Confirmations, badges dispo
Erreur : #ef4444 (Red) - Alertes, badges complet
Neutre : #6b7280 (Gray) - Textes secondaires
Texte : #d1d5db (Light Gray) - Texte principal
```

**Page 3 : Typographie**
- Famille : Inter (Google Fonts)
- Titres (H1-H2) : Inter Bold (700), 32-48px
- Sous-titres (H3) : Inter SemiBold (600), 24px
- Corps : Inter Regular (400), 16px
- Accents/Tags : Inter Medium (500), 12-14px

**Page 4 : Composants UI**
- Screenshots annotés :
  - Bouton primaire (indigo, rounded, hover effect)
  - Carte session (glass-card avec glassmorphism)
  - Input form (dark, border focus indigo)
  - Tag système jeu (colored badges)
  - Modal (overlay + backdrop-blur)

---

### Impact Mapping (Structure MindMeister - 1h)

```
🎯 OBJECTIF CENTRAL : Faciliter l'organisation de sessions JdR et connecter la communauté

├─ 👤 ACTEUR 1 : JOUEURS
│  ├─ Besoin 1 : Trouver sessions près de chez moi
│  │  ├─ Feature : Carte interactive Leaflet avec markers
│  │  ├─ Feature : Filtres par ville/localisation
│  │  └─ Feature : Géolocalisation automatique
│  ├─ Besoin 2 : Voir disponibilités et places restantes
│  │  ├─ Feature : Badges "X/Y places" sur cartes
│  │  ├─ Feature : Filtre "places disponibles uniquement"
│  │  └─ Feature : Calendrier avec dates des sessions
│  ├─ Besoin 3 : Réserver facilement
│  │  ├─ Feature : Formulaire réservation one-click
│  │  ├─ Feature : Email confirmation automatique
│  │  └─ Feature : Suivi réservations dans profil
│  └─ Besoin 4 : Trouver un groupe régulier
│     ├─ Feature : Annuaire groupes avec filtres
│     ├─ Feature : Système de candidature groupes
│     └─ Feature : Planning collaboratif (poll dates)
│
├─ 🎲 ACTEUR 2 : MAÎTRES DE JEU (MJ)
│  ├─ Besoin 1 : Recruter joueurs pour mes sessions
│  │  ├─ Feature : Création annonces sessions publiques
│  │  ├─ Feature : Description, niveau, prérequis
│  │  └─ Feature : Notification email quand réservation
│  ├─ Besoin 2 : Organiser dates avec groupe
│  │  ├─ Feature : Système de poll dates multi-utilisateurs
│  │  ├─ Feature : Shift-select pour sélection multiple
│  │  ├─ Feature : Calcul automatique meilleure date
│  │  └─ Feature : Lien partageable pour vote externe
│  ├─ Besoin 3 : Gérer mon groupe / guilde
│  │  ├─ Feature : Dashboard MJ avec liste membres
│  │  ├─ Feature : Gestion des rôles (admin, membre)
│  │  └─ Feature : Historique des sessions passées
│  └─ Besoin 4 : Trouver lieux adaptés
│     ├─ Feature : Carte des bars/cafés ludiques
│     ├─ Feature : Filtres amenities (WiFi, Tables, Nourriture)
│     └─ Feature : Ratings et avis communautaires
│
├─ 🏠 ACTEUR 3 : LIEUX (Bars, Cafés, Boutiques)
│  ├─ Besoin 1 : Attirer clientèle rôlistes
│  │  ├─ Feature : Profil lieu avec photos, horaires, contact
│  │  ├─ Feature : Liste des amenities disponibles
│  │  └─ Feature : Positionnement géographique précis
│  ├─ Besoin 2 : Gérer visibilité sur plateforme
│  │  ├─ Feature : Badge "Partenaire officiel" (bonus)
│  │  └─ Feature : Statistiques de vues profil (bonus)
│  └─ Besoin 3 : Calendrier disponibilités salles (bonus)
│     └─ Feature : Système réservation salles privées (future)
│
└─ 🌐 ACTEUR 4 : PLATEFORME / COMMUNAUTÉ
   ├─ Besoin 1 : Encourager engagement
   │  ├─ Feature : Forum communautaire (bonus J7)
   │  ├─ Feature : FAQ dynamique avec recherche (bonus J7)
   │  └─ Feature : Système de rating/reviews (future)
   ├─ Besoin 2 : Sécurité et confiance
   │  ├─ Feature : Authentification Supabase sécurisée
   │  ├─ Feature : Validation données Zod côté front+back
   │  └─ Feature : Modération contenu (charte communauté)
   └─ Besoin 3 : Accessibilité offline
      ├─ Feature : PWA avec service worker
      ├─ Feature : Manifest installable
      └─ Feature : Mode offline partiel (cache)
```

**Export** : MindMeister → PNG haute résolution → Annexe rapport

---

### Wireframes (Structure Figma - 2h)

**À créer** :
1. **Page d'accueil** (screenshot + annotations)
2. **Liste sessions** (screenshot + flow filtres)
3. **Carte interactive** (screenshot + interactions)
4. **Formulaire réservation** (screenshot + validation)
5. **Profil utilisateur** (screenshot + édition)
6. **User flow complet** : Inscription → Recherche → Réservation

**Annotations à ajouter** :
- Zones cliquables (cercles rouges)
- Actions déclenchées (flèches)
- Composants réutilisables (encadrés)

---

## ℹ️ FONCTIONNALITÉS FUTURES (POST-TFE)

### 🎯 **Phase 2 : Améliorations UX (Sprint 1 semaine)**

1. **Location Images Gallery**
   - Table `location_images` avec foreign key vers `Location`
   - Carousel de photos dans la popup Leaflet
   - Upload multiple d'images côté admin
   - **Valeur** : Meilleure présentation des lieux partenaires

2. **Système de Ratings & Reviews**
   - Table `ratings` : user_id, location_id, event_id, score, comment
   - Notation 1-5 étoiles après chaque session
   - Agrégation moyenne pour locations (déjà présent : `Location.rating`)
   - **Valeur** : Confiance communautaire, feedback hosts

3. **Chat de Groupe en Temps Réel**
   - Table `messages` : group_id, user_id, content, created_at
   - WebSockets (Socket.io) pour messaging live
   - Notifications push (Web Push API + service worker)
   - **Valeur** : Coordination entre sessions, création de lien social

### 🎮 **Phase 3 : Features Jeu de Rôle (Sprint 2 semaines)**

4. **Fiches de Personnages**
   - Table `characters` : name, user_id, game_type, stats (JSON)
   - Formulaire création perso par système (D&D, Pathfinder, etc.)
   - Partage de fiche avec le groupe
   - **Valeur** : Attire communauté JdR, différenciation concurrents

5. **Event Availability (Alternative Poll Dates)**
   - Table `event_availability` : event_id, user_id, available_dates (JSON)
   - Interface calendar picker plus visuelle
   - Algorithme optimisation dates (max participants)
   - **Valeur** : Système poll plus puissant que l'actuel

### 💰 **Phase 4 : Monétisation (Sprint 1 semaine)**

6. **Liens Affiliés Produits**
   - Tables `affiliate_links` + `affiliate_purchases`
   - Tracking des clics et commissions (Amazon, Philibert, etc.)
   - Section "Matériel recommandé" par jeu
   - **Valeur** : Revenue stream passif

7. **Abonnement Premium**
   - Stripe integration pour paiements
   - Features premium : 
     - Groupes illimités (vs 3 gratuit)
     - Historique sessions illimité
     - Badge "Supporter" sur profil
     - Analytics avancées (taux remplissage sessions)
   - **Valeur** : Revenue récurrent, financement hosting

### 📊 **Phase 5 : Analytics & Admin (Sprint 1 semaine)**

8. **Dashboard Admin**
   - Plausible Analytics integration (privacy-friendly)
   - Métriques : DAU, sessions créées/semaine, taux conversion
   - Modération : signalement contenus, ban users
   - **Valeur** : Pilotage produit data-driven

9. **Email Marketing**
   - Resend newsletters (already using Resend for transactional)
   - Segmentation : joueurs inactifs, nouveaux, super-users
   - Templates : recap hebdo, nouvelles sessions, tips
   - **Valeur** : Retention, re-engagement

### 🌍 **Phase 6 : Scale & Performance (Sprint 2 semaines)**

10. **Migration PostgreSQL → Supabase Edge Functions**
    - Déplacer logique lourde côté DB (calcul poll dates, matchmaking)
    - Row-Level Security (RLS) pour sécurité renforcée
    - Realtime subscriptions pour live updates (alternative WebSockets)
    - **Valeur** : Scalabilité, coûts réduits

11. **Progressive Web App Avancée**
    - Mode offline complet (IndexedDB sync)
    - Installation native iOS/Android
    - Background sync réservations
    - Push notifications natives
    - **Valeur** : App-like experience, engagement mobile

12. **Intégration Calendriers Externes**
    - Export iCal (Google Calendar, Outlook, Apple Calendar)
    - Webhook synchronisation bidirectionnelle
    - Rappels automatiques 24h avant session
    - **Valeur** : Réduction no-shows, UX seamless

---

### 📈 **ROADMAP VISUELLE**

```
MVP (TFE - 7 jours)
├─ Auth + Sessions + Map + Groups + Polls + Emails
└─ 7 tables : User, Session, Location, Group, GroupMember, Reservation, Poll

Phase 2 (Post-TFE - 1 semaine)
├─ Location Images
├─ Ratings & Reviews
└─ Chat Temps Réel

Phase 3 (JdR Focus - 2 semaines)
├─ Character Sheets
└─ Advanced Event Availability

Phase 4 (Monétisation - 1 semaine)
├─ Affiliate Links
└─ Premium Subscriptions

Phase 5 (Analytics - 1 semaine)
├─ Admin Dashboard
└─ Email Marketing

Phase 6 (Scale - 2 semaines)
├─ Supabase Edge Functions
├─ Advanced PWA
└─ Calendar Integrations
```

---

### 🎓 **JUSTIFICATION POUR LE RAPPORT**

> **Section "Perspectives d'Évolution"**
>
> Le projet Bar à Dés a été conçu avec une architecture **MVP-first** respectant la contrainte de temps du TFE (7 jours), tout en gardant une structure extensible pour des itérations futures.
>
> **Phase 1 (MVP)** : 7 tables couvrant les fonctionnalités essentielles (authentification, sessions, carte, groupes, sondages de dates, emails de confirmation).
>
> **Phases 2-6 (Post-TFE)** : Intégration progressive de features avancées identifiées lors de la conception initiale mais volontairement reportées :
> - **UX** : galeries photos lieux, ratings, chat temps réel
> - **Jeu de Rôle** : fiches de personnages, disponibilités avancées
> - **Business** : liens affiliés, abonnements premium
> - **Scale** : analytics, marketing automation, optimisations performance
>
> Cette approche **lean startup** permet de valider le product-market fit avant d'investir dans des fonctionnalités complexes, tout en démontrant une vision produit à long terme.

---

## 🚨 ZONES DE RISQUE

| Risque | Probabilité | Impact | Prévention |
|--------|-------------|--------|------------|
| **Débordement temps dev** | 🟡 MEDIUM | 🔴 HIGH | Stopper dev strictement 18 oct 18h |
| **Documents pas créés** | 🔴 HIGH | 🔴 HIGH | Planifié explicitement J6 soir + J7 PM |
| **Rapport pas fini** | 🟡 MEDIUM | 🔴 CRITICAL | 12h dédiées J8 (pas de code!) |
| **Bugs déploiement** | 🟡 MEDIUM | 🟡 MEDIUM | Déployer J7 (buffer 1 jour) |
| **Impression ratée** | 🟢 LOW | 🔴 HIGH | PDF prêt J8 soir, imprimerie repérée J9 matin |

---

## ✅ VALIDATION QUOTIDIENNE

Chaque soir à 20h, vérifier :
- [ ] Livrable du jour terminé ?
- [ ] Commit Git fait ?
- [ ] Planning jour suivant clair ?
- [ ] Pas de blocage technique ?

---

**VOUS AVEZ TOUT CE QU'IL FAUT POUR RÉUSSIR ! 💪**

**Prochaine action** : Lancer setup Nx MAINTENANT (voir `SETUP_RAPIDE.md`)

---

**Dernière mise à jour** : 12 octobre 2025, 16h30  
**Ce planning garantit** : Code finalisé J7 + Tous documents créés J6-J7 + Rapport terminé J8
