import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateReservationDto {
  @IsUUID()
  sessionId!: string;

  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsString()
  message?: string;
}
