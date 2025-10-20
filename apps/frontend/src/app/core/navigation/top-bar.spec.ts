import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TopBar } from './top-bar';

describe('TopBar', () => {
  let component: TopBar;
  let fixture: ComponentFixture<TopBar>;
  let mockAuthService: Partial<AuthService>;
  let isAuthenticatedSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    mockAuthService = {
      isAuthenticated$: isAuthenticatedSubject.asObservable(),
      isAuthenticated: jest
        .fn()
        .mockImplementation(() => isAuthenticatedSubject.value),
      getCurrentUser: jest.fn().mockReturnValue(null),
      logout: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [TopBar, RouterModule.forRoot([]), NoopAnimationsModule],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TopBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
