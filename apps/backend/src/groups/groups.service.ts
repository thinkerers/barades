import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  async findAll(userId?: string) {
    const groups = await this.prisma.group.findMany({
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

    // Si pas d'utilisateur connecté, ne montrer que les groupes publics
    if (!userId) {
      return groups.filter(group => group.isPublic);
    }

    // Si utilisateur connecté, montrer :
    // - Tous les groupes publics
    // - Les groupes privés dont il est membre
    return groups.filter(group => {
      if (group.isPublic) return true;
      return group.members.some(member => member.userId === userId);
    });
  }

  async findOne(id: string, userId?: string) {
    const group = await this.prisma.group.findUnique({
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

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    // Si le groupe est privé, vérifier que l'utilisateur est membre
    if (!group.isPublic) {
      if (!userId) {
        throw new ForbiddenException('This group is private. Please log in.');
      }
      
      const isMember = group.members.some(member => member.userId === userId);
      if (!isMember) {
        throw new ForbiddenException('This group is private and you are not a member.');
      }
    }

    return group;
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
