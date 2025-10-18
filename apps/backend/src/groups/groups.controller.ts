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
import { OptionalUser } from '../auth/decorators/optional-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsService } from './groups.service';

@Controller('groups')
@UseGuards(OptionalJwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Get()
  findAll(@OptionalUser() userId?: string) {
    return this.groupsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @OptionalUser() userId?: string) {
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
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }
}
