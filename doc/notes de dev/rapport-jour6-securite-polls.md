# 🔒 Rapport - Sécurisation Polls (Jour 6)

**Date**: 16 octobre 2025  
**Durée**: 30 min  
**Status**: ✅ Terminé  
**Severity**: 🔴 **CRITIQUE**

---

## 🚨 Vulnérabilité Identifiée

### Description
Les endpoints de création et vote de sondages (`/polls`) n'avaient **AUCUNE protection d'authentification ou d'autorisation**.

### Impact Critique
- ❌ **N'importe qui** pouvait créer un sondage pour n'importe quel groupe
- ❌ **N'importe qui** pouvait voter sur n'importe quel sondage
- ❌ Utilisateur **non authentifié** pouvait effectuer ces actions
- ❌ Utilisateur **non-membre d'un groupe** pouvait créer/voter
- ❌ Un utilisateur pouvait voter **au nom d'un autre utilisateur**

### Exemple d'Exploitation
```bash
# Sans authentification, n'importe qui pouvait :
curl -X POST http://localhost:3000/polls \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sondage malveillant",
    "dates": ["2025-12-25T18:00"],
    "groupId": "group-1"
  }'

# Voter pour quelqu'un d'autre :
curl -X PATCH http://localhost:3000/polls/poll-123/vote \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-victim",
    "dateChoice": "2025-12-25T18:00"
  }'
```

---

## ✅ Corrections Implémentées

### 1. Backend - Authentication Guards

#### polls.controller.ts
```typescript
// AVANT (❌ Non sécurisé)
@Post()
create(@Body() createPollDto: CreatePollDto) {
  return this.pollsService.create(createPollDto);
}

@Patch(':id/vote')
vote(@Param('id') id: string, @Body() votePollDto: VotePollDto) {
  return this.pollsService.vote(id, votePollDto);
}

// APRÈS (✅ Sécurisé)
@Post()
@UseGuards(JwtAuthGuard)
create(@Request() req, @Body() createPollDto: CreatePollDto) {
  return this.pollsService.create(createPollDto, req.user.id);
}

@Patch(':id/vote')
@UseGuards(JwtAuthGuard)
vote(@Request() req, @Param('id') id: string, @Body() votePollDto: VotePollDto) {
  return this.pollsService.vote(id, votePollDto, req.user.id);
}

@Delete(':id/vote/:userId')
@UseGuards(JwtAuthGuard)
removeVote(@Request() req, @Param('id') id: string, @Param('userId') userId: string) {
  return this.pollsService.removeVote(id, userId, req.user.id);
}
```

### 2. Backend - Group Membership Verification

#### polls.service.ts
```typescript
// Nouvelle méthode de vérification
private async checkGroupMembership(userId: string, groupId: string) {
  const membership = await this.prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
  });

  if (!membership) {
    throw new ForbiddenException(
      'Vous devez être membre du groupe pour effectuer cette action'
    );
  }
}

// Utilisation dans create()
async create(createPollDto: CreatePollDto, userId: string) {
  // Vérifier membership AVANT création
  await this.checkGroupMembership(userId, createPollDto.groupId);
  
  return this.prisma.poll.create({...});
}

// Utilisation dans vote()
async vote(id: string, votePollDto: VotePollDto, authenticatedUserId: string) {
  const poll = await this.prisma.poll.findUnique({
    where: { id },
    include: { group: true },
  });

  // Vérifier membership
  await this.checkGroupMembership(authenticatedUserId, poll.groupId);

  // S'assurer que l'utilisateur vote pour lui-même
  if (votePollDto.userId !== authenticatedUserId) {
    throw new ForbiddenException('Vous ne pouvez voter que pour vous-même');
  }

  // Update votes...
}
```

### 3. Backend - Module Dependencies

#### polls.module.ts
```typescript
// Ajout AuthModule pour résoudre JwtAuthGuard
@Module({
  imports: [PrismaModule, AuthModule], // AuthModule ajouté
  controllers: [PollsController],
  providers: [PollsService],
  exports: [PollsService],
})
export class PollsModule {}
```

### 4. Frontend - Error Handling

#### poll-widget.ts
```typescript
// Gestion erreurs 401/403
this.pollsService.createPoll({...}).subscribe({
  error: (err) => {
    if (err.status === 403) {
      this.error = 'Vous devez être membre du groupe pour créer un sondage';
    } else if (err.status === 401) {
      this.error = 'Vous devez être connecté pour créer un sondage';
    } else {
      this.error = 'Erreur lors de la création du sondage';
    }
  }
});

// Idem pour vote() et removeVote()
```

### 5. Frontend - UI Restrictions

#### group-detail.ts
```typescript
// Vérification membership
this.groupsService.getGroup(id).subscribe({
  next: (data) => {
    this.group = data as GroupDetail;
    this.isMember = this.group.members?.some(m => m.id === this.currentUserId) || false;
  }
});
```

#### group-detail.html
```html
<!-- Passage flag isMember au widget -->
<app-poll-widget
  [poll]="activePoll"
  [groupId]="group.id"
  [currentUserId]="currentUserId"
  [isMember]="isMember"
  (pollCreated)="onPollCreated($event)"
  (voted)="onVoted()"
></app-poll-widget>
```

#### poll-widget.html
```html
<!-- Bouton création visible seulement pour membres -->
<button 
  *ngIf="isMember"
  (click)="toggleCreateForm()"
>
  Créer un sondage
</button>

<p *ngIf="!isMember">
  Vous devez être membre du groupe pour créer un sondage
</p>

<!-- Boutons vote désactivés pour non-membres -->
<button 
  (click)="vote(date)" 
  [disabled]="getUserVote() === date || !isMember"
  [title]="!isMember ? 'Vous devez être membre du groupe pour voter' : ''"
>

<!-- Message info pour non-membres -->
<div *ngIf="!isMember && poll" class="poll-widget__message--info">
  ℹ️ Vous devez être membre du groupe pour voter sur ce sondage
</div>
```

#### poll-widget.css
```css
/* Nouveau style pour message info */
.poll-widget__message--info {
  background-color: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #93c5fd;
  padding: 1rem;
  border-radius: 0.5rem;
}
```

---

## 🔐 Matrice de Sécurité

| Action | Avant | Après |
|--------|-------|-------|
| Créer poll (non auth) | ✅ Possible | ❌ 401 Unauthorized |
| Créer poll (auth, non-membre) | ✅ Possible | ❌ 403 Forbidden |
| Créer poll (membre) | ✅ Possible | ✅ Autorisé |
| Voter (non auth) | ✅ Possible | ❌ 401 Unauthorized |
| Voter (auth, non-membre) | ✅ Possible | ❌ 403 Forbidden |
| Voter pour quelqu'un d'autre | ✅ Possible | ❌ 403 Forbidden |
| Voter (membre) | ✅ Possible | ✅ Autorisé |
| Supprimer vote d'autrui | ✅ Possible | ❌ 403 Forbidden |
| Supprimer son propre vote | ✅ Possible | ✅ Autorisé |

---

## 🧪 Tests de Validation

### Test 1: Non-authentifié
```bash
# Sans token JWT
curl -X POST http://localhost:3000/polls \
  -H "Content-Type: application/json" \
  -d '{...}'

# Résultat attendu: 401 Unauthorized
```

### Test 2: Authentifié mais non-membre
```bash
# Avec token JWT user-2
# Créer poll pour group-1 (dont user-2 n'est PAS membre)
curl -X POST http://localhost:3000/polls \
  -H "Authorization: Bearer <jwt-user-2>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "dates": ["2025-12-25T18:00"],
    "groupId": "group-1"
  }'

# Résultat attendu: 403 Forbidden
# Message: "Vous devez être membre du groupe..."
```

### Test 3: Membre légitime
```bash
# Avec token JWT alice (membre de group-1)
curl -X POST http://localhost:3000/polls \
  -H "Authorization: Bearer <jwt-alice>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "dates": ["2025-12-25T18:00"],
    "groupId": "group-1"
  }'

# Résultat attendu: 201 Created
```

### Test 4: Vote pour autrui
```bash
# alice tente de voter pour bob
curl -X PATCH http://localhost:3000/polls/poll-123/vote \
  -H "Authorization: Bearer <jwt-alice>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-bob",
    "dateChoice": "2025-12-25T18:00"
  }'

# Résultat attendu: 403 Forbidden
# Message: "Vous ne pouvez voter que pour vous-même"
```

---

## 📊 Impact et Métriques

### Fichiers Modifiés
- `apps/backend/src/polls/polls.controller.ts` (+12 lignes)
- `apps/backend/src/polls/polls.service.ts` (+45 lignes)
- `apps/backend/src/polls/polls.module.ts` (+1 ligne)
- `apps/frontend/src/app/features/groups/group-detail.ts` (+3 lignes)
- `apps/frontend/src/app/features/groups/group-detail.html` (+1 ligne)
- `apps/frontend/src/app/features/groups/poll-widget.ts` (+15 lignes)
- `apps/frontend/src/app/features/groups/poll-widget.html` (+8 lignes)
- `apps/frontend/src/app/features/groups/poll-widget.css` (+14 lignes)

**Total**: 8 fichiers, ~100 lignes ajoutées

### Vulnérabilités Corrigées
- ✅ **CWE-306**: Missing Authentication
- ✅ **CWE-862**: Missing Authorization
- ✅ **CWE-639**: Authorization Bypass
- ✅ **OWASP A01:2021**: Broken Access Control

---

## 🎓 Leçons Apprises

### Principes de Sécurité
1. **Authentification First**: Toujours vérifier qui fait la requête
2. **Authorization Second**: Vérifier si l'utilisateur a le droit
3. **Defense in Depth**: Backend + Frontend (UX)
4. **Fail Secure**: Erreur 403 plutôt que succès silencieux

### Best Practices Appliquées
- ✅ Guards JWT sur **tous** les endpoints sensibles
- ✅ Vérification appartenance groupe **avant** action
- ✅ Validation userId === authenticatedUserId
- ✅ Messages d'erreur clairs (pas de leak d'info)
- ✅ UI disabled pour actions non autorisées

### Checklist Sécurité Future
Pour tout nouvel endpoint :
- [ ] JwtAuthGuard appliqué ?
- [ ] Vérification ownership/membership ?
- [ ] Validation des IDs utilisateurs ?
- [ ] Tests 401/403 écrits ?
- [ ] UI feedback approprié ?

---

## 🚀 Prochaines Améliorations (Hors MVP)

### Phase 2
- [ ] Tests unitaires spécifiques sécurité
- [ ] Audit logs (qui a fait quoi et quand)
- [ ] Rate limiting (prévenir spam votes)
- [ ] CSRF protection
- [ ] Input sanitization renforcée

### Phase 3 (Production)
- [ ] Penetration testing
- [ ] Security headers (OWASP)
- [ ] Intrusion detection
- [ ] Security monitoring dashboard

---

## ✅ Conclusion

**Vulnérabilité critique corrigée** : Les polls sont maintenant correctement protégés.

**Impact MVP** : 
- ✅ Fonctionnalité préservée pour utilisateurs légitimes
- ✅ Expérience utilisateur améliorée (messages clairs)
- ✅ Sécurité renforcée sans casser l'existant

**Commit** : `security: Add authentication and group membership checks for polls`

**Temps** : 30 min
**Priorité** : 🔴 CRITIQUE (corrigée immédiatement)

---

**TFE Progress**: 76% ✅  
**Next**: Tests manuels complets pour valider sécurité
