import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PollsService } from './polls.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';

@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Post()
  create(@Body() createPollDto: CreatePollDto) {
    return this.pollsService.create(createPollDto);
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
  vote(@Param('id') id: string, @Body() votePollDto: VotePollDto) {
    return this.pollsService.vote(id, votePollDto);
  }

  @Delete(':id/vote/:userId')
  removeVote(@Param('id') id: string, @Param('userId') userId: string) {
    return this.pollsService.removeVote(id, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pollsService.remove(id);
  }
}
