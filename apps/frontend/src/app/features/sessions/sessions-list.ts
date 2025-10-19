import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AsyncStateComponent,
  AsyncStateStatus,
  EmptyStateComponent,
  GameSystemInputComponent,
  SessionsScopeBanner,
  findClosestMatches,
} from '@org/ui';
import { AuthService } from '../../core/services/auth.service';
import { Session, SessionsService } from '../../core/services/sessions.service';
import { SessionCardComponent } from './session-card';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    SessionCardComponent,
    EmptyStateComponent,
    AsyncStateComponent,
    GameSystemInputComponent,
    SessionsScopeBanner,
  ],
  selector: 'app-sessions-list',
  templateUrl: './sessions-list.html',
  styleUrl: './sessions-list.css',
})
export class SessionsListPage implements OnInit {
  private readonly sessionsService = inject(SessionsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);

  @ViewChild('scopeBanner')
  scopeBanner?: SessionsScopeBanner;

  sessions: Session[] = [];
  filteredSessions: Session[] = [];
  loading = true;
  error: string | null = null;
  readonly defaultErrorMessage =
    'Impossible de charger les sessions. Vérifiez que le backend est démarré.';
  readonly gameSuggestionThreshold = 0.55;
  readonly maxGameSuggestions = 5;
  readonly minGameSuggestionLength = 3;

  filterMode: 'all' | 'my-hosted' = 'all';
  comingFromDashboard = false;
  private readonly hostFilterValue =
    this.authService.getCurrentUser()?.username ?? null;
  hostOptions: string[] = [];
  filteredHostOptions: string[] = [];

  // Filter properties
  searchTerm = '';
  sessionType: 'all' | 'online' | 'onsite' = 'all';
  selectedGameSystem = '';
  onlyAvailable = false;
  selectedHost = '';

  gameSystems: string[] = [];

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const filterParam = params.get('filter');
        const fromParam = params.get('from');
        const nextMode = filterParam === 'my-hosted' ? 'my-hosted' : 'all';
        const shouldReload =
          this.filterMode !== nextMode || this.sessions.length === 0;

        this.filterMode = nextMode;
        this.comingFromDashboard = fromParam === 'dashboard';

        if (shouldReload) {
          this.loadSessions();
        }
      });
  }

  loadSessions(): void {
    this.loading = true;
    this.error = null;

    const source$ =
      this.filterMode === 'my-hosted'
        ? this.sessionsService.getSessionsHostedByMe()
        : this.sessionsService.getSessions();

    source$.subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.filteredSessions = [...sessions];
        this.gameSystems = [...new Set(sessions.map((s) => s.game))].sort();
        this.hostOptions = this.buildHostOptions(sessions);

        if (this.isScopeFilterActive && this.hostFilterValue) {
          this.selectedHost = this.hostFilterValue;
        } else if (!this.isScopeFilterActive) {
          this.ensureHostSelectionIsValid();
        }

        this.filteredHostOptions = this.filterHostSuggestions(
          this.selectedHost
        );

        this.loading = false;

        // Apply filters if any are already set
        this.applyFilters();

        // Move focus to banner for accessibility when coming from dashboard
        if (this.isScopeFilterActive && this.comingFromDashboard) {
          setTimeout(() => {
            this.scopeBanner?.focus();
          }, 100);
        }
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
        this.error = this.defaultErrorMessage;
        this.loading = false;
      },
    });
  }

  get sessionsState(): AsyncStateStatus {
    if (this.loading) {
      return 'loading';
    }

    if (this.error) {
      return 'error';
    }

    return 'ready';
  }

  /**
   * Apply all filters to the sessions list
   */
  applyFilters(): void {
    const resolvedGameFilter = this.resolveGameFilter(this.selectedGameSystem);

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
      if (resolvedGameFilter && session.game !== resolvedGameFilter) {
        return false;
      }

      // Availability filter (only sessions with available spots)
      if (this.onlyAvailable && session.playersCurrent >= session.playersMax) {
        return false;
      }

      // Host filter (optional combobox)
      const trimmedHost = this.selectedHost.trim();
      if (trimmedHost) {
        const hostName = session.host?.username ?? '';
        if (!hostName) {
          return false;
        }

        if (!hostName.toLowerCase().includes(trimmedHost.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }

  get isScopeFilterActive(): boolean {
    return this.filterMode === 'my-hosted';
  }

  clearScopeFilter(): void {
    if (!this.isScopeFilterActive) {
      return;
    }

    this.selectedHost = '';
    this.filteredHostOptions = [...this.hostOptions];

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { filter: null, from: null },
      queryParamsHandling: 'merge',
    });
  }

  returnToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  get pageTitle(): string {
    return this.isScopeFilterActive ? 'Mes sessions créées' : 'Sessions de jeu';
  }

  get pageSubtitle(): string {
    if (this.isScopeFilterActive) {
      return 'Retrouvez rapidement les parties que vous organisez.';
    }

    return 'Découvrez les parties organisées près de chez vous ou en ligne';
  }

  get scopeBannerMessage(): string {
    return this.isScopeFilterActive
      ? 'Vous consultez uniquement les sessions que vous organisez.'
      : '';
  }

  /**
   * Reset all filters to default values
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.sessionType = 'all';
    this.selectedGameSystem = '';
    this.onlyAvailable = false;
    this.selectedHost = '';
    this.filteredHostOptions = [...this.hostOptions];

    if (this.isScopeFilterActive) {
      this.clearScopeFilter();
      return;
    }

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
    if (this.selectedHost.trim()) count++;

    return count;
  }

  onHostFilterChange(value: string): void {
    this.selectedHost = value ?? '';
    this.filteredHostOptions = this.filterHostSuggestions(this.selectedHost);

    if (!this.selectedHost.trim() && this.isScopeFilterActive) {
      this.clearScopeFilter();
      return;
    }

    this.applyFilters();
  }

  onHostOptionSelected(value: string): void {
    this.selectedHost = value ?? '';
    this.filteredHostOptions = this.filterHostSuggestions(this.selectedHost);
    this.applyFilters();
  }

  clearHostFilter(): void {
    if (this.isScopeFilterActive) {
      this.clearScopeFilter();
      return;
    }

    if (!this.selectedHost.trim()) {
      return;
    }

    this.selectedHost = '';
    this.filteredHostOptions = [...this.hostOptions];
    this.applyFilters();
  }

  onGameFilterChange(value: string): void {
    this.selectedGameSystem = value ?? '';
    this.applyFilters();
  }

  private buildHostOptions(sessions: Session[]): string[] {
    const uniqueHosts = new Set<string>();

    for (const session of sessions) {
      const hostName = session.host?.username?.trim();
      if (hostName) {
        uniqueHosts.add(hostName);
      }
    }

    return Array.from(uniqueHosts).sort((a, b) =>
      a.localeCompare(b, 'fr', {
        sensitivity: 'accent',
        ignorePunctuation: true,
      })
    );
  }

  private ensureHostSelectionIsValid(): void {
    if (!this.selectedHost.trim()) {
      this.filteredHostOptions = [...this.hostOptions];
      return;
    }

    const current = this.selectedHost.trim().toLowerCase();
    const match = this.hostOptions.some(
      (host) => host.toLowerCase() === current
    );

    if (!match) {
      this.selectedHost = '';
      this.filteredHostOptions = [...this.hostOptions];
    }
  }

  private filterHostSuggestions(query: string): string[] {
    const term = query.trim().toLowerCase();
    if (!term) {
      return [...this.hostOptions];
    }

    return this.hostOptions.filter((host) => host.toLowerCase().includes(term));
  }

  private resolveGameFilter(input: string): string | null {
    const trimmed = input.trim();
    if (!trimmed) {
      return null;
    }

    const exactMatch = this.gameSystems.find(
      (game) => game.toLowerCase() === trimmed.toLowerCase()
    );

    if (exactMatch) {
      return exactMatch;
    }

    const [bestMatch] = findClosestMatches(
      trimmed,
      this.gameSystems,
      this.gameSuggestionThreshold,
      1
    );

    return bestMatch?.value ?? trimmed;
  }
}
