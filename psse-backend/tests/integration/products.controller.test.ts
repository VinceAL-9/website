import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from 'src/prisma';
import { createTestApp } from './helpers/test-app';
import { createTestUser } from './helpers/auth-helper';

describe('ProductsController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let memberToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get<PrismaService>(PrismaService);

    const admin = await createTestUser(
      app,
      'admin.products@cpu.edu.ph',
      'ADMIN',
    );
    adminToken = admin.token;

    const member = await createTestUser(
      app,
      'member.products@cpu.edu.ph',
      'MEMBER',
    );
    memberToken = member.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /products', () => {
    beforeAll(async () => {
      await prisma.product.create({
        data: {
          name: 'Test Product 1',
          description: 'Desc 1',
          price: 150,
          stock: 10,
          category: 'TSHIRT',
          imageUrl: 'http://image1.url',
          isFeatured: true,
        },
      });
      await prisma.product.create({
        data: {
          name: 'Test Product 2',
          description: 'Desc 2',
          price: 50,
          stock: 5,
          category: 'LANYARD',
          imageUrl: 'http://image2.url',
          isFeatured: false,
        },
      });
    });

    it('should return all products', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter products by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/products?category=TSHIRT')
        .expect(200);

      expect(response.body.every((p: any) => p.category === 'TSHIRT')).toBe(
        true,
      );
    });
  });

  describe('POST /products/check-stock', () => {
    let prodId1: string;
    let prodId2: string;

    beforeAll(async () => {
      const p1 = await prisma.product.findFirst({
        where: { name: 'Test Product 1' },
      });
      const p2 = await prisma.product.findFirst({
        where: { name: 'Test Product 2' },
      });
      prodId1 = p1!.id;
      prodId2 = p2!.id;
    });

    it('should fail if unauthenticated', async () => {
      await request(app.getHttpServer())
        .post('/products/check-stock')
        .send({ items: [{ productId: prodId1, quantity: 2 }] })
        .expect(401);
    });

    it('should check stock for members', async () => {
      const response = await request(app.getHttpServer())
        .post('/products/check-stock')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          items: [
            { productId: prodId1, quantity: 2 },
            { productId: prodId2, quantity: 10 }, // stock is 5
          ],
        })
        .expect(201);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0].available).toBe(true);
      expect(response.body.items[1].available).toBe(false);
    });
  });

  describe('POST /products', () => {
    it('should fail if member', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ name: 'Product' })
        .expect(403);
    });

    it('should create product if admin', async () => {
      const dto = {
        name: 'Admin Product',
        description: 'New',
        price: 200,
        stock: 50,
        category: 'STICKER',
        imageUrl: 'http://image3.url',
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto)
        .expect(201);

      expect(response.body.name).toBe(dto.name);
      expect(response.body.id).toBeDefined();
    });
  });

  describe('PATCH /products/:id', () => {
    let productId: string;

    beforeAll(async () => {
      const p = await prisma.product.create({
        data: {
          name: 'To Be Updated',
          description: 'Desc',
          price: 10,
          stock: 10,
          category: 'STICKER',
          imageUrl: 'http://url.com',
        },
      });
      productId = p.id;
    });

    it('should update product if admin', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 15 })
        .expect(200);

      expect(response.body.price).toBe('15'); // Decimal type returns as string
    });
  });

  describe('DELETE /products/:id', () => {
    let productId: string;

    beforeAll(async () => {
      const p = await prisma.product.create({
        data: {
          name: 'To Be Deleted',
          description: 'Desc',
          price: 10,
          stock: 10,
          category: 'STICKER',
          imageUrl: 'http://url.com',
        },
      });
      productId = p.id;
    });

    it('should delete product if admin', async () => {
      await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const check = await prisma.product.findUnique({
        where: { id: productId },
      });
      expect(check).toBeNull();
    });
  });
});
