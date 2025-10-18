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
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() _userId: string,
    @Body() createGroupDto: CreateGroupDto
  ) {
    return this.groupsService.create(createGroupDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() userId: string) {
    return this.groupsService.findAll(userId);
  }

  /**
   * Get statistics about groups managed by the current user
   * Returns count of groups where user is either creator or has ADMIN role
   */
  @Get('stats/managed-by-me')
  @UseGuards(JwtAuthGuard)
  getManagedByMeStats(@CurrentUser() userId: string) {
    return this.groupsService.getManagedByMeStats(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.groupsService.findOne(id, userId);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  join(
    @Param('id') id: string,
    @Body() joinGroupDto: JoinGroupDto,
    @CurrentUser() userId: string
  ) {
    return this.groupsService.joinGroup(id, userId, joinGroupDto);
  }

  @Delete(':id/join')
  @UseGuards(JwtAuthGuard)
  leave(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.groupsService.leaveGroup(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @CurrentUser() _userId: string,
    @Body() updateGroupDto: UpdateGroupDto
  ) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() _userId: string) {
    return this.groupsService.remove(id);
  }
}
