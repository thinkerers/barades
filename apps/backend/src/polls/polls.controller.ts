import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { PollsService } from './polls.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createPollDto: CreatePollDto) {
    return this.pollsService.create(createPollDto, req.user.id);
  }

  @Get()
  findAll(@Query('groupId') groupId?: string) {
    return this.pollsService.findAll(groupId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pollsService.findOne(id);
  }

  @Patch(':id/vote')
  @UseGuards(JwtAuthGuard)
  vote(@Request() req, @Param('id') id: string, @Body() votePollDto: VotePollDto) {
    return this.pollsService.vote(id, votePollDto, req.user.id);
  }

  @Delete(':id/vote/:userId')
  @UseGuards(JwtAuthGuard)
  removeVote(@Request() req, @Param('id') id: string, @Param('userId') userId: string) {
    return this.pollsService.removeVote(id, userId, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pollsService.remove(id);
  }
}
