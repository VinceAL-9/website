import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from 'src/prisma';
import { createTestApp } from './helpers/test-app';

describe('AuthController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    beforeAll(async () => {
      // Clean up any stale test user from previous runs for idempotency
      await prisma.user.deleteMany({
        where: { email: 'integration@cpu.edu.ph' },
      });
    });

    it('should register a new user', async () => {
      const registerDto = {
        email: 'integration@cpu.edu.ph',
        password: 'Password123!',
        name: 'Integration Test User',
        studentId: '2020-12345',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body.message).toContain('Registration successful');

      const user = await prisma.user.findUnique({
        where: { email: registerDto.email },
      });
      expect(user).toBeDefined();
      expect(user?.isVerified).toBe(false);
      expect(user?.verificationToken).toBeDefined();
    });

    it('should fail if email already exists', async () => {
      const registerDto = {
        email: 'integration@cpu.edu.ph',
        password: 'Password123!',
        name: 'Another User',
        studentId: '2020-12345',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409);
    });
  });

  describe('GET /auth/verify', () => {
    it('should verify the user email', async () => {
      const user = await prisma.user.findUnique({
        where: { email: 'integration@cpu.edu.ph' },
      });
      const token = user?.verificationToken;

      const response = await request(app.getHttpServer())
        .get(`/auth/verify?token=${token}`)
        .expect(200);

      expect(response.body.message).toContain('verified successfully');

      const verifiedUser = await prisma.user.findUnique({
        where: { email: 'integration@cpu.edu.ph' },
      });
      expect(verifiedUser?.isVerified).toBe(true);
      expect(verifiedUser?.verificationToken).toBeNull();
    });
  });

  describe('POST /auth/login', () => {
    it('should authenticate user and return access token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'integration@cpu.edu.ph',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body.access_token).toBeDefined();
      // Should set refresh_token cookie
      const cookies = response.headers['set-cookie'] as unknown as
        | string[]
        | undefined;
      expect(cookies).toBeDefined();
      expect(
        cookies?.some((c: string) => c.includes('refresh_token=')),
      ).toBeTruthy();
    });

    it('should fail with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'integration@cpu.edu.ph',
          password: 'WrongPassword!',
        })
        .expect(401);
    });
  });

  describe('GET /auth/profile', () => {
    let accessToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'integration@cpu.edu.ph',
          password: 'Password123!',
        });
      accessToken = response.body.access_token;
    });

    it('should return user profile if authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.email).toBe('integration@cpu.edu.ph');
      expect(response.body.role).toBe('MEMBER');
    });

    it('should fail if no token provided', async () => {
      await request(app.getHttpServer()).get('/auth/profile').expect(401);
    });
  });
});
