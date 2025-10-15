import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Session } from '../../core/services/sessions.service';

@Component({
  selector: 'app-session-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './session-card.html',
  styleUrl: './session-card.css',
})
export class SessionCardComponent {
  @Input({ required: true }) session!: Session;

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
}
