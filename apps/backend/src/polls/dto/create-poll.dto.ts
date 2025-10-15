import { IsString, IsArray, IsNotEmpty, ArrayMinSize } from 'class-validator';

export class CreatePollDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  dates: string[];

  @IsString()
  @IsNotEmpty()
  groupId: string;
}
