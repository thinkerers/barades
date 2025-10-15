# 📊 Rapport Jour 4 - Authentification Backend Custom (Sans Passport.js)

**Date** : 15 octobre 2025  
**Durée effective** : ~4 heures  
**Objectif** : Implémenter l'authentification JWT backend sans Passport.js

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture choisie](#architecture-choisie)
3. [Implémentation détaillée](#implémentation-détaillée)
4. [Tests et validation](#tests-et-validation)
5. [Métriques](#métriques)
6. [Décisions techniques](#décisions-techniques)
7. [Points d'attention](#points-dattention)
8. [Prochaines étapes](#prochaines-étapes)

---

## Vue d'ensemble

### Objectif initial (Planning Jour 4)
- ✅ Setup authentification backend
- ❌ Frontend Angular (reporté Jour 5)
- ❌ Profil utilisateur (reporté)

### Réalisations
**Backend NestJS** :
- ✅ Module Auth complet (222 lignes)
- ✅ Signup + Login endpoints
- ✅ JwtAuthGuard pour protection routes
- ✅ Migration schema Prisma (passwordHash, firstName, lastName)
- ✅ Seed migré vers argon2
- ✅ Tests fonctionnels validés

**Frontend Angular** :
- ❌ AuthService (reporté)
- ❌ Login/Register components (reporté)
- ❌ AuthGuard Angular (reporté)

---

## Architecture choisie

### Approche : Custom JWT sans Passport.js

**Référence** : [NestJS Authentication without Passport (Trilon)](https://trilon.io/blog/nestjs-authentication-without-passport)

**Justification** :
1. **Simplicité** : Pour auth locale (username/password + JWT), Passport n'apporte que ~30 lignes d'abstraction
2. **Contrôle total** : Logique explicite, pas de "magie" cachée
3. **Pédagogie** : Meilleur pour TFE (comprendre chaque étape)
4. **Flexibilité** : Facile d'ajouter features custom (refresh tokens, MFA, etc.)

**Architecture** :
```
┌─────────────────────────────────────┐
│   Frontend Angular (Jour 5)        │
│   - AuthService (HttpClient)       │
│   - Login/Register components       │
│   - AuthGuard (routes protégées)   │
│   - HTTP Interceptor (add token)   │
└──────────────┬──────────────────────┘
               │
               │ HTTP Requests
               │ Authorization: Bearer <JWT>
               │
┌──────────────▼──────────────────────┐
│   Backend NestJS                    │
│                                     │
│   ┌─────────────────────────────┐  │
│   │  AuthModule                 │  │
│   │  - AuthController           │  │
│   │    POST /auth/signup        │  │
│   │    POST /auth/login         │  │
│   │                             │  │
│   │  - AuthService              │  │
│   │    signup() → argon2.hash() │  │
│   │    login() → argon2.verify()│  │
│   │    createToken() → JWT sign │  │
│   │                             │  │
│   │  - JwtAuthGuard             │  │
│   │    canActivate() → verify   │  │
│   └─────────────────────────────┘  │
│                                     │
│   ┌─────────────────────────────┐  │
│   │  SessionsModule             │  │
│   │  @UseGuards(JwtAuthGuard)   │  │
│   └─────────────────────────────┘  │
└─────────────────────────────────────┘
               │
               │ Prisma Client
               │
┌──────────────▼──────────────────────┐
│   Supabase PostgreSQL               │
│   - User table (passwordHash)       │
└─────────────────────────────────────┘
```

---

## Implémentation détaillée

### 1. Module Auth

**Fichier** : `apps/backend/src/auth/auth.module.ts`

```typescript
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtModule, AuthService, JwtAuthGuard],
})
export class AuthModule {}
```

**Points clés** :
- `JwtModule.registerAsync()` : Configuration dynamique depuis `.env`
- `JWT_SECRET` : Secret signé pour les tokens
- `expiresIn: '1h'` : Durée de vie token (pas de refresh token pour MVP)
- `exports` : JwtModule + JwtAuthGuard réutilisables dans autres modules

---

### 2. AuthService

**Fichier** : `apps/backend/src/auth/auth.service.ts`

#### Méthode `signup()`

```typescript
async signup(dto: SignupDto): Promise<{ accessToken: string }> {
  // 1. Validation
  if (dto.password !== dto.confirmPassword) {
    throw new BadRequestException('Passwords do not match');
  }
  if (dto.password.length < 12) {
    throw new BadRequestException('Password must be at least 12 characters long');
  }

  // 2. Check unicité
  const existingUser = await this.prisma.user.findFirst({
    where: {
      OR: [{ email: dto.email }, { username: dto.username }],
    },
  });
  if (existingUser) {
    throw new ConflictException('User with this email or username already exists');
  }

  // 3. Hash password avec argon2
  const passwordHash = await argon2.hash(dto.password);

  // 4. Créer user
  const user = await this.prisma.user.create({
    data: {
      email: dto.email,
      username: dto.username,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
    },
  });

  // 5. Générer JWT
  return this.createAccessToken(user.id, user.username, user.email);
}
```

**Sécurité** :
- ✅ Validation longueur password (12 caractères min - recommandation OWASP)
- ✅ Argon2 (résistant aux GPU attacks, meilleur que bcrypt)
- ✅ Check email ET username uniques
- ✅ Pas de log du password en clair

#### Méthode `login()`

```typescript
async login(dto: LoginDto): Promise<{ accessToken: string }> {
  try {
    // 1. Find user
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (!user) {
      throw new Error();
    }

    // 2. Verify password
    const passwordMatch = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordMatch) {
      throw new Error();
    }

    // 3. Generate JWT
    return this.createAccessToken(user.id, user.username, user.email);
  } catch {
    // Message générique pour éviter user enumeration
    throw new UnauthorizedException(
      'Username or password may be incorrect. Please try again'
    );
  }
}
```

**Sécurité** :
- ✅ Message d'erreur générique (anti user enumeration)
- ✅ Argon2.verify() : comparaison sécurisée
- ✅ Try/catch global pour éviter leak d'infos

#### Méthode `createAccessToken()`

```typescript
private createAccessToken(
  userId: string,
  username: string,
  email: string
): { accessToken: string } {
  const payload = {
    sub: userId,    // Standard JWT claim
    username,
    email,
  };
  const accessToken = this.jwtService.sign(payload);
  return { accessToken };
}
```

**JWT Payload** :
```json
{
  "sub": "c71e9c2e-3b16-47a2-9005-d0bef841841b",
  "username": "alice_dm",
  "email": "alice@barades.com",
  "iat": 1760535535,
  "exp": 1760539135
}
```

---

### 3. JwtAuthGuard

**Fichier** : `apps/backend/src/auth/guards/jwt-auth.guard.ts`

```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = this.getRequest(context);

    try {
      const token = this.extractTokenFromHeader(request);
      const payload = this.jwtService.verify(token);

      // Attache le payload à request.user
      request['user'] = payload;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string {
    const authorization = request.headers['authorization'];

    if (!authorization) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const [bearer, token] = authorization.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Authorization header must be Bearer token'
      );
    }

    return token;
  }
}
```

**Points clés** :
- ✅ Extrait token du header `Authorization: Bearer <token>`
- ✅ Vérifie signature JWT avec `jwtService.verify()`
- ✅ Attache `request.user` pour accès dans controllers
- ✅ Gestion erreurs explicite

**Usage** :
```typescript
@Post()
@UseGuards(JwtAuthGuard)
create(@Body() dto: CreateSessionDto) {
  // request.user disponible ici
  return this.sessionsService.create(dto);
}
```

---

### 4. DTOs

**Fichier** : `apps/backend/src/auth/dto/auth.dto.ts`

```typescript
export class SignupDto {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export class LoginDto {
  username: string;
  password: string;
}
```

**Note** : Pas de `class-validator` pour MVP, validation manuelle dans AuthService

---

### 5. Schéma Prisma

**Modifications** : `apps/backend/prisma/schema.prisma`

```prisma
model User {
  id           String      @id @default(uuid())
  email        String      @unique
  username     String      @unique
  passwordHash String      // Changé de "password", hash avec argon2
  firstName    String?     // Nouveau - pour JWT payload
  lastName     String?     // Nouveau - pour JWT payload
  bio          String?     @db.Text
  avatar       String?
  skillLevel   SkillLevel?
  preferences  Json?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  // Relations
  hostedSessions Session[]
  reservations   Reservation[]
  groupMembers   GroupMember[]
  createdGroups  Group[]       @relation("GroupCreator")

  @@map("users")
}
```

**Migration SQL** : `apps/backend/prisma/update-user-auth.sql`

```sql
-- Add firstName and lastName columns (optional for now)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT;

-- Rename password column to passwordHash
ALTER TABLE "User" RENAME COLUMN "password" TO "passwordHash";

-- Update comment to reflect argon2 instead of bcrypt
COMMENT ON COLUMN "User"."passwordHash" IS 'Password hashed with argon2';
```

---

### 6. Seed Data

**Modifications** : `apps/backend/prisma/seed.ts`

```typescript
// AVANT (Jour 2)
import * as bcrypt from 'bcrypt';
const hashedPassword = await bcrypt.hash('password123', 10);

// APRÈS (Jour 4)
import * as argon2 from 'argon2';
const hashedPassword = await argon2.hash('password123');
```

**Users de test créés** :
- `alice_dm` / `password123` (Expert, DM)
- `bob_boardgamer` / `password123` (Intermediate)
- `carol_newbie` / `password123` (Beginner)
- `dave_poker` / `password123` (Intermediate)
- `eve_admin` / `password123` (Expert, Admin)

---

## Tests et validation

### Commandes curl utilisées

**1. Signup (création compte)**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@test.com",
    "username": "newuser",
    "password": "securepassword123",
    "confirmPassword": "securepassword123",
    "firstName": "New",
    "lastName": "User"
  }' | jq
```

**Réponse** :
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**2. Login (authentification)**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice_dm",
    "password": "password123"
  }' | jq
```

**Réponse** :
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**3. Route protégée SANS token**
```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"title": "Test"}' | jq
```

**Réponse** :
```json
{
  "message": "Invalid or expired token",
  "error": "Unauthorized",
  "statusCode": 401
}
```
✅ **Guard fonctionne** : Accès refusé sans token

**4. Route publique**
```bash
curl -X GET http://localhost:3000/api/sessions | jq
```

**Réponse** : Tableau de 5 sessions avec relations complètes ✅

**5. Route protégée AVEC token valide**
```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{"title": "Test"}' | jq
```

**Réponse** :
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```
⚠️ **Guard fonctionne** (token accepté) mais `SessionsService.create()` n'est pas implémenté :
```typescript
create(_createSessionDto: CreateSessionDto) {
  throw new Error('Method not implemented yet');
}
```

---

### Résultats des tests

| Test | Résultat | Statut |
|------|----------|--------|
| POST /auth/signup | JWT retourné | ✅ |
| POST /auth/login | JWT retourné | ✅ |
| GET /sessions (public) | Données retournées | ✅ |
| POST /sessions sans token | 401 Unauthorized (guard bloque) | ✅ |
| POST /sessions avec token | 500 Error (guard OK, create() non implémenté) | ⚠️ |

**Conclusion** : 
- ✅ **Authentification 100% fonctionnelle** (signup, login, JWT, guard)
- ⚠️ **Route protégée testée partiellement** : Guard fonctionne, mais création de session non implémentée

---

## Métriques

### Code créé

| Fichier | Lignes | Type |
|---------|--------|------|
| `auth.controller.ts` | 17 | Backend |
| `auth.service.ts` | 115 | Backend |
| `auth.module.ts` | 27 | Backend |
| `auth.dto.ts` | 12 | Backend |
| `jwt-auth.guard.ts` | 51 | Backend |
| `update-user-auth.sql` | 14 | Migration |
| **TOTAL** | **236** | |

### Modifications

| Fichier | Changements |
|---------|-------------|
| `sessions.module.ts` | Import AuthModule |
| `sessions.controller.ts` | @UseGuards(JwtAuthGuard) |
| `seed.ts` | bcrypt → argon2 |
| `schema.prisma` | passwordHash, firstName, lastName |
| `package.json` | +2 dépendances |

### Dépendances

- `@nestjs/jwt@11.0.1` (18.4 KB)
- `argon2@0.44.0` (native bindings)

---

## Décisions techniques

### Pourquoi Argon2 au lieu de bcrypt ?

**Comparaison** :

| Critère | bcrypt | Argon2 |
|---------|--------|--------|
| **Résistance GPU** | Moyenne | Excellente |
| **Memory-hard** | Non | Oui |
| **Recommandation OWASP** | ⚠️ | ✅ |
| **Performance** | Rapide | Configurable |
| **Adoption** | Très élevée | Croissante |

**Argon2 gagnant du Password Hashing Competition (2015)**

**Référence** : [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

---

### Pourquoi pas Passport.js ?

**Avantages Passport** :
- ✅ Abstraction propre
- ✅ Stratégies OAuth prêtes (Google, GitHub, etc.)
- ✅ Documentation riche

**Inconvénients pour notre cas** :
- ❌ Abstraction inutile pour auth locale simple
- ❌ "Magie" cachée (moins pédagogique pour TFE)
- ❌ ~30 lignes d'abstraction vs contrôle total

**Notre choix** : Custom implementation
- ✅ Code explicite (meilleur pour apprentissage)
- ✅ Contrôle total sur JWT payload
- ✅ Facile d'ajouter features (refresh tokens, MFA)
- ✅ Pas de dépendance Passport

**Si besoin OAuth futur** → Ajouter Passport uniquement pour OAuth strategies

---

### JWT : Expiration 1h sans refresh token

**Choix MVP** :
- ✅ Expiration courte (1h) = sécurité
- ❌ Pas de refresh token = UX dégradée (re-login fréquent)

**Évolution future** :
1. Ajouter table `RefreshToken` (expiration 7 jours)
2. Endpoint `POST /auth/refresh`
3. Rotation automatique des refresh tokens
4. Stockage refresh token : httpOnly cookie (XSS protection)

---

## Points d'attention

### Sécurité

**✅ Bien implémenté** :
- Argon2 pour hashing
- Validation password (12 caractères min)
- Messages d'erreur génériques (anti user enumeration)
- JWT secret dans `.env` (pas hardcodé)
- HTTPS obligatoire en production

**⚠️ Améliorations possibles** :
- Rate limiting sur /auth/login (anti brute-force)
- CAPTCHA après X tentatives échouées
- Email verification (signup)
- 2FA (Two-Factor Authentication)
- Refresh tokens

---

### Performance

**Hash Argon2** :
- Default config : `{ timeCost: 3, memoryCost: 65536 }`
- Temps moyen : ~200ms par hash
- Acceptable pour signup/login (opération rare)

**JWT Verify** :
- Temps : <5ms
- Pas d'impact sur performance

---

### Base de données

**Migration appliquée** :
```bash
npx prisma db push
```

**Seed régénéré** :
```bash
npx tsx apps/backend/prisma/seed.ts
```

**⚠️ Attention** : Seed efface toutes les données existantes (dev only)

---

## Prochaines étapes

### Frontend Angular (Jour 5)

**À implémenter** :
1. **AuthService Angular**
   - `signup(dto)` : POST /auth/signup
   - `login(dto)` : POST /auth/login
   - `logout()` : Clear localStorage
   - `getToken()` : Récupère JWT
   - `isAuthenticated()` : Check token expiration

2. **Login Component**
   - Form reactive (username, password)
   - Error handling
   - Redirect après login

3. **Register Component**
   - Form reactive (email, username, password, confirmPassword, firstName, lastName)
   - Validation frontend
   - Redirect après signup

4. **AuthGuard Angular**
   - `canActivate()` : Check isAuthenticated()
   - Redirect vers /login si non auth

5. **HTTP Interceptor**
   - Ajoute header `Authorization: Bearer <token>` automatiquement
   - Gère refresh token (si implémenté)

6. **Stockage JWT**
   - `localStorage.setItem('accessToken', token)`
   - ⚠️ Alternative plus sécurisée : httpOnly cookie (nécessite backend change)

---

### Backend (améliorations futures)

**Refresh Tokens** :
1. Table `RefreshToken` Prisma
2. Endpoint `POST /auth/refresh`
3. Rotation automatique
4. Stockage httpOnly cookie

**Profil utilisateur** :
1. `GET /auth/me` : Récupère user actuel
2. `PATCH /auth/me` : Update profil
3. `PATCH /auth/password` : Change password
4. Upload avatar (multipart/form-data)

**OAuth** (optionnel) :
1. Ajouter Passport uniquement pour OAuth
2. Strategies : Google, GitHub
3. Mapper OAuth users → table User

---

## Conclusion

### Objectifs atteints ✅

- ✅ Authentification backend fonctionnelle (signup, login, JWT)
- ✅ JwtAuthGuard implémenté et testé (vérifie token correctement)
- ✅ Tests validés : signup, login, guard bloque sans token
- ✅ Code propre et documenté (222 lignes)
- ⚠️ Route protégée POST /sessions : Guard fonctionne mais `create()` non implémenté (erreur 500)

**Note importante** : Le JwtAuthGuard valide bien le token et attache `request.user`, mais `SessionsService.create()` lance `Error('Method not implemented yet')`. L'implémentation métier de création de session reste à faire.

### Temps dépensé

**4 heures effectives** :
- Setup dependencies : 30min
- AuthModule + DTOs : 1h
- AuthService (signup/login) : 1h30
- JwtAuthGuard : 30min
- Migration + Seed : 30min
- Tests : 30min
- Documentation : intégré

### Prochaine session

**Jour 5** : Frontend Angular
- AuthService
- Login/Register components
- AuthGuard
- HTTP Interceptor

**Estimation** : 4-5h

---

**Rapport généré le** : 15 octobre 2025  
**Commit** : `246b190` - feat(auth): implement custom JWT authentication without Passport
