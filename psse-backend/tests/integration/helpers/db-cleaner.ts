import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let prisma: PrismaClient;
let pool: Pool;

function getPrismaClient() {
  if (!prisma) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : false,
    });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

export async function clearDatabase() {
  const db = getPrismaClient();
  const tableNames = [
    'order_items',
    'orders',
    'products',
    'events',
    'officers',
    'users',
  ];

  try {
    for (const tableName of tableNames) {
      await db.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE;`);
    }
  } catch {
    // Suppressed during tests
  }
}

export async function closeDatabase() {
  if (prisma) {
    await prisma.$disconnect();
  }
  if (pool) {
    await pool.end();
  }
}
