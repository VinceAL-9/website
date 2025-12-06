/**
 * API Types - Matching backend DTOs and Prisma schema
 * These types represent the data structures returned from the NestJS backend
 */

// Enums matching Prisma schema
export enum Role {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
}

export enum Category {
  LANYARD = 'LANYARD',
  TSHIRT = 'TSHIRT',
  STICKER = 'STICKER',
}

export enum OrderStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  READY_PICKUP = 'READY_PICKUP',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// User interface (for auth responses)
export interface ApiUser {
  id: number;
  email: string;
  role: Role;
  studentId: string | null;
  createdAt: string;
}

// Officer interfaces
export interface ApiOfficer {
  id: number;
  name: string;
  position: string;
  category: string;
  photoUrl: string;
  academicYear: string;
  order: number;
}

export interface CreateOfficerDto {
  name: string;
  position: string;
  category: string;
  photoUrl: string;
  academicYear: string;
  order?: number;
}

export interface UpdateOfficerDto extends Partial<CreateOfficerDto> { }

// Event interfaces
export interface ApiEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  location: string;
  isUpcoming: boolean;
}

export interface CreateEventDto {
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  location: string;
  isUpcoming?: boolean;
}

export interface UpdateEventDto extends Partial<CreateEventDto> { }

// Product interfaces
export interface ApiProduct {
  id: number;
  name: string;
  description: string;
  price: number | string; // Decimal from DB may come as string
  stock: number;
  category: Category;
  imageUrl: string;
  isFeatured: boolean;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: Category;
  imageUrl: string;
  isFeatured?: boolean;
}

export interface UpdateProductDto extends Partial<CreateProductDto> { }

// Order interfaces
export interface ApiOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtTime: number | string; // Decimal from DB may come as string
  product: {
    id: string;
    name: string;
    category: Category;
    imageUrl: string;
  };
}

export interface ApiOrder {
  id: string;
  referenceId: string;
  customerName: string;
  studentId: string;
  contactNumber: string;
  customerEmail: string;
  totalAmount: number | string; // Decimal from DB may come as string
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  orderItems: ApiOrderItem[];
}

export interface OrderItemDto {
  productId: string;
  quantity: number;
}

export interface CreateOrderDto {
  customerName: string;
  studentId: string;
  contactNumber: string;
  customerEmail: string;
  items: OrderItemDto[];
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// Auth types
export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
}
