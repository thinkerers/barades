import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EmailService, ReservationEmailData } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  async create(createReservationDto: CreateReservationDto) {
    const { sessionId, userId, message } = createReservationDto;

    // 1. Récupérer la session avec toutes les infos nécessaires
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        host: true,
        location: true,
        reservations: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session non trouvée');
    }

    // 2. Vérifier les places disponibles
    if (session.playersCurrent >= session.playersMax) {
      throw new BadRequestException(
        'Session complète - plus de places disponibles'
      );
    }

    // 3. Vérifier que l'utilisateur n'a pas déjà réservé
    const existingReservation = session.reservations.find(
      (r) => r.userId === userId
    );
    if (existingReservation) {
      throw new BadRequestException(
        'Vous avez déjà réservé pour cette session'
      );
    }

    // 4. Récupérer l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // 5. Créer la réservation
    const reservation = await this.prisma.reservation.create({
      data: {
        sessionId,
        userId,
        message,
        status: 'CONFIRMED',
      },
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

    // 6. Incrémenter le nombre de joueurs
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        playersCurrent: { increment: 1 },
      },
    });

    // 7. Préparer les données pour les emails
    const emailData: ReservationEmailData = {
      userName:
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.username,
      userEmail: user.email,
      sessionTitle: session.title,
      sessionDate: session.date,
      locationName: session.location?.name || 'En ligne',
      locationAddress: session.location?.address
        ? `${session.location.address}, ${session.location.city}`
        : 'Session en ligne',
      hostName:
        session.host.firstName && session.host.lastName
          ? `${session.host.firstName} ${session.host.lastName}`
          : session.host.username,
      hostEmail: session.host.email,
      groupName: 'Barades', // Pas de relation group dans le schéma actuel
    };

    // 8. Envoyer les emails (en parallèle, sans bloquer)
    Promise.all([
      this.emailService.sendReservationConfirmation(emailData),
      this.emailService.sendHostNotification(emailData),
    ]).catch((error) => {
      this.logger.error(`Failed to send reservation emails: ${error}`);
    });

    return reservation;
  }

  async findAll(userId?: string) {
    if (userId) {
      return this.prisma.reservation.findMany({
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
    }

    return this.prisma.reservation.findMany({
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
  }

  async findOne(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
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

    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }

    return reservation;
  }

  async update(id: string, updateReservationDto: UpdateReservationDto) {
    await this.findOne(id); // Vérifie que la réservation existe

    return this.prisma.reservation.update({
      where: { id },
      data: updateReservationDto,
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
  }

  async remove(id: string) {
    const reservation = await this.findOne(id);

    // Décrémenter le nombre de joueurs
    await this.prisma.session.update({
      where: { id: reservation.sessionId },
      data: {
        playersCurrent: { decrement: 1 },
      },
    });

    return this.prisma.reservation.delete({
      where: { id },
    });
  }

  /**
   * Get all pending reservations for sessions hosted by a specific user
   * Returns reservations with user and session details
   */
  async getPendingForMySessions(hostId: string) {
    return this.prisma.reservation.findMany({
      where: {
        status: 'PENDING',
        session: {
          hostId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
            date: true,
            game: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Update reservation status (CONFIRMED or CANCELLED)
   * Validates that the requesting user is the session host
   */
  async updateStatus(
    reservationId: string,
    status: 'CONFIRMED' | 'CANCELLED',
    requestingUserId: string
  ) {
    // Find reservation with session details
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        session: {
          select: {
            hostId: true,
            id: true,
            playersCurrent: true,
            playersMax: true,
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // Verify requesting user is the session host
    if (reservation.session.hostId !== requestingUserId) {
      throw new BadRequestException(
        'Only session host can update reservation status'
      );
    }

    // Check if confirming would exceed max players
    if (status === 'CONFIRMED' && reservation.status !== 'CONFIRMED') {
      if (
        reservation.session.playersCurrent >= reservation.session.playersMax
      ) {
        throw new BadRequestException(
          'Session is full - cannot confirm more reservations'
        );
      }
    }

    // Update reservation status
    const updated = await this.prisma.reservation.update({
      where: { id: reservationId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
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

    // Update player count if status changed to/from CONFIRMED
    if (status === 'CONFIRMED' && reservation.status !== 'CONFIRMED') {
      await this.prisma.session.update({
        where: { id: reservation.session.id },
        data: { playersCurrent: { increment: 1 } },
      });
    } else if (status === 'CANCELLED' && reservation.status === 'CONFIRMED') {
      await this.prisma.session.update({
        where: { id: reservation.session.id },
        data: { playersCurrent: { decrement: 1 } },
      });
    }

    return updated;
  }
}
