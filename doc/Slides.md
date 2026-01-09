---
marp: true
theme: gaia
class: lead
backgroundColor: #fff
backgroundImage: url('https://marp.app/assets/hero-background.svg')
paginate: true
style: |
  section { font-family: 'Arial', sans-serif; }
  h1 { color: #2d3748; }
  h2 { color: #4a5568; }
  strong { color: #dd6b20; }
  code { background-color: #edf2f7; color: #c05621; padding: 2px 5px; border-radius: 4px; }
---

![w:200](rapport/8.%20Table%20des%20figures/logo_barade.png)

# BAR A DES
##  La plateforme pour organiser vos sessions de jeu sur table

**Théophile Desmedt**
*Développeur Web Front-End | TFE 2024-2025*

---

# 1. Le Constat & La Problématique

* 📈 **Demande croissante :** +1200 nouveautés/an en France, +9% de croissance mondiale.
* 🧩 **Casse-tête logistique :** Difficulté majeure à **synchroniser les agendas** et trouver un lieu adapté.
* 🌍 **Isolement :** Le joueur itinérant ne sait pas *où* jouer ni *avec qui*.

> **Solution :** Une plateforme centralisée pour faciliter la **rencontre**, la **découverte** et le **test** de jeux avant achat.

*Sources : Gus&Co (2023), Le Figaro (2025)*

---

# 2. Cible : Les Utilisateurs

*Impact Mapping : qui utilise l'application et pourquoi ?*

| Persona | Objectif | Bénéfice attendu |
| :--- | :--- | :--- |
| **👤 Joueurs** | Trouver une table rapidement | **< 10 min** (vs recherche manuelle) |
| **🎲 Organisateurs (MJ)** | Coordonner un groupe | **Minutes** au lieu de jours (sondages) |
| **🏠 Lieux (Bars/Assos)** | Attirer la communauté | Visibilité accrue, nouvelles inscriptions |

---

# 2.1 Objectifs Techniques

* **Mobile First (PWA) :**
    * Expérience "App Native" installable.
    * Utilisable **hors connexion** (Service Worker).
* **Performance :**
    * Architecture **Zoneless**.
    * Objectif : chargement initial **< 2s**.
* **Sécurité :**
    * Validation stricte (**class-validator**).
    * Isolation des données (**RLS** au niveau SQL).

---

# 2.2 Zoom : RLS & class-validator

| Couche | Technologie | Protection |
|--------|-------------|------------|
| **API** | `class-validator` | Valide les données entrantes via décorateurs (`@IsEmail()`, `@Min()`) |
| **Base de données** | **RLS** (Row Level Security) | Filtre les lignes directement dans PostgreSQL |

```
Requête API → Validation DTO → Logique métier → RLS PostgreSQL → Données
              ⛔ Rejet si       ✅ Traitement    ⛔ Filtre selon
              données invalides                   l'utilisateur
```

> **Défense en profondeur :** Même si l'API est compromise, la BDD refuse les accès non autorisés.

---

# 3. Méthodologie

* **⏱️ Sprint Intensif (2 semaines) :** Full Stack complet, de la BDD au déploiement.
* **🤖 IA (Copilote) :**
    * Génération du `seed.ts` et des DTOs
    * Debugging rapide des erreurs
* **🧠 Humain (Architecte) :**
    * Choix UI/UX
    * Migration **Angular Zoneless**
    * Règles **RLS** et config Nx/CI

---

# 4. Architecture

*Stack unifiée (monorepo) avec **Nx***

| Couche | Technologie | Rôle |
| :--- | :--- | :--- |
| **Monorepo** | **Nx** | Partage de code, cache, CI unifiée |
| **Frontend** | **Angular 20** | Zoneless, Signals, PWA |
| **Backend** | **NestJS 11** | Modulaire, validation stricte |
| **Data** | **Prisma** | PostgreSQL + RLS |

> **💡 Type Safety E2E :** Prisma génère les types TS partagés entre Frontend et Backend.

---

# 4.1 Vue d'ensemble de l'Architecture

```
        +------------------+
        |   Nx Monorepo    |
        +------------------+
               |
    +----------+----------+
    |                     |
+-------+             +-------+
|Angular| <-------->  |NestJS |
|  PWA  |             |  API  |
+-------+             +-------+
    |                     |
    v                     v
+-------+             +-------+
|Nomina-|             |Prisma |---> PostgreSQL
|  tim  |             +-------+---> Resend
+-------+
```

---

# 5. Frontend

* **Angular 20.2**
* **Architecture "Zoneless" :**
    * Suppression de `zone.js` pour alléger le bundle
    * Utilisation privilégiée des **Signals** pour la réactivité.
* **UI/UX :**
    * **Tailwind CSS** pour le styling utilitaire.
    * **Leaflet** pour la cartographie (Open Source).
---

# 5.1 Autocomplétion Tolérante (Fuzzy Search)

* **Problème :** Les utilisateurs font des fautes de frappe
  * Ex: "donjon" au lieu de "Dungeons"
* **Solution :** Algorithme de **Levenshtein**
  * Calcul de la "distance d'édition" entre la saisie et la liste de jeux
  * Suggestions pertinentes malgré les erreurs

---

# 5.2 Géolocalisation Intelligente

* **Problème :** Trouver les lieux de jeu proches rapidement
* **Solution :** API **Geolocation** du navigateur
  * Centrage automatique de la carte sur la position de l'utilisateur

---

# 5.3 Tri par Distance (Haversine)

* **Problème :** Trier les lieux par proximité géographique
* **Solution :** **Formule de Haversine**
  * Calcul de la distance en km entre l'utilisateur et chaque lieu
  * Tient compte de la courbure de la Terre

---

# 5.4 Géocodage Automatique (Nominatim)

* **Problème :** Saisie manuelle des coordonnées GPS fastidieuse
* **Solution :** API **OpenStreetMap Nominatim**
  * Conversion automatique adresse → coordonnées
  * La carte se repositionne en temps réel (debounce 1s)

---

# 6. Backend (NestJS)

* **NestJS 11 :** Structure miroir du Frontend (Controllers/Services)
* **Validation stricte :** `class-validator` (ValidationPipe) pour sécuriser les entrées API
* **Emailing :** API **Resend** pour les notifications transactionnelles

---

# 6.1 Sécurité

* **RLS (Row Level Security)** sur Supabase
  * Règles d'accès définies au niveau SQL, pas juste dans l'API
* **Lieux Privés :**
  * Visibilité configurable (public/privé) par le créateur
  * Filtrage automatique côté API selon l'utilisateur connecté

---

# 6.2 Controllers & Services

```
HTTP Request          Controller           Service            Data
     |                    |                   |                 |
     |  GET /sessions/123 |                   |                 |
     |------------------->|                   |                 |
     |                    |   findOne(123)    |                 |
     |                    |------------------>|                 |
     |                    |                   |  prisma.find()  |
     |                    |                   |---------------->|
     |                    |                   |     Session     |
     |                    |                   |<----------------|
     |                    |     Session       |                 |
     |                    |<------------------|                 |
     |      JSON Response |                   |                 |
     |<-------------------|                   |                 |
```

---

# 6.3 Séparation des préoccupations

| Couche | Responsabilité |
|--------|----------------|
| **Controller** | Routes HTTP, validation, délégation |
| **Service** | Logique métier, accès données |

> Le Controller ne sait pas *comment* récupérer les données.
> Le Service ne sait pas *d'où* vient la requête.

---

# 6.4 Modèle de Données

```
User -----> Session <----- Location
  |            |               |
  |            v               |
  +-----> Registration         |
  |                            |
  +----------------------> crée

Game -----> Session (joué dans)
```

---

# 6.4 Modèle de Données

| Entité | Champs clés |
|--------|-------------|
| **User** | id, email, pseudo |
| **Session** | date, maxPlayers, isPrivate |
| **Location** | name, lat, lng, isPrivate |

---

# 7. Qualité & Tests

| Outil | Rôle | Couverture |
|-------|------|------------|
| **Playwright** | Tests E2E | Inscription → Création Session (Chromium) |
| **Jest** | Tests Unitaires | Logique métier, services |

---

# 7.1 CI/CD & Déploiement

* **GitHub Actions** avec `nx affected` : ne rebuild que ce qui a changé.
* **Déploiement conditionnel :** Deploy Hooks (Vercel / Render) déclenchés **uniquement si les tests passent**.
* **Infrastructure as Code :** `render.yaml` + `vercel.json` versionnés.

---

# 8. Démonstration
*(Navigation dans l'application)*

**Scénario Joueur :**
1. 📍 Arrivée sur la carte → géolocalisation automatique
2. 🔍 Recherche d'un jeu avec tolérance aux fautes
3. 📋 Consultation d'une session et inscription

**Scénario Organisateur :**
4. ➕ Création d'un nouveau lieu (géocodage auto)
5. 🎲 Création d'une session de jeu
6. 👥 Gestion des participants

---

# 9. Défis Techniques Rencontrés

### 🏗️ Migration Zoneless
* **Défi :** Documentation encore rare sur Angular 20 Zoneless.
* **Solution :** Hybridation RxJS / Signals et veille technique approfondie.

### 🔒 Row Level Security (RLS)
* **Défi :** Debugger des politiques SQL complexes qui bloquaient mes propres requêtes.
* **Solution :** Utilisation des outils d'inspection de requêtes de Supabase.

---

# 10. Perspectives d'avenir

* **🚀 Court terme (UX) :**
    * Notifications Push (PWA) pour les rappels de jeu.
    * Filtres avancés (par type de jeu, niveau, horaires).
    * **Storybook** pour la documentation des composants UI.
* **🛠 Moyen terme (Fonctionnel) :**
    * Chat en temps réel (via WebSockets Supabase).
    * Connexion avec l'API BoardGameGeek (BGG) pour importer sa ludothèque.
* **💸 Long terme (Business) :**
    * Monétisation via partenariats avec les lieux ludiques.

---

# Conclusion

* ✅ **Objectif atteint :** Une application complète, moderne et testée.
* 🎓 **Apprentissage :** Maîtrise d'une stack "Enterprise" (Nx, Angular, Nest).
* 🚀 **Fierté :** Un outil prêt à servir la communauté des joueurs.

---

# Merci !

### 🔗 Essayez l'application

![QR Code BARADES](https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://barades.com/)

**https://barades.com/** | Code source : [github.com/thinkerers/barades](https://github.com/thinkerers/barades)

### Avez-vous des questions ?