import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { GroupDetailComponent } from './group-detail';
import { GroupsService } from '../../core/services/groups.service';

describe('GroupDetailComponent', () => {
  let component: GroupDetailComponent;
  let fixture: ComponentFixture<GroupDetailComponent>;
  let groupsService: GroupsService;
  let router: Router;

  const mockGroup = {
    id: '1',
    name: 'Test Group',
    description: 'A test group description',
    playstyle: 'COMPETITIVE' as const,
    isRecruiting: true,
    maxMembers: 10,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    creatorId: '1',
    creator: {
      id: '1',
      username: 'test_user',
      avatar: null
    },
    _count: {
      members: 5
    },
    members: [
      {
        id: '1',
        username: 'member1',
        avatar: null,
        joinedAt: '2025-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        username: 'member2',
        avatar: 'https://avatar.com/2',
        joinedAt: '2025-01-02T00:00:00.000Z'
      }
    ],
    sessions: [
      {
        id: 's1',
        title: 'Test Session',
        scheduledFor: '2025-02-01T14:00:00.000Z',
        location: {
          id: 'l1',
          name: 'Test Location'
        },
        _count: {
          reservations: 3
        }
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        GroupDetailComponent,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: jest.fn().mockReturnValue('1')
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GroupDetailComponent);
    component = fixture.componentInstance;
    groupsService = TestBed.inject(GroupsService);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load group on init with valid id', () => {
      const spy = jest.spyOn(groupsService, 'getGroup').mockReturnValue(of(mockGroup));

      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith('1');
      expect(component.group).toEqual(mockGroup);
      expect(component.loading).toBe(false);
    });

    it('should handle error when loading group fails', () => {
      jest.spyOn(groupsService, 'getGroup').mockReturnValue(
        throwError(() => new Error('Failed to load'))
      );

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
    beforeEach(() => {
      jest.spyOn(groupsService, 'getGroup').mockReturnValue(of(mockGroup));
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

    it('should call joinGroup method', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      component.joinGroup();
      expect(consoleSpy).toHaveBeenCalledWith('Join group functionality to be implemented');
      consoleSpy.mockRestore();
    });

    it('should call leaveGroup method', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      component.leaveGroup();
      expect(consoleSpy).toHaveBeenCalledWith('Leave group functionality to be implemented');
      consoleSpy.mockRestore();
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
      const joinButton = compiled.querySelector('.btn--primary');
      expect(joinButton).toBeTruthy();
      expect(joinButton?.textContent).toContain('Rejoindre');
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
      expect(compiled.querySelector('.error-state')).toBeTruthy();
      expect(compiled.textContent).toContain('Test error');
    });
  });
});
