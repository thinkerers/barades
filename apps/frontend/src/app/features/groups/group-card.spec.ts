import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GroupCardComponent } from './group-card';
import { Group } from '../../core/services/groups.service';

describe('GroupCardComponent', () => {
  let component: GroupCardComponent;
  let fixture: ComponentFixture<GroupCardComponent>;

  const mockGroup: Group = {
    id: '1',
    name: 'Les Dragons du Donjon',
    description: 'Groupe dédié aux campagnes épiques et narratives',
    playstyle: 'STORY_DRIVEN',
    isRecruiting: true,
    isPublic: true,
    maxMembers: 6,
    creatorId: '1',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    creator: {
      id: '1',
      username: 'john_doe',
      avatar: null
    },
    _count: {
      members: 4
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupCardComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(GroupCardComponent);
    component = fixture.componentInstance;
    component.group = mockGroup;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Playstyle helpers', () => {
    it('should return correct label for COMPETITIVE', () => {
      expect(component.getPlaystyleLabel('COMPETITIVE')).toBe('Compétitif');
    });

    it('should return correct label for CASUAL', () => {
      expect(component.getPlaystyleLabel('CASUAL')).toBe('Décontracté');
    });

    it('should return correct label for STORY_DRIVEN', () => {
      expect(component.getPlaystyleLabel('STORY_DRIVEN')).toBe('Narratif');
    });

    it('should return correct label for SANDBOX', () => {
      expect(component.getPlaystyleLabel('SANDBOX')).toBe('Bac à sable');
    });

    it('should return original value for unknown playstyle', () => {
      expect(component.getPlaystyleLabel('UNKNOWN')).toBe('UNKNOWN');
    });

    it('should return correct color for COMPETITIVE', () => {
      expect(component.getPlaystyleColor('COMPETITIVE')).toBe('red');
    });

    it('should return correct color for CASUAL', () => {
      expect(component.getPlaystyleColor('CASUAL')).toBe('green');
    });

    it('should return correct color for STORY_DRIVEN', () => {
      expect(component.getPlaystyleColor('STORY_DRIVEN')).toBe('purple');
    });

    it('should return correct color for SANDBOX', () => {
      expect(component.getPlaystyleColor('SANDBOX')).toBe('blue');
    });

    it('should return gray for unknown playstyle', () => {
      expect(component.getPlaystyleColor('UNKNOWN')).toBe('gray');
    });
  });

  describe('Member count', () => {
    it('should return member count from _count', () => {
      expect(component.getMemberCount()).toBe(4);
    });

    it('should return 0 if _count is missing', () => {
      component.group = { ...mockGroup, _count: undefined };
      expect(component.getMemberCount()).toBe(0);
    });
  });

  describe('isFull', () => {
    it('should return false when not recruiting', () => {
      component.group = { ...mockGroup, isRecruiting: false };
      expect(component.isFull()).toBe(false);
    });

    it('should return false when no maxMembers is set', () => {
      component.group = { ...mockGroup, maxMembers: null };
      expect(component.isFull()).toBe(false);
    });

    it('should return false when members < maxMembers', () => {
      component.group = { 
        ...mockGroup, 
        _count: { members: 4 },
        maxMembers: 6
      };
      expect(component.isFull()).toBe(false);
    });

    it('should return true when members >= maxMembers', () => {
      component.group = { 
        ...mockGroup, 
        _count: { members: 6 },
        maxMembers: 6
      };
      expect(component.isFull()).toBe(true);
    });
  });

  describe('Status helpers', () => {
    it('should return "Recrute" when recruiting', () => {
      component.group = { ...mockGroup, isRecruiting: true };
      expect(component.getStatusLabel()).toBe('Recrute');
    });

    it('should return "Complet" when full', () => {
      component.group = { 
        ...mockGroup, 
        isRecruiting: true,
        _count: { members: 6 },
        maxMembers: 6
      };
      expect(component.getStatusLabel()).toBe('Complet');
    });

    it('should return "Privé" when not recruiting', () => {
      component.group = { ...mockGroup, isRecruiting: false };
      expect(component.getStatusLabel()).toBe('Privé');
    });

    it('should return "status--recruiting" class when recruiting and not full', () => {
      component.group = { 
        ...mockGroup, 
        isRecruiting: true,
        _count: { members: 4 },
        maxMembers: 6
      };
      expect(component.getStatusClass()).toBe('status--recruiting');
    });

    it('should return "status--full" class when full', () => {
      component.group = { 
        ...mockGroup, 
        isRecruiting: true,
        _count: { members: 6 },
        maxMembers: 6
      };
      expect(component.getStatusClass()).toBe('status--full');
    });

    it('should return "status--private" class when not recruiting', () => {
      component.group = { ...mockGroup, isRecruiting: false };
      expect(component.getStatusClass()).toBe('status--private');
    });
  });

  describe('Template rendering', () => {
    it('should display group name', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.group-card__title')?.textContent).toContain('Les Dragons du Donjon');
    });

    it('should display playstyle badge', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const badge = compiled.querySelector('.group-card__playstyle');
      expect(badge?.textContent?.trim()).toBe('Narratif');
    });

    it('should display description', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.group-card__description')?.textContent).toContain('Groupe dédié aux campagnes épiques');
    });

    it('should display creator username', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('john_doe');
    });

    it('should display member count', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('4');
      expect(compiled.textContent).toContain('/ 6');
      expect(compiled.textContent).toContain('membre(s)');
    });

    it('should show join button when recruiting and not full', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const joinButton = compiled.querySelector('.btn--secondary');
      expect(joinButton?.textContent).toContain('Rejoindre');
    });

    it('should show details link', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const detailsLink = compiled.querySelector('.btn--primary');
      expect(detailsLink?.textContent).toContain('Voir les détails');
      expect(detailsLink?.getAttribute('href')).toBe('/groups/1');
    });

    it('should not show join button when not recruiting', () => {
      component.group = { ...mockGroup, isRecruiting: false };
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      const joinButton = compiled.querySelector('.btn--secondary');
      expect(joinButton).toBeNull();
    });

    it('should not show join button when group is full', () => {
      component.group = { 
        ...mockGroup, 
        _count: { members: 6 },
        maxMembers: 6
      };
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      const joinButton = compiled.querySelector('.btn--secondary');
      expect(joinButton).toBeNull();
    });
  });
});
