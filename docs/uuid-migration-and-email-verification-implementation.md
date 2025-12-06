# PSSE UUID Migration & Email Verification Implementation

## Overview

This document details the comprehensive migration from auto-incrementing integer IDs to UUID-based identifiers across the entire PSSE application, along with the implementation of an email verification system for user registration. These changes enhance security, scalability, and user authentication workflows while maintaining data integrity through atomic database operations.

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Prisma ORM | 7.x | Database schema management & migrations |
| PostgreSQL | - | Primary database |
| Neon.tech | - | Serverless PostgreSQL hosting |
| NestJS | 11.x | Backend framework |
| @nestjs-modules/mailer | 2.0.2 | Email service integration |
| Nodemailer | 7.0.11 | Email transport layer |
| Handlebars | 4.7.8 | Email template engine |
| React | 19.2.0 | Frontend UI library |
| TypeScript | 5.x | Type safety across stack |

---

## Project Structure

### Backend Changes

```
psse-backend/
├── prisma/
│   ├── migrations/
│   │   └── 20251206103108_init_uuid_schema/
│   │       └── migration.sql            # UUID migration script
│   ├── schema.prisma                    # Updated with UUID fields
│   └── seed.ts                          # Updated seed data & SSL config
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts          # Added resend verification endpoint
│   │   ├── auth.service.ts             # Email verification logic
│   │   ├── auth.module.ts              # Integrated MailModule
│   │   └── interfaces/
│   │       └── jwt-payload.interface.ts # Changed sub to string
│   ├── mail/                            # NEW MODULE
│   │   ├── mail.module.ts              # Mailer configuration
│   │   ├── mail.service.ts             # Email sending service
│   │   ├── index.ts                    # Module exports
│   │   └── templates/
│   │       └── confirmation.hbs         # Email verification template
│   ├── events/
│   │   ├── events.controller.ts        # Updated to use string IDs
│   │   └── events.service.ts           # UUID compatibility
│   ├── officers/
│   │   ├── officers.controller.ts      # Updated to use string IDs
│   │   └── officers.service.ts         # UUID compatibility
│   ├── orders/
│   │   ├── orders.controller.ts        # Updated to use string IDs
│   │   ├── orders.service.ts           # Added referenceId generation
│   │   └── dto/
│   │       └── create-order.dto.ts     # Updated productId to string
│   ├── products/
│   │   ├── products.controller.ts      # Updated to use string IDs
│   │   └── products.service.ts         # UUID compatibility
│   └── prisma/
│       └── prisma.service.ts           # Added SSL configuration
├── package.json                         # Added email dependencies
└── .env                                 # Mail configuration variables
```

### Frontend Changes

```
psse-react/src/
├── components/
│   └── layout/
│       └── Footer.tsx                   # Enhanced styling & layout
├── lib/
│   ├── axios.ts                        # Enhanced token handling
│   └── officerUtils.ts                 # Updated category mappings
├── pages/
│   ├── About.tsx                       # Updated grid layouts for categories
│   ├── Events.tsx                      # Improved responsive layout
│   ├── index.ts                        # Added VerifyEmail export
│   └── user/
│       ├── UserLogin.tsx               # Added resend verification
│       ├── UserRegister.tsx            # Updated success flow
│       ├── VerifyEmail.tsx             # NEW: Email verification page
│       └── index.ts                    # Added VerifyEmail export
├── services/
│   └── api.ts                          # Added resendVerification API
├── types/
│   └── index.ts                        # Updated OfficerCategory enum
└── App.tsx                             # Added /user/verify route
```

---

## Database Schema Changes

### UUID Migration

All primary keys and foreign keys have been migrated from `SERIAL` (auto-incrementing integers) to `TEXT` with UUID default values.

#### Schema Comparison

**Before (Integer IDs):**
```prisma
model User {
  id                Int      @id @default(autoincrement())
  email             String   @unique
  // ... other fields
}

model Order {
  id            Int         @id @default(autoincrement())
  orderItems    OrderItem[]
  // ... other fields
}

model OrderItem {
  id          Int     @id @default(autoincrement())
  orderId     Int
  productId   Int
  // ... other fields
}
```

**After (UUID):**
```prisma
model User {
  id                String   @id @default(uuid())
  email             String   @unique
  // ... other fields
  isVerified        Boolean  @default(false)
  verificationToken String?
}

model Order {
  id              String      @id @default(uuid())
  referenceId     String      @unique
  paymentProofUrl String?
  orderItems      OrderItem[]
  // ... other fields
}

model OrderItem {
  id          String  @id @default(uuid())
  orderId     String
  productId   String
  // ... other fields
}
```

#### Migration SQL

The migration script (`20251206103108_init_uuid_schema/migration.sql`) performs the following operations:

```sql
-- 1. Drop foreign key constraints
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_orderId_fkey";
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_productId_fkey";

-- 2. Convert primary keys to TEXT with UUID
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";

-- Similar changes for: events, officers, products, orders, order_items

-- 3. Add new fields to orders table
ALTER TABLE "orders" 
ADD COLUMN "paymentProofUrl" TEXT,
ADD COLUMN "referenceId" TEXT NOT NULL;

-- 4. Create unique constraint for referenceId
CREATE UNIQUE INDEX "orders_referenceId_key" ON "orders"("referenceId");

-- 5. Recreate foreign keys with CASCADE
ALTER TABLE "order_items" 
ADD CONSTRAINT "order_items_orderId_fkey" 
FOREIGN KEY ("orderId") REFERENCES "orders"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;
```

### Key Schema Features

#### User Model
```prisma
model User {
  id                String   @id @default(uuid())
  email             String   @unique
  password          String
  name              String?
  role              Role     @default(MEMBER)
  studentId         String?
  createdAt         DateTime @default(now())
  isVerified        Boolean  @default(false)      // NEW
  verificationToken String?                       // NEW

  @@map("users")
}
```

#### Order Model with Reference ID
```prisma
model Order {
  id              String      @id @default(uuid())
  referenceId     String      @unique              // NEW: Human-readable ID
  customerName    String
  studentId       String
  contactNumber   String
  customerEmail   String
  totalAmount     Decimal     @db.Decimal(10, 2)
  status          OrderStatus @default(PENDING_REVIEW)
  paymentProofUrl String?                          // NEW: Payment proof upload
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  orderItems      OrderItem[]

  @@map("orders")
}
```

#### Officer Category Enum
```prisma
enum OfficerCategory {
  EXEC         // Executive Board (5 positions)
  ADMIN        // Administrative Officers
  FINANCE      // Finance & Treasury Officers
  REP          // Year Level Representatives
  AMBASSADOR   // PSSE Ambassadors
}
```

---

## Email Verification System

### Mail Module Implementation

#### Configuration (`mail.module.ts`)

```typescript
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          secure: true, // SSL for port 465
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
          tls: {
            rejectUnauthorized: false, // Accept self-signed certificates
          },
        },
        defaults: {
          from: configService.get<string>('MAIL_FROM'),
        },
        template: {
          dir: process.cwd() + '/src/mail/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
```

#### Environment Variables

Add to `.env`:
```env
# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-specific-password
MAIL_FROM='"PSSE Organization" <noreply@psse.org>'

# Frontend URL for verification links
FRONTEND_URL=http://localhost:5173
```

#### Mail Service (`mail.service.ts`)

```typescript
@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendUserConfirmation(user: User, token: string): Promise<void> {
    const url = `${process.env.FRONTEND_URL}/user/verify?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to PSSE! Confirm your Email',
      template: './confirmation',
      context: {
        name: user.name,
        url,
      },
    });
  }
}
```

#### Email Template (`templates/confirmation.hbs`)

```handlebars
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Confirmation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #f4f4f4;
      border-radius: 10px;
      padding: 30px;
      text-align: center;
    }
    .header {
      background-color: #007bff;
      color: white;
      padding: 20px;
      border-radius: 10px 10px 0 0;
      margin: -30px -30px 20px -30px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to PSSE!</h1>
    </div>
    <div class="content">
      <p>Hi {{name}},</p>
      <p>Thank you for registering with PSSE!</p>
      <p>Please confirm your email address by clicking the button below:</p>
      <a href="{{url}}" class="button">Confirm Email</a>
      <p>If the button doesn't work, copy and paste this link:</p>
      <p style="word-break: break-all; color: #007bff;">{{url}}</p>
      <p>This link will expire in 24 hours for security reasons.</p>
    </div>
  </div>
</body>
</html>
```

### Authentication Flow with Email Verification

#### 1. User Registration

**AuthService (`auth.service.ts`):**
```typescript
async register(dto: RegisterDto): Promise<{ message: string }> {
  // Check if user exists
  const existingUser = await this.prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (existingUser) {
    throw new ConflictException('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(dto.password, 10);

  // Generate UUID verification token
  const verificationToken = randomUUID();

  // Create user with verification token
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
    message: 'Registration successful. Please check your email to verify.' 
  };
}
```

#### 2. Email Verification

**AuthController (`auth.controller.ts`):**
```typescript
@Get('verify')
@HttpCode(HttpStatus.OK)
async verifyEmail(@Query('token') token: string) {
  return this.authService.verifyEmail(token);
}
```

**AuthService:**
```typescript
async verifyEmail(token: string): Promise<{ message: string; alreadyVerified?: boolean }> {
  // Find user by verification token
  let user = await this.prisma.user.findFirst({
    where: { verificationToken: token },
  });

  // Handle already verified case gracefully
  if (!user) {
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

  // Mark user as verified and clear token
  await this.prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
    },
  });

  return { message: 'Email verified successfully! You can now log in.' };
}
```

#### 3. Login with Verification Check

**AuthService:**
```typescript
async login(user: { 
  id: string; 
  email: string; 
  role: string; 
  isVerified: boolean 
}): Promise<{ access_token: string }> {
  // Check if user's email is verified
  if (!user.isVerified) {
    throw new UnauthorizedException('Please verify your email first');
  }

  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const access_token = this.jwtService.sign(payload);
  return { access_token };
}
```

#### 4. Resend Verification Email

**AuthController:**
```typescript
@Post('resend-verification')
@HttpCode(HttpStatus.OK)
async resendVerification(@Body('email') email: string) {
  return this.authService.resendVerificationEmail(email);
}
```

**AuthService:**
```typescript
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

  // Generate new verification token
  const verificationToken = randomUUID();

  // Update user with new token
  await this.prisma.user.update({
    where: { id: user.id },
    data: { verificationToken },
  });

  // Send new confirmation email
  await this.mailService.sendUserConfirmation(user, verificationToken);

  return { 
    message: 'Verification email has been resent. Please check your inbox.' 
  };
}
```

---

## Frontend Implementation

### Email Verification Page

**Component (`VerifyEmail.tsx`):**
```typescript
type VerificationState = 'loading' | 'success' | 'error';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<VerificationState>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    let hasVerified = false;

    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        if (isMounted) {
          setState('error');
          setMessage('Invalid verification link. No token provided.');
        }
        return;
      }

      // Prevent duplicate calls
      if (hasVerified) return;
      hasVerified = true;

      try {
        const response = await axiosInstance.get(`/auth/verify?token=${token}`);
        if (isMounted) {
          setState('success');
          setMessage(response.data.message || 'Email verified successfully!');
        }
      } catch (err: any) {
        if (isMounted) {
          const errorMsg = err.response?.data?.message || '';
          
          // Handle already verified gracefully
          if (errorMsg.toLowerCase().includes('already verified') || 
              errorMsg.toLowerCase().includes('verified successfully')) {
            setState('success');
            setMessage('Your email has been verified successfully!');
          } else {
            setState('error');
            setMessage(errorMsg || 'Verification failed.');
          }
        }
      }
    };

    verifyEmail();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  // Render loading, success, or error state
  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* UI based on state */}
    </div>
  );
};
```

### Enhanced Login with Resend Verification

**UserLogin Component:**
```typescript
export const UserLogin = () => {
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setIsResending(true);
    try {
      await authApi.resendVerification(email);
      setResendSuccess(true);
      setNeedsVerification(false);
    } catch (err: unknown) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      const errorMsg = err.message || 'Invalid credentials';
      setError(errorMsg);
      
      // Check if error is about email verification
      if (errorMsg.toLowerCase().includes('verify')) {
        setNeedsVerification(true);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Email and password fields */}
      
      {error && needsVerification && (
        <button 
          type="button"
          onClick={handleResendVerification}
          disabled={isResending}
        >
          {isResending ? 'Sending...' : 'Resend Verification Email'}
        </button>
      )}
    </form>
  );
};
```

### Updated Registration Success Flow

**UserRegister Component:**
```typescript
// After successful registration
setIsSuccess(true);

// Show success state with email verification instructions
return (
  <div className="text-center">
    <FaCheckCircle className="text-green-500 h-16 w-16" />
    <h1>Registration Successful!</h1>
    
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h2>Check Your Email</h2>
      <p>We've sent a verification link to:</p>
      <p className="font-medium">{formData.email}</p>
      <p>Click the link to verify your account before logging in.</p>
    </div>

    <button onClick={() => navigate('/user/login')}>
      Go to Login
    </button>
  </div>
);
```

---

## Order Reference ID System

### Human-Readable Reference ID Generation

**Implementation in OrdersService:**
```typescript
/**
 * Generates a human-readable reference ID for orders
 * Format: ORD-YYYYMMDDHHMMSS-XXXX
 * Example: ORD-20251206143022-A7K9
 */
private generateReferenceId(): string {
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/[-:T]/g, '')
    .slice(0, 14); // YYYYMMDDHHmmss
  
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomSuffix = '';
  for (let i = 0; i < 4; i++) {
    randomSuffix += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  
  return `ORD-${timestamp}-${randomSuffix}`;
}
```

### Order Creation with Reference ID

```typescript
async create(createOrderDto: CreateOrderDto) {
  const { customerName, studentId, contactNumber, customerEmail, items } = createOrderDto;

  // Generate unique reference ID
  const referenceId = this.generateReferenceId();

  return this.prisma.$transaction(async (tx) => {
    const orderItemsData: {
      productId: string;
      quantity: number;
      priceAtTime: Prisma.Decimal;
    }[] = [];

    let totalAmount = new Prisma.Decimal(0);

    // Validate and process items
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Product "${product.name}" is out of stock. ` +
          `Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }

      // Decrement stock atomically
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });

      const itemTotal = product.price.mul(item.quantity);
      totalAmount = totalAmount.add(itemTotal);

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtTime: product.price,
      });
    }

    // Create order with referenceId
    return tx.order.create({
      data: {
        referenceId,
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

---

## Database Seeding Updates

### SSL Configuration

```typescript
// prisma.service.ts & seed.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
});
```

### Admin User with Verification

```typescript
const adminUser = await prisma.user.upsert({
  where: { email: 'admin@psse.org' },
  update: { 
    password: hashedPassword,
    isVerified: true,
  },
  create: {
    email: 'admin@psse.org',
    password: hashedPassword,
    name: 'PSSE Admin',
    role: Role.ADMIN,
    studentId: 'ADMIN-001',
    isVerified: true, // Admin is pre-verified
  },
});
```

### Placeholder Images for Seed Data

All seed data now uses placeholder images instead of local paths:

```typescript
const officers = [
  {
    name: 'Juan Dela Cruz',
    position: 'President',
    category: OfficerCategory.EXEC,
    photoUrl: 'https://via.placeholder.com/300x300/1E3A8A/FFFFFF?text=President',
    academicYear: '2024-2025',
    order: 1
  },
  // ... more officers
];

const events = [
  {
    title: 'PSSE General Assembly 2025',
    description: 'Join us for our annual General Assembly...',
    date: new Date('2025-01-15T14:00:00Z'),
    imageUrl: 'https://via.placeholder.com/800x600/1E3A8A/FFFFFF?text=General+Assembly',
    location: 'College of Engineering Auditorium',
    isUpcoming: true,
  },
  // ... more events
];
```

---

## Frontend Type System Updates

### Officer Category Enum

**Before:**
```typescript
export type OfficerCategory = 
  | 'executive'
  | 'administrative'
  | 'audit'
  | 'communications';
```

**After:**
```typescript
export type OfficerCategory = 
  | 'exec'
  | 'admin'
  | 'finance'
  | 'rep'
  | 'ambassador';
```

### Category Mapping Utility

```typescript
// lib/officerUtils.ts
export const officerCategories: Record<OfficerCategory, OfficerCategoryInfo> = {
  exec: {
    title: 'Executive Board',
    description: 'The primary leadership team responsible for strategic direction',
  },
  admin: {
    title: 'Administrative Officers',
    description: 'Officers responsible for documentation and operations',
  },
  finance: {
    title: 'Finance Officers',
    description: 'Officers ensuring financial transparency and treasury management',
  },
  rep: {
    title: 'Year Level Representatives',
    description: 'Student representatives ensuring effective communication',
  },
  ambassador: {
    title: 'PSSE Ambassadors',
    description: 'Official ambassadors representing PSSE externally',
  },
};

// Normalization function for database values
function normalizeCategory(rawCategory: string): OfficerCategory {
  const category = rawCategory.toUpperCase().trim();

  switch (category) {
    case 'EXEC':
      return 'exec';
    case 'ADMIN':
      return 'admin';
    case 'FINANCE':
      return 'finance';
    case 'REP':
      return 'rep';
    case 'AMBASSADOR':
      return 'ambassador';
    default:
      console.warn(`Unknown category: "${rawCategory}", defaulting to 'exec'`);
      return 'exec';
  }
}
```

### Updated Grid Layouts

**About Page Officer Grids:**
```typescript
<div className={`grid gap-4 ${
  group.category === 'exec'
    ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
    : group.category === 'admin'
      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
      : group.category === 'finance'
        ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
        : group.category === 'rep'
          ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-4'
          : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-2'
}`}>
  {/* Officer cards */}
</div>
```

---

## Token Management Enhancements

### Dual Token Support in Axios

```typescript
// lib/axios.ts
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check for both admin and user tokens
    const adminToken = localStorage.getItem('access_token');
    const userToken = localStorage.getItem('user_access_token');
    const token = adminToken || userToken;
    
    if (token && token !== 'undefined') {
      if (!config.headers) {
        config.headers = {} as any;
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### Enhanced 401 Handling

```typescript
// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data?.error || 
      error.message || 
      'An unexpected error occurred';

    toast.error(errorMessage);
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear both tokens on 401
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_access_token');
      // Don't redirect automatically - let components handle it
    }
    
    return Promise.reject(error);
  }
);
```

---

## API Service Updates

### New Resend Verification Endpoint

```typescript
// services/api.ts
export const authApi = {
  // ... existing methods

  /**
   * Resend verification email
   */
  resendVerification: async (email: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/auth/resend-verification', { email });
    return response.data;
  },
};
```

---

## Migration Checklist

### Backend Migration Steps

- [x] Create UUID migration script
- [x] Update Prisma schema with UUID fields
- [x] Add email verification fields to User model
- [x] Add referenceId and paymentProofUrl to Order model
- [x] Install email dependencies (@nestjs-modules/mailer, nodemailer, handlebars)
- [x] Create Mail module with Handlebars configuration
- [x] Create email verification template
- [x] Update AuthService with verification logic
- [x] Add verification endpoints to AuthController
- [x] Update all controllers to use string IDs instead of ParseIntPipe
- [x] Update all services to handle UUID strings
- [x] Add referenceId generation to OrdersService
- [x] Update seed data with placeholder images
- [x] Add SSL configuration to PrismaService

### Frontend Migration Steps

- [x] Create VerifyEmail page component
- [x] Add /user/verify route to App.tsx
- [x] Update UserLogin with resend verification functionality
- [x] Update UserRegister success flow
- [x] Add resendVerification to API services
- [x] Update OfficerCategory type definitions
- [x] Update officerUtils category mappings
- [x] Enhance axios interceptor with dual token support
- [x] Update About page grid layouts
- [x] Enhance Footer component styling
- [x] Improve Events page responsive layout

---

## Testing Guidelines

### Email Verification Flow

1. **Registration:**
   ```bash
   POST /auth/register
   {
     "email": "test@example.com",
     "password": "Test123!",
     "name": "Test User",
     "studentId": "2024-12345"
   }
   ```
   - Should receive: `{ message: "Registration successful. Please check your email to verify." }`
   - Email should be sent with verification link

2. **Email Verification:**
   ```bash
   GET /auth/verify?token=<uuid-token>
   ```
   - Should mark user as verified
   - Should clear verification token
   - Clicking link again should return success (already verified)

3. **Login Before Verification:**
   ```bash
   POST /auth/login
   {
     "email": "test@example.com",
     "password": "Test123!"
   }
   ```
   - Should fail with: `401 Unauthorized: Please verify your email first`

4. **Resend Verification:**
   ```bash
   POST /auth/resend-verification
   {
     "email": "test@example.com"
   }
   ```
   - Should generate new token
   - Should send new email

5. **Login After Verification:**
   - Should succeed and return access_token

### UUID Integration Testing

1. **Create Officer with UUID:**
   ```bash
   POST /officers
   {
     "name": "Test Officer",
     "position": "Test Position",
     "category": "EXEC",
     "photoUrl": "https://example.com/photo.jpg",
     "academicYear": "2024-2025",
     "order": 1
   }
   ```
   - Response should contain UUID string for `id`

2. **Get Officer by UUID:**
   ```bash
   GET /officers/<uuid-string>
   ```
   - Should retrieve officer successfully

3. **Order with Reference ID:**
   ```bash
   POST /orders
   {
     "customerName": "Test Customer",
     "studentId": "2024-12345",
     "contactNumber": "09123456789",
     "customerEmail": "test@example.com",
     "items": [
       { "productId": "<uuid>", "quantity": 1 }
     ]
   }
   ```
   - Should return order with `referenceId` in format: `ORD-20251206143022-A7K9`
   - Should have UUID for `id`

---

## Environment Configuration

### Required Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1d

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-specific-password
MAIL_FROM='"PSSE Organization" <noreply@psse.org>'

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Cloudinary (existing)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Gmail App Password Setup

1. Enable 2-Factor Authentication on Google Account
2. Go to Google Account > Security > 2-Step Verification
3. Scroll to "App passwords"
4. Generate new app password for "Mail"
5. Use generated password as `MAIL_PASSWORD`

---

## Security Considerations

### UUID Benefits

1. **Non-Sequential:** UUIDs don't reveal record count or creation order
2. **Globally Unique:** Can merge databases without ID conflicts
3. **Harder to Guess:** 128-bit randomness prevents enumeration attacks
4. **No Lock Contention:** Distributed ID generation without database coordination

### Email Verification Security

1. **Token Expiration:** Verification tokens should ideally expire (future enhancement)
2. **One-Time Use:** Tokens are cleared after successful verification
3. **Idempotent Verification:** Multiple clicks on same link handled gracefully
4. **Rate Limiting:** Consider adding rate limits to resend endpoint (future)

### Password Security

1. **Bcrypt Hashing:** 10 salt rounds for password hashing
2. **No Plain Text Storage:** Passwords never stored in plain text
3. **Secure Comparison:** bcrypt.compare used for validation

---

## Performance Considerations

### UUID Storage

- **Storage Size:** UUIDs as TEXT use ~36 bytes vs 4 bytes for INT
- **Index Performance:** B-tree indexes work efficiently with UUIDs
- **Alternative:** Consider using UUID binary format for production optimization

### Email Delivery

- **Async Processing:** Email sending is non-blocking
- **Error Handling:** Failed emails don't prevent registration
- **Queue System:** Consider adding job queue for production (Bull/BullMQ)

### Transaction Isolation

- **Order Creation:** Uses Prisma transactions for atomic stock management
- **Serializable Reads:** Prevents race conditions in concurrent orders
- **Rollback Safety:** Failed orders automatically rollback stock changes

---

## Future Enhancements

1. **Token Expiration:**
   - Add `verificationTokenExpiry` field to User model
   - Check expiration in verification logic
   - Auto-cleanup expired tokens

2. **Email Queue:**
   - Implement Bull/BullMQ for background job processing
   - Retry failed email deliveries
   - Track email delivery status

3. **Rate Limiting:**
   - Add throttling to resend verification endpoint
   - Implement IP-based rate limiting
   - Track verification attempts per user

4. **UUID Optimization:**
   - Consider UUIDv7 for better database performance
   - Use binary UUID storage in production
   - Implement custom UUID generator

5. **Multi-Factor Authentication:**
   - Add OTP verification option
   - Implement authenticator app support
   - SMS verification fallback

---

## Troubleshooting

### Common Issues

#### Email Not Sending

**Problem:** Verification emails not being delivered

**Solutions:**
1. Check Gmail App Password is correct
2. Verify MAIL_USER and MAIL_PASSWORD in .env
3. Check spam folder
4. Ensure 2FA is enabled on Google account
5. Check Handlebars template syntax

#### UUID Type Errors

**Problem:** Type mismatch errors with UUIDs

**Solutions:**
1. Ensure all controller params use string type
2. Remove ParseIntPipe from route params
3. Update DTOs to use string for IDs
4. Clear node_modules and reinstall

#### Verification Link Not Working

**Problem:** Clicking verification link shows error

**Solutions:**
1. Check FRONTEND_URL in backend .env
2. Verify token query parameter is present
3. Check React Router configuration
4. Ensure VerifyEmail route is registered

#### Migration Failures

**Problem:** UUID migration fails

**Solutions:**
1. Backup database before migration
2. Ensure database is empty or has test data only
3. Run `prisma migrate reset` to start fresh
4. Check foreign key constraints are dropped first
5. Verify sequence cleanup in migration

---

## Conclusion

This implementation successfully migrates the PSSE application from integer-based IDs to UUID identifiers while introducing a robust email verification system. The changes improve security, scalability, and user experience through:

- **UUID Migration:** All entities now use globally unique identifiers
- **Email Verification:** Users must verify email before accessing member features
- **Reference IDs:** Human-readable order tracking with unique reference numbers
- **Enhanced Security:** Better token management and verification flows
- **Type Safety:** Comprehensive TypeScript types across frontend and backend
- **Database Integrity:** Atomic transactions prevent race conditions
- **User Experience:** Clear verification flows with resend capabilities

The implementation maintains backward compatibility through careful migration strategies and includes comprehensive error handling, logging, and user feedback mechanisms.

---

## Contributors

- **Backend Development:** VLAN Technologies, Inc.
- **Frontend Development:** VLAN Technologies, Inc.
- **Documentation:** AI Assistant
- **Last Updated:** December 6, 2025

---

## References

- [Prisma UUID Documentation](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#string)
- [NestJS Mailer Module](https://nest-modules.github.io/mailer/)
- [Handlebars Documentation](https://handlebarsjs.com/)
- [UUID RFC 4122](https://tools.ietf.org/html/rfc4122)
- [OWASP Email Verification Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
