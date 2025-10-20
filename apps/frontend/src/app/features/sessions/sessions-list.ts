import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  PendingTasks,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AsyncStateComponent,
  AsyncStateStatus,
  EmptyStateComponent,
  SessionsFiltersCard,
  SessionsScopeBanner,
  findClosestMatches,
} from '@org/ui';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Session, SessionsService } from '../../core/services/sessions.service';
import { SessionCardComponent } from './session-card';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    SessionCardComponent,
    EmptyStateComponent,
    AsyncStateComponent,
    SessionsScopeBanner,
    SessionsFiltersCard,
  ],
  selector: 'app-sessions-list',
  templateUrl: './sessions-list.html',
  styleUrl: './sessions-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsListPage {
  private readonly sessionsService = inject(SessionsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly pendingTasks = inject(PendingTasks);
  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  @ViewChild('scopeBanner')
  scopeBanner?: SessionsScopeBanner;

  readonly sessions = signal<Session[]>([]);
  readonly filteredSessions = signal<Session[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly defaultErrorMessage =
    'Impossible de charger les sessions. Vérifiez que le backend est démarré.';
  readonly gameSuggestionThreshold = 0.55;
  readonly maxGameSuggestions = 5;
  readonly minGameSuggestionLength = 3;

  readonly filterMode = signal<'all' | 'my-hosted'>('all');
  readonly comingFromDashboard = signal<boolean>(false);
  private readonly hostFilterValue =
    this.authService.getCurrentUser()?.username ?? null;
  readonly hostOptions = signal<string[]>([]);
  readonly filteredHostOptions = signal<string[]>([]);

  // Filter properties
  readonly searchTerm = signal('');
  readonly sessionType = signal<'all' | 'online' | 'onsite'>('all');
  readonly selectedGameSystem = signal('');
  readonly onlyAvailable = signal(false);
  readonly selectedHost = signal('');

  readonly gameSystems = signal<string[]>([]);

  readonly sessionsState = computed<AsyncStateStatus>(() => {
    if (this.loading()) {
      return 'loading';
    }

    if (this.error()) {
      return 'error';
    }

    return 'ready';
  });

  readonly isScopeFilterActive = computed(
    () => this.filterMode() === 'my-hosted'
  );

  readonly pageTitle = computed(() =>
    this.isScopeFilterActive() ? 'Mes sessions créées' : 'Sessions de jeu'
  );

  readonly pageSubtitle = computed(() =>
    this.isScopeFilterActive()
      ? 'Retrouvez rapidement les parties que vous organisez.'
      : 'Découvrez les parties organisées près de chez vous ou en ligne'
  );

  readonly scopeBannerMessage = computed(() =>
    this.isScopeFilterActive()
      ? 'Vous consultez uniquement les sessions que vous organisez.'
      : ''
  );

  readonly activeFiltersCount = computed(() => {
    let count = 0;

    if (this.searchTerm().trim()) count++;
    if (this.sessionType() !== 'all') count++;
    if (this.selectedGameSystem()) count++;
    if (this.onlyAvailable()) count++;
    if (this.selectedHost().trim()) count++;

    return count;
  });

  private readonly syncFiltersWithQueryParams = effect(() => {
    const params = this.queryParamMap();
    if (!params) {
      return;
    }

    const filterParam = params.get('filter');
    const fromParam = params.get('from');
    const nextMode = filterParam === 'my-hosted' ? 'my-hosted' : 'all';
    const shouldReload =
      this.filterMode() !== nextMode || this.sessions().length === 0;

    this.filterMode.set(nextMode);
    this.comingFromDashboard.set(fromParam === 'dashboard');

    if (shouldReload) {
      void this.loadSessions();
    }
  });

  private async loadSessions(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    const source$ =
      this.filterMode() === 'my-hosted'
        ? this.sessionsService.getSessionsHostedByMe()
        : this.sessionsService.getSessions();

    await this.pendingTasks.run(async () => {
      try {
        const sessions = await firstValueFrom(source$);
        this.sessions.set(sessions);
        this.filteredSessions.set([...sessions]);
        this.gameSystems.set([...new Set(sessions.map((s) => s.game))].sort());
        this.hostOptions.set(this.buildHostOptions(sessions));

        if (this.isScopeFilterActive() && this.hostFilterValue) {
          this.selectedHost.set(this.hostFilterValue);
        } else if (!this.isScopeFilterActive()) {
          this.ensureHostSelectionIsValid();
        }

        this.filteredHostOptions.set(
          this.filterHostSuggestions(this.selectedHost())
        );

        // Apply filters if any are already set
        this.applyFilters();

        if (
          this.isScopeFilterActive() &&
          this.comingFromDashboard() &&
          typeof window !== 'undefined'
        ) {
          window.requestAnimationFrame(() => {
            this.scopeBanner?.focus();
          });
        }
      } catch (err) {
        console.error('Error loading sessions:', err);
        this.error.set(this.defaultErrorMessage);
      } finally {
        this.loading.set(false);
      }
    });
  }

  /**
   * Apply all filters to the sessions list
   */
  applyFilters(): void {
    const resolvedGameFilter = this.resolveGameFilter(
      this.selectedGameSystem()
    );
    const onlyAvailable = this.onlyAvailable();
    const sessionType = this.sessionType();
    const searchTerm = this.searchTerm().trim();
    const selectedHost = this.selectedHost().trim();

    const filtered = this.sessions().filter((session) => {
      // Search filter (title, game, description)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          session.title.toLowerCase().includes(term) ||
          session.game.toLowerCase().includes(term) ||
          (session.description &&
            session.description.toLowerCase().includes(term));

        if (!matchesSearch) return false;
      }

      // Session type filter (online/onsite/all)
      if (sessionType === 'online' && !session.online) {
        return false;
      }
      if (sessionType === 'onsite' && session.online) {
        return false;
      }

      // Game system filter
      if (resolvedGameFilter && session.game !== resolvedGameFilter) {
        return false;
      }

      // Availability filter (only sessions with available spots)
      if (onlyAvailable && session.playersCurrent >= session.playersMax) {
        return false;
      }

      // Host filter (optional combobox)
      if (selectedHost) {
        const hostName = session.host?.username ?? '';
        if (!hostName) {
          return false;
        }

        if (!hostName.toLowerCase().includes(selectedHost.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
    this.filteredSessions.set(filtered);
  }

  onSearchTermChange(term: string): void {
    this.searchTerm.set(term ?? '');
    this.applyFilters();
  }

  onHostFilterFocus(): void {
    this.onHostFilterChange(this.selectedHost());
  }

  onAvailabilityChange(onlyAvailable: boolean): void {
    this.onlyAvailable.set(!!onlyAvailable);
    this.applyFilters();
  }

  clearScopeFilter(): void {
    if (!this.isScopeFilterActive()) {
      return;
    }

    this.selectedHost.set('');
    this.filteredHostOptions.set([...this.hostOptions()]);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { filter: null, from: null },
      queryParamsHandling: 'merge',
    });
  }

  returnToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Reset all filters to default values
   */
  resetFilters(): void {
    this.searchTerm.set('');
    this.sessionType.set('all');
    this.selectedGameSystem.set('');
    this.onlyAvailable.set(false);
    this.selectedHost.set('');
    this.filteredHostOptions.set([...this.hostOptions()]);

    if (this.isScopeFilterActive()) {
      this.clearScopeFilter();
      return;
    }

    this.applyFilters();
  }

  /**
   * Handle session type change from radio group
   */
  onSessionTypeChange(value: string): void {
    this.sessionType.set(value as 'all' | 'online' | 'onsite');
    this.applyFilters();
  }

  onHostFilterChange(value: string | null): void {
    this.selectedHost.set(value ?? '');
    this.filteredHostOptions.set(
      this.filterHostSuggestions(this.selectedHost())
    );

    if (!this.selectedHost().trim() && this.isScopeFilterActive()) {
      this.clearScopeFilter();
      return;
    }

    this.applyFilters();
  }

  onHostOptionSelected(value: string): void {
    this.selectedHost.set(value ?? '');
    this.filteredHostOptions.set(
      this.filterHostSuggestions(this.selectedHost())
    );
    this.applyFilters();
  }

  clearHostFilter(): void {
    if (this.isScopeFilterActive()) {
      this.clearScopeFilter();
      return;
    }

    if (!this.selectedHost().trim()) {
      return;
    }

    this.selectedHost.set('');
    this.filteredHostOptions.set([...this.hostOptions()]);
    this.applyFilters();
  }

  onGameFilterChange(value: string | null): void {
    this.selectedGameSystem.set(value ?? '');
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
    const selectedHost = this.selectedHost().trim();
    if (!selectedHost) {
      this.filteredHostOptions.set([...this.hostOptions()]);
      return;
    }

    const current = selectedHost.toLowerCase();
    const match = this.hostOptions().some(
      (host) => host.toLowerCase() === current
    );

    if (!match) {
      this.selectedHost.set('');
      this.filteredHostOptions.set([...this.hostOptions()]);
    }
  }

  private filterHostSuggestions(query: string): string[] {
    const term = query.trim().toLowerCase();
    if (!term) {
      return [...this.hostOptions()];
    }

    return this.hostOptions().filter((host) =>
      host.toLowerCase().includes(term)
    );
  }

  private resolveGameFilter(input: string): string | null {
    const trimmed = input.trim();
    if (!trimmed) {
      return null;
    }

    const gameSystems = this.gameSystems();
    const exactMatch = gameSystems.find(
      (game) => game.toLowerCase() === trimmed.toLowerCase()
    );

    if (exactMatch) {
      return exactMatch;
    }

    const [bestMatch] = findClosestMatches(
      trimmed,
      gameSystems,
      this.gameSuggestionThreshold,
      1
    );

    return bestMatch?.value ?? trimmed;
  }
}
