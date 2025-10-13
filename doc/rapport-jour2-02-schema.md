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
  id         String   @id @default(uuid())
  email      String   @unique
  username   String   @unique
  password   String
  bio        String?
  avatar     String?
  skillLevel SkillLevel?
  preferences Json?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  hostedSessions    Session[]      @relation("SessionHost")
  reservations      Reservation[]
  groupMemberships  GroupMember[]
  createdGroups     Group[]        @relation("GroupCreator")

  @@index([email])
  @@index([username])
}
```

**Champs clés** :
- `skillLevel` : Niveau d'expérience (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
- `preferences` : JSON flexible pour stocker favoris, notifications, etc.
- Relations one-to-many avec sessions (en tant que host), réservations, groupes

#### 2.2.2 Modèle Session

```prisma
model Session {
  id                String       @id @default(uuid())
  game              String
  title             String
  description       String?
  date              DateTime
  recurrenceRule    String?      // Format iCal (FREQ=WEEKLY;BYDAY=TU)
  recurrenceEndDate DateTime?
  online            Boolean      @default(false)
  level             SessionLevel
  playersMax        Int          @default(4)
  playersCurrent    Int          @default(0)
  tagColor          TagColor     @default(GRAY)  // Non optionnel, avec valeur par défaut
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  // Foreign Keys
  hostId     String
  locationId String?

  // Relations
  host         User          @relation(fields: [hostId], references: [id], onDelete: Cascade)
  location     Location?     @relation(fields: [locationId], references: [id], onDelete: SetNull)
  reservations Reservation[]

  @@index([date])
  @@index([hostId])
  @@index([game])
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
  rating       Float?
  amenities    String[]     // Array PostgreSQL natif
  capacity     Int?
  openingHours Json?        // {monday: "10:00-22:00", ...}
  icon         String?
  lat          Float?
  lon          Float?
  website      String?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  // Relations
  sessions Session[]

  @@index([city])
}
```

**Points techniques** :
- `amenities` : Array PostgreSQL pour listes (WiFi, Food, Parking, etc.)
- `openingHours` : JSON pour horaires flexibles par jour de semaine
- `lat`/`lon` : Coordonnées GPS pour intégration Leaflet

#### 2.2.4 Modèle Group

```prisma
model Group {
  id          String     @id @default(uuid())
  name        String
  games       String[]   // Jeux pratiqués
  location    String
  playstyle   Playstyle
  description String     @db.Text  // Non optionnel
  recruiting  Boolean    @default(true)
  avatar      String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  // Foreign Key
  creatorId String?

  // Relations
  creator User?        @relation("GroupCreator", fields: [creatorId], references: [id], onDelete: SetNull)
  members GroupMember[]
  polls   Poll[]
}
```

**Design choice** :
- `creatorId` nullable : Permet suppression du créateur sans supprimer le groupe

#### 2.2.5 Modèle GroupMember

```prisma
model GroupMember {
  id       String    @id @default(uuid())
  role     GroupRole
  joinedAt DateTime  @default(now())

  // Foreign Keys
  userId  String
  groupId String

  // Relations
  user  User  @relation(fields: [userId], references: [id])
  group Group @relation(fields: [groupId], references: [id])

  @@unique([userId, groupId])  // Un user ne peut rejoindre qu'une fois
  @@index([userId])
  @@index([groupId])
}
```

**Contrainte métier** : `@@unique([userId, groupId])` empêche les doublons

#### 2.2.6 Modèle Reservation

```prisma
model Reservation {
  id        String            @id @default(uuid())
  status    ReservationStatus
  message   String?
  createdAt DateTime          @default(now())
  updatedAt DateTime          @updatedAt

  // Foreign Keys
  sessionId String
  userId    String

  // Relations
  session Session @relation(fields: [sessionId], references: [id])
  user    User    @relation(fields: [userId], references: [id])

  @@unique([sessionId, userId])  // Une seule réservation par user/session
  @@index([sessionId])
  @@index([userId])
  @@index([sessionId, status])   // Compound index pour compter par statut
}
```

**Statuts possibles** : PENDING, CONFIRMED, CANCELLED

#### 2.2.7 Modèle Poll

```prisma
model Poll {
  id        String   @id @default(uuid())
  title     String
  dates     String[] // Array de dates proposées
  votes     Json     // {"2025-10-25": ["userId1", "userId2"], ...}
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Foreign Key
  groupId String

  // Relation
  group Group @relation(fields: [groupId], references: [id])

  @@index([groupId])
}
```

**Structure votes** : JSON flexible permettant de tracker les votes par date et par utilisateur

### 2.3 Enumerations (7 enums pour type safety)

```prisma
enum SkillLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  EXPERT
}

enum SessionLevel {
  BEGINNER      // Débutants bienvenus
  INTERMEDIATE  // Expérience requise
  ADVANCED      // Joueurs confirmés
  OPEN          // Tous niveaux
}

enum ReservationStatus {
  PENDING    // En attente validation MJ
  CONFIRMED  // Acceptée
  CANCELLED  // Annulée
}

enum GroupRole {
  ADMIN   // Peut gérer membres, éditer groupe
  MEMBER  // Membre standard
}

enum LocationType {
  GAME_STORE  // Boutique de jeux
  CAFE        // Bar/Café
  PRIVATE     // Lieu privé ou en ligne
  BAR         // Bar (distinct du café)
  COMMUNITY_CENTER  // Centre communautaire
}

enum Playstyle {
  COMPETITIVE     // Jeu compétitif
  CASUAL          // Jeu relaxé
  STORY_DRIVEN    // Narratif / RP
}

enum TagColor {
  PURPLE
  BLUE
  GREEN
  RED
  GRAY
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

**Indexes simples** (7) :
- `idx_sessions_hostId` : Optimise les requêtes "sessions d'un host"
- `idx_sessions_date` : Tri par date pour calendriers
- `idx_reservations_userId` : Recherche réservations par utilisateur
- `idx_reservations_sessionId` : Participants d'une session
- `idx_reservations_status` : Filtrer par statut (pending/confirmed)
- `idx_group_members_userId` : Groupes d'un utilisateur
- `idx_group_members_groupId` : Membres d'un groupe
- `idx_groups_creatorId` : Groupes créés par un utilisateur

**Indexes composés** (3) :
- `idx_sessions_host_date` : `(hostId, date)` → "Mes prochaines sessions"
- `idx_reservations_session_status` : `(sessionId, status)` → Compter participants confirmés
- `idx_groupmember_user_group` : `(userId, groupId)` → Vérifier appartenance (redondant avec `@@unique` mais optimise les JOINs)

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
- ✅ 10 indexes générés
- ✅ Prisma Client généré dans `apps/backend/generated/prisma`

**Vérification Supabase** :
- Table Editor montre les 7 tables
- Advisors (recommendations) : aucun warning

---

**Résultat** : ✅ Schéma validé et déployé sur Supabase

**Prochaine étape** : → [Partie 3 : Sécurisation RLS](./rapport-jour2-03-securite.md)
