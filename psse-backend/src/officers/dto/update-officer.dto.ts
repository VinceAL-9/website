import { IsString, IsInt, IsOptional, Min, IsEnum } from 'class-validator';
import { OfficerCategory } from '@prisma/client';

export class UpdateOfficerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsEnum(OfficerCategory)
  @IsOptional()
  category?: OfficerCategory;

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
