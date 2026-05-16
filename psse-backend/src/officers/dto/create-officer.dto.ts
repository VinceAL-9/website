import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  Min,
  IsEnum,
} from 'class-validator';
import { OfficerCategory } from '@prisma/client';

export class CreateOfficerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  position!: string;

  @IsEnum(OfficerCategory)
  category!: OfficerCategory;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @IsNotEmpty()
  academicYear!: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
