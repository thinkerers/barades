import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UsersService } from '../../core/services/users.service';
import { ProfilePage } from './profile-page';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  let mockAuthService: Partial<AuthService>;
  let mockUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const mockProfile = {
      id: '1',
      email: 'alice@example.com',
      username: 'alice_dm',
      firstName: 'Alice',
      lastName: 'Dupont',
      bio: 'Passionate about D&D',
      avatar: null,
      skillLevel: 'INTERMEDIATE' as const,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };

    mockAuthService = {
      isAuthenticated: jest.fn().mockReturnValue(true),
      logout: jest.fn(),
    };

    mockUsersService = {
      getMyProfile: jest.fn().mockReturnValue(of(mockProfile)),
      updateMyProfile: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProfilePage, RouterModule.forRoot([]), NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data from API on init', () => {
    expect(mockUsersService.getMyProfile).toHaveBeenCalled();
    expect(component.user).toBeTruthy();
    expect(component.user?.username).toBe('alice_dm');
    expect(component.user?.email).toBe('alice@example.com');
  });

  it('should populate form with user data', () => {
    expect(component.profileForm.get('username')?.value).toBe('alice_dm');
    expect(component.profileForm.get('email')?.value).toBe('alice@example.com');
    expect(component.profileForm.get('firstName')?.value).toBe('Alice');
    expect(component.profileForm.get('lastName')?.value).toBe('Dupont');
    expect(component.profileForm.get('skillLevel')?.value).toBe('INTERMEDIATE');
  });

  it('should toggle edit mode', () => {
    expect(component.isEditing).toBe(false);

    component.toggleEdit();
    expect(component.isEditing).toBe(true);

    component.toggleEdit();
    expect(component.isEditing).toBe(false);
    // Should reload profile when cancelling edit
    expect(mockUsersService.getMyProfile).toHaveBeenCalledTimes(2);
  });

  it('should get user initials correctly', () => {
    expect(component.getInitials()).toBe('AD');
  });

  it('should call logout when logout button is clicked', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should redirect to login if user is not authenticated', () => {
    const mockRouter = { navigate: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component['router'] = mockRouter as any;
    mockAuthService.isAuthenticated = jest.fn().mockReturnValue(false);

    component.ngOnInit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
