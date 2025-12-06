# PSSE User-Order Relationship & Transaction History Implementation

## Overview

This document details the implementation of a user-order relationship system that connects authenticated users to their merchandise orders, enabling personalized transaction history tracking. The implementation includes database schema changes, backend API enhancements, and a complete frontend transaction history page with authentication integration. These changes improve user experience by allowing members to track their order history while maintaining security through JWT-based authentication.

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Prisma ORM | 7.x | Database schema management & migrations |
| PostgreSQL | - | Primary database with UUID support |
| NestJS | 11.x | Backend framework |
| Passport.js | 0.7.x | JWT authentication middleware |
| React | 19.2.0 | Frontend UI library |
| React Router | 6.x | Client-side routing |
| Axios | 1.x | HTTP client with interceptors |
| TypeScript | 5.x | Type safety across stack |
| Tailwind CSS | 3.x | UI styling framework |
| React Icons | 5.x | Icon components |

---

## Table of Contents

1. [Database Schema Changes](#database-schema-changes)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [API Endpoints](#api-endpoints)
5. [Security Considerations](#security-considerations)
6. [User Flow](#user-flow)
7. [Future Enhancements](#future-enhancements)

---

## Database Schema Changes

### 1. User-Order Relationship

**File:** `psse-backend/prisma/schema.prisma`

Added bidirectional relationship between `User` and `Order` models:

```prisma
model User {
  id                String   @id @default(uuid())
  email             String   @unique
  password          String
  name              String?
  role              Role     @default(MEMBER)
  studentId         String?
  createdAt         DateTime @default(now())
  isVerified        Boolean  @default(false)
  verificationToken String?
  orders            Order[]  // NEW: One-to-many relationship

  @@map("users")
}

model Order {
  id              String      @id @default(uuid())
  referenceId     String      @unique
  userId          String      // NEW: Foreign key to User
  customerName    String
  studentId       String
  contactNumber   String
  customerEmail   String
  totalAmount     Decimal     @db.Decimal(10, 2)
  status          OrderStatus @default(PENDING_REVIEW)
  paymentProofUrl String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  user            User        @relation(fields: [userId], references: [id]) // NEW: Relation field
  orderItems      OrderItem[]

  @@map("orders")
}
```

**Key Changes:**
- Added `userId` field to `Order` model (required, TEXT type for UUID)
- Added `user` relation field with foreign key constraint
- Added `orders` array to `User` model for reverse relation
- Maintains referential integrity with `ON DELETE RESTRICT ON UPDATE CASCADE`

### 2. Migration Script

**File:** `psse-backend/prisma/migrations/20251206132518_add_user_order_relationship/migration.sql`

```sql
/*
  Warnings:

  - Added the required column `userId` to the `orders` table without a default value. 
    This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;
```

**Migration Considerations:**
- The migration requires the `orders` table to be empty or have a default value strategy
- Foreign key constraint ensures data integrity
- `ON DELETE RESTRICT` prevents user deletion if they have orders
- `ON UPDATE CASCADE` propagates user ID changes to orders

---

## Backend Implementation

### 1. Orders Service Enhancement

**File:** `psse-backend/src/orders/orders.service.ts`

#### Updated `create` Method

Added `userId` parameter to associate orders with authenticated users:

```typescript
async create(createOrderDto: CreateOrderDto, userId?: string) {
  const { customerName, studentId, contactNumber, customerEmail, items } = createOrderDto;

  // Generate unique reference ID for this order
  const referenceId = this.generateReferenceId();

  // Use an atomic transaction to handle the complex order creation
  return this.prisma.$transaction(async (tx) => {
    // ... stock validation and decrement logic ...

    const order = await tx.order.create({
      data: {
        referenceId,
        // Connect to user using Prisma relation syntax
        user: {
          connect: { id: userId },
        },
        customerName,
        studentId,
        contactNumber,
        customerEmail,
        totalAmount,
        status: OrderStatus.PENDING_REVIEW,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return order;
  });
}
```

**Key Features:**
- Accepts optional `userId` parameter from authenticated requests
- Uses Prisma's `connect` syntax to establish user-order relationship
- Maintains transactional integrity for order creation
- Generates human-readable reference IDs (format: `ORD-YYYYMMDDHHMMSS-XXXX`)

#### New `findByUserId` Method

Added method to retrieve user-specific order history:

```typescript
/**
 * Retrieves all orders for a specific user (transaction history).
 */
async findByUserId(userId: string) {
  return this.prisma.order.findMany({
    where: { user: { id: userId } },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              imageUrl: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
```

**Features:**
- Filters orders by user ID
- Includes order items with product details
- Sorts by creation date (newest first)
- Optimizes query by selecting only necessary product fields

### 2. Orders Controller Enhancement

**File:** `psse-backend/src/orders/orders.controller.ts`

#### Protected Order Creation

Updated order creation endpoint to require authentication:

```typescript
/**
 * POST /orders - Create a new order (requires authentication)
 * Creates an order with transactional stock management
 * The userId is extracted from the JWT token
 */
@Post()
@UseGuards(JwtAuthGuard)
create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: any) {
  return this.ordersService.create(createOrderDto, user.id);
}
```

**Security:**
- Applied `@UseGuards(JwtAuthGuard)` to enforce authentication
- Uses `@CurrentUser()` decorator to extract authenticated user from JWT
- Automatically associates orders with the logged-in user

#### New Transaction History Endpoint

Added endpoint for retrieving user-specific orders:

```typescript
/**
 * GET /orders/mine - Get all orders for the authenticated user
 * Returns transaction history for the logged-in user
 * NOTE: This route MUST be defined before /:id to avoid "mine" being treated as an ID
 */
@Get('mine')
@UseGuards(JwtAuthGuard)
findMyOrders(@CurrentUser() user: any) {
  return this.ordersService.findByUserId(user.id);
}
```

**Important:**
- Route order matters: `/mine` must be defined before `/:id`
- Protects route with JWT authentication
- Returns only orders belonging to the authenticated user

### 3. DTO Updates

**File:** `psse-backend/src/orders/dto/create-order.dto.ts`

Updated `OrderItemDto` to use string-based UUIDs:

```typescript
export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;  // Changed from number to string for UUID

  @IsInt()
  @Min(1)
  quantity: number;
}
```

---

## Frontend Implementation

### 1. Transaction History Page

**File:** `psse-react/src/pages/user/TransactionHistory.tsx`

Complete implementation of user order history with authentication protection:

```typescript
export const TransactionHistory = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useUserAuth();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch user's orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      setError(null);

      try {
        const userOrders = await ordersApi.getMyOrders();
        setOrders(userOrders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load transaction history. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  // ... rendering logic ...
};
```

**Key Features:**
- Authentication protection with automatic redirect
- Fetches orders only when user is authenticated
- Displays loading spinner during data fetch
- Error handling with user-friendly messages
- Empty state for users with no orders

#### UI Components

**Order Card Structure:**
```typescript
<div className="bg-white rounded-lg shadow-md overflow-hidden">
  {/* Header with Reference ID and Status */}
  <div className="bg-linear-to-r from-psse-primary to-psse-dark p-6 text-white">
    <div className="flex items-center gap-2">
      <FaReceipt />
      <span className="text-xl font-bold">{order.referenceId}</span>
    </div>
    <span className={`status-badge ${getStatusBadgeColor(order.status)}`}>
      {formatStatus(order.status)}
    </span>
  </div>

  {/* Order Items List */}
  <div className="space-y-3">
    {order.orderItems.map((item) => (
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <img src={item.product.imageUrl} alt={item.product.name} />
        <div className="flex-1">
          <p className="font-medium">{item.product.name}</p>
          <p className="text-sm">Quantity: {item.quantity}</p>
        </div>
        <div className="font-semibold">
          ₱{(parseFloat(item.priceAtTime) * item.quantity).toFixed(2)}
        </div>
      </div>
    ))}
  </div>

  {/* Order Summary */}
  <div className="border-t pt-4">
    <div className="flex justify-between">
      <span className="text-lg font-bold">Total Amount:</span>
      <span className="text-2xl font-bold text-psse-primary">
        ₱{parseFloat(order.totalAmount).toFixed(2)}
      </span>
    </div>
  </div>
</div>
```

**Utility Functions:**

```typescript
// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get status badge color
const getStatusBadgeColor = (status: string) => {
  const statusColors: Record<string, string> = {
    pending_review: 'bg-yellow-100 text-yellow-800',
    awaiting_payment: 'bg-orange-100 text-orange-800',
    ready_pickup: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

// Format status text
const formatStatus = (status: string) => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
```

### 2. Navigation Integration

**File:** `psse-react/src/components/layout/Navbar.tsx`

Added "My Orders" link to user navigation:

```typescript
{isAuthenticated && user && (
  <>
    <div className="flex items-center gap-1 px-3 py-2">
      <FaUser className="w-4 h-4" />
      <span className="text-sm">{user?.name || 'Member'}</span>
    </div>
    <Link
      to="/user/transactions"
      className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-psse-accent/20 hover:text-psse-accent transition-all duration-200"
    >
      <FaShoppingBag className="w-4 h-4" />
      <span>My Orders</span>
    </Link>
    <button onClick={logout}>
      <FaSignOutAlt />
      <span>Logout</span>
    </button>
  </>
)}
```

**Features:**
- Displays user name from context
- Links to transaction history page
- Visible only to authenticated users
- Responsive design for mobile menu

### 3. Routing Configuration

**File:** `psse-react/src/App.tsx`

Added route for transaction history:

```typescript
<Routes>
  {/* ... other routes ... */}
  
  {/* User Routes */}
  <Route path="/user/login" element={<UserLogin />} />
  <Route path="/user/register" element={<UserRegister />} />
  <Route path="/user/verify" element={<VerifyEmail />} />
  <Route path="/user/transactions" element={<TransactionHistory />} />  {/* NEW */}
  
  {/* ... admin routes ... */}
</Routes>
```

### 4. API Service Updates

**File:** `psse-react/src/services/api.ts`

Added method to fetch user orders:

```typescript
export const ordersApi = {
  // ... existing methods ...

  /**
   * Get current user's orders (transaction history)
   */
  getMyOrders: async (): Promise<ApiOrder[]> => {
    const response = await axiosInstance.get<ApiOrder[]>('/orders/mine');
    return response.data;
  },

  /**
   * Update order status (Admin)
   */
  updateOrderStatus: async (id: string, status: OrderStatus): Promise<ApiOrder> => {
    const response = await axiosInstance.patch<ApiOrder>(`/orders/${id}`, { status });
    return response.data;
  },
};
```

**Changes:**
- Added `getMyOrders()` method for authenticated order retrieval
- Updated `updateOrderStatus` to accept string IDs (UUID)
- Automatically includes JWT token via axios interceptors

### 5. Type Definitions

**File:** `psse-react/src/types/api.types.ts`

Updated order-related types for UUID support:

```typescript
export interface ApiOrderItem {
  id: string;                    // Changed from number to string
  orderId: string;               // Changed from number to string
  productId: string;             // Changed from number to string
  quantity: number;
  priceAtTime: number | string;
  product: {                     // Nested product info
    id: string;
    name: string;
    category: Category;
    imageUrl: string;
  };
}

export interface ApiOrder {
  id: string;                    // Changed from number to string
  referenceId: string;           // NEW: Human-readable order ID
  customerName: string;
  studentId: string;
  contactNumber: string;
  customerEmail: string;
  totalAmount: number | string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  orderItems: ApiOrderItem[];    // Always included in transaction history
}

export interface OrderItemDto {
  productId: string;             // Changed from number to string
  quantity: number;
}
```

### 6. Order Context Updates

**File:** `psse-react/src/context/OrderContext.tsx`

Updated cart item structure for UUID compatibility:

```typescript
// Cart Item type
export interface CartItem {
  productId: string;  // Changed from number to string
  quantity: number;
}

// Updated order submission
const orderItems = state.cart.map((item) => ({
  productId: item.productId,  // Use UUID string directly
  quantity: item.quantity,
}));
```

### 7. Checkout Modal Updates

**File:** `psse-react/src/components/features/CheckoutModal.tsx`

Updated to work with UUID-based product IDs:

```typescript
const orderPayload: CreateOrderDto = {
  customerName: formData.customerName,
  studentId: formData.studentId,
  customerEmail: formData.customerEmail,
  contactNumber: formData.contactNumber,
  items: cart.map((item) => ({
    productId: item.productId,  // UUID string format
    quantity: item.quantity,
  })),
};

const response = await ordersApi.createOrder(orderPayload);
setOrderReferenceId(response.referenceId);  // Display reference ID
```

### 8. Admin Dashboard Updates

**File:** `psse-react/src/pages/admin/Dashboard.tsx`

Updated order management for UUID compatibility:

```typescript
// Updated state type
const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

// Updated handler
const handleOrderStatusChange = async (orderId: string, newStatus: OrderStatus) => {
  setUpdatingOrderId(orderId);
  try {
    const updatedOrder = await ordersApi.updateOrderStatus(orderId, newStatus);
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? updatedOrder : order))
    );
    toast.success('Order status updated successfully');
  } catch (error) {
    console.error('Failed to update order status:', error);
    toast.error('Failed to update order status');
  } finally {
    setUpdatingOrderId(null);
  }
};
```

**Changes:**
- Updated `updatingOrderId` state type to `string | null`
- Changed order ID parameter type from `number` to `string`
- Maintained admin functionality with UUID compatibility

### 9. Admin Authentication Cleanup

**Files:**
- `psse-react/src/pages/admin/Login.tsx`
- `psse-react/src/pages/admin/Register.tsx` (deleted)
- `psse-react/src/pages/admin/index.ts`
- `psse-react/src/pages/index.ts`

**Changes:**
- Removed admin registration functionality (admin-only system)
- Updated login to use `UserAuthContext` for consistent state management
- Removed registration route from app routing
- Simplified admin authentication flow

**Updated Admin Login:**
```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError(null);
  setIsLoading(true);

  try {
    // Use the context login function which updates user state
    await login(email, password);
    // The useEffect will handle the redirect when user state updates
  } catch (err: unknown) {
    if (err instanceof Error) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } else if (typeof err === 'object' && err !== null) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Invalid credentials. Please try again.');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};
```

---

## API Endpoints

### Orders Endpoints

#### 1. Create Order (Protected)

```http
POST /orders
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "customerName": "Juan Dela Cruz",
  "studentId": "2021-00001",
  "contactNumber": "09171234567",
  "customerEmail": "juan@example.com",
  "items": [
    {
      "productId": "uuid-string-here",
      "quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "id": "uuid-string",
  "referenceId": "ORD-20251206143022-A7K9",
  "userId": "user-uuid-string",
  "customerName": "Juan Dela Cruz",
  "studentId": "2021-00001",
  "contactNumber": "09171234567",
  "customerEmail": "juan@example.com",
  "totalAmount": "500.00",
  "status": "PENDING_REVIEW",
  "createdAt": "2025-12-06T14:30:22.000Z",
  "updatedAt": "2025-12-06T14:30:22.000Z",
  "orderItems": [
    {
      "id": "item-uuid",
      "productId": "product-uuid",
      "quantity": 2,
      "priceAtTime": "250.00",
      "product": {
        "id": "product-uuid",
        "name": "PSSE Lanyard",
        "category": "LANYARD",
        "imageUrl": "https://..."
      }
    }
  ]
}
```

#### 2. Get My Orders (Protected)

```http
GET /orders/mine
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "uuid-string",
    "referenceId": "ORD-20251206143022-A7K9",
    "userId": "user-uuid-string",
    "customerName": "Juan Dela Cruz",
    "studentId": "2021-00001",
    "contactNumber": "09171234567",
    "customerEmail": "juan@example.com",
    "totalAmount": "500.00",
    "status": "COMPLETED",
    "createdAt": "2025-12-06T14:30:22.000Z",
    "updatedAt": "2025-12-06T15:00:00.000Z",
    "orderItems": [
      {
        "id": "item-uuid",
        "productId": "product-uuid",
        "quantity": 2,
        "priceAtTime": "250.00",
        "product": {
          "id": "product-uuid",
          "name": "PSSE Lanyard",
          "category": "LANYARD",
          "imageUrl": "https://..."
        }
      }
    ]
  }
]
```

#### 3. Get All Orders (Admin)

```http
GET /orders
Authorization: Bearer <admin_jwt_token>
```

**Response:** Array of all orders with same structure as above.

#### 4. Get Single Order

```http
GET /orders/:id
```

**Response:** Single order object with order items.

#### 5. Update Order Status (Admin)

```http
PATCH /orders/:id
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "status": "READY_PICKUP"
}
```

**Response:** Updated order object.

---

## Security Considerations

### 1. Authentication & Authorization

**JWT-Based Protection:**
- All user-specific endpoints require valid JWT token
- Token must be present in `Authorization: Bearer <token>` header
- Token payload includes user ID for order association

**Access Control:**
- Users can only view their own orders
- Admin users can view all orders
- Order creation requires authentication
- Order status updates restricted to admin role

### 2. Data Privacy

**User Information:**
- Orders contain personal information (name, email, student ID)
- `/orders/mine` endpoint filters by authenticated user ID
- No endpoint exposes all users' personal order data to non-admins

**Query Filtering:**
```typescript
// Service method ensures user-specific filtering
async findByUserId(userId: string) {
  return this.prisma.order.findMany({
    where: { user: { id: userId } },  // Hard-coded filter
    // ...
  });
}
```

### 3. Database Integrity

**Foreign Key Constraints:**
- `orders.userId` references `users.id`
- `ON DELETE RESTRICT` prevents orphaned orders
- `ON UPDATE CASCADE` maintains consistency

**Transaction Safety:**
- Order creation uses `$transaction` for atomicity
- Stock decrements and order records created together
- Rollback on any failure prevents inconsistent state

### 4. Frontend Security

**Route Protection:**
```typescript
// Automatic redirect for unauthenticated users
useEffect(() => {
  if (!authLoading && !isAuthenticated) {
    navigate('/login', { replace: true });
  }
}, [authLoading, isAuthenticated, navigate]);
```

**Token Management:**
- Tokens stored in localStorage
- Axios interceptors automatically attach tokens
- Token refresh handled by auth context
- Expired tokens trigger re-login

---

## User Flow

### 1. Order Creation Flow

```
User Authentication
        ↓
Browse Merchandise
        ↓
Add Items to Cart
        ↓
Click Checkout
        ↓
Fill Order Form
        ↓
Submit Order (JWT + User ID)
        ↓
Backend Associates Order with User
        ↓
Order Created with Reference ID
        ↓
Success Message Displayed
```

### 2. Transaction History Flow

```
User Login
        ↓
Navigate to "My Orders" (Navbar)
        ↓
Frontend Checks Authentication
        ↓
Fetch Orders from /orders/mine
        ↓
Backend Filters by User ID
        ↓
Display Orders with Details
        ↓
Show Order Items, Status, Total
```

### 3. Admin Order Management Flow

```
Admin Login
        ↓
Access Admin Dashboard
        ↓
View All Orders
        ↓
Update Order Status
        ↓
Changes Reflected in User's Transaction History
```

---

## Code Examples

### 1. Creating an Order with User Association

**Backend Service:**
```typescript
async create(createOrderDto: CreateOrderDto, userId?: string) {
  const referenceId = this.generateReferenceId();
  
  return this.prisma.$transaction(async (tx) => {
    // Validate and decrement stock
    // ... validation logic ...
    
    // Create order with user association
    const order = await tx.order.create({
      data: {
        referenceId,
        user: {
          connect: { id: userId },  // Connect to authenticated user
        },
        customerName,
        studentId,
        contactNumber,
        customerEmail,
        totalAmount,
        status: OrderStatus.PENDING_REVIEW,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    });
    
    return order;
  });
}
```

**Frontend Component:**
```typescript
const handleSubmitOrder = async () => {
  try {
    const orderPayload = {
      customerName: formData.customerName,
      studentId: formData.studentId,
      customerEmail: formData.customerEmail,
      contactNumber: formData.contactNumber,
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    // JWT token automatically attached by axios interceptor
    const response = await ordersApi.createOrder(orderPayload);
    
    setOrderReferenceId(response.referenceId);
    clearCart();
    setStep('success');
  } catch (error) {
    // Handle error
  }
};
```

### 2. Fetching User Orders

**Backend Controller:**
```typescript
@Get('mine')
@UseGuards(JwtAuthGuard)
findMyOrders(@CurrentUser() user: any) {
  return this.ordersService.findByUserId(user.id);
}
```

**Frontend Hook:**
```typescript
useEffect(() => {
  const fetchOrders = async () => {
    if (!isAuthenticated) return;

    try {
      const userOrders = await ordersApi.getMyOrders();
      setOrders(userOrders);
    } catch (err) {
      setError('Failed to load transaction history.');
    }
  };

  fetchOrders();
}, [isAuthenticated]);
```

### 3. Displaying Order History

```typescript
<div className="space-y-6">
  {orders.map((order) => (
    <div key={order.id} className="bg-white rounded-lg shadow-md">
      {/* Order Header */}
      <div className="bg-linear-to-r from-psse-primary to-psse-dark p-6 text-white">
        <div className="flex justify-between">
          <div>
            <FaReceipt />
            <p className="text-xl font-bold">{order.referenceId}</p>
          </div>
          <div>
            <FaCalendar />
            <span>{formatDate(order.createdAt)}</span>
            <span className={getStatusBadgeColor(order.status)}>
              {formatStatus(order.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="p-6">
        {order.orderItems.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <img src={item.product.imageUrl} alt={item.product.name} className="w-16 h-16" />
            <div className="flex-1">
              <p className="font-medium">{item.product.name}</p>
              <p className="text-sm">Quantity: {item.quantity} × ₱{parseFloat(String(item.priceAtTime)).toFixed(2)}</p>
            </div>
            <div className="font-semibold">
              ₱{(parseFloat(String(item.priceAtTime)) * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}

        {/* Total */}
        <div className="border-t pt-4 flex justify-between">
          <span className="text-lg font-bold">Total Amount:</span>
          <span className="text-2xl font-bold text-psse-primary">
            ₱{parseFloat(String(order.totalAmount)).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  ))}
</div>
```

---

## Testing

### 1. Backend Tests

#### Test Order Creation with User

```typescript
describe('OrdersController', () => {
  it('should create order with userId from JWT', async () => {
    const user = { id: 'user-uuid', email: 'test@example.com' };
    const createOrderDto: CreateOrderDto = {
      customerName: 'Test User',
      studentId: '2021-00001',
      contactNumber: '09171234567',
      customerEmail: 'test@example.com',
      items: [
        { productId: 'product-uuid', quantity: 2 }
      ]
    };

    const result = await controller.create(createOrderDto, user);

    expect(result.userId).toBe(user.id);
    expect(result.customerName).toBe(createOrderDto.customerName);
  });
});
```

#### Test Transaction History Retrieval

```typescript
describe('OrdersService', () => {
  it('should return only user-specific orders', async () => {
    const userId = 'user-uuid';
    const orders = await service.findByUserId(userId);

    orders.forEach(order => {
      expect(order.userId).toBe(userId);
    });
  });
});
```

### 2. Frontend Tests

#### Test Transaction History Page

```typescript
describe('TransactionHistory', () => {
  it('should redirect if not authenticated', () => {
    const { result } = renderHook(() => useUserAuth(), {
      wrapper: ({ children }) => (
        <UserAuthProvider>{children}</UserAuthProvider>
      ),
    });

    expect(result.current.isAuthenticated).toBe(false);
    // Check that navigate was called with '/login'
  });

  it('should fetch and display orders', async () => {
    const mockOrders = [
      {
        id: 'order-uuid',
        referenceId: 'ORD-20251206143022-A7K9',
        customerName: 'Test User',
        totalAmount: '500.00',
        status: 'COMPLETED',
        orderItems: [],
      },
    ];

    jest.spyOn(ordersApi, 'getMyOrders').mockResolvedValue(mockOrders);

    render(<TransactionHistory />);

    await waitFor(() => {
      expect(screen.getByText('ORD-20251206143022-A7K9')).toBeInTheDocument();
    });
  });
});
```

### 3. Integration Tests

#### End-to-End Order Flow

```typescript
describe('Order Creation Flow', () => {
  it('should create order and appear in transaction history', async () => {
    // 1. Login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    const token = loginResponse.body.access_token;

    // 2. Create order
    const orderResponse = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerName: 'Test User',
        studentId: '2021-00001',
        contactNumber: '09171234567',
        customerEmail: 'test@example.com',
        items: [{ productId: 'product-uuid', quantity: 1 }],
      });

    expect(orderResponse.status).toBe(201);
    const orderId = orderResponse.body.id;

    // 3. Fetch transaction history
    const historyResponse = await request(app.getHttpServer())
      .get('/orders/mine')
      .set('Authorization', `Bearer ${token}`);

    expect(historyResponse.status).toBe(200);
    expect(historyResponse.body).toContainEqual(
      expect.objectContaining({ id: orderId })
    );
  });
});
```

---

## Future Enhancements

### 1. Advanced Filtering & Search

**Planned Features:**
- Filter orders by status (pending, completed, cancelled)
- Date range filtering
- Search by reference ID
- Sort by date, amount, or status

**Implementation:**
```typescript
// Backend
async findByUserId(userId: string, filters?: OrderFilters) {
  return this.prisma.order.findMany({
    where: {
      user: { id: userId },
      status: filters?.status,
      createdAt: filters?.dateRange && {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end,
      },
    },
    orderBy: filters?.sortBy || { createdAt: 'desc' },
  });
}
```

### 2. Order Tracking

**Planned Features:**
- Real-time order status updates
- Email notifications on status changes
- Estimated pickup dates
- Order timeline visualization

### 3. Payment Integration

**Planned Features:**
- Upload payment proof
- Payment verification workflow
- Receipt generation
- Refund requests

### 4. Order Modifications

**Planned Features:**
- Cancel pending orders
- Request order modifications
- Add notes to orders
- Contact support for order issues

### 5. Export & Reporting

**Planned Features:**
- Export order history to PDF/CSV
- Spending analytics
- Purchase history charts
- Year-end summaries

### 6. Performance Optimizations

**Planned Features:**
- Pagination for large order lists
- Infinite scroll implementation
- Order caching strategies
- Optimistic UI updates

---

## Migration Guide

### For Existing Data

If you have existing orders without `userId`, run this migration:

```sql
-- 1. Add nullable userId column first
ALTER TABLE "orders" ADD COLUMN "userId" TEXT;

-- 2. Assign orders to a default user or admin
UPDATE "orders" 
SET "userId" = (SELECT id FROM "users" WHERE role = 'ADMIN' LIMIT 1)
WHERE "userId" IS NULL;

-- 3. Make userId required
ALTER TABLE "orders" ALTER COLUMN "userId" SET NOT NULL;

-- 4. Add foreign key constraint
ALTER TABLE "orders" 
ADD CONSTRAINT "orders_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;
```

### For Frontend Updates

Update existing code to pass JWT tokens:

```typescript
// Before
await ordersApi.createOrder(orderData);

// After (token automatically attached)
// Ensure axios interceptor is configured
await ordersApi.createOrder(orderData);
```

---

## Conclusion

The User-Order Relationship & Transaction History implementation provides a complete solution for tracking user orders in the PSSE system. By connecting orders to authenticated users, the system enables personalized order history, improves data organization, and enhances the overall user experience. The implementation maintains security through JWT-based authentication, ensures data integrity through database constraints, and provides an intuitive UI for users to track their purchases.

Key achievements:
- ✅ Database schema updated with user-order relationship
- ✅ Backend API enhanced with user-specific endpoints
- ✅ Complete transaction history page with authentication
- ✅ Navigation integration for easy access
- ✅ UUID compatibility across all order-related operations
- ✅ Security measures for data privacy
- ✅ Admin functionality preserved with UUID support

---

**Last Updated:** December 6, 2025  
**Author:** PSSE Development Team  
**Version:** 1.0.0
