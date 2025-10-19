import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Directive, HostListener, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  ParamMap,
  Router,
  RouterLink,
} from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { GroupsService } from '../../core/services/groups.service';
import { PollsService } from '../../core/services/polls.service';
import { GroupDetailComponent } from './group-detail';

/* eslint-disable @angular-eslint/directive-selector */
@Directive({
  selector: '[routerLink]',
  standalone: true,
})
class RouterLinkStubDirective {
  @Input('routerLink') linkParams: unknown;
  @Input() queryParams: unknown;
  navigatedTo: unknown = null;

  @HostListener('click')
  onClick(): void {
    this.navigatedTo = this.linkParams;
  }
}
/* eslint-enable @angular-eslint/directive-selector */

describe('GroupDetailComponent', () => {
  let component: GroupDetailComponent;
  let fixture: ComponentFixture<GroupDetailComponent>;
  let groupsService: GroupsService;
  let pollsService: PollsService;
  let authService: AuthService;
  let getCurrentUserIdSpy: jest.SpyInstance;
  let getCurrentUserSpy: jest.SpyInstance;
  let getGroupSpy: jest.SpyInstance;
  let getPollsSpy: jest.SpyInstance;
  let routeParamMapGet: jest.Mock;
  let routeQueryParamMapGet: jest.Mock;
  let routeQueryParamMapHas: jest.Mock;
  let isAuthenticatedSpy: jest.SpyInstance;
  type MockGroup = typeof mockGroup;
  type MockGroupMember = MockGroup['members'][number];
  const readGroup = () => component.group() as MockGroup | null;
  const writeGroup = (value: MockGroup | null) =>
    component.group.set(value as MockGroup | null);
  const setIsMember = (value: boolean) => component.isMember.set(value);
  const routerMock = {
    navigate: jest.fn().mockResolvedValue(true),
    navigateByUrl: jest.fn().mockResolvedValue(true),
    createUrlTree: jest.fn(),
    serializeUrl: jest.fn((url) => (typeof url === 'string' ? url : '/')),
    events: of(),
    url: '/',
  };

  const buildActivatedRouteStub = (
    paramGet: jest.Mock,
    queryParamGet: jest.Mock,
    queryParamHas: jest.Mock
  ): ActivatedRoute => {
    const paramMapStub: ParamMap = {
      keys: [],
      get: (key: string) => paramGet(key),
      getAll: () => [],
      has: () => false,
    };

    const queryParamMapStub: ParamMap = {
      keys: [],
      get: (key: string) => queryParamGet(key),
      getAll: () => [],
      has: (key: string) => queryParamHas(key),
    };

    const snapshotStub: Partial<ActivatedRouteSnapshot> = {
      paramMap: paramMapStub,
      queryParamMap: queryParamMapStub,
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

    return {
      snapshot: snapshotStub as ActivatedRouteSnapshot,
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
  };

  const mockGroup = {
    id: '1',
    name: 'Test Group',
    description: 'A test group description',
    playstyle: 'COMPETITIVE' as const,
    isRecruiting: true,
    isPublic: true,
    maxMembers: 10,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    creatorId: 'user-1',
    currentUserIsMember: true,
    creator: {
      id: 'user-1',
      username: 'test_user',
      avatar: null,
    },
    _count: {
      members: 5,
    },
    members: [
      {
        userId: 'user-1',
        user: {
          id: 'user-1',
          username: 'member1',
          avatar: null,
        },
        joinedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        userId: 'user-2',
        user: {
          id: 'user-2',
          username: 'member2',
          avatar: 'https://avatar.com/2',
        },
        joinedAt: '2025-01-02T00:00:00.000Z',
      },
    ],
    sessions: [
      {
        id: 's1',
        title: 'Test Session',
        scheduledFor: '2025-02-01T14:00:00.000Z',
        location: {
          id: 'l1',
          name: 'Test Location',
        },
        _count: {
          reservations: 3,
        },
      },
    ],
  };

  const nonMemberGroup = {
    ...mockGroup,
    currentUserIsMember: false,
  };

  const joinableGroup = {
    ...nonMemberGroup,
  };

  beforeEach(async () => {
    routeParamMapGet = jest.fn().mockImplementation(() => '1');
    routeQueryParamMapGet = jest.fn().mockReturnValue(null);
    routeQueryParamMapHas = jest.fn().mockReturnValue(false);

    routerMock.navigate.mockClear();
    routerMock.navigateByUrl.mockClear();

    const activatedRouteStub = buildActivatedRouteStub(
      routeParamMapGet,
      routeQueryParamMapGet,
      routeQueryParamMapHas
    );

    TestBed.configureTestingModule({
      imports: [GroupDetailComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        { provide: Router, useValue: routerMock },
      ],
    });

    TestBed.overrideComponent(GroupDetailComponent, {
      remove: { imports: [RouterLink] },
      add: { imports: [RouterLinkStubDirective] },
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(GroupDetailComponent);
    component = fixture.componentInstance;
    groupsService = TestBed.inject(GroupsService);
    pollsService = TestBed.inject(PollsService);
    authService = TestBed.inject(AuthService);

    getGroupSpy = jest.spyOn(groupsService, 'getGroup');
    getGroupSpy.mockReturnValue(of(nonMemberGroup));

    // Mock polls service by default
    getPollsSpy = jest.spyOn(pollsService, 'getPolls').mockReturnValue(of([]));

    // Mock auth service by default (user not authenticated)
    getCurrentUserIdSpy = jest
      .spyOn(authService, 'getCurrentUserId')
      .mockReturnValue(null);
    getCurrentUserSpy = jest
      .spyOn(authService, 'getCurrentUser')
      .mockReturnValue(null);
    isAuthenticatedSpy = jest
      .spyOn(authService, 'isAuthenticated')
      .mockReturnValue(false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load group on init with valid id', () => {
      getGroupSpy.mockReturnValue(of(mockGroup));

      fixture.detectChanges();

      expect(getGroupSpy).toHaveBeenCalledWith('1');
      expect(component.group()).toEqual(mockGroup);
      expect(component.loading()).toBe(false);
      expect(getPollsSpy).toHaveBeenCalledWith('1');
    });

    it('should handle error when loading group fails', () => {
      getGroupSpy.mockReturnValue(
        throwError(() => new Error('Failed to load'))
      );

      fixture.detectChanges();

      expect(component.error()).toBe(component.defaultErrorMessage);
      expect(component.loading()).toBe(false);
    });

    it('should display specific message for 404 errors', () => {
      getGroupSpy.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 404 }))
      );

      fixture.detectChanges();

      expect(component.error()).toBe(
        'Ce groupe est introuvable ou n’existe plus.'
      );
    });

    it('should schedule auto retry for transient server issues', () => {
      jest.useFakeTimers();

      getGroupSpy
        .mockReturnValueOnce(
          throwError(() => new HttpErrorResponse({ status: 503 }))
        )
        .mockReturnValue(of(mockGroup));

      try {
        fixture.detectChanges();

        expect(component.error()).toContain(
          'Nos serveurs sont momentanément indisponibles'
        );
        expect(component.autoRetrySeconds()).toBeGreaterThan(0);

        jest.advanceTimersByTime(15000);

        expect(getGroupSpy).toHaveBeenCalledTimes(2);
        expect(component.group()).toEqual(mockGroup);
        expect(component.error()).toBeNull();
        expect(component.autoRetrySeconds()).toBeNull();
        expect(getPollsSpy).toHaveBeenCalledTimes(1);
        expect(getPollsSpy).toHaveBeenCalledWith('1');
      } finally {
        jest.useRealTimers();
      }
    });

    it('should detect offline state and show offline message', () => {
      const originalDescriptor = Object.getOwnPropertyDescriptor(
        Navigator.prototype,
        'onLine'
      );

      Object.defineProperty(Navigator.prototype, 'onLine', {
        configurable: true,
        get: () => false,
      });

      getGroupSpy.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 0 }))
      );

      fixture.detectChanges();

      expect(component.isOffline()).toBe(true);
      expect(component.error()).toBe(
        'Connexion perdue. Vérifiez votre réseau puis réessayez.'
      );

      if (originalDescriptor) {
        Object.defineProperty(
          Navigator.prototype,
          'onLine',
          originalDescriptor
        );
      }
    });

    it('should set error when id is missing', () => {
      routeParamMapGet.mockReturnValueOnce(null);

      component.ngOnInit();

      expect(component.error()).toBe('ID de groupe invalide');
      expect(component.loading()).toBe(false);
    });
  });

  describe('Playstyle helpers', () => {
    it('should return correct playstyle labels', () => {
      expect(component.getPlaystyleLabel('COMPETITIVE')).toBe('Compétitif');
      expect(component.getPlaystyleLabel('CASUAL')).toBe('Décontracté');
      expect(component.getPlaystyleLabel('STORY_DRIVEN')).toBe('Narratif');
      expect(component.getPlaystyleLabel('SANDBOX')).toBe('Bac à sable');
    });

    it('should return correct playstyle colors', () => {
      expect(component.getPlaystyleColor('COMPETITIVE')).toBe('red');
      expect(component.getPlaystyleColor('CASUAL')).toBe('green');
      expect(component.getPlaystyleColor('STORY_DRIVEN')).toBe('purple');
      expect(component.getPlaystyleColor('SANDBOX')).toBe('blue');
    });
  });

  describe('Member management', () => {
    beforeEach(() => {
      getGroupSpy.mockReturnValueOnce(of(mockGroup));
      fixture.detectChanges();
    });

    it('should get member count from members array', () => {
      expect(component.getMemberCount()).toBe(2);
    });

    it('should get member count from _count when members is not available', () => {
      component.group.set({ ...mockGroup, members: undefined });
      expect(component.getMemberCount()).toBe(5);
    });

    it('should return 0 when no member data available', () => {
      component.group.set({
        ...mockGroup,
        members: undefined,
        _count: undefined,
      });
      expect(component.getMemberCount()).toBe(0);
    });

    it('should detect when group is full', () => {
      component.group.set({ ...mockGroup, maxMembers: 2 });
      expect(component.isFull()).toBe(true);
    });

    it('should detect when group is not full', () => {
      component.group.set({ ...mockGroup, maxMembers: 10 });
      expect(component.isFull()).toBe(false);
    });

    it('should return false for isFull when maxMembers is null', () => {
      component.group.set({ ...mockGroup, maxMembers: null });
      expect(component.isFull()).toBe(false);
    });
  });

  describe('Join functionality', () => {
    const mockCurrentUser = {
      id: 'user-3',
      username: 'new_member',
      email: 'new_member@example.com',
      firstName: 'New',
      lastName: 'Member',
    };

    beforeEach(() => {
      getGroupSpy.mockReturnValueOnce(of(joinableGroup));
      getCurrentUserIdSpy.mockReturnValue(mockCurrentUser.id);
      getCurrentUserSpy.mockReturnValue(mockCurrentUser);
      isAuthenticatedSpy.mockReturnValue(true);
      fixture.detectChanges();
    });

    it('should allow joining when recruiting and not full', () => {
      const currentGroup = readGroup();
      expect(currentGroup).toBeTruthy();
      if (!currentGroup) {
        throw new Error('Group should be defined');
      }
      writeGroup({
        ...currentGroup,
        isRecruiting: true,
        maxMembers: 10,
      });
      setIsMember(false);
      expect(component.canJoin()).toBe(true);
    });

    it('should not allow joining when not recruiting', () => {
      const currentGroup = readGroup();
      expect(currentGroup).toBeTruthy();
      if (!currentGroup) {
        throw new Error('Group should be defined');
      }
      writeGroup({ ...currentGroup, isRecruiting: false });
      expect(component.canJoin()).toBe(false);
    });

    it('should not allow joining when group is full', () => {
      const currentGroup = readGroup();
      expect(currentGroup).toBeTruthy();
      if (!currentGroup) {
        throw new Error('Group should be defined');
      }
      writeGroup({
        ...currentGroup,
        isRecruiting: true,
        maxMembers: 2,
      });
      expect(component.canJoin()).toBe(false);
    });

    it('should call joinGroup service and update state on success', async () => {
      const joinResponse = {
        joined: true,
        groupId: '1',
        memberCount: 6,
        maxMembers: 10,
        isRecruiting: true,
      };
      const joinSpy = jest
        .spyOn(groupsService, 'joinGroup')
        .mockReturnValue(of(joinResponse));

      setIsMember(false);
      await component.joinGroup();

      expect(joinSpy).toHaveBeenCalledWith('1');
      expect(component.joinInProgress()).toBe(false);
      expect(component.isMember()).toBe(true);
      expect(component.joinError()).toBeNull();
      const updatedGroup = readGroup();
      expect(updatedGroup).toBeTruthy();
      if (!updatedGroup) {
        throw new Error('Group should be defined');
      }
      expect(updatedGroup._count?.members).toBe(6);
      expect(updatedGroup.currentUserIsMember).toBe(true);
      const updatedMembers = (updatedGroup.members ?? []) as MockGroupMember[];
      expect(
        updatedMembers.some(
          (member: MockGroupMember) => member.userId === mockCurrentUser.id
        )
      ).toBe(true);
    });

    it('should surface join errors and reset loading state', async () => {
      jest
        .spyOn(groupsService, 'joinGroup')
        .mockReturnValue(
          throwError(() => ({ error: { message: 'Vous êtes déjà membre.' } }))
        );

      setIsMember(false);
      await component.joinGroup().catch(() => undefined);

      expect(component.joinInProgress()).toBe(false);
      expect(component.isMember()).toBe(false);
      expect(component.joinError()).toBe('Vous êtes déjà membre.');
    });

    it('should do nothing when join is not allowed', async () => {
      setIsMember(true);
      const joinSpy = jest.spyOn(groupsService, 'joinGroup');

      await component.joinGroup();

      expect(joinSpy).not.toHaveBeenCalled();
    });
  });

  describe('Leave functionality', () => {
    const mockCurrentUser = {
      id: 'user-3',
      username: 'member_three',
      email: 'member3@example.com',
    };

    let confirmSpy: jest.SpyInstance;

    beforeEach(() => {
      getCurrentUserIdSpy.mockReturnValue(mockCurrentUser.id);
      getCurrentUserSpy.mockReturnValue({
        id: mockCurrentUser.id,
        username: mockCurrentUser.username,
        avatar: null,
      });

      getGroupSpy.mockReturnValueOnce(
        of({
          ...mockGroup,
          members: [
            ...mockGroup.members,
            {
              userId: mockCurrentUser.id,
              user: {
                id: mockCurrentUser.id,
                username: mockCurrentUser.username,
                avatar: null,
              },
              joinedAt: '2025-01-03T00:00:00.000Z',
            },
          ],
          _count: {
            members: 3,
          },
        })
      );

      fixture.detectChanges();

      confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    });

    afterEach(() => {
      confirmSpy?.mockRestore();
    });

    it('should request confirmation before leaving', () => {
      const leaveSpy = jest.spyOn(groupsService, 'leaveGroup');
      confirmSpy.mockReturnValue(false);

      void component.leaveGroup();

      expect(confirmSpy).toHaveBeenCalled();
      expect(leaveSpy).not.toHaveBeenCalled();
    });

    it('should call leaveGroup service and update state on success', async () => {
      jest.spyOn(groupsService, 'leaveGroup').mockReturnValue(
        of({
          left: true,
          groupId: '1',
          memberCount: 2,
          maxMembers: 10,
          isRecruiting: true,
        })
      );

      await component.leaveGroup();

      expect(groupsService.leaveGroup).toHaveBeenCalledWith('1');
      expect(component.leaveInProgress()).toBe(false);
      expect(component.isMember()).toBe(false);
      expect(component.leaveError()).toBeNull();
      const updatedGroup = readGroup();
      expect(updatedGroup).toBeTruthy();
      if (!updatedGroup) {
        throw new Error('Group should be defined');
      }
      expect(updatedGroup._count?.members).toBe(2);
      expect(updatedGroup.currentUserIsMember).toBe(false);
      const updatedMembers = (updatedGroup.members ?? []) as MockGroupMember[];
      expect(
        updatedMembers.some(
          (member: MockGroupMember) => member.userId === mockCurrentUser.id
        )
      ).toBe(false);
    });

    it('should surface leave errors and reset loading state', async () => {
      jest
        .spyOn(groupsService, 'leaveGroup')
        .mockReturnValue(
          throwError(() => ({ error: { message: 'Action impossible' } }))
        );

      await component.leaveGroup().catch(() => undefined);

      expect(component.leaveInProgress()).toBe(false);
      expect(component.leaveError()).toBe('Action impossible');
      expect(component.isMember()).toBe(true);
    });
  });

  describe('Navigation', () => {
    it('should navigate back to groups list', () => {
      routerMock.navigate.mockResolvedValue(true);
      component.goBack();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/groups']);
    });
  });

  describe('Date formatting', () => {
    it('should format date correctly', () => {
      const formatted = component.formatDate('2025-01-15T10:00:00.000Z');
      expect(formatted).toContain('15');
      expect(formatted).toContain('janvier');
      expect(formatted).toContain('2025');
    });

    it('should format datetime correctly', () => {
      const formatted = component.formatDateTime('2025-01-15T14:30:00.000Z');
      expect(formatted).toContain('15');
      expect(formatted).toContain('janvier');
      expect(formatted).toContain('2025');
      // Note: Time formatting may vary based on timezone
    });
  });

  describe('Template rendering', () => {
    beforeEach(() => {
      getGroupSpy.mockReturnValueOnce(of(mockGroup));
      fixture.detectChanges();
    });

    it('should display group name', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Test Group');
    });

    it('should display group description', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('A test group description');
    });

    it('should display creator username', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('test_user');
    });

    it('should display members', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('member1');
      expect(compiled.textContent).toContain('member2');
    });

    it('should display sessions', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Test Session');
      expect(compiled.textContent).toContain('Test Location');
    });

    it('should show join button when can join', () => {
      // Create a fresh fixture without running ngOnInit from beforeEach
      const freshFixture = TestBed.createComponent(GroupDetailComponent);
      const freshComponent = freshFixture.componentInstance;

      // Set up the mock to return a group where user is not a member
      getGroupSpy.mockReturnValueOnce(
        of({
          ...mockGroup,
          currentUserIsMember: false,
          isRecruiting: true,
          maxMembers: 10,
        })
      );

      // Trigger initialization and change detection
      freshComponent.ngOnInit();
      freshFixture.detectChanges();

      const compiled = freshFixture.nativeElement as HTMLElement;
      const joinButton = compiled.querySelector(
        '.section-actions .btn--primary'
      );
      expect(joinButton).toBeTruthy();
      expect(joinButton?.textContent).toContain('Rejoindre');
    });

    it('should show leave button when user is member', () => {
      writeGroup({
        ...mockGroup,
        members: mockGroup.members,
      });
      setIsMember(true);

      // In zoneless mode, we need full change detection
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const leaveButton = compiled.querySelector(
        '.section-actions .btn--danger'
      );
      expect(leaveButton).toBeTruthy();
      expect(leaveButton?.textContent).toContain('Quitter le groupe');
    });

    it('should show loading state', () => {
      // Create a fresh fixture without running ngOnInit
      const freshFixture = TestBed.createComponent(GroupDetailComponent);
      const freshComponent = freshFixture.componentInstance;
      const loadGroupSpy = jest
        .spyOn(
          freshComponent as unknown as { loadGroup: (id: string) => void },
          'loadGroup'
        )
        .mockImplementation(() => {
          /* intentionally blank */
        });

      // Set state before first detectChanges
      freshComponent.loading.set(true);
      freshComponent.group.set(null);

      // Now run change detection
      freshFixture.detectChanges();
      loadGroupSpy.mockRestore();

      const compiled = freshFixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.loading-state')).toBeTruthy();
    });

    it('should show error state', () => {
      // Create a fresh fixture without running ngOnInit
      const freshFixture = TestBed.createComponent(GroupDetailComponent);
      const freshComponent = freshFixture.componentInstance;
      const loadGroupSpy = jest
        .spyOn(
          freshComponent as unknown as { loadGroup: (id: string) => void },
          'loadGroup'
        )
        .mockImplementation(() => {
          /* intentionally blank */
        });

      // Set state before first detectChanges
      freshComponent.loading.set(false);
      freshComponent.error.set('Test error');
      freshComponent.group.set(null);

      // Now run change detection
      freshFixture.detectChanges();
      loadGroupSpy.mockRestore();

      const compiled = freshFixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('lib-error-message')).toBeTruthy();
      expect(compiled.textContent).toContain('Test error');
    });
  });

  describe('Membership detection', () => {
    it('should detect user is a member when userId matches', () => {
      jest.spyOn(authService, 'getCurrentUserId').mockReturnValue('user-1');
      getGroupSpy.mockReturnValueOnce(of(mockGroup));

      component.ngOnInit();

      expect(component.currentUserId).toBe('user-1');
      expect(component.isMember).toBe(true);
    });

    it('should detect user is NOT a member when userId does not match', () => {
      jest.spyOn(authService, 'getCurrentUserId').mockReturnValue('user-999');
      getGroupSpy.mockReturnValueOnce(of(nonMemberGroup));

      component.ngOnInit();

      expect(component.currentUserId).toBe('user-999');
      expect(component.isMember).toBe(false);
    });

    it('should detect user is NOT a member when not authenticated', () => {
      jest.spyOn(authService, 'getCurrentUserId').mockReturnValue(null);
      getGroupSpy.mockReturnValueOnce(of(nonMemberGroup));

      component.ngOnInit();

      expect(component.currentUserId).toBe(null);
      expect(component.isMember).toBe(false);
    });

    it('should correctly check membership with nested user structure', () => {
      const groupWithMembers = {
        ...mockGroup,
        currentUserIsMember: undefined,
        members: [
          {
            userId: 'user-alice',
            user: {
              id: 'user-alice',
              username: 'alice',
              avatar: null,
            },
            joinedAt: '2025-01-01T00:00:00.000Z',
          },
          {
            userId: 'user-bob',
            user: {
              id: 'user-bob',
              username: 'bob',
              avatar: null,
            },
            joinedAt: '2025-01-02T00:00:00.000Z',
          },
        ],
      };

      jest.spyOn(authService, 'getCurrentUserId').mockReturnValue('user-bob');
      getGroupSpy.mockReturnValueOnce(of(groupWithMembers));

      component.ngOnInit();

      expect(component.isMember).toBe(true);
    });

    it('should handle group with no members', () => {
      const groupNoMembers = {
        ...mockGroup,
        currentUserIsMember: undefined,
        members: [],
      };

      jest.spyOn(authService, 'getCurrentUserId').mockReturnValue('user-1');
      getGroupSpy.mockReturnValueOnce(of(groupNoMembers));

      component.ngOnInit();

      expect(component.isMember).toBe(false);
    });

    it('should handle group with undefined members', () => {
      const groupUndefinedMembers = {
        ...mockGroup,
        currentUserIsMember: undefined,
        members: undefined,
      };

      jest.spyOn(authService, 'getCurrentUserId').mockReturnValue('user-1');
      getGroupSpy.mockReturnValueOnce(of(groupUndefinedMembers));

      component.ngOnInit();

      expect(component.isMember).toBe(false);
    });
  });
});
