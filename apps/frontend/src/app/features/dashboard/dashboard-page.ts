import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
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

interface UpcomingAction {
  title: string;
  description: string;
  dueDate: string;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
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

  stats = signal<DashboardStat[]>([]);
  upcomingActions = signal<UpcomingAction[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      sessionStats: this.sessionsService.getCreatedByMeStats(),
      groupStats: this.groupsService.getManagedByMeStats(),
      pendingReservations: this.reservationsService.getPendingForMySessions(),
      actionItems: this.usersService.getActionItems(),
    }).subscribe({
      next: (data) => {
        // Build stats array
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

        // Build upcoming actions from action items
        this.upcomingActions.set(this.buildUpcomingActions(data.actionItems));

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.error.set('Impossible de charger les données du dashboard');
        this.loading.set(false);
      },
    });
  }

  private buildUpcomingActions(actionItems: ActionItems): UpcomingAction[] {
    const actions: UpcomingAction[] = [];

    // Add pending reservations as actions
    actionItems.pendingReservations.forEach((reservation) => {
      actions.push({
        title: `Confirmer la réservation pour "${reservation.session.title}"`,
        description: `${reservation.user.username} souhaite rejoindre cette session`,
        dueDate: new Date(reservation.session.date).toLocaleDateString(
          'fr-FR',
          {
            day: 'numeric',
            month: 'long',
          }
        ),
      });
    });

    // Add upcoming sessions as actions
    actionItems.upcomingSessions.forEach((item) => {
      const sessionDate = new Date(item.session.date);
      const locationName = item.session.location?.name || 'En ligne';

      actions.push({
        title: `Session "${item.session.title}"`,
        description: `${item.session.game} - ${locationName}`,
        dueDate: sessionDate.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
        }),
      });
    });

    // Sort by date (most urgent first) and limit to 5
    return actions.slice(0, 5);
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
