import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { SessionsService } from '../../core/services/sessions.service';
import { SessionEditComponent } from './session-edit';

describe('SessionEditComponent', () => {
  let component: SessionEditComponent;
  let fixture: ComponentFixture<SessionEditComponent>;
  let mockSessionsService: Partial<SessionsService>;
  let mockAuthService: Partial<AuthService>;
  let mockRouter: Partial<Router>;

  const mockSession = {
    id: '1',
    game: 'D&D 5e',
    title: 'Test Session',
    description: 'Test desc',
    date: '2024-12-25T18:00:00.000Z',
    online: false,
    level: 'OPEN',
    playersMax: 5,
    playersCurrent: 2,
    tagColor: 'BLUE',
    hostId: 'user123',
    locationId: 'loc1',
    host: { id: 'user123', username: 'TestUser', avatar: null },
    location: {
      id: 'loc1',
      name: 'Test Location',
      city: 'Brussels',
      type: 'BAR',
    },
    reservations: [],
  };

  const mockUser = {
    id: 'user123',
    username: 'TestUser',
    email: 'test@test.com',
  };

  beforeEach(async () => {
    mockSessionsService = {
      getSession: jest.fn().mockReturnValue(of(mockSession)),
      updateSession: jest.fn().mockReturnValue(of(mockSession)),
      getSessions: jest.fn().mockReturnValue(of([mockSession])),
    };
    mockAuthService = {
      isAuthenticated: jest.fn().mockReturnValue(true),
      getCurrentUser: jest.fn().mockReturnValue(mockUser),
    };
    mockRouter = { navigate: jest.fn(), url: '/sessions/1/edit' };

    await TestBed.configureTestingModule({
      imports: [SessionEditComponent, ReactiveFormsModule, MatIconModule],
      providers: [
        { provide: SessionsService, useValue: mockSessionsService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: jest.fn().mockReturnValue('1') } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionEditComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load session on init', () => {
    fixture.detectChanges();
    expect(mockSessionsService.getSession).toHaveBeenCalledWith('1');
    expect(component.loading).toBe(false);
  });

  it('should pre-fill form', () => {
    fixture.detectChanges();
    expect(component.sessionForm.value.game).toBe('D&D 5e');
    expect(component.sessionForm.value.title).toBe('Test Session');
  });

  it('should validate form', () => {
    fixture.detectChanges();
    component.sessionForm.patchValue({ game: '', title: '' });
    expect(component.sessionForm.invalid).toBe(true);
  });

  it('should call updateSession on submit', () => {
    fixture.detectChanges();
    jest.spyOn(window, 'alert').mockImplementation(() => undefined);
    component.onSubmit();
    expect(mockSessionsService.updateSession).toHaveBeenCalled();
  });

  it('should navigate on cancel', () => {
    fixture.detectChanges();
    component.cancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/sessions', '1']);
  });
});
