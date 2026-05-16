import {
  IsString,
  IsNumber,
  IsInt,
  IsEnum,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Category } from '@prisma/client';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  price?: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  stock?: number;

  @IsEnum(Category)
  @IsOptional()
  category?: Category;

  @IsString()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    // Transform empty string to undefined so validation passes
    if (value === '' || value === null || value === undefined) return undefined;
    return value as string;
  })
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return Boolean(value);
  })
  isFeatured?: boolean;
}
