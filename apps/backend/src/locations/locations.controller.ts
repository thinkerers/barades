import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LocationOwnerGuard } from './guards/location-owner.guard';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createLocationDto: CreateLocationDto,
    @CurrentUser() userId: string
  ) {
    return this.locationsService.create(createLocationDto, userId);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@CurrentUser() userId?: string) {
    return this.locationsService.findAll(userId);
  }

  @Get('created-by-me')
  @UseGuards(JwtAuthGuard)
  findCreatedByMe(@CurrentUser() userId: string) {
    return this.locationsService.findCreatedByMe(userId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() userId?: string) {
    return this.locationsService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, LocationOwnerGuard)
  update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto
  ) {
    return this.locationsService.update(id, updateLocationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, LocationOwnerGuard)
  remove(@Param('id') id: string) {
    return this.locationsService.remove(id);
  }
}
