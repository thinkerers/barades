import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppLayout } from './app-layout';
import { AuthService } from '../services/auth.service';

describe('AppLayout', () => {
  let component: AppLayout;
  let fixture: ComponentFixture<AppLayout>;
  let mockAuthService: Partial<AuthService>;
  
  beforeEach(async () => {
    mockAuthService = {
      isAuthenticated: jest.fn().mockReturnValue(false),
      getCurrentUser: jest.fn().mockReturnValue(null),
      logout: jest.fn()
    } as Partial<AuthService>;

    await TestBed.configureTestingModule({
      imports: [AppLayout, RouterModule.forRoot([])],
      providers: [
        provideHttpClient(),
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
