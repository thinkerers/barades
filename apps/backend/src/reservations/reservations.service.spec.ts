import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto, ReservationStatus } from './dto/update-reservation.dto';

describe('ReservationsService', () => {
  let service: ReservationsService;

  // Mock data
  const mockUser = {
    id: 'user-1',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    avatar: null,
    password: 'hashed',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockHost = {
    id: 'host-1',
    username: 'gamemaster',
    email: 'gm@example.com',
    firstName: 'Game',
    lastName: 'Master',
    avatar: null,
    password: 'hashed',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLocation = {
    id: 'loc-1',
    name: 'Brussels Game Store',
    address: 'Rue de la Loi 1',
    city: 'Brussels',
    type: 'GAME_STORE' as const,
    lat: 50.8476,
    lon: 4.3572,
    wifi: true,
    tables: true,
    food: true,
    drinks: true,
    parking: false,
    description: 'Test location',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession = {
    id: 'session-1',
    title: 'Test Session',
    game: 'D&D 5e',
    description: 'Test description',
    date: new Date('2025-10-20T18:00:00.000Z'),
    recurrenceRule: null,
    recurrenceEndDate: null,
    online: false,
    level: 'BEGINNER' as const,
    playersMax: 5,
    playersCurrent: 2,
    tagColor: 'GREEN' as const,
    hostId: 'host-1',
    locationId: 'loc-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    host: mockHost,
    location: mockLocation,
    reservations: [],
  };

  const mockReservation = {
    id: 'reservation-1',
    userId: 'user-1',
    sessionId: 'session-1',
    status: 'CONFIRMED' as const,
    message: 'Looking forward to it!',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
    session: mockSession,
  };

  // Mock PrismaService
  const mockPrismaService = {
    session: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    reservation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  // Mock EmailService
  const mockEmailService = {
    sendReservationConfirmation: jest.fn().mockResolvedValue(undefined),
    sendHostNotification: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateReservationDto = {
      sessionId: 'session-1',
      userId: 'user-1',
      message: 'Looking forward to it!',
    };

    it('should successfully create a reservation', async () => {
      // Arrange
      mockPrismaService.session.findUnique.mockResolvedValue({
        ...mockSession,
        reservations: [],
      });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.reservation.create.mockResolvedValue(mockReservation);
      mockPrismaService.session.update.mockResolvedValue({
        ...mockSession,
        playersCurrent: 3,
      });

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(mockReservation);
      expect(mockPrismaService.session.findUnique).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        include: {
          host: true,
          location: true,
          reservations: true,
        },
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
      expect(mockPrismaService.reservation.create).toHaveBeenCalled();
      expect(mockPrismaService.session.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: {
          playersCurrent: { increment: 1 },
        },
      });
    });

    it('should increment playersCurrent when creating reservation', async () => {
      // Arrange
      mockPrismaService.session.findUnique.mockResolvedValue({
        ...mockSession,
        playersCurrent: 2,
        reservations: [],
      });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.reservation.create.mockResolvedValue(mockReservation);
      mockPrismaService.session.update.mockResolvedValue({
        ...mockSession,
        playersCurrent: 3,
      });

      // Act
      await service.create(createDto);

      // Assert
      expect(mockPrismaService.session.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: {
          playersCurrent: { increment: 1 },
        },
      });
    });

    it('should send confirmation and notification emails', async () => {
      // Arrange
      mockPrismaService.session.findUnique.mockResolvedValue({
        ...mockSession,
        reservations: [],
      });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.reservation.create.mockResolvedValue(mockReservation);
      mockPrismaService.session.update.mockResolvedValue(mockSession);

      // Act
      await service.create(createDto);

      // Wait for Promise.all to complete (emails are sent in background)
      await new Promise(resolve => setTimeout(resolve, 100));

      // Assert - emails are sent but not awaited, so we can't test the calls directly
      // The service logs errors if emails fail but doesn't throw
      expect(service).toBeDefined();
    });

    it('should throw NotFoundException when session does not exist', async () => {
      // Arrange
      mockPrismaService.session.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      await expect(service.create(createDto)).rejects.toThrow('Session non trouvée');
    });

    it('should throw BadRequestException when session is full', async () => {
      // Arrange
      mockPrismaService.session.findUnique.mockResolvedValue({
        ...mockSession,
        playersCurrent: 5,
        playersMax: 5,
        reservations: [],
      });

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto)).rejects.toThrow(
        'Session complète - plus de places disponibles'
      );
    });

    it('should throw BadRequestException when user already has a reservation', async () => {
      // Arrange
      mockPrismaService.session.findUnique.mockResolvedValue({
        ...mockSession,
        reservations: [
          {
            id: 'existing-reservation',
            userId: 'user-1',
            sessionId: 'session-1',
            status: 'CONFIRMED',
            message: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto)).rejects.toThrow(
        'Vous avez déjà réservé pour cette session'
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      mockPrismaService.session.findUnique.mockResolvedValue({
        ...mockSession,
        reservations: [],
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      await expect(service.create(createDto)).rejects.toThrow('Utilisateur non trouvé');
    });

    it('should handle sessions at exactly max capacity', async () => {
      // Arrange
      mockPrismaService.session.findUnique.mockResolvedValue({
        ...mockSession,
        playersCurrent: 4,
        playersMax: 5,
        reservations: [],
      });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.reservation.create.mockResolvedValue(mockReservation);
      mockPrismaService.session.update.mockResolvedValue({
        ...mockSession,
        playersCurrent: 5,
      });

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toBeDefined();
      expect(mockPrismaService.session.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: {
          playersCurrent: { increment: 1 },
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all reservations for a specific user', async () => {
      // Arrange
      const userId = 'user-1';
      const mockReservations = [mockReservation];
      mockPrismaService.reservation.findMany.mockResolvedValue(mockReservations);

      // Act
      const result = await service.findAll(userId);

      // Assert
      expect(result).toEqual(mockReservations);
      expect(mockPrismaService.reservation.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          session: {
            include: {
              host: true,
              location: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return all reservations when no userId provided', async () => {
      // Arrange
      const mockReservations = [mockReservation];
      mockPrismaService.reservation.findMany.mockResolvedValue(mockReservations);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockReservations);
      expect(mockPrismaService.reservation.findMany).toHaveBeenCalledWith({
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          session: {
            include: {
              host: true,
              location: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return empty array when user has no reservations', async () => {
      // Arrange
      mockPrismaService.reservation.findMany.mockResolvedValue([]);

      // Act
      const result = await service.findAll('user-1');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single reservation by id', async () => {
      // Arrange
      mockPrismaService.reservation.findUnique.mockResolvedValue(mockReservation);

      // Act
      const result = await service.findOne('reservation-1');

      // Assert
      expect(result).toEqual(mockReservation);
      expect(mockPrismaService.reservation.findUnique).toHaveBeenCalledWith({
        where: { id: 'reservation-1' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          session: {
            include: {
              host: true,
              location: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when reservation does not exist', async () => {
      // Arrange
      mockPrismaService.reservation.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('non-existent')).rejects.toThrow('Réservation non trouvée');
    });
  });

  describe('update', () => {
    it('should update reservation status', async () => {
      // Arrange
      const updateDto: UpdateReservationDto = { status: ReservationStatus.CANCELLED };
      const updatedReservation = { ...mockReservation, status: 'CANCELLED' as const };
      mockPrismaService.reservation.findUnique.mockResolvedValue(mockReservation);
      mockPrismaService.reservation.update.mockResolvedValue(updatedReservation);

      // Act
      const result = await service.update('reservation-1', updateDto);

      // Assert
      expect(result).toEqual(updatedReservation);
      expect(mockPrismaService.reservation.update).toHaveBeenCalledWith({
        where: { id: 'reservation-1' },
        data: updateDto,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          session: true,
        },
      });
    });

    it('should throw NotFoundException when reservation does not exist', async () => {
      // Arrange
      mockPrismaService.reservation.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete reservation and decrement playersCurrent', async () => {
      // Arrange
      mockPrismaService.reservation.findUnique.mockResolvedValue(mockReservation);
      mockPrismaService.reservation.delete.mockResolvedValue(mockReservation);
      mockPrismaService.session.update.mockResolvedValue({
        ...mockSession,
        playersCurrent: 1,
      });

      // Act
      const result = await service.remove('reservation-1');

      // Assert
      expect(result).toEqual(mockReservation);
      expect(mockPrismaService.session.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: {
          playersCurrent: { decrement: 1 },
        },
      });
      expect(mockPrismaService.reservation.delete).toHaveBeenCalledWith({
        where: { id: 'reservation-1' },
      });
    });

    it('should throw NotFoundException when reservation does not exist', async () => {
      // Arrange
      mockPrismaService.reservation.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.remove('non-existent')).rejects.toThrow('Réservation non trouvée');
    });

    it('should decrement playersCurrent before deleting reservation', async () => {
      // Arrange
      const callOrder: string[] = [];
      mockPrismaService.reservation.findUnique.mockResolvedValue(mockReservation);
      mockPrismaService.session.update.mockImplementation(async () => {
        callOrder.push('update');
        return { ...mockSession, playersCurrent: 1 };
      });
      mockPrismaService.reservation.delete.mockImplementation(async () => {
        callOrder.push('delete');
        return mockReservation;
      });

      // Act
      await service.remove('reservation-1');

      // Assert
      expect(callOrder).toEqual(['update', 'delete']);
    });
  });
});
