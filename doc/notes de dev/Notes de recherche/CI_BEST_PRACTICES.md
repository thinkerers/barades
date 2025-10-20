# Bonnes pratiques CI/CD avec Nx

## Scripts npm disponibles

```bash
# Tests unitaires (seulement les projets affectés)
npm test

# Tous les tests unitaires
npm run test:all

# Tests avec couverture (mode CI)
npm run test:ci

# Tests E2E (projets affectés)
npm run e2e

# Tous les tests E2E
npm run e2e:all

# Lint (projets affectés)
npm run lint

# Lint complet
npm run lint:all
```

## Configuration Nx optimisée

### Cache
- **Activé** sur tous les targets (build, test, lint, e2e)
- **Répertoire**: `.nx/cache`
- **Nx Cloud**: Activé (ID: `68d709b723ed6608f3102b33`)

### Parallel execution
- **Limite**: 3 tâches en parallèle par défaut
- **Personnalisable**: `nx run-many --target=test --parallel=5`

### Inputs optimisés
- **Production builds**: Excluent fichiers de tests et configs de test
- **Tests**: Incluent `default` + `^production` (dépendances de production)
- **E2E**: Incluent `default` + `^production` (frontend/backend builds)

## Workflow CI recommandé

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Important pour nx affected
          
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Derive SHAs for affected
        uses: nrwl/nx-set-shas@v4
        
      - name: Lint affected
        run: npm run lint
        
      - name: Test affected (with coverage)
        run: npm run test:ci
        
      - name: Build affected
        run: npx nx affected --target=build --parallel=3
        
      - name: E2E affected
        run: npm run e2e
        
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          directory: ./coverage
```

## Optimisations locales

### Tests rapides pendant le développement
```bash
# Tester un seul projet
npx nx test backend

# Tester avec watch mode
npx nx test backend --watch

# Tester seulement les fichiers modifiés
npm test
```

### Debugging
```bash
# Voir quels projets sont affectés
npx nx affected:graph

# Voir les logs détaillés
npx nx test backend --verbose

# Désactiver le cache temporairement
npx nx test backend --skip-nx-cache
```

### Nettoyage
```bash
# Supprimer le cache Nx
npx nx reset

# Supprimer les artefacts de build
rm -rf dist

# Supprimer tout et réinstaller
rm -rf node_modules .nx dist && npm install
```

## Bonnes pratiques

### ✅ À FAIRE
- Utiliser `nx affected` en CI pour tester seulement ce qui a changé
- Activer le cache sur tous les targets
- Utiliser Nx Cloud pour partager le cache entre développeurs
- Configurer `inputs` correctement pour chaque target
- Paralléliser les tâches avec `--parallel`

### ❌ À ÉVITER
- Lancer `nx run-many --all` systématiquement en CI (lent)
- Désactiver le cache sans raison
- Ignorer les `inputs` dans `targetDefaults`
- Tester les dépendances non affectées
- Oublier `fetch-depth: 0` dans GitHub Actions

## Métriques

- **Tests backend**: ~3s (60 tests)
- **Tests E2E**: ~12s (29 tests)
- **Cache hit**: ~80-90% de temps économisé
- **Parallel (3 workers)**: ~60% plus rapide que séquentiel
