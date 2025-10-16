# Tests E2E Playwright - Barades

## 📝 Description

Cette suite de tests E2E valide les fonctionnalités principales de l'application Barades :

### Tests d'authentification (`auth.spec.ts`)
- ✅ Affichage du formulaire de connexion
- ✅ Connexion réussie avec credentials valides (alice_dm, bob_boardgamer)
- ✅ Message d'erreur avec credentials invalides
- ✅ Déconnexion et suppression du token
- ✅ Redirection vers login pour routes protégées
- ✅ Redirection vers returnUrl après login
- ✅ Connexion avec différents utilisateurs

### Tests de navigation des groupes (`groups.spec.ts`)
- ✅ Affichage de la liste des groupes
- ✅ Visibilité des groupes publics (Brussels Adventurers Guild, Casual Board Gamers)
- ✅ Visibilité du groupe privé Elite Strategy Players pour alice_dm (membre)
- ✅ Masquage du groupe privé pour bob_boardgamer (non-membre)
- ✅ Navigation vers la page détail d'un groupe
- ✅ Affichage des informations du groupe (jeux, localisation, playstyle)
- ✅ Affichage du compteur de membres et créateur
- ✅ Badge "recrutement" pour les groupes qui recrutent
- ✅ Filtrage par playstyle
- ✅ Navigation retour vers la liste

### Tests de création de sondages (`polls.spec.ts`)
- ✅ Création de sondage dans Elite Strategy Players par alice_dm
- ✅ Prévention d'accès au groupe privé pour bob_boardgamer
- ✅ Bouton création sondage visible seulement pour membres
- ✅ Affichage des sondages existants (seed data)
- ✅ Affichage des dates et compteurs de votes
- ✅ Validation des champs du formulaire
- ✅ Création de plusieurs sondages dans le même groupe

### Tests de vote sur sondages (`voting.spec.ts`)
- ✅ Vote sur une date de sondage
- ✅ Retrait d'un vote
- ✅ Affichage visuel des dates votées par l'utilisateur
- ✅ Affichage de la meilleure date (plus de votes)
- ✅ Prévention de vote pour les non-membres
- ✅ Mise à jour des compteurs en temps réel
- ✅ Vote sur plusieurs dates dans le même sondage
- ✅ Affichage des détails de vote au survol

## 🚀 Exécution

### Prérequis
```bash
# Installer les navigateurs Playwright (première fois uniquement)
npx playwright install
```

### Lancer tous les tests E2E
```bash
npx nx e2e frontend-e2e
```

### Lancer un fichier de test spécifique
```bash
npx nx e2e frontend-e2e --grep="auth"
npx nx e2e frontend-e2e --grep="groups"
npx nx e2e frontend-e2e --grep="polls"
npx nx e2e frontend-e2e --grep="voting"
```

### Mode UI interactif (debug)
```bash
npx playwright test --ui
```

### Voir le rapport HTML
```bash
npx playwright show-report dist/.playwright/apps/frontend-e2e/playwright-report
```

## 🔧 Configuration

Les tests démarrent automatiquement :
- **Backend** sur `http://localhost:3000` (API NestJS)
- **Frontend** sur `http://localhost:4200` (Angular)

Configuration dans `apps/frontend-e2e/playwright.config.ts` :
- Timeout : 120s par serveur
- Réutilise les serveurs existants si déjà démarrés
- Navigateurs : Chromium, Firefox, WebKit

## 📊 Données de test

Les tests utilisent les données du seed (`apps/backend/prisma/seed.ts`) :

### Utilisateurs
- **alice_dm** : Membre de Brussels Adventurers Guild + Elite Strategy Players (privé)
- **bob_boardgamer** : Membre de Casual Board Gamers (non-membre d'Elite)
- **carol_newbie** : Membre de Brussels Adventurers Guild + Casual Board Gamers
- **dave_poker** : Admin d'Elite Strategy Players
- **eve_admin** : Membre de Brussels Adventurers Guild

Tous ont le mot de passe : `password123`

### Groupes
- **Brussels Adventurers Guild** : Public, recrutement actif
- **Casual Board Gamers** : Public, recrutement actif
- **Elite Strategy Players** : Privé, seulement alice_dm et dave_poker

### Sondages
- Sondage existant dans Brussels Adventurers Guild : "Best date for next one-shot campaign?"
  - Dates : 2025-10-25 (2 votes), 2025-10-26 (2 votes), 2025-11-01 (1 vote)

## 🐛 Debug

### Voir les traces Playwright
```bash
npx playwright show-trace dist/.playwright/apps/frontend-e2e/test-output/<trace-file>.zip
```

### Mode headed (voir le navigateur)
```bash
npx playwright test --headed
```

### Mode debug (pause sur chaque action)
```bash
npx playwright test --debug
```

## 📈 CI/CD

Les tests E2E peuvent être exécutés en CI avec :
```bash
npx nx e2e-ci frontend-e2e
```

Cette commande :
- Démarre les serveurs automatiquement
- Exécute les tests en parallèle
- Génère des rapports HTML
- Capture des screenshots en cas d'échec

## 🔗 Ressources

- [Documentation Playwright](https://playwright.dev/)
- [Nx Playwright Plugin](https://nx.dev/nx-api/playwright)
- [Rapports de test](./doc/TESTS_MANUELS.md)
