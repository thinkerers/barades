import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';

interface PollVotes {
  [userId: string]: string; // userId -> dateChoice
}

@Injectable()
export class PollsService {
  constructor(private prisma: PrismaService) {}

  async create(createPollDto: CreatePollDto, userId: string) {
    // Vérifier que l'utilisateur est membre du groupe
    await this.checkGroupMembership(userId, createPollDto.groupId);

    return this.prisma.poll.create({
      data: {
        title: createPollDto.title,
        dates: createPollDto.dates,
        votes: {},
        groupId: createPollDto.groupId,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  private async checkGroupMembership(userId: string, groupId: string) {
    const membership = await this.prisma.groupMember.findFirst({
      where: {
        userId,
        groupId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Vous devez être membre du groupe pour effectuer cette action');
    }
  }

  async findAll(groupId?: string) {
    return this.prisma.poll.findMany({
      where: groupId ? { groupId } : undefined,
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            members: {
              select: {
                userId: true,
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
        },
      },
    });

    if (!poll) {
      return null;
    }

    // Calculate vote counts for each date
    const votes = poll.votes as PollVotes;
    const voteCounts: Record<string, number> = {};
    const voteDetails: Record<string, Array<{ userId: string; username: string }>> = {};

    poll.dates.forEach(date => {
      voteCounts[date] = 0;
      voteDetails[date] = [];
    });

    Object.entries(votes).forEach(([userId, dateChoice]) => {
      if (voteCounts[dateChoice] !== undefined) {
        voteCounts[dateChoice]++;
        
        const member = poll.group.members.find(m => m.userId === userId);
        if (member) {
          voteDetails[dateChoice].push({
            userId,
            username: member.user.username,
          });
        }
      }
    });

    // Find best date (most votes)
    let bestDate: string | null = null;
    let maxVotes = 0;

    Object.entries(voteCounts).forEach(([date, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        bestDate = date;
      }
    });

    return {
      ...poll,
      voteCounts,
      voteDetails,
      bestDate,
      totalVotes: Object.keys(votes).length,
    };
  }

  async vote(id: string, votePollDto: VotePollDto, authenticatedUserId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id },
      include: {
        group: true,
      },
    });

    if (!poll) {
      throw new Error('Poll not found');
    }

    // Vérifier que l'utilisateur est membre du groupe
    await this.checkGroupMembership(authenticatedUserId, poll.groupId);

    // S'assurer que l'utilisateur vote pour lui-même
    if (votePollDto.userId !== authenticatedUserId) {
      throw new ForbiddenException('Vous ne pouvez voter que pour vous-même');
    }

    // Verify that the date choice is valid
    if (!poll.dates.includes(votePollDto.dateChoice)) {
      throw new Error('Invalid date choice');
    }

    // Update votes
    const currentVotes = poll.votes as PollVotes || {};
    currentVotes[votePollDto.userId] = votePollDto.dateChoice;

    return this.prisma.poll.update({
      where: { id },
      data: {
        votes: currentVotes,
      },
    });
  }

  async removeVote(id: string, userId: string, authenticatedUserId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id },
      include: {
        group: true,
      },
    });

    if (!poll) {
      throw new Error('Poll not found');
    }

    // Vérifier que l'utilisateur est membre du groupe
    await this.checkGroupMembership(authenticatedUserId, poll.groupId);

    // S'assurer que l'utilisateur supprime son propre vote
    if (userId !== authenticatedUserId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que votre propre vote');
    }

    const currentVotes = poll.votes as PollVotes || {};
    delete currentVotes[userId];

    return this.prisma.poll.update({
      where: { id },
      data: {
        votes: currentVotes,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.poll.delete({
      where: { id },
    });
  }
}
