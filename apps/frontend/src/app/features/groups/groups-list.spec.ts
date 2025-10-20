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
  const routerMock = {
    navigate: jest.fn().mockResolvedValue(true),
    navigateByUrl: jest.fn().mockResolvedValue(true),
    createUrlTree: jest.fn(),
    events: of(),
    url: '/',
  };

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
    isAuthenticated: jest.fn(),
  };

  const flushMicrotasks = async () => {
    await Promise.resolve();
    await Promise.resolve();
  };

  const flushPendingTimersAndMicrotasks = async () => {
    let iterations = 0;
    const maxIterations = 100;

    while (iterations < maxIterations) {
      const beforeCount =
        typeof jest.getTimerCount === 'function'
          ? jest.getTimerCount()
          : undefined;

      if (beforeCount && beforeCount > 0) {
        jest.runOnlyPendingTimers();
      }

      await flushMicrotasks();

      const afterCount =
        typeof jest.getTimerCount === 'function'
          ? jest.getTimerCount()
          : undefined;

      if (
        (beforeCount === 0 || beforeCount === undefined) &&
        (afterCount === 0 || afterCount === undefined)
      ) {
        break;
      }

      iterations += 1;
    }

    await flushMicrotasks();
  };

  const detectChangesAsync = async (): Promise<void> => {
    fixture.detectChanges();
    await flushMicrotasks();
    fixture.detectChanges();
    await flushMicrotasks();
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    routerMock.navigate.mockClear();
    routerMock.navigateByUrl.mockClear();
    authServiceMock.getCurrentUserId.mockReturnValue(null);
    authServiceMock.getCurrentUser.mockReturnValue(null);
    authServiceMock.isAuthenticated.mockReturnValue(false);

    await TestBed.configureTestingModule({
      imports: [GroupsListComponent, HttpClientTestingModule],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupsListComponent);
    component = fixture.componentInstance;
    groupsService = TestBed.inject(GroupsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load groups on init', async () => {
    jest.spyOn(groupsService, 'getGroups').mockReturnValue(of(mockGroups));
    routerMock.navigate.mockResolvedValue(true);

    await detectChangesAsync();

    expect(component.groups()).toEqual(mockGroups);
    expect(component.loading()).toBe(false);
  });

  it('should handle error when loading groups fails', async () => {
    jest
      .spyOn(groupsService, 'getGroups')
      .mockReturnValue(throwError(() => new Error('Failed to load')));

    await detectChangesAsync();

    expect(component.error()).toBe(component.defaultErrorMessage);
    expect(component.loading()).toBe(false);
  });

  it('should surface friendly message for 404 errors', async () => {
    jest
      .spyOn(groupsService, 'getGroups')
      .mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 404 }))
      );

    await detectChangesAsync();

    expect(component.error()).toBe('Aucun groupe disponible pour le moment.');
  });

  it('should show offline message when network request fails', async () => {
    jest
      .spyOn(groupsService, 'getGroups')
      .mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));

    await detectChangesAsync();

    expect(component.error()).toBe(
      'Erreur de connexion. Vérifiez votre réseau puis réessayez.'
    );
    expect(component.isOffline()).toBe(true);
  });

  it('should auto retry after transient server errors', async () => {
    jest.useFakeTimers();

    const getGroupsSpy = jest.spyOn(groupsService, 'getGroups');
    getGroupsSpy
      .mockReturnValueOnce(
        throwError(() => new HttpErrorResponse({ status: 503 }))
      )
      .mockReturnValue(of(mockGroups));

    try {
      await detectChangesAsync();

      expect(component.error()).toContain(
        'Nos serveurs sont momentanément indisponibles'
      );
      expect(component.autoRetrySeconds()).toBeGreaterThan(0);

      let safetyCounter = 0;
      while (component.autoRetrySeconds() !== null && safetyCounter < 25) {
        jest.advanceTimersByTime(1000);
        await flushPendingTimersAndMicrotasks();
        safetyCounter += 1;
      }

      await flushPendingTimersAndMicrotasks();
      await detectChangesAsync();

      expect(getGroupsSpy).toHaveBeenCalledTimes(2);
      expect(component.error()).toBeNull();
      expect(component.groups()).toEqual(mockGroups);
    } finally {
      jest.runOnlyPendingTimers();
      jest.clearAllTimers();
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
    routerMock.navigate.mockResolvedValue(true);

    await detectChangesAsync();

    component.viewGroupDetails('1');

    await flushMicrotasks();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/groups', '1']);
  });

  it('should request to join a group and update local state on success', async () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
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

    component.groups.set(mockGroups.map((group) => ({ ...group })));
    const [targetGroup] = component.groups();

    await component.requestToJoin(targetGroup);

    expect(groupsService.joinGroup).toHaveBeenCalledWith('1');
    expect(component.hasJoined('1')).toBe(true);
    expect(component.isRecentlyJoined('1')).toBe(true);
    expect(component.isJoining('1')).toBe(false);
    const updatedGroup = component.groups()[0];

    expect(updatedGroup._count?.members).toBe(6);
    expect(updatedGroup.isRecruiting).toBe(true);
    expect(updatedGroup.currentUserIsMember).toBe(true);
    expect(
      updatedGroup.members?.some((member) => member.userId === 'member-123')
    ).toBe(true);
  });

  it('should capture error when join request fails', async () => {
    jest
      .spyOn(groupsService, 'joinGroup')
      .mockReturnValue(throwError(() => new Error('Failed')));

    component.groups.set([...mockGroups]);
    authServiceMock.isAuthenticated.mockReturnValue(true);

    const [targetGroup] = component.groups();

    await component.requestToJoin(targetGroup);

    expect(component.isJoining('1')).toBe(false);
    expect(component.hasJoined('1')).toBe(false);
    expect(component.getJoinError('1')).toBe(
      'Impossible de rejoindre le groupe pour le moment.'
    );
  });

  it('should mark groups as joined when user is already a member', async () => {
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

    await detectChangesAsync();

    expect(component.hasJoined('2')).toBe(true);
    expect(component.isJoining('2')).toBe(false);
  });

  it('should redirect to login when requesting to join while unauthenticated', async () => {
    const group = { ...mockGroups[0] };
    routerMock.navigate.mockResolvedValue(true);
    const joinSpy = jest.spyOn(groupsService, 'joinGroup');

    await component.requestToJoin(group);

    expect(joinSpy).not.toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: `/groups/${group.id}?autoJoin=1` },
    });
  });
});
