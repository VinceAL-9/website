import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { Category } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: Category) {
    return this.prisma.product.findMany({
      where: category ? { category } : undefined,
    });
  }
}
