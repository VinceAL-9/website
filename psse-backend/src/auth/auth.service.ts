import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma';
import { JwtPayload } from './interfaces';
import { RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

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
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Generates a JWT access token for the authenticated user.
   */
  async login(user: { id: number; email: string; role: string }): Promise<{ access_token: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
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
        role: true,
        studentId: true,
        createdAt: true,
        // Explicitly exclude password
      },
    });

    return user;
  }

  /**
   * Registers a new user.
   * Checks if user exists, hashes password, creates user with MEMBER role,
   * and generates a verification token for email verification.
   */
  async register(dto: RegisterDto) {
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

    // Generate a random verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

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
      select: {
        id: true,
        email: true,
        name: true,
        studentId: true,
        role: true,
        isVerified: true,
        createdAt: true,
        // Exclude password and verificationToken from response
      },
    });

    return user;
  }

  /**
   * Verifies a user's email using the verification token.
   * Marks the user as verified and clears the token.
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    // Find user by verification token
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new NotFoundException('Invalid or expired verification token');
    }

    // Update user: set isVerified to true and clear the token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    return { message: 'Email verified successfully' };
  }
}
