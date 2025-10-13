import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  create(_createGroupDto: CreateGroupDto) {
    // TODO: Implement with proper Zod validation
    throw new Error('Method not implemented yet');
  }

  findAll() {
    return this.prisma.group.findMany({
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        members: {
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
        polls: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.group.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
        members: {
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
        polls: true,
      },
    });
  }

  update(_id: string, _updateGroupDto: UpdateGroupDto) {
    // TODO: Implement with proper Zod validation
    throw new Error('Method not implemented yet');
  }

  remove(_id: string) {
    // TODO: Implement later
    throw new Error('Method not implemented yet');
  }
}
