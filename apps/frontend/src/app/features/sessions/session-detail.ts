import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ReservationsService } from '../../core/services/reservations.service';
import { Session, SessionsService } from '../../core/services/sessions.service';

@Component({
  standalone: true,
  imports: [CommonModule, MatIconModule],
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

  session: Session | null = null;
  loading = true;
  error: string | null = null;
  isRegistered = false;
  reserving = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSession(id);
    } else {
      this.error = 'ID de session invalide';
      this.loading = false;
    }
  }

  loadSession(id: string): void {
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
        this.error =
          "Impossible de charger la session. Elle n'existe peut-être pas.";
        this.loading = false;
      },
    });
  }

  checkIfRegistered(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !this.session) {
      this.isRegistered = false;
      return;
    }

    this.reservationsService.getReservations(currentUser.id).subscribe({
      next: (reservations) => {
        this.isRegistered = reservations.some(
          (r) => r.sessionId === this.session?.id
        );
      },
      error: (err) => {
        console.error('Error checking registration:', err);
        this.isRegistered = false;
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
      alert('Cette session est complète');
      return;
    }

    if (this.isRegistered) {
      return;
    }

    this.reserving = true;
    this.reservationsService
      .createReservation(this.session.id, currentUser.id)
      .subscribe({
        next: () => {
          this.isRegistered = true;
          if (this.session) {
            this.session.playersCurrent++;
          }
          this.reserving = false;
          alert(
            '✅ Réservation confirmée ! Vous avez reçu un email de confirmation.'
          );
        },
        error: (err) => {
          console.error('Error creating reservation:', err);
          this.reserving = false;
          alert(`❌ ${err.error?.message || 'Erreur lors de la réservation'}`);
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
}
