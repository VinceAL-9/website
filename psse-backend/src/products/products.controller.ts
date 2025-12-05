import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Category } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query('category') category?: Category) {
    return this.productsService.findAll(category);
  }
}
