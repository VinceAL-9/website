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
  PENDING = 'PENDING',
  PAID = 'PAID',
  READY_PICKUP = 'READY_PICKUP',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// User interface (for auth responses)
export interface ApiUser {
  id: string;
  email: string;
  role: Role;
  studentId: string | null;
  createdAt: string;
}

// Officer interfaces
export interface ApiOfficer {
  id: string;
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

export type UpdateOfficerDto = Partial<CreateOfficerDto>;

// Event interfaces
export interface ApiEvent {
  id: string;
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

export type UpdateEventDto = Partial<CreateEventDto>;

// Product interfaces
export interface ApiProduct {
  id: string;
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

export type UpdateProductDto = Partial<CreateProductDto>;

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
  paymentProofUrl: string | null;
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

export interface StockCheckItem {
  productId: string;
  name: string | null;
  requestedQuantity: number;
  currentStock: number;
  available: boolean;
}

export interface StockCheckResponse {
  items: StockCheckItem[];
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
