import { IsString, IsNotEmpty, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsBoolean()
  @IsOptional()
  isUpcoming?: boolean;
}
