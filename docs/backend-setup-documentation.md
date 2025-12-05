# PSSE Backend Setup Documentation

## Overview

This document details the setup and configuration of the backend API for the Philippine Society of Software Engineers (PSSE) website. The backend follows a Modular Monolith architecture using NestJS with Prisma ORM and PostgreSQL hosted on Neon.tech.

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 11.x | Backend framework |
| TypeScript | 5.x | Type safety |
| Prisma | 7.x | ORM & database toolkit |
| PostgreSQL | - | Relational database |
| Neon.tech | - | Serverless PostgreSQL hosting |
| @nestjs/config | 4.x | Environment configuration |

---

## Project Structure

```
psse-backend/
├── prisma/
│   ├── migrations/          # Database migrations
│   └── schema.prisma        # Prisma schema definition
├── src/
│   ├── prisma/              # Prisma module
│   │   ├── index.ts         # Barrel exports
│   │   ├── prisma.module.ts # Global Prisma module
│   │   └── prisma.service.ts# Prisma client service
│   ├── app.controller.ts    # Root controller
│   ├── app.module.ts        # Root module
│   ├── app.service.ts       # Root service
│   └── main.ts              # Application entry point
├── test/                    # E2E tests
├── .env                     # Environment variables
├── prisma.config.ts         # Prisma configuration
├── nest-cli.json            # NestJS CLI configuration
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

---

## Configuration

### Environment Variables

The `.env` file contains the following configuration:

```env
# Database Configuration (Neon.tech PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

# Application Configuration
PORT=3000
NODE_ENV=development
```

### AppModule Configuration

The root module is configured with global `ConfigModule` and `PrismaModule`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

## Prisma Configuration

### Schema Definition (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider = "postgresql"
}
```

> **Note:** Prisma 7.x no longer supports the `url` property in the schema file. The database URL is configured in `prisma.config.ts`.

### Prisma Config (`prisma.config.ts`)

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

---

## Prisma Service

### Module (`src/prisma/prisma.module.ts`)

The Prisma module is configured as a global module for dependency injection:

```typescript
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### Service (`src/prisma/prisma.service.ts`)

The Prisma service extends `PrismaClient` and uses the PostgreSQL adapter pattern required by Prisma 7.x:

```typescript
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

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
```

---

## Dependencies

### Production Dependencies

| Package | Purpose |
|---------|---------|
| `@nestjs/common` | NestJS core decorators and utilities |
| `@nestjs/core` | NestJS core framework |
| `@nestjs/platform-express` | Express HTTP adapter |
| `@nestjs/config` | Configuration module |
| `@prisma/client` | Prisma Client |
| `@prisma/adapter-pg` | PostgreSQL adapter for Prisma 7.x |
| `pg` | PostgreSQL client for Node.js |
| `reflect-metadata` | Metadata reflection API |
| `rxjs` | Reactive Extensions |

### Development Dependencies

| Package | Purpose |
|---------|---------|
| `prisma` | Prisma CLI |
| `@types/pg` | TypeScript types for pg |
| `@nestjs/cli` | NestJS CLI |
| `typescript` | TypeScript compiler |
| `jest` | Testing framework |

---

## NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `nest start` | Start the application |
| `start:dev` | `nest start --watch` | Start with hot-reload |
| `start:debug` | `nest start --debug --watch` | Start with debugging |
| `start:prod` | `node dist/main` | Start production build |
| `build` | `nest build` | Build the application |
| `prisma:generate` | `prisma generate` | Generate Prisma Client |
| `prisma:migrate:dev` | `prisma migrate dev` | Run migrations (dev) |
| `prisma:migrate:deploy` | `prisma migrate deploy` | Deploy migrations (prod) |
| `prisma:studio` | `prisma studio` | Open Prisma Studio |
| `prisma:push` | `prisma db push` | Push schema to database |

---

## Prisma 7.x Breaking Changes

Prisma 7.x introduced significant changes to how database connections are configured:

### Key Changes

1. **No `url` in schema.prisma**
   - The `url` property is no longer supported in the datasource block
   - Connection URLs must be configured in `prisma.config.ts`

2. **Adapter Pattern Required**
   - PrismaClient now requires an adapter for database connections
   - Use `@prisma/adapter-pg` for PostgreSQL

3. **Connection Pool Management**
   - Applications must manage their own connection pools
   - The `pg` package provides the `Pool` class for PostgreSQL

### Migration from Prisma 6.x

```diff
// schema.prisma
datasource db {
  provider = "postgresql"
-  url      = env("DATABASE_URL")
}

// prisma.service.ts
+ import { PrismaPg } from '@prisma/adapter-pg';
+ import { Pool } from 'pg';

export class PrismaService extends PrismaClient {
+  private pool: Pool;
+
+  constructor() {
+    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
+    const adapter = new PrismaPg(pool);
+    super({ adapter });
+    this.pool = pool;
+  }
}
```

---

## Usage

### Injecting PrismaService

Since `PrismaModule` is global, `PrismaService` can be injected into any service or controller:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }
}
```

---

## Development Workflow

### Initial Setup

```bash
# Navigate to backend directory
cd psse-backend

# Install dependencies
npm install

# Configure environment
# Edit .env with your Neon.tech DATABASE_URL

# Generate Prisma Client
npm run prisma:generate

# Start development server
npm run start:dev
```

### Adding Models

1. Define models in `prisma/schema.prisma`
2. Generate migration: `npm run prisma:migrate:dev`
3. Regenerate client: `npm run prisma:generate`

### Database Operations

```bash
# Open Prisma Studio (database GUI)
npm run prisma:studio

# Push schema changes without migration
npm run prisma:push

# Deploy migrations to production
npm run prisma:migrate:deploy
```

---

## Next Steps

1. **Define Database Models** - Add Prisma models for events, officers, merchandise, orders
2. **Create API Modules** - Implement NestJS modules for each domain
3. **Add Authentication** - Implement JWT-based authentication
4. **Add Validation** - Use class-validator for DTO validation
5. **Add Swagger** - Document API with OpenAPI/Swagger
6. **Add Testing** - Write unit and e2e tests

---

## References

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma 7.x Migration Guide](https://pris.ly/d/prisma7-client-config)
- [Neon.tech Documentation](https://neon.tech/docs)
