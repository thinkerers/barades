# Tests E2E Playwright - Barades

## 📝 Description

Cette suite de tests E2E valide les fonctionnalités principales de l'application Barades en utilisant les **bonnes pratiques 2025** :

✅ **Sélecteurs accessibles** : `getByRole()`, `getByText()`, `getByLabel()`  
✅ **Testing Library philosophy** : Tester comme un utilisateur réel  
✅ **Auto-waiting** : Pas de `waitForTimeout()` manuel  
✅ **Robustesse** : Éviter les sélecteurs CSS fragiles  

### Tests d'authentification (`auth.spec.ts`)
- ✅ Affichage du formulaire de connexion
- ✅ Connexion réussie avec credentials valides (alice_dm, bob_boardgamer)
- ✅ Message d'erreur avec credentials invalides
- ✅ Déconnexion (via localStorage.clear() - TODO: ajouter bouton UI)
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
cd apps/frontend-e2e
npx playwright test --ui
```

### Mode headed (voir le navigateur)
```bash
npx playwright test --headed
```

### Voir le rapport HTML
```bash
npx playwright show-report dist/.playwright/apps/frontend-e2e/playwright-report
```

## 🎯 Bonnes Pratiques 2025

### Hiérarchie des sélecteurs (par ordre de préférence)

1. **`getByRole()`** - Meilleur (accessible, robuste)
```typescript
await page.getByRole('button', { name: 'Créer un sondage' });
await page.getByRole('heading', { name: 'Brussels Adventurers Guild' });
```

2. **`getByLabel()`** - Bon pour les formulaires
```typescript
await page.getByLabel('Titre du sondage').fill('Mon sondage');
```

3. **`getByPlaceholder()`** - Acceptable
```typescript
await page.getByPlaceholder('alice_dm').fill('alice_dm');
```

4. **`getByText()`** - Pour le contenu
```typescript
await page.getByText('Brussels Adventurers Guild').click();
```

5. **Locators avec classes** - Si nécessaire pour composants spécifiques
```typescript
const pollDisplay = page.locator('.poll-display').first();
```

6. **`data-testid`** - **Dernier recours** uniquement
```typescript
// ❌ Éviter autant que possible
await page.getByTestId('some-id');
```

### Pourquoi cette approche ?

- ✅ **Accessibilité** : Les tests valident que l'UI est utilisable par tous
- ✅ **Robustesse** : Résistant aux changements de style CSS
- ✅ **Lisibilité** : Le code de test ressemble à l'usage réel
- ✅ **Maintenance** : Moins de tests cassés lors de refactoring UI

## 📚 Ressources

- [Documentation Playwright](https://playwright.dev/)
- [Nx Playwright Plugin](https://nx.dev/nx-api/playwright)
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles/)
- [Rapports de test](./doc/TESTS_MANUELS.md)

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


## � Configuration
