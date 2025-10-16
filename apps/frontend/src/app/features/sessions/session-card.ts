import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Session } from '../../core/services/sessions.service';
import { ReservationsService } from '../../core/services/reservations.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-session-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './session-card.html',
  styleUrl: './session-card.css',
})
export class SessionCardComponent {
  @Input({ required: true }) session!: Session;

  private reservationsService = inject(ReservationsService);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error: string | null = null;

  getTagColorClass(color: string): string {
    const colorMap: Record<string, string> = {
      'RED': 'tag--red',
      'GREEN': 'tag--green',
      'PURPLE': 'tag--purple',
      'BLUE': 'tag--blue',
      'GRAY': 'tag--gray'
    };
    return colorMap[color] || 'tag--gray';
  }

  getLevelLabel(level: string): string {
    const labels: Record<string, string> = {
      'BEGINNER': 'Débutant',
      'INTERMEDIATE': 'Intermédiaire',
      'ADVANCED': 'Avancé',
      'OPEN': 'Tous niveaux'
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
      minute: '2-digit'
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

  onReserve(): void {
    // Vérifier si l'utilisateur est connecté
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      // Rediriger vers la page de connexion
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: `/sessions/${this.session.id}` }
      });
      return;
    }

    // Vérifier si la session est complète
    if (this.isFull()) {
      this.error = 'Cette session est complète';
      return;
    }

    this.loading = true;
    this.error = null;

    this.reservationsService.createReservation(this.session.id, currentUser.id)
      .subscribe({
        next: (reservation) => {
          console.log('Réservation créée:', reservation);
          // Mettre à jour le compteur local
          this.session.playersCurrent++;
          this.loading = false;
          // TODO: Afficher un message de succès (toast/snackbar)
          alert('✅ Réservation confirmée ! Vous avez reçu un email de confirmation.');
        },
        error: (err) => {
          console.error('Erreur lors de la réservation:', err);
          this.error = err.error?.message || 'Erreur lors de la réservation';
          this.loading = false;
          alert(`❌ ${this.error}`);
        }
      });
  }
}
