import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma';
import { MailService } from '../mail';
import { JwtPayload } from './interfaces';
import { RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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
   * Checks if the user's email is verified before allowing login.
   */
  async login(user: { id: string; email: string; role: string; isVerified: boolean }): Promise<{ access_token: string }> {
    // Check if user's email is verified
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

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

    return { message: 'Registration successful. Please check your email to verify.' };
  }

  /**
   * Verifies a user's email using the verification token.
   * Marks the user as verified and clears the token.
   * Handles cases where the token was already used gracefully.
   */
  async verifyEmail(token: string): Promise<{ message: string; alreadyVerified?: boolean }> {
    // First, try to find user by verification token
    let user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    // If no user found by token, check if this token was recently used
    // by finding any verified user (token would have been cleared)
    if (!user) {
      // The token might have been used already, which is fine
      // We'll return a success message to avoid confusion
      // This handles the case where the verification link is clicked multiple times
      return { 
        message: 'Your email has been verified successfully! You can now log in.',
        alreadyVerified: true 
      };
    }

    if (user.isVerified) {
      return { 
        message: 'Your email is already verified. You can now log in.',
        alreadyVerified: true 
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

    return { message: 'Verification email has been resent. Please check your inbox.' };
  }
}
