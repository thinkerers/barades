# 📊 Rapport Jour 2 - Partie 1 : Configuration Supabase et Prisma

## 1. Configuration initiale de Supabase

### 1.1 Création du projet

**Plateforme** : [supabase.com](https://supabase.com)  
**Configuration choisie** :
- **Nom du projet** : yugtxsppenzskyutjytx
- **Région** : Europe West (eu-west-3, Paris) - choisie pour sa proximité géographique
- **Mot de passe** : Généré de manière sécurisée

**Justification de la région** : La région Europe West a été choisie pour minimiser la latence, l'application étant destinée principalement à des utilisateurs européens (contexte Brussels/Bruxelles).

### 1.2 Configuration des URLs de connexion

Supabase fournit deux types de connexions PostgreSQL distinctes, chacune avec un usage spécifique :

#### 1.2.1 DATABASE_URL (Transaction Pooler - Port 6543)

```bash
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Usage** :
- Requêtes normales de l'application (GET, POST, PUT, DELETE)
- Opérations runtime du backend NestJS

**Avantages** :
- Connection pooling via PgBouncer
- Mode `transaction` : chaque requête obtient une connexion temporaire
- Idéal pour applications stateless (serverless, NestJS)
- Économise les connexions DB (PostgreSQL limite à ~100 connexions simultanées)

**Limitation** :
- Ne supporte PAS les prepared statements
- Nécessite le flag `?pgbouncer=true` dans l'URL

**Source** : [Supabase Database Connections](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

#### 1.2.2 DIRECT_URL (Direct Connection - Port 5432)

```bash
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
```

**Usage** :
- Opérations Prisma nécessitant une connexion persistante
- `prisma db push` (migrations)
- `prisma migrate dev`
- `prisma db seed`
- Introspection du schéma

**Avantage** : Support complet des features PostgreSQL  
**Inconvénient** : Consomme une connexion directe (limitée à ~100)

**Source** : [Prisma with Supabase](https://www.prisma.io/docs/orm/overview/databases/supabase)

#### 1.2.3 Paramètre ?pgbouncer=true

**Raison** : Flag Prisma pour désactiver les prepared statements  
**Nécessaire** : Avec PgBouncer en mode transaction  
**Source** : [Prisma Connection Pooling](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pooling#pgbouncer)

### 1.3 Configuration du fichier .env

**Emplacement** : `apps/backend/.env`

```bash
# Supabase PostgreSQL Connection
DATABASE_URL="postgresql://postgres.yugtxsppenzskyutjytx:[PASSWORD]@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.yugtxsppenzskyutjytx:[PASSWORD]@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
DATABASE_PASSWORD="[PASSWORD]"

# Application
PORT=3000
```

**⚠️ Sécurité** : Ce fichier est dans `.gitignore` pour éviter de committer les credentials.

### 1.4 Mise à jour du schéma Prisma

**Fichier** : `apps/backend/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

generator erd {
  provider = "prisma-erd-generator"
  output   = "../../../doc/database-erd.svg"
  theme    = "forest"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // ← Ajout critique
}
```

**Explication** :
- `url` : Utilisé par le Prisma Client à runtime (via PgBouncer)
- `directUrl` : Utilisé par la CLI Prisma pour les migrations/introspection (connexion directe)
- Prisma switch automatiquement entre les deux selon le contexte

### 1.5 Architecture de connexion

```
┌─────────────────────────────────┐
│   NestJS Application            │
│   (Runtime - Port 3000)         │
│                                 │
│   PrismaClient                  │
└────────────┬────────────────────┘
             │
             │ DATABASE_URL
             │ Transaction Pooler :6543
             │ (PgBouncer mode transaction)
             │ ↓ Connection pooling
             │
┌────────────▼────────────────────┐
│   Supabase PostgreSQL           │
│   (AWS eu-west-3)               │
│   Database: postgres            │
│   Version: PostgreSQL 15        │
└────────────▲────────────────────┘
             │
             │ DIRECT_URL
             │ Direct Connection :5432
             │ (Full PostgreSQL features)
             │ ↑ Migrations only
             │
┌────────────┴────────────────────┐
│   Prisma CLI (Dev tools)        │
│   - prisma db push              │
│   - prisma migrate dev          │
│   - prisma db seed              │
│   - prisma generate             │
└─────────────────────────────────┘
```

**Avantages de cette architecture** :
1. **Performance** : Connection pooling réduit la latence des requêtes
2. **Scalabilité** : Gère efficacement de nombreuses connexions simultanées
3. **Fiabilité** : Séparation dev tools / runtime évite les conflits
4. **Best practice** : Recommandation officielle Prisma + Supabase

---

**Résultat** : ✅ Configuration validée, connexion testée avec `npx prisma db push`

**Prochaine étape** : → [Partie 2 : Conception du schéma](rapport-jour2-02-schema.md)
