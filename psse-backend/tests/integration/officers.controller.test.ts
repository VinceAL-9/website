import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../../src/prisma';
import { createTestApp } from './helpers/test-app';
import { createTestUser } from './helpers/auth-helper';

describe('OfficersController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get<PrismaService>(PrismaService);

    const admin = await createTestUser(
      app,
      'admin.officers@cpu.edu.ph',
      'ADMIN',
    );
    adminToken = admin.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /officers', () => {
    beforeAll(async () => {
      await prisma.officer.create({
        data: {
          name: 'Test Officer',
          position: 'President',
          category: 'EXEC',
          photoUrl: 'http://photo.url',
          academicYear: '2024-2025',
          order: 1,
        },
      });
    });

    it('should return all officers', async () => {
      const response = await request(app.getHttpServer())
        .get('/officers')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('POST /officers', () => {
    it('should create officer if admin', async () => {
      const dto = {
        name: 'New Officer',
        position: 'VP',
        category: 'EXEC',
        photoUrl: 'http://photo.url',
        academicYear: '2024-2025',
        order: 2,
      };

      const response = await request(app.getHttpServer())
        .post('/officers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto)
        .expect(201);

      expect(response.body.name).toBe(dto.name);
      expect(response.body.id).toBeDefined();
    });
  });

  describe('PATCH /officers/:id', () => {
    let officerId: string;

    beforeAll(async () => {
      const o = await prisma.officer.create({
        data: {
          name: 'To Be Updated',
          position: 'Rep',
          category: 'REP',
          photoUrl: 'http://url.com',
          academicYear: '2024-2025',
          order: 10,
        },
      });
      officerId = o.id;
    });

    it('should update officer if admin', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/officers/${officerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
    });
  });

  describe('DELETE /officers/:id', () => {
    let officerId: string;

    beforeAll(async () => {
      const o = await prisma.officer.create({
        data: {
          name: 'To Be Deleted',
          position: 'Rep',
          category: 'REP',
          photoUrl: 'http://url.com',
          academicYear: '2024-2025',
          order: 11,
        },
      });
      officerId = o.id;
    });

    it('should delete officer if admin', async () => {
      await request(app.getHttpServer())
        .delete(`/officers/${officerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const check = await prisma.officer.findUnique({
        where: { id: officerId },
      });
      expect(check).toBeNull();
    });
  });
});
