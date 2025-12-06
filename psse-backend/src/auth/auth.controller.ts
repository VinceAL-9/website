import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { JwtAuthGuard } from './guards';
import { CurrentUser } from './decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  /**
   * POST /auth/login
   * Authenticates a user and returns a JWT access token.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.authService.login(user);
  }

  /**
   * POST /auth/register
   * Registers a new user with MEMBER role.
   * This endpoint is public (no authentication required).
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * GET /auth/profile
   * Returns the current authenticated user's profile.
   * Protected route - requires valid JWT.
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  /**
   * GET /auth/verify?token=xxx
   * Verifies the user's email using the provided token.
   * This endpoint is public (no authentication required).
   */
  @Get('verify')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
}
