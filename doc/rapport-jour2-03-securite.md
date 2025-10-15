# 📊 Rapport Jour 2 - Partie 3 : Sécurisation avec Row Level Security (RLS)

## 3. Sécurisation de la base de données

### 3.1 Contexte et besoin

Supabase est une plateforme BaaS (Backend as a Service) qui expose automatiquement une API PostgREST publique pour chaque table PostgreSQL. Sans sécurisation, **n'importe qui pourrait accéder/modifier les données**.

**Problème identifié** :
- L'API PostgREST Supabase est accessible publiquement
- Même si notre backend NestJS gère l'authentification, l'API Supabase reste un vecteur d'attaque

**Solution retenue** : Row Level Security (RLS)

### 3.2 Qu'est-ce que RLS ?

**Row Level Security (RLS)** est une fonctionnalité native de PostgreSQL qui permet de définir des **policies** (règles) au niveau des lignes de données.

**Principe** :
- Chaque requête SQL est exécutée dans un **contexte** (role PostgreSQL)
- Des policies déterminent quelles lignes un utilisateur peut voir/modifier
- Le filtrage est fait **côté base de données**, pas applicatif

**Documentation PostgreSQL** : [Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

### 3.3 Architecture de sécurité choisie

```
┌────────────────────────────────────────┐
│   Frontend Angular                     │
│   (localhost:4200)                     │
└──────────────┬─────────────────────────┘
               │
               │ HTTP Requests (JWT)
               │
┌──────────────▼─────────────────────────┐
│   Backend NestJS                       │
│   (localhost:3000)                     │
│                                        │
│   - Passport.js + JWT validation       │
│   - Custom authentication logic        │
│   - Authorization checks               │
└──────────────┬─────────────────────────┘
               │
               │ Prisma Client
               │ SERVICE_ROLE key (bypass RLS)
               │
┌──────────────▼─────────────────────────┐
│   Supabase PostgreSQL                  │
│                                        │
│   ┌────────────────────────────────┐  │
│   │  RLS ENABLED on all tables     │  │
│   │                                │  │
│   │  service_role → BYPASS RLS ✅   │  │
│   │  anon/authenticated → BLOCKED   │  │
│   └────────────────────────────────┘  │
│                                        │
│   PostgREST API (port :443) → BLOCKED │
└────────────────────────────────────────┘
```

**Décision architecturale** :
- ✅ Backend NestJS utilise la clé `service_role` → **bypass RLS**
- ✅ Toute logique auth/authz est dans NestJS (centralisée)
- ❌ L'API PostgREST publique est bloquée (pas de policies permissives)

**Justification** :
1. **Simplicité** : Une seule source de vérité pour l'authentification (NestJS)
2. **Flexibilité** : Logique métier complexe dans le code, pas SQL
3. **Sécurité par défaut** : RLS activé = PostgREST bloqué, même si clé anon leak
4. **Découplage** : Pas de vendor lock-in Supabase Auth, custom JWT avec `@nestjs/jwt` + `argon2`

**Note importante** : L'authentification sera implémentée **sans Passport.js** (voir [article Trilon](https://trilon.io/blog/nestjs-authentication-without-passport)), en utilisant directement `@nestjs/jwt` pour plus de contrôle et de transparence pédagogique (TFE).

### 3.4 Script RLS production-ready

**Fichier** : `apps/backend/prisma/enable-rls.sql` (430 lignes)

#### 3.4.1 Structure du script

```sql
-- ============================================
-- SECTION 1: DOCUMENTATION SÉCURITÉ (100 lignes)
-- ============================================
/*
  TRUST MODEL:
  - Frontend → Backend NestJS (custom JWT auth, no Passport)
  - Backend → Supabase (service_role key, bypass RLS)
  - PostgREST API → BLOCKED (no permissive policies)

  JWT STRUCTURE (custom implementation):
  {
    "sub": "user-uuid",          // user.id
    "username": "user@email.com",
    "firstName": "John",
    "lastName": "Doe",
    "iat": 1234567890,          // issued at
    "exp": 1234571490           // expiration (1h)
  }

  AUTHENTICATION FLOW:
  1. POST /auth/signup → argon2.hash(password) → save User → return JWT
  2. POST /auth/login → argon2.verify(password) → return JWT
  3. Protected routes → JwtGuard extracts & verifies JWT → req.user = payload
*/

-- ============================================
-- SECTION 2: ACTIVATION RLS (7 tables)
-- ============================================
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Location" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Group" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GroupMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reservation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Poll" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 3: INDEXES OPTIMISÉS (10 indexes)
-- ============================================
- Simple indexes
CREATE INDEX IF NOT EXISTS idx_sessions_hostId ON public.sessions("hostId");
CREATE INDEX IF NOT EXISTS idx_sessions_date ON public.sessions(date);
CREATE INDEX IF NOT EXISTS idx_reservations_userId ON public.reservations("userId");
CREATE INDEX IF NOT EXISTS idx_reservations_sessionId ON public.reservations("sessionId");
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_group_members_userId ON public.group_members("userId");
CREATE INDEX IF NOT EXISTS idx_group_members_groupId ON public.group_members("groupId");
CREATE INDEX IF NOT EXISTS idx_groups_creatorId ON public.groups("creatorId");

- Compound indexes
CREATE INDEX IF NOT EXISTS idx_sessions_host_date 
  ON public.sessions("hostId", date);
CREATE INDEX IF NOT EXISTS idx_reservations_session_status 
  ON public.reservations("sessionId", status);

-- ============================================
-- SECTION 4: POLICIES (commentées) (200+ lignes)
-- ============================================
/* 
  EXEMPLE: Policy SELECT pour User
  (commenté car backend utilise service_role)

  CREATE POLICY "user_select_own" 
    ON "User" FOR SELECT
    USING (id = (SELECT auth.uid())::uuid);

  CREATE POLICY "user_select_public" 
    ON "User" FOR SELECT
    USING (true);  -- Profils publics
*/

-- Policies pour chaque table (SELECT, INSERT, UPDATE, DELETE)
-- Toutes commentées car architecture = NestJS auth

-- ============================================
-- SECTION 5: SECURITY DEFINER FUNCTIONS (50 lignes)
-- ============================================
-- Fonctions avec SET search_path pour éviter hijacking
CREATE OR REPLACE FUNCTION public.is_group_admin(
  p_user_id uuid,
  p_group_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "GroupMember"
    WHERE "userId" = p_user_id
      AND "groupId" = p_group_id
      AND role = 'ADMIN'
  );
END;
$$;

-- ============================================
-- SECTION 6: PRE-FLIGHT CHECKLIST (30 lignes)
-- ============================================
/*
  □ Vérifier que service_role bypass RLS
  □ Tester PostgREST bloqué avec clé anon
  □ Valider indexes créés (EXPLAIN ANALYZE)
  □ Documenter JWT structure si auth externe
  □ Backup avant déploiement
  □ Monitoring erreurs RLS (logs Supabase)
*/
```

#### 3.4.2 Points critiques du script

**1. SET search_path dans SECURITY DEFINER functions**

```sql
CREATE FUNCTION public.is_group_admin(...)
SECURITY DEFINER
SET search_path = public, pg_temp  -- ← CRITIQUE !
```

**Pourquoi ?** : Évite l'attack vector "function hijacking" où un attaquant crée une fonction malveillante dans son schema.

**Source** : [PostgreSQL Security Best Practices](https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY)

**2. Pas de SELECT triggers pour audit**

❌ **Erreur initiale** : Script incluait des triggers ON SELECT pour logging  
✅ **Correction** : SELECT triggers n'existent pas en PostgreSQL

**Alternatives documentées** :
- `pgaudit` extension pour audit complet
- Application-level logging (dans NestJS)
- `pg_stat_statements` pour monitoring queries

**3. UUID casting explicite**

```sql
WHERE "hostId" = (SELECT auth.uid())::uuid
                                    ^^^^^
```

**Raison** : `auth.uid()` retourne `text`, pas `uuid`. Le casting explicite évite les erreurs de type.

### 3.5 Déploiement et vérification

**Exécution** :
```sql
-- Dans Supabase SQL Editor
\i apps/backend/prisma/enable-rls.sql
```

**Vérification** :
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

**Résultat** :
```
 schemaname |   tablename    | rowsecurity 
------------+----------------+-------------
 public     | User           | t
 public     | Session        | t
 public     | Location       | t
 public     | Group          | t
 public     | GroupMember    | t
 public     | Reservation    | t
 public     | Poll           | t
```

✅ **rls_enabled = true** sur les 7 tables

### 3.6 Tests de sécurité

**Test 1** : Vérifier que service_role bypass RLS
```bash
# Backend NestJS avec service_role key
curl http://localhost:3000/api/sessions
# ✅ Retourne les données
```

**Test 2** : Vérifier que PostgREST est bloqué (avec clé anon)
```bash
# Requête directe à PostgREST avec anon key
curl https://yugtxsppenzskyutjytx.supabase.co/rest/v1/User \
  -H "apikey: eyJh..." \
  -H "Authorization: Bearer eyJh..."
# ✅ Retourne [] (aucune policy permissive)
```

### 3.7 Évolutions futures possibles

**Si besoin de refresh tokens** :
1. Ajouter table `RefreshToken` avec expiration longue (7 jours)
2. Endpoint POST /auth/refresh pour obtenir nouveau access token
3. Rotation automatique des refresh tokens

**Si besoin d'OAuth (Google, GitHub)** :
1. Option 1 : Ajouter Passport.js uniquement pour OAuth strategies
2. Option 2 : Utiliser Supabase Auth (OAuth intégré)
3. Mapper les OAuth users vers table `User` Prisma

**Si besoin d'audit trail** :
1. Installer `pgaudit` extension
2. Configurer log_statement = 'all'
3. Parser logs Supabase pour analytics

**Pourquoi pas Passport.js ?** :
- Pour une auth locale simple (username/password + JWT), Passport n'apporte que ~30 lignes d'abstraction
- Custom implementation = **contrôle total** + **code explicite** (meilleur pour TFE)
- Référence : [NestJS Authentication without Passport (Trilon)](https://trilon.io/blog/nestjs-authentication-without-passport)

---

**Résultat** : ✅ Base de données sécurisée, RLS activé, PostgREST bloqué

**Prochaine étape** : → [Partie 4 : Données de test (seed)](./rapport-jour2-04-seed.md)
