import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TopBar } from './top-bar';

describe('TopBar', () => {
  let component: TopBar;
  let fixture: ComponentFixture<TopBar>;
  let mockAuthService: Partial<AuthService>;

  beforeEach(async () => {
    mockAuthService = {
      isAuthenticated: jest.fn().mockReturnValue(false),
      getCurrentUser: jest.fn().mockReturnValue(null),
      logout: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TopBar, RouterModule.forRoot([])],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TopBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
