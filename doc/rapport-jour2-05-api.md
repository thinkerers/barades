# 📊 Rapport Jour 2 - Partie 5 : Développement de l'API REST NestJS

## 5. Mise en place de l'API backend

### 5.1 Architecture NestJS choisie

**Framework** : NestJS 11.0 (inspiré d'Angular, TypeScript natif)

**Principes architecturaux** :
- **Modularité** : Chaque entité métier = 1 module
- **Injection de dépendances** : PrismaService partagé
- **Séparation des responsabilités** : Controllers (HTTP) ↔ Services (logique métier)
- **RESTful API** : Endpoints standards (GET, POST, PUT, DELETE)

```
apps/backend/src/
├── app/
│   ├── app.module.ts        ← Module racine
│   ├── app.controller.ts
│   └── app.service.ts
├── prisma/
│   ├── prisma.module.ts     ← Module global Prisma
│   └── prisma.service.ts
├── sessions/
│   ├── sessions.module.ts
│   ├── sessions.controller.ts
│   ├── sessions.service.ts
│   ├── dto/
│   │   ├── create-session.dto.ts
│   │   └── update-session.dto.ts
│   └── entities/
│       └── session.entity.ts
├── locations/              ← Structure identique
└── groups/                 ← Structure identique
```

### 5.2 Module Prisma (service partagé)

#### 5.2.1 PrismaService

**Fichier** : `apps/backend/src/prisma/prisma.service.ts`

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

**Explications** :
- `extends PrismaClient` : Hérite toutes les méthodes Prisma (findMany, create, etc.)
- `OnModuleInit` : Se connecte à la DB au démarrage de l'app
- `OnModuleDestroy` : Déconnecte proprement à l'arrêt (évite connexions pendantes)

**Avantages** :
- Lifecycle management automatique
- Une seule instance Prisma (singleton pattern)
- Injection disponible dans tous les services

#### 5.2.2 PrismaModule

**Fichier** : `apps/backend/src/prisma/prisma.module.ts`

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()  // ← Rend le module disponible partout
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**`@Global()` decorator** :
- Évite d'importer PrismaModule dans chaque module métier
- PrismaService injectable partout automatiquement
- Pattern recommandé pour services transverses (DB, logging, etc.)

### 5.3 Génération des modules REST

#### 5.3.1 Commande NestJS CLI

```bash
cd apps/backend/src
npx @nestjs/cli generate resource sessions --no-spec
npx @nestjs/cli generate resource locations --no-spec
npx @nestjs/cli generate resource groups --no-spec
```

**Options** :
- `resource` : Génère module + controller + service + DTOs + entity
- `--no-spec` : Pas de fichiers de tests (pour l'instant)

**Prompt interactif** :
```
? What transport layer do you use? › REST API
? Would you like to generate CRUD entry points? › Yes
```

**Fichiers générés par module** (exemple sessions) :
```
sessions/
├── sessions.module.ts           ← Module definition
├── sessions.controller.ts        ← HTTP endpoints
├── sessions.service.ts           ← Business logic
├── dto/
│   ├── create-session.dto.ts    ← Data Transfer Object (POST)
│   └── update-session.dto.ts    ← Data Transfer Object (PUT/PATCH)
└── entities/
    └── session.entity.ts         ← TypeScript type (response)
```

### 5.4 SessionsService - Implémentation détaillée

#### 5.4.1 Injection de PrismaService

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}  // ← Dependency injection
  
  // ...
}
```

NestJS injecte automatiquement `PrismaService` (disponible car `@Global()`).

#### 5.4.2 findAll() - Liste des sessions

```typescript
findAll() {
  return this.prisma.session.findMany({
    include: {
      host: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      location: true,
      reservations: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      },
    },
    orderBy: {
      date: 'asc',  // ← Sessions triées par date croissante
    },
  });
}
```

**Explications** :
- `include` : Charge les relations (eager loading)
- `host.select` : N'inclut que id/username/avatar (pas le password !)
- `reservations.include.user` : Relation imbriquée (reservations → users)
- `orderBy` : Tri SQL performant (pas en JS)

**Requête SQL générée** (approximative) :
```sql
SELECT 
  s.*,
  json_build_object('id', u.id, 'username', u.username, 'avatar', u.avatar) as host,
  l.* as location,
  (SELECT json_agg(...) FROM "Reservation" r WHERE r."sessionId" = s.id) as reservations
FROM "Session" s
LEFT JOIN "User" u ON s."hostId" = u.id
LEFT JOIN "Location" l ON s."locationId" = l.id
ORDER BY s.date ASC;
```

**Performance** : 1 seule requête SQL (pas de N+1 queries problem).

#### 5.4.3 findOne() - Détail d'une session

```typescript
findOne(id: string) {
  return this.prisma.session.findUnique({
    where: { id },
    include: {
      host: {
        select: {
          id: true,
          username: true,
          avatar: true,
          bio: true,  // ← Plus de détails que dans findAll()
        },
      },
      location: true,
      reservations: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              skillLevel: true,  // ← Utile pour afficher niveau joueurs
            },
          },
        },
      },
    },
  });
}
```

**Différence avec findAll()** :
- Plus de champs inclus (bio, skillLevel)
- Justification : Page détail vs liste = besoins différents

#### 5.4.4 create(), update(), remove() - Temporairement désactivés

```typescript
create(createSessionDto: CreateSessionDto) {
  throw new Error('Method not implemented. DTOs TODO');
}

update(id: string, updateSessionDto: UpdateSessionDto) {
  throw new Error('Method not implemented. DTOs TODO');
}

remove(id: string) {
  throw new Error('Method not implemented yet');
}
```

**Raison** : DTOs vides générés par CLI. Implémentation complète prévue Jour 3.

**Note importante** : **Tous les endpoints POST/PATCH/DELETE sont non fonctionnels** pour le moment. Seuls GET /sessions et GET /sessions/:id sont opérationnels.

### 5.5 SessionsController - Endpoints HTTP

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Controller('sessions')  // ← Route de base : /api/sessions
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.create(createSessionDto);
  }

  @Get()
  findAll() {
    return this.sessionsService.findAll();
  }

  @Get(':id')  // ← Param dynamique : /api/sessions/:id
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);  // ← Corrigé : string (UUID) au lieu de +id (number)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
    return this.sessionsService.update(id, updateSessionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sessionsService.remove(id);
  }
}
```

**Correction effectuée** : CLI génère `+id` (conversion string → number), mais nos IDs sont des UUIDs (string).

**Routes exposées** :
```
GET    /api/sessions      → findAll()      ✅ Opérationnel
GET    /api/sessions/:id  → findOne(id)    ✅ Opérationnel
POST   /api/sessions      → create(dto)    ⏸️  Non implémenté
PATCH  /api/sessions/:id  → update(id, dto) ⏸️  Non implémenté
DELETE /api/sessions/:id  → remove(id)     ⏸️  Non implémenté
```

### 5.6 LocationsService - Particularités

```typescript
findAll() {
  return this.prisma.location.findMany({
    include: {
      sessions: {
        where: {
          date: {
            gte: new Date(),  // ← Seulement sessions futures
          },
        },
        orderBy: {
          date: 'asc',
        },
      },
    },
    orderBy: {
      name: 'asc',  // ← Locations triées alphabétiquement
    },
  });
}
```

**Logique métier** : Afficher uniquement les sessions à venir pour chaque lieu (pas les sessions passées).

**Use case frontend** : Carte interactive Leaflet montrant lieux avec nombre de sessions prochaines.

### 5.7 GroupsService - Comptage des membres

```typescript
findAll() {
  return this.prisma.group.findMany({
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      },
      polls: true,
      _count: {
        select: {
          members: true,  // ← Compte le nombre de membres (SQL COUNT)
        },
      },
    },
    orderBy: {
      createdAt: 'desc',  // ← Groupes les plus récents en premier
    },
  });
}
```

**`_count`** : Feature Prisma pour compter les relations sans charger toutes les données.

**Résultat JSON** :
```json
{
  "id": "...",
  "name": "Brussels Adventurers Guild",
  "members": [
    { "user": { "id": "...", "username": "alice_dm" } },
    { "user": { "id": "...", "username": "carol_newbie" } }
  ],
  "_count": {
    "members": 2
  }
}
```

**Use case** : Afficher "2 membres" sans itérer sur l'array en frontend.

### 5.8 Configuration AppModule

**Fichier** : `apps/backend/src/app/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SessionsModule } from '../sessions/sessions.module';
import { LocationsModule } from '../locations/locations.module';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [
    PrismaModule,      // ← @Global(), disponible partout
    SessionsModule,
    LocationsModule,
    GroupsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Import automatique** : NestJS CLI aurait dû le faire, mais dans un monorepo Nx, c'est manuel.

### 5.9 Configuration CORS

**Fichier** : `apps/backend/src/main.ts`

```typescript
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:4201'],  // ← Angular dev servers
    credentials: true,  // ← Permet cookies (futurs JWT)
  });
  
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);  // ← Tous les endpoints préfixés par /api
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
```

**CORS explications** :
- `origin` : Liste blanche des domaines autorisés
- `credentials: true` : Nécessaire pour JWT/cookies cross-origin
- Sans CORS : Le browser bloquerait les requêtes Angular → NestJS

**Sécurité** : En production, remplacer par le vrai domaine (pas localhost).

### 5.10 Tests des endpoints

#### 5.10.1 Démarrage du serveur

```bash
nx run backend:serve
```

**Sortie** :
```
> webpack-cli build --node-env=production

chunk (runtime: main) main.js (main) 314 KiB [entry] [rendered]

webpack compiled successfully (5eef6a7c8b2e9c5a)

🚀 Application is running on: http://localhost:3000/api
```

#### 5.10.2 Test GET /api/sessions

**Commande** :
```bash
curl http://localhost:3000/api/sessions
```

**Réponse** (extrait) :
```json
[
  {
    "id": "94b7c63d-af19-44d8-a001-ce318255b7ab",
    "game": "D&D 5e",
    "title": "The Lost Mines of Phandelver - Session 3",
    "description": "Continuing our epic adventure! We left off at the entrance of the goblin cave.",
    "date": "2025-10-20T19:00:00.000Z",
    "online": false,
    "level": "INTERMEDIATE",
    "playersMax": 5,
    "playersCurrent": 3,
    "tagColor": "PURPLE",
    "hostId": "bf8c5f30-e5b4-409a-b6b5-56b4a3570c30",
    "locationId": "a815f7b8-76b8-4291-8097-c350f96957c1",
    "host": {
      "id": "bf8c5f30-e5b4-409a-b6b5-56b4a3570c30",
      "username": "alice_dm",
      "avatar": "https://i.pravatar.cc/150?img=1"
    },
    "location": {
      "id": "a815f7b8-76b8-4291-8097-c350f96957c1",
      "name": "Brussels Game Store",
      "address": "Rue de la Montagne 52",
      "city": "Brussels",
      "type": "GAME_STORE",
      "rating": 4.5,
      "amenities": ["WiFi", "Gaming Tables", "Food", "Drinks", "Parking"],
      "capacity": 30,
      "openingHours": {
        "monday": "10:00-22:00",
        "friday": "10:00-00:00"
      },
      "lat": 50.8476,
      "lon": 4.3572
    },
    "reservations": [
      {
        "id": "a5bb8d52-9aad-4379-90bb-9e2d32310a1c",
        "status": "CONFIRMED",
        "message": "This is my first D&D session, looking forward to it!",
        "sessionId": "94b7c63d-af19-44d8-a001-ce318255b7ab",
        "userId": "dca7d944-f9f7-4317-b049-3d1847886b24",
        "user": {
          "id": "dca7d944-f9f7-4317-b049-3d1847886b24",
          "username": "carol_newbie",
          "avatar": "https://i.pravatar.cc/150?img=3"
        }
      }
    ]
  }
]
```

**Validation** :
- ✅ Retourne les 5 sessions
- ✅ Relations chargées (host, location, reservations)
- ✅ Pas de password exposé (select limité)
- ✅ Dates ISO 8601
- ✅ Enums en majuscules (INTERMEDIATE, PURPLE)

**Note** : Seuls les endpoints GET ont été testés. POST/PATCH/DELETE renvoient des erreurs `Method not implemented yet`.

#### 5.10.3 Test GET /api/locations

**Commande** :
```bash
curl http://localhost:3000/api/locations
```

**Validation** :
- ✅ 3 locations retournées
- ✅ Chaque location inclut ses sessions futures (`date >= NOW()`)
- ✅ Coordonnées GPS présentes (lat/lon)

#### 5.10.4 Test GET /api/groups

**Commande** :
```bash
curl http://localhost:3000/api/groups
```

**Validation** :
- ✅ 2 groups retournés
- ✅ Chaque group inclut creator, members, polls
- ✅ `_count.members` présent pour affichage rapide

**État des endpoints mutations** :
- ❌ POST /api/sessions → `Error: Method not implemented yet`
- ❌ POST /api/locations → `Error: Method not implemented yet`
- ❌ POST /api/groups → `Error: Method not implemented yet`
- ❌ PATCH/DELETE → Tous non implémentés

**Raison** : DTOs vides, implémentation prévue Jour 3 avec validation Zod.

### 5.11 Analyse des performances

**Temps de réponse mesuré** :
```bash
curl -w "\nTime total: %{time_total}s\n" http://localhost:3000/api/sessions
```

**Résultat** : ~50-80ms (local, sans cache)

**Optimisations Prisma utilisées** :
1. **Eager loading** : Toutes les relations en 1 requête SQL
2. **Indexes** : Queries utilisent les indexes créés (hostId, date, etc.)
3. **Select limité** : Pas de chargement de champs inutiles (passwords)

**Monitoring suggestion** : En production, ajouter Prisma query logs :
```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

---

**Résultat** : ✅ API REST fonctionnelle avec 3 ressources, relations complètes, tests validés

**Prochaine étape** : → [Partie 6 : Bilan et perspectives](./rapport-jour2-06-bilan.md)
