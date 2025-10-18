import { IsEnum } from 'class-validator';

export class UpdateReservationStatusDto {
  @IsEnum(['CONFIRMED', 'CANCELLED'], {
    message: 'Status must be either CONFIRMED or CANCELLED',
  })
  status: 'CONFIRMED' | 'CANCELLED';
}
