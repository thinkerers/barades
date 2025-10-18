import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { SessionsService } from '../../core/services/sessions.service';
import { HomePage } from './home-page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let mockSessionsService: jest.Mocked<SessionsService>;

  const mockSessions = [
    {
      id: 1,
      title: 'Test Session 1',
      description: 'Test description 1',
      game: 'D&D 5e',
      date: new Date('2024-11-15'),
      maxPlayers: 6,
      currentPlayers: 3,
      experienceLevel: 'BEGINNER',
      tagColor: 'BLUE',
      isOnline: false,
      host: { id: 1, username: 'Alice', email: 'alice@example.com' },
      location: {
        id: 1,
        name: 'Game Store',
        city: 'Brussels',
        address: '123 Main St',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      title: 'Test Session 2',
      description: 'Test description 2',
      game: 'Call of Cthulhu',
      date: new Date('2024-11-18'),
      maxPlayers: 5,
      currentPlayers: 4,
      experienceLevel: 'INTERMEDIATE',
      tagColor: 'RED',
      isOnline: true,
      host: { id: 2, username: 'Bob', email: 'bob@example.com' },
      location: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      title: 'Test Session 3',
      description: 'Test description 3',
      game: 'Pathfinder 2e',
      date: new Date('2024-11-20'),
      maxPlayers: 4,
      currentPlayers: 2,
      experienceLevel: 'OPEN',
      tagColor: 'GREEN',
      isOnline: false,
      host: { id: 3, username: 'Charlie', email: 'charlie@example.com' },
      location: { id: 2, name: 'Café', city: 'Liège', address: '456 Side St' },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    mockSessionsService = {
      getSessions: jest.fn().mockReturnValue(of(mockSessions)),
    } as unknown as jest.Mocked<SessionsService>;

    await TestBed.configureTestingModule({
      imports: [HomePage, RouterModule.forRoot([]), NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SessionsService, useValue: mockSessionsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render hero title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.hero__title');
    expect(title).toBeTruthy();
    expect(title?.textContent).toContain('Votre Prochaine Aventure');
  });

  it('should render search form with game and city fields', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const gameInput = compiled.querySelector('input[placeholder*="D&D"]');
    const cityInput = compiled.querySelector('input[placeholder*="Bruxelles"]');
    expect(gameInput).toBeTruthy();
    expect(cityInput).toBeTruthy();
  });

  it('should render search button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.search-button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Rechercher');
  });

  it('should load featured sessions on init', () => {
    expect(mockSessionsService.getSessions).toHaveBeenCalled();
    expect(component.featuredSessions.length).toBe(3);
    expect(component.loading).toBe(false);
  });

  it('should display featured sessions using SessionCard component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const sessionCards = compiled.querySelectorAll('app-session-card');
    expect(sessionCards.length).toBe(3);
  });

  it('should display session titles in SessionCard components', () => {
    expect(component.featuredSessions[0].title).toBe('Test Session 1');
    expect(component.featuredSessions[1].title).toBe('Test Session 2');
    expect(component.featuredSessions[2].title).toBe('Test Session 3');
  });

  it('should filter games based on input', (done) => {
    component.gameControl.setValue('Dungeons');

    component.filteredGames$.subscribe((games) => {
      expect(games.length).toBeGreaterThan(0);
      expect(games[0]).toContain('Dungeons');
      done();
    });
  });

  it('should filter cities based on input', (done) => {
    component.cityControl.setValue('Brux');

    component.filteredCities$.subscribe((cities) => {
      expect(cities.length).toBeGreaterThan(0);
      expect(cities.some((city) => city.toLowerCase().includes('brux'))).toBe(
        true
      );
      done();
    });
  });

  it('should navigate on search', () => {
    const navigateSpy = jest.spyOn(component['router'], 'navigate');
    component.gameControl.setValue('D&D');
    component.cityControl.setValue('Brussels');

    component.onSearch();

    expect(navigateSpy).toHaveBeenCalledWith(['/sessions'], {
      queryParams: {
        game: 'D&D',
        location: 'Brussels',
      },
    });
  });

  it('should display CTA section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const ctaTitle = compiled.querySelector('.cta-card__title');
    expect(ctaTitle).toBeTruthy();
    expect(ctaTitle?.textContent).toContain('Prêt à organiser');
  });

  it('should display loading state while fetching sessions', () => {
    component.loading = true;
    component.error = null;
    component.featuredSessions = [];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const spinner = compiled.querySelector('lib-loading-spinner');
    expect(spinner).toBeTruthy();
    expect(spinner?.textContent).toContain('Chargement des sessions...');
  });

  it('should display error state when session loading fails', () => {
    component.loading = false;
    component.error = 'Test error message';
    component.featuredSessions = [];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const errorMessage = compiled.querySelector(
      'lib-error-message .error-text'
    );
    expect(errorMessage).toBeTruthy();
    expect(errorMessage?.textContent).toContain('Test error message');
  });
});
