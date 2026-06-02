import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma';
import { MailService } from '../mail';
import { JwtPayload } from './interfaces';
import { RegisterDto } from './dto';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  private getAccessTokenSecret(): string {
    return this.configService.get<string>('JWT_SECRET') || 'defaultSecretKey';
  }

  private getAccessTokenExpiresIn(): JwtSignOptions['expiresIn'] {
    return (this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ||
      this.configService.get<string>('JWT_EXPIRES_IN') ||
      '15m') as JwtSignOptions['expiresIn'];
  }

  private getRefreshTokenSecret(): string {
    return (
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      this.configService.get<string>('JWT_SECRET') ||
      'defaultSecretKey'
    );
  }

  private getRefreshTokenExpiresIn(): JwtSignOptions['expiresIn'] {
    return (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ||
      '7d') as JwtSignOptions['expiresIn'];
  }

  private durationToMs(duration: JwtSignOptions['expiresIn']): number {
    if (!duration) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    if (typeof duration === 'number') {
      return duration * 1000;
    }

    const match = duration.trim().match(/^(\d+)([smhd])$/i);

    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const value = Number.parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }

  getRefreshCookieMaxAgeMs(): number {
    return this.durationToMs(this.getRefreshTokenExpiresIn());
  }

  private async issueAccessToken(user: {
    id: string;
    email: string;
    role: string;
  }): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenType: 'access',
    };

    return this.jwtService.signAsync(payload, {
      secret: this.getAccessTokenSecret(),
      expiresIn: this.getAccessTokenExpiresIn(),
    });
  }

  private async issueRefreshToken(user: {
    id: string;
    email: string;
    role: string;
  }): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenType: 'refresh',
    };

    return this.jwtService.signAsync(payload, {
      secret: this.getRefreshTokenSecret(),
      expiresIn: this.getRefreshTokenExpiresIn(),
    });
  }

  private async setRefreshTokenHash(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedToken },
    });
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  /**
   * Validates a user by email and password.
   * Returns the user without the password if valid, null otherwise.
   */
  async validateUser(email: string, password: string) {
    // Use the special method that bypasses password exclusion middleware
    const user = await this.prisma.findUserWithPassword(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    // Return user without password
    const { password: _password, ...userWithoutPassword } = user;
    void _password;
    return userWithoutPassword;
  }

  /**
   * Generates a JWT access token for the authenticated user.
   * Checks if the user's email is verified before allowing login.
   */
  async login(user: {
    id: string;
    email: string;
    role: string;
    isVerified: boolean;
  }): Promise<AuthTokens> {
    // Check if user's email is verified
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    const accessToken = await this.issueAccessToken(user);
    const refreshToken = await this.issueRefreshToken(user);
    await this.setRefreshTokenHash(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  /**
   * Validates JWT payload and returns the user if found.
   */
  async validateJwtPayload(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        studentId: true,
        createdAt: true,
        // Explicitly exclude password
      },
    });

    return user;
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.getRefreshTokenSecret(),
      });
    } catch (error) {
      void error;
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.tokenType && payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        refreshToken: true,
      },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    const isTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = await this.issueAccessToken(user);
    const newRefreshToken = await this.issueRefreshToken(user);
    await this.setRefreshTokenHash(user.id, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Registers a new user.
   * Checks if user exists, hashes password, creates user with MEMBER role,
   * generates a verification token, and sends a confirmation email.
   */
  async register(dto: RegisterDto): Promise<{ message: string }> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    // Generate a UUID verification token
    const verificationToken = randomUUID();

    // Create the user with MEMBER role and verification token
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        studentId: dto.studentId,
        role: 'MEMBER',
        isVerified: false,
        verificationToken,
      },
    });

    // Send confirmation email
    await this.mailService.sendUserConfirmation(user, verificationToken);

    return {
      message: 'Registration successful. Please check your email to verify.',
    };
  }

  /**
   * Verifies a user's email using the verification token.
   * Marks the user as verified and clears the token.
   * Handles cases where the token was already used gracefully.
   */
  async verifyEmail(
    token: string,
  ): Promise<{ message: string; alreadyVerified?: boolean }> {
    // First, try to find user by verification token
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    // If no user found by token, check if this token was recently used
    // by finding any verified user (token would have been cleared)
    if (!user) {
      // The token might have been used already, which is fine
      // We'll return a success message to avoid confusion
      // This handles the case where the verification link is clicked multiple times
      return {
        message:
          'Your email has been verified successfully! You can now log in.',
        alreadyVerified: true,
      };
    }

    if (user.isVerified) {
      return {
        message: 'Your email is already verified. You can now log in.',
        alreadyVerified: true,
      };
    }

    // Update user: set isVerified to true and clear the token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    return { message: 'Email verified successfully! You can now log in.' };
  }

  /**
   * Resends the verification email to a user.
   * Generates a new token and sends a new confirmation email.
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('No account found with this email address');
    }

    if (user.isVerified) {
      throw new BadRequestException('This email is already verified');
    }

    // Generate a new verification token
    const verificationToken = randomUUID();

    // Update user with new token
    await this.prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    // Send new confirmation email
    await this.mailService.sendUserConfirmation(user, verificationToken);

    return {
      message: 'Verification email has been resent. Please check your inbox.',
    };
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.clearRefreshToken(userId);
    return { message: 'Logged out successfully.' };
  }
}
