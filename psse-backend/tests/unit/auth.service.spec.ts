import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma';
import { MailService } from 'src/mail';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { mailMock } from '../mocks/mail.mock';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    findUserWithPassword: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET' || key === 'JWT_REFRESH_SECRET') return 'secret';
      if (key === 'JWT_ACCESS_EXPIRES_IN') return '15m';
      if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mailMock },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.register({
        email: 'test@test.com',
        password: 'password',
        name: 'Test User',
        studentId: '2020-12345',
      });

      expect(result.message).toContain('Registration successful');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mailMock.sendUserConfirmation).toHaveBeenCalled();
    });

    it('should throw ConflictException if user exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1' });

      await expect(
        service.register({
          email: 'test@test.com',
          password: 'password',
          name: 'Test',
          studentId: '2020-12345',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        password: 'hashedPassword',
        role: 'MEMBER',
      };
      mockPrismaService.findUserWithPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@test.com', 'password');

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(result?.email).toBe('test@test.com');
    });

    it('should return null if user not found', async () => {
      mockPrismaService.findUserWithPassword.mockResolvedValue(null);

      const result = await service.validateUser(
        'notfound@test.com',
        'password',
      );

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        password: 'hashedPassword',
      };
      mockPrismaService.findUserWithPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@test.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should issue tokens for verified user', async () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        role: 'MEMBER',
        isVerified: true,
      };
      mockJwtService.signAsync
        .mockResolvedValueOnce('access_token')
        .mockResolvedValueOnce('refresh_token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedRefresh');

      const result = await service.login(user);

      expect(result).toHaveProperty('accessToken', 'access_token');
      expect(result).toHaveProperty('refreshToken', 'refresh_token');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { refreshToken: 'hashedRefresh' },
      });
    });

    it('should throw UnauthorizedException if unverified', async () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        role: 'MEMBER',
        isVerified: false,
      };

      await expect(service.login(user)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyEmail', () => {
    it('should verify user and clear token', async () => {
      const mockUser = { id: '1', isVerified: false };
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.verifyEmail('valid_token');

      expect(result.message).toContain('verified successfully');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isVerified: true, verificationToken: null },
      });
    });

    it('should handle already verified user', async () => {
      const mockUser = { id: '1', isVerified: true };
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.verifyEmail('used_token');

      expect(result.alreadyVerified).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear refresh token', async () => {
      await service.logout('1');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { refreshToken: null },
      });
    });
  });
});
