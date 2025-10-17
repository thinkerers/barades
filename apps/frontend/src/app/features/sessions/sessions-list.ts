import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  EmptyStateComponent,
  ErrorMessageComponent,
  LoadingSpinnerComponent,
  RadioGroupComponent,
  RadioOption,
  SearchInputComponent,
} from '@org/ui';
import { Session, SessionsService } from '../../core/services/sessions.service';
import { SessionCardComponent } from './session-card';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    SessionCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorMessageComponent,
    SearchInputComponent,
    RadioGroupComponent,
  ],
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

  // Radio options for session type filter
  sessionTypeOptions: RadioOption[] = [
    { value: 'all', label: 'Toutes', icon: '📋' },
    { value: 'online', label: 'En ligne', icon: '💻' },
    { value: 'onsite', label: 'Sur table', icon: '🎲' },
  ];

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
        this.gameSystems = [...new Set(sessions.map((s) => s.game))].sort();

        this.loading = false;

        // Apply filters if any are already set
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
        this.error =
          'Impossible de charger les sessions. Vérifiez que le backend est démarré.';
        this.loading = false;
      },
    });
  }

  /**
   * Apply all filters to the sessions list
   */
  applyFilters(): void {
    this.filteredSessions = this.sessions.filter((session) => {
      // Search filter (title, game, description)
      const trimmedSearch = this.searchTerm.trim();
      if (trimmedSearch) {
        const term = trimmedSearch.toLowerCase();
        const matchesSearch =
          session.title.toLowerCase().includes(term) ||
          session.game.toLowerCase().includes(term) ||
          (session.description &&
            session.description.toLowerCase().includes(term));

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
   * Handle session type change from radio group
   */
  onSessionTypeChange(value: string): void {
    this.sessionType = value as 'all' | 'online' | 'onsite';
    this.applyFilters();
  }

  /**
   * Get the count of active filters
   */
  getActiveFiltersCount(): number {
    let count = 0;

    if (this.searchTerm.trim()) count++;
    if (this.sessionType !== 'all') count++;
    if (this.selectedGameSystem) count++;
    if (this.onlyAvailable) count++;

    return count;
  }
}
