# 📊 Rapport Jour 2 - Partie 4 : Génération des données de test

## 4. Script seed et documentation visuelle

### 4.1 Objectif du seed

**Besoin** : Disposer de données réalistes pour :
- Tester l'API backend
- Développer le frontend avec des données cohérentes
- Démonstration TFE avec scénarios réalistes
- Valider les relations Prisma

**Contrainte** : Données inspirées du contexte bruxellois (projet "Bar à Dés")

### 4.2 Configuration du seed

#### 4.2.1 Installation de tsx

**Package** : `tsx` - Exécuteur TypeScript moderne (alternative à ts-node)

```bash
npm install -D tsx
```

**Avantages de tsx** :
- Plus rapide que ts-node
- Support ESM natif
- Pas de configuration tsconfig nécessaire

#### 4.2.2 Configuration package.json

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

**Commande d'exécution** :
```bash
npx prisma db seed
```

### 4.3 Structure du script seed

**Fichier** : `apps/backend/prisma/seed.ts` (437 lignes)

```typescript
import { PrismaClient, SkillLevel, SessionLevel, /* ... */ } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // 1. Cleanup existing data (dev mode)
  await prisma.reservation.deleteMany();
  await prisma.poll.deleteMany();
  // ... (ordre respectant les foreign keys)

  // 2. Create Users (5)
  // 3. Create Locations (3)
  // 4. Create Sessions (5)
  // 5. Create Groups (2)
  // 6. Create GroupMembers (6)
  // 7. Create Reservations (10)
  // 8. Create Polls (1)

  console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 4.4 Données créées (détail)

#### 4.4.1 Users (5 utilisateurs)

| Username | Email | Role | SkillLevel | Bio |
|----------|-------|------|------------|-----|
| alice_dm | alice@barades.com | MJ | EXPERT | Experienced D&D dungeon master with 10+ years |
| bob_boardgamer | bob@barades.com | Organisateur | INTERMEDIATE | Board game enthusiast, weekly game nights |
| carol_newbie | carol@barades.com | Joueur | BEGINNER | New to tabletop gaming but eager to learn |
| dave_poker | dave@barades.com | Joueur | INTERMEDIATE | Poker player looking for regular cash games |
| eve_admin | eve@barades.com | Admin | EXPERT | Platform administrator, organizing events |

**Sécurité passwords** :
```typescript
const hashedPassword = await bcrypt.hash('password123', 10);
// Tous les users ont le même password pour faciliter les tests
```

**Avatars** : Pravatar.cc (service d'avatars placeholder)

#### 4.4.2 Locations (3 lieux)

**1. Brussels Game Store**
```typescript
{
  name: 'Brussels Game Store',
  address: 'Rue de la Montagne 52',
  city: 'Brussels',
  type: LocationType.GAME_STORE,
  rating: 4.5,
  amenities: ['WiFi', 'Gaming Tables', 'Food', 'Drinks', 'Parking'],
  capacity: 30,
  openingHours: {
    monday: '10:00-22:00',
    // ... (7 jours)
    friday: '10:00-00:00',
    saturday: '10:00-00:00',
  },
  lat: 50.8476,
  lon: 4.3572,
  icon: 'store',
}
```

**2. Café Joystick**
```typescript
{
  name: 'Café Joystick',
  address: 'Avenue Louise 331',
  city: 'Brussels',
  type: LocationType.CAFE,
  rating: 4.2,
  amenities: ['WiFi', 'Food', 'Drinks', 'Board Games Library'],
  capacity: 20,
  openingHours: {
    monday: 'Closed',  // ← Fermé le lundi
    // ...
  },
  lat: 50.8317,
  lon: 4.3657,
}
```

**3. Online (Discord/Roll20)**
```typescript
{
  name: 'Online (Discord/Roll20)',
  city: 'Online',
  type: LocationType.PRIVATE,
  rating: 5.0,
  amenities: ['Virtual Tabletop', 'Voice Chat', 'Screen Sharing'],
  lat: 0,
  lon: 0,  // ← Pas de coordonnées géographiques
  website: 'https://discord.gg/barades',
}
```

**Coordonnées GPS** : Adresses réelles Brussels pour démo réaliste sur carte Leaflet

#### 4.4.3 Sessions (5 parties)

| Game | Title | Host | Location | Date | Level | Players |
|------|-------|------|----------|------|-------|---------|
| D&D 5e | The Lost Mines of Phandelver - Session 3 | alice | Brussels Game Store | 20/10 19:00 | INTERMEDIATE | 3/5 |
| Catan | Catan Tournament - Qualifier Round | bob | Café Joystick | 18/10 18:00 | ADVANCED | 2/4 |
| Texas Hold'em Poker | Friday Night Poker - €20 Buy-in | dave | Café Joystick | 17/10 20:00 | OPEN | 5/8 |
| Pathfinder 2e | Age of Ashes Campaign - Weekly | alice | Online (Discord) | 21/10 19:30 | INTERMEDIATE | 3/4 |
| Wingspan | Wingspan - Beginner Friendly! | bob | Brussels Game Store | 19/10 15:00 | BEGINNER | 1/4 |

**Particularité Pathfinder** :
```typescript
{
  // ...
  recurrenceRule: 'FREQ=WEEKLY;BYDAY=TU',  // ← Tous les mardis
  recurrenceEndDate: new Date('2025-12-31T23:59:59Z'),
  online: true,
}
```

Format iCal standard pour récurrence.

#### 4.4.4 Groups (2 communautés)

**1. Brussels Adventurers Guild**
```typescript
{
  name: 'Brussels Adventurers Guild',
  games: ['D&D 5e', 'Pathfinder 2e', 'Call of Cthulhu'],
  location: 'Brussels',
  playstyle: Playstyle.STORY_DRIVEN,
  description: 'A community of tabletop RPG enthusiasts...',
  recruiting: true,
  creatorId: alice.id,  // ← Alice est la créatrice
}
```

**Membres** : alice (ADMIN), carol (MEMBER), eve (MEMBER)

**2. Casual Board Gamers**
```typescript
{
  name: 'Casual Board Gamers',
  games: ['Catan', 'Ticket to Ride', 'Wingspan', 'Azul', 'Splendor'],
  playstyle: Playstyle.CASUAL,
  creatorId: bob.id,
}
```

**Membres** : bob (ADMIN), carol (MEMBER), dave (MEMBER)

**Note** : Carol est membre des 2 groupes (use case réaliste)

#### 4.4.5 Reservations (10 inscriptions)

Exemples de réservations avec différents statuts :

```typescript
// D&D Session - 3 réservations
{
  sessionId: dndSession.id,
  userId: carol.id,
  status: ReservationStatus.CONFIRMED,
  message: 'This is my first D&D session, looking forward to it!',
}

{
  sessionId: dndSession.id,
  userId: bob.id,
  status: ReservationStatus.PENDING,  // ← En attente validation MJ
  message: 'Can I join if I\'m 15 minutes late?',
}

// Poker Night
{
  sessionId: pokerSession.id,
  userId: carol.id,
  status: ReservationStatus.PENDING,
  message: 'First time playing poker for money, is €20 the minimum?',
}
```

**Mix réaliste** :
- 7 CONFIRMED
- 3 PENDING (demandant validation)
- Messages optionnels pour questions

#### 4.4.6 Poll (1 sondage de dates)

```typescript
{
  groupId: adventurersGroup.id,
  title: 'Best date for next one-shot campaign?',
  dates: ['2025-10-25', '2025-10-26', '2025-11-01'],
  votes: {
    '2025-10-25': [alice.id, carol.id],      // 2 votes
    '2025-10-26': [alice.id, eve.id],        // 2 votes
    '2025-11-01': [carol.id],                // 1 vote
  },
}
```

**Structure votes JSON** :
- Clé = date proposée (string ISO)
- Valeur = array d'UUIDs users ayant voté

**Cas d'usage** : Alice a voté pour 2 dates (shift-select multi-dates dans l'UI prévue)

### 4.5 Logs d'exécution

```bash
🌱 Starting database seed...

🧹 Cleaning existing data...
✅ Existing data cleaned

👥 Creating users...
✅ Created 5 users

📍 Creating locations...
✅ Created 3 locations

🎲 Creating sessions...
✅ Created 5 sessions

👨‍👩‍👧‍👦 Creating groups...
✅ Created 2 groups

🤝 Creating group memberships...
✅ Created 6 group memberships

📝 Creating reservations...
✅ Created 10 reservations

🗳️  Creating polls...
✅ Created 1 poll

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ DATABASE SEEDED SUCCESSFULLY!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Summary:
   • 5 Users (alice, bob, carol, dave, eve)
   • 3 Locations (Brussels Game Store, Café Joystick, Online)
   • 5 Sessions (D&D, Catan, Poker, Pathfinder, Wingspan)
   • 2 Groups (Adventurers Guild, Casual Board Gamers)
   • 6 Group Memberships
   • 10 Reservations (mix of pending/confirmed)
   • 1 Poll

🔑 Test credentials:
   Email: alice@barades.com | Password: password123
   Email: bob@barades.com   | Password: password123
   Email: carol@barades.com | Password: password123
   Email: dave@barades.com  | Password: password123
   Email: eve@barades.com   | Password: password123
```

### 4.6 Vérification avec Prisma Studio

**Commande** :
```bash
npx prisma studio
```

**URL** : http://localhost:5555

**Interface** : GUI web pour explorer les données seedées, tester les relations, éditer manuellement.

### 4.7 Génération du diagramme ERD

#### 4.7.1 Configuration

**Package** : `prisma-erd-generator` + `@mermaid-js/mermaid-cli`

```bash
npm install -D prisma-erd-generator @mermaid-js/mermaid-cli
```

**schema.prisma** :
```prisma
generator erd {
  provider = "prisma-erd-generator"
  output   = "../../../doc/database-erd.svg"
  theme    = "forest"  // ← Thème vert/sombre
}
```

#### 4.7.2 Génération

**Commande** :
```bash
npx prisma generate
```

**Sortie** :
```
✔ Generated Prisma Client (v6.17.1) to ./generated/prisma in 128ms
✔ Generated Entity-relationship-diagram (1.0.0) to ./../../doc/database-erd.svg in 2.75s
```

**Fichier créé** : `doc/database-erd.svg` (278 KB)

#### 4.7.3 Contenu du diagramme

Le SVG généré contient :
- Les 7 tables avec tous les champs
- Types de données (String, DateTime, Int, Boolean, Json, etc.)
- Relations (one-to-many, many-to-one) avec flèches
- Enums avec valeurs possibles
- Légende des cardinalités

**Utilisation** :
- Inclusion dans le rapport TFE (section "Modèle de données")
- Documentation technique pour développeurs
- Présentation visuelle lors de la soutenance

### 4.8 Statistiques finales des données

```
Total enregistrements créés : 37

Répartition :
- Users           : 5
- Locations       : 3
- Sessions        : 5
- Groups          : 2
- GroupMembers    : 6
- Reservations    : 10
- Polls           : 1
- (+ Poll votes)  : 5 votes

Relations validées :
- User → Session (host)      : 5 relations
- Session → Location          : 5 relations
- Session → Reservation       : 10 relations
- User → Reservation          : 10 relations
- Group → GroupMember         : 6 relations
- User → GroupMember          : 6 relations (Carol dans 2 groupes)
- Group → Poll                : 1 relation
```

---

**Résultat** : ✅ Base de données peuplée avec données réalistes, ERD généré

**Prochaine étape** : → [Partie 5 : API REST NestJS](./rapport-jour2-05-api.md)
