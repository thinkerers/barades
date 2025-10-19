import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncStateComponent, AsyncStateStatus } from '@org/ui';
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
})
export class SessionDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionsService = inject(SessionsService);
  private readonly reservationsService = inject(ReservationsService);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private sessionId: string | null = null;

  session: Session | null = null;
  loading = true;
  error: string | null = null;
  isRegistered = false;
  reserving = false;
  cancelling = false;
  deleting = false;
  private currentReservationId: string | null = null;
  readonly loadingMessage = 'Chargement de la session...';
  readonly defaultErrorMessage =
    "Impossible de charger la session. Elle n'existe peut-être pas.";

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.sessionId = id;
      this.loadSession(id);
    } else {
      this.error = 'ID de session invalide';
      this.loading = false;
    }
  }

  loadSession(id: string): void {
    this.sessionId = id;
    this.loading = true;
    this.error = null;

    this.sessionsService.getSession(id).subscribe({
      next: (session) => {
        this.session = session;
        this.loading = false;
        this.checkIfRegistered();
      },
      error: (err) => {
        console.error('Error loading session:', err);
        this.error = this.defaultErrorMessage;
        this.loading = false;
      },
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
      this.loadSession(this.sessionId);
    }
  }

  get canRetry(): boolean {
    return !!this.sessionId;
  }

  checkIfRegistered(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !this.session) {
      this.isRegistered = false;
      this.currentReservationId = null;
      return;
    }

    this.reservationsService.getReservations(currentUser.id).subscribe({
      next: (reservations) => {
        const activeReservation = reservations.find(
          (r) => r.sessionId === this.session?.id && r.status !== 'CANCELLED'
        );
        this.isRegistered = !!activeReservation;
        this.currentReservationId = activeReservation?.id ?? null;
      },
      error: (err) => {
        console.error('Error checking registration:', err);
        this.isRegistered = false;
        this.currentReservationId = null;
      },
    });
  }

  onReserve(): void {
    if (!this.session) return;

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

    this.reserving = true;
    this.reservationsService
      .createReservation(this.session.id, currentUser.id)
      .subscribe({
        next: (reservation) => {
          this.isRegistered = true;
          this.currentReservationId = reservation.id;
          if (this.session) {
            this.session.playersCurrent = Math.min(
              this.session.playersMax,
              this.session.playersCurrent + 1
            );
            const existingReservations = this.session.reservations ?? [];
            const alreadyListed = existingReservations.some(
              (entry) => entry.id === reservation.id
            );
            if (!alreadyListed) {
              this.session.reservations = [
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
            }
          }
          this.reserving = false;
          this.notifications.success(
            'Réservation confirmée ! Vous avez reçu un email de confirmation.'
          );
        },
        error: (err) => {
          console.error('Error creating reservation:', err);
          this.reserving = false;
          this.notifications.error(
            err.error?.message || 'Erreur lors de la réservation.'
          );
        },
      });
  }

  onCancelReservation(): void {
    if (!this.session || !this.currentReservationId) {
      return;
    }

    const reservationId = this.currentReservationId;
    this.cancelling = true;

    this.reservationsService.cancelReservation(reservationId).subscribe({
      next: () => {
        this.isRegistered = false;
        this.currentReservationId = null;
        if (this.session) {
          this.session.playersCurrent = Math.max(
            0,
            this.session.playersCurrent - 1
          );
          if (this.session.reservations) {
            this.session.reservations = this.session.reservations.filter(
              (reservation) => reservation.id !== reservationId
            );
          }
        }
        this.cancelling = false;
        this.notifications.info('Désinscription confirmée.');
      },
      error: (err) => {
        console.error('Error cancelling reservation:', err);
        this.cancelling = false;
        this.notifications.error(
          err.error?.message || 'Erreur lors de la désinscription.'
        );
      },
    });
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

  onDelete(): void {
    if (!this.session) {
      return;
    }

    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer cette session ? Cette action est irréversible.'
    );

    if (!confirmed) {
      return;
    }

    this.deleting = true;

    this.sessionsService.deleteSession(this.session.id).subscribe({
      next: () => {
        this.deleting = false;
        this.notifications.success('Session supprimée.');
        this.router.navigate(['/sessions'], {
          queryParams: { filter: 'my-hosted' },
        });
      },
      error: (err) => {
        console.error('Error deleting session:', err);
        this.deleting = false;
        this.notifications.error(
          err?.error?.message ?? 'Erreur lors de la suppression de la session.'
        );
      },
    });
  }
}
