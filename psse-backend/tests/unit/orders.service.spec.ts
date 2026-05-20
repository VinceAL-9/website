import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from 'src/orders/orders.service';
import { PrismaService } from 'src/prisma';
import { CloudinaryService } from 'src/cloudinary';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { cloudinaryMock } from '../mocks/cloudinary.mock';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockPrismaService = {
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CloudinaryService, useValue: cloudinaryMock },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      const createDto = {
        customerName: 'Test',
        studentId: '123',
        contactNumber: '123',
        customerEmail: 'test@test.com',
        items: [{ productId: 'p1', quantity: 2 }],
      };

      const mockProduct = {
        id: 'p1',
        name: 'Product',
        stock: 10,
        price: new Prisma.Decimal(100),
      };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        stock: 8,
      });
      mockPrismaService.order.create.mockResolvedValue({
        id: 'o1',
        totalAmount: new Prisma.Decimal(200),
      });

      const result = await service.create(createDto, 'user1');

      expect(result.id).toBe('o1');
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { stock: { decrement: 2 } },
      });
      expect(mockPrismaService.order.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if stock is insufficient', async () => {
      const createDto = {
        customerName: 'Test',
        studentId: '123',
        contactNumber: '123',
        customerEmail: 'test@test.com',
        items: [{ productId: 'p1', quantity: 10 }],
      };

      const mockProduct = {
        id: 'p1',
        name: 'Product',
        stock: 5,
        price: new Prisma.Decimal(100),
      };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      await expect(service.create(createDto, 'user1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if product not found', async () => {
      const createDto = {
        customerName: 'Test',
        studentId: '123',
        contactNumber: '123',
        customerEmail: 'test@test.com',
        items: [{ productId: 'p1', quantity: 1 }],
      };

      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto, 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if stock drops below 0 during decrement', async () => {
      const createDto = {
        customerName: 'Test',
        studentId: '123',
        contactNumber: '123',
        customerEmail: 'test@test.com',
        items: [{ productId: 'p1', quantity: 2 }],
      };

      const mockProduct = {
        id: 'p1',
        name: 'Product',
        stock: 5,
        price: new Prisma.Decimal(100),
      };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      // Simulate race condition where stock becomes negative
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        stock: -1,
      });

      await expect(service.create(createDto, 'user1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update status and not change stock if completing', async () => {
      const existingOrder = {
        id: '1',
        status: OrderStatus.PENDING,
        paymentProofUrl: 'http://url.com',
      };
      mockPrismaService.order.findUnique.mockResolvedValue(existingOrder);
      mockPrismaService.order.update.mockResolvedValue({
        ...existingOrder,
        status: OrderStatus.COMPLETED,
      });

      await service.update('1', { status: OrderStatus.COMPLETED });

      expect(mockPrismaService.order.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: OrderStatus.COMPLETED } }),
      );
      expect(cloudinaryMock.deleteImage).toHaveBeenCalledWith('http://url.com');
    });

    it('should restore stock if cancelling', async () => {
      const existingOrder = {
        id: '1',
        status: OrderStatus.PENDING,
        orderItems: [{ productId: 'p1', quantity: 2 }],
      };
      mockPrismaService.order.findUnique.mockResolvedValue(existingOrder);
      mockPrismaService.product.findUnique.mockResolvedValue({
        id: 'p1',
        stock: 5,
      });
      mockPrismaService.product.update.mockResolvedValue({
        id: 'p1',
        stock: 7,
      });
      mockPrismaService.order.update.mockResolvedValue({
        ...existingOrder,
        status: OrderStatus.CANCELLED,
      });

      await service.update('1', { status: OrderStatus.CANCELLED });

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { stock: { increment: 2 } },
      });
      expect(mockPrismaService.order.update).toHaveBeenCalled();
    });

    it('should throw if order is already final', async () => {
      const existingOrder = { id: '1', status: OrderStatus.COMPLETED };
      mockPrismaService.order.findUnique.mockResolvedValue(existingOrder);

      await expect(
        service.update('1', { status: OrderStatus.CANCELLED }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should skip restoring stock if product is missing and log warning', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const existingOrder = {
        id: '1',
        status: OrderStatus.PENDING,
        orderItems: [{ productId: 'p1', quantity: 2 }],
      };
      mockPrismaService.order.findUnique.mockResolvedValue(existingOrder);
      // Product no longer exists
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.order.update.mockResolvedValue({
        ...existingOrder,
        status: OrderStatus.CANCELLED,
      });

      await service.update('1', { status: OrderStatus.CANCELLED });

      expect(mockPrismaService.product.update).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Product with ID p1 no longer exists'),
      );
      expect(mockPrismaService.order.update).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('uploadPaymentProof', () => {
    it('should update order with payment proof and status PAID', async () => {
      const existingOrder = { id: '1', status: OrderStatus.PENDING };
      mockPrismaService.order.findUnique.mockResolvedValue(existingOrder);
      mockPrismaService.order.update.mockResolvedValue({
        ...existingOrder,
        status: OrderStatus.PAID,
        paymentProofUrl: 'http://new.url',
      });

      const file = {} as Express.Multer.File;
      const result = await service.uploadPaymentProof('1', file);

      expect(cloudinaryMock.uploadImage).toHaveBeenCalled();
      expect(mockPrismaService.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          data: {
            paymentProofUrl: expect.any(String),
            status: OrderStatus.PAID,
          },
        }),
      );
      expect(result.status).toBe(OrderStatus.PAID);
    });
  });

  describe('cancelOrderByUser', () => {
    it('should cancel if conditions met', async () => {
      const existingOrder = {
        id: '1',
        userId: 'u1',
        status: OrderStatus.PENDING,
        paymentProofUrl: null,
        orderItems: [{ productId: 'p1', quantity: 2 }],
      };
      mockPrismaService.order.findUnique.mockResolvedValue(existingOrder);
      mockPrismaService.product.findUnique.mockResolvedValue({ id: 'p1' });
      mockPrismaService.order.update.mockResolvedValue({
        ...existingOrder,
        status: OrderStatus.CANCELLED,
      });

      const result = await service.cancelOrderByUser('1', 'u1');

      expect(result.status).toBe(OrderStatus.CANCELLED);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { stock: { increment: 2 } },
      });
    });

    it('should throw if not owner', async () => {
      const existingOrder = { id: '1', userId: 'u2' };
      mockPrismaService.order.findUnique.mockResolvedValue(existingOrder);

      await expect(service.cancelOrderByUser('1', 'u1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if already paid', async () => {
      const existingOrder = {
        id: '1',
        userId: 'u1',
        paymentProofUrl: 'http://url.com',
      };
      mockPrismaService.order.findUnique.mockResolvedValue(existingOrder);

      await expect(service.cancelOrderByUser('1', 'u1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should skip restoring stock if product is missing and log warning', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const existingOrder = {
        id: '1',
        userId: 'u1',
        status: OrderStatus.PENDING,
        paymentProofUrl: null,
        orderItems: [{ productId: 'p1', quantity: 2 }],
      };
      mockPrismaService.order.findUnique.mockResolvedValue(existingOrder);
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.order.update.mockResolvedValue({
        ...existingOrder,
        status: OrderStatus.CANCELLED,
      });

      await service.cancelOrderByUser('1', 'u1');

      expect(mockPrismaService.product.update).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Product with ID p1 no longer exists'),
      );
      consoleWarnSpy.mockRestore();
    });
  });
});
