# 📊 Rapport Jour 2 - Partie 2 : Conception du schéma de base de données

## 2. Conception du schéma Prisma

### 2.1 Analyse des besoins

À partir du prototype HTML/CSS existant et des spécifications TFE, les entités suivantes ont été identifiées :

**Entités principales** :
- **User** : Joueurs, MJ, administrateurs
- **Session** : Parties de jeu organisées
- **Location** : Lieux physiques ou en ligne
- **Group** : Communautés de joueurs
- **Reservation** : Inscriptions aux sessions
- **GroupMember** : Appartenance utilisateur/groupe
- **Poll** : Sondages pour dates de jeu

### 2.2 Structure finale du schéma

#### 2.2.1 Modèle User

```prisma
model User {
  id          String      @id @default(uuid())
  email       String      @unique
  username    String      @unique
  password    String      // Stocké hashé (bcrypt)
  bio         String?     @db.Text
  avatar      String?
  skillLevel  SkillLevel?
  preferences Json?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Relations
  hostedSessions Session[]
  reservations   Reservation[]
  groupMembers   GroupMember[]
  createdGroups  Group[]       @relation("GroupCreator")

  @@map("users")
}
```

**Champs clés** :
- `skillLevel` : Niveau d'expérience (BEGINNER, INTERMEDIATE, EXPERT)
- `preferences` : JSON flexible pour stocker favoris, notifications, etc.
- Relations one-to-many avec sessions (en tant que host), réservations, groupes

#### 2.2.2 Modèle Session

```prisma
model Session {
  id                String       @id @default(uuid())
  game              String
  title             String
  description       String?      @db.Text
  date              DateTime
  recurrenceRule    String?
  recurrenceEndDate DateTime?
  online            Boolean      @default(false)
  level             SessionLevel
  playersMax        Int          @default(4)
  playersCurrent    Int          @default(0)
  tagColor          TagColor     @default(GRAY)
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  // Relations
  hostId     String
  locationId String?
  host         User          @relation(fields: [hostId], references: [id], onDelete: Cascade)
  location     Location?     @relation(fields: [locationId], references: [id], onDelete: SetNull)
  reservations Reservation[]

  @@index([date])
  @@index([hostId])
  @@index([game])
  @@map("sessions")
}
```

**Fonctionnalités avancées** :
- `recurrenceRule` : Support sessions récurrentes (format iCal standard)
- `tagColor` : Catégorisation visuelle (PURPLE, BLUE, GREEN, RED, GRAY) - valeur par défaut GRAY
- `playersMax` : Valeur par défaut 4 (optimisé pour la plupart des jeux de table)

#### 2.2.3 Modèle Location

```prisma
model Location {
  id           String       @id @default(uuid())
  name         String
  address      String?
  city         String
  type         LocationType
  rating       Float        @default(0)
  amenities    String[]
  capacity     Int?
  openingHours Json?
  icon         String       @default("store")
  lat          Float
  lon          Float
  website      String?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  // Relations
  sessions Session[]

  @@index([city])
  @@index([lat, lon])
  @@map("locations")
}
```

**Points techniques** :
- `amenities` : Array PostgreSQL pour listes (WiFi, Food, Parking, etc.)
- `openingHours` : JSON pour horaires flexibles par jour de semaine
- `lat`/`lon` : Coordonnées GPS pour intégration Leaflet

#### 2.2.4 Modèle Group

```prisma
model Group {
  id          String    @id @default(uuid())
  name        String
  games       String[]
  location    String
  playstyle   Playstyle
  description String    @db.Text
  recruiting  Boolean   @default(true)
  avatar      String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  creatorId String?
  creator   User?         @relation("GroupCreator", fields: [creatorId], references: [id], onDelete: SetNull)
  members   GroupMember[]
  polls     Poll[]

  @@map("groups")
}
```

**Design choice** :
- `creatorId` nullable : Permet suppression du créateur sans supprimer le groupe

#### 2.2.5 Modèle GroupMember

```prisma
model GroupMember {
  id       String    @id @default(uuid())
  role     GroupRole @default(MEMBER)
  joinedAt DateTime  @default(now())

  userId String
  groupId String
  user    User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  group   Group @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@unique([userId, groupId])
  @@map("group_members")
}
```

**Contrainte métier** : `@@unique([userId, groupId])` empêche les doublons

**Rôle par défaut** : `MEMBER` (les admins sont explicitement définis dans le seed)

#### 2.2.6 Modèle Reservation

```prisma
model Reservation {
  id        String            @id @default(uuid())
  status    ReservationStatus @default(PENDING)
  message   String?           @db.Text
  createdAt DateTime          @default(now())
  updatedAt DateTime          @updatedAt

  sessionId String
  userId    String
  session   Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([sessionId, userId])
  @@index([status])
  @@map("reservations")
}
```

**Statuts possibles** : PENDING (défaut), CONFIRMED, CANCELLED

#### 2.2.7 Modèle Poll

```prisma
model Poll {
  id        String   @id @default(uuid())
  title     String
  dates     String[]
  votes     Json     @default("{}")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  groupId String
  group   Group  @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@map("polls")
}
```

**Structure votes** : JSON flexible permettant de tracker les votes par date et par utilisateur

### 2.3 Enumerations (7 enums pour type safety)

```prisma
enum SkillLevel {
  BEGINNER     @map("Beginner")
  INTERMEDIATE @map("Intermediate")
  EXPERT       @map("Expert")
}

enum SessionLevel {
  BEGINNER     @map("Beginner")
  INTERMEDIATE @map("Intermediate")
  ADVANCED     @map("Advanced")
  OPEN         @map("Open to all")
}

enum ReservationStatus {
  PENDING   @map("pending")
  CONFIRMED @map("confirmed")
  CANCELLED @map("cancelled")
}

enum GroupRole {
  MEMBER @map("member")
  ADMIN  @map("admin")
}

enum LocationType {
  BAR              @map("Bar")
  CAFE             @map("Cafe")
  GAME_STORE       @map("Game Store")
  COMMUNITY_CENTER @map("Community Center")
  PRIVATE          @map("Private")
}

enum Playstyle {
  CASUAL       @map("Casual")
  COMPETITIVE  @map("Competitive")
  STORY_DRIVEN @map("Story-driven")
  SOCIAL       @map("Social")
}

enum TagColor {
  RED    @map("red")
  GREEN  @map("green")
  PURPLE @map("purple")
  BLUE   @map("blue")
  GRAY   @map("gray")
}
```

**Avantages des enums** :
- Type safety compile-time
- Validation automatique Prisma
- Autocomplétion IDE
- Documentation du domaine métier

### 2.4 Indexes et optimisations

**Note importante** : Les indexes listés ci-dessous sont créés via le script SQL `enable-rls.sql`, **pas directement dans `schema.prisma`**. Cette approche permet un contrôle fin des indexes PostgreSQL et évite les limitations du DSL Prisma.

**Fichier** : `apps/backend/prisma/enable-rls.sql` (section 2)

#### Indexes créés manuellement (10 au total)

**Indexes simples** (8) :
- `idx_sessions_hostId` : Filtrer les sessions d'un MJ
- `idx_sessions_date` : Ordonner les sessions par date
- `idx_reservations_userId` : Lister les réservations d'un joueur
- `idx_reservations_sessionId` : Rechercher les participants d'une session
- `idx_reservations_status` : Filtrer par statut (pending/confirmed)
- `idx_group_members_userId` : Retrouver les groupes d'un utilisateur
- `idx_group_members_groupId` : Lister les membres d'un groupe
- `idx_groups_creatorId` : Retrouver les groupes créés par un MJ/admin

**Indexes composés** (2) :
- `idx_sessions_host_date` → `(hostId, date)` pour filtrer les sessions d'un MJ
- `idx_reservations_session_status` → `(sessionId, status)` pour compter les participants par statut

**Justification de l'approche SQL** :
- ✅ Contrôle précis des noms d'index (pas de `@idx_...` auto-générés)
- ✅ Possibilité d'ajouter options PostgreSQL (`CONCURRENTLY`, `WHERE`, etc.)
- ✅ Séparation concerns : schema = structure, SQL = optimisations
- ❌ Nécessite synchronisation manuelle si schema change

**Vérification** :
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' AND tablename IN ('sessions', 'reservations', 'group_members');
```

### 2.5 Validation et déploiement

**Commande** :
```bash
npx prisma db push
```

**Résultat** :
- ✅ 7 tables créées dans PostgreSQL
- ✅ 7 enums créés
- ✅ Prisma Client généré dans `apps/backend/generated/prisma`
- 📌 Indexes appliqués séparément via `enable-rls.sql`

**Étape suivante** :
```sql
\i apps/backend/prisma/enable-rls.sql
```
- Active Row Level Security
- Crée les 10 indexes détaillés ci-dessus
- Documente les futures policies (toujours commentées au Jour 2)

**Vérification Supabase** :
- Table Editor montre les 7 tables
- Advisors (recommendations) : aucun warning

---

**Résultat** : ✅ Schéma validé et déployé sur Supabase

**Prochaine étape** : → [Partie 3 : Sécurisation RLS](./rapport-jour2-03-securite.md)
