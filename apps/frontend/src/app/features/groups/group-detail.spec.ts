import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { GroupsService } from '../../core/services/groups.service';
import { PollsService } from '../../core/services/polls.service';
import { GroupDetailComponent } from './group-detail';

describe('GroupDetailComponent', () => {
  let component: GroupDetailComponent;
  let fixture: ComponentFixture<GroupDetailComponent>;
  let groupsService: GroupsService;
  let pollsService: PollsService;
  let authService: AuthService;
  let getCurrentUserIdSpy: jest.SpyInstance;
  let getCurrentUserSpy: jest.SpyInstance;
  let router: Router;

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        GroupDetailComponent,
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: jest.fn().mockReturnValue('1'),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupDetailComponent);
    component = fixture.componentInstance;
    groupsService = TestBed.inject(GroupsService);
    pollsService = TestBed.inject(PollsService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    // Mock polls service by default
    jest.spyOn(pollsService, 'getPolls').mockReturnValue(of([]));

    // Mock auth service by default (user not authenticated)
    getCurrentUserIdSpy = jest
      .spyOn(authService, 'getCurrentUserId')
      .mockReturnValue(null);
    getCurrentUserSpy = jest
      .spyOn(authService, 'getCurrentUser')
      .mockReturnValue(null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load group on init with valid id', () => {
      const spy = jest
        .spyOn(groupsService, 'getGroup')
        .mockReturnValue(of(mockGroup));

      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith('1');
      expect(component.group).toEqual(mockGroup);
      expect(component.loading).toBe(false);
    });

    it('should handle error when loading group fails', () => {
      jest
        .spyOn(groupsService, 'getGroup')
        .mockReturnValue(throwError(() => new Error('Failed to load')));

      fixture.detectChanges();

      expect(component.error).toBeTruthy();
      expect(component.loading).toBe(false);
    });

    it('should set error when id is missing', () => {
      const route = TestBed.inject(ActivatedRoute);
      jest.spyOn(route.snapshot.paramMap, 'get').mockReturnValue(null);

      component.ngOnInit();

      expect(component.error).toBe('ID de groupe invalide');
      expect(component.loading).toBe(false);
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
      jest.spyOn(groupsService, 'getGroup').mockReturnValue(of(mockGroup));
      fixture.detectChanges();
    });

    it('should get member count from members array', () => {
      expect(component.getMemberCount()).toBe(2);
    });

    it('should get member count from _count when members is not available', () => {
      component.group = { ...mockGroup, members: undefined };
      expect(component.getMemberCount()).toBe(5);
    });

    it('should return 0 when no member data available', () => {
      component.group = { ...mockGroup, members: undefined, _count: undefined };
      expect(component.getMemberCount()).toBe(0);
    });

    it('should detect when group is full', () => {
      component.group = { ...mockGroup, maxMembers: 2 };
      expect(component.isFull()).toBe(true);
    });

    it('should detect when group is not full', () => {
      component.group = { ...mockGroup, maxMembers: 10 };
      expect(component.isFull()).toBe(false);
    });

    it('should return false for isFull when maxMembers is null', () => {
      component.group = { ...mockGroup, maxMembers: null };
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
      jest.spyOn(groupsService, 'getGroup').mockReturnValue(of(mockGroup));
      getCurrentUserIdSpy.mockReturnValue(mockCurrentUser.id);
      getCurrentUserSpy.mockReturnValue(mockCurrentUser);
      fixture.detectChanges();
    });

    it('should allow joining when recruiting and not full', () => {
      component.group = { ...mockGroup, isRecruiting: true, maxMembers: 10 };
      expect(component.canJoin()).toBe(true);
    });

    it('should not allow joining when not recruiting', () => {
      component.group = { ...mockGroup, isRecruiting: false };
      expect(component.canJoin()).toBe(false);
    });

    it('should not allow joining when group is full', () => {
      component.group = { ...mockGroup, isRecruiting: true, maxMembers: 2 };
      expect(component.canJoin()).toBe(false);
    });

    it('should call joinGroup service and update state on success', () => {
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

      component.joinGroup();

      expect(joinSpy).toHaveBeenCalledWith('1');
      expect(component.joinInProgress).toBe(false);
      expect(component.isMember).toBe(true);
      expect(component.joinError).toBeNull();
      expect(component.group?._count?.members).toBe(6);
      expect(
        component.group?.members?.some((m) => m.userId === mockCurrentUser.id)
      ).toBe(true);
    });

    it('should surface join errors and reset loading state', () => {
      jest
        .spyOn(groupsService, 'joinGroup')
        .mockReturnValue(
          throwError(() => ({ error: { message: 'Vous êtes déjà membre.' } }))
        );

      component.joinGroup();

      expect(component.joinInProgress).toBe(false);
      expect(component.isMember).toBe(false);
      expect(component.joinError).toBe('Vous êtes déjà membre.');
    });

    it('should do nothing when join is not allowed', () => {
      component.isMember = true;
      const joinSpy = jest.spyOn(groupsService, 'joinGroup');

      component.joinGroup();

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

      jest.spyOn(groupsService, 'getGroup').mockReturnValue(
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
      confirmSpy.mockRestore();
    });

    it('should request confirmation before leaving', () => {
      const leaveSpy = jest.spyOn(groupsService, 'leaveGroup');
      confirmSpy.mockReturnValue(false);

      component.leaveGroup();

      expect(confirmSpy).toHaveBeenCalled();
      expect(leaveSpy).not.toHaveBeenCalled();
    });

    it('should call leaveGroup service and update state on success', () => {
      jest.spyOn(groupsService, 'leaveGroup').mockReturnValue(
        of({
          left: true,
          groupId: '1',
          memberCount: 2,
          maxMembers: 10,
          isRecruiting: true,
        })
      );

      component.leaveGroup();

      expect(groupsService.leaveGroup).toHaveBeenCalledWith('1');
      expect(component.leaveInProgress).toBe(false);
      expect(component.isMember).toBe(false);
      expect(component.leaveError).toBeNull();
      expect(component.group?._count?.members).toBe(2);
      expect(
        component.group?.members?.some(
          (member) => member.userId === mockCurrentUser.id
        )
      ).toBe(false);
    });

    it('should surface leave errors and reset loading state', () => {
      jest
        .spyOn(groupsService, 'leaveGroup')
        .mockReturnValue(
          throwError(() => ({ error: { message: 'Action impossible' } }))
        );

      component.leaveGroup();

      expect(component.leaveInProgress).toBe(false);
      expect(component.leaveError).toBe('Action impossible');
      expect(component.isMember).toBe(true);
    });
  });

  describe('Navigation', () => {
    it('should navigate back to groups list', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      component.goBack();
      expect(navigateSpy).toHaveBeenCalledWith(['/groups']);
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
      jest.spyOn(groupsService, 'getGroup').mockReturnValue(of(mockGroup));
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
      const compiled = fixture.nativeElement as HTMLElement;
      const joinButton = compiled.querySelector(
        '.section-actions .btn--primary'
      );
      expect(joinButton).toBeTruthy();
      expect(joinButton?.textContent).toContain('Rejoindre');
    });

    it('should show leave button when user is member', () => {
      component.group = {
        ...mockGroup,
        members: mockGroup.members,
      };
      component.isMember = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const leaveButton = compiled.querySelector(
        '.section-actions .btn--danger'
      );
      expect(leaveButton).toBeTruthy();
      expect(leaveButton?.textContent).toContain('Quitter le groupe');
    });

    it('should show loading state', () => {
      component.loading = true;
      component.group = null;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.loading-state')).toBeTruthy();
    });

    it('should show error state', () => {
      component.loading = false;
      component.error = 'Test error';
      component.group = null;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('lib-error-message')).toBeTruthy();
      expect(compiled.textContent).toContain('Test error');
    });
  });

  describe('Membership detection', () => {
    it('should detect user is a member when userId matches', () => {
      jest.spyOn(authService, 'getCurrentUserId').mockReturnValue('user-1');
      jest.spyOn(groupsService, 'getGroup').mockReturnValue(of(mockGroup));

      component.ngOnInit();

      expect(component.currentUserId).toBe('user-1');
      expect(component.isMember).toBe(true);
    });

    it('should detect user is NOT a member when userId does not match', () => {
      jest.spyOn(authService, 'getCurrentUserId').mockReturnValue('user-999');
      jest.spyOn(groupsService, 'getGroup').mockReturnValue(of(mockGroup));

      component.ngOnInit();

      expect(component.currentUserId).toBe('user-999');
      expect(component.isMember).toBe(false);
    });

    it('should detect user is NOT a member when not authenticated', () => {
      jest.spyOn(authService, 'getCurrentUserId').mockReturnValue(null);
      jest.spyOn(groupsService, 'getGroup').mockReturnValue(of(mockGroup));

      component.ngOnInit();

      expect(component.currentUserId).toBe(null);
      expect(component.isMember).toBe(false);
    });

    it('should correctly check membership with nested user structure', () => {
      const groupWithMembers = {
        ...mockGroup,
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
      jest
        .spyOn(groupsService, 'getGroup')
        .mockReturnValue(of(groupWithMembers));

      component.ngOnInit();

      expect(component.isMember).toBe(true);
    });

    it('should handle group with no members', () => {
      const groupNoMembers = {
        ...mockGroup,
        members: [],
      };

      jest.spyOn(authService, 'getCurrentUserId').mockReturnValue('user-1');
      jest.spyOn(groupsService, 'getGroup').mockReturnValue(of(groupNoMembers));

      component.ngOnInit();

      expect(component.isMember).toBe(false);
    });

    it('should handle group with undefined members', () => {
      const groupUndefinedMembers = {
        ...mockGroup,
        members: undefined,
      };

      jest.spyOn(authService, 'getCurrentUserId').mockReturnValue('user-1');
      jest
        .spyOn(groupsService, 'getGroup')
        .mockReturnValue(of(groupUndefinedMembers));

      component.ngOnInit();

      expect(component.isMember).toBe(false);
    });
  });
});
