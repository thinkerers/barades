import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  create(createSessionDto: CreateSessionDto) {
    return this.prisma.session.create({
      data: {
        game: createSessionDto.game,
        title: createSessionDto.title,
        description: createSessionDto.description,
        date: new Date(createSessionDto.date),
        recurrenceRule: createSessionDto.recurrenceRule,
        recurrenceEndDate: createSessionDto.recurrenceEndDate
          ? new Date(createSessionDto.recurrenceEndDate)
          : null,
        online: createSessionDto.online,
        level: createSessionDto.level,
        playersMax: createSessionDto.playersMax,
        playersCurrent: 0,
        tagColor: createSessionDto.tagColor,
        hostId: createSessionDto.hostId,
        locationId: createSessionDto.locationId,
      },
      include: {
        host: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        location: true,
      },
    });
  }

  findAll() {
    return this.prisma.session.findMany({
      include: {
        host: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        location: true,
        reservations: {
          include: {
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
      orderBy: {
        date: 'asc',
      },
    });
  }

  findAllCreatedByUser(userId: string) {
    return this.prisma.session.findMany({
      where: {
        hostId: userId,
      },
      include: {
        host: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        location: true,
        reservations: {
          include: {
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
      orderBy: {
        date: 'asc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.session.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
        location: true,
        reservations: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                skillLevel: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, updateSessionDto: UpdateSessionDto) {
    // Vérifier que la session existe
    const existingSession = await this.prisma.session.findUnique({
      where: { id },
    });

    if (!existingSession) {
      throw new Error('Session not found');
    }

    // Mettre à jour la session
    return this.prisma.session.update({
      where: { id },
      data: {
        ...(updateSessionDto.game && { game: updateSessionDto.game }),
        ...(updateSessionDto.title && { title: updateSessionDto.title }),
        ...(updateSessionDto.description !== undefined && {
          description: updateSessionDto.description,
        }),
        ...(updateSessionDto.date && { date: new Date(updateSessionDto.date) }),
        ...(updateSessionDto.recurrenceRule !== undefined && {
          recurrenceRule: updateSessionDto.recurrenceRule,
        }),
        ...(updateSessionDto.recurrenceEndDate !== undefined && {
          recurrenceEndDate: updateSessionDto.recurrenceEndDate
            ? new Date(updateSessionDto.recurrenceEndDate)
            : null,
        }),
        ...(updateSessionDto.online !== undefined && {
          online: updateSessionDto.online,
        }),
        ...(updateSessionDto.level && { level: updateSessionDto.level }),
        ...(updateSessionDto.playersMax && {
          playersMax: updateSessionDto.playersMax,
        }),
        ...(updateSessionDto.tagColor && {
          tagColor: updateSessionDto.tagColor,
        }),
        ...(updateSessionDto.locationId !== undefined && {
          locationId: updateSessionDto.locationId,
        }),
      },
      include: {
        host: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        location: true,
      },
    });
  }

  remove(_id: string) {
    // TODO: Implement later
    throw new Error('Method not implemented yet');
  }

  /**
   * Get statistics about sessions created by a specific user
   * Returns total count and count of sessions created in the last 7 days
   */
  async getCreatedByMeStats(userId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalCount, recentCount] = await Promise.all([
      this.prisma.session.count({
        where: {
          hostId: userId,
        },
      }),
      this.prisma.session.count({
        where: {
          hostId: userId,
          createdAt: { gte: sevenDaysAgo },
        },
      }),
    ]);

    return {
      totalCount,
      recentCount,
      period: 'last 7 days',
    };
  }
}
