import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';

interface PollVotes {
  [userId: string]: string; // userId -> dateChoice
}

@Injectable()
export class PollsService {
  constructor(private prisma: PrismaService) {}

  async create(createPollDto: CreatePollDto) {
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

  async vote(id: string, votePollDto: VotePollDto) {
    const poll = await this.prisma.poll.findUnique({
      where: { id },
    });

    if (!poll) {
      throw new Error('Poll not found');
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

  async removeVote(id: string, userId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id },
    });

    if (!poll) {
      throw new Error('Poll not found');
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
