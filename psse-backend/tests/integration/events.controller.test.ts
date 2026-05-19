import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../../src/prisma';
import { createTestApp } from './helpers/test-app';
import { createTestUser } from './helpers/auth-helper';

describe('EventsController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let memberToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get<PrismaService>(PrismaService);

    const admin = await createTestUser(app, 'admin.events@cpu.edu.ph', 'ADMIN');
    adminToken = admin.token;

    const member = await createTestUser(
      app,
      'member.events@cpu.edu.ph',
      'MEMBER',
    );
    memberToken = member.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /events', () => {
    beforeAll(async () => {
      // seed an event
      await prisma.event.create({
        data: {
          title: 'Test Event 1',
          description: 'Description 1',
          date: new Date('2025-01-01T00:00:00Z'),
          location: 'Venue 1',
          imageUrl: 'http://image1.url',
          isUpcoming: true,
        },
      });
    });

    it('should return all events', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      // Verify the seeded event is present somewhere in the results
      const seeded = response.body.find((e: any) => e.title === 'Test Event 1');
      expect(seeded).toBeDefined();
      expect(seeded.isUpcoming).toBe(true);
    });

    it('should filter events by isUpcoming', async () => {
      const response = await request(app.getHttpServer())
        .get('/events?isUpcoming=false')
        .expect(200);

      // Every returned event must have isUpcoming = false
      for (const event of response.body) {
        expect(event.isUpcoming).toBe(false);
      }
      // The seeded upcoming event must NOT appear
      const seeded = response.body.find((e: any) => e.title === 'Test Event 1');
      expect(seeded).toBeUndefined();
    });
  });

  describe('POST /events', () => {
    it('should fail if unauthenticated', async () => {
      await request(app.getHttpServer())
        .post('/events')
        .send({ title: 'Event' })
        .expect(401);
    });

    it('should fail if user is not admin', async () => {
      await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ title: 'Event' })
        .expect(403);
    });

    it('should create an event if user is admin and payload is valid', async () => {
      const dto = {
        title: 'Admin Created Event',
        description: 'Testing admin access',
        date: '2025-05-01T00:00:00.000Z',
        location: 'Virtual',
        imageUrl: 'http://image2.url',
      };

      const response = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto)
        .expect(201);

      expect(response.body.title).toBe(dto.title);
      expect(response.body.id).toBeDefined();
    });

    it('should fail if imageUrl and file are missing', async () => {
      const dto = {
        title: 'No Image Event',
        description: 'Should fail',
        date: '2025-05-01T00:00:00.000Z',
        location: 'Virtual',
      };

      await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dto)
        .expect(400); // BadRequestException from controller
    });
  });

  describe('PATCH /events/:id', () => {
    let eventId: string;

    beforeAll(async () => {
      const event = await prisma.event.create({
        data: {
          title: 'To Be Updated',
          description: 'Desc',
          date: new Date(),
          location: 'Loc',
          imageUrl: 'http://url.com',
        },
      });
      eventId = event.id;
    });

    it('should update an event if admin', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/events/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
    });

    it('should fail if member', async () => {
      await request(app.getHttpServer())
        .patch(`/events/${eventId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ title: 'Hacked Title' })
        .expect(403);
    });
  });

  describe('DELETE /events/:id', () => {
    let eventId: string;

    beforeAll(async () => {
      const event = await prisma.event.create({
        data: {
          title: 'To Be Deleted',
          description: 'Desc',
          date: new Date(),
          location: 'Loc',
          imageUrl: 'http://url.com',
        },
      });
      eventId = event.id;
    });

    it('should fail if member', async () => {
      await request(app.getHttpServer())
        .delete(`/events/${eventId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);
    });

    it('should delete the event if admin', async () => {
      await request(app.getHttpServer())
        .delete(`/events/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const check = await prisma.event.findUnique({ where: { id: eventId } });
      expect(check).toBeNull();
    });
  });
});
