import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from 'src/products/products.service';
import { PrismaService } from 'src/prisma';
import { NotFoundException } from '@nestjs/common';
import { Category } from '@prisma/client';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const mockProducts = [{ id: '1', name: 'Product 1' }];
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findAll();
      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: undefined,
      });
    });

    it('should filter products by category', async () => {
      const mockProducts = [{ id: '1', category: 'TSHIRT' }];
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findAll('TSHIRT');
      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { category: 'TSHIRT' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a product', async () => {
      const mockProduct = { id: '1', name: 'Product 1' };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne('1');
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product is not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createDto = {
        name: 'T-Shirt',
        description: 'Cotton',
        price: 500,
        stock: 50,
        category: 'TSHIRT' as Category,
        imageUrl: 'http://image.url',
        isFeatured: true,
      };

      const mockProduct = { id: '1', ...createDto };
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(createDto);
      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const existingProduct = { id: '1', name: 'T-Shirt' };
      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.update.mockResolvedValue({
        ...existingProduct,
        name: 'New Name',
      });

      const result = await service.update('1', { name: 'New Name' });
      expect(result.name).toBe('New Name');
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      await expect(service.update('1', { name: 'New' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const existingProduct = { id: '1' };
      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.delete.mockResolvedValue(existingProduct);

      await service.remove('1');
      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkStock', () => {
    it('should correctly map stock availability', async () => {
      const items = [
        { productId: '1', quantity: 2 },
        { productId: '2', quantity: 10 },
      ];

      mockPrismaService.product.findMany.mockResolvedValue([
        { id: '1', name: 'Product 1', stock: 5 },
        { id: '2', name: 'Product 2', stock: 2 },
      ]);

      const result = await service.checkStock(items);

      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toEqual({
        productId: '1',
        name: 'Product 1',
        requestedQuantity: 2,
        currentStock: 5,
        available: true,
      });
      expect(result.items[1]).toEqual({
        productId: '2',
        name: 'Product 2',
        requestedQuantity: 10,
        currentStock: 2,
        available: false,
      });
    });
  });
});
