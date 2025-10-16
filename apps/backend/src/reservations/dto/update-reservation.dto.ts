import { PartialType } from '@nestjs/mapped-types';
import { CreateReservationDto } from './create-reservation.dto';
import { IsEnum, IsOptional } from 'class-validator';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

export class UpdateReservationDto extends PartialType(CreateReservationDto) {
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}
