import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { Category } from '@prisma/client';
import { CheckStockItemDto, CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: Category) {
    return this.prisma.product.findMany({
      where: category ? { category } : undefined,
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        price: createProductDto.price,
        stock: createProductDto.stock,
        category: createProductDto.category,
        imageUrl: createProductDto.imageUrl!,
        isFeatured: createProductDto.isFeatured ?? false,
      },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async checkStock(items: CheckStockItemDto[]) {
    const productIds = items.map((item) => item.productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        stock: true,
      },
    });

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    return {
      items: items.map((item) => {
        const product = productMap.get(item.productId);
        const currentStock = product?.stock ?? 0;

        return {
          productId: item.productId,
          name: product?.name ?? null,
          requestedQuantity: item.quantity,
          currentStock,
          available: currentStock >= item.quantity,
        };
      }),
    };
  }
}
