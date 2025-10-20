import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  PendingTasks,
  inject,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncStateComponent, AsyncStateStatus } from '@org/ui';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ReservationsService } from '../../core/services/reservations.service';
import { Session, SessionsService } from '../../core/services/sessions.service';

@Component({
  standalone: true,
  imports: [CommonModule, MatIconModule, AsyncStateComponent],
  selector: 'app-session-detail',
  templateUrl: './session-detail.html',
  styleUrl: './session-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionsService = inject(SessionsService);
  private readonly reservationsService = inject(ReservationsService);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly pendingTasks = inject(PendingTasks);
  private sessionId: string | null = null;
  private readonly sessionSignal = signal<Session | null>(null);
  private readonly loadingSignal = signal(true);
  private readonly errorSignal = signal<string | null>(null);
  private readonly isRegisteredSignal = signal(false);
  private readonly reservingSignal = signal(false);
  private readonly cancellingSignal = signal(false);
  private readonly deletingSignal = signal(false);
  private currentReservationId: string | null = null;
  readonly loadingMessage = 'Chargement de la session...';
  readonly defaultErrorMessage =
    "Impossible de charger la session. Elle n'existe peut-être pas.";

  get session(): Session | null {
    return this.sessionSignal();
  }

  get loading(): boolean {
    return this.loadingSignal();
  }

  get error(): string | null {
    return this.errorSignal();
  }

  get isRegistered(): boolean {
    return this.isRegisteredSignal();
  }

  get reserving(): boolean {
    return this.reservingSignal();
  }

  get cancelling(): boolean {
    return this.cancellingSignal();
  }

  get deleting(): boolean {
    return this.deletingSignal();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.sessionId = id;
      void this.loadSession(id);
    } else {
      this.errorSignal.set('ID de session invalide');
      this.loadingSignal.set(false);
    }
  }

  async loadSession(id: string): Promise<void> {
    this.sessionId = id;
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    await this.pendingTasks.run(async () => {
      try {
        const session = await firstValueFrom(
          this.sessionsService.getSession(id)
        );
        this.sessionSignal.set(session);
        this.loadingSignal.set(false);
        await this.checkIfRegistered();
      } catch (error) {
        console.error('Error loading session:', error);
        this.sessionSignal.set(null);
        this.isRegisteredSignal.set(false);
        this.errorSignal.set(this.defaultErrorMessage);
        this.loadingSignal.set(false);
      }
    });
  }

  get viewState(): AsyncStateStatus {
    if (this.loading) {
      return 'loading';
    }

    if (this.error) {
      return 'error';
    }

    return this.session ? 'ready' : 'empty';
  }

  retry(): void {
    if (this.sessionId) {
      void this.loadSession(this.sessionId);
    }
  }

  get canRetry(): boolean {
    return !!this.sessionId;
  }

  private async checkIfRegistered(): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    const session = this.session;
    if (!currentUser || !session) {
      this.isRegisteredSignal.set(false);
      this.currentReservationId = null;
      return;
    }

    try {
      const reservations = await firstValueFrom(
        this.reservationsService.getReservations(currentUser.id)
      );
      const activeReservation = reservations.find(
        (reservation) =>
          reservation.sessionId === session.id &&
          reservation.status !== 'CANCELLED'
      );
      this.isRegisteredSignal.set(!!activeReservation);
      this.currentReservationId = activeReservation?.id ?? null;
    } catch (error) {
      console.error('Error checking registration:', error);
      this.isRegisteredSignal.set(false);
      this.currentReservationId = null;
    }
  }

  async onReserve(): Promise<void> {
    const session = this.session;
    if (!session) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/sessions/${this.session.id}` },
      });
      return;
    }

    if (this.isFull()) {
      this.notifications.info('Cette session est complète.');
      return;
    }

    if (this.isRegistered) {
      return;
    }

    this.reservingSignal.set(true);

    try {
      const reservation = await firstValueFrom(
        this.reservationsService.createReservation(session.id, currentUser.id)
      );
      this.isRegisteredSignal.set(true);
      this.currentReservationId = reservation.id;
      this.sessionSignal.update((current) => {
        if (!current) {
          return current;
        }

        const playersCurrent = Math.min(
          current.playersMax,
          current.playersCurrent + 1
        );
        const existingReservations = current.reservations ?? [];
        const alreadyListed = existingReservations.some(
          (entry) => entry.id === reservation.id
        );
        const updatedReservations = alreadyListed
          ? existingReservations
          : [
              ...existingReservations,
              {
                id: reservation.id,
                status: reservation.status,
                user: {
                  id: currentUser.id,
                  username: currentUser.username,
                  avatar: currentUser.avatar ?? null,
                },
              },
            ];

        return {
          ...current,
          playersCurrent,
          reservations: updatedReservations,
        } satisfies Session;
      });
      this.notifications.success(
        'Réservation confirmée ! Vous avez reçu un email de confirmation.'
      );
    } catch (error) {
      console.error('Error creating reservation:', error);
      const message =
        (error as { error?: { message?: string } })?.error?.message ||
        'Erreur lors de la réservation.';
      this.notifications.error(message);
    } finally {
      this.reservingSignal.set(false);
    }
  }

  async onCancelReservation(): Promise<void> {
    const session = this.session;
    if (!session || !this.currentReservationId) {
      return;
    }

    const reservationId = this.currentReservationId;
    this.cancellingSignal.set(true);

    try {
      await firstValueFrom(
        this.reservationsService.cancelReservation(reservationId)
      );
      this.isRegisteredSignal.set(false);
      this.currentReservationId = null;
      this.sessionSignal.update((current) => {
        if (!current) {
          return current;
        }

        const playersCurrent = Math.max(0, current.playersCurrent - 1);
        const updatedReservations = current.reservations
          ? current.reservations.filter(
              (reservation) => reservation.id !== reservationId
            )
          : current.reservations;

        return {
          ...current,
          playersCurrent,
          reservations: updatedReservations,
        } satisfies Session;
      });
      this.notifications.info('Désinscription confirmée.');
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      const message =
        (error as { error?: { message?: string } })?.error?.message ||
        'Erreur lors de la désinscription.';
      this.notifications.error(message);
    } finally {
      this.cancellingSignal.set(false);
    }
  }

  getLevelLabel(level: string): string {
    const labels: Record<string, string> = {
      BEGINNER: 'Débutant',
      INTERMEDIATE: 'Intermédiaire',
      ADVANCED: 'Avancé',
      OPEN: 'Tous niveaux',
    };
    return labels[level] || level;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  getAvailableSpots(): number {
    return this.session
      ? this.session.playersMax - this.session.playersCurrent
      : 0;
  }

  isFull(): boolean {
    return this.session
      ? this.session.playersCurrent >= this.session.playersMax
      : true;
  }

  getStatusClass(): string {
    const available = this.getAvailableSpots();
    if (available === 0) return 'status--full';
    if (available <= 2) return 'status--limited';
    return 'status--available';
  }

  goBack(): void {
    this.router.navigate(['/sessions']);
  }

  isOwner(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return !!(
      currentUser &&
      this.session &&
      this.session.hostId === currentUser.id
    );
  }

  onEdit(): void {
    if (this.session) {
      this.router.navigate(['/sessions', this.session.id, 'edit']);
    }
  }

  async onDelete(): Promise<void> {
    if (!this.session) {
      return;
    }

    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer cette session ? Cette action est irréversible.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingSignal.set(true);

    try {
      await firstValueFrom(this.sessionsService.deleteSession(this.session.id));
      this.notifications.success('Session supprimée.');
      this.router.navigate(['/sessions'], {
        queryParams: { filter: 'my-hosted' },
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      const message =
        (error as { error?: { message?: string } })?.error?.message ??
        'Erreur lors de la suppression de la session.';
      this.notifications.error(message);
    } finally {
      this.deletingSignal.set(false);
    }
  }
}
