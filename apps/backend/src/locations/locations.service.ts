import { Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  create(_createLocationDto: CreateLocationDto) {
    // TODO: Implement with proper Zod validation
    throw new Error('Method not implemented yet');
  }

  findAll() {
    return this.prisma.location.findMany({
      include: {
        sessions: {
          where: {
            date: {
              gte: new Date(),
            },
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.location.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            host: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  update(_id: string, _updateLocationDto: UpdateLocationDto) {
    // TODO: Implement with proper Zod validation
    throw new Error('Method not implemented yet');
  }

  remove(_id: string) {
    // TODO: Implement later
    throw new Error('Method not implemented yet');
  }
}
