import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { Poll, PollsService } from '../../core/services/polls.service';
import { PollWidgetComponent } from './poll-widget';

describe('PollWidgetComponent', () => {
  let component: PollWidgetComponent;
  let fixture: ComponentFixture<PollWidgetComponent>;

  const mockPoll: Poll = {
    id: 'poll-1',
    title: 'Best date for next session?',
    dates: ['2025-10-25', '2025-10-26', '2025-11-01'],
    votes: {
      'user-1': '2025-10-25',
      'user-2': '2025-10-26',
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    groupId: 'group-1',
    voteCounts: {
      '2025-10-25': 1,
      '2025-10-26': 1,
      '2025-11-01': 0,
    },
    voteDetails: {
      '2025-10-25': [{ userId: 'user-1', username: 'alice' }],
      '2025-10-26': [{ userId: 'user-2', username: 'bob' }],
      '2025-11-01': [],
    },
    bestDate: '2025-10-25',
    totalVotes: 2,
  };

  const mockPollsService = {
    createPoll: jest.fn(),
    vote: jest.fn(),
    removeVote: jest.fn(),
  };

  const mockNotificationService = {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollWidgetComponent, FormsModule],
      providers: [
        {
          provide: PollsService,
          useValue: mockPollsService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PollWidgetComponent);
    component = fixture.componentInstance;

    // Set default inputs
    component.groupId = 'group-1';
    component.currentUserId = 'user-1';
    component.isMember = true;

    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Poll creation form', () => {
    it('should toggle create form visibility', () => {
      expect(component.showCreateForm).toBe(false);

      component.toggleCreateForm();
      expect(component.showCreateForm).toBe(true);

      component.toggleCreateForm();
      expect(component.showCreateForm).toBe(false);
    });

    it('should reset form when toggling off', () => {
      component.pollTitle = 'Test title';
      component.selectedDates = ['2025-10-25'];
      component.showCreateForm = true;

      component.toggleCreateForm();

      expect(component.pollTitle).toBe('');
      expect(component.selectedDates).toEqual([]);
      expect(component.showCreateForm).toBe(false);
    });

    it('should add a date to selected dates', () => {
      component.newDateInput = '2025-10-25';
      component.addDate();

      expect(component.selectedDates).toContain('2025-10-25');
      expect(component.newDateInput).toBe('');
    });

    it('should not add duplicate dates', () => {
      component.selectedDates = ['2025-10-25'];
      component.newDateInput = '2025-10-25';
      component.addDate();

      expect(component.selectedDates).toEqual(['2025-10-25']);
    });

    it('should not add empty date', () => {
      component.newDateInput = '';
      component.addDate();

      expect(component.selectedDates).toEqual([]);
    });

    it('should remove a date from selected dates', () => {
      component.selectedDates = ['2025-10-25', '2025-10-26'];
      component.removeDate('2025-10-25');

      expect(component.selectedDates).toEqual(['2025-10-26']);
    });
  });

  describe('Poll creation', () => {
    it('should show error when title is missing', () => {
      component.pollTitle = '';
      component.selectedDates = ['2025-10-25', '2025-10-26'];

      component.createPoll();

      expect(component.error).toBe('Le titre et au moins 2 dates sont requis');
      expect(mockPollsService.createPoll).not.toHaveBeenCalled();
    });

    it('should show error when less than 2 dates', () => {
      component.pollTitle = 'Test Poll';
      component.selectedDates = ['2025-10-25'];

      component.createPoll();

      expect(component.error).toBe('Le titre et au moins 2 dates sont requis');
      expect(mockPollsService.createPoll).not.toHaveBeenCalled();
    });

    it('should create poll successfully', () => {
      component.pollTitle = 'Test Poll';
      component.selectedDates = ['2025-10-25', '2025-10-26'];
      component.showCreateForm = true;

      mockPollsService.createPoll.mockReturnValue(of(mockPoll));

      const emitSpy = jest.spyOn(component.pollCreated, 'emit');

      component.createPoll();

      expect(mockPollsService.createPoll).toHaveBeenCalledWith({
        title: 'Test Poll',
        dates: ['2025-10-25', '2025-10-26'],
        groupId: 'group-1',
      });

      expect(emitSpy).toHaveBeenCalledWith(mockPoll);
      expect(component.creating).toBe(false);
      expect(component.showCreateForm).toBe(false);
      expect(component.pollTitle).toBe('');
      expect(component.selectedDates).toEqual([]);
    });

    it('should handle 403 error (not a member)', () => {
      component.pollTitle = 'Test Poll';
      component.selectedDates = ['2025-10-25', '2025-10-26'];

      mockPollsService.createPoll.mockReturnValue(
        throwError(() => ({ status: 403 }))
      );

      component.createPoll();

      expect(component.error).toBe(
        'Vous devez être membre du groupe pour créer un sondage'
      );
      expect(component.creating).toBe(false);
    });

    it('should handle 401 error (not authenticated)', () => {
      component.pollTitle = 'Test Poll';
      component.selectedDates = ['2025-10-25', '2025-10-26'];

      mockPollsService.createPoll.mockReturnValue(
        throwError(() => ({ status: 401 }))
      );

      component.createPoll();

      expect(component.error).toBe(
        'Vous devez être connecté pour créer un sondage'
      );
      expect(component.creating).toBe(false);
    });

    it('should handle generic error', () => {
      component.pollTitle = 'Test Poll';
      component.selectedDates = ['2025-10-25', '2025-10-26'];

      mockPollsService.createPoll.mockReturnValue(
        throwError(() => ({ status: 500 }))
      );

      component.createPoll();

      expect(component.error).toBe('Erreur lors de la création du sondage');
      expect(component.creating).toBe(false);
    });
  });

  describe('Voting', () => {
    beforeEach(() => {
      component.poll = mockPoll;
    });

    it('should vote for a date when user is authenticated', () => {
      component.currentUserId = 'user-3';
      mockPollsService.vote.mockReturnValue(of(mockPoll));

      const emitSpy = jest.spyOn(component.voted, 'emit');

      component.vote('2025-11-01');

      expect(mockPollsService.vote).toHaveBeenCalledWith('poll-1', {
        userId: 'user-3',
        dateChoice: '2025-11-01',
      });

      expect(emitSpy).toHaveBeenCalled();
    });

    it('should not vote when poll is null', () => {
      component.poll = null;

      component.vote('2025-10-25');

      expect(mockPollsService.vote).not.toHaveBeenCalled();
    });

    it('should not vote when currentUserId is null', () => {
      component.currentUserId = null;

      component.vote('2025-10-25');

      expect(mockPollsService.vote).not.toHaveBeenCalled();
    });

    it('should handle vote error 403', () => {
      component.currentUserId = 'user-3';
      mockPollsService.vote.mockReturnValue(
        throwError(() => ({ status: 403 }))
      );

      component.vote('2025-11-01');

      expect(mockNotificationService.error).toHaveBeenCalledWith(
        'Vous devez être membre du groupe pour voter.'
      );
    });

    it('should handle vote error 401', () => {
      component.currentUserId = 'user-3';
      mockPollsService.vote.mockReturnValue(
        throwError(() => ({ status: 401 }))
      );

      component.vote('2025-11-01');

      expect(mockNotificationService.error).toHaveBeenCalledWith(
        'Vous devez être connecté pour voter.'
      );
    });
  });

  describe('Remove vote', () => {
    beforeEach(() => {
      component.poll = mockPoll;
      component.currentUserId = 'user-1';
    });

    it('should remove user vote', () => {
      mockPollsService.removeVote.mockReturnValue(of(mockPoll));

      const emitSpy = jest.spyOn(component.voted, 'emit');

      component.removeMyVote();

      expect(mockPollsService.removeVote).toHaveBeenCalledWith(
        'poll-1',
        'user-1'
      );
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should not remove vote when poll is null', () => {
      component.poll = null;

      component.removeMyVote();

      expect(mockPollsService.removeVote).not.toHaveBeenCalled();
    });

    it('should not remove vote when currentUserId is null', () => {
      component.currentUserId = null;

      component.removeMyVote();

      expect(mockPollsService.removeVote).not.toHaveBeenCalled();
    });

    it('should handle remove vote error', () => {
      mockPollsService.removeVote.mockReturnValue(
        throwError(() => ({ status: 500 }))
      );

      component.removeMyVote();

      expect(mockNotificationService.error).toHaveBeenCalledWith(
        'Erreur lors de la suppression du vote.'
      );
    });
  });

  describe('getUserVote', () => {
    it('should return user vote if exists', () => {
      component.poll = mockPoll;
      component.currentUserId = 'user-1';

      const vote = component.getUserVote();

      expect(vote).toBe('2025-10-25');
    });

    it('should return null if user has not voted', () => {
      component.poll = mockPoll;
      component.currentUserId = 'user-999';

      const vote = component.getUserVote();

      expect(vote).toBeNull();
    });

    it('should return null if poll is null', () => {
      component.poll = null;
      component.currentUserId = 'user-1';

      const vote = component.getUserVote();

      expect(vote).toBeNull();
    });

    it('should return null if currentUserId is null', () => {
      component.poll = mockPoll;
      component.currentUserId = null;

      const vote = component.getUserVote();

      expect(vote).toBeNull();
    });

    it('should return null if votes is undefined', () => {
      // Create a partial Poll object without votes to test edge case
      const pollWithoutVotes = {
        id: mockPoll.id,
        title: mockPoll.title,
        dates: mockPoll.dates,
        votes: {} as Record<string, string>, // Empty votes object
        createdAt: mockPoll.createdAt,
        updatedAt: mockPoll.updatedAt,
        groupId: mockPoll.groupId,
      };
      component.poll = pollWithoutVotes;
      component.currentUserId = 'user-1';

      const vote = component.getUserVote();

      expect(vote).toBeNull();
    });
  });
});
