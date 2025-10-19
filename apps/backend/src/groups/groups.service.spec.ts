import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { GroupsService } from './groups.service';

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
    groupMember: {
      create: jest.fn(),
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
      expect(result[0].isRecruiting).toBe(true);
      expect(result[0].currentUserIsMember).toBe(false);
      expect(result[0].members).toEqual(mockPublicGroup.members);
    });

    it('should return public groups and private groups where user is member', async () => {
      mockPrismaService.group.findMany.mockResolvedValue([
        mockPublicGroup,
        mockPrivateGroup,
      ]);

      const result = await service.findAll(mockUserId);

      expect(result).toHaveLength(2);
      expect(result.some((g) => g.id === mockGroupId)).toBe(true);
      expect(result.some((g) => g.id === 'group-private')).toBe(true);
      const publicGroup = result.find((g) => g.id === mockGroupId);
      const privateGroup = result.find((g) => g.id === 'group-private');

      expect(publicGroup?.currentUserIsMember).toBe(false);
      expect(publicGroup?.members).toEqual(mockPublicGroup.members);
      expect(privateGroup?.currentUserIsMember).toBe(true);
      expect(privateGroup?.members).toBeDefined();
    });

    it('should not return private groups where user is not a member', async () => {
      mockPrismaService.group.findMany.mockResolvedValue([
        mockPublicGroup,
        mockPrivateGroup,
      ]);

      const result = await service.findAll('other-user');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockGroupId);
      expect(result[0].currentUserIsMember).toBe(false);
      expect(result[0].members).toEqual(mockPublicGroup.members);
    });

    it('should map recruiting to isRecruiting for all groups', async () => {
      const groupRecruiting = { ...mockPublicGroup, recruiting: true };
      const groupNotRecruiting = {
        ...mockPublicGroup,
        id: 'group-2',
        recruiting: false,
      };

      mockPrismaService.group.findMany.mockResolvedValue([
        groupRecruiting,
        groupNotRecruiting,
      ]);

      const result = await service.findAll(mockUserId);

      expect(result[0].isRecruiting).toBe(true);
      expect(result[1].isRecruiting).toBe(false);
      expect(result[0].members).toEqual(groupRecruiting.members);
      expect(result[1].members).toEqual(groupNotRecruiting.members);
    });
  });

  describe('findOne', () => {
    it('should return a public group', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue(mockPublicGroup);

      const result = await service.findOne(mockGroupId);

      expect(result.id).toBe(mockGroupId);
      expect(result.isRecruiting).toBe(true);
      expect(result.currentUserIsMember).toBe(false);
      expect(result.members).toEqual(mockPublicGroup.members);
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
      expect(result.currentUserIsMember).toBe(true);
      expect(result.members).toBeDefined();
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

      await expect(
        service.findOne('group-private', 'other-user')
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.findOne('group-private', 'other-user')
      ).rejects.toThrow('This group is private and you are not a member.');
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

  describe('joinGroup', () => {
    type GroupStub = typeof mockPublicGroup & { maxMembers?: number | null };

    const buildMember = (id: string) => ({
      userId: id,
      user: {
        id,
        username: `${id}-username`,
        avatar: null,
      },
    });

    const buildGroup = (overrides: Partial<GroupStub> = {}): GroupStub => ({
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
      members: [],
      polls: [],
      _count: {
        members: 0,
      },
      ...overrides,
    });

    it('should throw NotFoundException when group does not exist', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue(null);

      await expect(service.joinGroup(mockGroupId, mockUserId)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ForbiddenException when group is private', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue(
        buildGroup({ isPublic: false })
      );

      await expect(service.joinGroup(mockGroupId, mockUserId)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should throw BadRequestException when group is not recruiting', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue(
        buildGroup({ recruiting: false })
      );

      await expect(service.joinGroup(mockGroupId, mockUserId)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException when user is already a member', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue(
        buildGroup({
          members: [buildMember(mockUserId)],
          _count: { members: 1 },
        })
      );

      await expect(service.joinGroup(mockGroupId, mockUserId)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException when group is full', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue(
        buildGroup({
          _count: { members: 2 },
          members: [buildMember('other-1'), buildMember('other-2')],
          maxMembers: 2,
        })
      );

      await expect(service.joinGroup(mockGroupId, mockUserId)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should create a membership and return success payload', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue(buildGroup());
      mockPrismaService.groupMember.create.mockResolvedValue({});

      const result = await service.joinGroup(mockGroupId, mockUserId);

      expect(mockPrismaService.groupMember.create).toHaveBeenCalledWith({
        data: {
          groupId: mockGroupId,
          userId: mockUserId,
        },
      });
      expect(mockPrismaService.group.update).not.toHaveBeenCalled();
      expect(result).toEqual({
        joined: true,
        groupId: mockGroupId,
        memberCount: 1,
        maxMembers: null,
        isRecruiting: true,
      });
    });

    it('should close recruiting when max members reached', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue(
        buildGroup({
          _count: { members: 1 },
          members: [buildMember('member-1')],
          maxMembers: 2,
        })
      );
      mockPrismaService.groupMember.create.mockResolvedValue({});
      mockPrismaService.group.update.mockResolvedValue({});

      const result = await service.joinGroup(mockGroupId, mockUserId);

      expect(mockPrismaService.group.update).toHaveBeenCalledWith({
        where: { id: mockGroupId },
        data: { recruiting: false },
      });
      expect(result).toEqual({
        joined: true,
        groupId: mockGroupId,
        memberCount: 2,
        maxMembers: 2,
        isRecruiting: false,
      });
    });
  });

  describe('leaveGroup', () => {
    type GroupStub = typeof mockPublicGroup & { maxMembers?: number | null };

    const buildMember = (id: string) => ({
      userId: id,
      user: {
        id,
        username: `${id}-username`,
        avatar: null,
      },
    });

    const buildGroup = (overrides: Partial<GroupStub> = {}): GroupStub => ({
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
      members: [],
      polls: [],
      _count: {
        members: 0,
      },
      ...overrides,
    });

    it('should throw NotFoundException when group does not exist', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue(null);

      await expect(service.leaveGroup(mockGroupId, mockUserId)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException when user is not a member', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue(buildGroup());

      await expect(service.leaveGroup(mockGroupId, mockUserId)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should remove membership and return success payload', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue(
        buildGroup({
          members: [buildMember(mockUserId), buildMember('other-1')],
          _count: { members: 2 },
          recruiting: true,
        })
      );
      mockPrismaService.groupMember.delete.mockResolvedValue({});

      const result = await service.leaveGroup(mockGroupId, mockUserId);

      expect(mockPrismaService.groupMember.delete).toHaveBeenCalledWith({
        where: {
          userId_groupId: {
            userId: mockUserId,
            groupId: mockGroupId,
          },
        },
      });
      expect(mockPrismaService.group.update).not.toHaveBeenCalled();
      expect(result).toEqual({
        left: true,
        groupId: mockGroupId,
        memberCount: 1,
        maxMembers: null,
        isRecruiting: true,
      });
    });

    it('should reopen recruiting when capacity allows', async () => {
      mockPrismaService.group.findUnique.mockResolvedValue(
        buildGroup({
          members: [buildMember(mockUserId), buildMember('other-1')],
          _count: { members: 2 },
          recruiting: false,
          maxMembers: 2,
        })
      );
      mockPrismaService.groupMember.delete.mockResolvedValue({});
      mockPrismaService.group.update.mockResolvedValue({});

      const result = await service.leaveGroup(mockGroupId, mockUserId);

      expect(mockPrismaService.group.update).toHaveBeenCalledWith({
        where: { id: mockGroupId },
        data: { recruiting: true },
      });
      expect(result).toEqual({
        left: true,
        groupId: mockGroupId,
        memberCount: 1,
        maxMembers: 2,
        isRecruiting: true,
      });
    });
  });
});
