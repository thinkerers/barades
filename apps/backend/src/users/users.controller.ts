import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me
   * Get current user profile
   */
  @Get('me')
  async getCurrentUser(@CurrentUser('sub') userId: string) {
    return this.usersService.getUserById(userId);
  }

  /**
   * GET /users/me/action-items
   * Get upcoming action items for the current user
   * Includes: upcoming sessions and pending reservations
   */
  @Get('me/action-items')
  async getActionItems(@CurrentUser('sub') userId: string) {
    return this.usersService.getActionItems(userId);
  }

  /**
   * PATCH /users/me
   * Update current user profile
   */
  @Patch('me')
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto
  ) {
    return this.usersService.updateProfile(userId, dto);
  }
}
