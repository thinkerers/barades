---
marp: false
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

# 🎲 BARADES
## L'application pour organiser vos sessions de jeu sur table

**Théophile Desmedt**
*Développeur Web Front-End | TFE 2024-2025*

---

# 1. Le Constat & La Problématique

* 📈 **Demande croissante :** +1200 nouveautés/an en France[^2], +9% de croissance mondiale[^1].
* 😵 **Paralysie du choix :** Face à l'abondance, le joueur est perdu.
* 🧩 **Casse-tête logistique :** Difficulté majeure à **synchroniser les agendas** et trouver un lieu adapté.
* 🌍 **Isolement :** Le joueur itinérant ne sait pas *où* jouer ni *avec qui*.
* 📣 **Visibilité :** Les bars à jeux et assos peinent à communiquer leurs événements.

> **Solution :** Une plateforme centralisée pour faciliter la **rencontre**, la **découverte** et le **test** de jeux avant achat.

[^1]: Gus&Co, *Statistiques jeux de société 2023*, 22 novembre 2023. https://gusandco.net/2023/11/22/statistiques-jeux-de-societe-2023
[^2]: Le Figaro, *1 200 nouveautés chaque année : la surproduction de jeux de société met-elle le secteur en péril ?*, 27 juillet 2025. https://www.lefigaro.fr/conso/1200-nouveautes-chaque-annee-la-surproduction-de-jeux-de-societe-met-elle-le-secteur-en-peril-20250727

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

* **📱 Mobile First (PWA) :**
    * Expérience "App Native" installable.
    * Utilisable **hors connexion** (Service Worker).
* **⚡ Performance :**
    * Architecture **Zoneless** pour une réactivité immédiate.
    * Objectif : chargement initial **< 2s**.
* **🔒 Sécurité :**
    * Validation stricte (**class-validator**).
    * Isolation des données (**RLS** au niveau SQL).

---

# 3. Méthodologie "Commando"

* **⏱️ Sprint Intensif (2 semaines) :** Développement "Full Stack" complet, de la BDD au déploiement.
* **🤖 L'Accélérateur IA (Copilote) :**
    * **Boilerplate & Data :** Génération du `seed.ts` complexe et des DTOs de validation.
    * **Debugging :** Analyse instantanée des erreurs (ex: sérialisation tests E2E).
* **🧠 La Plus-Value Humaine (Architecte) :**
    * **Choix Critiques :** Migration vers **Angular Zoneless** (techno trop récente pour l'IA).
    * **Sécurité :** Implémentation manuelle des règles **RLS** (Row Level Security).
    * **Orchestration :** Configuration fine du Monorepo Nx et du CI/CD.

> **Approche :** L'IA produit le code répétitif, l'humain garantit l'**architecture**, la **sécurité** et la **qualité**.

---

# 4. Architecture : La Cohérence Full TypeScript

*Une stack unifiée, orchestrée par **Nx**, pour une fiabilité absolue.*

| Couche | Technologie | Rôle & Innovation |
| :--- | :--- | :--- |
| **Monorepo** | **Nx** | Partage de code (`packages/ui`), Cache de build, CI unifiée. |
| **Frontend** | **Angular 20.2** | Architecture **Zoneless** (Performance), **Signals**, PWA. |
| **Backend** | **NestJS 11** | Structure modulaire, Validation stricte (**class-validator**). |
| **Data** | **Prisma / Supabase** | **PostgreSQL** avec Row Level Security (RLS). |

> **💡 L'atout majeur : "End-to-End Type Safety"**
> Le schéma Prisma génère les types TypeScript, partagés via `packages/ui`.
> *Résultat :* Toute modification du schéma BDD déclenche une erreur de compilation côté Frontend.

---

# 5. Focus Frontend : Bleeding Edge

* **Angular 20.2 :** Utilisation des dernières innovations.
* **Architecture "Zoneless" :**
    * Suppression de `zone.js` pour alléger le bundle.
    * Utilisation privilégiée des **Signals** pour la réactivité.
    * *Gain :* **-73%** sur le bundle initial (327 KB → 35 KB gzippé).
    * *(Mesuré via `webpack-bundle-analyzer` en build prod)*
* **UI/UX :**
    * **Tailwind CSS** pour le styling utilitaire.
    * **Leaflet** pour la cartographie (Open Source).
    * **Mobile-first** design.

---

# 5.1 Zoom Technique : UX Intelligente

* **🔍 Autocomplétion Tolérante (Fuzzy Search) :**
    * **Problème :** Les utilisateurs font des fautes de frappe (ex: "donjon" au lieu de "Dungeons").
    * **Solution :** Implémentation de l'algorithme de **Levenshtein**.
    * **Technique :** Calcul de la "distance d'édition" entre la saisie et la liste de jeux pour suggérer les résultats pertinents malgré les erreurs.

* **📍 Géolocalisation Intelligente :**
    * **Problème :** Trouver les lieux de jeu proches rapidement.
    * **Solution :** Utilisation de l'API **Geolocation** du navigateur pour centrer la carte sur la position de l'utilisateur.

* **📐 Tri par Distance Réelle (Haversine) :**
    * **Problème :** Trier les lieux par proximité géographique précise.
    * **Solution :** Implémentation de la **formule de Haversine** pour calculer la distance en km entre l'utilisateur et chaque lieu.

---

# 6. Focus Backend & Sécurité

* **NestJS 11 :** Structure miroir du Frontend (Controllers/Services).
* **Validation stricte :** Utilisation de `class-validator` (ValidationPipe) pour sécuriser les entrées API.
* **Emailing :** Intégration de l'API **Resend** pour les notifications transactionnelles.
* **Sécurité Base de Données :**
    * **RLS (Row Level Security)** sur Supabase.
    * Les règles d'accès sont définies au niveau du moteur SQL, pas juste dans l'API.

---

# 7. Qualité & Tests

| Outil | Rôle | Couverture |
|-------|------|------------|
| **Playwright** | Tests E2E | Inscription → Création Session (Chromium) |
| **Jest** | Tests Unitaires | Logique métier, services |
| **Storybook 9** | Documentation UI | Composants isolés (`packages/ui`) |

---

# 7.1 CI/CD & Déploiement

* **GitHub Actions** avec `nx affected` : ne rebuild que ce qui a changé.
* **Déploiement conditionnel :** Deploy Hooks (Vercel / Render) déclenchés **uniquement si les tests passent**.
* **Infrastructure as Code :** `render.yaml` + `vercel.json` versionnés.

---

# 8. Démonstration
*(Navigation dans l'application)*

1.  **Recherche** d'un lieu sur la carte.
2.  **Consultation** des sessions disponibles.
3.  **Inscription** à une table de jeu.

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