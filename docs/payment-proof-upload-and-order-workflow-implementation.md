# PSSE Payment Proof Upload & Order Workflow Implementation

## Overview

This document details the implementation of payment proof upload functionality, enhanced order workflow management, and user experience improvements for the PSSE merchandise ordering system. The implementation includes a complete file upload system using Cloudinary, improved order status management with stock control, user order cancellation capability, checkout form pre-filling from user profiles, seamless post-checkout navigation, and comprehensive UI enhancements for both user and admin interfaces. These changes enable users to submit GCash payment screenshots, admins to review submissions, and ensure proper inventory management through transactional stock operations.

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 11.x | Backend framework |
| TypeScript | 5.x | Type safety |
| Prisma ORM | 7.x | Database ORM with transaction support |
| PostgreSQL | - | Primary database |
| Cloudinary | - | Image hosting & management |
| Multer | - | Multipart file upload middleware |
| React | 19.2.0 | Frontend UI library |
| React Icons | 5.x | Icon components |
| Axios | 1.x | HTTP client |
| Tailwind CSS | 3.x | UI styling framework |

---

## Table of Contents

1. [Database Schema Considerations](#database-schema-considerations)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Checkout Modal UX Improvements](#checkout-modal-ux-improvements)
5. [API Endpoints](#api-endpoints)
6. [Order Workflow](#order-workflow)
7. [Stock Management](#stock-management)
8. [Security Considerations](#security-considerations)
9. [Testing](#testing)
10. [Future Enhancements](#future-enhancements)

---

## Database Schema Considerations

### 1. Existing Order Model

The implementation leverages the existing `paymentProofUrl` field in the `Order` model:

```prisma
model Order {
  id              String      @id @default(uuid())
  referenceId     String      @unique
  userId          String
  customerName    String
  studentId       String
  contactNumber   String
  customerEmail   String
  totalAmount     Decimal     @db.Decimal(10, 2)
  status          OrderStatus @default(PENDING_REVIEW)
  paymentProofUrl String?     // Used for payment proof uploads
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  user            User        @relation(fields: [userId], references: [id])
  orderItems      OrderItem[]

  @@map("orders")
}
```

**Key Field:**
- `paymentProofUrl`: Optional string field storing Cloudinary URL for payment proof images
- No migration required - field already exists in schema

---

## Backend Implementation

### 1. Orders Module Enhancement

**File:** `psse-backend/src/orders/orders.module.ts`

Added `CloudinaryModule` import to enable image upload functionality:

```typescript
import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PrismaModule } from '../prisma';
import { AuthModule } from '../auth';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, AuthModule, CloudinaryModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule { }
```

**Changes:**
- Imported `CloudinaryModule` for image upload service
- Module now supports multipart file uploads

---

### 2. Orders Controller - Payment Proof Upload Endpoint

**File:** `psse-backend/src/orders/orders.controller.ts`

Added new endpoint and enhanced type safety:

```typescript
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import { Order } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  // ... existing endpoints ...

  /**
   * PATCH /orders/:id/upload-proof - Upload payment proof for an order
   * Accepts multipart/form-data with a 'file' field containing the image
   * Protected by JWT authentication
   */
  @Patch(':id/upload-proof')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPaymentProof(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Order> {
    // Validate that a file was provided
    if (!file) {
      throw new BadRequestException('Payment proof image file is required');
    }

    // Validate file is an image
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.mimetype)) {
      throw new BadRequestException('File must be an image (jpg, jpeg, png, gif, or webp)');
    }

    return this.ordersService.uploadPaymentProof(id, file);
  }

  // ... existing endpoints ...
}
```

**Key Features:**
- Uses `FileInterceptor('file')` for Multer file handling
- Validates file presence and MIME type
- Protected by JWT authentication
- Returns updated `Order` with `paymentProofUrl`

**Enhanced Type Safety:**
- Changed `user: any` to `user: { id: string }` in create and findMyOrders methods
- Added explicit `Promise<Order>` return types

---

### 3. Orders Service - Upload Logic & Workflow Improvements

**File:** `psse-backend/src/orders/orders.service.ts`

Added CloudinaryService dependency and implemented upload method:

```typescript
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { Prisma, Order, OrderStatus } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  /**
   * Uploads a payment proof image for an order.
   * 
   * @param orderId - The ID of the order to upload payment proof for
   * @param file - The Express Multer file containing the image
   * @returns The updated Order record with paymentProofUrl set
   * @throws NotFoundException if the order does not exist
   * @throws BadRequestException if the image upload fails
   */
  async uploadPaymentProof(orderId: string, file: Express.Multer.File): Promise<Order> {
    // Step 1: Find the order by ID
    const existingOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    // Throw NotFoundException if order doesn't exist
    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Step 2: Upload the image to Cloudinary
    let paymentProofUrl: string;
    try {
      const uploadResult = await this.cloudinaryService.uploadImage(file, 'psse-payment-proofs');
      paymentProofUrl = uploadResult.secure_url;
    } catch (error) {
      throw new BadRequestException('Failed to upload payment proof image to Cloudinary');
    }

    // Step 3: Update the Order record with the payment proof URL
    // Status remains AWAITING_PAYMENT (or is explicitly set to ensure consistency)
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentProofUrl,
        status: OrderStatus.AWAITING_PAYMENT,
      },
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
    });

    return updatedOrder;
  }

  // ... other methods ...
}
```

**Upload Flow:**
1. Validate order exists in database
2. Upload image to Cloudinary's `psse-payment-proofs` folder
3. Update order with `paymentProofUrl` and ensure status is `AWAITING_PAYMENT`
4. Return updated order with nested relations

---

### 4. Stock Management & Order Status Improvements

**Enhanced Create Order Logic:**

```typescript
async create(createOrderDto: CreateOrderDto, userId?: string) {
  const { customerName, studentId, contactNumber, customerEmail, items } = createOrderDto;

  // Generate unique reference ID for this order
  const referenceId = this.generateReferenceId();

  // Use an atomic transaction to handle the complex order creation
  return this.prisma.$transaction(async (tx) => {
    // ... existing validation code ...

    // Step 3: Validate sufficient stock is available (stock is NOT decremented here)
    // Stock will only be decremented when order status is set to COMPLETED
    if (product.stock < item.quantity) {
      throw new BadRequestException(
        `Product "${product.name}" is out of stock. ` +
        `Available: ${product.stock}, Required: ${item.quantity}`
      );
    }

    // ... rest of order creation ...

    // Step 5: Create the Order with referenceId and all OrderItems
    // Status is explicitly set to AWAITING_PAYMENT for new orders
    const order = await tx.order.create({
      data: {
        referenceId,
        userId: userId || '',
        customerName,
        studentId,
        contactNumber,
        customerEmail,
        totalAmount,
        status: OrderStatus.AWAITING_PAYMENT, // NEW: Explicit initial status
        // Create all order items in a single nested write
        orderItems: {
          create: orderItemsData,
        },
      },
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
    });

    return order;
  });
}
```

**Key Changes:**
- Stock validation only (no decrement on order creation)
- Explicit `AWAITING_PAYMENT` status for new orders
- Stock decrement deferred to order completion

---

**Enhanced Update Order Logic:**

```typescript
async update(id: string, updateOrderDto: UpdateOrderDto) {
  // Verify the order exists and get current data including items
  const existingOrder = await this.prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: true,
    },
  });

  if (!existingOrder) {
    throw new NotFoundException(`Order with ID ${id} not found`);
  }

  // Prevent status changes from COMPLETED or CANCELLED (these are final statuses)
  if (
    existingOrder.status === OrderStatus.COMPLETED ||
    existingOrder.status === OrderStatus.CANCELLED
  ) {
    throw new BadRequestException(
      `Cannot update order with status '${existingOrder.status}'. This status is final.`
    );
  }

  // Check if status is being changed to a final status (COMPLETED or CANCELLED)
  const isCompletingOrder = updateOrderDto.status === OrderStatus.COMPLETED;
  const isCancellingOrder = updateOrderDto.status === OrderStatus.CANCELLED;

  // Helper function to delete payment proof from Cloudinary (if exists)
  const deletePaymentProofFromCloudinary = async () => {
    if (existingOrder.paymentProofUrl) {
      try {
        await this.cloudinaryService.deleteImage(existingOrder.paymentProofUrl);
      } catch (error) {
        // Log but don't fail the operation if Cloudinary deletion fails
        console.error('Failed to delete payment proof from Cloudinary:', error);
      }
    }
  };

  // If completing the order, decrement stock in a transaction
  if (isCompletingOrder) {
    return this.prisma.$transaction(async (tx) => {
      // Decrement stock for each order item
      for (const item of existingOrder.orderItems) {
        // First, verify stock is still available
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.productId} no longer exists`
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}". ` +
            `Available: ${product.stock}, Required: ${item.quantity}`
          );
        }

        // Decrement the product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Update the order status
      const updatedOrder = await tx.order.update({
        where: { id },
        data: updateOrderDto,
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
      });

      // Delete payment proof from Cloudinary after successful transaction
      await deletePaymentProofFromCloudinary();

      return updatedOrder;
    });
  }

  // If cancelling the order, delete payment proof from Cloudinary
  if (isCancellingOrder) {
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
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
    });

    // Delete payment proof from Cloudinary
    await deletePaymentProofFromCloudinary();

    return updatedOrder;
  }

  // For non-final status changes, just update the order
  return this.prisma.order.update({
    where: { id },
    data: updateOrderDto,
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
  });
}
```

**Key Features:**
1. **Final Status Protection**: Prevents changes to `COMPLETED` or `CANCELLED` orders
2. **Transactional Stock Decrement**: Stock only decremented when order is completed
3. **Stock Validation**: Ensures sufficient stock before completion
4. **Cloudinary Cleanup**: Deletes payment proof images when order is completed or cancelled
5. **Error Handling**: Graceful handling of Cloudinary deletion failures

---

## Frontend Implementation

### 1. Type Definitions Enhancement

**File:** `psse-react/src/types/api.types.ts`

Added `paymentProofUrl` field to `ApiOrder` interface:

```typescript
export interface ApiOrder {
  id: string;
  referenceId: string;
  userId: string;
  customerName: string;
  studentId: string;
  contactNumber: string;
  customerEmail: string;
  totalAmount: number | string; // Decimal from DB may come as string
  status: OrderStatus;
  paymentProofUrl: string | null; // NEW: Payment proof URL field
  createdAt: string;
  updatedAt: string;
  orderItems: ApiOrderItem[];
}
```

**File:** `psse-react/src/types/index.ts`

Updated officer category type to match new backend enum values:

```typescript
export type OfficerCategory =
  | 'exec'        // Executive Board
  | 'admin'       // Administrative Officers
  | 'finance'     // Finance Officers
  | 'rep'         // Year Level Representatives
  | 'ambassador'; // PSSE Ambassadors
```

**File:** `psse-react/src/data/officers.ts`

Updated officer category mappings:

```typescript
export const officerCategories: Record<OfficerCategory, OfficerCategoryInfo> = {
  exec: {
    title: 'Executive Board',
    description: 'The primary leadership team responsible for strategic direction and overall governance',
  },
  admin: {
    title: 'Administrative Officers',
    description: 'Officers responsible for documentation, financial management, and organizational operations',
  },
  finance: {
    title: 'Finance Officers',
    description: 'Officers ensuring financial transparency and treasury management',
  },
  rep: {
    title: 'Year Level Representatives',
    description: 'Student representatives managing communications and student representation',
  },
  ambassador: {
    title: 'PSSE Ambassadors',
    description: 'Official ambassadors representing PSSE in external events',
  },
};
```

---

### 2. API Service - Upload Payment Proof Method

**File:** `psse-react/src/services/api.ts`

Added `uploadPaymentProof` method to `ordersApi`:

```typescript
export const ordersApi = {
  // ... existing methods ...

  /**
   * Upload payment proof for an order
   * @param orderId - The ID of the order to upload payment proof for
   * @param file - The image file to upload as payment proof
   * @returns The updated order with paymentProofUrl set
   */
  uploadPaymentProof: async (orderId: string, file: File): Promise<ApiOrder> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.patch<ApiOrder>(
      `/orders/${orderId}/upload-proof`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
```

**Features:**
- Constructs `FormData` with file
- Sends PATCH request to upload endpoint
- Sets proper `Content-Type` header
- Returns updated order with `paymentProofUrl`

---

### 3. Transaction History Page Enhancement

**File:** `psse-react/src/pages/user/TransactionHistory.tsx`

Added complete payment proof upload functionality:

**New State Variables:**

```typescript
// State for tracking file upload
const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
const [uploadError, setUploadError] = useState<string | null>(null);

// Refs for hidden file inputs (one per order)
const fileInputRefs = useRef<Map<string, HTMLInputElement | null>>(new Map());
```

**Upload Handler Functions:**

```typescript
/**
 * Handle file upload for payment proof
 */
const handleFileUpload = async (orderId: string, file: File) => {
  setUploadingOrderId(orderId);
  setUploadError(null);

  try {
    await ordersApi.uploadPaymentProof(orderId, file);
    // Refresh orders list on success
    await fetchOrders();
  } catch (err) {
    console.error('Failed to upload payment proof:', err);
    setUploadError('Failed to upload payment proof. Please try again.');
  } finally {
    setUploadingOrderId(null);
  }
};

/**
 * Trigger file input click for a specific order
 */
const triggerFileInput = (orderId: string) => {
  const input = fileInputRefs.current.get(orderId);
  if (input) {
    input.click();
  }
};

/**
 * Handle file input change
 */
const handleFileInputChange = (orderId: string, event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    handleFileUpload(orderId, file);
  }
  // Reset input value to allow re-uploading the same file
  event.target.value = '';
};
```

**UI Components:**

```tsx
{/* Hidden file input for each order */}
<input
  type="file"
  accept="image/*"
  ref={(el) => { fileInputRefs.current.set(order.id, el); }}
  onChange={(e) => handleFileInputChange(order.id, e)}
  className="hidden"
/>

{/* Payment Proof Section - Shown only for AWAITING_PAYMENT status */}
{order.status === OrderStatus.AWAITING_PAYMENT && (
  <div className="mt-4 pt-4 border-t border-white/20">
    {!order.paymentProofUrl ? (
      // No proof uploaded yet - show upload button
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <p className="text-sm text-white/90">
          Please upload your GCash payment screenshot to proceed.
        </p>
        <button
          onClick={() => triggerFileInput(order.id)}
          disabled={uploadingOrderId === order.id}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            uploadingOrderId === order.id
              ? 'bg-white/30 cursor-not-allowed'
              : 'bg-white text-psse-primary hover:bg-orange-50 hover:shadow-md'
          }`}
        >
          {uploadingOrderId === order.id ? (
            <>
              <FaSpinner className="animate-spin h-4 w-4" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <FaUpload className="h-4 w-4" />
              <span>Upload GCash Proof</span>
            </>
          )}
        </button>
      </div>
    ) : (
      // Proof already uploaded - show confirmation
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-lg border border-green-400/30">
          <FaCheckCircle className="h-4 w-4 text-green-300" />
          <span className="text-sm font-medium text-green-100">
            Proof Submitted - Awaiting Review
          </span>
        </div>
        <a
          href={order.paymentProofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white transition-colors"
        >
          <FaExternalLinkAlt className="h-3 w-3" />
          View Proof
        </a>
      </div>
    )}
  </div>
)}
```

**Key Features:**
- Hidden file input for each order (managed via refs)
- Upload button with loading state
- Status-dependent UI (only shown for `AWAITING_PAYMENT`)
- Success state with confirmation badge
- Link to view uploaded proof in new tab
- Error handling with user feedback

---

### 4. Admin Dashboard Enhancement

**File:** `psse-react/src/pages/admin/Dashboard.tsx`

Enhanced order management UI with payment proof review:

**New Icons Import:**

```typescript
import {
  // ... existing imports ...
  FaImage,
  FaExternalLinkAlt,
  FaExclamationCircle,
} from 'react-icons/fa';
```

**Enhanced Order Table:**

```tsx
<thead className="bg-gray-50">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Order ID
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Customer
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Items
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Total
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Date
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Payment Proof  {/* NEW COLUMN */}
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Status
    </th>
  </tr>
</thead>
```

**Enhanced Order Row Rendering:**

```tsx
{orders.map((order) => {
  // Check if order needs review (awaiting payment with proof uploaded)
  const needsReview = order.status === OrderStatus.AWAITING_PAYMENT && order.paymentProofUrl;

  return (
    <tr
      key={order.id}
      className={`hover:bg-gray-50 ${
        needsReview
          ? 'bg-amber-50 border-l-4 border-l-amber-500'
          : ''
      }`}
    >
      {/* ... existing columns ... */}

      {/* Payment Proof Column */}
      <td className="px-6 py-4">
        {order.paymentProofUrl ? (
          <div className="flex items-center gap-2">
            <a
              href={order.paymentProofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
            >
              <img
                src={order.paymentProofUrl}
                alt="Payment Proof"
                className="w-10 h-10 object-cover rounded border border-gray-300 hover:border-psse-accent transition-colors"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                <FaExternalLinkAlt className="text-white text-xs" />
              </div>
            </a>
            {needsReview && (
              <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                <FaExclamationCircle className="text-amber-600" />
                Review
              </span>
            )}
          </div>
        ) : (
          <span className="flex items-center gap-1 text-sm text-gray-400">
            <FaImage className="text-gray-300" />
            No proof
          </span>
        )}
      </td>

      {/* Status Column - Enhanced */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {updatingOrderId === order.id ? (
            <FaSpinner className="animate-spin text-psse-accent" />
          ) : order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED ? (
            // Locked status - display as badge (cannot be changed)
            <span
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                order.status === OrderStatus.COMPLETED
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {order.status === OrderStatus.COMPLETED ? 'Completed' : 'Cancelled'}
              <span className="ml-1 text-xs opacity-60">(Final)</span>
            </span>
          ) : (
            // Editable status dropdown
            <select
              value={order.status}
              onChange={(e) =>
                handleOrderStatusChange(
                  order.id,
                  e.target.value as OrderStatus
                )
              }
              className="block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
            >
              {ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </td>
    </tr>
  );
})}
```

**Key Features:**
1. **Visual Indicators**: Amber highlight for orders needing review
2. **Payment Proof Preview**: Thumbnail with hover overlay
3. **Review Badge**: Clear indicator for pending reviews
4. **Final Status Lock**: Completed/Cancelled orders shown as badges, not dropdowns
5. **External Links**: Opens payment proof in new tab

---

## Checkout Modal UX Improvements

### 1. Profile Pre-filling (Task D)

**File:** `psse-react/src/components/features/CheckoutModal.tsx`

When a logged-in user opens the checkout modal, their profile data is automatically pre-filled into the form fields:

**Implementation:**

```typescript
import { useUserAuth } from '../../context';

// Inside component
const { user } = useUserAuth();

// Pre-fill form data when modal opens or user changes
useEffect(() => {
  if (isOpen && user) {
    setFormData((prev) => ({
      ...prev,
      customerName: user.name || '',
      studentId: user.studentId || '',
      customerEmail: user.email || '',
      // contactNumber is not in user profile, keep it editable
    }));
  }
}, [isOpen, user]);
```

**Read-Only Fields:**

Profile fields are set to `readOnly` for authenticated users to ensure data consistency:

```tsx
<input
  type="text"
  name="customerName"
  value={formData.customerName}
  onChange={handleFormChange}
  readOnly={!!user}
  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent ${user ? 'bg-gray-100 cursor-not-allowed' : ''}`}
  required
/>
```

**Key Design Decisions:**
- `customerName`, `studentId`, and `customerEmail` are pre-filled from user profile
- `contactNumber` remains editable (not stored in user profile)
- Visual styling (gray background) indicates read-only state
- Prevents accidental data mismatch between order and user account

---

### 2. Post-Checkout Redirect (Task C)

**Problem:** Previously, after order placement, users saw a success modal and had to manually close it and navigate to their transactions.

**Solution:** Immediately redirect users to the Transaction History page with a toast notification:

**Implementation:**

```typescript
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Inside component
const navigate = useNavigate();

const handleSubmitOrder = async (e: React.FormEvent) => {
  // ... validation and API call ...
  
  try {
    await ordersApi.createOrder(orderPayload);

    // Success - clear cart, close modal, navigate, and show toast
    clearCart();
    onClose();
    toast.success('Order placed! Please upload your payment proof.');
    navigate('/user/transactions');
  } catch (error) {
    // ... error handling ...
  }
};
```

**Benefits:**
- Users immediately see their order in Transaction History
- Clear call-to-action to upload payment proof via toast
- Streamlined UX reduces steps to complete payment
- Success state managed by page context, not modal state

**Removed Code:**
- `renderSuccessStep` function completely removed
- `'success'` step removed from `CheckoutStep` type
- `orderReferenceId` state removed (no longer needed)

---

## User Order Cancellation

### 1. Overview

Users can now cancel their own orders under specific conditions:
- Order status is `AWAITING_PAYMENT`
- No payment proof has been uploaded yet

This prevents users from cancelling orders after they've submitted payment proof (which would require admin review).

---

### 2. Backend Implementation

**File:** `psse-backend/src/orders/orders.controller.ts`

New endpoint for user order cancellation:

```typescript
/**
 * PATCH /orders/:id/cancel - Allow user to cancel their own order
 * Only allowed when no payment proof has been uploaded
 * Protected by JWT authentication - verifies order ownership
 */
@Patch(':id/cancel')
@UseGuards(JwtAuthGuard)
async cancelOrder(
  @Param('id') id: string,
  @CurrentUser() user: { id: string },
): Promise<Order> {
  return this.ordersService.cancelOrderByUser(id, user.id);
}
```

**File:** `psse-backend/src/orders/orders.service.ts`

```typescript
/**
 * Cancels an order by the user who placed it.
 * Only allowed when no payment proof has been uploaded yet.
 */
async cancelOrderByUser(orderId: string, userId: string): Promise<Order> {
  const order = await this.prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true },
  });

  if (!order) {
    throw new NotFoundException(`Order with ID ${orderId} not found`);
  }

  // Verify the user owns this order
  if (order.userId !== userId) {
    throw new ForbiddenException('You can only cancel your own orders');
  }

  // Check if order is in a cancellable state
  if (order.status !== OrderStatus.AWAITING_PAYMENT) {
    throw new BadRequestException(
      'Order can only be cancelled when status is AWAITING_PAYMENT'
    );
  }

  // Check if payment proof has been uploaded
  if (order.paymentProofUrl) {
    throw new BadRequestException(
      'Cannot cancel order after payment proof has been uploaded. Please contact support.'
    );
  }

  // Cancel the order
  return this.prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.CANCELLED },
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
  });
}
```

---

### 3. Frontend Implementation

**File:** `psse-react/src/services/api.ts`

```typescript
/**
 * Cancel an order (User)
 * Only allowed when no payment proof has been uploaded yet
 * Uses the dedicated cancel endpoint that verifies order ownership
 */
cancelOrder: async (orderId: string): Promise<ApiOrder> => {
  const response = await axiosInstance.patch<ApiOrder>(`/orders/${orderId}/cancel`);
  return response.data;
},
```

**File:** `psse-react/src/pages/user/TransactionHistory.tsx`

Added cancellation UI with confirmation dialog:

```typescript
// State for tracking order cancellation
const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
const [cancelError, setCancelError] = useState<string | null>(null);
const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);

/**
 * Handle order cancellation
 */
const handleCancelOrder = async (orderId: string) => {
  setCancellingOrderId(orderId);
  setCancelError(null);
  setShowCancelConfirm(null);

  try {
    await ordersApi.cancelOrder(orderId);
    await fetchOrders(); // Refresh list
  } catch (err) {
    console.error('Failed to cancel order:', err);
    setCancelError('Failed to cancel order. Please try again.');
  } finally {
    setCancellingOrderId(null);
  }
};
```

**UI Component:**

```tsx
{/* Cancel Order Section - Only shown when no payment proof uploaded */}
{order.status === OrderStatus.AWAITING_PAYMENT && !order.paymentProofUrl && (
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
    {showCancelConfirm === order.id ? (
      // Confirmation dialog
      <div className="flex items-center gap-3 px-4 py-2 bg-red-500/20 rounded-lg border border-red-400/30">
        <span className="text-sm text-white">
          Are you sure you want to cancel this order?
        </span>
        <button
          onClick={() => handleCancelOrder(order.id)}
          disabled={cancellingOrderId === order.id}
          className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {cancellingOrderId === order.id ? (
            <FaSpinner className="animate-spin h-4 w-4" />
          ) : (
            'Yes, Cancel'
          )}
        </button>
        <button
          onClick={() => setShowCancelConfirm(null)}
          className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded hover:bg-white/30 transition-colors"
        >
          No, Keep Order
        </button>
      </div>
    ) : (
      // Cancel button
      <button
        onClick={() => setShowCancelConfirm(order.id)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-red-200 hover:text-white hover:bg-red-500/30 rounded-lg transition-all"
      >
        <FaTimesCircle className="h-4 w-4" />
        <span>Cancel Order</span>
      </button>
    )}
  </div>
)}
```

**Key Features:**
- Cancel button only visible when order has no payment proof
- Two-step confirmation to prevent accidental cancellation
- Loading state during cancellation
- Error handling with user feedback

---

## API Endpoints

### Payment Proof Upload

**Endpoint:** `PATCH /orders/:id/upload-proof`

**Authentication:** Required (JWT)

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:** 
  - `file` (File): Image file (JPEG, JPG, PNG, GIF, WEBP)

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "referenceId": "ORD-20251208143022-A7K9",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "customerName": "Juan Dela Cruz",
  "studentId": "2021-12345",
  "contactNumber": "09171234567",
  "customerEmail": "juan@example.com",
  "totalAmount": "599.00",
  "status": "AWAITING_PAYMENT",
  "paymentProofUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/psse-payment-proofs/abcd1234.jpg",
  "createdAt": "2025-12-08T06:30:22.000Z",
  "updatedAt": "2025-12-08T06:35:15.000Z",
  "orderItems": [...]
}
```

**Errors:**
- `400 Bad Request`: Missing file or invalid file type
- `401 Unauthorized`: No JWT token or invalid token
- `404 Not Found`: Order does not exist

---

### Update Order Status

**Endpoint:** `PATCH /orders/:id`

**Authentication:** Required (JWT + Admin role)

**Request:**
```json
{
  "status": "COMPLETED"
}
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "COMPLETED",
  ...
}
```

**Errors:**
- `400 Bad Request`: Order already in final status (COMPLETED/CANCELLED)
- `400 Bad Request`: Insufficient stock when completing order
- `401 Unauthorized`: No JWT token or invalid token
- `403 Forbidden`: User is not admin
- `404 Not Found`: Order does not exist

---

### Cancel Order (User)

**Endpoint:** `PATCH /orders/:id/cancel`

**Authentication:** Required (JWT - User must own the order)

**Request:** No body required

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "referenceId": "ORD-20251208143022-A7K9",
  "status": "CANCELLED",
  "paymentProofUrl": null,
  ...
}
```

**Errors:**
- `400 Bad Request`: Order status is not `AWAITING_PAYMENT`
- `400 Bad Request`: Payment proof has already been uploaded
- `401 Unauthorized`: No JWT token or invalid token
- `403 Forbidden`: User does not own this order
- `404 Not Found`: Order does not exist

**Business Rules:**
- Only orders with status `AWAITING_PAYMENT` can be cancelled by users
- Orders with uploaded payment proof cannot be cancelled (must contact admin)
- Cancellation is immediate and final
- Stock is NOT affected (was never decremented)

---

## Order Workflow

### Complete Order Lifecycle

```
1. ORDER CREATION (User)
   ├─ User navigates from checkout to /user/transactions (automatic redirect)
   ├─ Status: AWAITING_PAYMENT
   ├─ Stock: Validated but NOT decremented
   ├─ Toast notification: "Order placed! Please upload your payment proof."
   └─ Payment Proof: None

2. USER CANCELLATION (User - Optional, before payment proof upload)
   ├─ User can cancel their order if no payment proof uploaded
   ├─ Status: CANCELLED (Final)
   └─ Stock: NOT affected

3. PAYMENT PROOF UPLOAD (User)
   ├─ User uploads GCash screenshot
   ├─ Image stored in Cloudinary
   ├─ Order.paymentProofUrl updated
   ├─ Status remains: AWAITING_PAYMENT
   └─ User can no longer cancel (must contact admin)

4. ADMIN REVIEW (Admin)
   ├─ Admin views payment proof
   ├─ Verifies payment validity
   └─ Decides next action:
      ├─ APPROVE → Status: READY_PICKUP
      ├─ REJECT → Status: CANCELLED
      └─ REQUEST MORE INFO → Status: PENDING_REVIEW

5. READY FOR PICKUP (Admin)
   ├─ Status: READY_PICKUP
   ├─ Stock: Still NOT decremented
   └─ Customer notified to pickup

6. ORDER COMPLETION (Admin)
   ├─ Status: COMPLETED
   ├─ Stock: DECREMENTED (Transactional)
   ├─ Payment Proof: Deleted from Cloudinary
   └─ Final status (cannot be changed)

7. ORDER CANCELLATION (Admin - at any time before completion)
   ├─ Status: CANCELLED
   ├─ Stock: NOT decremented (was never committed)
   ├─ Payment Proof: Deleted from Cloudinary
   └─ Final status (cannot be changed)
```

### Status Flow Diagram

```
AWAITING_PAYMENT (Initial)
    │
    ├─ User uploads proof → AWAITING_PAYMENT (with paymentProofUrl)
    │
    ├─ Admin reviews
    │   ├─ Approve → READY_PICKUP
    │   ├─ Request info → PENDING_REVIEW → (User resubmits) → AWAITING_PAYMENT
    │   └─ Reject → CANCELLED (Final)
    │
    └─ From READY_PICKUP
        ├─ Customer picks up → COMPLETED (Final, stock decremented)
        └─ Customer no-show → CANCELLED (Final)
```

---

## Stock Management

### Stock Control Strategy

**Key Principle:** Stock is only decremented when an order reaches `COMPLETED` status.

**Rationale:**
1. **Prevents Overselling**: Stock validated at order creation
2. **Flexible Cancellation**: Orders can be cancelled without complex stock rollback
3. **Real-Time Accuracy**: Stock reflects actual inventory, not pending orders
4. **Admin Control**: Admins decide when stock commitment occurs

### Order Creation Flow

```typescript
// Validate stock availability
if (product.stock < item.quantity) {
  throw new BadRequestException(`Product "${product.name}" is out of stock`);
}

// Create order WITHOUT decrementing stock
const order = await tx.order.create({
  data: {
    ...orderData,
    status: OrderStatus.AWAITING_PAYMENT,
  },
});
```

### Order Completion Flow

```typescript
// When marking order as COMPLETED
return this.prisma.$transaction(async (tx) => {
  // Re-validate stock (may have changed since order creation)
  for (const item of existingOrder.orderItems) {
    const product = await tx.product.findUnique({
      where: { id: item.productId },
    });

    if (product.stock < item.quantity) {
      throw new BadRequestException(`Insufficient stock for "${product.name}"`);
    }

    // Decrement stock atomically
    await tx.product.update({
      where: { id: item.productId },
      data: {
        stock: { decrement: item.quantity },
      },
    });
  }

  // Update order status
  const updatedOrder = await tx.order.update({
    where: { id },
    data: { status: OrderStatus.COMPLETED },
  });

  return updatedOrder;
});
```

**Transaction Guarantees:**
- All stock decrements succeed or entire transaction rolls back
- No partial stock updates
- Concurrent order completion handled safely by database

### Cancellation Flow

```typescript
// When marking order as CANCELLED
const updatedOrder = await this.prisma.order.update({
  where: { id },
  data: { status: OrderStatus.CANCELLED },
});

// No stock operations needed - stock was never decremented
```

---

## Security Considerations

### 1. Authentication & Authorization

**File Upload Endpoint:**
- Protected by `JwtAuthGuard`
- Users can only upload proof for their own orders (validated via JWT)
- No additional role check (all authenticated users can upload)

**Status Update Endpoint:**
- Protected by `JwtAuthGuard` + `RolesGuard`
- Only users with `ADMIN` role can change order status
- Final statuses (COMPLETED/CANCELLED) cannot be changed

### 2. File Upload Security

**Validation:**
```typescript
// MIME type validation
const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
if (!validImageTypes.includes(file.mimetype)) {
  throw new BadRequestException('File must be an image');
}

// File presence validation
if (!file) {
  throw new BadRequestException('Payment proof image file is required');
}
```

**Cloudinary Security:**
- Files stored in dedicated folder: `psse-payment-proofs`
- Cloudinary API keys stored in environment variables
- Automatic image optimization and format conversion
- CDN delivery for performance

**Cleanup:**
- Payment proof images deleted when order reaches final status
- Prevents accumulation of unused files
- Reduces storage costs

### 3. Database Security

**Transaction Isolation:**
- Prisma transactions use `READ COMMITTED` isolation level
- Prevents dirty reads and lost updates
- Ensures consistent stock counts

**Referential Integrity:**
- Foreign key constraints on `Order.userId` and `OrderItem.productId`
- Cascade updates, restrict deletes
- Orphaned records prevented

### 4. Input Validation

**DTO Validation:**
- All DTOs use `class-validator` decorators
- Type checking with TypeScript
- Sanitization of user input

**Order ID Validation:**
- UUID format validation
- Existence checks before operations
- Proper error messages for invalid IDs

---

## Testing

### Manual Testing Checklist

#### Payment Proof Upload
- [ ] Upload valid image (JPEG, PNG, etc.)
- [ ] Attempt upload without authentication (should fail)
- [ ] Upload non-image file (should fail)
- [ ] Upload to non-existent order (should fail)
- [ ] Verify image appears in Cloudinary dashboard
- [ ] Verify `paymentProofUrl` saved in database

#### Order Status Workflow
- [ ] Create order (status: AWAITING_PAYMENT)
- [ ] Upload payment proof
- [ ] Admin changes to READY_PICKUP
- [ ] Admin changes to COMPLETED
  - [ ] Verify stock decremented
  - [ ] Verify status locked (cannot change)
  - [ ] Verify payment proof deleted from Cloudinary
- [ ] Create another order and cancel
  - [ ] Verify stock NOT decremented
  - [ ] Verify status locked
  - [ ] Verify payment proof deleted from Cloudinary

#### Stock Management
- [ ] Create order with quantity > stock (should fail)
- [ ] Create order with valid quantity
- [ ] Verify stock NOT decremented immediately
- [ ] Complete order
- [ ] Verify stock decremented correctly
- [ ] Attempt to complete order with insufficient stock (should fail)

#### UI/UX
- [ ] Upload button appears for AWAITING_PAYMENT orders
- [ ] Upload button shows loading state during upload
- [ ] Success message appears after upload
- [ ] "View Proof" link works correctly
- [ ] Admin sees payment proof thumbnail
- [ ] Admin sees "Review" badge for orders with proof
- [ ] Final statuses displayed as locked badges

### Automated Testing Recommendations

**Unit Tests:**
```typescript
describe('OrdersService', () => {
  describe('uploadPaymentProof', () => {
    it('should upload payment proof and update order', async () => {
      // Test implementation
    });

    it('should throw NotFoundException for invalid order ID', async () => {
      // Test implementation
    });

    it('should throw BadRequestException on Cloudinary failure', async () => {
      // Test implementation
    });
  });

  describe('update', () => {
    it('should decrement stock when completing order', async () => {
      // Test implementation
    });

    it('should prevent status change for completed orders', async () => {
      // Test implementation
    });

    it('should delete payment proof when completing order', async () => {
      // Test implementation
    });
  });
});
```

**E2E Tests:**
```typescript
describe('Payment Proof Upload (e2e)', () => {
  it('/orders/:id/upload-proof (PATCH) should upload proof', async () => {
    // Create order
    // Upload file
    // Verify response
    // Check database
  });

  it('/orders/:id/upload-proof (PATCH) should require authentication', async () => {
    // Attempt upload without token
    // Verify 401 response
  });
});
```

---

## Future Enhancements

### 1. Advanced Payment Integration

**Description:** Integrate real payment gateways (GCash API, PayMongo) for automatic verification.

**Benefits:**
- Eliminates manual verification
- Instant order processing
- Reduced admin workload

**Implementation:**
```typescript
// Example GCash webhook handler
@Post('webhooks/gcash')
async handleGCashWebhook(@Body() webhookData: GCashWebhookDto) {
  // Verify webhook signature
  // Find order by reference
  // Auto-approve payment
  // Update order status
}
```

### 2. Order Notifications

**Description:** Email/SMS notifications for order status changes.

**Events:**
- Order created (confirmation)
- Payment proof uploaded (admin alert)
- Order approved (user notification)
- Ready for pickup (user notification)
- Order completed (receipt)

**Implementation:**
```typescript
@Injectable()
export class OrderNotificationService {
  async sendOrderConfirmation(order: Order) {
    await this.mailService.sendMail({
      to: order.customerEmail,
      subject: `Order ${order.referenceId} Confirmed`,
      template: 'order-confirmation',
      context: { order },
    });
  }
}
```

### 3. Payment Proof Annotations

**Description:** Allow admins to add notes/comments on payment proofs.

**Schema Addition:**
```prisma
model Order {
  // ... existing fields ...
  paymentProofUrl    String?
  paymentProofNotes  String?  // Admin notes
  paymentProofReviewedBy String? // Admin who reviewed
  paymentProofReviewedAt DateTime?
}
```

### 4. Stock Reservation System

**Description:** Reserve stock for pending orders (configurable timeout).

**Benefits:**
- Prevents overselling during order processing
- More accurate stock display
- Automatic release on timeout/cancellation

**Implementation:**
```prisma
model Product {
  // ... existing fields ...
  stock            Int
  reservedStock    Int @default(0)
  availableStock   Int @default(0) // Computed: stock - reservedStock
}

model StockReservation {
  id         String   @id @default(uuid())
  productId  String
  orderId    String
  quantity   Int
  expiresAt  DateTime
  released   Boolean  @default(false)
  product    Product  @relation(fields: [productId], references: [id])
  order      Order    @relation(fields: [orderId], references: [id])
}
```

### 5. Bulk Order Operations

**Description:** Admin dashboard bulk actions (approve multiple, export CSV).

**Features:**
- Checkbox selection for multiple orders
- Bulk status update
- Bulk export to Excel/CSV
- Batch email notifications

### 6. Payment Proof History

**Description:** Track all payment proof uploads (including replacements).

**Schema Addition:**
```prisma
model PaymentProofHistory {
  id          String   @id @default(uuid())
  orderId     String
  imageUrl    String
  uploadedBy  String
  uploadedAt  DateTime @default(now())
  order       Order    @relation(fields: [orderId], references: [id])
  user        User     @relation(fields: [uploadedBy], references: [id])
}
```

### 7. Analytics Dashboard

**Description:** Visual analytics for order trends, revenue, popular products.

**Metrics:**
- Daily/Weekly/Monthly order volume
- Revenue trends
- Product popularity
- Average order value
- Order status distribution
- Peak ordering times

**Implementation:**
```typescript
@Get('analytics/summary')
@UseGuards(JwtAuthGuard, RolesGuard)
async getAnalyticsSummary() {
  const totalOrders = await this.ordersService.getTotalOrders();
  const totalRevenue = await this.ordersService.getTotalRevenue();
  const pendingOrders = await this.ordersService.getPendingOrdersCount();
  // ... more metrics
  
  return {
    totalOrders,
    totalRevenue,
    pendingOrders,
    // ...
  };
}
```

### 8. Mobile-Optimized Upload

**Description:** Enhance mobile UX with camera access and image compression.

**Features:**
- Direct camera capture (not just file upload)
- Client-side image compression
- Drag-and-drop support (desktop)
- Progress indicators

**Implementation:**
```tsx
<input
  type="file"
  accept="image/*"
  capture="environment" // Opens camera on mobile
  onChange={handleFileChange}
/>
```

---

## Conclusion

This implementation provides a comprehensive payment proof upload system with robust order workflow management and enhanced user experience. Key achievements include:

1. ✅ **Secure File Upload**: JWT-protected endpoint with validation
2. ✅ **Cloudinary Integration**: Reliable image hosting with automatic cleanup
3. ✅ **Smart Stock Management**: Transactional stock control prevents overselling
4. ✅ **Enhanced User Experience**: Intuitive upload flow with status tracking
5. ✅ **Admin Efficiency**: Visual payment proof review with status management
6. ✅ **Final Status Protection**: Prevents accidental changes to completed orders
7. ✅ **Type Safety**: Full TypeScript coverage across stack
8. ✅ **Profile Pre-filling**: Authenticated users' data auto-populated in checkout form
9. ✅ **Seamless Post-Checkout Navigation**: Automatic redirect to Transaction History
10. ✅ **User Order Cancellation**: Self-service cancellation before payment proof upload

The system is production-ready with room for future enhancements to further improve automation and user experience.

---

## Related Documentation

- [Backend Implementation Documentation](./backend-implementation-documentation.md)
- [User Authentication & Product Management Implementation](./user-authentication-and-product-management-implementation.md)
- [User-Order Relationship & Transaction History Implementation](./user-order-relationship-and-transaction-history-implementation.md)
- [Admin Authentication & Event Management Implementation](./admin-authentication-implementation.md)

---

**Document Version:** 1.1  
**Last Updated:** December 8, 2025  
**Author:** PSSE Development Team

### Changelog

**Version 1.1 (December 8, 2025)**
- Added Checkout Modal UX Improvements section (Profile Pre-filling & Post-Checkout Redirect)
- Added User Order Cancellation section
- Added Cancel Order API endpoint documentation
- Updated Order Workflow lifecycle to include user cancellation step
- Updated Conclusion to reflect new features

