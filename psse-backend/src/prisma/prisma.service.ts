import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private pool: Pool;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  /**
   * Excludes specified fields from a user object or array of users.
   * Use this helper method to ensure sensitive data like passwords
   * are never returned in API responses.
   *
   * @example
   * const user = await prisma.user.findUnique({ where: { id } });
   * return prisma.excludeFields(user, ['password']);
   */
  excludeFields<T, K extends keyof T>(
    data: T | T[] | null,
    keys: K[],
  ): Omit<T, K> | Omit<T, K>[] | null {
    if (data === null) return null;

    if (Array.isArray(data)) {
      return data.map((item) => {
        const result: Partial<T> = { ...item };
        for (const key of keys) {
          delete result[key];
        }
        return result as Omit<T, K>;
      });
    }

    const result: Partial<T> = { ...data };
    for (const key of keys) {
      delete result[key];
    }
    return result as Omit<T, K>;
  }

  /**
   * Finds a user by email including the password field.
   * This should ONLY be used in the AuthService for password validation.
   * WARNING: Never expose the result of this method in API responses.
   */
  async findUserWithPassword(email: string) {
    const user = await this.user.findUnique({
      where: { email },
    });

    return user;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
