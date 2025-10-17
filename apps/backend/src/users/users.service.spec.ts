import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      const mockUser = {
        id: '1',
        email: 'alice@example.com',
        username: 'alice_dm',
        firstName: 'Alice',
        lastName: 'Dupont',
        bio: 'D&D player',
        avatar: null,
        skillLevel: 'INTERMEDIATE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserById('1');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserById('999')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const userId = '1';
      const dto = {
        firstName: 'Alice',
        lastName: 'Dupont',
        bio: 'Updated bio',
      };

      const mockExistingUser = {
        id: userId,
        email: 'alice@example.com',
        username: 'alice_dm',
        firstName: 'Alice',
        lastName: 'Smith',
        bio: 'Old bio',
        avatar: null,
        skillLevel: 'BEGINNER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedUser = {
        ...mockExistingUser,
        ...dto,
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockExistingUser);
      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.updateProfile(userId, dto);

      expect(result.bio).toBe('Updated bio');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: dto,
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile('999', { bio: 'test' })
      ).rejects.toThrow(NotFoundException);
    });
  });
});
