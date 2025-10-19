import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, Directive, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  ParamMap,
  Router,
} from '@angular/router';
import { AsyncStateComponent } from '@org/ui';
import { of } from 'rxjs';
import { SessionsService } from '../../core/services/sessions.service';
import { HomePage } from './home-page';

/* eslint-disable @angular-eslint/directive-selector, @angular-eslint/component-selector */
@Component({
  selector: 'mat-form-field',
  standalone: true,
  template: '<ng-content></ng-content>',
})
class MatFormFieldStub {}

@Directive({
  selector: '[matInput]',
  standalone: true,
})
class MatInputStub {}

@Directive({
  selector: '[matAutocomplete]',
  standalone: true,
})
class MatAutocompleteTriggerStub {
  @Input('matAutocomplete') autocomplete: unknown;
}

@Component({
  selector: 'mat-autocomplete',
  standalone: true,
  exportAs: 'matAutocomplete',
  template: '<ng-content></ng-content>',
})
class MatAutocompleteStub {}

@Component({
  selector: 'mat-option',
  standalone: true,
  template: '<ng-content></ng-content>',
})
class MatOptionStub {
  @Input() value: unknown;
}

@Component({
  selector: 'mat-label',
  standalone: true,
  template: '<ng-content></ng-content>',
})
class MatLabelStub {}

@Directive({
  selector: '[matPrefix]',
  standalone: true,
})
class MatPrefixStub {}

@Component({
  selector: 'mat-icon',
  standalone: true,
  template: '<ng-content></ng-content>',
})
class MatIconStub {}

@Directive({
  selector: '[mat-raised-button]',
  standalone: true,
})
class MatRaisedButtonStub {}

@Directive({
  selector: '[mat-stroked-button]',
  standalone: true,
})
class MatStrokedButtonStub {}

@Component({
  selector: 'lib-async-state',
  standalone: true,
  template: `
    <div
      class="async-state-stub"
      [attr.data-status]="status"
      [attr.data-loading-message]="loadingMessage ?? ''"
      [attr.data-error-message]="errorMessage ?? ''"
      [attr.data-empty-message]="emptyMessage ?? ''"
    >
      <ng-content></ng-content>
    </div>
  `,
})
class AsyncStateStubComponent {
  @Input() status = 'ready';
  @Input() loadingMessage?: string;
  @Input() errorMessage?: string;
  @Input() emptyMessage?: string;
}
/* eslint-enable @angular-eslint/directive-selector, @angular-eslint/component-selector */

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let mockSessionsService: jest.Mocked<SessionsService>;
  const routerMock = {
    navigate: jest.fn().mockResolvedValue(true),
    navigateByUrl: jest.fn().mockResolvedValue(true),
    createUrlTree: jest.fn(),
    serializeUrl: jest.fn((url) => (typeof url === 'string' ? url : '/')),
    events: of(),
    url: '/',
  };

  const paramMapStub: ParamMap = {
    keys: [],
    get: () => null,
    getAll: () => [],
    has: () => false,
  };

  const activatedRouteSnapshotStub: Partial<ActivatedRouteSnapshot> = {
    paramMap: paramMapStub,
    queryParamMap: paramMapStub,
    url: [],
    params: {},
    queryParams: {},
    fragment: null,
    data: {},
    outlet: 'primary',
    component: null,
    routeConfig: null,
    root: undefined as unknown as ActivatedRouteSnapshot,
    parent: null,
    firstChild: null,
    children: [],
    pathFromRoot: [],
    title: undefined,
    toString: () => 'ActivatedRouteSnapshotStub',
  };

  const activatedRouteStub = {
    snapshot: activatedRouteSnapshotStub as ActivatedRouteSnapshot,
    url: of([]),
    params: of({}),
    queryParams: of({}),
    fragment: of(null),
    data: of({}),
    outlet: 'primary',
    component: null,
    routeConfig: null,
    root: undefined,
    parent: null,
    firstChild: null,
    children: [],
    pathFromRoot: [],
    toString: () => 'ActivatedRouteStub',
  } as unknown as ActivatedRoute;

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
    routerMock.navigate.mockClear();
    routerMock.navigateByUrl.mockClear();

    TestBed.configureTestingModule({
      imports: [HomePage, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SessionsService, useValue: mockSessionsService },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
      ],
    });

    TestBed.overrideComponent(HomePage, {
      remove: {
        imports: [
          MatAutocompleteModule,
          MatFormFieldModule,
          MatInputModule,
          MatIconModule,
          MatButtonModule,
          AsyncStateComponent,
        ],
      },
      add: {
        imports: [
          MatFormFieldStub,
          MatInputStub,
          MatAutocompleteTriggerStub,
          MatAutocompleteStub,
          MatOptionStub,
          MatLabelStub,
          MatPrefixStub,
          MatIconStub,
          MatRaisedButtonStub,
          MatStrokedButtonStub,
          AsyncStateStubComponent,
        ],
      },
    });

    await TestBed.compileComponents();

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

  it('should filter games based on input', () => {
    const filtered = (
      component as unknown as {
        _filterGames(value: string): string[];
      }
    )._filterGames('Dungeons');

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered[0]).toContain('Dungeons');
  });

  it('should filter cities based on input', () => {
    const filtered = (
      component as unknown as {
        _filterCities(value: string): string[];
      }
    )._filterCities('Brux');

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.some((city) => city.toLowerCase().includes('brux'))).toBe(
      true
    );
  });

  it('should navigate on search', () => {
    routerMock.navigate.mockResolvedValue(true);
    component.gameControl.setValue('D&D', { emitEvent: false });
    component.cityControl.setValue('Brussels', { emitEvent: false });

    component.onSearch();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/sessions'], {
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
    // Create a fresh fixture without running ngOnInit
    const freshFixture = TestBed.createComponent(HomePage);
    const freshComponent = freshFixture.componentInstance;
    jest
      .spyOn(freshComponent, 'loadFeaturedSessions')
      .mockImplementation(() => {
        /* intentionally blank for zoneless test */
      });

    // Set state before first detectChanges
    freshComponent.loading = true;
    freshComponent.error = null;
    freshComponent.featuredSessions = [];

    // Now run change detection
    freshFixture.detectChanges();

    const compiled = freshFixture.nativeElement as HTMLElement;
    const asyncState = compiled.querySelector(
      '.async-state-stub'
    ) as HTMLElement | null;
    expect(asyncState).toBeTruthy();
    expect(asyncState?.getAttribute('data-status')).toBe('loading');
    expect(asyncState?.getAttribute('data-loading-message')).toContain(
      'Chargement des sessions...'
    );
  });

  it('should display error state when session loading fails', () => {
    // Create a fresh fixture without running ngOnInit
    const freshFixture = TestBed.createComponent(HomePage);
    const freshComponent = freshFixture.componentInstance;
    jest
      .spyOn(freshComponent, 'loadFeaturedSessions')
      .mockImplementation(() => {
        /* intentionally blank for zoneless test */
      });

    // Set state before first detectChanges
    freshComponent.loading = false;
    freshComponent.error = 'Test error message';
    freshComponent.featuredSessions = [];

    // Now run change detection
    freshFixture.detectChanges();

    const compiled = freshFixture.nativeElement as HTMLElement;
    const asyncState = compiled.querySelector(
      '.async-state-stub'
    ) as HTMLElement | null;
    expect(asyncState).toBeTruthy();
    expect(asyncState?.getAttribute('data-status')).toBe('error');
    expect(asyncState?.getAttribute('data-error-message')).toContain(
      'Test error message'
    );
  });
});
