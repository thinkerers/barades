import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  PendingTasks,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';
import { GroupsService } from '../../core/services/groups.service';
import { ReservationsService } from '../../core/services/reservations.service';
import { SessionsService } from '../../core/services/sessions.service';
import { ActionItems, UsersService } from '../../core/services/users.service';

type DashboardStatKey =
  | 'sessions-created'
  | 'groups-managed'
  | 'pending-reservations';

interface DashboardStat {
  key: DashboardStatKey;
  label: string;
  value: number;
  trend: string;
}

type ActionType = 'pending-reservation' | 'upcoming-session';

interface UpcomingAction {
  type: ActionType;
  title: string;
  description: string;
  dueDate: string;
  reservationId?: string;
  sessionId?: string;
  processing?: boolean;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {
  private readonly sessionsService = inject(SessionsService);
  private readonly groupsService = inject(GroupsService);
  private readonly reservationsService = inject(ReservationsService);
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);
  private readonly pendingTasks = inject(PendingTasks);

  stats = signal<DashboardStat[]>([]);
  upcomingActions = signal<UpcomingAction[]>([]);
  // Start with loading false - will be set to true after 100ms if data takes longer
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    void this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    // Debounced loading: only show spinner if request takes >100ms
    // This prevents spinner flicker when data is cached (typically <100ms)
    const loadingTimeout = setTimeout(() => {
      this.loading.set(true);
    }, 100);

    this.error.set(null);

    await this.pendingTasks.run(async () => {
      try {
        const data = await firstValueFrom(
          forkJoin({
            sessionStats: this.sessionsService.getCreatedByMeStats(),
            groupStats: this.groupsService.getManagedByMeStats(),
            pendingReservations:
              this.reservationsService.getPendingForMySessions(),
            actionItems: this.usersService.getActionItems(),
          })
        );

        // Clear timeout if data arrived quickly (cached)
        clearTimeout(loadingTimeout);

        this.stats.set([
          {
            key: 'sessions-created',
            label: 'Sessions créées',
            value: data.sessionStats.totalCount,
            trend: `+${data.sessionStats.recentCount} ${data.sessionStats.period}`,
          },
          {
            key: 'groups-managed',
            label: 'Groupes gérés',
            value: data.groupStats.totalCount,
            trend: 'Stable',
          },
          {
            key: 'pending-reservations',
            label: 'Réservations en attente',
            value: data.pendingReservations.length,
            trend:
              data.pendingReservations.length > 0
                ? `${data.pendingReservations.length} nouvelle${
                    data.pendingReservations.length > 1 ? 's' : ''
                  } demande${data.pendingReservations.length > 1 ? 's' : ''}`
                : 'Aucune demande',
          },
        ]);

        this.upcomingActions.set(this.buildUpcomingActions(data.actionItems));
      } catch (err) {
        // Clear timeout on error as well
        clearTimeout(loadingTimeout);
        console.error('Error loading dashboard data:', err);
        this.error.set('Impossible de charger les données du dashboard');
      } finally {
        this.loading.set(false);
      }
    });
  }

  private buildUpcomingActions(actionItems: ActionItems): UpcomingAction[] {
    const actions: UpcomingAction[] = [];

    // Add pending reservations as actions
    actionItems.pendingReservations.forEach((reservation) => {
      actions.push({
        type: 'pending-reservation',
        title: `Confirmer la réservation pour "${reservation.session.title}"`,
        description: `${reservation.user.username} souhaite rejoindre cette session`,
        dueDate: new Date(reservation.session.date).toLocaleDateString(
          'fr-FR',
          {
            day: 'numeric',
            month: 'long',
          }
        ),
        reservationId: reservation.id,
        sessionId: reservation.session.id,
      });
    });

    // Add upcoming sessions as actions
    actionItems.upcomingSessions.forEach((item) => {
      const sessionDate = new Date(item.session.date);
      const locationName = item.session.location?.name || 'En ligne';

      actions.push({
        type: 'upcoming-session',
        title: `Session "${item.session.title}"`,
        description: `${item.session.game} - ${locationName}`,
        dueDate: sessionDate.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
        }),
        sessionId: item.session.id,
      });
    });

    // Sort by date (most urgent first) and limit to 5
    return actions.slice(0, 5);
  }

  /**
   * Confirm a pending reservation
   */
  async confirmReservation(action: UpcomingAction): Promise<void> {
    if (!action.reservationId) return;

    // Set processing state
    this.updateActionProcessing(action.reservationId, true);

    try {
      await firstValueFrom(
        this.reservationsService.updateReservationStatus(
          action.reservationId,
          'CONFIRMED'
        )
      );
      // Remove the action from the list and update stats
      this.removeActionAndUpdateStats(action.reservationId);
    } catch (err) {
      console.error('Error confirming reservation:', err);
      this.updateActionProcessing(action.reservationId, false);
    }
  }

  /**
   * Reject a pending reservation
   */
  async rejectReservation(action: UpcomingAction): Promise<void> {
    if (!action.reservationId) return;

    // Set processing state
    this.updateActionProcessing(action.reservationId, true);

    try {
      await firstValueFrom(
        this.reservationsService.updateReservationStatus(
          action.reservationId,
          'CANCELLED'
        )
      );
      // Remove the action from the list and update stats
      this.removeActionAndUpdateStats(action.reservationId);
    } catch (err) {
      console.error('Error rejecting reservation:', err);
      this.updateActionProcessing(action.reservationId, false);
    }
  }

  /**
   * Navigate to session detail
   */
  viewSession(action: UpcomingAction): void {
    if (action.sessionId) {
      this.router.navigate(['/sessions', action.sessionId]);
    }
  }

  private updateActionProcessing(
    reservationId: string,
    processing: boolean
  ): void {
    this.upcomingActions.update((actions) =>
      actions.map((a) =>
        a.reservationId === reservationId ? { ...a, processing } : a
      )
    );
  }

  private removeActionAndUpdateStats(reservationId: string): void {
    // Remove action from list
    this.upcomingActions.update((actions) =>
      actions.filter((a) => a.reservationId !== reservationId)
    );

    // Update pending reservations count in stats
    this.stats.update((stats) =>
      stats.map((s) => {
        if (s.key === 'pending-reservations') {
          const newValue = Math.max(0, s.value - 1);
          return {
            ...s,
            value: newValue,
            trend:
              newValue > 0
                ? `${newValue} nouvelle${newValue > 1 ? 's' : ''} demande${newValue > 1 ? 's' : ''}`
                : 'Aucune demande',
          };
        }
        return s;
      })
    );
  }

  isStatInteractive(stat: DashboardStat): boolean {
    return stat.key === 'sessions-created';
  }

  onCardClick(key: DashboardStatKey): void {
    switch (key) {
      case 'sessions-created':
        this.router.navigate(['/sessions'], {
          queryParams: { filter: 'my-hosted', from: 'dashboard' },
          replaceUrl: true, // Avoid stacking history entries
        });
        break;
      case 'groups-managed':
        this.router.navigate(['/groups']);
        break;
      case 'pending-reservations':
        // TODO: Navigate to reservations management when available
        console.log('Navigate to pending reservations');
        break;
    }
  }

  onStatKeydown(stat: DashboardStat, event: KeyboardEvent | Event): void {
    if (!this.isStatInteractive(stat)) {
      return;
    }

    const key = 'key' in event ? event.key : undefined;
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.onCardClick(stat.key);
    }
  }

  getStatAriaLabel(stat: DashboardStat): string | null {
    if (!this.isStatInteractive(stat)) {
      return null;
    }

    if (stat.key === 'sessions-created') {
      return `Voir les sessions que j'organise (${stat.value})`;
    }

    return null;
  }
}
