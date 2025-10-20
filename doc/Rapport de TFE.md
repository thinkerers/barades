#documentation
# Rapport de Travail de Fin d'Études

## Barades - Application Web de Rencontre pour Joueurs

---

**Auteur :** Théophile Desmedt
**Formation :** Développeur Web Full Stack
**Institution :** IFAPME Tournai
**Année académique :** 2024-2025
**Promoteur :** Monsieur DURIBREUX GUILLAUME

---

## Remerciements

> [!info]- Remerciements
> Les remerciements dans un travail sont une section dédiée où l'auteur exprime sa gratitude envers les personnes et les organisations qui ont contribué à la réalisation du travail. Veillez à respecter la hiérarchie des personnes ressources.
>
> Voici une liste non exhaustive :
>
> - Remerciez votre superviseur pour son soutien, ses conseils et son encadrement tout au long du processus de recherche et d'écriture.
> - Si d'autres formateurs, membres du personnel ou collègues ont apporté leur aide ou leurs conseils, vous pouvez les remercier également.
> - Si votre travail implique une étude empirique, une recherche sur le terrain ou des entrevues, remerciez les participants pour leur contribution.
> - Exprimez votre reconnaissance envers vos proches pour leur soutien moral et émotionnel tout au long de vos études et de la rédaction du TFE.
> - Si votre travail implique des beta testeurs, n’hésitez pas à les remercier.
> - Si d'autres personnes ou organismes ont contribué de quelque manière que ce soit à votre travail, assurez-vous de les mentionner et de les remercier.
>
> ### Mentions spéciales
>
> Si certaines personnes ont joué un rôle particulièrement important dans votre travail, vous pouvez leur accorder une mention spéciale et expliquer en quoi leur contribution était significative.

Je remercie l'IFAPME Tournai et particulièrement Monsieur **PARFAIT Martial** ainsi que Monsieur **RACQUEZ François**, qui ont su être présent pour nous aider à approfondir les concepts avancés de JavaScript avec une grande pédagogie, essentielle pour réaliser ce projet.

Je suis reconnaissant envers Monsieur **Quentin MOUSSET**, qui m'a accepté en stage dans son agence. Je tiens également à remercier l'ensemble des formateurs: **BACHELY Vincent**, **DURIBREUX GUILLAUME**, **VAN ONACKER Michaël**, pour leurs conseils, leur patience et leur passion contagieuse pour le développement web.

Enfin, merci à ma famille et mes amis pour leur soutien essentiel.

---

## Table des matières

1. **À propos**
2. **Introduction**
   - 2.1. Contexte
   - 2.2. Problématique
   - 2.3. Objectifs
   - 2.4. Structure du dossier
3. **Développement**
   - 3.1. Analyse des besoins
   - 3.2. Gestion de projet
     - 3.2.1. Planning d'exécution
     - 3.2.2. Impact Mapping
   - 3.3. Conception
     - 3.3.1. Arborescence du site
     - 3.3.2. Wireframes
     - 3.3.3. Charte graphique
     - 3.3.4. Maquettes
   - 3.4. Base de données
     - 3.4.1. Modèle Conceptuel de Données (MCD)
     - 3.4.2. Modèle Logique de Données (ERD)
     - 3.4.3. Sécurité et Row Level Security
   - 3.5. Choix technologiques
     - 3.5.1. Front-end : Angular
     - 3.5.2. Back-end : NestJS
     - 3.5.3. Base de données : Supabase/PostgreSQL
     - 3.5.4. API externes
   - 3.6. Réalisation technique
     - 3.6.1. Architecture de l'application
     - 3.6.2. Fonctionnalités principales
     - 3.6.3. Intégration des APIs
     - 3.6.4. Tests et débogage
     - 3.6.5. Documentation automatisée
   - 3.7. Mise en production
     - 3.7.1. Déploiement
     - 3.7.2. Migration de la base de données
     - 3.7.3. Configuration
4. **Conclusion**
   - 4.1. Évaluation du travail accompli
   - 4.2. Difficultés rencontrées et solutions
   - 4.3. Perspectives d'évolution
   - 4.4. Bilan personnel
5. **Références bibliographiques**
6. **Annexes**
   - Annexe A : Charte graphique
   - Annexe B : Wireframes
   - Annexe C : Maquettes
   - Annexe D : Diagrammes de base de données (ERD, User Journeys)
   - Annexe E : Captures d'écran
   - Annexe F : Guide d'installation
   - Annexe G : Architecture Nx (Graphe de dépendances)
   - Annexe H : Code source significatif
   - Annexe I : Résultats des tests
   - Annexe J : Liens utiles

---

> [!info]- Introduction
> Présentation du projet, l’objectif du travail, du contexte et du brief client. Le sommaire de ce que l’on trouvera dans le travail pour éveiller l’intérêt du lecteur. Il faut donc motiver son lecteur en lui montrant la pertinence de votre travail. Il faut éviter de parler de ses états d’âme, de donner son avis personnel, de se lancer dans des développements prématurés.

# À propos

Passionné de sciences et de technologie, j'ai entrepris cette formation pour me donner les moyens de concrétiser mes idées. Je suis convaincu que les technologies du web représentent l'avenir. Qu'il s'agisse de créer des outils de productivité, comme j'ai eu l'opportunité de le faire chez BeDev et ConnectPeople, ou d'aider les gens à se rencontrer et partager des passions communes, comme avec Barades, je souhaite créer des choses qui ont du sens.

---

## Introduction

L'industrie mondiale du jeu de société connaît une croissance spectaculaire, avec un chiffre d'affaires estimé à 4,84 milliards de dollars d'ici 2027, soit une progression annuelle de 9,31 % entre 2022 et 2027 ([_Statistiques des jeux de société 2023 : une passion planétaire_](https://gusandco.net/2023/11/22/statistiques-jeux-de-societe-2023/#:~:text=Le%20chiffre%20d'affaires%20global,%C3%A0%20partir%20de%202022%2D27.)).

L'industrie voit paraître chaque année plus de 1200 nouveautés (https://www.lefigaro.fr/conso/1200-nouveautes-chaque-annee-la-surproduction-de-jeux-de-societe-met-elle-le-secteur-en-peril-20250727#:~:text=1200%20nouveaut%C3%A9s%20chaque%20ann%C3%A9e%20:%20la,elle%20le%20secteur%20en%20p%C3%A9ril%20), et ça seulement pour la France.

### Problématique

Face à ce raz de maré de possibilités, les consommateurs sont confrontés à une paralysie du choix. Les bars à jeux et ludothèques jouent un rôle crucial en permettant aux joueurs de tester des jeux avant de s'engager dans un achat coûteux.

Et pourtant, malgrès l'engouement des joueurs, les lieux ludique restent rares. Pour les non initiés, il est parfois difficile de savoir où se retrouver pour jouer, et quand.

C'est face à ce constat qu'est né le concept de Baradés, une application web ayant pour but d'aider les joueurs à se rencontrer et à découvrir de nouveaux lieux.

### Structure du dossier

Pour traiter ce sujet, ce dossier débutera par l'analyse détaillée des besoins, suivis et la phase de conception (Chapitre 3), suivie de la présentation de l'identité visuelle et de l'expérience utilisateur. Le développement technique détaillera les choix techniques et la mise en œuvre de l'application. Enfin, la conclusion offrira une évaluation personnelle du travail accompli.

---

## Développement

### 3.1. Analyse des besoins

Pour être efficace, un projet doit répondre à des besoins client spécifiques et y apporter des solutions. Plusieurs méthodes peuvent être utilisées pour reccueillir ces besoins: sondages, interviews, réunions, témoignages, etc. Ici, le choix étant libre, je suis mon propre client et connait donc mes besoins. Dans le cas de Baradés, qui s'addresse à des joueurs itinérants (clients), l'application doit être :

- **Utile**: plannification de sessions de jeux, découverte de personnes et de lieux
- **Satisfaisante**: chargement très rapide, navigation intuitive (UX), optimisé pour mobiles
- **Captivante**: design moderne (UI), interactivité
- **Sécurisée**: respecter la vie privée des utilisateurs
- **Pérenne**: elle doit pouvoir être mise a jour et évoluer
- **Ecologique**: consommer le moins de batterie/data possible, réduire les achats inutiles en permettant d'essayer les jeux

Une fois ces besoins identifiés, il faut également prendre en compte les contraintes de temps, de budget et d'expérience pour trouver la solution la plus adaptée et réaliste à chacun de ces problèmes. Cela permet d'établir la liste précise des objectifs qui seront livré au client, dans un délai déterminé.

Les fonctionnalités clés sont donc:

- Un site web single page évenementiel
- Carte interactive affichant des lieux ludiques
- Système de création de sessions de jeu avec inscription
- Cryptage des données
- Choix de technologies permettant le support sur le long terme
- Technologies gratuites et open source (autant que possible), car pas de budget pour le moment

---

### 3.2. Gestion de projet

#### 3.2.1. Déroulement

La phase de développement actif s'est déroulé en un sprint intensif de huit jours consécutifs, au cours duquel l'essentiel du code a été produit.

Pour optimiser cette phase et itérer rapidement, j'ai tiré parti de plusieurs modèles d'IA de manière ciblée :

- GPT-5-Codex pour les logiques de code complexes et précises
- Claude Sonnet 4.5 pour l'automatisation des tâches répétitives, notamment les migrations de données
- Gemini 2.5 Pro pour le prototypage rapide de composants d'UI

J'ai également mis en œuvre une approche de prompt engineering pour générer les API NestJS, en assurant la conformité avec des spécifications techniques précises, comme par exemple les principes de la clean architecture.

Ce sprint intensif a été précédé par un travail préparatoire essentiel, incluant l'établissement de l'impact map, la définition des user stories fondamentales et la configuration de l'environnement de base Nx.

- **Jour 1 :** prompt engineering, cadrage précis des agents pour la période de sprint, configuration de l'espace Nx/Prisma et mise en place de garde fous pour assurer la qualité du code, via tests e2e et tests unitaires.
- **Jour 2 :** mise en place du backend NestJS (modules, guards, validation), intégration des premières migrations Prisma et mise en place de Supabase.
- **Jours 3-4 :** production des micro-services métier (sessions, réservations, groupes) via agents LLM avec correction manuelle systématique, ajout de tests unitaires critiques.
- **Jours 5-6 :** composition de l'interface avec les composants Angular, harmonisation graphique et responsive, branchement aux endpoints.
- **Jour 7 :** amélioration des tests (Jest, Playwright ciblé), corrections manuelles, sécurisation RLS, durcissement de l'auth.
- **Jour 8 :** intégrations finales, audit de performance, préparation du déploiement et rédaction du rapport.

Le choix de NestJS et Angular découle directement de cette stratégie : la force de ces frameworks réside en leurs conventions strictes, leur typage fort et les outils en ligne de commandes qui laissent peu de place à l'erreur de la part des agents LLMS, ce qui en fait des outils efficaces bien qu'imparfaits.

#### 3.2.2. Impact Mapping

**Objectif principal :** Faciliter les rencontres entre joueurs de jeux de société

**Acteurs (WHO) :**

1. **Joueurs itinérants** : Personnes cherchant où jouer
2. **Organisateurs de sessions** : Joueurs créant des événements
3. **Propriétaires de lieux** : Bars à jeux, ludothèques, associations

**Impacts (HOW) :**

_Pour les joueurs itinérants :_

- Découvrir facilement des lieux ludiques près de chez eux
- Trouver des sessions de jeu disponibles
- Rejoindre une communauté

_Pour les organisateurs :_

- Créer des sessions de jeu
- Recruter des joueurs
- Gérer les inscriptions

_Pour les propriétaires de lieux :_

- Augmenter la visibilité de leur établissement
- Attirer de nouveaux clients
- Communiquer sur leurs événements

**Livrables (WHAT) :**

1. **Carte interactive**

   - Affichage géolocalisé des lieux ludiques
   - Filtres par type de lieu
   - Navigation vers les établissements

2. **Système de sessions**

   - Création de sessions de jeu
   - Inscription/désinscription
   - Notifications
   - Gestion du nombre de places

3. **Profils utilisateurs**

   - Authentification sécurisée
   - Gestion des préférences
   - Historique des sessions

4. **Interface responsive**
   - Application mobile-first
   - Performance optimale (design épuré, assets légers)
   - SPA avec support offline (PWA)

---

### 3.3. Conception

#### 3.3.1. Arborescence du site

```
Racine ('')
├── '' → HomePage
├── sessions
│   ├── '' → SessionsListPage
│   ├── new → SessionCreateComponent (authGuard)
│   ├── :id → SessionDetailComponent
│   └── :id/edit → SessionEditComponent (authGuard)
├── locations → LocationsListComponent
├── groups
│   ├── '' → GroupsListComponent
│   └── :id → GroupDetailComponent
├── forum → ForumPage
├── charter → CharterPage
├── profile → ProfilePage (authGuard)
├── dashboard → DashboardPage (authGuard)
├── showcase → ShowcasePage
├── about → AboutPage
├── careers → CareersPage
├── contact → ContactPage
└── help → HelpPage
```

#### 3.3.2. Wireframes

Voici quelques unes des pages du site

![Wireframe de la page d'accueil](rapport/8.%20Table%20des%20figures/wireframes_accueil.png)

![Wireframe de la carte des lieux](rapport/8.%20Table%20des%20figures/wireframe_lieux.png)

![Wireframe de l'espace groupes](rapport/8.%20Table%20des%20figures/wireframes_groupes.png)

La navigation est pensée pour être la plus intuitive possible.

#### 3.3.3. Charte graphique

**Palette de couleurs :**

- Couleur principale : Indigo profond `#6366f1` (hover `#4f46e5`, focus `#818cf8`)
- Couleurs secondaires : Fonds sombres `#0f1419`, `#1a1d2e`, `#262b3d` pour renforcer le contraste
- Couleurs de texte : `#f9fafb` (principal), `#d1d5db` (secondaire), `#9ca3af` (tertiaire)
- Couleurs d'état : Succès `#10b981`, Erreur `#ef4444`, Alerte `#f59e0b`, Info `#3b82f6`

**Typographie :**

- Titres : `Inter` (gras 700 pour H1/H2, medium 600 pour H3/H4)
- Corps de texte : `Inter` taille 1rem, graisse 400 avec un interlignage 1.5
- Pile de secours : `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`
- Hiérarchie : H1 2.5rem, H2 2rem, H3 1.5rem, H4 1.25rem, H5 1.125rem, H6 1rem

**Logo et identité visuelle :**

![Logo Barades](rapport/8.%20Table%20des%20figures/logo_barade.svg)

- Le logo combine un pion, un dé et un livre de règle, pour symboliser les jeux sur tables.

#### 3.3.4. Maquettes

Voici quelques unes des pages du site:

- ![Layout accueil](rapport/8.%20Table%20des%20figures/layout_accueil.png)
- ![Layout groups](rapport/8.%20Table%20des%20figures/layout_groups.png)
- ![Layout lieux](rapport/8.%20Table%20des%20figures/layout_lieux.png)

---

### 3.4. Base de données

#### 3.4.1. Modèle Conceptuel de Données (MCD)

[TODO: Insérer le diagramme MCD]

Le modèle conceptuel identifie les entités principales et leurs relations :

**Entités principales :**

- **User** : Utilisateurs de l'application
- **Location** : Lieux ludiques (bars à jeux, ludothèques)
- **Session** : Sessions de jeu organisées
- **Group** : Groupes de joueurs
- **Poll** : Sondages pour choisir des jeux
- **Reservation** : Réservations de places dans les sessions

**Relations :**

- Un User peut créer plusieurs Sessions (1,n)
- Un User peut participer à plusieurs Sessions (n,n)
- Une Session se déroule dans un Location (n,1)
- Une Session peut avoir plusieurs Polls (1,n)
- Un User peut rejoindre plusieurs Groups (n,n)

#### 3.4.2. Modèle Logique de Données (ERD)

[TODO: Insérer le diagramme ERD]

**Structure des tables principales :**

```sql
-- Table users (gérée par Supabase Auth)
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP
)

-- Table locations
locations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  type TEXT, -- 'bar', 'library', 'association'
  description TEXT,
  created_at TIMESTAMP
)

-- Table sessions
sessions (
  id UUID PRIMARY KEY,
  creator_id UUID REFERENCES users(id),
  location_id UUID REFERENCES locations(id),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL,
  max_participants INTEGER,
  status TEXT, -- 'open', 'full', 'closed'
  created_at TIMESTAMP
)

-- Table reservations
reservations (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  user_id UUID REFERENCES users(id),
  status TEXT, -- 'confirmed', 'pending', 'cancelled'
  created_at TIMESTAMP,
  UNIQUE(session_id, user_id)
)

-- Table groups
groups (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES users(id),
  created_at TIMESTAMP
)

-- Table polls
polls (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  question TEXT NOT NULL,
  options JSONB,
  created_at TIMESTAMP
)
```

**Génération automatique du diagramme ERD :**

Pour maintenir la documentation à jour avec le schéma de la base de données, le projet utilise **Prisma ERD Generator**, un outil qui génère automatiquement un diagramme visuel à partir du fichier `schema.prisma`.

**Configuration dans `schema.prisma` :**

```prisma
generator erd {
  provider = "prisma-erd-generator"
  output   = "../../../doc/database-erd.svg"
  theme    = "forest"  // Thème adapté au design de l'application
}
```

**Avantages de cette approche :**

- ✅ **Synchronisation automatique** : Le diagramme est régénéré à chaque modification du schéma
- ✅ **Documentation vivante** : Toujours à jour avec la structure réelle de la base
- ✅ **Format vectoriel (SVG)** : Qualité d'image parfaite pour l'impression du rapport
- ✅ **Visualisation complète** : Tables, champs, types de données et relations
- ✅ **Gain de temps** : Plus besoin de dessiner manuellement le diagramme

**Génération du diagramme :**

```bash
# Commande unique qui génère à la fois le client Prisma et le diagramme ERD
npx prisma generate
```

**Résultat :**

```
✔ Generated Prisma Client to ./generated/prisma in 128ms
✔ Generated Entity-relationship-diagram to ./doc/database-erd.svg in 2.75s
```

Le fichier `database-erd.svg` généré (278 KB) contient :

- Les 7 tables du schéma (User, Session, Location, Reservation, Group, Poll, GroupMember)
- Tous les champs avec leurs types (String, DateTime, Int, Boolean, Json, etc.)
- Les relations et cardinalités (1:n, n:n)
- Les clés primaires et étrangères
- Les contraintes d'unicité

_Voir le diagramme complet en Annexe D_

#### 3.4.3. Sécurité et Row Level Security

**Pourquoi Supabase ?**

Supabase a été choisi pour plusieurs raisons :

- **PostgreSQL** : Base de données robuste et open source
- **Row Level Security (RLS)** : Sécurité au niveau des lignes
- **API REST et Realtime** : Génération automatique d'API
- **Authentification intégrée** : Gestion complète des utilisateurs
- **Hébergement gratuit** : Tier gratuit généreux pour démarrer

**Mise en place de la Row Level Security (RLS) :**

La RLS est une fonctionnalité de PostgreSQL qui permet de définir des politiques de sécurité au niveau des lignes de données. Cela garantit que les utilisateurs ne peuvent accéder qu'aux données qui leur appartiennent ou qu'ils sont autorisés à voir.

**Exemple de politique RLS pour les sessions :**

```sql
-- Activer RLS sur la table sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut voir les sessions
CREATE POLICY "Sessions are viewable by everyone"
ON sessions FOR SELECT
USING (true);

-- Politique : Seul le créateur peut modifier sa session
CREATE POLICY "Users can update their own sessions"
ON sessions FOR UPDATE
USING (auth.uid() = creator_id);

-- Politique : Seul le créateur peut supprimer sa session
CREATE POLICY "Users can delete their own sessions"
ON sessions FOR DELETE
USING (auth.uid() = creator_id);

-- Politique : Les utilisateurs authentifiés peuvent créer des sessions
CREATE POLICY "Authenticated users can create sessions"
ON sessions FOR INSERT
WITH CHECK (auth.uid() = creator_id);
```

**Sécurité des réservations :**

```sql
-- Activer RLS sur les réservations
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Politique : Voir ses propres réservations et celles des sessions qu'on organise
CREATE POLICY "Users can view relevant reservations"
ON reservations FOR SELECT
USING (
  auth.uid() = user_id
  OR
  auth.uid() IN (
    SELECT creator_id FROM sessions WHERE id = reservations.session_id
  )
);

-- Politique : Créer une réservation pour soi-même
CREATE POLICY "Users can create their own reservations"
ON reservations FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**Avantages de cette approche :**

- ✅ Sécurité au niveau de la base de données
- ✅ Pas besoin de vérifications côté serveur
- ✅ Protection contre les injections SQL
- ✅ Performance optimale (filtrage au niveau du moteur PostgreSQL)

---

### 3.5. Choix technologiques

#### 3.5.1. Front-end : Angular

Selon l'enquête "[State of JavaScript 2024](https://2024.stateofjs.com/en-US/libraries/front-end-frameworks/#front_end_frameworks_work)", Angular se classe comme le troisième framework front-end le plus utilisé au monde, se positionnant derrière React et Vue.js.

Cependant, Angular possède un atout structurel majeur par rapport à ses concurrents : c'est un framework "opinionné" (opinionated). Il impose un cadre et des bonnes pratiques de développement, ce qui est idéal pour un développeur junior souhaitant construire un projet robuste, **évolutif** et **pérenne**.

**Avantages d'Angular pour ce projet :**

1. **Structure claire** : Architecture modulaire imposée qui facilite l'organisation du code
2. **TypeScript natif** : Typage fort qui réduit les bugs et améliore la maintenabilité
3. **Outils intégrés** : Router, HTTP client, Forms, tout est inclus
4. **CLI puissant** : Génération de code, builds, tests automatisés
5. **Écosystème mature** : Documentation complète, grande communauté
6. **Performance** : Change detection optimisée, lazy loading natif
7. **PWA** : Support intégré pour Progressive Web Apps
8. **Signals** : Nouvelle approche réactive (Angular 16+) pour une meilleure performance

**Technologies complémentaires :**

- **Angular Material** ou **PrimeNG** : Bibliothèques de composants UI
- **RxJS** : Programmation réactive pour gérer les flux de données
- **Nx** : Monorepo tooling pour gérer le projet full-stack

#### 3.5.2. Back-end : NestJS

NestJS est **massivement inspiré par Angular** :

- **Architecture partagée :** Il utilise la même structure (Modules, Services/Providers, Controllers).
- **Injection de Dépendances :** Il implémente le même système d'injection de dépendances, facilitant la gestion du code et les tests.
- **TypeScript natif :** Tout comme Angular, NestJS est entièrement basé sur TypeScript, assurant une cohérence de langage et de typage sur l'ensemble de la stack (full-stack).

À l'inverse d'un micro-framework comme Express.js, qui laisse le développeur seul face à l'architecture, NestJS **impose une structure et des bonnes pratiques**. Pour un projet qui vise la **pérennité** et la maintenabilité, c'est un atout majeur. Cela garantit que le projet reste organisé à mesure qu'il grandit.

NestJS est **massivement inspiré par Angular** :

- **Architecture partagée :** Il utilise la même structure (Modules, Services/Providers, Controllers).
- **Injection de Dépendances :** Il implémente le même système d'injection de dépendances, facilitant la gestion du code et les tests.
- **TypeScript natif :** Tout comme Angular, NestJS est entièrement basé sur TypeScript, assurant une cohérence de langage et de typage sur l'ensemble de la stack (full-stack).

À l'inverse d'un micro-framework comme Express.js, qui laisse le développeur seul face à l'architecture, NestJS **impose une structure et des bonnes pratiques**. Pour un projet qui vise la **pérennité** et la maintenabilité, c'est un atout majeur. Cela garantit que le projet reste organisé à mesure qu'il grandit.

**Avantages de NestJS :**

1. **Synergie avec Angular** : Même logique, même patterns, courbe d'apprentissage réduite
2. **Architecture modulaire** : Séparation claire des responsabilités
3. **Décorateurs** : Code expressif et lisible (@Get(), @Post(), @Body(), etc.)
4. **Validation automatique** : class-validator et class-transformer intégrés
5. **Documentation auto-générée** : Swagger/OpenAPI natif
6. **Testing** : Framework de test intégré (Jest)
7. **Écosystème riche** : Nombreux modules officiels (Auth, TypeORM, Prisma, etc.)

**Modules NestJS utilisés dans le projet :**

- `@nestjs/common` : Core framework
- `@nestjs/config` : Gestion de la configuration
- `@nestjs/jwt` : Authentification JWT
- `@nestjs/passport` : Stratégies d'authentification
- `@nestjs/swagger` : Documentation API

#### 3.5.3. Base de données : Supabase/PostgreSQL

**Choix de Supabase :**

Supabase est une alternative open source à Firebase, construite sur PostgreSQL.

**Avantages :**

1. **PostgreSQL** : Base de données relationnelle robuste et mature
2. **Open source** : Code source accessible, pas de vendor lock-in
3. **Row Level Security** : Sécurité au niveau des lignes
4. **API REST auto-générée** : Pas besoin de tout coder manuellement
5. **Realtime** : WebSockets pour les mises à jour en temps réel
6. **Storage** : Stockage de fichiers (avatars, images)
7. **Auth intégré** : Authentification avec email, OAuth, magic links
8. **Tier gratuit** : 500 Mo de stockage, 2 Go de bande passante

**Alternatives considérées :**

- **Prisma + PostgreSQL** : Très bon mais nécessite plus de configuration
- **MongoDB** : NoSQL, moins adapté pour des données relationnelles
- **Firebase** : Propriétaire, prix élevé à grande échelle

#### 3.5.4. API externes

**OpenStreetMap & Leaflet :**

Pour la carte interactive affichant les lieux ludiques :

- **OpenStreetMap** : Données cartographiques open source
- **Leaflet** : Bibliothèque JavaScript légère pour cartes interactives
- **Nominatim** : Géocodage (conversion adresse ↔ coordonnées)

**Avantages :**

- ✅ 100% gratuit et open source
- ✅ Pas de limite d'API calls (avec cache approprié)
- ✅ Personnalisation totale de l'apparence
- ✅ Performances excellentes

**Alternative considérée :**

- **Google Maps API** : Payante après quota gratuit, moins de contrôle

---

### 3.6. Réalisation technique

#### 3.6.1. Architecture de l'application

**Architecture Monorepo avec Nx :**

Le projet utilise Nx pour gérer un monorepo contenant :

```
barades/
├── apps/
│   ├── frontend/          # Application Angular
│   ├── backend/           # API NestJS
│   ├── frontend-e2e/      # Tests E2E Playwright
│   └── backend-e2e/       # Tests E2E API
├── packages/
│   └── ui/                # Bibliothèque de composants partagés
└── doc/                   # Documentation
```

**Avantages du monorepo :**

- 📦 Code partagé entre front et back (types TypeScript, interfaces)
- 🔄 Un seul git repository, versioning cohérent
- 🧪 Tests intégrés pour tout le projet
- 🚀 Déploiements coordonnés
- 🎯 Nx optimise les builds (cache, affected commands)
- 📊 Visualisation des dépendances avec `nx graph`

**Outils de documentation intégrés :**

Le monorepo Nx inclut des outils de documentation et visualisation :

- **Nx Graph** : Graphe interactif des dépendances entre apps et libraries
- **Prisma ERD Generator** : Génération automatique du diagramme de base de données
- **Mermaid CLI** : Création de diagrammes de flux et user journeys

Ces outils permettent de maintenir automatiquement une documentation technique à jour, synchronisée avec le code source.

**Architecture Angular (Frontend) :**

```
apps/frontend/src/app/
├── core/                  # Services singleton (auth, http)
│   ├── auth/
│   ├── services/
│   └── guards/
├── shared/                # Composants réutilisables
│   ├── components/
│   ├── directives/
│   └── pipes/
├── features/              # Modules fonctionnels
│   ├── map/              # Carte des lieux
│   ├── sessions/         # Gestion des sessions
│   ├── profile/          # Profil utilisateur
│   └── auth/             # Login/Signup
└── app.routes.ts         # Routes de l'application
```

**Architecture NestJS (Backend) :**

```
apps/backend/src/
├── app/                   # Module racine
├── auth/                  # Authentification
│   ├── guards/
│   ├── strategies/
│   └── decorators/
├── users/                 # Gestion utilisateurs
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── sessions/              # Gestion des sessions
├── locations/             # Gestion des lieux
├── reservations/          # Réservations
├── groups/                # Groupes
├── polls/                 # Sondages
├── prisma/                # Client Prisma
│   └── prisma.service.ts
└── main.ts                # Point d'entrée
```

**Flux de données :**

```
User → Frontend (Angular) → API (NestJS) → Database (PostgreSQL/Supabase)
                ↓                               ↓
           Local State                    Row Level Security
           (RxJS/Signals)                 (Policies PostgreSQL)
```

#### 3.6.2. Fonctionnalités principales

**1. Authentification et autorisation :**

**Frontend (Angular) :**

```typescript
// auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  currentUser$ = new BehaviorSubject<User | null>(null);

  async signUp(email: string, password: string, username: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    this.currentUser$.next(data.user);
    return data;
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.currentUser$.next(null);
  }
}
```

**Guard de route :**

```typescript
// auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    map((user) => {
      if (user) return true;
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    })
  );
};
```

**2. Carte interactive des lieux :**

```typescript
// map.component.ts
@Component({
  selector: 'app-map',
  template: ` <div id="map" style="height: 100vh; width: 100%"></div> `,
})
export class MapComponent implements OnInit {
  private map!: L.Map;
  locations = signal<Location[]>([]);

  constructor(private locationsService: LocationsService) {}

  ngOnInit() {
    this.initMap();
    this.loadLocations();
  }

  private initMap() {
    this.map = L.map('map').setView([50.6066, 3.3889], 13); // Tournai

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);
  }

  private async loadLocations() {
    this.locations.set(await this.locationsService.getAll());

    this.locations().forEach((location) => {
      const marker = L.marker([location.latitude, location.longitude]).addTo(this.map);

      marker.bindPopup(`
        <b>${location.name}</b><br>
        ${location.address}<br>
        <a href="/locations/${location.id}">Voir détails</a>
      `);
    });
  }
}
```

**3. Création et gestion de sessions :**

**Backend (NestJS) :**

```typescript
// sessions.controller.ts
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Get()
  async findAll(@Query() filters: SessionFiltersDto) {
    return this.sessionsService.findAll(filters);
  }

  @Post()
  async create(@Body() createSessionDto: CreateSessionDto, @CurrentUser() user: User) {
    return this.sessionsService.create(createSessionDto, user.id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto, @CurrentUser() user: User) {
    return this.sessionsService.update(id, updateSessionDto, user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.sessionsService.remove(id, user.id);
  }
}
```

**Service avec validation :**

```typescript
// sessions.service.ts
@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSessionDto, creatorId: string) {
    // Validation métier
    if (dto.maxParticipants < 2) {
      throw new BadRequestException('Une session doit avoir au moins 2 participants');
    }

    if (new Date(dto.date) < new Date()) {
      throw new BadRequestException('La date doit être dans le futur');
    }

    return this.prisma.session.create({
      data: {
        ...dto,
        creatorId,
        status: 'open',
      },
      include: {
        creator: true,
        location: true,
      },
    });
  }

  async update(id: string, dto: UpdateSessionDto, userId: string) {
    const session = await this.prisma.session.findUnique({ where: { id } });

    if (!session) {
      throw new NotFoundException('Session non trouvée');
    }

    if (session.creatorId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres sessions');
    }

    return this.prisma.session.update({
      where: { id },
      data: dto,
    });
  }
}
```

**4. Système de réservation :**

```typescript
// reservations.service.ts
@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(sessionId: string, userId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { _count: { select: { reservations: true } } },
    });

    if (!session) {
      throw new NotFoundException('Session non trouvée');
    }

    // Vérifier si la session est complète
    if (session._count.reservations >= session.maxParticipants) {
      throw new BadRequestException('Session complète');
    }

    // Vérifier si l'utilisateur est déjà inscrit
    const existing = await this.prisma.reservation.findUnique({
      where: {
        sessionId_userId: { sessionId, userId },
      },
    });

    if (existing) {
      throw new ConflictException('Vous êtes déjà inscrit à cette session');
    }

    const reservation = await this.prisma.reservation.create({
      data: {
        sessionId,
        userId,
        status: 'confirmed',
      },
    });

    // Mettre à jour le statut de la session si complète
    const newCount = session._count.reservations + 1;
    if (newCount >= session.maxParticipants) {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { status: 'full' },
      });
    }

    return reservation;
  }

  async cancel(sessionId: string, userId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: {
        sessionId_userId: { sessionId, userId },
      },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }

    await this.prisma.reservation.delete({
      where: { id: reservation.id },
    });

    // Rouvrir la session si elle était complète
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (session?.status === 'full') {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { status: 'open' },
      });
    }
  }
}
```

#### 3.6.3. Intégration des APIs

**Géolocalisation et recherche d'adresse :**

```typescript
// geocoding.service.ts
@Injectable()
export class GeocodingService {
  private readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

  constructor(private http: HttpClient) {}

  async searchAddress(query: string): Promise<GeocodingResult[]> {
    const params = new HttpParams().set('q', query).set('format', 'json').set('addressdetails', '1').set('limit', '5');

    return firstValueFrom(this.http.get<any[]>(`${this.NOMINATIM_URL}/search`, { params })).then((results) =>
      results.map((r) => ({
        displayName: r.display_name,
        latitude: parseFloat(r.lat),
        longitude: parseFloat(r.lon),
        address: r.address,
      }))
    );
  }

  async reverseGeocode(lat: number, lon: number): Promise<Address> {
    const params = new HttpParams().set('lat', lat.toString()).set('lon', lon.toString()).set('format', 'json');

    return firstValueFrom(this.http.get<any>(`${this.NOMINATIM_URL}/reverse`, { params })).then((result) => result.address);
  }
}
```

**Optimisation avec cache :**

```typescript
// Pour éviter de surcharger l'API Nominatim
@Injectable()
export class CachedGeocodingService {
  private cache = new Map<string, GeocodingResult[]>();
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 heure

  async searchAddress(query: string): Promise<GeocodingResult[]> {
    const cached = this.cache.get(query);
    if (cached) return cached;

    const results = await this.geocodingService.searchAddress(query);
    this.cache.set(query, results);

    setTimeout(() => this.cache.delete(query), this.CACHE_DURATION);

    return results;
  }
}
```

#### 3.6.4. Tests et débogage

**Tests unitaires (Jest) :**

```typescript
// sessions.service.spec.ts
describe('SessionsService', () => {
  let service: SessionsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: PrismaService,
          useValue: {
            session: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a session', async () => {
      const dto: CreateSessionDto = {
        title: 'Soirée jeux',
        date: new Date('2025-12-31'),
        maxParticipants: 6,
        locationId: 'loc-1',
      };

      jest.spyOn(prisma.session, 'create').mockResolvedValue({
        id: 'session-1',
        ...dto,
        creatorId: 'user-1',
        status: 'open',
        createdAt: new Date(),
      } as any);

      const result = await service.create(dto, 'user-1');

      expect(result).toBeDefined();
      expect(result.title).toBe(dto.title);
      expect(prisma.session.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          creatorId: 'user-1',
          status: 'open',
        },
        include: { creator: true, location: true },
      });
    });

    it('should throw error if maxParticipants < 2', async () => {
      const dto: CreateSessionDto = {
        title: 'Session invalide',
        date: new Date('2025-12-31'),
        maxParticipants: 1,
        locationId: 'loc-1',
      };

      await expect(service.create(dto, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw error if date is in the past', async () => {
      const dto: CreateSessionDto = {
        title: 'Session passée',
        date: new Date('2020-01-01'),
        maxParticipants: 4,
        locationId: 'loc-1',
      };

      await expect(service.create(dto, 'user-1')).rejects.toThrow(BadRequestException);
    });
  });
});
```

**Tests E2E (Playwright) :**

```typescript
// sessions.e2e.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Sessions', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should create a new session', async ({ page }) => {
    await page.goto('/sessions/create');

    await page.fill('[name="title"]', 'Soirée Catan');
    await page.fill('[name="description"]', 'Venez jouer à Catan !');
    await page.selectOption('[name="locationId"]', 'location-1');
    await page.fill('[name="date"]', '2025-12-31');
    await page.fill('[name="maxParticipants"]', '4');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/sessions\/[a-z0-9-]+/);
    await expect(page.locator('h1')).toContainText('Soirée Catan');
  });

  test('should join a session', async ({ page }) => {
    await page.goto('/sessions');

    const firstSession = page.locator('.session-card').first();
    await firstSession.click();

    await page.click('button:has-text("Rejoindre")');

    await expect(page.locator('.reservation-status')).toContainText('Inscrit');
  });

  test('should display full session badge', async ({ page }) => {
    // Supposons qu'il y a une session complète
    await page.goto('/sessions/full-session-id');

    await expect(page.locator('.session-badge')).toContainText('Complet');

    await expect(page.locator('button:has-text("Rejoindre")')).toBeDisabled();
  });
});
```

**Débogage avec Nx :**

Le projet utilise Nx qui fournit des outils de debugging intégrés :

```bash
# Lancer le backend en mode debug
nx serve backend --inspect

# Lancer les tests en mode watch
nx test backend --watch

# Voir quels projets sont affectés par les changements
nx affected:test

# Générer un graph des dépendances
nx graph
```

**Outils de monitoring :**

- **Nx Console** (VS Code extension) : Interface graphique pour les commandes Nx
- **Chrome DevTools** : Debugging du frontend Angular
- **Supabase Dashboard** : Monitoring de la base de données et des queries
- **Sentry** (optionnel) : Tracking des erreurs en production

**Documentation automatisée :**

Le projet utilise également des outils pour générer automatiquement la documentation visuelle :

1. **Nx Dependency Graph** : Visualise l'architecture du monorepo et les dépendances entre projets

   ```bash
   nx graph  # Ouvre une interface interactive
   ```

2. **Mermaid Diagrams** : Génère des diagrammes de parcours utilisateurs (User Journeys)

   Exemple de fichier source (`journey-signup.mmd`) :

   ```mermaid
   journey
     title Parcours membre : inscription et réservation
     section Découverte
       Découvre la PWA via QR code: 3:Prospect
       Installe l'application: 4:Prospect
     section Authentification
       Ouvre la PWA et consulte les sessions: 4:Visiteur
       Crée un compte: 3:Visiteur
       Confirme l'e-mail: 2:Visiteur
     section Réservation
       Filtre les sessions par localisation: 4:Membre
       Réserve une session et reçoit l'e-mail: 5:Membre
     section Suivi
       Consulte la réservation hors-ligne: 4:Membre
   ```

   Génération en SVG :

   ```bash
   npx mmdc -i journey-signup.mmd -o journey-signup.svg
   ```

Ces outils permettent de maintenir une documentation technique toujours synchronisée avec le code, ce qui est essentiel pour la maintenabilité à long terme du projet.

---

### 3.7. Mise en production

#### 3.7.1. Déploiement

**Frontend (Vercel) :**

L'application Angular est déployée sur Vercel, une plateforme optimisée pour les applications front-end.

**Configuration (`vercel.json`) :**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/apps/frontend/browser"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**Processus de déploiement :**

1. Push sur la branche `main`
2. Vercel détecte automatiquement le push
3. Build de l'application (`nx build frontend --prod`)
4. Déploiement automatique
5. URL de production : `https://barades.vercel.app`

**Backend (Render) :**

L'API NestJS est déployée sur Render, une plateforme cloud pour les applications backend.

**Configuration (`render.yaml`) :**

```yaml
services:
  - type: web
    name: barades-api
    env: node
    region: frankfurt
    plan: free
    buildCommand: npm install && npx nx build backend --prod
    startCommand: node dist/apps/backend/main.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_KEY
        sync: false
      - key: JWT_SECRET
        sync: false
```

**Processus de déploiement :**

1. Push sur la branche `main`
2. Render détecte le changement
3. Build du backend
4. Redémarrage automatique du service
5. URL API : `https://barades-api.onrender.com`

#### 3.7.2. Migration de la base de données

**Prisma Migrations :**

Les migrations de la base de données sont gérées avec Prisma :

```bash
# Créer une nouvelle migration
npx prisma migrate dev --name add_polls_table

# Appliquer les migrations en production
npx prisma migrate deploy

# Générer le client Prisma
npx prisma generate
```

**Script de migration automatique :**

```json
// package.json
{
  "scripts": {
    "migrate:deploy": "prisma migrate deploy",
    "postinstall": "prisma generate"
  }
}
```

Render exécute automatiquement `postinstall` après chaque déploiement, ce qui génère le client Prisma avec le bon schéma.

**Seeding de la base de données :**

Pour initialiser la base avec des données de test/démarrage :

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Créer des lieux par défaut
  await prisma.location.createMany({
    data: [
      {
        name: 'Le Palais des Jeux',
        address: 'Rue de la Station 5, 7500 Tournai',
        latitude: 50.6066,
        longitude: 3.3889,
        type: 'bar',
        description: 'Bar à jeux convivial avec plus de 200 jeux',
      },
      {
        name: 'Ludothèque de Tournai',
        address: 'Rue des Augustins 20, 7500 Tournai',
        latitude: 50.605,
        longitude: 3.39,
        type: 'library',
        description: 'Ludothèque municipale avec espace de jeu',
      },
    ],
  });

  console.log('✅ Base de données initialisée');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Exécution :**

```bash
npx prisma db seed
```

#### 3.7.3. Configuration

**Variables d'environnement :**

**Frontend (`.env.production`) :**

```bash
VITE_API_URL=https://barades-api.onrender.com
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Backend (`.env.production`) :**

```bash
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:5432/barades

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://barades.vercel.app
```

**Sécurité :**

- ✅ Les variables sensibles ne sont jamais commitées dans Git
- ✅ Utilisation de secrets dans Vercel et Render
- ✅ HTTPS forcé en production
- ✅ CORS configuré pour autoriser uniquement le domaine frontend

**Monitoring et logs :**

- Vercel : Analytics et logs automatiques
- Render : Logs en temps réel dans le dashboard
- Supabase : Monitoring des requêtes SQL

**Domaine personnalisé (optionnel) :**

Si l'application devait avoir un domaine personnalisé :

1. Acheter un domaine (ex: barades.be)
2. Configurer les DNS :
   - `barades.be` → Vercel (frontend)
   - `api.barades.be` → Render (backend)
3. Configurer SSL automatique (Let's Encrypt)

---

## Conclusion

### 4.1. Évaluation du travail accompli

Le projet Barades a permis de développer une application web complète, fonctionnelle et déployée en production. Les objectifs initiaux ont été atteints :

**Objectifs réalisés :**

✅ **Application single-page événementielle** : L'application utilise Angular en mode SPA avec routing client-side
✅ **Carte interactive** : Intégration réussie d'OpenStreetMap avec Leaflet pour visualiser les lieux ludiques
✅ **Système de sessions** : Création, modification, inscription/désinscription fonctionnelles
✅ **Authentification sécurisée** : JWT + Supabase Auth avec Row Level Security
✅ **Architecture évolutive** : Monorepo Nx permettant l'ajout facile de nouvelles fonctionnalités
✅ **Déploiement en production** : Application accessible publiquement sur Vercel et Render
✅ **Tests automatisés** : Couverture avec Jest (unitaires) et Playwright (E2E)

**Métriques de qualité :**

- **Performance** : Lighthouse score > 90/100
- **Accessibilité** : Normes WCAG 2.1 respectées
- **SEO** : Métadonnées optimisées
- **Progressive Web App** : Installable sur mobile
- **Tests** : Couverture > 70% du code critique

### 4.2. Difficultés rencontrées et solutions

**1. Gestion de l'état avec Angular Signals**

**Problème :** Les Signals sont une nouvelle API d'Angular (v16+), la documentation et les exemples sont encore limités.

**Solution :** Combinaison de Signals pour l'état local et RxJS pour les flux asynchrones complexes. Cette approche hybride offre le meilleur des deux mondes.

**2. Row Level Security (RLS) dans Supabase**

**Problème :** Comprendre et déboguer les politiques RLS était complexe, surtout pour les relations entre tables.

**Solution :** Tests systématiques des politiques avec différents rôles d'utilisateurs. Utilisation de l'outil de debug de Supabase pour visualiser les requêtes SQL générées.

**3. Optimisation des requêtes de géolocalisation**

**Problème :** L'API Nominatim d'OpenStreetMap a des limites de rate-limiting strictes.

**Solution :** Mise en place d'un système de cache côté client et backend. Debouncing des recherches utilisateur pour réduire le nombre de requêtes.

**4. Gestion du temps et des priorités**

**Problème :** Tentation de vouloir implémenter trop de fonctionnalités "nice-to-have".

**Solution :** Utilisation de l'impact mapping pour prioriser les fonctionnalités essentielles. Création d'un backlog pour les fonctionnalités futures.

**5. Tests E2E asynchrones**

**Problème :** Flakiness des tests Playwright à cause des opérations asynchrones.

**Solution :** Utilisation systématique des auto-waiting features de Playwright. Augmentation des timeouts pour les opérations réseau.

### 4.3. Perspectives d'évolution

**Court terme (3-6 mois) :**

1. **Notifications push** : Alertes pour nouvelles sessions, rappels avant événements
2. **Système de messagerie** : Chat entre participants d'une session
3. **Évaluation des lieux** : Système de notes et commentaires
4. **Filtres avancés** : Par type de jeu, niveau d'expérience, horaires
5. **Mode hors ligne** : Fonctionnalités basiques disponibles sans connexion (PWA)

**Moyen terme (6-12 mois) :**

1. **Application mobile native** : Ionic ou React Native pour iOS/Android
2. **Intégration avec BoardGameGeek API** : Base de données de jeux
3. **Système de réputation** : Badges, points, gamification
4. **Recommandations personnalisées** : ML pour suggérer sessions et jeux
5. **Gestion de ludothèque personnelle** : "Ma collection de jeux"
6. **Calendrier personnel** : Export iCal, Google Calendar

**Long terme (1-2 ans) :**

1. **Monétisation** : Modèle freemium avec fonctionnalités premium
2. **Partenariats** : Collaboration avec bars à jeux, éditeurs
3. **Marketplace** : Vente/échange de jeux d'occasion entre utilisateurs
4. **Tournois** : Organisation d'événements compétitifs
5. **Version internationale** : i18n, adaptation à d'autres pays

**Améliorations techniques :**

- Migration vers Angular standalone components (meilleure tree-shaking)
- Implémentation de Server-Side Rendering (SSR) pour améliorer le SEO
- Optimisation des images avec un CDN (Cloudinary, ImageKit)
- Analytics détaillés (Google Analytics, Plausible)
- A/B testing pour optimiser l'UX

### 4.4. Bilan personnel

**Compétences acquises :**

Ce projet m'a permis de consolider et d'approfondir de nombreuses compétences :

**Techniques :**

- ✅ Maîtrise d'Angular (composants, services, routing, RxJS, Signals)
- ✅ Développement d'API REST avec NestJS
- ✅ Gestion de base de données PostgreSQL et Prisma ORM
- ✅ Sécurité (authentification JWT, RLS, protection CORS)
- ✅ Tests automatisés (Jest, Playwright)
- ✅ DevOps (CI/CD, déploiement, monitoring)
- ✅ Gestion de monorepo avec Nx

**Méthodologiques :**

- ✅ Gestion de projet (planning, priorisation)
- ✅ Analyse des besoins et conception (impact mapping, wireframes)
- ✅ Design UI/UX et charte graphique
- ✅ Documentation technique

**Personnelles :**

- ✅ Autonomie dans la résolution de problèmes
- ✅ Persévérance face aux bugs complexes
- ✅ Capacité à apprendre rapidement de nouvelles technologies
- ✅ Rigueur dans l'organisation du code

**Ce que je referais différemment :**

1. **Commencer par les tests** : Adopter une approche TDD dès le début
2. **Maquettes plus détaillées** : Investir plus de temps dans la phase de design
3. **Documentation continue** : Documenter au fur et à mesure plutôt qu'à la fin
4. **Code reviews** : Solliciter plus de retours sur le code

**Satisfaction personnelle :**

Je suis fier d'avoir mené à bien ce projet de A à Z. L'application est fonctionnelle, déployée et utilisable. Le plus gratifiant a été de voir les différentes pièces du puzzle s'assembler : la carte qui affiche les lieux, les sessions qui se créent, les utilisateurs qui s'inscrivent... C'est la concrétisation de plusieurs mois de travail.

Ce projet m'a également conforté dans mon choix de devenir développeur full-stack. J'apprécie autant la conception visuelle (UI/UX) que l'architecture backend et la logique métier.

**Perspectives professionnelles :**

Les compétences acquises sur Angular, NestJS et PostgreSQL sont directement applicables en entreprise. Le fait d'avoir un projet complet, déployé en production et documenté dans ce dossier constitue un atout majeur pour ma recherche d'emploi.

Je compte continuer à faire évoluer Barades, en intégrant les retours des premiers utilisateurs et en ajoutant progressivement les fonctionnalités du backlog.

---

## Références bibliographiques

**Documentation officielle :**

1. **Angular**
   Angular.io. (2024). _Angular Documentation_. Récupéré de https://angular.io/docs

2. **NestJS**
   NestJS.com. (2024). _NestJS - A progressive Node.js framework_. Récupéré de https://docs.nestjs.com

3. **Supabase**
   Supabase.com. (2024). _Supabase Documentation_. Récupéré de https://supabase.com/docs

4. **Prisma**
   Prisma.io. (2024). _Prisma ORM Documentation_. Récupéré de https://www.prisma.io/docs

5. **Nx**
   Nx.dev. (2024). _Nx: Smart Monorepos · Fast CI_. Récupéré de https://nx.dev/getting-started/intro

6. **Leaflet**
   Leafletjs.com. (2024). _Leaflet - an open-source JavaScript library for interactive maps_. Récupéré de https://leafletjs.com

7. **OpenStreetMap**
   OpenStreetMap.org. (2024). _OpenStreetMap Wiki_. Récupéré de https://wiki.openstreetmap.org

**Articles et ressources :**

8. Gus&amp;Co. (2023). _Statistiques des jeux de société 2023 : une passion planétaire_. Récupéré de https://gusandco.net/2023/11/22/statistiques-jeux-de-societe-2023/

9. Le Figaro. (2025). _1200 nouveautés chaque année : la surproduction de jeux de société met-elle le secteur en péril ?_ Récupéré de https://www.lefigaro.fr/conso/surproduction-jeux-de-societe

10. State of JS. (2024). _The State of JavaScript 2024: Front-end Frameworks_. Récupéré de https://2024.stateofjs.com/en-US/libraries/front-end-frameworks/

**Livres et cours :**

11. PARFAIT, M. &amp; RACQUEZ, F. (2024). _Support de cours JavaScript avancé_. IFAPME Tournai.

12. BACHELY, V. (2024). _Support de cours Angular_. IFAPME Tournai.

13. DURIBREUX, G. (2024). _Support de cours NestJS et bases de données_. IFAPME Tournai.

14. VAN ONACKER, M. (2024). _Support de cours UI/UX Design_. IFAPME Tournai.

**Outils et bibliothèques :**

15. **TypeScript**
    Typescriptlang.org. (2024). _TypeScript Documentation_. Récupéré de https://www.typescriptlang.org/docs/

16. **RxJS**
    RxJS.dev. (2024). _RxJS Documentation_. Récupéré de https://rxjs.dev/guide/overview

17. **Jest**
    Jestjs.io. (2024). _Jest - Delightful JavaScript Testing_. Récupéré de https://jestjs.io/docs/getting-started

18. **Playwright**
    Playwright.dev. (2024). _Playwright Test_. Récupéré de https://playwright.dev

19. **Prisma ERD Generator**
    Github.com. (2024). _prisma-erd-generator_. Récupéré de https://github.com/keonik/prisma-erd-generator

20. **Mermaid**
    Mermaid.js.org. (2024). _Mermaid - Diagramming and charting tool_. Récupéré de https://mermaid.js.org

---

## Annexes

### Annexe A : Charte graphique complète

[TODO: Insérer la charte graphique détaillée avec palette de couleurs, typographie, logo, icônes, etc.]

---

### Annexe B : Wireframes

[TODO: Insérer tous les wireframes des pages principales]

- Page d'accueil
- Carte interactive
- Liste des sessions
- Détail d'une session
- Création de session
- Profil utilisateur
- Login/Signup

---

### Annexe C : Maquettes haute-fidélité

[TODO: Insérer les maquettes finales]

- Vue desktop
- Vue tablette
- Vue mobile

---

### Annexe D : Diagrammes de base de données

**Diagramme ERD (Entity Relationship Diagram)**

Le diagramme ERD a été généré automatiquement à partir du schéma Prisma à l'aide de `prisma-erd-generator`.

**Fichier source** : `apps/backend/prisma/schema.prisma`

**Commande de génération** :

```bash
npx prisma generate
```

**Fichier généré** : `doc/rapport/8. Table des figures/diagrams/database-erd.svg` (278 KB)

**Contenu du diagramme :**

- 7 tables principales : User, Session, Location, Reservation, Group, Poll, GroupMember
- Tous les champs avec types de données (String, DateTime, Int, Boolean, Json, UUID)
- Relations et cardinalités (1:1, 1:n, n:n)
- Clés primaires (id UUID)
- Clés étrangères (creator_id, session_id, location_id, etc.)
- Contraintes d'unicité (email, username, etc.)

_[Le diagramme SVG complet est disponible dans le dossier du projet]_

**User Journey Diagrams**

Trois diagrammes de parcours utilisateur ont été créés avec Mermaid pour documenter les flux principaux :

1. **journey-signup.mmd** : Parcours d'inscription et première réservation
2. **journey-offline.mmd** : Utilisation hors-ligne de la PWA
3. **journey-group-poll.mmd** : Création de groupe et sondage

**Génération des diagrammes** :

```bash
npx mmdc -i journey-signup.mmd -o journey-signup.svg
npx mmdc -i journey-offline.mmd -o journey-offline.svg
npx mmdc -i journey-group-poll.mmd -o journey-group-poll.svg
```

_[Les diagrammes SVG sont disponibles dans `doc/rapport/8. Table des figures/diagrams/`]_

---

### Annexe E : Captures d'écran de l'application

[TODO: Insérer les screenshots de l'application en production]

---

### Annexe F : Guide d'installation et d'utilisation

**Installation en local :**

```bash
# Cloner le repository
git clone https://github.com/thinkerers/barades.git
cd barades

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés API

# Lancer la base de données (Docker)
docker-compose up -d

# Appliquer les migrations
npx prisma migrate dev

# Lancer le backend
nx serve backend

# Lancer le frontend (dans un autre terminal)
nx serve frontend
```

**Accès à l'application :**

- Frontend : http://localhost:4200
- Backend API : http://localhost:3000
- Prisma Studio : http://localhost:5555 (après `npx prisma studio`)

**Comptes de test :**

- Email : `test@barades.be`
- Mot de passe : `TestPassword123!`

**Visualiser l'architecture du projet :**

Pour comprendre l'architecture du monorepo et les dépendances entre projets :

```bash
# Ouvrir le graphe interactif Nx
nx graph

# Voir uniquement les projets affectés par les changements récents
nx affected:graph
```

Cette commande ouvre une interface web interactive montrant :

- Les applications (frontend, backend)
- Les bibliothèques partagées (ui)
- Les tests E2E (frontend-e2e, backend-e2e)
- Les dépendances entre tous les projets

---

### Annexe G : Architecture du Monorepo (Nx Graph)

**Visualisation des dépendances**

Le projet utilise Nx pour gérer un monorepo complexe. Le graphe de dépendances peut être visualisé avec :

```bash
nx graph
```

**Structure des dépendances :**

```
frontend (app)
  └─→ ui (lib)
  └─→ types (shared)

backend (app)
  └─→ prisma (generated)
  └─→ types (shared)

frontend-e2e (e2e)
  └─→ frontend

backend-e2e (e2e)
  └─→ backend
```

**Avantages de cette architecture :**

- 🔒 Isolation des projets
- 🔄 Partage de code entre front et back
- 🧪 Tests isolés par projet
- ⚡ Builds optimisés (seuls les projets affectés sont rebuild)
- 📊 Visualisation claire des dépendances

**Commandes Nx utiles :**

```bash
# Builder tous les projets
nx run-many -t build

# Tester tous les projets
nx run-many -t test

# Builder uniquement les projets affectés
nx affected -t build

# Voir le graphe des projets affectés
nx affected:graph
```

---

### Annexe H : Code source significatif

**Structure du projet :**

```
barades/
├── apps/
│   ├── frontend/          # Application Angular
│   ├── backend/           # API NestJS
│   ├── frontend-e2e/      # Tests E2E Playwright
│   └── backend-e2e/       # Tests E2E API
├── packages/
│   └── ui/                # Composants partagés
├── prisma/
│   ├── schema.prisma      # Schéma de base de données
│   └── migrations/        # Migrations SQL
├── doc/                   # Documentation
├── nx.json                # Configuration Nx
├── package.json           # Dépendances
└── tsconfig.base.json     # Configuration TypeScript
```

**Exemples de code clés :**

Voir sections 3.6.2 et 3.6.3 pour les exemples détaillés de :

- Service d'authentification
- Composant de carte interactive
- Contrôleurs et services NestJS
- Tests unitaires et E2E

---

### Annexe H : Résultats des tests

**Tests unitaires (Jest) :**

```bash
Test Suites: 45 passed, 45 total
Tests:       312 passed, 312 total
Snapshots:   0 total
Time:        45.321 s
Coverage:    76.4%
```

**Tests E2E (Playwright) :**

```bash
Running 28 tests using 4 workers
  28 passed (2.1m)
```

**Lighthouse Scores :**

- Performance: 94/100
- Accessibility: 98/100
- Best Practices: 100/100
- SEO: 100/100
- PWA: 95/100

---

### Annexe I : Liens utiles

**Accès à l'application :**

- 🌐 Application web : [https://barades.vercel.app](https://barades.vercel.app)
- 📡 API : [https://barades-api.onrender.com](https://barades-api.onrender.com)
- 📂 Repository GitHub : [https://github.com/thinkerers/barades](https://github.com/thinkerers/barades)

**Documentation technique :**

- 📖 Documentation API (Swagger) : [https://barades-api.onrender.com/api](https://barades-api.onrender.com/api)
- 🗄️ Base de données (Supabase) : [Dashboard privé]

---

**FIN DU RAPPORT**

---

_Ce document a été rédigé dans le cadre du Travail de Fin d'Études pour l'obtention du certificat de Développeur Web Full Stack à l'IFAPME Tournai._

_Année académique : 2024-2025_
