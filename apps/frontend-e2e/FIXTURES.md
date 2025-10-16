# E2E Test Fixtures

## Authentication Fixture

La fixture d'authentification simplifie les tests en éliminant le code répétitif de login.

### Utilisation de base

```typescript
import { test, expect } from './fixtures/auth.fixture';

test('mon test', async ({ authenticatedPage }) => {
  // Déjà connecté en tant qu'alice_dm
  await authenticatedPage.goto('/groups');
  // ... votre test
});
```

### Changer d'utilisateur

```typescript
test('test multi-utilisateur', async ({ page, loginAs, logout }) => {
  await loginAs(page, 'alice_dm');
  // ... tests avec alice
  
  await logout(page);
  await loginAs(page, 'bob_boardgamer');
  // ... tests avec bob
});
```

### Utilisateurs disponibles

- `alice_dm` - Membre de Brussels Adventurers Guild et Elite Strategy Players
- `bob_boardgamer` - Membre de Brussels Adventurers Guild
- `carol_newbie` - Membre de Brussels Adventurers Guild
- `dave_poker` - Membre de Elite Strategy Players
- `eve_admin` - Membre de Brussels Adventurers Guild

## Migration des tests existants

### Avant (code répétitif)
```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('alice_dm').fill('alice_dm');
  await page.getByPlaceholder('••••••••••••').fill('password123');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL('/');
});
```

### Après (avec fixture)
```typescript
import { test, expect } from './fixtures/auth.fixture';

test('mon test', async ({ authenticatedPage }) => {
  // Pas de beforeEach nécessaire !
  await authenticatedPage.goto('/groups');
});
```

## Avantages

✅ **DRY** - Élimine la duplication de code
✅ **Maintenance** - Un seul endroit pour modifier la logique d'auth
✅ **Lisibilité** - Tests plus clairs et focalisés sur le comportement métier
✅ **Fiabilité** - Logique testée et réutilisable
