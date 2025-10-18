import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { GroupsService } from '../../core/services/groups.service';
import { GroupsListComponent } from './groups-list';

describe('GroupsListComponent', () => {
  let component: GroupsListComponent;
  let fixture: ComponentFixture<GroupsListComponent>;
  let groupsService: GroupsService;
  let router: Router;

  const mockGroups = [
    {
      id: '1',
      name: 'Brussels Adventurers Guild',
      description: 'A competitive group for experienced players',
      playstyle: 'COMPETITIVE' as const,
      isRecruiting: true,
      isPublic: true,
      maxMembers: 10,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
      creatorId: '1',
      currentUserIsMember: false,
      creator: {
        id: '1',
        username: 'alice_dm',
        avatar: 'https://i.pravatar.cc/150?img=1',
      },
      _count: {
        members: 5,
      },
    },
  ];

  const authServiceMock = {
    getCurrentUserId: jest.fn(),
    getCurrentUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    authServiceMock.getCurrentUserId.mockReturnValue(null);
    authServiceMock.getCurrentUser.mockReturnValue(null);

    await TestBed.configureTestingModule({
      imports: [GroupsListComponent, HttpClientTestingModule],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupsListComponent);
    component = fixture.componentInstance;
    groupsService = TestBed.inject(GroupsService);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load groups on init', () => {
    jest.spyOn(groupsService, 'getGroups').mockReturnValue(of(mockGroups));
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();

    expect(component.groups).toEqual(mockGroups);
    expect(component.loading).toBe(false);
  });

  it('should handle error when loading groups fails', () => {
    jest
      .spyOn(groupsService, 'getGroups')
      .mockReturnValue(throwError(() => new Error('Failed to load')));

    fixture.detectChanges();

    expect(component.error).toBe(component.defaultErrorMessage);
    expect(component.loading).toBe(false);
  });

  it('should surface friendly message for 404 errors', () => {
    jest
      .spyOn(groupsService, 'getGroups')
      .mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 404 }))
      );

    fixture.detectChanges();

    expect(component.error).toBe('Aucun groupe disponible pour le moment.');
  });

  it('should auto retry after transient server errors', () => {
    jest.useFakeTimers();

    const getGroupsSpy = jest.spyOn(groupsService, 'getGroups');
    getGroupsSpy
      .mockReturnValueOnce(
        throwError(() => new HttpErrorResponse({ status: 503 }))
      )
      .mockReturnValue(of(mockGroups));

    try {
      fixture.detectChanges();

      expect(component.error).toContain(
        'Nos serveurs sont momentanément indisponibles'
      );
      expect(component.autoRetrySeconds).toBeGreaterThan(0);

      jest.advanceTimersByTime(15000);

      expect(getGroupsSpy).toHaveBeenCalledTimes(2);
      expect(component.error).toBeNull();
      expect(component.groups).toEqual(mockGroups);
    } finally {
      jest.useRealTimers();
    }
  });

  it('should retry loading groups', () => {
    const spy = jest
      .spyOn(groupsService, 'getGroups')
      .mockReturnValue(of(mockGroups));

    component.retry();

    expect(spy).toHaveBeenCalled();
  });

  it('should navigate to group detail when primary action triggered', async () => {
    jest.spyOn(groupsService, 'getGroups').mockReturnValue(of(mockGroups));
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();

    component.viewGroupDetails('1');

    expect(navigateSpy).toHaveBeenCalledWith(['/groups', '1']);
  });

  it('should request to join a group and update local state on success', () => {
    const joinResponse = {
      joined: true,
      groupId: '1',
      memberCount: 6,
      maxMembers: 10,
      isRecruiting: true,
    } as const;

    jest.spyOn(groupsService, 'joinGroup').mockReturnValue(of(joinResponse));
    authServiceMock.getCurrentUserId.mockReturnValue('member-123');
    authServiceMock.getCurrentUser.mockReturnValue({
      id: 'member-123',
      email: 'member@example.com',
      username: 'member123',
    });

    component.groups = mockGroups.map((group) => ({ ...group }));

    const targetGroup = component.groups[0];

    component.requestToJoin(targetGroup);

    expect(groupsService.joinGroup).toHaveBeenCalledWith('1');
    expect(component.hasJoined('1')).toBe(true);
    expect(component.isRecentlyJoined('1')).toBe(true);
    expect(component.isJoining('1')).toBe(false);
    expect(component.groups[0]._count?.members).toBe(6);
    expect(component.groups[0].isRecruiting).toBe(true);
    expect(component.groups[0].currentUserIsMember).toBe(true);
    expect(
      component.groups[0].members?.some(
        (member) => member.userId === 'member-123'
      )
    ).toBe(true);
  });

  it('should capture error when join request fails', () => {
    jest
      .spyOn(groupsService, 'joinGroup')
      .mockReturnValue(throwError(() => new Error('Failed')));

    component.groups = [...mockGroups];

    component.requestToJoin(mockGroups[0]);

    expect(component.isJoining('1')).toBe(false);
    expect(component.hasJoined('1')).toBe(false);
    expect(component.getJoinError('1')).toBe(
      'Impossible de rejoindre le groupe pour le moment.'
    );
  });

  it('should mark groups as joined when user is already a member', () => {
    const memberGroup = {
      ...mockGroups[0],
      id: '2',
      currentUserIsMember: true,
      members: [
        {
          userId: 'user-current',
          user: {
            id: 'user-current',
            username: 'current_user',
            avatar: null,
          },
        },
      ],
    };

    authServiceMock.getCurrentUserId.mockReturnValue('user-current');
    jest.spyOn(groupsService, 'getGroups').mockReturnValue(of([memberGroup]));

    fixture.detectChanges();

    expect(component.hasJoined('2')).toBe(true);
    expect(component.isJoining('2')).toBe(false);
  });
});
