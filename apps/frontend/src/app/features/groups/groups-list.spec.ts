import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupsListComponent } from './groups-list';
import { provideHttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { GroupsService } from '../../core/services/groups.service';
import { of, throwError } from 'rxjs';

describe('GroupsListComponent', () => {
  let component: GroupsListComponent;
  let fixture: ComponentFixture<GroupsListComponent>;
  let groupsService: GroupsService;

  const mockGroups = [
    {
      id: '1',
      name: 'Brussels Adventurers Guild',
      description: 'A competitive group for experienced players',
      playstyle: 'COMPETITIVE' as const,
      isRecruiting: true,
      maxMembers: 10,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
      creatorId: '1',
      creator: {
        id: '1',
        username: 'alice_dm',
        avatar: 'https://i.pravatar.cc/150?img=1'
      },
      _count: {
        members: 5
      }
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupsListComponent, HttpClientTestingModule],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(GroupsListComponent);
    component = fixture.componentInstance;
    groupsService = TestBed.inject(GroupsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load groups on init', () => {
    jest.spyOn(groupsService, 'getGroups').mockReturnValue(of(mockGroups));
    
    fixture.detectChanges();

    expect(component.groups).toEqual(mockGroups);
    expect(component.loading).toBe(false);
  });

  it('should handle error when loading groups fails', () => {
    jest.spyOn(groupsService, 'getGroups').mockReturnValue(
      throwError(() => new Error('Failed to load'))
    );

    fixture.detectChanges();

    expect(component.error).toBeTruthy();
    expect(component.loading).toBe(false);
  });

  it('should get correct playstyle label', () => {
    expect(component.getPlaystyleLabel('COMPETITIVE')).toBe('Compétitif');
    expect(component.getPlaystyleLabel('CASUAL')).toBe('Décontracté');
    expect(component.getPlaystyleLabel('STORY_DRIVEN')).toBe('Narratif');
    expect(component.getPlaystyleLabel('SANDBOX')).toBe('Bac à sable');
  });

  it('should get correct playstyle color', () => {
    expect(component.getPlaystyleColor('COMPETITIVE')).toBe('red');
    expect(component.getPlaystyleColor('CASUAL')).toBe('green');
    expect(component.getPlaystyleColor('STORY_DRIVEN')).toBe('purple');
    expect(component.getPlaystyleColor('SANDBOX')).toBe('blue');
  });
});
