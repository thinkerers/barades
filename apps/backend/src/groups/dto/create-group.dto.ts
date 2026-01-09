import {
  IsString,
  IsBoolean,
  IsEnum,
  IsArray,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Playstyle } from '../../../generated/prisma';

export class CreateGroupDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @IsArray()
  @IsString({ each: true })
  games!: string[];

  @IsString()
  @MinLength(2)
  location!: string;

  @IsEnum(Playstyle)
  playstyle!: Playstyle;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description!: string;

  @IsOptional()
  @IsBoolean()
  recruiting?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  avatar?: string;
}
