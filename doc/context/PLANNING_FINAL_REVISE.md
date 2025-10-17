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

### 📌 JOUR 2 : 13 OCT (8h) - ✅ TERMINÉ
**PHASE 1B + 2A : BACKEND BASE + BDD**

**Matin (8h-12h)** : Base de données ✅
- [x] **8h-10h** : Schéma Prisma complet + relations
  ```prisma
  User, Session, Location, Group, Reservation, GroupMember, Poll (nouveau!)
  ```
  - Table `Poll` : id, title, dates (String[]), votes (Json), groupId, createdAt
  - Relations : Group → Poll (one-to-many), User → Session (MJ), etc.
  - **BONUS** : 7 enums (SkillLevel, SessionLevel, ReservationStatus, GroupRole, LocationType, Playstyle, TagColor)
  - **BONUS** : 10 indexes optimisés (3 compound indexes)
  - **BONUS** : RLS (Row Level Security) production-ready script (430 lignes)
- [x] **10h-10h30** : `prisma db push` + génération client Prisma
- [x] **10h30-11h** : 📊 **GÉNÉRER ERD** → Export SVG (278 KB, Mermaid, 7 tables)
- [x] **11h-12h** : Seed data réaliste
  - 5 sessions (D&D, Catan, Poker, Pathfinder, Wingspan)
  - 3 locations avec coordonnées GPS réelles Brussels
  - 2 groupes avec descriptions (Brussels Adventurers Guild, Casual Board Gamers)
  - 5 users de test (alice, bob, carol, dave, eve) - password: `password123`
  - 1 poll exemple (dates one-shot campaign)
  - 10 réservations (mix PENDING/CONFIRMED)

**Après-midi (14h-18h)** : Backend API ✅
- [x] **14h-15h30** : Modules NestJS de base (sessions, locations, groups)
  - Générer resources : `npx @nestjs/cli generate resource`
  - Structure controllers + services + entities
  - PrismaModule global créé
- [x] **15h30-17h** : API Prisma queries
  - findAll() avec relations (host, location, members, reservations)
  - findOne() avec UUID params
  - OrderBy + include configurés
- [x] **17h-17h30** : Tests curl (GET endpoints)
  - ✅ GET /api/sessions → 5 sessions avec relations complètes
  - ✅ GET /api/locations → 3 locations avec sessions futures
  - ✅ GET /api/groups → 2 groups avec membres et poll
- [x] **CORS** : Configuré pour localhost:4200/4201
- [ ] **17h30-18h** : Migrer Header/Footer HTML → Angular components
  - **REPORTÉ** au Jour 3 (priorisation backend)

**✅ Livrable J2** : API retourne données ✅ + ERD 7 tables ✅ + Seed data ✅ + RLS sécurisé ✅
**📝 Note** : Header/Footer migration reportée, backend 100% fonctionnel prioritaire

---

### 📌 JOUR 3 : 14 OCT (8h) - ✅ TERMINÉ
**PHASE 2B : MIGRATION FRONTEND ANGULAR COMPLÈTE**

**Réalisations effectives** :

**Matin (8h-12h)** : Migration composants ✅
- [x] **8h-10h** : Services Angular pour API
  - ✅ SessionsService avec HttpClient (GET + POST/PATCH/DELETE implémentés)
  - ✅ LocationsService avec HttpClient (GET implémentés, CRUD stubs Jour 4)
  - ✅ GroupsService avec HttpClient (GET implémentés, CRUD stubs Jour 4)
  - ✅ Interfaces TypeScript complètes (Session, Location, Group)
  - ✅ Configuration environment.ts (apiUrl: localhost:3000/api)
- [x] **10h-12h** : Composants de pages
  - ✅ SessionsListPage (70 lignes) : liste sessions avec formatDate, getLevelLabel, getTagColorClass
  - ✅ LocationsListComponent (260 lignes) : liste lieux + carte Leaflet intégrée
  - ✅ GroupsListComponent (60 lignes) : liste groupes avec playstyle badges

**Après-midi (14h-18h)** : Intégration Leaflet + Navigation ✅
- [x] **14h-16h** : Intégration Leaflet maps
  - ✅ Installation leaflet@1.9.4 + @types/leaflet
  - ✅ Configuration Nx : assets CSS + images markers
  - ✅ Carte OpenStreetMap centrée sur Bruxelles
  - ✅ Markers colorés par type de lieu (red=GAME_STORE, orange=CAFE, green=BAR)
  - ✅ Popups HTML personnalisés avec infos lieux
  - ✅ Initialisation avec setTimeout(100) dans ngOnInit
  - ✅ Console logging étendu pour debugging
- [x] **16h-17h30** : Navigation complète
  - ✅ TopBar (12 lignes) : logo + liens Sessions/Lieux/Groupes + bouton connexion
  - ✅ SideNav (12 lignes) : menu latéral avec Accueil/Sessions/Groupes/Profil
  - ✅ AppLayout (12 lignes) : structure flex avec TopBar + (SideNav + Content) + Footer
  - ✅ Routing configuré dans app.routes.ts (lazy loading)
- [x] **17h30-18h** : Footer component
  - ✅ Footer (14 lignes) : 4 sections (Bar à Dés, Communauté, Ressources, Légal)
  - ✅ 13 liens internes + 5 liens externes (GitHub, Twitter, Instagram, Facebook, Discord)
  - ✅ Copyright dynamique avec currentYear
  - ✅ Responsive grid (2 colonnes mobile → 4 colonnes desktop)

**Tests unitaires** : ✅
- ✅ 22 tests passants (9 fichiers .spec.ts)
  - sessions-list.spec.ts : 3 tests (création, état initial)
  - locations-list.spec.ts : 4 tests (création, load, erreur, labels)
  - groups-list.spec.ts : 5 tests (création, load, erreur, labels, couleurs)
  - footer.spec.ts : 4 tests (création, année, sections, social links)
  - top-bar.spec.ts : 1 test (création)
  - side-nav.spec.ts : 1 test (création)
  - + 3 fichiers générés par Nx : app.spec.ts (2), home-page.spec.ts (1), app-layout.spec.ts (1)

**Documentation TFE** : ✅
- [x] 8 fichiers de rapport créés (~3 439 lignes) :
  1. rapport-jour3-00-index.md (index + métriques)
  2. rapport-jour3-01-overview.md (architecture Angular)
  3. rapport-jour3-02-services.md (Services + HttpClient)
  4. rapport-jour3-03-components.md (Composants de pages)
  5. rapport-jour3-04-leaflet.md (Intégration carte)
  6. rapport-jour3-05-navigation.md (Navigation + Layout)
  7. rapport-jour3-06-tests.md (Tests unitaires)
  8. rapport-jour3-07-issues.md (Problèmes rencontrés)

**Commits Git** : ✅
- [x] `e431ced` - feat(frontend): Day 3 - migrate Sessions/Locations/Groups pages
- [x] `4417bdb` - feat(frontend): add Footer component
- [x] `9063f58` - docs(jour3): add complete Day 3 migration documentation

**✅ Livrable J3** : 
- ✅ Frontend Angular 100% fonctionnel avec 3 pages (Sessions, Locations, Groups)
- ✅ Navigation complète (TopBar, SideNav, Footer)
- ✅ Carte Leaflet intégrée avec markers et popups
- ✅ 22 tests unitaires passants
- ✅ Documentation TFE complète et versionnée

**📝 Notes** :
- DTOs backend reportés au Jour 4 (focus migration frontend prioritaire)
- Backend CRUD (POST/PATCH/DELETE) implémenté pour SessionsService, stubbed pour Locations/Groups
- Leaflet map toujours visible (pas de toggle map/list dans cette version)
- Tests Leaflet non inclus (complexité DOM, mocking difficile)

---

### 📌 JOUR 4 : 15 OCT (8h) - ✅ TERMINÉ (Backend + Frontend Auth complet!)
**PHASE 3 : AUTHENTIFICATION COMPLÈTE (BACKEND + FRONTEND)**

**Réalisations effectives** :

**Backend NestJS** (4h effectives) :
- [x] **Architecture custom sans Passport.js** (approche Trilon)
  - Article de référence : https://trilon.io/blog/nestjs-authentication-without-passport
  - Choix pédagogique : code explicite pour TFE, contrôle total sur JWT
- [x] **Module Auth complet** (222 lignes de code)
  - ✅ `auth.controller.ts` : POST /auth/signup + POST /auth/login
  - ✅ `auth.service.ts` : Hash argon2 + JWT generation + validation
  - ✅ `auth.module.ts` : JwtModule config avec JWT_SECRET (1h expiration)
  - ✅ `dto/auth.dto.ts` : SignupDto + LoginDto
  - ✅ `guards/jwt-auth.guard.ts` : Protection routes (vérifie Authorization header)
- [x] **Sécurité renforcée**
  - ✅ Argon2 au lieu de bcrypt (recommandé OWASP, résistant GPU attacks)
  - ✅ Validation password : 12 caractères minimum
  - ✅ Validation confirmPassword match
  - ✅ Messages d'erreur génériques (anti user enumeration)
  - ✅ JWT payload : { sub: userId, username, email }
- [x] **Base de données**
  - ✅ Schema Prisma mis à jour (passwordHash, firstName, lastName)
  - ✅ Migration SQL créée : `update-user-auth.sql` (supprimée ensuite, redondante)
  - ✅ Migration appliquée : `npx prisma db push`
  - ✅ Seed migré vers argon2 (cohérence avec AuthService)
  - ✅ 5 users de test créés (password: `password123`)
- [x] **Tests fonctionnels validés** ✅
  - ✅ POST /auth/signup → Création compte + JWT retourné
  - ✅ POST /auth/login → Authentification + JWT retourné
  - ✅ GET /sessions → Route publique accessible
  - ✅ POST /sessions sans token → 401 Unauthorized ✅
  - ✅ POST /sessions avec token → Guard autorise l'accès ✅
- [x] **SessionsModule** : Import AuthModule + @UseGuards(JwtAuthGuard) sur POST

**Frontend Angular** (4h effectives - COMPLÉTÉ malgré prévision de report!) :
- [x] **AuthService** (127 lignes)
  - ✅ signup(), login(), logout() avec HttpClient
  - ✅ Gestion JWT dans localStorage
  - ✅ BehaviorSubject pour currentUser$ (Observable)
  - ✅ isAuthenticated(), getCurrentUser() helpers
- [x] **LoginComponent** (63 lignes + 55 HTML + 115 SCSS)
  - ✅ Formulaire réactif Angular Material
  - ✅ Validation côté client
  - ✅ Gestion erreurs avec snackbar
  - ✅ Redirection automatique après login
- [x] **RegisterComponent** (93 lignes + 106 HTML + 115 SCSS)
  - ✅ Formulaire avancé avec validation password
  - ✅ Indicateur force mot de passe visuel
  - ✅ Custom validator confirmPassword match
  - ✅ Champs firstName/lastName optionnels
- [x] **AuthGuard** (17 lignes)
  - ✅ Protection routes avec CanActivateFn
  - ✅ Redirection /login avec returnUrl query param
- [x] **HTTP Interceptor** (33 lignes)
  - ✅ Injection automatique Bearer token
  - ✅ Gestion erreurs 401 (logout + redirect)
- [x] **TopBar mis à jour**
  - ✅ Affichage conditionnel (Connexion/Profil selon état auth)
  - ✅ Dropdown menu utilisateur avec logout
- [x] **Proxy Configuration**
  - ✅ Résolution CSP/CORS pour développement
  - ✅ `/api` → `http://localhost:3000`

**Dépendances installées** :
- ✅ Backend : `@nestjs/jwt@11.0.1`, `argon2@0.44.0`
- ✅ Frontend : Angular Material 20.2.8 (déjà présent)

**Documentation** :
- [x] Rapport complet Jour 4 (4 fichiers, ~2200 lignes)
  - `rapport-jour4-00-index.md` : Vue d'ensemble + architecture
  - `rapport-jour4-01-frontend.md` : Détails implémentation Angular
  - `rapport-jour4-02-problemes-resolus.md` : Bugs et solutions
  - `rapport-jour4-03-bilan-final.md` : Métriques + commits
- [x] Mise à jour `doc/rapport-jour2-03-securite.md` avec architecture custom

**Commits Git** : ✅
- [x] `246b190` - feat(auth): implement custom JWT authentication without Passport
- [x] `9e57400` - docs: update planning Day 1-3 completed
- [x] `ea4c7fa` - docs: add Day 4 report (backend)
- [x] `7e12918` - docs: correct Day 4 report POST /sessions
- [x] `ac92d02` - feat(frontend): complete authentication system
- [x] `adc9231` - fix(frontend): configure proxy and improve UX
- [x] `a0f06bd` - chore(prisma): remove redundant update-user-auth.sql
- [x] `b3f3ee0` - docs(sql): add status note to enable-rls.sql

**✅ Livrable J4** : 
- ✅ Backend auth 100% fonctionnel (signup, login, JWT, guards)
- ✅ Frontend auth 100% fonctionnel (login, register, guard, interceptor)
- ✅ Tests validés (backend curl + frontend Jest)
- ✅ Documentation complète (2200+ lignes)
- ✅ Code propre et documenté (~1089 lignes de code auth)

**📝 Notes** :
- Architecture custom justifiée : ~30 lignes d'abstraction Passport vs contrôle total
- Argon2 choisi pour sécurité renforcée (vs bcrypt)
- JWT expiration : 1h (pas de refresh token pour MVP)
- **Frontend auth complété le même jour** (au lieu d'être reporté) grâce à bonne productivité
- Profil utilisateur éditable reporté au Jour 5 (feature secondaire)

---

### 📌 JOUR 5 : 16 OCT (8h) - ✅ TERMINÉ
**PHASE 4A : SESSIONS + MAP**

**Réalisations effectives** :
- ✅ `SessionsListPage` refactorée avec filtres combinables (type, disponibilités, recherche multi champs, description incluse) et compteur de filtres actifs.
- ✅ `SessionCardComponent` finalisé (badges statut, host/location optionnels, couleurs dynamiques `session.tagColor`, styles BEM, helpers `getTagColorClass`/`isFull`).
- ✅ `LocationsListComponent` enrichi : filtres croisés, markers typés, popups HTML avancés, géolocalisation utilisateur + auto-zoom vers le lieu le plus proche, synchronisation liste ↔ carte avec surbrillance.
- ✅ Suite de tests Jest élargie (sessions/locations) → 176 tests verts.
- ✅ Documentation « Jour 5 » corrigée et alignée sur le code + errata tenu à jour.

**Livrable J5** : Sessions (liste + carte) opérationnelles avec fonctionnalités avancées et documentation validée

---

### 📌 JOUR 6 : 17 OCT (8h + 2h soir) - ✅ EN COURS
**PHASE 4B : GROUPES + EMAILS + DOCUMENTS PRÉPARATOIRES**

**Réalisations effectives** :

**Matin (8h-12h)** : Groupes + Planning ✅
- [x] **8h-10h** : GroupsListComponent + GroupCardComponent
  - ✅ Liste groupes avec filtres par playstyle (CASUAL, HARDCORE, MIXED)
  - ✅ GroupCardComponent avec badges, descriptions, compteur membres
  - ✅ Navigation vers détails groupe
- [x] **10h-12h** : GroupDetailComponent + **système poll dates complet** ✅
  - ✅ Vote tracking par utilisateur avec détails (username + userId)
  - ✅ Calcul automatique meilleure date (max votes)
  - ✅ Backend CRUD complet (polls.controller.ts, polls.service.ts, DTOs)
  - ✅ Frontend PollWidgetComponent avec create/vote functionality
  - ✅ Tests E2E complets (voting.spec.ts, polls.spec.ts)
  - ⚠️ Flatpickr shift-select : présent dans prototype HTML, non migré Angular (date picker natif utilisé)
  - ⚠️ Page standalone `/plan/:id` : non implémentée (vote intégré dans GroupDetail)

**Après-midi (14h-18h)** : 🔥 SYSTÈME EMAIL (CRITIQUE!) ✅
- [x] **14h-15h** : NestJS + Resend.com integration complète
  - ✅ EmailService avec 3 méthodes (confirmation, host notification, reminder)
  - ✅ Configuration RESEND_API_KEY dans .env
- [x] **15h-16h30** : Templates HTML emails avec design professionnel
  - ✅ 3 templates HTML : confirmation-email.html, host-notification-email.html, session-reminder-email.html
  - ✅ Inline CSS avec gradient design (#667eea → #764ba2)
  - ✅ Belgian date formatting (fr-BE locale, Europe/Brussels timezone)
- [x] **16h30-17h30** : Intégration dans ReservationsService
  - ✅ Appel asynchrone sendReservationConfirmation() après création réservation
  - ✅ Notification host automatique
- [x] **17h30-18h** : Tests fonctionnels validés
  - ✅ Emails envoyés avec succès via Resend API
  - ✅ Templates HTML rendus correctement

**Soir (20h-22h)** : 📋 DOCUMENTS PRÉPARATOIRES (2h)
- [ ] **20h-21h** : 🎨 **CHARTE GRAPHIQUE** (Canva) ⏳
  - Moodboard (3-4 images inspiration)
  - Logo "Bar à Dés" (simple, lisible)
  - Palette couleurs (#667eea, #764ba2, #111827 déjà définis dans app)
  - Typographie (Inter déjà utilisée)
  - Composants UI (screenshots boutons, cartes)
  - Export PDF haute résolution
- [ ] **21h-22h** : 🗺️ **IMPACT MAPPING** (MindMeister/Excalidraw) ⏳
  - Objectif central : faciliter organisation JdR
  - 4 Acteurs : Joueurs, MJ, Lieux, Plateforme
  - Structure Besoins → Features (template disponible lignes 671+)
  - Export PNG haute résolution

**✅ Livrable J6** : 
- ✅ Emails 100% fonctionnels avec 3 templates professionnels
- ✅ Groupes avec système de poll/vote complet (backend + frontend + tests E2E)
- ✅ 57 tests E2E passants, 0 erreurs TypeScript
- ⏳ Charte graphique + Impact mapping (2h restantes ce soir)

**📝 Notes importantes** :
- Système email ET polls déjà complets (1 jour d'avance sur planning!)
- Flatpickr shift-select : existe dans prototype HTML (doc/context/index.html lignes 2251+), migration Angular optionnelle
- Page standalone planning : feature bonus, vote intégré dans GroupDetail suffit pour MVP
- **Prochaine priorité** : Documents préparatoires (2h ce soir) puis PWA + déploiement (demain)

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
- [x] Workspace Nx avec Angular + NestJS ✅
- [ ] Frontend Angular déployé sur Vercel ⏳
- [ ] Backend NestJS déployé sur Render ⏳
- [x] Base de données PostgreSQL (actuellement localhost, migration Render à faire) ✅
- [x] Système authentification fonctionnel (JWT custom sans Passport) ✅
- [x] Liste sessions avec filtres avancés (keyword, game, location, online/table, availability) ✅
- [x] Carte Leaflet avec markers + popups custom + sync liste + géolocalisation ✅
- [x] Système de réservation avec emails (Resend templates HTML) ✅
- [x] Groupes avec poll dates complet (vote tracking, calcul meilleure date, détails votes) ✅
- [ ] Page standalone planning `/plan/:id` (bonus feature, non critique) ⚠️
- [x] Profil utilisateur (lecture fonctionnelle, édition à finaliser) ⚠️
- [x] Profil utilisateur (lecture fonctionnelle, édition à finaliser) ⚠️
- [ ] PWA (manifest + service worker + offline-ready) ⏳
- [x] Responsive mobile + desktop + tablette ✅
- [ ] URL accessible publiquement (HTTPS) ⏳
- [x] Compte de test fonctionnel (5 users seed: alice_dm, bob_warrior, carol_newbie, dave_veteran, eve_explorer - password: password123) ✅
- [ ] *(Bonus si temps)* Forum communautaire OU FAQ dynamique ⚠️

### Documents Préparatoires (Annexes)
- [x] 📊 **Schéma BDD (ERD)** - Créé Jour 2 ✅ (7 tables, relations complètes)
- [ ] 🎨 **Charte graphique** - À créer Jour 6 soir ⏳
- [ ] 🗺️ **Impact mapping** - À créer Jour 6 soir ⏳
- [ ] 📐 **Wireframes + User flows** - À créer Jour 7 après-midi ⏳
- [x] 📅 **Planning d'exécution** - Déjà fait (`PLANNING_FINAL_REVISE.md`) ✅

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
