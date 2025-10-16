import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('GroupsService', () => {
  let service: GroupsService;

  const mockUserId = 'user-123';
  const mockGroupId = 'group-456';

  const mockPublicGroup = {
    id: mockGroupId,
    name: 'Public Gaming Group',
    games: ['D&D', 'Pathfinder'],
    location: 'Brussels',
    playstyle: 'STORY_DRIVEN',
    description: 'A public group for RPG fans',
    recruiting: true,
    isPublic: true,
    avatar: 'avatar.jpg',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    creatorId: 'creator-1',
    creator: {
      id: 'creator-1',
      username: 'dm_master',
      avatar: null,
    },
    members: [
      {
        userId: 'creator-1',
        user: {
          id: 'creator-1',
          username: 'dm_master',
          avatar: null,
        },
      },
    ],
    polls: [],
    _count: {
      members: 1,
    },
  };

  const mockPrivateGroup = {
    ...mockPublicGroup,
    id: 'group-private',
    name: 'Private Elite Group',
    recruiting: false,
    isPublic: false,
    members: [
      {
        userId: mockUserId,
        user: {
          id: mockUserId,
          username: 'member1',
          avatar: null,
        },
      },
    ],
  };

  const mockPrismaService = {
    group: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return only public groups when user is not authenticated', async () => {
      mockPrismaService.group.findMany.mockResolvedValue([
        mockPublicGroup,
        mockPrivateGroup,
      ]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockGroupId);
      expect(result[0].isPublic).toBe(true);
      expect(result[0].isRecruiting).toBe(true); // Mapped from recruiting
    });

    it('should return public groups and private groups where user is member', async () => {
      mockPrismaService.group.findMany.mockResolvedValue([
        mockPublicGroup,
        mockPrivateGroup,
      ]);

      const result = await service.findAll(mockUserId);

      expect(result).toHaveLength(2);
      expect(result.some(g => g.id === mockGroupId)).toBe(true);
      expect(result.some(g => g.id === 'group-private')).toBe(true);
    });

    it('should not return private groups where user is not a member', async () => {
      mockPrismaService.group.findMany.mockResolvedValue([
        mockPublicGroup,
        mockPrivateGroup,
      ]);

      const result = await service.findAll('other-user');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockGroupId);
    });

    it('should map recruiting to isRecruiting for all groups', async () => {
      const groupRecruiting = { ...mockPublicGroup, recruiting: true };
      const groupNotRecruiting = { 
        ...mockPublicGroup, 
        id: 'group-2',
        recruiting: false 
      };

      mockPrismaService.group.findMany.mockResolvedValue([
        groupRecruiting,
        groupNotRecruiting,
      ]);

      const result = await service.findAll(mockUserId);

      expect(result[0].isRecruiting).toBe(true);
      expect(result[1].isRecruiting).toBe(false);
    });
  });

  describe('findOne', () => {
    it('should return a public group', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue(mockPublicGroup);

      const result = await service.findOne(mockGroupId);

      expect(result.id).toBe(mockGroupId);
      expect(result.isRecruiting).toBe(true); // Mapped from recruiting
      expect(mockPrismaService.group.findUnique).toHaveBeenCalledWith({
        where: { id: mockGroupId },
        include: expect.objectContaining({
          creator: expect.any(Object),
          members: expect.any(Object),
          polls: true,
        }),
      });
    });

    it('should return a private group when user is a member', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue(mockPrivateGroup);

      const result = await service.findOne('group-private', mockUserId);

      expect(result.id).toBe('group-private');
      expect(result.isRecruiting).toBe(false);
    });

    it('should throw ForbiddenException for private group when user is not authenticated', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue(mockPrivateGroup);

      await expect(service.findOne('group-private')).rejects.toThrow(
        ForbiddenException
      );
      await expect(service.findOne('group-private')).rejects.toThrow(
        'This group is private. Please log in.'
      );
    });

    it('should throw ForbiddenException for private group when user is not a member', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue(mockPrivateGroup);

      await expect(service.findOne('group-private', 'other-user')).rejects.toThrow(
        ForbiddenException
      );
      await expect(service.findOne('group-private', 'other-user')).rejects.toThrow(
        'This group is private and you are not a member.'
      );
    });

    it('should throw NotFoundException when group does not exist', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException
      );
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        'Group with ID nonexistent-id not found'
      );
    });

    it('should map recruiting to isRecruiting', async () => {
      const group = { ...mockPublicGroup, recruiting: false };
      mockPrismaService.group.findUnique.mockResolvedValue(group);

      const result = await service.findOne(mockGroupId);

      expect(result.isRecruiting).toBe(false);
    });
  });
});
