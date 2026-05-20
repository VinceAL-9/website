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

  describe('resendVerificationEmail', () => {
    it('should resend email if user is not verified', async () => {
      const mockUser = { id: '1', email: 'test@test.com', isVerified: false };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.resendVerificationEmail('test@test.com');

      expect(result.message).toContain('Verification email has been resent');
      expect(mockPrismaService.user.update).toHaveBeenCalled();
      expect(mailMock.sendUserConfirmation).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(
        service.resendVerificationEmail('notfound@test.com'),
      ).rejects.toThrow('No account found');
    });

    it('should throw BadRequestException if user already verified', async () => {
      const mockUser = { id: '1', email: 'test@test.com', isVerified: true };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      await expect(
        service.resendVerificationEmail('test@test.com'),
      ).rejects.toThrow('This email is already verified');
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens if valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        role: 'MEMBER',
        isVerified: true,
        refreshToken: 'hashed_rt',
      };
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: '1',
        tokenType: 'refresh',
      });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('new_token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_rt');

      const result = await service.refreshTokens('valid_rt');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if refresh token is missing', async () => {
      await expect(service.refreshTokens('')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token verification fails', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));
      await expect(service.refreshTokens('invalid_rt')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if tokenType is not refresh', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: '1',
        tokenType: 'access',
      });
      await expect(
        service.refreshTokens('access_token_passed_as_refresh'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found or no stored token', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: '1',
        tokenType: 'refresh',
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.refreshTokens('valid_rt')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is not verified', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: '1',
        tokenType: 'refresh',
      });
      const mockUser = {
        id: '1',
        isVerified: false,
        refreshToken: 'hashed_rt',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      await expect(service.refreshTokens('valid_rt')).rejects.toThrow(
        'Please verify your email first',
      );
    });

    it('should throw UnauthorizedException if token does not match hash', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: '1',
        tokenType: 'refresh',
      });
      const mockUser = { id: '1', isVerified: true, refreshToken: 'hashed_rt' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.refreshTokens('mismatched_rt')).rejects.toThrow(
        UnauthorizedException,
      );
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
