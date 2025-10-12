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
- [ ] **8h-10h** : Schéma Prisma complet
  ```prisma
  User, Session, Location, Group, Reservation, GroupMember
  ```
- [ ] **10h-10h30** : `prisma db push` + seed data
- [ ] **10h30-11h** : 📊 **GÉNÉRER ERD** (dbdiagram.io) → Export PNG
- [ ] **11h-12h** : Migrer Header/Footer HTML du prototype

**Après-midi (14h-18h)** : Backend API
- [ ] **14h-15h30** : Modules NestJS (sessions, locations, groups)
- [ ] **15h30-17h** : DTOs + Zod + endpoints CRUD
- [ ] **17h-18h** : Tests Thunder Client

**✅ Livrable J2** : API retourne données + ERD BDD créé

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
- [ ] **8h-10h** : SessionsListComponent + filtres
- [ ] **10h-11h** : SessionCardComponent (HTML/CSS prototype)
- [ ] **11h-12h** : Connexion API backend

**Après-midi (14h-18h)** : Carte interactive
- [ ] **14h-16h** : LocationsMapComponent + Leaflet
- [ ] **16h-17h** : Markers cliquables + popups
- [ ] **17h-18h** : Géolocalisation + zoom auto

**✅ Livrable J5** : Liste sessions + carte fonctionnelles

---

### 📌 JOUR 6 : 17 OCT (8h + 2h soir)
**PHASE 4B : GROUPES + EMAILS + DOCUMENTS PRÉPARATOIRES**

**Matin (8h-12h)** : Groupes
- [ ] **8h-10h** : GroupsListComponent + GroupCardComponent
- [ ] **10h-12h** : GroupDetailComponent + poll dates

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

**✅ Livrable J6** : Emails fonctionnels + Charte + Impact map créés

---

### 📌 JOUR 7 : 18 OCT (10h)
**PHASE 5 : PWA + DÉPLOIEMENT + WIREFRAMES + RAPPORT DÉBUT**

**Matin (8h-12h)** : Déploiement
- [ ] **8h-9h** : Service Worker + Manifest
- [ ] **9h-10h** : Build production
- [ ] **10h-11h** : Déployer Vercel (frontend)
- [ ] **11h-12h** : Déployer Render (backend) + test prod

**Après-midi (14h-18h)** : Polish + Wireframes
- [ ] **14h-15h** : Tests production + corrections bugs
- [ ] **15h-16h** : Responsive mobile
- [ ] **16h-18h** : 📐 **WIREFRAMES FORMALISÉS** (2h)
  - Screenshots prototype (10+ écrans)
  - Annotations Figma/Excalidraw (zones cliquables)
  - User flows (parcours inscription → réservation)
  - Sitemap (architecture pages)
  - Export PDF
- [ ] *(Option bonus si avance)* : `npx nx g @nx/angular:setup-ssr frontend` puis `npx nx g @nx/angular:setup-app-shell frontend` (App Shell / SSR)

**Soir (20h-22h)** : Rapport Introduction (2h)
- [ ] **20h-22h** : **Introduction** (3 pages)
  - Contexte : problématique organisation JdR
  - Objectifs : connecter communauté, faciliter logistique
  - Méthodes : Agile, user-centered design, prototypage

**✅ Livrable J7** : Site en ligne ✅ + Wireframes ✅ + Rapport 10%

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
  - Architecture Nx monorepo (diagramme)
  - Choix technologiques justifiés
    - Angular : TypeScript, standalone, performant
    - NestJS : MVC, scalable, decorators
    - Supabase : BaaS gratuit, PostgreSQL, auth
    - Prisma : type-safe, migrations faciles
  - Composants clés Angular (code snippets)
  - API endpoints NestJS (table endpoints)
- [ ] **11h30-12h** : **Intégration Maps + Email** (3 pages)
  - Leaflet : markers, popups, géoloc
  - Resend : templates, envoi asynchrone

**Après-midi (14h-18h)** : Conclusion + Finitions (4h → 8 pages)
- [ ] **14h-15h30** : **Mise en œuvre** (4 pages)
  - Étapes de réalisation (prototype → prod)
  - Difficultés rencontrées
    - Migration HTML → Angular (solution : copie CSS)
    - Gestion temps serré (solution : priorisation)
    - Système email (solution : Resend gratuit)
  - Tests et débogage
  - Déploiement (Vercel + Render)
- [ ] **15h30-17h** : **Conclusion** (4 pages)
  - Évaluation personnelle (compétences acquises)
  - Adéquation méthodes ↔ résultat
  - Perspectives d'évolution
    - Tests automatisés (Jest, Playwright)
    - Système de paiement (Stripe)
    - Notifications push
  - Section éco-responsable (Vercel carbon-neutral, PWA)
- [ ] **17h-17h30** : **Bibliographie**
  - Angular docs, NestJS docs, Prisma docs
  - Articles, tutorials utilisés
- [ ] **17h30-18h** : **Table des matières** + numérotation

**Soir (20h-22h)** : Relecture + Annexes (2h)
- [ ] **20h-21h** : **Annexes**
  - Charte graphique (PDF J6)
  - Wireframes (PDF J7)
  - ERD BDD (PNG J2)
  - Impact mapping (PNG J6)
  - Screenshots app (10+ captures)
  - Code snippets importants
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
- [ ] Système authentification fonctionnel
- [ ] Liste sessions avec filtres + carte Leaflet
- [ ] Système de réservation avec emails
- [ ] Groupes avec poll dates
- [ ] PWA (manifest + service worker)
- [ ] Responsive mobile + desktop
- [ ] URL accessible publiquement
- [ ] Compte de test fonctionnel

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
   - Utiliser Resend.com (gratuit, 100 emails/jour)
   
2. **Documents préparatoires créés** (Jours 6-7)
   - Charte graphique : 1h (Jour 6 soir)
   - Impact mapping : 1h (Jour 6 soir)
   - Wireframes : 2h (Jour 7 après-midi)
   - Sans ça → -20 pts

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
- Logo "Bar à Dés" (créé avec typo bold)
- Nom du projet
- Baseline : "Votre plateforme de Jeu de Rôle"

**Page 2 : Couleurs**
```
Primaire : #4f46e5 (Indigo) - CTA, liens
Secondaire : #111827 (Dark) - Background
Accent : #8b5cf6 (Purple) - Highlights
Succès : #10b981 (Green) - Confirmations
Erreur : #ef4444 (Red) - Alertes
Neutre : #6b7280 (Gray) - Textes
```

**Page 3 : Typographie**
- Titres : Inter Bold (700)
- Corps : Inter Regular (400)
- Accents : Inter SemiBold (600)

**Page 4 : Composants**
- Screenshots : Bouton primaire, Carte session, Input

---

### Impact Mapping (Structure MindMeister - 1h)

```
🎯 OBJECTIF : Faciliter l'organisation de sessions JdR

├─ 👤 JOUEURS
│  ├─ Besoin : Trouver sessions près de chez moi
│  │  └─ Feature : Carte interactive + filtres localisation
│  ├─ Besoin : Voir disponibilités
│  │  └─ Feature : Calendrier + badges dispo
│  └─ Besoin : Réserver facilement
│     └─ Feature : Formulaire réservation + email confirmation
│
├─ 🎲 MAÎTRES DE JEU
│  ├─ Besoin : Recruter joueurs
│  │  └─ Feature : Annonces sessions publiques
│  ├─ Besoin : Organiser dates
│  │  └─ Feature : Système de poll dates
│  └─ Besoin : Gérer groupe
│     └─ Feature : Dashboard MJ avec liste inscrits
│
└─ 🏠 LIEUX
   ├─ Besoin : Attirer clientèle
   │  └─ Feature : Profil lieu avec photos, horaires
   └─ Besoin : Gérer réservations
      └─ Feature : Calendrier disponibilités salles
```

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
