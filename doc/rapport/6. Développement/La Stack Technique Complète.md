
[https://blog.hompus.nl/2025/01/20/why-i-switched-from-wordpress-to-astro-faster-cheaper-greener/?ref=dailydev](https://blog.hompus.nl/2025/01/20/why-i-switched-from-wordpress-to-astro-faster-cheaper-greener/?ref=dailydev)

Let’s calculate:

- Estimated average power usage of a “Standard B2ls v2” VM: `50W`
- Annual power consumption: `50W × 24hours/day × 365days/year = 438kWh/year`
- Equivalent carbon emissions: `438kWh/year × 0,475kg CO₂/kWh = 208,05kg CO₂/year`  
    (0.475kg CO₂/kWh is an average for The Netherlands)
[https://dev.to/sahilkashyap64/qr-login-in-php-2pgf?ref=dailydev](https://dev.to/sahilkashyap64/qr-login-in-php-2pgf?ref=dailydev)

#### 🏗️ 1. Architecture & Environnement

* **Langage : TypeScript**
    * **Justification** : Pour un code robuste, auto-documenté et cohérent sur l'ensemble de la stack, du frontend au backend.
* **Structure : Monorepo avec Nx**
    * **Justification** : Pour gérer le frontend et le backend dans un seul dépôt, partager facilement du code (types, validation) et accélérer le développement grâce aux générateurs.
* **Environnement local : WSL2 + Docker**
    * **Justification** : Pour obtenir des performances natives de Linux sur Windows et garantir que l'environnement de développement soit identique à la production, simplifiant le déploiement.
* **Gestionnaire de paquets : Bun**
    * **Justification** : Le gestionnaire de paquets le plus rapide, améliorant la productivité au quotidien pour installer les dépendances.
* **Exécuteur de paquets : `bunx` / `npx`**
    * **Justification** : Pour lancer des commandes et des scripts sans installation globale (ex: `npx nx ...`).

---

#### 💻 2. Frontend (PWA)

* **Framework : Angular**
    * **Justification** : Un framework puissant, structuré et soutenu par Google, idéal pour construire des applications complexes et maintenables.
* **Composants UI : Angular Material**
    * **Justification** : Une bibliothèque de composants de base de haute qualité (menus, dialogues, etc.) pour accélérer le développement de l'interface.
* **Styling : Tailwind CSS**
    * **Justification** : Pour créer un design sur mesure rapidement et de manière cohérente, directement dans le HTML.
* **Cartographie : Leaflet**
    * **Justification** : Une bibliothèque de cartes open-source, légère et puissante, parfaite pour la fonctionnalité principale de l'application.

---

#### ☁️ 3. Backend & Données

* **Plateforme principale : Supabase**
    * **Justification** : Le cœur du backend. Il fournit une base de données **PostgreSQL**, l'**authentification**, le **stockage de fichiers** et des **tâches planifiées (Cron Jobs)** dans un seul service open-source avec une offre gratuite généreuse.
* **Logique métier avancée : NestJS**
    * **Justification** : En option, pour créer des API ou des processus métier complexes. Sa philosophie et sa structure sont identiques à celles d'Angular.
* **ORM : Prisma**
    * **Justification** : Pour interagir avec la base de données de manière simple et sécurisée grâce à un schéma fortement typé.
* **Validation de données : Zod**
    * **Justification** : Pour définir des schémas de validation une seule fois et les partager entre le frontend (Angular) et le backend (NestJS), garantissant une cohérence de bout en bout.

---

#### 🔍 4. Recherche

* **Moteur de recherche : Typesense**
    * **Justification** : Pour offrir une expérience de recherche "as-you-type" ultra-rapide, tolérante aux fautes de frappe et combinant recherche textuelle et géospatiale. Bien plus simple à gérer qu'Elasticsearch pour les besoins du projet.
* **Synchronisation des données : Supabase Webhooks / Triggers**
    * **Justification** : Pour maintenir l'index de Typesense synchronisé automatiquement avec la base de données PostgreSQL principale à chaque ajout ou modification d'un bar.
* **Hébergement (Typesense) : Render (Free Tier)**
    * **Justification** : Pour démarrer avec un hébergement gratuit de Typesense via un conteneur Docker, en accord avec la philosophie "Budget Zéro".

---

#### 🛠️ 4. Tests, Qualité & DevOps

* **Qualité du code : ESLint, Prettier & Husky**
    * **Justification** : Pour automatiser le formatage, analyser le code pour trouver les problèmes et garantir que seul du code propre est envoyé sur le dépôt.
* **Tests Unitaires : Jest**
    * **Justification** : Un standard de l'industrie, déjà intégré à NestJS, pour tester des fonctions ou composants de manière isolée.
* **Tests End-to-End : Playwright**
    * **Justification** : Solution puissante pour simuler des parcours utilisateurs complets dans un vrai navigateur, essentiel pour une PWA.
* **Automatisation (CI/CD) : GitHub Actions**
    * **Justification** : Intégré à GitHub pour lancer automatiquement les tests, vérifier la qualité du code et gérer les déploiements.
* **Hébergement Frontend (PWA) : Vercel**
    * **Justification** : Plateforme simple et performante pour le frontend, avec déploiements de prévisualisation gratuits.
* **Hébergement Backend (NestJS) : Render**
    * **Justification** : Si NestJS est utilisé, Render propose une offre gratuite pour héberger l'API.
* **Gestion des secrets : Infisical**
    * **Justification** : Solution open-source (en mode cloud) pour centraliser et sécuriser les clés d'API.
* **Monitoring d'erreurs : Sentry**
    * **Justification** : Pour capturer les bugs en production en temps réel et les corriger rapidement.
* **Analyse d'audience : PostHog**
    * **Justification** : Solution d'analyse open-source et respectueuse de la vie privée pour comprendre comment les utilisateurs interagissent avec l'application.

---

#### 📚 5. Documentation

* **Catalogue de composants : Storybook**
    * **Justification** : Pour développer, tester et documenter les composants Angular de manière isolée, garantissant leur qualité et leur réutilisabilité.
* **Site de documentation : Starlight (Astro)**
    * **Justification** : Pour créer un site de documentation (guides, tutoriels) moderne et rapide en suivant la philosophie "Docs as Code".
* **Documentation d'API : Swagger & TypeDoc**
    * **Justification** : **Swagger** (via NestJS) pour une UI interactive de l'API. **TypeDoc** pour générer automatiquement une documentation technique à partir des commentaires du code TypeScript.

---

#### 🔗 6. Services Tiers

* **Paiements : Mollie**
    * **Justification** : Solution spécialisée pour le marché européen/belge, simple à intégrer et gérant Bancontact, sans frais fixes.
* **Emails transactionnels : Brevo**
    * **Justification** : Un service européen conforme au RGPD pour envoyer des emails fiables, avec une offre gratuite suffisante pour démarrer.

---

### **L'Approche Incrémentale : De l'Idée au Produit**

| Phase | Objectif Principal | Technologies Clés à Intégrer | Résultat |
| :--- | :--- | :--- | :--- |
| **1. La Fondation (Proof of Concept)** | Afficher une carte avec des bars | `Nx`, `TypeScript`, `Angular`, `Leaflet`, `Supabase (DB)`, `Vercel` | Une page web simple montrant des bars sur une carte. |
| **2. Le MVP (Produit Minimum Viable)** | Rendre l'application utilisable et propre | `Angular Material`, `Tailwind`, `Prisma`, `Zod`, `ESLint`, `Prettier` | Une PWA stylée où l'on peut consulter les détails d'un bar. |
| **3. Les Fonctionnalités Communautaires** | Permettre aux utilisateurs d'agir | `Supabase (Auth)`, `NestJS`, `Render` | Des utilisateurs peuvent s'inscrire et organiser des sessions. |
| **4. Expérience Utilisateur & Fiabilité** | Rendre l'application rapide et fiable | `Typesense`, `Sentry`, `Infisical` | Recherche instantanée et suivi des erreurs en production. |
| **5. L'Industrialisation (DevOps)** | Automatiser le cycle de développement | `Jest`, `Playwright`, `GitHub Actions` | Tests et déploiements continus (CI/CD) fiables. |
| **6. La Croissance (Écosystème)** | Pérenniser et faire grandir le projet | `Mollie`, `Brevo`, `PostHog`, `Storybook`, `Starlight` | Un produit mature, prêt à grandir et à être monétisé. |

---

#### 🌱 Phase 1 : Proof of Concept

* **Objectif : Valider la viabilité technique**
    * **Justification** : Assembler le strict minimum de briques technologiques pour afficher des marqueurs de bars sur une carte. Le but est de prouver que l'idée de base est réalisable rapidement.
* **Technologies Mises en Œuvre :**
    * **`Nx`** : Pour initialiser le monorepo et la structure du projet.
    * **`Supabase (DB)`** : Pour créer la table `bars` et y insérer manuellement les premières données.
    * **`Angular` & `Leaflet`** : Pour créer le frontend qui récupère et affiche les données de Supabase.
    * **`Vercel`** : Pour un premier déploiement simple et automatique du frontend.
* **Résultat Attendu : Un prototype fonctionnel**
    * **Justification** : Une URL publique avec une PWA simple mais fonctionnelle, prouvant que la base de données et le frontend communiquent correctement.

---

#### ✨ Phase 2 : Le Produit Minimum Viable (MVP)

* **Objectif : Rendre l'application utilisable et poser des bases saines**
    * **Justification** : Transformer le prototype en une application agréable à regarder et à utiliser, tout en instaurant des règles de qualité de code pour l'avenir.
* **Technologies Mises en Œuvre :**
    * **`Angular Material` & `Tailwind CSS`** : Pour construire une interface utilisateur soignée et cohérente.
    * **`Prisma` & `Zod`** : Pour établir un accès aux données robuste, sécurisé et fortement typé.
    * **`ESLint`, `Prettier` & `Husky`** : Pour automatiser la qualité et le formatage du code à chaque commit.
* **Résultat Attendu : Une PWA présentable**
    * **Justification** : Une application que les premiers utilisateurs peuvent consulter pour trouver des informations sur les bars, avec une base de code propre et maintenable.

---

#### 🤝 Phase 3 : Les Fonctionnalités Communautaires

* **Objectif : Introduire l'interaction utilisateur**
    * **Justification** : Dépasser le stade de simple annuaire pour devenir une plateforme sociale où les utilisateurs peuvent créer un compte et organiser des activités.
* **Technologies Mises en Œuvre :**
    * **`Supabase (Auth)`** : Pour gérer l'inscription et la connexion des utilisateurs de manière simple et sécurisée.
    * **`NestJS`** : Pour créer un backend custom qui gère la logique métier complexe (création de sessions, invitations, etc.) que l'API de Supabase seule ne peut gérer.
    * **`Render`** : Pour héberger l'API NestJS via son offre gratuite.
* **Résultat Attendu : Une plateforme interactive**
    * **Justification** : Les utilisateurs peuvent s'inscrire, se connecter et utiliser les fonctionnalités clés qui constituent la promesse de l'application.

---

#### ⚡ Phase 4 : L'Expérience Utilisateur et la Fiabilité

* **Objectif : Rendre l'application rapide, agréable et robuste**
    * **Justification** : Polir le produit en ajoutant une recherche performante et en se dotant d'outils pour surveiller la santé de l'application en production.
* **Technologies Mises en Œuvre :**
    * **`Typesense`** : Pour offrir une expérience de recherche instantanée et pertinente.
    * **`Supabase Webhooks / Triggers`** : Pour synchroniser automatiquement les données entre PostgreSQL et Typesense.
    * **`Sentry`** : Pour capturer les erreurs en temps réel et être proactif dans leur résolution.
    * **`Infisical`** : Pour centraliser et sécuriser la gestion des secrets et clés d'API.
* **Résultat Attendu : Un produit de qualité professionnelle**
    * **Justification** : L'application est rapide et fiable, ce qui augmente la rétention des utilisateurs. L'équipe de développement a une visibilité complète sur les problèmes en production.

---

#### ⚙️ Phase 5 : L'Industrialisation et le DevOps

* **Objectif : Automatiser le cycle de vie du développement**
    * **Justification** : Sécuriser les développements futurs en s'assurant que chaque modification est testée automatiquement avant d'être déployée, réduisant ainsi le risque de régression.
* **Technologies Mises en Œuvre :**
    * **`Jest` & `Playwright`** : Pour créer un filet de sécurité avec des tests unitaires et des tests de parcours utilisateurs complets.
    * **`GitHub Actions`** : Pour orchestrer la CI/CD : lancer les tests, vérifier la qualité du code et déployer automatiquement en cas de succès.
* **Résultat Attendu : Un workflow de développement robuste**
    * **Justification** : La capacité à livrer de nouvelles fonctionnalités plus rapidement et avec une confiance accrue, sachant que les processus automatisés préviennent les erreurs courantes.

---

#### 🚀 Phase 6 : La Croissance et l'Écosystème

* **Objectif : Pérenniser le projet et préparer son avenir**
    * **Justification** : Doter le projet des outils nécessaires pour comprendre ses utilisateurs, communiquer avec eux, générer des revenus et faciliter la contribution future.
* **Technologies Mises en Œuvre :**
    * **`PostHog`** : Pour analyser l'utilisation de l'application et prendre des décisions basées sur les données.
    * **`Brevo`** : Pour gérer les communications par email (notifications, etc.).
    * **`Mollie`** : Pour intégrer une solution de paiement si un modèle économique est envisagé.
    * **`Storybook`, `Starlight`, `Swagger`** : Pour construire une documentation complète destinée aux utilisateurs et aux développeurs.
* **Résultat Attendu : Un produit mature et durable**
    * **Justification** : Le projet n'est plus seulement une application, mais un produit complet, documenté, outillé pour sa croissance et prêt à être maintenu sur le long terme.