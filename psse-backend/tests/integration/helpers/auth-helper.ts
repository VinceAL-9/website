import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { AuthService } from 'src/auth';
import * as bcrypt from 'bcrypt';

export async function createTestUser(
  app: INestApplication,
  email: string,
  role: 'MEMBER' | 'ADMIN' = 'MEMBER',
) {
  const prisma = app.get<PrismaService>(PrismaService);
  const authService = app.get<AuthService>(AuthService);

  const password = await bcrypt.hash('Password123!', 10);
  const user = await prisma.user.create({
    data: {
      email,
      password,
      name: 'Test User',
      role,
      isVerified: true,
      studentId: role === 'MEMBER' ? '2020-0000' : undefined,
    },
  });

  const tokens = await authService.login({
    id: user.id,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  });

  return { user, token: tokens.accessToken };
}
