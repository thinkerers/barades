import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Session, SessionsService } from '../../core/services/sessions.service';
import { SessionCardComponent } from './session-card';
import { SessionsListPage } from './sessions-list';

describe('SessionsListPage', () => {
  let component: SessionsListPage;
  let fixture: ComponentFixture<SessionsListPage>;
  let mockSessionsService: jest.Mocked<SessionsService>;

  const mockAuthService = {
    getCurrentUser: jest
      .fn()
      .mockReturnValue({ id: 'user-1', username: 'TestUser' }),
    isAuthenticated: jest.fn().mockReturnValue(true),
  };

  const mockSessions: Session[] = [
    {
      id: '1',
      game: 'Dungeons & Dragons 5e',
      title: 'Les Mines de Phandelver',
      description: "Une aventure épique pour débutants dans l'univers de D&D",
      date: '2025-10-20T18:00:00.000Z',
      recurrenceRule: null,
      recurrenceEndDate: null,
      online: false,
      level: 'BEGINNER',
      playersMax: 5,
      playersCurrent: 3,
      tagColor: 'GREEN',
      createdAt: '2025-10-01T00:00:00.000Z',
      updatedAt: '2025-10-01T00:00:00.000Z',
      hostId: 'host-1',
      locationId: 'loc-1',
      host: {
        id: 'host-1',
        username: 'GameMaster42',
        avatar: null,
      },
      location: {
        id: 'loc-1',
        name: 'Brussels Game Store',
        city: 'Brussels',
        type: 'GAME_STORE',
        lat: 50.8476,
        lon: 4.3572,
      },
    },
    {
      id: '2',
      game: 'Pathfinder 2e',
      title: 'La Quête du Dragon',
      description: 'Pour joueurs expérimentés cherchant un défi',
      date: '2025-10-21T19:00:00.000Z',
      recurrenceRule: null,
      recurrenceEndDate: null,
      online: true,
      level: 'ADVANCED',
      playersMax: 4,
      playersCurrent: 4,
      tagColor: 'RED',
      createdAt: '2025-10-02T00:00:00.000Z',
      updatedAt: '2025-10-02T00:00:00.000Z',
      hostId: 'host-2',
      locationId: null,
      host: {
        id: 'host-2',
        username: 'DragonMaster',
        avatar: null,
      },
      location: undefined,
    },
    {
      id: '3',
      game: 'Call of Cthulhu',
      title: "Les Ombres d'Innsmouth",
      description: 'Horreur et mystère au rendez-vous',
      date: '2025-10-22T20:00:00.000Z',
      recurrenceRule: null,
      recurrenceEndDate: null,
      online: false,
      level: 'INTERMEDIATE',
      playersMax: 6,
      playersCurrent: 2,
      tagColor: 'PURPLE',
      createdAt: '2025-10-03T00:00:00.000Z',
      updatedAt: '2025-10-03T00:00:00.000Z',
      hostId: 'host-3',
      locationId: 'loc-2',
      host: {
        id: 'host-3',
        username: 'CthulhuKeeper',
        avatar: null,
      },
      location: {
        id: 'loc-2',
        name: 'Antwerp RPG Club',
        city: 'Antwerp',
        type: 'ASSOCIATION',
        lat: 51.2194,
        lon: 4.4025,
      },
    },
    {
      id: '4',
      game: 'Dungeons & Dragons 5e',
      title: 'Campagne des Royaumes Oubliés',
      description: null,
      date: '2025-10-23T18:30:00.000Z',
      recurrenceRule: 'WEEKLY',
      recurrenceEndDate: '2025-12-31T00:00:00.000Z',
      online: true,
      level: 'OPEN',
      playersMax: 5,
      playersCurrent: 1,
      tagColor: 'BLUE',
      createdAt: '2025-10-04T00:00:00.000Z',
      updatedAt: '2025-10-04T00:00:00.000Z',
      hostId: 'host-1',
      locationId: null,
      host: {
        id: 'host-1',
        username: 'GameMaster42',
        avatar: null,
      },
      location: undefined,
    },
  ];

  beforeEach(async () => {
    mockSessionsService = {
      getSessions: jest.fn(),
      getSession: jest.fn(),
      createSession: jest.fn(),
      updateSession: jest.fn(),
      deleteSession: jest.fn(),
      getSessionsHostedByMe: jest.fn(),
      invalidateSessionsCache: jest.fn(),
      getCachedSessionsSnapshot: jest.fn().mockReturnValue(null),
      getCachedHostedSessionsSnapshot: jest.fn().mockReturnValue(null),
    } as unknown as jest.Mocked<SessionsService>;

    await TestBed.configureTestingModule({
      imports: [SessionsListPage, SessionCardComponent, FormsModule],
      providers: [
        { provide: SessionsService, useValue: mockSessionsService },
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionsListPage);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default filter values', () => {
      expect(component.searchTerm()).toBe('');
      expect(component.sessionType()).toBe('all');
      expect(component.selectedGameSystem()).toBe('');
      expect(component.onlyAvailable()).toBe(false);
    });

    it('should load sessions on init', async () => {
      mockSessionsService.getSessions.mockReturnValue(of(mockSessions));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(mockSessionsService.getSessions).toHaveBeenCalled();
      expect(component.sessions()).toEqual(mockSessions);
      expect(component.filteredSessions()).toEqual(mockSessions);
    });

    it('should populate game systems from sessions', async () => {
      mockSessionsService.getSessions.mockReturnValue(of(mockSessions));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.gameSystems()).toContain('Dungeons & Dragons 5e');
      expect(component.gameSystems()).toContain('Pathfinder 2e');
      expect(component.gameSystems()).toContain('Call of Cthulhu');
      expect(component.gameSystems().length).toBe(3);
    });

    it('should populate host options from sessions', async () => {
      mockSessionsService.getSessions.mockReturnValue(of(mockSessions));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.hostOptions()).toEqual([
        'CthulhuKeeper',
        'DragonMaster',
        'GameMaster42',
      ]);
    });

    it('should handle loading state', async () => {
      mockSessionsService.getSessions.mockReturnValue(of(mockSessions));
      // Loading starts as false and only becomes true when no cache is available
      expect(component.loading()).toBe(false);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.loading()).toBe(false);
    });

    it('should hydrate immediately when cached sessions are available', async () => {
      mockSessionsService.getCachedSessionsSnapshot.mockReturnValue(
        mockSessions
      );
      mockSessionsService.getSessions.mockReturnValue(of(mockSessions));

      fixture.detectChanges();

      // Cached data is rendered right away without the loading spinner
      expect(component.sessions()).toEqual(mockSessions);
      expect(component.loading()).toBe(false);

      await fixture.whenStable();
      expect(component.refreshing()).toBe(false);
    });

    it('should handle error state', async () => {
      const error = new Error('Failed to load sessions');
      mockSessionsService.getSessions.mockReturnValue(throwError(() => error));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe(
        'Impossible de charger les sessions. Vérifiez que le backend est démarré.'
      );
    });

    it('should keep cached data visible when refresh fails', async () => {
      mockSessionsService.getCachedSessionsSnapshot.mockReturnValue(
        mockSessions
      );
      mockSessionsService.getSessions.mockReturnValue(
        throwError(() => new Error('Network down'))
      );

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.sessions()).toEqual(mockSessions);
      expect(component.error()).toBeNull();
      expect(component.loading()).toBe(false);
      expect(component.refreshing()).toBe(false);
    });
  });

  describe('Search Filter', () => {
    beforeEach(async () => {
      mockSessionsService.getSessions.mockReturnValue(of(mockSessions));
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should filter by title (case insensitive)', () => {
      component.searchTerm.set('quête');
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(1);
      expect(component.filteredSessions()[0].id).toBe('2');
    });

    it('should filter by game name', () => {
      component.searchTerm.set('pathfinder');
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(1);
      expect(component.filteredSessions()[0].id).toBe('2');
    });

    it('should filter by description', () => {
      component.searchTerm.set('horreur');
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(1);
      expect(component.filteredSessions()[0].id).toBe('3');
    });

    it('should return all sessions when search term is empty', () => {
      component.searchTerm.set('');
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(4);
    });

    it('should return empty array when no matches found', () => {
      component.searchTerm.set('nonexistent game');
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(0);
    });

    it('should handle sessions with null description', () => {
      component.searchTerm.set('royaumes');
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(1);
      expect(component.filteredSessions()[0].id).toBe('4');
    });

    it('should trim search term', () => {
      component.searchTerm.set('  quête  ');
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(1);
      expect(component.filteredSessions()[0].id).toBe('2');
    });
  });

  describe('Session Type Filter', () => {
    beforeEach(async () => {
      mockSessionsService.getSessions.mockReturnValue(of(mockSessions));
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should show all sessions when type is "all"', () => {
      component.sessionType.set('all');
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(4);
    });

    it('should filter online sessions', () => {
      component.sessionType.set('online');
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(2);
      expect(component.filteredSessions().every((s) => s.online)).toBe(true);
    });

    it('should filter on-site sessions', () => {
      component.sessionType.set('onsite');
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(2);
      expect(component.filteredSessions().every((s) => !s.online)).toBe(true);
    });
  });

  describe('Game System Filter', () => {
    beforeEach(async () => {
      mockSessionsService.getSessions.mockReturnValue(of(mockSessions));
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should show all sessions when no game system selected', () => {
      component.selectedGameSystem.set('');
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(4);
    });

    it('should filter by selected game system', () => {
      component.selectedGameSystem.set('Dungeons & Dragons 5e');
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(2);
      expect(
        component
          .filteredSessions()
          .every((s) => s.game === 'Dungeons & Dragons 5e')
      ).toBe(true);
    });

    it('should filter by Pathfinder', () => {
      component.selectedGameSystem.set('Pathfinder 2e');
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(1);
      expect(component.filteredSessions()[0].id).toBe('2');
    });

    it('should filter by Call of Cthulhu', () => {
      component.selectedGameSystem.set('Call of Cthulhu');
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(1);
      expect(component.filteredSessions()[0].id).toBe('3');
    });

    it('should filter sessions using fuzzy match when input has typos', () => {
      component.selectedGameSystem.set('dungeon and dragon');
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(2);
      expect(
        component
          .filteredSessions()
          .every((s) => s.game === 'Dungeons & Dragons 5e')
      ).toBe(true);
    });
  });

  describe('Availability Filter', () => {
    beforeEach(async () => {
      mockSessionsService.getSessions.mockReturnValue(of(mockSessions));
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should show all sessions when availability filter is off', () => {
      component.onlyAvailable.set(false);
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(4);
    });

    it('should filter only available sessions', () => {
      component.onlyAvailable.set(true);
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(3);
      expect(
        component
          .filteredSessions()
          .every((s) => s.playersCurrent < s.playersMax)
      ).toBe(true);
    });

    it('should exclude full sessions', () => {
      component.onlyAvailable.set(true);
      component.applyFilters();
      const fullSession = component
        .filteredSessions()
        .find((s) => s.id === '2');
      expect(fullSession).toBeUndefined();
    });
  });

  describe('Combined Filters', () => {
    beforeEach(async () => {
      mockSessionsService.getSessions.mockReturnValue(of(mockSessions));
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should apply search + type filters together', () => {
      component.searchTerm.set('royaumes');
      component.sessionType.set('online');
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(1);
      expect(component.filteredSessions()[0].id).toBe('4');
    });

    it('should apply search + game system filters together', () => {
      component.searchTerm.set('mines');
      component.selectedGameSystem.set('Dungeons & Dragons 5e');
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(1);
      expect(component.filteredSessions()[0].id).toBe('1');
    });

    it('should apply type + availability filters together', () => {
      component.sessionType.set('online');
      component.onlyAvailable.set(true);
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(1);
      expect(component.filteredSessions()[0].id).toBe('4');
    });

    it('should apply all filters together', () => {
      component.searchTerm.set('campagne');
      component.sessionType.set('online');
      component.selectedGameSystem.set('Dungeons & Dragons 5e');
      component.onlyAvailable.set(true);
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(1);
      expect(component.filteredSessions()[0].id).toBe('4');
    });

    it('should return empty when combined filters match nothing', () => {
      component.searchTerm.set('pathfinder');
      component.sessionType.set('onsite');
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(0);
    });

    it('should handle all restrictive filters at once', () => {
      component.searchTerm.set('dragon');
      component.sessionType.set('online');
      component.selectedGameSystem.set('Dungeons & Dragons 5e');
      component.onlyAvailable.set(true);
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(1);
      expect(component.filteredSessions()[0].id).toBe('4');
    });
  });

  describe('Host Filter', () => {
    beforeEach(async () => {
      mockSessionsService.getSessions.mockReturnValue(of(mockSessions));
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should filter sessions by full host name', () => {
      component.onHostFilterChange('GameMaster42');
      expect(component.filteredSessions().length).toBe(2);
      expect(
        component
          .filteredSessions()
          .every((s) => s.host?.username === 'GameMaster42')
      ).toBe(true);
    });

    it('should support partial host matches', () => {
      component.onHostFilterChange('dragon');
      expect(component.filteredSessions().length).toBe(1);
      expect(component.filteredSessions()[0].host?.username).toBe(
        'DragonMaster'
      );
    });

    it('should clear host filter when requested', () => {
      component.onHostFilterChange('GameMaster42');
      component.clearHostFilter();
      expect(component.selectedHost()).toBe('');
      expect(component.filteredSessions().length).toBe(4);
    });
  });

  describe('Reset Filters', () => {
    beforeEach(async () => {
      mockSessionsService.getSessions.mockReturnValue(of(mockSessions));
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should reset all filter values', () => {
      component.searchTerm.set('dragon');
      component.sessionType.set('online');
      component.selectedGameSystem.set('Pathfinder 2e');
      component.onlyAvailable.set(true);
      component.selectedHost.set('GameMaster42');

      component.resetFilters();

      expect(component.searchTerm()).toBe('');
      expect(component.sessionType()).toBe('all');
      expect(component.selectedGameSystem()).toBe('');
      expect(component.onlyAvailable()).toBe(false);
      expect(component.selectedHost()).toBe('');
    });

    it('should restore all sessions after reset', () => {
      component.searchTerm.set('nonexistent');
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(0);

      component.resetFilters();
      expect(component.filteredSessions().length).toBe(4);
    });

    it('should call applyFilters after reset', () => {
      const spy = jest.spyOn(component, 'applyFilters');
      component.resetFilters();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Active Filters Count', () => {
    beforeEach(async () => {
      mockSessionsService.getSessions.mockReturnValue(of(mockSessions));
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should return 0 when no filters active', () => {
      expect(component.activeFiltersCount()).toBe(0);
    });

    it('should count search term as active filter', () => {
      component.searchTerm.set('dragon');
      expect(component.activeFiltersCount()).toBe(1);
    });

    it('should count online type as active filter', () => {
      component.sessionType.set('online');
      expect(component.activeFiltersCount()).toBe(1);
    });

    it('should count onsite type as active filter', () => {
      component.sessionType.set('onsite');
      expect(component.activeFiltersCount()).toBe(1);
    });

    it('should not count "all" type as active filter', () => {
      component.sessionType.set('all');
      expect(component.activeFiltersCount()).toBe(0);
    });

    it('should count game system as active filter', () => {
      component.selectedGameSystem.set('Pathfinder 2e');
      expect(component.activeFiltersCount()).toBe(1);
    });

    it('should count availability as active filter', () => {
      component.onlyAvailable.set(true);
      expect(component.activeFiltersCount()).toBe(1);
    });

    it('should count host selection as active filter', () => {
      component.selectedHost.set('GameMaster42');
      expect(component.activeFiltersCount()).toBe(1);
    });

    it('should count multiple active filters', () => {
      component.searchTerm.set('dragon');
      component.sessionType.set('online');
      component.selectedGameSystem.set('Dungeons & Dragons 5e');
      component.onlyAvailable.set(true);
      expect(component.activeFiltersCount()).toBe(4);
    });

    it('should handle whitespace-only search term as inactive', () => {
      component.searchTerm.set('   ');
      expect(component.activeFiltersCount()).toBe(0);
    });
  });

  describe('UI Integration', () => {
    beforeEach(async () => {
      mockSessionsService.getSessions.mockReturnValue(of(mockSessions));
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should display loading state', () => {
      component.loading.set(true);
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Chargement des sessions');
    });

    it('should display error message', () => {
      component.loading.set(false);
      component.error.set('Test error');
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Test error');
    });

    it('should display correct results count', () => {
      component.searchTerm.set('quête');
      component.applyFilters();
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('(1 / 4)');
    });

    it('should display empty state when no results', () => {
      component.searchTerm.set('nonexistent');
      component.applyFilters();
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Aucune session ne correspond');
    });

    it('should render session cards for filtered results', () => {
      fixture.detectChanges();
      const cards = fixture.nativeElement.querySelectorAll('app-session-card');
      expect(cards.length).toBe(4);
    });

    it('should update cards when filters change', () => {
      component.searchTerm.set('quête');
      component.applyFilters();
      fixture.detectChanges();
      const cards = fixture.nativeElement.querySelectorAll('app-session-card');
      expect(cards.length).toBe(1);
    });

    it('should show active filters count badge', () => {
      component.searchTerm.set('dragon');
      component.sessionType.set('online');
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.filters-card__badge');
      expect(badge?.textContent?.trim()).toBe('2');
    });

    it('should disable reset button when no filters active', () => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector(
        '.filters-card__reset'
      ) as HTMLButtonElement | null;
      expect(button?.disabled).toBe(true);
    });

    it('should enable reset button when filters active', () => {
      component.searchTerm.set('dragon');
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector(
        '.filters-card__reset'
      ) as HTMLButtonElement | null;
      expect(button?.disabled).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty sessions array', async () => {
      mockSessionsService.getSessions.mockReturnValue(of([]));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.sessions()).toEqual([]);
      expect(component.filteredSessions()).toEqual([]);
      expect(component.gameSystems()).toEqual([]);
    });

    it('should handle sessions with duplicate game names', async () => {
      const duplicateSessions = [
        { ...mockSessions[0], id: '1' },
        { ...mockSessions[0], id: '2' },
      ];
      mockSessionsService.getSessions.mockReturnValue(of(duplicateSessions));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.gameSystems().length).toBe(1);
      expect(component.gameSystems()[0]).toBe('Dungeons & Dragons 5e');
    });

    it('should handle special characters in search', async () => {
      mockSessionsService.getSessions.mockReturnValue(of(mockSessions));
      fixture.detectChanges();
      await fixture.whenStable();
      component.searchTerm.set('D&D');
      component.applyFilters();
      expect(component.filteredSessions().length).toBeGreaterThan(0);
    });

    it('should handle very long search terms', async () => {
      mockSessionsService.getSessions.mockReturnValue(of(mockSessions));
      fixture.detectChanges();
      await fixture.whenStable();
      component.searchTerm.set('a'.repeat(1000));
      component.applyFilters();
      expect(component.filteredSessions().length).toBe(0);
    });
  });
});
