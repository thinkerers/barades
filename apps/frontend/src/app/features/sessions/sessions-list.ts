import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SessionsService, Session } from '../../core/services/sessions.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  selector: 'app-sessions-list',
  templateUrl: './sessions-list.html',
  styleUrl: './sessions-list.css',
})
export class SessionsListPage implements OnInit {
  private readonly sessionsService = inject(SessionsService);
  
  sessions: Session[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    this.error = null;
    
    this.sessionsService.getSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
        this.error = 'Impossible de charger les sessions. Vérifiez que le backend est démarré.';
        this.loading = false;
      }
    });
  }

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
}
