import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  Reservation,
  ReservationsService,
} from '../../core/services/reservations.service';
import { Session } from '../../core/services/sessions.service';

@Component({
  selector: 'app-session-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './session-card.html',
  styleUrl: './session-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionCardComponent implements OnInit {
  @Input({ required: true }) session!: Session;

  private readonly reservationsService = inject(ReservationsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly isRegistered = signal(false);

  ngOnInit(): void {
    this.checkIfRegistered();
  }

  getTagColorClass(color: string): string {
    const colorMap: Record<string, string> = {
      RED: 'tag--red',
      GREEN: 'tag--green',
      PURPLE: 'tag--purple',
      BLUE: 'tag--blue',
      GRAY: 'tag--gray',
    };
    return colorMap[color] || 'tag--gray';
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
    return this.session.playersMax - this.session.playersCurrent;
  }

  isFull(): boolean {
    return this.session.playersCurrent >= this.session.playersMax;
  }

  getStatusClass(): string {
    const available = this.getAvailableSpots();
    if (available === 0) return 'status--full';
    if (available <= 2) return 'status--limited';
    return 'status--available';
  }

  /**
   * Check if the current user is already registered for this session
   */
  checkIfRegistered(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.isRegistered.set(false);
      return;
    }

    // Load user's reservations and check if one matches this session
    this.reservationsService
      .getReservations(currentUser.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (reservations: Reservation[]) => {
          this.isRegistered.set(
            reservations.some(
              (r: { sessionId: string }) => r.sessionId === this.session.id
            )
          );
        },
        error: (err) => {
          console.error('Error checking registration status:', err);
          this.isRegistered.set(false);
        },
      });
  }

  onReserve(): void {
    // Vérifier si l'utilisateur est connecté
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      // Rediriger vers la page de connexion
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/sessions` },
      });
      return;
    }

    // Vérifier si la session est complète
    if (this.isFull()) {
      this.error.set('Cette session est complète');
      this.notifications.info('Cette session est complète.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.reservationsService
      .createReservation(this.session.id, currentUser.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (reservation: Reservation) => {
          console.log('Réservation créée:', reservation);
          // Mettre à jour le compteur local et le statut d'inscription
          this.session.playersCurrent = Math.min(
            this.session.playersMax,
            this.session.playersCurrent + 1
          );
          this.isRegistered.set(true);
          this.loading.set(false);
          this.notifications.success(
            'Réservation confirmée ! Vous avez reçu un email de confirmation.'
          );
        },
        error: (err) => {
          console.error('Erreur lors de la réservation:', err);
          const errorMsg =
            err.error?.message || 'Erreur lors de la réservation';
          this.error.set(errorMsg);
          this.loading.set(false);
          this.notifications.error(errorMsg);
        },
      });
  }
}
