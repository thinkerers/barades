# 📊 Rapport Jour 4 (Partie 3) - Problèmes rencontrés et solutions

**Date** : 15 octobre 2025  
**Objectif** : Documenter les obstacles techniques et leurs résolutions

---

## 📋 Table des matières

1. [Problème #1 : Fichier .env au mauvais endroit](#problème-1--fichier-env-au-mauvais-endroit)
2. [Problème #2 : Seed.ts utilisant bcrypt](#problème-2--seedts-utilisant-bcrypt)
3. [Problème #3 : Rapport inexact sur POST /sessions](#problème-3--rapport-inexact-sur-post-sessions)
4. [Problème #4 : Content Security Policy (CSP)](#problème-4--content-security-policy-csp)
5. [Problème #5 : Validation minLength sur login](#problème-5--validation-minlength-sur-login)
6. [Problème #6 : Tests TopBar avec Jasmine](#problème-6--tests-topbar-avec-jasmine)
7. [Bilan et leçons apprises](#bilan-et-leçons-apprises)

---

## Problème #1 : Fichier .env au mauvais endroit

### Symptôme
```bash
Error: Cannot find environment variable 'JWT_SECRET'
```

### Cause
Le fichier `.env` a été créé à la racine du projet (`/home/theop/barades/.env`) au lieu de `apps/backend/.env`.

NestJS avec `@nestjs/config` cherche le fichier `.env` dans le répertoire de l'application backend, pas à la racine du monorepo Nx.

### Solution
1. **Suppression** du fichier `.env` à la racine :
```bash
rm /home/theop/barades/.env
```

2. **Vérification** de `apps/backend/.env` :
```bash
cat apps/backend/.env
```

Contenu :
```env
DATABASE_URL="postgresql://user:pass@host:port/db"
JWT_SECRET="votre-secret-jwt-super-securise-ici"
```

3. **Ajout au .gitignore** (déjà présent) :
```gitignore
# Secrets
.env
.env.local
```

### Leçon apprise
Dans un monorepo Nx, chaque application a son propre contexte. Toujours placer les fichiers de configuration au bon niveau :
- ✅ `apps/backend/.env` → Variables backend
- ✅ `apps/frontend/src/environments/` → Config frontend
- ❌ `.env` à la racine → Ignoré par NestJS

---

## Problème #2 : Seed.ts utilisant bcrypt

### Symptôme
Les utilisateurs de test ne pouvaient pas se connecter après migration vers Argon2.

```bash
POST /auth/login
{
  "statusCode": 401,
  "message": "Username or password may be incorrect"
}
```

### Cause
Le fichier `apps/backend/prisma/seed.ts` utilisait encore `bcrypt.hash()` alors que `AuthService.login()` utilisait `argon2.verify()`.

**Seed.ts (AVANT)** :
```typescript
import * as bcrypt from 'bcrypt';

const users = [
  {
    email: 'alice@barades.com',
    username: 'alice_dm',
    passwordHash: await bcrypt.hash('password123', 10), // ❌ bcrypt
  },
  // ...
];
```

**AuthService.login()** :
```typescript
const passwordMatch = await argon2.verify(user.passwordHash, dto.password); // ✅ argon2
```

### Solution
Migration complète du seed vers Argon2 :

```typescript
import * as argon2 from 'argon2';

const users = [
  {
    email: 'alice@barades.com',
    username: 'alice_dm',
    passwordHash: await argon2.hash('password123'), // ✅ argon2
    firstName: 'Alice',
    lastName: 'Dupont',
  },
  // ... 4 autres utilisateurs
];
```

**Régénération de la base** :
```bash
npx tsx apps/backend/prisma/seed.ts
```

### Leçon apprise
Lors d'une migration d'algorithme de hashing :
1. ✅ Mettre à jour **tous** les endroits créant des hashes (seed, signup, tests)
2. ✅ Régénérer les données de test
3. ✅ Vérifier avec un test de connexion

---

## Problème #3 : Rapport inexact sur POST /sessions

### Symptôme
Le rapport initial indiquait :
> ✅ POST /sessions avec token → 200 OK, session créée

Mais en réalité :
```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "Test"}'

{
  "statusCode": 500,
  "message": "Internal server error"
}
```

### Cause
Le `JwtAuthGuard` **fonctionne correctement** (token vérifié, `request.user` attaché), mais `SessionsService.create()` n'est pas implémenté :

```typescript
// apps/backend/src/sessions/sessions.service.ts
create(_createSessionDto: CreateSessionDto) {
  throw new Error('Method not implemented yet'); // ❌ Volontairement non implémenté
}
```

### Solution
**Correction du rapport** pour clarifier :
- ✅ Le guard **valide** le token (401 sans token, pas de 401 avec token)
- ⚠️ Le `create()` lance une erreur 500 (implémentation métier manquante)
- ✅ Cela **prouve** que le guard fonctionne (la requête atteint le service)

**Rapport corrigé** :
```markdown
**5. Route protégée AVEC token valide**

Réponse :
{
  "statusCode": 500,
  "message": "Internal server error"
}

⚠️ **Guard fonctionne** (token accepté) mais `SessionsService.create()` 
n'est pas implémenté (erreur volontaire pour MVP).
```

### Leçon apprise
- ✅ Distinguer les erreurs de guard (401) des erreurs métier (500)
- ✅ Documenter précisément ce qui est testé vs ce qui est implémenté
- ✅ Erreur 500 ≠ échec du test (si l'objectif est de tester le guard)

---

## Problème #4 : Content Security Policy (CSP)

### Symptôme
Impossible de se connecter via l'interface Angular. Erreur dans la console :

```
Content-Security-Policy: The page's settings blocked the loading of a resource 
(connect-src) at http://localhost:3000/api/auth/login because it violates the 
following directive: "default-src chrome:"

TypeError: NetworkError when attempting to fetch resource.
```

### Cause
Angular en développement impose une Content Security Policy qui bloque les requêtes cross-origin vers `http://localhost:3000` (backend) depuis `http://localhost:4200` (frontend).

**Tentative initiale** :
```typescript
// apps/frontend/src/environments/environment.ts
export const environment = {
  apiUrl: 'http://localhost:3000/api' // ❌ Cross-origin bloqué par CSP
};
```

### Solution : Configuration d'un proxy

#### 1. Créer `apps/frontend/proxy.conf.json`

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

**Fonctionnement** :
- Requête frontend : `http://localhost:4200/api/auth/login`
- Proxy redirige vers : `http://localhost:3000/api/auth/login`
- Même origine pour le navigateur → Pas de violation CSP

#### 2. Configurer le dev server

**Fichier** : `apps/frontend/project.json`

```json
{
  "serve": {
    "executor": "@angular/build:dev-server",
    "configurations": {
      "development": {
        "buildTarget": "frontend:build:development",
        "proxyConfig": "apps/frontend/proxy.conf.json"
      }
    },
    "options": {
      "proxyConfig": "apps/frontend/proxy.conf.json"
    }
  }
}
```

#### 3. Utiliser des URLs relatives

**Fichier** : `apps/frontend/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: '/api' // ✅ URL relative, proxy s'en charge
};
```

**Production** : `environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.barades.com/api' // URL complète en prod
};
```

#### 4. Redémarrer le serveur

```bash
# Arrêter le serveur actuel (Ctrl+C)
npx nx serve frontend
```

### Résultat
✅ Requêtes fonctionnelles depuis l'interface Angular  
✅ Pas de violation CSP  
✅ Token stocké dans localStorage  
✅ Connexion/déconnexion opérationnelles

### Leçon apprise
- ✅ Toujours configurer un proxy en développement pour éviter les problèmes CORS/CSP
- ✅ URLs relatives en dev, URLs complètes en prod
- ✅ Le proxy doit être redémarré après modification de la config

---

## Problème #5 : Validation minLength sur login

### Symptôme
Impossible de se connecter avec les utilisateurs de test via l'interface :

```
Le mot de passe doit contenir au moins 12 caractères
```

Mais `password123` = 11 caractères seulement.

### Cause
Le formulaire de login utilisait la même validation que le formulaire d'inscription :

```typescript
// login.component.ts (AVANT)
this.loginForm = this.fb.group({
  username: ['', [Validators.required]],
  password: ['', [Validators.required, Validators.minLength(12)]] // ❌ Trop strict
});
```

**Problème** :
- La validation `minLength(12)` est **correcte pour signup** (nouveaux mots de passe)
- Mais **incorrecte pour login** (mots de passe existants peuvent être plus courts)
- Les utilisateurs de test ont `password123` (11 caractères)

### Solution
Retirer la validation côté frontend pour le login (validation backend suffit) :

```typescript
// login.component.ts (APRÈS)
this.loginForm = this.fb.group({
  username: ['', [Validators.required]],
  password: ['', [Validators.required]] // ✅ Pas de minLength
});
```

**Template** : Retrait du message d'erreur

```html
<!-- login.component.html (AVANT) -->
<mat-form-field appearance="outline" class="full-width">
  <mat-label>Mot de passe</mat-label>
  <input matInput type="password" formControlName="password">
  @if (loginForm.get('password')?.hasError('required')) {
    <mat-error>Le mot de passe est requis</mat-error>
  }
  @if (loginForm.get('password')?.hasError('minlength')) {
    <mat-error>Le mot de passe doit contenir au moins 12 caractères</mat-error> <!-- ❌ -->
  }
</mat-form-field>

<!-- login.component.html (APRÈS) -->
<mat-form-field appearance="outline" class="full-width">
  <mat-label>Mot de passe</mat-label>
  <input matInput type="password" formControlName="password">
  @if (loginForm.get('password')?.hasError('required')) {
    <mat-error>Le mot de passe est requis</mat-error>
  }
  <!-- ✅ Plus de validation minLength -->
</mat-form-field>
```

### Résultat
✅ Connexion avec `alice_dm` / `password123` fonctionne  
✅ Validation stricte reste en place pour le **signup**  
✅ Backend rejette toujours les mots de passe trop courts lors de la création

### Leçon apprise
- ✅ Différencier validation **login** (permissive) vs **signup** (stricte)
- ✅ Login : Valider uniquement les champs requis (backend gère la logique métier)
- ✅ Signup : Valider strictement pour garantir la qualité des nouveaux comptes

---

## Problème #6 : Tests TopBar avec Jasmine

### Symptôme
```
FAIL  apps/frontend/src/app/core/navigation/top-bar.spec.ts
  TopBar › should create

  ReferenceError: jasmine is not defined

    13 |   beforeEach(async () => {
  > 14 |     mockAuthService = jasmine.createSpyObj('AuthService', [
       |     ^
```

### Cause
Le projet utilise **Jest** comme framework de test, mais le fichier de test utilisait la syntaxe **Jasmine** (`jasmine.createSpyObj`).

**Pourquoi ?** Confusion lors de la génération du composant (templates Angular génèrent souvent du code Jasmine par défaut).

### Solution
Remplacer les mocks Jasmine par des mocks Jest :

```typescript
// top-bar.spec.ts (AVANT - Jasmine)
let mockAuthService: jasmine.SpyObj<AuthService>;

beforeEach(async () => {
  mockAuthService = jasmine.createSpyObj('AuthService', [
    'isAuthenticated',
    'getCurrentUser',
    'logout'
  ]);
  mockAuthService.isAuthenticated.and.returnValue(false);
  mockAuthService.getCurrentUser.and.returnValue(null);
  // ...
});
```

```typescript
// top-bar.spec.ts (APRÈS - Jest)
let mockAuthService: Partial<AuthService>;

beforeEach(async () => {
  mockAuthService = {
    isAuthenticated: jest.fn().mockReturnValue(false),
    getCurrentUser: jest.fn().mockReturnValue(null),
    logout: jest.fn()
  };
  // ...
});
```

### Résultat
```
PASS  apps/frontend/src/app/core/navigation/top-bar.spec.ts
  TopBar
    ✓ should create (82 ms)
```

### Leçon apprise
- ✅ Vérifier le framework de test avant d'écrire les mocks (`jest.config.ts` vs `karma.conf.js`)
- ✅ Jest : `jest.fn().mockReturnValue()`
- ✅ Jasmine : `jasmine.createSpyObj()` avec `.and.returnValue()`
- ✅ Ne pas mélanger les deux syntaxes

---

## Bilan et leçons apprises

### Problèmes résolus
| # | Problème | Impact | Temps perdu | Solution |
|---|----------|--------|-------------|----------|
| 1 | .env au mauvais endroit | 🔴 Bloquant | 15min | Déplacer vers apps/backend/.env |
| 2 | Seed avec bcrypt | 🟠 Moyen | 20min | Migration vers argon2 |
| 3 | Rapport inexact | 🟡 Faible | 10min | Clarification documentation |
| 4 | CSP bloquant requêtes | 🔴 Bloquant | 45min | Configuration proxy |
| 5 | Validation minLength login | 🟠 Moyen | 10min | Retrait validation frontend |
| 6 | Tests Jasmine vs Jest | 🟡 Faible | 15min | Remplacement par mocks Jest |
| **TOTAL** | | | **~2h** | |

### Bonnes pratiques adoptées

1. **Structure monorepo** :
   - ✅ Fichiers de config au bon niveau (apps/backend/.env, apps/frontend/proxy.conf.json)
   - ✅ Environnements séparés (dev vs prod)

2. **Sécurité** :
   - ✅ Migration Argon2 complète (seed + service)
   - ✅ JWT_SECRET dans .env (pas hardcodé)
   - ✅ Proxy pour éviter exposition du backend en dev

3. **Testing** :
   - ✅ Mocks adaptés au framework (Jest vs Jasmine)
   - ✅ Tests unitaires avant commit
   - ✅ Validation manuelle (curl + interface)

4. **Documentation** :
   - ✅ Rapports précis (distinguer guard OK vs métier KO)
   - ✅ Historique des problèmes et solutions
   - ✅ Commits descriptifs

### Temps total debug
**~2 heures** sur 8 heures de développement = **25% du temps**  
→ Ratio acceptable pour une première implémentation d'authentification

### Prévention future
- [ ] Checklist avant commit (tests, lint, build)
- [ ] Template de PR avec section "Tests manuels"
- [ ] Scripts de validation (ex: `npm run validate` = lint + test + build)
- [ ] Documentation des configurations spécifiques au monorepo

---

**Rapport généré le** : 15 octobre 2025  
**Commits liés** : `ac92d02` (frontend auth), `adc9231` (proxy fix)
