import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { PrismaService } from '../prisma/prisma.service';

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
        recurrenceEndDate: createSessionDto.recurrenceEndDate ? new Date(createSessionDto.recurrenceEndDate) : null,
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

  update(_id: string, _updateSessionDto: UpdateSessionDto) {
    // TODO: Implement with proper Zod validation
    throw new Error('Method not implemented yet');
  }

  remove(_id: string) {
    // TODO: Implement later
    throw new Error('Method not implemented yet');
  }
}

