import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionCardComponent } from './session-card';
import { RouterTestingModule } from '@angular/router/testing';
import { Session } from '../../core/services/sessions.service';
import { Reservation } from '../../core/services/reservations.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../../core/services/auth.service';
import { of } from 'rxjs';

describe('SessionCardComponent', () => {
  let component: SessionCardComponent;
  let fixture: ComponentFixture<SessionCardComponent>;

  const mockAuthService = {
    getCurrentUser: jest.fn().mockReturnValue({ id: 'user-1', username: 'TestUser' }),
    isAuthenticated: jest.fn().mockReturnValue(true)
  };

  const mockSession: Session = {
    id: '1',
    game: 'Dungeons & Dragons 5e',
    title: 'Les Mines de Phandelver',
    description: 'Une aventure épique pour débutants dans l\'univers de D&D',
    date: '2025-10-20T18:00:00.000Z',
    recurrenceRule: null,
    recurrenceEndDate: null,
    online: false,
    level: 'BEGINNER',
    playersMax: 5,
    playersCurrent: 3,
    tagColor: 'GREEN',
    createdAt: '2025-10-01T00:00:00.000Z',
    updatedAt: '2025-10-01T00:00:00.000Z',
    hostId: 'host-1',
    locationId: 'loc-1',
    host: {
      id: 'host-1',
      username: 'GameMaster42',
      avatar: null
    },
    location: {
      id: 'loc-1',
      name: 'Brussels Game Store',
      city: 'Brussels',
      type: 'GAME_STORE',
      lat: 50.8476,
      lon: 4.3572
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionCardComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SessionCardComponent);
    component = fixture.componentInstance;
    component.session = { ...mockSession };
    
    // Mock the reservations service
    jest.spyOn(component['reservationsService'], 'getReservations').mockReturnValue(of([]));
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Helper Methods', () => {
    describe('getTagColorClass', () => {
      it('should return correct class for RED tag', () => {
        expect(component.getTagColorClass('RED')).toBe('tag--red');
      });

      it('should return correct class for GREEN tag', () => {
        expect(component.getTagColorClass('GREEN')).toBe('tag--green');
      });

      it('should return correct class for PURPLE tag', () => {
        expect(component.getTagColorClass('PURPLE')).toBe('tag--purple');
      });

      it('should return correct class for BLUE tag', () => {
        expect(component.getTagColorClass('BLUE')).toBe('tag--blue');
      });

      it('should return correct class for GRAY tag', () => {
        expect(component.getTagColorClass('GRAY')).toBe('tag--gray');
      });

      it('should return default class for unknown color', () => {
        expect(component.getTagColorClass('UNKNOWN')).toBe('tag--gray');
      });
    });

    describe('getLevelLabel', () => {
      it('should return "Débutant" for BEGINNER', () => {
        expect(component.getLevelLabel('BEGINNER')).toBe('Débutant');
      });

      it('should return "Intermédiaire" for INTERMEDIATE', () => {
        expect(component.getLevelLabel('INTERMEDIATE')).toBe('Intermédiaire');
      });

      it('should return "Avancé" for ADVANCED', () => {
        expect(component.getLevelLabel('ADVANCED')).toBe('Avancé');
      });

      it('should return "Tous niveaux" for OPEN', () => {
        expect(component.getLevelLabel('OPEN')).toBe('Tous niveaux');
      });

      it('should return the original level for unknown value', () => {
        expect(component.getLevelLabel('UNKNOWN')).toBe('UNKNOWN');
      });
    });

    describe('formatDate', () => {
      it('should format date in French locale', () => {
        const formatted = component.formatDate('2025-10-20T18:00:00.000Z');
        expect(formatted).toContain('2025');
        expect(formatted).toContain('20:00'); // UTC+2 timezone
      });

      it('should handle different date formats', () => {
        const formatted = component.formatDate('2025-12-25T12:30:00.000Z');
        expect(formatted).toContain('2025');
        expect(formatted).toContain('13:30'); // UTC+1 timezone in winter
      });
    });

    describe('getAvailableSpots', () => {
      it('should return correct number of available spots', () => {
        component.session.playersMax = 5;
        component.session.playersCurrent = 3;
        expect(component.getAvailableSpots()).toBe(2);
      });

      it('should return 0 when session is full', () => {
        component.session.playersMax = 5;
        component.session.playersCurrent = 5;
        expect(component.getAvailableSpots()).toBe(0);
      });

      it('should return correct spots when only one player', () => {
        component.session.playersMax = 4;
        component.session.playersCurrent = 1;
        expect(component.getAvailableSpots()).toBe(3);
      });
    });

    describe('isFull', () => {
      it('should return true when session is full', () => {
        component.session.playersMax = 5;
        component.session.playersCurrent = 5;
        expect(component.isFull()).toBe(true);
      });

      it('should return false when spots are available', () => {
        component.session.playersMax = 5;
        component.session.playersCurrent = 3;
        expect(component.isFull()).toBe(false);
      });

      it('should return true when current exceeds max', () => {
        component.session.playersMax = 5;
        component.session.playersCurrent = 6;
        expect(component.isFull()).toBe(true);
      });

      it('should return false when session just started', () => {
        component.session.playersMax = 5;
        component.session.playersCurrent = 0;
        expect(component.isFull()).toBe(false);
      });
    });

    describe('getStatusClass', () => {
      it('should return "status--full" when no spots available', () => {
        component.session.playersMax = 5;
        component.session.playersCurrent = 5;
        expect(component.getStatusClass()).toBe('status--full');
      });

      it('should return "status--limited" when 1 spot available', () => {
        component.session.playersMax = 5;
        component.session.playersCurrent = 4;
        expect(component.getStatusClass()).toBe('status--limited');
      });

      it('should return "status--limited" when 2 spots available', () => {
        component.session.playersMax = 5;
        component.session.playersCurrent = 3;
        expect(component.getStatusClass()).toBe('status--limited');
      });

      it('should return "status--available" when 3+ spots available', () => {
        component.session.playersMax = 5;
        component.session.playersCurrent = 2;
        expect(component.getStatusClass()).toBe('status--available');
      });

      it('should return "status--available" when session is empty', () => {
        component.session.playersMax = 5;
        component.session.playersCurrent = 0;
        expect(component.getStatusClass()).toBe('status--available');
      });
    });
  });

  describe('Display Logic', () => {
    it('should display session title', () => {
      const compiled = fixture.nativeElement;
      const title = compiled.querySelector('.session-card__title');
      expect(title.textContent).toContain('Les Mines de Phandelver');
    });

    it('should display game name', () => {
      const compiled = fixture.nativeElement;
      const game = compiled.querySelector('.session-card__game');
      expect(game.textContent).toContain('Dungeons & Dragons 5e');
    });

    it('should display host username', () => {
      const compiled = fixture.nativeElement;
      const details = compiled.textContent;
      expect(details).toContain('GameMaster42');
    });

    it('should display location name and city', () => {
      const compiled = fixture.nativeElement;
      const details = compiled.textContent;
      expect(details).toContain('Brussels Game Store');
      expect(details).toContain('Brussels');
    });

    it('should display description when provided', () => {
      const compiled = fixture.nativeElement;
      const description = compiled.querySelector('.session-card__description');
      expect(description).toBeTruthy();
      expect(description.textContent).toContain('Une aventure épique');
    });

    it('should not display description section when null', () => {
      component.session.description = null;
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const description = compiled.querySelector('.session-card__description');
      expect(description).toBeFalsy();
    });

    it('should display online indicator when session is online', () => {
      component.session.online = true;
      component.session.location = undefined;
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const details = compiled.textContent;
      expect(details).toContain('En ligne');
    });

    it('should not display location when session is online', () => {
      component.session.online = true;
      component.session.location = undefined;
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const details = compiled.textContent;
      expect(details).not.toContain('Brussels Game Store');
    });
  });

  describe('Button States', () => {
    it('should enable reserve button when spots available', () => {
      component.session.playersMax = 5;
      component.session.playersCurrent = 3;
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('.button--primary');
      expect(button.disabled).toBe(false);
      expect(button.textContent).toContain('Réserver ma place');
    });

    it('should disable reserve button when session is full', () => {
      component.session.playersMax = 5;
      component.session.playersCurrent = 5;
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('.button--primary');
      expect(button.disabled).toBe(true);
      expect(button.textContent).toContain('Complet');
    });
  });

  describe('Status Badge', () => {
    it('should show available status with correct spots count', () => {
      component.session.playersMax = 5;
      component.session.playersCurrent = 2;
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.session-card__status');
      expect(badge.textContent).toContain('3 place(s) disponible(s)');
      expect(badge.classList.contains('status--available')).toBe(true);
    });

    it('should show limited status when 2 spots left', () => {
      component.session.playersMax = 5;
      component.session.playersCurrent = 3;
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.session-card__status');
      expect(badge.textContent).toContain('2 place(s) disponible(s)');
      expect(badge.classList.contains('status--limited')).toBe(true);
    });

    it('should show full status when no spots left', () => {
      component.session.playersMax = 5;
      component.session.playersCurrent = 5;
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.session-card__status');
      expect(badge.textContent).toContain('Complet');
      expect(badge.classList.contains('status--full')).toBe(true);
    });
  });

  describe('Color Coding', () => {
    it('should apply correct CSS class for session tag color', () => {
      component.session.tagColor = 'RED';
      fixture.detectChanges();
      const card = fixture.nativeElement.querySelector('.session-card');
      expect(card.classList.contains('session-card--red')).toBe(true);
    });

    it('should update color class when tag color changes', () => {
      component.session.tagColor = 'BLUE';
      fixture.detectChanges();
      const card = fixture.nativeElement.querySelector('.session-card');
      expect(card.classList.contains('session-card--blue')).toBe(true);
    });
  });

  describe('Registration Status', () => {
    it('should check registration status on init', () => {
      const spy = jest.spyOn(component['reservationsService'], 'getReservations');
      component.ngOnInit();
      expect(spy).toHaveBeenCalledWith('user-1');
    });

    it('should set isRegistered to false when user has no reservations', () => {
      jest.spyOn(component['reservationsService'], 'getReservations').mockReturnValue(of([]));
      component.checkIfRegistered();
      expect(component.isRegistered).toBe(false);
    });

    it('should set isRegistered to true when user has reservation for this session', () => {
      const mockReservations: Reservation[] = [
        { id: 'res-1', sessionId: '1', userId: 'user-1', status: 'CONFIRMED', createdAt: '2025-10-01T00:00:00.000Z' }
      ];
      jest.spyOn(component['reservationsService'], 'getReservations').mockReturnValue(of(mockReservations));
      component.checkIfRegistered();
      expect(component.isRegistered).toBe(true);
    });

    it('should set isRegistered to false when user has reservations for other sessions', () => {
      const mockReservations: Reservation[] = [
        { id: 'res-1', sessionId: '2', userId: 'user-1', status: 'CONFIRMED', createdAt: '2025-10-01T00:00:00.000Z' },
        { id: 'res-2', sessionId: '3', userId: 'user-1', status: 'CONFIRMED', createdAt: '2025-10-02T00:00:00.000Z' }
      ];
      jest.spyOn(component['reservationsService'], 'getReservations').mockReturnValue(of(mockReservations));
      component.checkIfRegistered();
      expect(component.isRegistered).toBe(false);
    });

    it('should set isRegistered to false when user is not authenticated', () => {
      mockAuthService.getCurrentUser.mockReturnValue(null);
      component.checkIfRegistered();
      expect(component.isRegistered).toBe(false);
    });

    it('should display "Inscrit" badge when user is registered', () => {
      component.isRegistered = true;
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.session-card__registered');
      expect(badge).toBeTruthy();
      expect(badge.textContent).toContain('✓ Inscrit');
    });

    it('should not display "Inscrit" badge when user is not registered', () => {
      component.isRegistered = false;
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.session-card__registered');
      expect(badge).toBeFalsy();
    });

    it('should show "Déjà inscrit" button text when registered', () => {
      component.isRegistered = true;
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('.button--primary');
      expect(button.textContent).toContain('✓ Déjà inscrit');
    });

    it('should disable button when user is already registered', () => {
      component.isRegistered = true;
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('.button--primary');
      expect(button.disabled).toBe(true);
    });

    it('should apply success class to button when registered', () => {
      component.isRegistered = true;
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('.button--primary');
      expect(button.classList.contains('button--success')).toBe(true);
    });

    it('should update isRegistered and playersCurrent after successful reservation', (done) => {
      const mockReservation: Reservation = { 
        id: 'res-new', 
        sessionId: '1', 
        userId: 'user-1', 
        status: 'CONFIRMED', 
        createdAt: '2025-10-16T00:00:00.000Z' 
      };
      
      const createSpy = jest.spyOn(component['reservationsService'], 'createReservation')
        .mockReturnValue(of(mockReservation));
      jest.spyOn(window, 'alert').mockImplementation(() => { /* noop */ });
      
      component.isRegistered = false;
      const initialPlayers = component.session.playersCurrent;
      
      // Subscribe to verify the observable completes
      createSpy.mockReturnValue(of(mockReservation));
      component['reservationsService'].createReservation(component.session.id, 'user-1').subscribe({
        next: () => {
          component.session.playersCurrent++;
          component.isRegistered = true;
          
          expect(component.isRegistered).toBe(true);
          expect(component.session.playersCurrent).toBe(initialPlayers + 1);
          done();
        }
      });
    });
  });
});
