# PSSE Backend Implementation Documentation

## Overview

This document provides a comprehensive description of the current implementation of the Philippine Society of Software Engineers (PSSE) website backend API. The backend is built using a Modular Monolith architecture with NestJS, Prisma ORM, and PostgreSQL, featuring JWT-based authentication, role-based access control, and a complete set of RESTful API endpoints for managing events, officers, products, and orders.

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 11.x | Backend framework |
| TypeScript | 5.x | Type safety |
| Prisma | 7.x | ORM & database toolkit |
| PostgreSQL | - | Relational database |
| Neon.tech | - | Serverless PostgreSQL hosting |
| Passport.js | 0.7.x | Authentication middleware |
| JWT | - | Token-based authentication |
| bcrypt | 6.x | Password hashing |
| class-validator | 0.14.x | DTO validation |
| class-transformer | 0.5.x | Object transformation |

---

## Project Structure

```
psse-backend/
├── prisma/
│   ├── migrations/              # Database migrations
│   ├── schema.prisma            # Prisma schema definition
│   └── seed.ts                  # Database seeding script
├── src/
│   ├── auth/                    # Authentication module
│   │   ├── decorators/          # Custom decorators
│   │   │   └── current-user.decorator.ts
│   │   ├── dto/                 # Data Transfer Objects
│   │   │   └── login.dto.ts
│   │   ├── guards/              # Route guards
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interfaces/          # TypeScript interfaces
│   │   │   └── jwt-payload.interface.ts
│   │   ├── strategies/          # Passport strategies
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   └── index.ts
│   ├── events/                  # Events module
│   │   ├── dto/
│   │   │   ├── create-event.dto.ts
│   │   │   └── update-event.dto.ts
│   │   ├── events.controller.ts
│   │   ├── events.module.ts
│   │   ├── events.service.ts
│   │   └── index.ts
│   ├── officers/                # Officers module
│   │   ├── dto/
│   │   │   ├── create-officer.dto.ts
│   │   │   └── update-officer.dto.ts
│   │   ├── officers.controller.ts
│   │   ├── officers.module.ts
│   │   ├── officers.service.ts
│   │   └── index.ts
│   ├── orders/                  # Orders module
│   │   ├── dto/
│   │   │   └── create-order.dto.ts
│   │   ├── orders.controller.ts
│   │   ├── orders.module.ts
│   │   ├── orders.service.ts
│   │   └── index.ts
│   ├── prisma/                  # Prisma service module
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts
│   │   └── index.ts
│   ├── products/                # Products module
│   │   ├── dto/
│   │   │   ├── create-product.dto.ts
│   │   │   └── update-product.dto.ts
│   │   ├── products.controller.ts
│   │   ├── products.module.ts
│   │   ├── products.service.ts
│   │   └── index.ts
│   ├── app.controller.ts        # Root controller
│   ├── app.module.ts            # Root module
│   ├── app.service.ts           # Root service
│   └── main.ts                  # Application entry point
├── test/                        # E2E tests
├── .env                         # Environment variables
├── prisma.config.ts             # Prisma configuration
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │     │   Officer   │     │    Event    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │     │ id          │     │ id          │
│ email       │     │ name        │     │ title       │
│ password    │     │ position    │     │ description │
│ role        │     │ category    │     │ date        │
│ studentId   │     │ photoUrl    │     │ imageUrl    │
│ createdAt   │     │ academicYear│     │ location    │
└─────────────┘     │ order       │     │ isUpcoming  │
                    └─────────────┘     └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Product   │────<│  OrderItem  │>────│    Order    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │     │ id          │     │ id          │
│ name        │     │ orderId     │     │ customerName│
│ description │     │ productId   │     │ studentId   │
│ price       │     │ quantity    │     │ contactNumber│
│ stock       │     │ priceAtTime │     │ customerEmail│
│ category    │     └─────────────┘     │ totalAmount │
│ imageUrl    │                         │ status      │
│ isFeatured  │                         │ createdAt   │
└─────────────┘                         │ updatedAt   │
                                        └─────────────┘
```

### Prisma Models

#### User Model
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  role      Role     @default(MEMBER)
  studentId String?
  createdAt DateTime @default(now())

  @@map("users")
}
```

#### Officer Model
```prisma
model Officer {
  id           Int    @id @default(autoincrement())
  name         String
  position     String
  category     String
  photoUrl     String
  academicYear String
  order        Int    @default(0)

  @@map("officers")
}
```

#### Event Model
```prisma
model Event {
  id          Int      @id @default(autoincrement())
  title       String
  description String
  date        DateTime
  imageUrl    String
  location    String
  isUpcoming  Boolean  @default(true)

  @@map("events")
}
```

#### Product Model
```prisma
model Product {
  id          Int         @id @default(autoincrement())
  name        String
  description String
  price       Decimal     @db.Decimal(10, 2)
  stock       Int
  category    Category
  imageUrl    String
  isFeatured  Boolean     @default(false)
  orderItems  OrderItem[]

  @@map("products")
}
```

#### Order & OrderItem Models
```prisma
model Order {
  id            Int         @id @default(autoincrement())
  customerName  String
  studentId     String
  contactNumber String
  customerEmail String
  totalAmount   Decimal     @db.Decimal(10, 2)
  status        OrderStatus @default(PENDING_REVIEW)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  orderItems    OrderItem[]

  @@map("orders")
}

model OrderItem {
  id          Int     @id @default(autoincrement())
  orderId     Int
  productId   Int
  quantity    Int
  priceAtTime Decimal @db.Decimal(10, 2)
  order       Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product     Product @relation(fields: [productId], references: [id])

  @@map("order_items")
}
```

### Enums

```prisma
enum Role {
  MEMBER
  ADMIN
}

enum Category {
  LANYARD
  TSHIRT
  STICKER
}

enum OrderStatus {
  PENDING_REVIEW
  AWAITING_PAYMENT
  READY_PICKUP
  COMPLETED
  CANCELLED
}
```

---

## API Endpoints

### Authentication (`/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/login` | Authenticate user and get JWT | Public |
| GET | `/auth/profile` | Get current user profile | Protected |

### Events (`/events`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/events` | Get all events | Public |
| GET | `/events/:id` | Get event by ID | Public |
| POST | `/events` | Create new event | Admin only |
| PATCH | `/events/:id` | Update event | Admin only |
| DELETE | `/events/:id` | Delete event | Admin only |

### Officers (`/officers`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/officers` | Get all officers | Public |
| GET | `/officers/:id` | Get officer by ID | Public |
| POST | `/officers` | Create new officer | Admin only |
| PATCH | `/officers/:id` | Update officer | Admin only |
| DELETE | `/officers/:id` | Delete officer | Admin only |

### Products (`/products`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/products` | Get all products (optional filter by category) | Public |
| GET | `/products/:id` | Get product by ID | Public |
| POST | `/products` | Create new product | Admin only |
| PATCH | `/products/:id` | Update product | Admin only |
| DELETE | `/products/:id` | Delete product | Admin only |

### Orders (`/orders`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/orders` | Get all orders | Public |
| GET | `/orders/:id` | Get order by ID | Public |
| POST | `/orders` | Create new order | Public |

---

## Authentication System

### JWT-Based Authentication

The backend implements JWT (JSON Web Token) authentication using Passport.js with the following components:

#### JWT Payload Interface

```typescript
interface JwtPayload {
  sub: number;    // User ID
  email: string;  // User email
  role: string;   // User role (MEMBER or ADMIN)
}
```

#### JWT Strategy

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecretKey',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateJwtPayload(payload);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
```

### Guards

#### JwtAuthGuard
Extends Passport's `AuthGuard` to protect routes requiring authentication:

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

#### RolesGuard
Enforces admin-only access on protected routes:

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
```

### Custom Decorators

#### @CurrentUser()
Extracts the authenticated user from the request object:

```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### Password Security

- Passwords are hashed using bcrypt before storage
- A minimum of 6 characters is enforced via validation
- Passwords are excluded from API responses using a custom `excludeFields` helper

---

## Data Transfer Objects (DTOs)

### Authentication DTOs

#### LoginDto
```typescript
class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
```

### Event DTOs

#### CreateEventDto
```typescript
class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsBoolean()
  @IsOptional()
  isUpcoming?: boolean;
}
```

### Officer DTOs

#### CreateOfficerDto
```typescript
class CreateOfficerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  photoUrl: string;

  @IsString()
  @IsNotEmpty()
  academicYear: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
```

### Order DTOs

#### OrderItemDto
```typescript
class OrderItemDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}
```

#### CreateOrderDto
```typescript
class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  contactNumber: string;

  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
```

---

## Service Layer Implementation

### Events Service

```typescript
@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.event.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
    return event;
  }

  async create(createEventDto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        ...createEventDto,
        date: new Date(createEventDto.date),
      },
    });
  }

  async update(id: number, updateEventDto: UpdateEventDto) { /* ... */ }
  async remove(id: number) { /* ... */ }
}
```

### Officers Service

```typescript
@Injectable()
export class OfficersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.officer.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: number) { /* ... */ }
  async create(createOfficerDto: CreateOfficerDto) { /* ... */ }
  async update(id: number, updateOfficerDto: UpdateOfficerDto) { /* ... */ }
  async remove(id: number) { /* ... */ }
}
```

### Products Service

```typescript
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: Category) {
    return this.prisma.product.findMany({
      where: category ? { category } : undefined,
    });
  }

  async findOne(id: number) { /* ... */ }
  async create(createProductDto: CreateProductDto) { /* ... */ }
  async update(id: number, updateProductDto: UpdateProductDto) { /* ... */ }
  async remove(id: number) { /* ... */ }
}
```

### Orders Service - Transactional Order Creation

The Orders service implements a sophisticated transactional order creation process:

```typescript
async create(createOrderDto: CreateOrderDto) {
  return this.prisma.$transaction(async (tx) => {
    const orderItemsData = [];
    let totalAmount = new Prisma.Decimal(0);

    // Step 1: Validate each item and check stock
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }

      // Step 2: Check stock availability
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}". Available: ${product.stock}`
        );
      }

      // Step 3: Decrement stock atomically
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });

      // Step 4: Calculate totals
      const itemTotal = product.price.mul(item.quantity);
      totalAmount = totalAmount.add(itemTotal);

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtTime: product.price,
      });
    }

    // Step 5: Create order with nested order items
    return tx.order.create({
      data: {
        customerName,
        studentId,
        contactNumber,
        customerEmail,
        totalAmount,
        orderItems: { create: orderItemsData },
      },
      include: {
        orderItems: { include: { product: true } },
      },
    });
  });
}
```

**Transaction Features:**
- Atomic stock decrement to prevent overselling
- Price capture at order time
- Automatic total calculation
- Full rollback on any failure

---

## Prisma Service

The `PrismaService` extends `PrismaClient` with additional helper methods:

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  /**
   * Helper to exclude sensitive fields from responses
   */
  excludeFields<T, K extends keyof T>(
    data: T | T[] | null,
    keys: K[],
  ): Omit<T, K> | Omit<T, K>[] | null { /* ... */ }

  /**
   * Special method for auth - retrieves user with password
   */
  async findUserWithPassword(email: string) {
    return this.user.findUnique({ where: { email } });
  }

  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
```

---

## Global Configuration

### Application Bootstrap (`main.ts`)

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true,          // Auto-transform payloads to DTO instances
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
```

### Root Module Configuration

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    EventsModule,
    OfficersModule,
    ProductsModule,
    AuthModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

## Environment Variables

```env
# Database Configuration (Neon.tech PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

# Application Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="1d"
```

---

## Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/common` | ^11.0.1 | NestJS core decorators and utilities |
| `@nestjs/core` | ^11.0.1 | NestJS core framework |
| `@nestjs/config` | ^4.0.2 | Configuration module |
| `@nestjs/jwt` | ^11.0.1 | JWT utilities |
| `@nestjs/passport` | ^11.0.5 | Passport integration |
| `@nestjs/platform-express` | ^11.0.1 | Express HTTP adapter |
| `@prisma/client` | ^7.1.0 | Prisma Client |
| `@prisma/adapter-pg` | ^7.1.0 | PostgreSQL adapter for Prisma 7.x |
| `bcrypt` | ^6.0.0 | Password hashing |
| `class-transformer` | ^0.5.1 | Object transformation |
| `class-validator` | ^0.14.3 | DTO validation |
| `passport` | ^0.7.0 | Authentication middleware |
| `passport-jwt` | ^4.0.1 | JWT strategy for Passport |
| `pg` | ^8.16.3 | PostgreSQL client |
| `reflect-metadata` | ^0.2.2 | Metadata reflection API |
| `rxjs` | ^7.8.1 | Reactive Extensions |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `prisma` | ^7.1.0 | Prisma CLI |
| `@nestjs/cli` | ^11.0.0 | NestJS CLI |
| `@nestjs/testing` | ^11.0.1 | Testing utilities |
| `typescript` | ^5.7.3 | TypeScript compiler |
| `jest` | ^30.0.0 | Testing framework |
| `supertest` | ^7.0.0 | HTTP testing |
| `eslint` | ^9.18.0 | Linting |
| `prettier` | ^3.4.2 | Code formatting |

---

## NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `nest start` | Start the application |
| `start:dev` | `nest start --watch` | Start with hot-reload |
| `start:debug` | `nest start --debug --watch` | Start with debugging |
| `start:prod` | `node dist/main` | Start production build |
| `build` | `nest build` | Build the application |
| `lint` | `eslint "{src,apps,libs,test}/**/*.ts" --fix` | Lint and fix code |
| `format` | `prettier --write "src/**/*.ts"` | Format code |
| `test` | `jest` | Run unit tests |
| `test:watch` | `jest --watch` | Run tests in watch mode |
| `test:cov` | `jest --coverage` | Run tests with coverage |
| `test:e2e` | `jest --config ./test/jest-e2e.json` | Run E2E tests |
| `prisma:generate` | `prisma generate` | Generate Prisma Client |
| `prisma:migrate:dev` | `prisma migrate dev` | Run migrations (dev) |
| `prisma:migrate:deploy` | `prisma migrate deploy` | Deploy migrations (prod) |
| `prisma:studio` | `prisma studio` | Open Prisma Studio |
| `prisma:push` | `prisma db push` | Push schema to database |

---

## API Usage Examples

### Authentication

#### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "admin@psse.org",
  "password": "password123"
}

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Profile (Protected)
```bash
GET /auth/profile
Authorization: Bearer <access_token>

# Response
{
  "id": 1,
  "email": "admin@psse.org",
  "role": "ADMIN",
  "studentId": "2021-12345",
  "createdAt": "2025-12-05T10:00:00.000Z"
}
```

### Events

#### Get All Events
```bash
GET /events

# Response
[
  {
    "id": 1,
    "title": "PSSE General Assembly",
    "description": "Annual general assembly meeting",
    "date": "2025-12-15T14:00:00.000Z",
    "imageUrl": "/images/events/ga-2025.jpg",
    "location": "Engineering Auditorium",
    "isUpcoming": true
  }
]
```

#### Create Event (Admin)
```bash
POST /events
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Tech Talk: AI in Software Engineering",
  "description": "A seminar about AI applications",
  "date": "2025-12-20T10:00:00.000Z",
  "imageUrl": "/images/events/tech-talk.jpg",
  "location": "Room 301",
  "isUpcoming": true
}
```

### Products

#### Get Products (with Category Filter)
```bash
GET /products?category=TSHIRT

# Response
[
  {
    "id": 1,
    "name": "PSSE Official T-Shirt",
    "description": "Official organization shirt",
    "price": "350.00",
    "stock": 50,
    "category": "TSHIRT",
    "imageUrl": "/images/merch/tshirt.jpg",
    "isFeatured": true
  }
]
```

### Orders

#### Create Order
```bash
POST /orders
Content-Type: application/json

{
  "customerName": "Juan Dela Cruz",
  "studentId": "2021-12345",
  "contactNumber": "09171234567",
  "customerEmail": "juan@student.edu.ph",
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}

# Response
{
  "id": 1,
  "customerName": "Juan Dela Cruz",
  "studentId": "2021-12345",
  "contactNumber": "09171234567",
  "customerEmail": "juan@student.edu.ph",
  "totalAmount": "850.00",
  "status": "PENDING_REVIEW",
  "createdAt": "2025-12-05T10:30:00.000Z",
  "orderItems": [
    {
      "id": 1,
      "quantity": 2,
      "priceAtTime": "350.00",
      "product": {
        "id": 1,
        "name": "PSSE Official T-Shirt",
        "category": "TSHIRT",
        "imageUrl": "/images/merch/tshirt.jpg"
      }
    }
  ]
}
```

---

## Error Handling

The API returns standard HTTP error responses:

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Validation failed or business rule violation |
| 401 | Unauthorized - Invalid or missing JWT token |
| 403 | Forbidden - Insufficient permissions (requires ADMIN role) |
| 404 | Not Found - Resource does not exist |
| 500 | Internal Server Error - Unexpected server error |

### Example Error Response
```json
{
  "statusCode": 400,
  "message": "Insufficient stock for product \"PSSE T-Shirt\". Available: 5, Requested: 10",
  "error": "Bad Request"
}
```

---

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt with appropriate salt rounds
2. **JWT Authentication**: Stateless authentication using signed JWT tokens
3. **Role-Based Access Control**: Admin-only routes protected by RolesGuard
4. **Input Validation**: All inputs validated using class-validator decorators
5. **Whitelist Mode**: Unknown properties stripped from requests
6. **Sensitive Data Exclusion**: Passwords excluded from all API responses

---

## References

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Passport.js Documentation](http://www.passportjs.org/docs/)
- [class-validator Documentation](https://github.com/typestack/class-validator)
- [Neon.tech Documentation](https://neon.tech/docs)
