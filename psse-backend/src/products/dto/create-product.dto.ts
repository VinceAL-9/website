import { IsString, IsNotEmpty, IsNumber, IsInt, IsEnum, IsBoolean, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Category } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsEnum(Category)
  category: Category;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
