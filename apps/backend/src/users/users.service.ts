import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get user profile by ID
   */
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        skillLevel: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   * Only allows updating: firstName, lastName, bio, avatar, skillLevel
   * Email and username cannot be changed for security reasons
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Verify user exists
    await this.getUserById(userId);

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        bio: dto.bio,
        avatar: dto.avatar,
        skillLevel: dto.skillLevel,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        skillLevel: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Get action items for a user
   * Returns upcoming sessions and pending reservations
   */
  async getActionItems(userId: string) {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    // Get upcoming sessions (next 7 days) where user is confirmed
    const upcomingSessions = await this.prisma.reservation.findMany({
      where: {
        userId,
        status: 'CONFIRMED',
        session: {
          date: {
            gte: now,
            lte: sevenDaysFromNow,
          },
        },
      },
      include: {
        session: {
          select: {
            id: true,
            title: true,
            date: true,
            game: true,
            location: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        session: {
          date: 'asc',
        },
      },
      take: 5,
    });

    // Get pending reservations for sessions the user hosts
    const pendingReservations = await this.prisma.reservation.findMany({
      where: {
        status: 'PENDING',
        session: {
          hostId: userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 5,
    });

    return {
      upcomingSessions,
      pendingReservations,
    };
  }
}
