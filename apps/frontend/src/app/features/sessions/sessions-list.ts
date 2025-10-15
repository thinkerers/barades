import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SessionsService, Session } from '../../core/services/sessions.service';
import { SessionCardComponent } from './session-card';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SessionCardComponent],
  selector: 'app-sessions-list',
  templateUrl: './sessions-list.html',
  styleUrl: './sessions-list.css',
})
export class SessionsListPage implements OnInit {
  private readonly sessionsService = inject(SessionsService);
  
  sessions: Session[] = [];
  filteredSessions: Session[] = [];
  loading = true;
  error: string | null = null;

  // Filter properties
  searchTerm = '';
  sessionType: 'all' | 'online' | 'onsite' = 'all';
  selectedGameSystem = '';
  onlyAvailable = false;

  // Unique game systems for dropdown
  gameSystems: string[] = [];

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    this.error = null;
    
    this.sessionsService.getSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.filteredSessions = [...sessions];
        
        // Extract unique game systems for dropdown
        this.gameSystems = [...new Set(sessions.map(s => s.game))].sort();
        
        this.loading = false;
        
        // Apply filters if any are already set
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
        this.error = 'Impossible de charger les sessions. Vérifiez que le backend est démarré.';
        this.loading = false;
      }
    });
  }

  /**
   * Apply all filters to the sessions list
   */
  applyFilters(): void {
    this.filteredSessions = this.sessions.filter(session => {
      // Search filter (title, game, description)
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        const matchesSearch = 
          session.title.toLowerCase().includes(term) ||
          session.game.toLowerCase().includes(term) ||
          (session.description && session.description.toLowerCase().includes(term));
        
        if (!matchesSearch) return false;
      }

      // Session type filter (online/onsite/all)
      if (this.sessionType === 'online' && !session.online) {
        return false;
      }
      if (this.sessionType === 'onsite' && session.online) {
        return false;
      }

      // Game system filter
      if (this.selectedGameSystem && session.game !== this.selectedGameSystem) {
        return false;
      }

      // Availability filter (only sessions with available spots)
      if (this.onlyAvailable && session.playersCurrent >= session.playersMax) {
        return false;
      }

      return true;
    });
  }

  /**
   * Reset all filters to default values
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.sessionType = 'all';
    this.selectedGameSystem = '';
    this.onlyAvailable = false;
    this.applyFilters();
  }

  /**
   * Get the count of active filters
   */
  getActiveFiltersCount(): number {
    let count = 0;
    
    if (this.searchTerm) count++;
    if (this.sessionType !== 'all') count++;
    if (this.selectedGameSystem) count++;
    if (this.onlyAvailable) count++;
    
    return count;
  }
}
