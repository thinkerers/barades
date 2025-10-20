# Dashboard Implementation Plan

## ✅ Phase 1 Backend: COMPLETED

All backend endpoints have been successfully implemented:

- ✅ **Session stats**: `GET /sessions/stats/created-by-me`
- ✅ **Group stats**: `GET /groups/stats/managed-by-me`
- ✅ **Pending reservations**: `GET /reservations/pending/for-my-sessions`
- ✅ **Update reservation status**: `PATCH /reservations/:id/status`
- ✅ **Action items**: `GET /users/me/action-items`

All endpoints use the `@CurrentUser()` decorator for authentication and proper error handling.

---

## ✅ Phase 2 Frontend Services: COMPLETED

All frontend service methods have been successfully added:

- ✅ **SessionsService.getCreatedByMeStats()**: Fetches session statistics
- ✅ **GroupsService.getManagedByMeStats()**: Fetches group management statistics
- ✅ **ReservationsService.getPendingForMySessions()**: Fetches pending reservations
- ✅ **ReservationsService.updateReservationStatus()**: Updates reservation status
- ✅ **UsersService.getActionItems()**: Fetches upcoming actions and pending items

All services use proper TypeScript interfaces and return Observable types.

---

## ✅ Phase 3 Dashboard Integration: COMPLETED

Dashboard has been successfully integrated with real data:

- ✅ **Data loading**: Uses `forkJoin` to load all data in parallel
- ✅ **Loading state**: Shows loading indicator while fetching data
- ✅ **Error handling**: Displays error message with retry button
- ✅ **Empty state**: Shows appropriate message when no actions available
- ✅ **Signal-based state**: Uses Angular signals for reactive updates
- ✅ **Real-time stats**: Displays actual counts from backend
- ✅ **Action items**: Shows upcoming sessions and pending reservations
- ✅ **Deep links**: Dashboard stats redirect to the relevant filtered list (sessions →
  `/sessions?filter=my-hosted`)
- ✅ **Interactive cards**: Cards are keyboard-accessible and styled as clickable elements
- ✅ **Navigation banner**: Sessions list displays a contextual banner when arriving from dashboard
- ✅ **Clear exit path**: "Voir toutes les sessions" button removes the filter and banner

The dashboard now displays:

1. Session statistics (total + recent trend)
2. Managed groups count
3. Pending reservations count
4. Upcoming sessions (next 7 days)
5. Pending reservation requests for hosted sessions

### Navigation Flow

**Current Implementation:**

- User clicks "Sessions créées" card on dashboard
- Navigates to `/sessions?filter=my-hosted`
- Sessions list loads only hosted sessions
- Banner appears: "Vous consultez vos sessions créées" with reset button
- Reset button navigates to `/sessions` (all sessions view)

**UX Improvements Identified:**

1. ✅ Explicit URL parameter keeps view shareable and bookmarkable
2. ✅ Banner provides clear context and exit path
3. ⏸️ Pre-fill and gray out "Hôte" filter field to visualize active criteria
4. ⏸️ Set keyboard focus on banner or filter panel after navigation for screen reader context
5. ⏸️ Consider `replaceUrl: true` in router navigation to avoid stacking history entries
6. ⏸️ Optional: Add "Retour au dashboard" link in banner for quick comparison workflows

---

## Files Modified

### Backend Files

- `apps/backend/src/sessions/sessions.controller.ts` - Added `getCreatedByMeStats` endpoint
- `apps/backend/src/sessions/sessions.service.ts` - Added `getCreatedByMeStats` method
- `apps/backend/src/groups/groups.controller.ts` - Added `getManagedByMeStats` endpoint
- `apps/backend/src/groups/groups.service.ts` - Added `getManagedByMeStats` method with Set-based deduplication
- `apps/backend/src/reservations/reservations.controller.ts` - Added `getPendingForMySessions` and `updateStatus` endpoints
- `apps/backend/src/reservations/reservations.service.ts` - Added `getPendingForMySessions` and `updateStatus` methods
- `apps/backend/src/reservations/dto/update-reservation-status.dto.ts` - Created new DTO with validation
- `apps/backend/src/users/users.controller.ts` - Added `getActionItems` endpoint
- `apps/backend/src/users/users.service.ts` - Added `getActionItems` method

### Frontend Files

- `apps/frontend/src/app/core/services/sessions.service.ts` - Added `getCreatedByMeStats` and `getHostedByMe` methods
- `apps/frontend/src/app/core/services/groups.service.ts` - Added `getManagedByMeStats` method
- `apps/frontend/src/app/core/services/reservations.service.ts` - Added `getPendingForMySessions` and `updateReservationStatus` methods
- `apps/frontend/src/app/core/services/users.service.ts` - Added `getActionItems` method and `ActionItems` interface
- `apps/frontend/src/app/features/dashboard/dashboard-page.ts` - Integrated real data with forkJoin, signal-based state, loading/error handling, interactive card navigation
- `apps/frontend/src/app/features/dashboard/dashboard-page.html` - Added loading, error, and empty states; cards with click handlers and ARIA labels
- `apps/frontend/src/app/features/dashboard/dashboard-page.css` - Added interactive card styles (cursor, focus, hover states)
- `apps/frontend/src/app/features/sessions/sessions-list.ts` - Query param handling, conditional data loading, DestroyRef-managed subscriptions, banner display logic
- `apps/frontend/src/app/features/sessions/sessions-list.html` - Contextual banner with reset button for `filter=my-hosted`

---

## Executive Summary

The dashboard currently displays **mock data** for three key features that need full implementation:

1. **Sessions created** by the user
2. **Groups managed** by the user
3. **Reservations pending** (requests to join sessions)

Additionally, the "Upcoming Actions" section needs to be backed by real data instead of hardcoded placeholders.

---

## Current State Analysis

### ✅ Already Implemented (Backend + Frontend)

- **Sessions**: Full CRUD, session listing, session detail
- **Groups**: Full CRUD, membership management
- **Reservations**: Full CRUD with status tracking (PENDING, CONFIRMED, CANCELLED)
- **Users**: Profile management, authentication

### ❌ Missing Features for Dashboard

#### 1. **User-specific Session Statistics**

**Backend:**

- ❌ Endpoint to count sessions created by a user: `GET /sessions/stats/created-by-me`
- ❌ Endpoint to get user's hosted sessions with trends (e.g., "this week"): `GET /sessions/my-hosted?since=<date>`

**Frontend:**

- ❌ Service method to fetch session stats
- ❌ Dashboard integration to display real-time session count

#### 2. **User-specific Group Management Statistics**

**Backend:**

- ❌ Endpoint to count groups where user is ADMIN: `GET /groups/stats/managed-by-me`
- ❌ Enhanced group listing to filter by user role (admin vs member)

**Frontend:**

- ❌ Service method to fetch group management stats
- ❌ Dashboard integration to display groups managed count

#### 3. **Reservation Status Management**

**Backend:**

- ✅ Reservation model has status: PENDING, CONFIRMED, CANCELLED
- ❌ Endpoint to get pending reservations for sessions hosted by user: `GET /reservations/pending-for-my-sessions`
- ❌ Endpoint to approve/reject reservations: `PATCH /reservations/:id/status`
- ❌ Business logic to handle status transitions (PENDING → CONFIRMED/CANCELLED)

**Frontend:**

- ❌ Service methods for reservation status management
- ❌ Dashboard integration to display pending reservation count
- ❌ UI to approve/reject reservations

#### 4. **Upcoming Actions / Notifications**

**Backend:**

- ❌ Endpoint to fetch actionable items: `GET /users/me/action-items`
  - Pending reservations needing confirmation
  - Sessions happening soon that need preparation
  - Group polls awaiting votes
  - Incomplete profile fields

**Frontend:**

- ❌ Service to fetch action items
- ❌ Dashboard integration to display real upcoming actions

---

## Implementation Plan

### **Phase 1: Backend API Endpoints** (Priority: HIGH)

> ⚠️ **Routing order:** Add the new specific routes (e.g. `stats/*`, `my-hosted`) **before** the existing `@Get(':id')` handlers so the parameterised route does not swallow the new endpoints.

> ⚙️ **Controller wiring:** Each new handler will need to be exported via the corresponding module (`sessions.module.ts`, `groups.module.ts`, etc.) and any new DTOs should include class-validator decorators plus `@Body()` pipes where appropriate.

#### 1.1 Session Stats Endpoint

**File:** `apps/backend/src/sessions/sessions.controller.ts` + `sessions.service.ts`

**New Endpoints:**

```typescript
// Get count of sessions created by current user
@Get('stats/created-by-me')
@UseGuards(JwtAuthGuard)
getMySessionStats(@CurrentUser() userId: string) {
  return this.sessionsService.getMySessionStats(userId);
}

// Get sessions hosted by me with date filtering
@Get('my-hosted')
@UseGuards(JwtAuthGuard)
getMyHostedSessions(
  @CurrentUser() userId: string,
  @Query('since') since?: string
) {
  return this.sessionsService.getMyHostedSessions(userId, since);
}
```

> Import `CurrentUser` from `apps/backend/src/auth/decorators/current-user.decorator` in each controller.

**Service methods:**

```typescript
async getMySessionStats(userId: string) {
  const total = await this.prisma.session.count({
    where: { hostId: userId }
  });

  const thisWeek = await this.prisma.session.count({
    where: {
      hostId: userId,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }
  });

  return {
    total,
    thisWeek,
    trend: thisWeek > 0 ? `+${thisWeek} cette semaine` : 'Stable'
  };
}
```

#### 1.2 Group Management Stats Endpoint

**File:** `apps/backend/src/groups/groups.controller.ts` + `groups.service.ts`

**New Endpoint:**

```typescript
@Get('stats/managed-by-me')
@UseGuards(JwtAuthGuard)
getManagedGroupsStats(@CurrentUser() userId: string) {
  return this.groupsService.getManagedGroupsStats(userId);
}
```

**Service method:**

```typescript
async getManagedGroupsStats(userId: string) {
  // Get groups where user is ADMIN
  const groupsAsAdmin = await this.prisma.groupMember.findMany({
    where: {
      userId,
      role: 'ADMIN'
    },
    select: { groupId: true }
  });

  // Get groups created by user
  const groupsAsCreator = await this.prisma.group.findMany({
    where: { creatorId: userId },
    select: { id: true }
  });

  // Use a Set to ensure distinct group IDs (avoid double-counting)
  const managedGroupIds = new Set([
    ...groupsAsAdmin.map(m => m.groupId),
    ...groupsAsCreator.map(g => g.id),
  ]);

  return {
    total: managedGroupIds.size,
    trend: 'Stable' // Could be enhanced with historical data
  };
}
```

#### 1.3 Pending Reservations for My Sessions

**File:** `apps/backend/src/reservations/reservations.controller.ts` + `reservations.service.ts`

**New Endpoint:**

```typescript
@Get('pending-for-my-sessions')
@UseGuards(JwtAuthGuard)
getPendingReservationsForMySessions(@CurrentUser() userId: string) {
  return this.reservationsService.getPendingReservationsForMySessions(userId);
}
```

**Service method:**

```typescript
async getPendingReservationsForMySessions(hostUserId: string) {
  const pendingReservations = await this.prisma.reservation.findMany({
    where: {
      status: 'PENDING',
      session: {
        hostId: hostUserId
      }
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      },
      session: {
        select: {
          id: true,
          title: true,
          date: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return {
    total: pendingReservations.length,
    reservations: pendingReservations,
    trend: pendingReservations.length > 0
      ? `${pendingReservations.length} nouvelle${pendingReservations.length > 1 ? 's' : ''} demande${pendingReservations.length > 1 ? 's' : ''}`
      : 'Aucune demande en attente'
  };
}
```

#### 1.4 Reservation Status Update Endpoint

**File:** `apps/backend/src/reservations/reservations.controller.ts` + `reservations.service.ts`

**First, create the DTO:**

**File:** `apps/backend/src/reservations/dto/update-reservation-status.dto.ts`

```typescript
import { IsEnum } from 'class-validator';

export class UpdateReservationStatusDto {
  @IsEnum(['CONFIRMED', 'CANCELLED'], {
    message: 'Status must be either CONFIRMED or CANCELLED',
  })
  status: 'CONFIRMED' | 'CANCELLED';
}
```

**New Endpoint:**

```typescript
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';

@Patch(':id/status')
@UseGuards(JwtAuthGuard)
updateReservationStatus(
  @Param('id') id: string,
  @Body() dto: UpdateReservationStatusDto,
  @CurrentUser() userId: string
) {
  return this.reservationsService.updateReservationStatus(id, dto.status, userId);
}
```

**Service method:**

```typescript
async updateReservationStatus(
  reservationId: string,
  newStatus: 'CONFIRMED' | 'CANCELLED',
  requestingUserId: string
) {
  const reservation = await this.prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { session: true }
  });

  if (!reservation) {
    throw new NotFoundException('Reservation not found');
  }

  // Only session host can update reservation status
  if (reservation.session.hostId !== requestingUserId) {
    throw new ForbiddenException('Only the session host can update reservation status');
  }

  const updated = await this.prisma.reservation.update({
    where: { id: reservationId },
    data: { status: newStatus },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      session: true
    }
  });

  if (newStatus === 'CANCELLED' && reservation.status === 'CONFIRMED') {
    await this.prisma.session.update({
      where: { id: reservation.sessionId },
      data: {
        playersCurrent: { decrement: 1 }
      }
    });
  }

  if (newStatus === 'CONFIRMED' && reservation.status !== 'CONFIRMED') {
    await this.prisma.session.update({
      where: { id: reservation.sessionId },
      data: {
        playersCurrent: { increment: 1 }
      }
    });
  }

  return updated;
}
```

#### 1.5 Action Items Endpoint

**File:** `apps/backend/src/users/users.controller.ts` + `users.service.ts`

**New Endpoint:**

```typescript
@Get('me/action-items')
@UseGuards(JwtAuthGuard)
getMyActionItems(@CurrentUser() userId: string) {
  return this.usersService.getActionItems(userId);
}
```

**Service method:**

```typescript
async getActionItems(userId: string) {
  const [pendingReservations, upcomingSessions] = await Promise.all([
    // Pending reservations for my hosted sessions
    this.prisma.reservation.findMany({
      where: {
        status: 'PENDING',
        session: { hostId: userId }
      },
      include: {
        session: { select: { title: true, date: true } },
        user: { select: { username: true } }
      },
      take: 5
    }),

    // My upcoming sessions in next 7 days (excluding cancelled sessions)
    this.prisma.session.findMany({
      where: {
        hostId: userId,
        date: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { date: 'asc' },
      take: 3
    }),
  ]);

  const actions = [
    ...pendingReservations.map(r => ({
      type: 'PENDING_RESERVATION',
      title: `Confirmer la demande de ${r.user.username}`,
      description: `Pour la session "${r.session.title}"`,
      dueDate: new Date(r.session.date).toLocaleDateString('fr-FR'),
      entityId: r.id
    })),
    ...upcomingSessions.map(s => ({
      type: 'UPCOMING_SESSION',
      title: `Préparer la session "${s.title}"`,
      description: 'Vérifiez les réservations et contactez les participants',
      dueDate: new Date(s.date).toLocaleDateString('fr-FR'),
      entityId: s.id
    }))
  ];

  return actions;
}
```

> **Note:** Poll voting tracking is not yet implemented in the schema, so we've omitted that action type for now. This can be added in a future iteration when vote tracking is available.

---

### **Phase 2: Frontend Service Updates** (Priority: HIGH)

#### 2.1 Sessions Service

**File:** `apps/frontend/src/app/core/services/sessions.service.ts`

**New methods:**

```typescript
getMySessionStats(): Observable<{
  total: number;
  thisWeek: number;
  trend: string;
}> {
  return this.http.get<any>(`${this.apiUrl}/stats/created-by-me`);
}

getMyHostedSessions(since?: string): Observable<Session[]> {
  const params = since ? { since } : {};
  return this.http.get<Session[]>(`${this.apiUrl}/my-hosted`, { params });
}
```

#### 2.2 Groups Service

**File:** `apps/frontend/src/app/core/services/groups.service.ts`

**New method:**

```typescript
getManagedGroupsStats(): Observable<{
  total: number;
  trend: string;
}> {
  return this.http.get<any>(`${this.apiUrl}/stats/managed-by-me`);
}
```

#### 2.3 Reservations Service

**File:** `apps/frontend/src/app/core/services/reservations.service.ts`

**New methods:**

```typescript
getPendingReservationsForMySessions(): Observable<{
  total: number;
  reservations: Reservation[];
  trend: string;
}> {
  return this.http.get<any>(`${this.apiUrl}/pending-for-my-sessions`);
}

updateReservationStatus(
  id: string,
  status: 'CONFIRMED' | 'CANCELLED'
): Observable<Reservation> {
  return this.http.patch<Reservation>(`${this.apiUrl}/${id}/status`, { status });
}
```

#### 2.4 Users Service

**File:** `apps/frontend/src/app/core/services/users.service.ts`

**New method:**

```typescript
export interface ActionItem {
  type: 'PENDING_RESERVATION' | 'UPCOMING_SESSION';
  title: string;
  description: string;
  dueDate: string;
  entityId: string;
}

getMyActionItems(): Observable<ActionItem[]> {
  return this.http.get<ActionItem[]>(`${this.apiUrl}/me/action-items`);
}
```

---

### **Phase 3: Dashboard Component Integration** (Priority: HIGH)

#### 3.1 Update Dashboard Component

**File:** `apps/frontend/src/app/features/dashboard/dashboard-page.ts`

**Replace mock data with real service calls:**

```typescript
import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { SessionsService } from '../../core/services/sessions.service';
import { GroupsService } from '../../core/services/groups.service';
import { ReservationsService } from '../../core/services/reservations.service';
import { UsersService, ActionItem } from '../../core/services/users.service';
import { AsyncStateComponent } from '@org/ui';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [AsyncStateComponent],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {
  private sessionsService = inject(SessionsService);
  private groupsService = inject(GroupsService);
  private reservationsService = inject(ReservationsService);
  private usersService = inject(UsersService);

  stats = signal<Array<{ label: string; value: number; trend: string }>>([]);
  upcomingActions = signal<ActionItem[]>([]);
  loadingState = signal<'loading' | 'ready' | 'error'>('loading');
  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loadingState.set('loading');

    forkJoin({
      sessionStats: this.sessionsService.getMySessionStats(),
      groupStats: this.groupsService.getManagedGroupsStats(),
      reservationStats: this.reservationsService.getPendingReservationsForMySessions(),
      actions: this.usersService.getMyActionItems(),
    }).subscribe({
      next: ({ sessionStats, groupStats, reservationStats, actions }) => {
        this.stats.set([
          {
            label: 'Sessions créées',
            value: sessionStats.total,
            trend: sessionStats.trend,
          },
          {
            label: 'Groupes gérés',
            value: groupStats.total,
            trend: groupStats.trend,
          },
          {
            label: 'Réservations en attente',
            value: reservationStats.total,
            trend: reservationStats.trend,
          },
        ]);

        this.upcomingActions.set(actions);
        this.loadingState.set('ready');
      },
      error: (error) => {
        console.error('Failed to load dashboard data:', error);
        this.errorMessage.set('Impossible de charger les données du tableau de bord');
        this.loadingState.set('error');
      },
    });
  }

  retryLoad(): void {
    this.loadDashboardData();
  }
}
```

#### 3.2 Update Dashboard Template

**File:** `apps/frontend/src/app/features/dashboard/dashboard-page.html`

**Wrap content in async-state component:**

```html
<lib-async-state [status]="loadingState()" loadingMessage="Chargement de votre tableau de bord..." [errorMessage]="errorMessage()" (retry)="retryLoad()">
  <section class="dashboard">
    <header class="dashboard__header">
      <h1>Tableau de bord</h1>
      <p class="dashboard__subtitle">Visualisez un aperçu rapide de vos activités, sessions et groupes.</p>
    </header>

    <div class="dashboard__grid">
      @for (stat of stats(); track stat.label) {
      <div class="dashboard__card">
        <h2>{{ stat.value }}</h2>
        <p class="dashboard__card-label">{{ stat.label }}</p>
        <p class="dashboard__card-trend">{{ stat.trend }}</p>
      </div>
      }
    </div>

    <section class="dashboard__actions">
      <h2>Actions à venir</h2>
      @if (upcomingActions().length === 0) {
      <p class="dashboard__empty">Aucune action en attente pour le moment.</p>
      } @else {
      <ul>
        @for (action of upcomingActions(); track action.entityId) {
        <li class="dashboard__action-item">
          <h3>{{ action.title }}</h3>
          <p>{{ action.description }}</p>
          <span class="dashboard__action-date">À faire avant le {{ action.dueDate }}</span>
        </li>
        }
      </ul>
      }
    </section>
  </section>
</lib-async-state>
```

---

### **Phase 4: Reservation Management UI** (Priority: MEDIUM)

Create a dedicated component to manage pending reservations with approve/reject actions.

**New Component:** `apps/frontend/src/app/features/reservations/reservation-manager.component.ts`

This component would:

- Display list of pending reservations
- Provide "Approve" and "Reject" buttons
- Call `reservationsService.updateReservationStatus()`
- Show success/error feedback

---

## Implementation Order

1. ✅ **Phase 1.1-1.2**: Session & Group stats endpoints (1-2 hours)
2. ✅ **Phase 1.3-1.4**: Reservation management endpoints (2-3 hours)
3. ✅ **Phase 1.5**: Action items endpoint (2 hours)
4. ✅ **Phase 2**: Frontend service methods (1 hour)
5. ✅ **Phase 3**: Dashboard integration with real data (2 hours)
6. ✅ **Phase 3.1**: Deep link navigation to filtered sessions list (1 hour)
7. ✅ **Phase 3.2**: Contextual banner and reset functionality (1 hour)
8. ⏸️ **Phase 3.3 (Optional)**: Enhanced UX improvements:
   - Pre-filled and grayed "Hôte" filter field
   - Keyboard focus management on navigation
   - History state optimization with `replaceUrl`
   - "Retour au dashboard" link in banner
9. ⏸️ **Phase 4 (Optional)**: Reservation management UI (3-4 hours)

**Total Estimated Time:** 10-14 hours (excluding optional phases)

---

## Next Steps: Enhanced Navigation UX

### Potential Improvements for Future Iterations

1. **Visual Filter Indicator**

   - Pre-fill the "Hôte" field in the filter panel with current user's name
   - Gray out/disable the field to show it's set by the deep link
   - Clear when user clicks "Voir toutes les sessions"

2. **Accessibility Enhancement**

   - Move keyboard focus to banner or filter panel after navigation
   - Announce context change to screen readers
   - Ensure all interactive elements have clear focus indicators

3. **Browser History Optimization**

   - Use `replaceUrl: true` in card click navigation to avoid stacking entries
   - Consider: Dashboard → Sessions (filtered) → Reset filter
   - Prevents: Dashboard → Sessions (filtered) → Sessions (filtered) → Sessions (all)

4. **Quick Return Path**
   - Add "← Retour au dashboard" link in banner alongside reset button
   - Useful for users comparing multiple stats
   - Could track navigation state to show only when coming from dashboard

---

## Important Module & DTO Updates

After implementing the endpoints above, ensure proper wiring:

### Backend Module Registration

1. **Import DTOs in controllers:**

   - `UpdateReservationStatusDto` in `reservations.controller.ts`

2. **Verify module registrations:**

   - `SessionsController` methods in `sessions.module.ts`
   - `GroupsController` methods in `groups.module.ts`
   - `ReservationsController` methods in `reservations.module.ts`
   - `UsersController` methods in `users.module.ts`

3. **Validation setup:**
   - Ensure `ValidationPipe` is enabled globally in `main.ts`
   - All DTOs should use class-validator decorators

### Frontend Service Registration

1. Verify all new service methods are exported properly
2. Ensure `HttpClient` is injected in each service
3. Add proper TypeScript interfaces for response types

---

## Testing Strategy

1. **Backend Unit Tests**: Test each new service method
2. **Backend E2E Tests**: Test API endpoints with authentication
3. **Backend Behaviour Tests**: Verify `playersCurrent` adjusts correctly on reservation status changes
4. **Frontend Service Tests**: Mock HTTP responses
5. **Frontend Component Tests**: Test dashboard with mock data
6. **Manual QA**: Verify dashboard displays correct data and guard-protected routes behave as expected

---

## Migration Notes

- No database schema changes required (all needed models exist)
- No breaking changes to existing APIs
- All new endpoints are additive
- Backward compatible with existing frontend code

---

## Success Criteria

✅ Dashboard displays real-time statistics for:

- Sessions created by user
- Groups managed by user (ADMIN role)
- Pending reservations for user's sessions

✅ "Upcoming Actions" section populated with:

- Pending reservation approvals
- Upcoming sessions needing preparation

✅ All dashboard data loads asynchronously with proper loading/error states

✅ User can navigate to related entities (sessions, groups, reservations) from dashboard

✅ Deep link navigation works seamlessly:

- Dashboard card click navigates to filtered view
- URL parameter persists the filter state
- Contextual banner explains current view
- Clear reset button returns to unfiltered view
- All interactions are keyboard-accessible

⏸️ **Future UX Enhancements** (optional):

- Visual filter state indicator (pre-filled host field)
- Focus management for screen readers
- Optimized browser history behavior
- Quick dashboard return link
