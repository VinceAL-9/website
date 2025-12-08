import axiosInstance from '../lib/axios';
import type {
  ApiEvent,
  ApiOfficer,
  ApiProduct,
  ApiOrder,
  CreateOrderDto,
  CreateEventDto,
  UpdateEventDto,
  AuthResponse,
} from '../types';
import { OrderStatus } from '../types/api.types';

/**
 * Events API
 */
export const eventsApi = {
  /**
   * Get all events
   */
  getEvents: async (): Promise<ApiEvent[]> => {
    const response = await axiosInstance.get<ApiEvent[]>('/events');
    return response.data;
  },

  /**
   * Get a single event by ID
   */
  getEvent: async (id: number): Promise<ApiEvent> => {
    const response = await axiosInstance.get<ApiEvent>(`/events/${id}`);
    return response.data;
  },

  /**
   * Get upcoming events
   */
  getUpcomingEvents: async (): Promise<ApiEvent[]> => {
    const response = await axiosInstance.get<ApiEvent[]>('/events', {
      params: { isUpcoming: true },
    });
    return response.data;
  },

  /**
   * Get past events
   */
  getPastEvents: async (): Promise<ApiEvent[]> => {
    const response = await axiosInstance.get<ApiEvent[]>('/events', {
      params: { isUpcoming: false },
    });
    return response.data;
  },

  /**
   * Create a new event (Admin)
   * Accepts FormData for file upload
   */
  createEvent: async (eventData: CreateEventDto | FormData): Promise<ApiEvent> => {
    const response = await axiosInstance.post<ApiEvent>('/events', eventData, {
      headers: eventData instanceof FormData ? {
        'Content-Type': 'multipart/form-data',
      } : undefined,
    });
    return response.data;
  },

  /**
   * Update an event (Admin)
   * Accepts FormData for file upload
   */
  updateEvent: async (id: number, eventData: UpdateEventDto | FormData): Promise<ApiEvent> => {
    const response = await axiosInstance.patch<ApiEvent>(`/events/${id}`, eventData, {
      headers: eventData instanceof FormData ? {
        'Content-Type': 'multipart/form-data',
      } : undefined,
    });
    return response.data;
  },

  /**
   * Delete an event (Admin)
   */
  deleteEvent: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/events/${id}`);
  },
};

/**
 * Officers API
 */
export const officersApi = {
  /**
   * Get all officers
   */
  getOfficers: async (): Promise<ApiOfficer[]> => {
    const response = await axiosInstance.get<ApiOfficer[]>('/officers');
    return response.data;
  },

  /**
   * Get a single officer by ID
   */
  getOfficer: async (id: number): Promise<ApiOfficer> => {
    const response = await axiosInstance.get<ApiOfficer>(`/officers/${id}`);
    return response.data;
  },

  /**
   * Get officers by category
   */
  getOfficersByCategory: async (category: string): Promise<ApiOfficer[]> => {
    const response = await axiosInstance.get<ApiOfficer[]>('/officers', {
      params: { category },
    });
    return response.data;
  },

  /**
   * Get officers by academic year
   */
  getOfficersByYear: async (academicYear: string): Promise<ApiOfficer[]> => {
    const response = await axiosInstance.get<ApiOfficer[]>('/officers', {
      params: { academicYear },
    });
    return response.data;
  },

  /**
   * Create a new officer (Admin)
   * Accepts FormData for file upload
   */
  createOfficer: async (officerData: FormData): Promise<ApiOfficer> => {
    const response = await axiosInstance.post<ApiOfficer>('/officers', officerData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update an officer (Admin)
   * Accepts FormData for file upload
   */
  updateOfficer: async (id: number, officerData: FormData): Promise<ApiOfficer> => {
    const response = await axiosInstance.patch<ApiOfficer>(`/officers/${id}`, officerData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete an officer (Admin)
   */
  deleteOfficer: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/officers/${id}`);
  },
};

/**
 * Products API
 */
export const productsApi = {
  /**
   * Get all products
   */
  getProducts: async (): Promise<ApiProduct[]> => {
    const response = await axiosInstance.get<ApiProduct[]>('/products');
    return response.data;
  },

  /**
   * Get a single product by ID
   */
  getProduct: async (id: number): Promise<ApiProduct> => {
    const response = await axiosInstance.get<ApiProduct>(`/products/${id}`);
    return response.data;
  },

  /**
   * Get featured products
   */
  getFeaturedProducts: async (): Promise<ApiProduct[]> => {
    const response = await axiosInstance.get<ApiProduct[]>('/products', {
      params: { isFeatured: true },
    });
    return response.data;
  },

  /**
   * Get products by category
   */
  getProductsByCategory: async (category: string): Promise<ApiProduct[]> => {
    const response = await axiosInstance.get<ApiProduct[]>('/products', {
      params: { category },
    });
    return response.data;
  },

  /**
   * Create a new product (Admin)
   * Accepts FormData for file upload
   */
  createProduct: async (data: FormData): Promise<ApiProduct> => {
    const response = await axiosInstance.post<ApiProduct>('/products', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update a product (Admin)
   * Accepts FormData for file upload
   */
  updateProduct: async (id: number, data: FormData): Promise<ApiProduct> => {
    const response = await axiosInstance.patch<ApiProduct>(`/products/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete a product (Admin)
   */
  deleteProduct: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/products/${id}`);
  },
};

/**
 * Orders API
 */
export const ordersApi = {
  /**
   * Create a new order
   */
  createOrder: async (orderData: CreateOrderDto): Promise<ApiOrder> => {
    const response = await axiosInstance.post<ApiOrder>('/orders', orderData);
    return response.data;
  },

  /**
   * Get all orders (requires authentication)
   */
  getOrders: async (): Promise<ApiOrder[]> => {
    const response = await axiosInstance.get<ApiOrder[]>('/orders');
    return response.data;
  },

  /**
   * Get a single order by ID (requires authentication)
   */
  getOrder: async (id: number): Promise<ApiOrder> => {
    const response = await axiosInstance.get<ApiOrder>(`/orders/${id}`);
    return response.data;
  },

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

  /**
   * Cancel an order (User)
   * Only allowed when no payment proof has been uploaded yet
   * Uses the dedicated cancel endpoint that verifies order ownership
   * @param orderId - The ID of the order to cancel
   * @returns The updated order with status CANCELLED
   */
  cancelOrder: async (orderId: string): Promise<ApiOrder> => {
    const response = await axiosInstance.patch<ApiOrder>(`/orders/${orderId}/cancel`);
    return response.data;
  },
};

// Convenience exports for direct function access
export const getEvents = eventsApi.getEvents;
export const getOfficers = officersApi.getOfficers;
export const getProducts = productsApi.getProducts;
export const createOrder = ordersApi.createOrder;

/**
 * Auth API
 */
export const authApi = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Register a new user
   */
  register: async (data: {
    name: string;
    studentId: string;
    email: string;
    password: string;
  }): Promise<{ id: number; email: string; name: string; studentId: string; role: string }> => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },

  /**
   * Get current user profile (requires token)
   */
  getProfile: async (token: string): Promise<{ id: number; email: string; name: string | null; studentId: string | null; role: 'MEMBER' | 'ADMIN' }> => {
    const response = await axiosInstance.get('/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Resend verification email
   */
  resendVerification: async (email: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/auth/resend-verification', { email });
    return response.data;
  },
};

