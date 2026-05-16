// Re-export API types
export * from './api.types';

// Officer Types
export interface Officer {
  id: string;
  name?: string;
  title: string;
  image: string;
  category: OfficerCategory;
}

export type OfficerCategory =
  | 'exec'
  | 'admin'
  | 'finance'
  | 'rep'
  | 'ambassador';

export interface OfficerCategoryInfo {
  title: string;
  description: string;
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  badge: EventBadge;
  stats: string;
  isUpcoming?: boolean;
}

export interface EventBadge {
  text: string;
  variant: BadgeVariant;
}

export type BadgeVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'info'
  | 'secondary'
  | 'danger';

// Product/Merchandise Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: ProductCategory;
  stock: number;
  addedDate: string;
  featured: boolean;
  specifications: string[];
}

export type ProductCategory = 'lanyard' | 'tshirt';

// Order Types
export interface Order {
  id: string;
  itemId: string;
  quantity: number;
  customerName: string;
  studentId: string;
  contactNumber: string;
  customerEmail: string;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  paymentReference: string | null;
  createdAt: string;
  updatedAt: string;
  estimatedPickup: string;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'ready_pickup'
  | 'completed'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

// Order Form Data
export interface OrderFormData {
  itemId: string;
  quantity: number;
  customerName: string;
  studentId: string;
  contactNumber: string;
  customerEmail: string;
}

// Core Activity Types
export interface CoreActivity {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// Student Life Types
export interface StudentLifeItem {
  id: string;
  title: string;
  icon: string;
}

// Tech Stack Types
export interface TechItem {
  name: string;
}
