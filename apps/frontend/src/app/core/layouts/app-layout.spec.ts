import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AppLayout } from './app-layout';

describe('AppLayout', () => {
  let component: AppLayout;
  let fixture: ComponentFixture<AppLayout>;
  let mockAuthService: Partial<AuthService>;

  beforeEach(async () => {
    const authState$ = new BehaviorSubject(false);

    mockAuthService = {
      isAuthenticated: jest.fn().mockImplementation(() => authState$.value),
      isAuthenticated$: authState$.asObservable(),
      getCurrentUser: jest.fn().mockReturnValue(null),
      logout: jest.fn(),
    } as Partial<AuthService>;

    await TestBed.configureTestingModule({
      imports: [AppLayout, RouterTestingModule.withRoutes([])],
      providers: [
        provideHttpClient(),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
