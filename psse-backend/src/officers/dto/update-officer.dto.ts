import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateOfficerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @IsOptional()
  academicYear?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
