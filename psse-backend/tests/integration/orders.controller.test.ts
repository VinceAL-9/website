import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from 'src/prisma';
import { createTestApp } from './helpers/test-app';
import { createTestUser } from './helpers/auth-helper';

describe('OrdersController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let memberToken: string;
  let memberUserId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get<PrismaService>(PrismaService);

    const admin = await createTestUser(app, 'admin.orders@cpu.edu.ph', 'ADMIN');
    adminToken = admin.token;

    const member = await createTestUser(
      app,
      'member.orders@cpu.edu.ph',
      'MEMBER',
    );
    memberToken = member.token;
    memberUserId = member.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /orders', () => {
    let productId: string;

    beforeAll(async () => {
      const p = await prisma.product.create({
        data: {
          name: 'Order Test Product',
          description: 'Desc',
          price: 100,
          stock: 10,
          category: 'LANYARD',
          imageUrl: 'http://image.url',
        },
      });
      productId = p.id;
    });

    it('should create an order and decrement stock', async () => {
      const dto = {
        customerName: 'Member User',
        studentId: '2020-0003',
        contactNumber: '09123456789',
        customerEmail: 'member.orders@cpu.edu.ph',
        items: [{ productId, quantity: 2 }],
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${memberToken}`)
        .send(dto)
        .expect(201);

      expect(response.body.referenceId).toBeDefined();
      expect(response.body.totalAmount).toBe('200');
      expect(response.body.status).toBe('PENDING');

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      expect(product?.stock).toBe(8);
    });

    it('should fail if stock is insufficient', async () => {
      const dto = {
        customerName: 'Member User',
        studentId: '2020-0003',
        contactNumber: '09123456789',
        customerEmail: 'member.orders@cpu.edu.ph',
        items: [{ productId, quantity: 20 }], // only 8 left
      };

      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${memberToken}`)
        .send(dto)
        .expect(400); // BadRequestException
    });
  });

  describe('GET /orders', () => {
    it('should return all orders for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /orders/mine', () => {
    it('should return orders for the authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/mine')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.every((o: any) => o.userId === memberUserId)).toBe(
        true,
      );
    });
  });

  describe('PATCH /orders/:id/cancel', () => {
    let orderId: string;
    let prodId: string;

    beforeAll(async () => {
      const p = await prisma.product.create({
        data: {
          name: 'Cancel Test',
          description: '',
          price: 50,
          stock: 5,
          category: 'STICKER',
          imageUrl: '',
        },
      });
      prodId = p.id;

      const res = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          customerName: 'Test',
          studentId: '123',
          contactNumber: '1',
          customerEmail: 'a@a.com',
          items: [{ productId: prodId, quantity: 2 }],
        })
        .expect(201);
      orderId = res.body.id;
    });

    it('should allow user to cancel their order and restore stock', async () => {
      await request(app.getHttpServer())
        .patch(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);

      const check = await prisma.order.findUnique({ where: { id: orderId } });
      expect(check?.status).toBe('CANCELLED');

      const product = await prisma.product.findUnique({
        where: { id: prodId },
      });
      expect(product?.stock).toBe(5); // 5 - 2 + 2 = 5
    });

    it('should fail if order is already cancelled', async () => {
      await request(app.getHttpServer())
        .patch(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(400); // Bad Request (final status)
    });
  });

  describe('PATCH /orders/:id', () => {
    let orderId: string;

    beforeAll(async () => {
      const p = await prisma.product.create({
        data: {
          name: 'Admin Patch Test',
          description: '',
          price: 50,
          stock: 5,
          category: 'STICKER',
          imageUrl: '',
        },
      });

      const res = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          customerName: 'Test',
          studentId: '123',
          contactNumber: '1',
          customerEmail: 'a@a.com',
          items: [{ productId: p.id, quantity: 1 }],
        });
      orderId = res.body.id;
    });

    it('should allow admin to update status', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'PAID' })
        .expect(200);

      expect(res.body.status).toBe('PAID');
    });

    it('should fail if member tries to update status', async () => {
      await request(app.getHttpServer())
        .patch(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'COMPLETED' })
        .expect(403);
    });
  });
});
