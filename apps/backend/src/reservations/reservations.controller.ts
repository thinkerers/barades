import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get()
  findAll(@Query('userId') userId?: string) {
    return this.reservationsService.findAll(userId);
  }

  /**
   * Get all pending reservations for sessions hosted by the current user
   * Returns reservations awaiting approval from session hosts
   */
  @Get('pending/for-my-sessions')
  @UseGuards(JwtAuthGuard)
  getPendingForMySessions(@CurrentUser() userId: string) {
    return this.reservationsService.getPendingForMySessions(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  /**
   * Update reservation status (CONFIRMED or CANCELLED)
   * Only session host can update status
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateReservationStatusDto,
    @CurrentUser() userId: string
  ) {
    return this.reservationsService.updateStatus(
      id,
      updateStatusDto.status,
      userId
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto
  ) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }
}
