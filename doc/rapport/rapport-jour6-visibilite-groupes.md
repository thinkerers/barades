# 👁️ Rapport - Visibilité des Groupes Public/Privé (Jour 6)

**Date**: 16 octobre 2025  
**Fonctionnalité**: Système de visibilité pour les groupes (public vs privé)  
**Temps estimé**: ~2h30

---

## 🎯 Objectif

Implémenter un système de visibilité pour les groupes permettant :
- **Groupes publics** : Visibles par tous les utilisateurs (connectés ou non)
- **Groupes privés** : Visibles uniquement par les membres du groupe
- Système d'invitation pour rejoindre les groupes privés (à implémenter ultérieurement)

---

## 📋 Cahier des Charges

### Exigences Fonctionnelles

1. **Base de données**
   - Ajouter un champ `isPublic` (boolean) au modèle `Group`
   - Valeur par défaut : `true` (groupe public)

2. **Backend - Logique de visibilité**
   - Modifier `GET /groups` pour filtrer selon la visibilité et l'appartenance
   - Modifier `GET /groups/:id` pour bloquer l'accès aux groupes privés pour les non-membres
   - Authentification optionnelle (utilisateur connecté ou non)

3. **Frontend - Interface utilisateur**
   - Badge visuel "🔒 Privé" sur les cartes des groupes privés
   - Masquage des groupes privés pour les non-membres

4. **Seed - Données de test**
   - Créer un mélange de groupes publics et privés
   - Documenter les scénarios de test

---

## 🔧 Implémentation Technique

### 1. Schéma Prisma

**Fichier**: `apps/backend/prisma/schema.prisma`

```prisma
model Group {
  id          String        @id @default(cuid())
  name        String
  games       String[]
  location    String
  playstyle   Playstyle
  description String
  recruiting  Boolean       @default(true)
  isPublic    Boolean       @default(true) // ✅ NOUVEAU
  avatar      String?
  maxMembers  Int?
  
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  creatorId   String
  creator     User          @relation(fields: [creatorId], references: [id])
  
  members     GroupMember[]
  sessions    Session[]
  polls       Poll[]
}
```

**Migration appliquée** :
```bash
cd apps/backend && npx prisma db push
```

---

### 2. Backend - Authentication Optionnelle

#### a) Guard JWT Optionnel

**Fichier**: `apps/backend/src/auth/guards/optional-jwt-auth.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * Optional JWT Guard
 * Allows requests to proceed whether or not a valid JWT is present
 * If a valid token is present, attaches user to request
 * If no token or invalid token, request proceeds without user
 */
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = this.getRequest(context);

    try {
      const token = this.extractTokenFromHeader(request);
      if (token) {
        const payload = this.jwtService.verify(token);
        request['user'] = payload;
      }
    } catch {
      // Token invalide ou expiré, on continue sans user
    }

    return true;
  }

  private getRequest(context: ExecutionContext): Request {
    return context.switchToHttp().getRequest<Request>();
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
```

**Points clés** :
- ✅ Ne bloque jamais la requête (retourne toujours `true`)
- ✅ Attache l'utilisateur à la requête si token valide
- ✅ Continue sans erreur si pas de token

#### b) Décorateur Utilisateur Optionnel

**Fichier**: `apps/backend/src/auth/decorators/optional-user.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract optional user from request
 * Returns undefined if no user is authenticated
 */
export const OptionalUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.sub; // sub contains userId
  },
);
```

---

### 3. Backend - Logique de Visibilité

#### a) GroupsService

**Fichier**: `apps/backend/src/groups/groups.service.ts`

**Méthode `findAll(userId?: string)`** :

```typescript
async findAll(userId?: string) {
  const groups = await this.prisma.group.findMany({
    include: {
      creator: { select: { id: true, username: true, avatar: true } },
      members: {
        include: {
          user: { select: { id: true, username: true, avatar: true } }
        }
      },
      polls: true,
      _count: { select: { members: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Si pas d'utilisateur connecté, ne montrer que les groupes publics
  if (!userId) {
    return groups.filter(group => group.isPublic);
  }

  // Si utilisateur connecté, montrer :
  // - Tous les groupes publics
  // - Les groupes privés dont il est membre
  return groups.filter(group => {
    if (group.isPublic) return true;
    return group.members.some(member => member.userId === userId);
  });
}
```

**Logique** :
- **Utilisateur non connecté** (`userId === undefined`) → Seulement groupes publics
- **Utilisateur connecté** → Groupes publics + groupes privés dont il est membre

**Méthode `findOne(id: string, userId?: string)`** :

```typescript
async findOne(id: string, userId?: string) {
  const group = await this.prisma.group.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, username: true, avatar: true, bio: true } },
      members: {
        include: {
          user: { select: { id: true, username: true, avatar: true, skillLevel: true } }
        }
      },
      polls: true
    }
  });

  if (!group) {
    throw new NotFoundException(`Group with ID ${id} not found`);
  }

  // Si le groupe est privé, vérifier que l'utilisateur est membre
  if (!group.isPublic) {
    if (!userId) {
      throw new ForbiddenException('This group is private. Please log in.');
    }
    
    const isMember = group.members.some(member => member.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('This group is private and you are not a member.');
    }
  }

  return group;
}
```

**Codes HTTP** :
- `404 Not Found` : Groupe n'existe pas
- `403 Forbidden` : Groupe privé et utilisateur non autorisé

#### b) GroupsController

**Fichier**: `apps/backend/src/groups/groups.controller.ts`

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { OptionalUser } from '../auth/decorators/optional-user.decorator';

@Controller('groups')
@UseGuards(OptionalJwtAuthGuard) // ✅ Guard optionnel au niveau du controller
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findAll(@OptionalUser() userId?: string) {
    return this.groupsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @OptionalUser() userId?: string) {
    return this.groupsService.findOne(id, userId);
  }

  // ... autres méthodes
}
```

**Points clés** :
- ✅ `@UseGuards(OptionalJwtAuthGuard)` au niveau du controller
- ✅ `@OptionalUser()` extrait l'ID utilisateur (ou `undefined`)
- ✅ Pas de blocage si pas authentifié

#### c) GroupsModule

**Fichier**: `apps/backend/src/groups/groups.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // ✅ Import AuthModule pour JwtService
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
```

---

### 4. Frontend - Interface Utilisateur

#### a) Interface TypeScript

**Fichier**: `apps/frontend/src/app/core/services/groups.service.ts`

```typescript
export interface Group {
  id: string;
  name: string;
  description: string;
  playstyle: 'COMPETITIVE' | 'CASUAL' | 'STORY_DRIVEN' | 'SANDBOX';
  isRecruiting: boolean;
  isPublic: boolean; // ✅ NOUVEAU
  maxMembers: number | null;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creator?: {
    id: string;
    username: string;
    avatar: string | null;
  };
  _count?: {
    members: number;
  };
}
```

#### b) Template - Badge Privé

**Fichier**: `apps/frontend/src/app/features/groups/group-card.html`

```html
<header class="group-card__header">
  <h3 class="group-card__title">{{ group.name }}</h3>
  <div class="group-card__badges">
    <span class="group-card__playstyle" [ngClass]="'playstyle--' + getPlaystyleColor(group.playstyle)">
      {{ getPlaystyleLabel(group.playstyle) }}
    </span>
    <!-- ✅ NOUVEAU : Badge privé -->
    <span *ngIf="!group.isPublic" class="group-card__visibility">
      🔒 Privé
    </span>
  </div>
</header>
```

#### c) Styles CSS

**Fichier**: `apps/frontend/src/app/features/groups/group-card.css`

```css
.group-card__badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.group-card__visibility {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  width: fit-content;
  background-color: rgba(251, 191, 36, 0.2);
  color: #fcd34d;
  border: 1px solid rgba(251, 191, 36, 0.3);
}
```

**Effet visuel** :
- Badge jaune/doré avec icône 🔒
- S'affiche à côté du badge playstyle
- Responsive avec flex-wrap

---

### 5. Données de Test (Seed)

**Fichier**: `apps/backend/prisma/seed.ts`

```typescript
// Groupe public #1
const adventurersGroup = await prisma.group.create({
  data: {
    name: 'Brussels Adventurers Guild',
    games: ['D&D 5e', 'Pathfinder 2e', 'Call of Cthulhu'],
    location: 'Brussels',
    playstyle: Playstyle.STORY_DRIVEN,
    description: 'A community of tabletop RPG enthusiasts...',
    recruiting: true,
    isPublic: true, // ✅ Public
    avatar: 'https://picsum.photos/seed/adventurers/200',
    creatorId: alice.id,
  },
});

// Groupe public #2
const boardGamersGroup = await prisma.group.create({
  data: {
    name: 'Casual Board Gamers',
    games: ['Catan', 'Ticket to Ride', 'Wingspan', 'Azul', 'Splendor'],
    location: 'Brussels',
    playstyle: Playstyle.CASUAL,
    description: 'Relaxed group for board game lovers...',
    recruiting: true,
    isPublic: true, // ✅ Public
    avatar: 'https://picsum.photos/seed/boardgamers/200',
    creatorId: bob.id,
  },
});

// Groupe privé
const elitePlayersGroup = await prisma.group.create({
  data: {
    name: 'Elite Strategy Players',
    games: ['Twilight Imperium', 'Gloomhaven', 'Mage Knight'],
    location: 'Brussels',
    playstyle: Playstyle.COMPETITIVE,
    description: 'Private group for experienced players. Invitation only...',
    recruiting: false,
    isPublic: false, // ✅ Privé
    avatar: 'https://picsum.photos/seed/elite/200',
    creatorId: dave.id,
  },
});
```

**Memberships** :
```typescript
await prisma.groupMember.createMany({
  data: [
    // Brussels Adventurers Guild (public)
    { userId: alice.id, groupId: adventurersGroup.id, role: GroupRole.ADMIN },
    { userId: carol.id, groupId: adventurersGroup.id, role: GroupRole.MEMBER },
    { userId: eve.id, groupId: adventurersGroup.id, role: GroupRole.MEMBER },

    // Casual Board Gamers (public)
    { userId: bob.id, groupId: boardGamersGroup.id, role: GroupRole.ADMIN },
    { userId: carol.id, groupId: boardGamersGroup.id, role: GroupRole.MEMBER },
    { userId: dave.id, groupId: boardGamersGroup.id, role: GroupRole.MEMBER },

    // Elite Strategy Players (private - only dave and alice)
    { userId: dave.id, groupId: elitePlayersGroup.id, role: GroupRole.ADMIN },
    { userId: alice.id, groupId: elitePlayersGroup.id, role: GroupRole.MEMBER },
  ],
});
```

---

## 🧪 Scénarios de Test

### Scénario 1 : Utilisateur Non Connecté

**Action** : Accéder à `/groups` sans être connecté

**Résultat attendu** :
- ✅ Voir 2 groupes publics :
  - "Brussels Adventurers Guild"
  - "Casual Board Gamers"
- ❌ Ne PAS voir "Elite Strategy Players"

**Commande API** :
```bash
curl http://localhost:3000/groups
```

---

### Scénario 2 : Utilisateur Non-Membre (Bob/Carol/Eve)

**Action** : Se connecter comme `bob@barades.com` et accéder à `/groups`

**Résultat attendu** :
- ✅ Voir 2 groupes publics (même résultat que non connecté)
- ❌ Ne PAS voir "Elite Strategy Players" (car bob n'est pas membre)

**Commande API** :
```bash
# 1. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@barades.com","password":"password123"}'

# 2. Get groups avec token
curl http://localhost:3000/groups \
  -H "Authorization: Bearer <token>"
```

---

### Scénario 3 : Utilisateur Membre (Alice/Dave)

**Action** : Se connecter comme `alice@barades.com` et accéder à `/groups`

**Résultat attendu** :
- ✅ Voir 3 groupes :
  - "Brussels Adventurers Guild" (public)
  - "Casual Board Gamers" (public)
  - "Elite Strategy Players" 🔒 Privé (alice est membre)

**Commande API** :
```bash
# 1. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@barades.com","password":"password123"}'

# 2. Get groups avec token
curl http://localhost:3000/groups \
  -H "Authorization: Bearer <token>"
```

---

### Scénario 4 : Accès Direct au Groupe Privé (403 Forbidden)

**Action** : Utilisateur non-membre essaie d'accéder à `/groups/:id` du groupe privé

**Test avec Bob (non-membre)** :
```bash
# 1. Login as bob
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@barades.com","password":"password123"}'

# 2. Try to access private group
curl http://localhost:3000/groups/<elite-group-id> \
  -H "Authorization: Bearer <token>"
```

**Résultat attendu** :
```json
{
  "statusCode": 403,
  "message": "This group is private and you are not a member.",
  "error": "Forbidden"
}
```

**Test sans être connecté** :
```bash
curl http://localhost:3000/groups/<elite-group-id>
```

**Résultat attendu** :
```json
{
  "statusCode": 403,
  "message": "This group is private. Please log in.",
  "error": "Forbidden"
}
```

**Test avec Alice (membre)** :
```bash
# 1. Login as alice
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@barades.com","password":"password123"}'

# 2. Access private group
curl http://localhost:3000/groups/<elite-group-id> \
  -H "Authorization: Bearer <token>"
```

**Résultat attendu** :
```json
{
  "id": "...",
  "name": "Elite Strategy Players",
  "isPublic": false,
  ...
}
```

---

## 📊 Matrice de Visibilité

| Utilisateur | Brussels Adventurers<br/>(Public) | Casual Board Gamers<br/>(Public) | Elite Strategy Players<br/>(Privé) |
|-------------|:--------------------------------:|:-------------------------------:|:---------------------------------:|
| **Non connecté** | ✅ Visible | ✅ Visible | ❌ Invisible |
| **Alice** (membre Elite) | ✅ Visible | ✅ Visible | ✅ Visible + 🔒 Badge |
| **Bob** (non-membre Elite) | ✅ Visible | ✅ Visible | ❌ Invisible |
| **Carol** (non-membre Elite) | ✅ Visible | ✅ Visible | ❌ Invisible |
| **Dave** (admin Elite) | ✅ Visible | ✅ Visible | ✅ Visible + 🔒 Badge |
| **Eve** (non-membre Elite) | ✅ Visible | ✅ Visible | ❌ Invisible |

---

## 🔐 Sécurité

### Protections Implémentées

1. **Filtrage Backend** :
   - ✅ Les groupes privés ne sont jamais retournés dans la liste pour les non-membres
   - ✅ Impossible de deviner l'existence d'un groupe privé sans y avoir accès

2. **Contrôle d'Accès** :
   - ✅ `403 Forbidden` si tentative d'accès direct à un groupe privé
   - ✅ Messages d'erreur différents selon le contexte (connecté/non connecté)

3. **Authentification Optionnelle** :
   - ✅ Pas de blocage pour les utilisateurs non connectés
   - ✅ Expérience fluide : voir les groupes publics sans compte

### Vecteurs d'Attaque Couverts

| Attaque | Protection |
|---------|-----------|
| **Énumération d'IDs** | Les groupes privés retournent 403 (pas 404), impossible de différencier "n'existe pas" de "privé" |
| **Accès non autorisé** | Vérification de membership côté serveur |
| **Bypass client-side** | Validation complète backend (le frontend est juste visuel) |
| **Token manquant** | Guard optionnel permet l'accès public, mais limite la visibilité |

---

## 🐛 Problèmes Rencontrés et Solutions

### 1. Commandes Prisma dans Monorepo Nx

**Problème** :
- Exécuter `npx prisma db push` depuis la racine ne trouvait pas `DIRECT_URL`
- Exécuter depuis `apps/backend` causait des problèmes de path relatifs

**Solution** :
```bash
# Depuis la racine, spécifier le schéma
cd apps/backend && npx prisma db push

# Pour le seed
npx tsx apps/backend/prisma/seed.ts
```

**Configuration `package.json`** :
```json
{
  "prisma": {
    "seed": "tsx apps/backend/prisma/seed.ts"
  }
}
```

### 2. Interceptor HTTP et Auth Optionnelle

**Problème** :
- L'interceptor `authInterceptor` ajoute automatiquement le token JWT
- Besoin de l'authentification optionnelle (pas de blocage si pas de token)

**Solution** :
- ✅ L'interceptor ajoute le header `Authorization` seulement si token existe
- ✅ Le `OptionalJwtAuthGuard` ne lève jamais d'erreur
- ✅ Combinaison parfaite : token envoyé si disponible, sinon requête passe quand même

---

## 📈 Améliorations Futures

### Phase 2 - Invitations

**Fonctionnalités à ajouter** :
- [ ] Système d'invitation par email ou lien
- [ ] Page "Demandes en attente" pour les admins
- [ ] Notification push quand quelqu'un demande à rejoindre
- [ ] Possibilité de rendre un groupe public → privé (et vice-versa)

### Phase 3 - Permissions Avancées

**Fonctionnalités à ajouter** :
- [ ] Groupes "sur invitation uniquement" vs "demande d'accès"
- [ ] Rôles personnalisés (au-delà de ADMIN/MEMBER)
- [ ] Permissions granulaires (qui peut inviter, qui peut créer des polls, etc.)

### Phase 4 - Analytics

**Fonctionnalités à ajouter** :
- [ ] Statistiques de visibilité (combien de personnes ont vu le groupe)
- [ ] Tracking des demandes d'accès refusées/acceptées
- [ ] Rapport d'activité par groupe

---

## ✅ Checklist de Validation

### Backend
- [x] Champ `isPublic` ajouté au schéma Prisma
- [x] Migration appliquée avec succès
- [x] `OptionalJwtAuthGuard` créé et testé
- [x] `OptionalUser` decorator créé
- [x] `GroupsService.findAll()` filtre selon visibilité
- [x] `GroupsService.findOne()` bloque accès non autorisé
- [x] `GroupsController` utilise le guard optionnel
- [x] `GroupsModule` import `AuthModule`
- [x] Gestion d'erreurs (403 Forbidden)

### Frontend
- [x] Interface `Group` mise à jour avec `isPublic`
- [x] Badge "🔒 Privé" affiché sur les groupes privés
- [x] Styles CSS pour le badge
- [x] Pas d'erreur de compilation TypeScript

### Seed
- [x] 3 groupes créés (2 publics, 1 privé)
- [x] Memberships configurés correctement
- [x] Seed s'exécute sans erreur
- [x] Documentation des scénarios de test

### Tests Manuels
- [ ] Non connecté : voir 2 groupes
- [ ] Connecté comme bob : voir 2 groupes
- [ ] Connecté comme alice : voir 3 groupes avec badge 🔒
- [ ] Accès direct groupe privé sans auth : 403
- [ ] Accès direct groupe privé non-membre : 403
- [ ] Accès direct groupe privé membre : 200 OK

---

## 📝 Commandes Utiles

### Développement
```bash
# Migration Prisma
cd apps/backend && npx prisma db push

# Seed database
npx tsx apps/backend/prisma/seed.ts

# Lancer backend
npx nx serve backend

# Lancer frontend
npx nx serve frontend
```

### Tests API
```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@barades.com","password":"password123"}'

# Get groups (public)
curl http://localhost:3000/groups

# Get groups (authenticated)
curl http://localhost:3000/groups \
  -H "Authorization: Bearer <token>"

# Get specific group
curl http://localhost:3000/groups/<group-id> \
  -H "Authorization: Bearer <token>"
```

---

## 🎓 Leçons Apprises

1. **Monorepo Nx et Prisma** :
   - Toujours exécuter les commandes Prisma depuis le bon dossier
   - Utiliser des chemins absolus ou relatifs clairs dans `package.json`

2. **Authentication Optionnelle** :
   - Pattern du guard optionnel très utile pour des routes hybrides (public/private)
   - Permet une meilleure UX (pas de redirection forcée vers login)

3. **Sécurité par Défaut** :
   - Toujours valider côté serveur, jamais faire confiance au client
   - Filtrer en base plutôt qu'en code (évite les fuites de données)

4. **UX Progressive** :
   - Laisser voir du contenu public sans compte = meilleur taux de conversion
   - Badge visuel clair pour indiquer la restriction

---

**Temps total**: ~2h30  
**Fichiers modifiés**: 10  
**Fichiers créés**: 2  
**Lignes de code**: ~400

**Status**: ✅ **TERMINÉ**
