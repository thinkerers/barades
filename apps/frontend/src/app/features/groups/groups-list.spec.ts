import { provideHttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupsListComponent, HttpClientTestingModule],
      providers: [provideHttpClient(), provideRouter([])],
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

    expect(component.error).toBeTruthy();
    expect(component.loading).toBe(false);
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
});
