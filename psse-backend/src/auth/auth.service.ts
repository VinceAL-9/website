import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
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
   * Checks if user exists, hashes password, and creates user with MEMBER role.
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

    // Create the user with MEMBER role
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        studentId: dto.studentId,
        role: 'MEMBER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        studentId: true,
        role: true,
        createdAt: true,
        // Exclude password from response
      },
    });

    return user;
  }
}
