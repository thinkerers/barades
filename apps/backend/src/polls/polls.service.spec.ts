import { Test, TestingModule } from '@nestjs/testing';
import { PollsService } from './polls.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';
import { CreatePollDto } from './dto/create-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';

describe('PollsService', () => {
  let service: PollsService;

  const mockGroupId = 'group-123';
  const mockUserId = 'user-456';
  const mockPollId = 'poll-789';

  const mockPoll = {
    id: mockPollId,
    title: 'Best date for next session?',
    dates: ['2025-10-25', '2025-10-26', '2025-11-01'],
    votes: {},
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    groupId: mockGroupId,
    group: {
      id: mockGroupId,
      name: 'Test Group',
    },
  };

  const mockPrismaService = {
    poll: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    groupMember: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PollsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PollsService>(PollsService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createPollDto: CreatePollDto = {
      title: 'Best date for next session?',
      dates: ['2025-10-25', '2025-10-26', '2025-11-01'],
      groupId: mockGroupId,
    };

    it('should create a poll when user is a group member', async () => {
      // Mock user is a member
      mockPrismaService.groupMember.findUnique.mockResolvedValue({
        id: 'membership-1',
        userId: mockUserId,
        groupId: mockGroupId,
        role: 'MEMBER',
        joinedAt: new Date(),
      });

      mockPrismaService.poll.create.mockResolvedValue(mockPoll);

      const result = await service.create(createPollDto, mockUserId);

      expect(mockPrismaService.groupMember.findUnique).toHaveBeenCalledWith({
        where: {
          userId_groupId: {
            userId: mockUserId,
            groupId: mockGroupId,
          },
        },
      });

      expect(mockPrismaService.poll.create).toHaveBeenCalledWith({
        data: {
          title: createPollDto.title,
          dates: createPollDto.dates,
          votes: {},
          groupId: mockGroupId,
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      expect(result).toEqual(mockPoll);
    });

    it('should throw ForbiddenException when user is not a group member', async () => {
      // Mock user is NOT a member
      mockPrismaService.groupMember.findUnique.mockResolvedValue(null);

      await expect(service.create(createPollDto, mockUserId)).rejects.toThrow(
        ForbiddenException
      );

      await expect(service.create(createPollDto, mockUserId)).rejects.toThrow(
        'Vous devez être membre du groupe pour effectuer cette action'
      );

      expect(mockPrismaService.poll.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all polls for a group', async () => {
      const mockPolls = [mockPoll];
      mockPrismaService.poll.findMany.mockResolvedValue(mockPolls);

      const result = await service.findAll(mockGroupId);

      expect(mockPrismaService.poll.findMany).toHaveBeenCalledWith({
        where: { groupId: mockGroupId },
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result).toEqual(mockPolls);
    });

    it('should return all polls when no groupId is provided', async () => {
      const mockPolls = [mockPoll];
      mockPrismaService.poll.findMany.mockResolvedValue(mockPolls);

      const result = await service.findAll();

      expect(mockPrismaService.poll.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result).toEqual(mockPolls);
    });
  });

  describe('findOne', () => {
    it('should return a poll by id with vote statistics', async () => {
      const pollWithMembers = {
        ...mockPoll,
        group: {
          ...mockPoll.group,
          members: [],
        },
      };

      mockPrismaService.poll.findUnique.mockResolvedValue(pollWithMembers);

      const result = await service.findOne(mockPollId);

      expect(mockPrismaService.poll.findUnique).toHaveBeenCalledWith({
        where: { id: mockPollId },
        include: {
          group: {
            select: {
              id: true,
              name: true,
              members: {
                select: {
                  userId: true,
                  user: {
                    select: {
                      id: true,
                      username: true,
                      avatar: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(mockPollId);
      expect(result.voteCounts).toEqual({
        '2025-10-25': 0,
        '2025-10-26': 0,
        '2025-11-01': 0,
      });
      expect(result.voteDetails).toBeDefined();
      expect(result.bestDate).toBeNull();
      expect(result.totalVotes).toBe(0);
    });
  });

  describe('vote', () => {
    const votePollDto: VotePollDto = {
      userId: mockUserId,
      dateChoice: '2025-10-25',
    };

    const pollWithVotes = {
      ...mockPoll,
      votes: {
        'user-123': '2025-10-26',
      },
    };

    it('should add a vote to a poll when user is a member', async () => {
      // Mock user is a member
      mockPrismaService.groupMember.findUnique.mockResolvedValue({
        id: 'membership-1',
        userId: mockUserId,
        groupId: mockGroupId,
        role: 'MEMBER',
        joinedAt: new Date(),
      });

      mockPrismaService.poll.findUnique.mockResolvedValue(pollWithVotes);

      const updatedPoll = {
        ...pollWithVotes,
        votes: {
          ...pollWithVotes.votes,
          [mockUserId]: votePollDto.dateChoice,
        },
      };

      mockPrismaService.poll.update.mockResolvedValue(updatedPoll);

      const result = await service.vote(mockPollId, votePollDto, mockUserId);

      expect(mockPrismaService.poll.update).toHaveBeenCalledWith({
        where: { id: mockPollId },
        data: {
          votes: {
            ...pollWithVotes.votes,
            [mockUserId]: votePollDto.dateChoice,
          },
        },
      });

      expect(result).toEqual(updatedPoll);
    });

    it('should throw ForbiddenException when user is not a group member', async () => {
      mockPrismaService.groupMember.findUnique.mockResolvedValue(null);
      mockPrismaService.poll.findUnique.mockResolvedValue(pollWithVotes);

      await expect(service.vote(mockPollId, votePollDto, mockUserId)).rejects.toThrow(
        ForbiddenException
      );

      expect(mockPrismaService.poll.update).not.toHaveBeenCalled();
    });

    it('should update existing vote if user votes again', async () => {
      const existingVote = {
        ...pollWithVotes,
        votes: {
          [mockUserId]: '2025-10-26', // Old vote
        },
      };

      mockPrismaService.groupMember.findUnique.mockResolvedValue({
        id: 'membership-1',
        userId: mockUserId,
        groupId: mockGroupId,
        role: 'MEMBER',
        joinedAt: new Date(),
      });

      mockPrismaService.poll.findUnique.mockResolvedValue(existingVote);

      const updatedPoll = {
        ...existingVote,
        votes: {
          [mockUserId]: '2025-10-25', // New vote
        },
      };

      mockPrismaService.poll.update.mockResolvedValue(updatedPoll);

      const result = await service.vote(mockPollId, {
        userId: mockUserId,
        dateChoice: '2025-10-25',
      }, mockUserId);

      expect(result.votes[mockUserId]).toBe('2025-10-25');
    });
  });

  describe('removeVote', () => {
    it('should remove a vote from a poll', async () => {
      const pollWithUserVote = {
        ...mockPoll,
        votes: {
          [mockUserId]: '2025-10-25',
          'user-other': '2025-10-26',
        },
      };

      mockPrismaService.poll.findUnique.mockResolvedValue(pollWithUserVote);

      const updatedPoll = {
        ...pollWithUserVote,
        votes: {
          'user-other': '2025-10-26',
        },
      };

      mockPrismaService.poll.update.mockResolvedValue(updatedPoll);

      const result = await service.removeVote(mockPollId, mockUserId, mockUserId);

      expect(mockPrismaService.poll.update).toHaveBeenCalledWith({
        where: { id: mockPollId },
        data: {
          votes: {
            'user-other': '2025-10-26',
          },
        },
      });

      expect(result.votes[mockUserId]).toBeUndefined();
      expect(result.votes['user-other']).toBe('2025-10-26');
    });

    it('should handle removing vote when user has not voted', async () => {
      const pollWithoutUserVote = {
        ...mockPoll,
        votes: {
          'user-other': '2025-10-26',
        },
      };

      mockPrismaService.poll.findUnique.mockResolvedValue(pollWithoutUserVote);
      mockPrismaService.poll.update.mockResolvedValue(pollWithoutUserVote);

      const result = await service.removeVote(mockPollId, mockUserId, mockUserId);

      expect(result.votes[mockUserId]).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should delete a poll', async () => {
      mockPrismaService.poll.delete.mockResolvedValue(mockPoll);

      await service.remove(mockPollId);

      expect(mockPrismaService.poll.delete).toHaveBeenCalledWith({
        where: { id: mockPollId },
      });
    });
  });
});
