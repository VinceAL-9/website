import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';

export class CreateOfficerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  photoUrl: string;

  @IsString()
  @IsNotEmpty()
  academicYear: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
