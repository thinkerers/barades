import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

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
    const filteredGroups = !userId
      ? groups.filter((group) => group.isPublic)
      : groups.filter((group) => {
          // Si utilisateur connecté, montrer :
          // - Tous les groupes publics
          // - Les groupes privés dont il est membre
          if (group.isPublic) return true;
          return group.members.some((member) => member.userId === userId);
        });

    // Map recruiting to isRecruiting for frontend consistency
    return filteredGroups.map((group) => {
      const isMember =
        Boolean(userId) &&
        group.members.some((member) => member.userId === userId);

      return {
        ...group,
        members: isMember ? group.members : undefined,
        currentUserIsMember: isMember,
        isRecruiting: group.recruiting,
      };
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

      const isMember = group.members.some((member) => member.userId === userId);
      if (!isMember) {
        throw new ForbiddenException(
          'This group is private and you are not a member.'
        );
      }
    }

    const isMember =
      !!userId && group.members.some((member) => member.userId === userId);

    // Map recruiting to isRecruiting for frontend consistency
    return {
      ...group,
      members: isMember ? group.members : undefined,
      currentUserIsMember: isMember,
      isRecruiting: group.recruiting,
    };
  }

  async joinGroup(id: string, userId: string, _joinGroupDto?: JoinGroupDto) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    if (!group.isPublic) {
      throw new ForbiddenException(
        'This group is private. Please contact an administrator to join.'
      );
    }

    if (!group.recruiting) {
      throw new BadRequestException('Ce groupe ne recrute pas actuellement.');
    }

    const isAlreadyMember = group.members.some(
      (member) => member.userId === userId
    );
    if (isAlreadyMember) {
      throw new BadRequestException('Vous êtes déjà membre de ce groupe.');
    }

    const maxMembers =
      (group as { maxMembers?: number | null }).maxMembers ?? null;
    if (maxMembers != null && group._count.members >= maxMembers) {
      throw new BadRequestException('Ce groupe est complet.');
    }

    await this.prisma.groupMember.create({
      data: {
        groupId: id,
        userId,
      },
    });

    const updatedMemberCount = group._count.members + 1;
    let isRecruiting: boolean = group.recruiting;

    if (maxMembers != null && updatedMemberCount >= maxMembers) {
      await this.prisma.group.update({
        where: { id },
        data: {
          recruiting: false,
        },
      });
      isRecruiting = false;
    }

    return {
      joined: true,
      groupId: id,
      memberCount: updatedMemberCount,
      maxMembers,
      isRecruiting,
    };
  }

  async leaveGroup(id: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    const isMember = group.members.some((member) => member.userId === userId);

    if (!isMember) {
      throw new BadRequestException('Vous ne faites pas partie de ce groupe.');
    }

    await this.prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId,
          groupId: id,
        },
      },
    });

    const updatedMemberCount = Math.max(group._count.members - 1, 0);
    let isRecruiting: boolean = group.recruiting;

    const maxMembers =
      (group as { maxMembers?: number | null }).maxMembers ?? null;

    if (
      maxMembers != null &&
      updatedMemberCount < maxMembers &&
      !group.recruiting
    ) {
      await this.prisma.group.update({
        where: { id },
        data: {
          recruiting: true,
        },
      });
      isRecruiting = true;
    }

    return {
      left: true,
      groupId: id,
      memberCount: updatedMemberCount,
      maxMembers,
      isRecruiting,
    };
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
