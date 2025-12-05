import { IsString, IsNumber, IsInt, IsEnum, IsBoolean, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
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
  @IsOptional()
  stock?: number;

  @IsEnum(Category)
  @IsOptional()
  category?: Category;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
