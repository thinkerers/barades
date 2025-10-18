import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionOwnerGuard } from './guards/session-owner.guard';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.create(createSessionDto);
  }

  @Get()
  findAll() {
    return this.sessionsService.findAll();
  }

  @Get('created-by-me')
  @UseGuards(JwtAuthGuard)
  getCreatedByMe(@CurrentUser() userId: string) {
    return this.sessionsService.findAllCreatedByUser(userId);
  }

  /**
   * Get statistics about sessions created by the current user
   * Returns total count and recent count (last 7 days)
   */
  @Get('stats/created-by-me')
  @UseGuards(JwtAuthGuard)
  getCreatedByMeStats(@CurrentUser() userId: string) {
    return this.sessionsService.getCreatedByMeStats(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, SessionOwnerGuard)
  update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
    return this.sessionsService.update(id, updateSessionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, SessionOwnerGuard)
  remove(@Param('id') id: string) {
    return this.sessionsService.remove(id);
  }
}
