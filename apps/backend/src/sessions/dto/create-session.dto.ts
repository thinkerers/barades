import { IsString, IsBoolean, IsEnum, IsInt, IsDateString, IsOptional, Min, Max } from 'class-validator';

export enum SessionLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  OPEN = 'OPEN'
}

export enum TagColor {
  RED = 'RED',
  GREEN = 'GREEN',
  BLUE = 'BLUE',
  PURPLE = 'PURPLE',
  GRAY = 'GRAY'
}

export class CreateSessionDto {
  @IsString()
  game!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  recurrenceRule?: string;

  @IsOptional()
  @IsDateString()
  recurrenceEndDate?: string;

  @IsBoolean()
  online!: boolean;

  @IsEnum(SessionLevel)
  level!: SessionLevel;

  @IsInt()
  @Min(2)
  @Max(12)
  playersMax!: number;

  @IsEnum(TagColor)
  tagColor!: TagColor;

  @IsString()
  hostId!: string;

  @IsOptional()
  @IsString()
  locationId?: string;
}
