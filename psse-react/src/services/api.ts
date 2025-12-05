import axiosInstance from '../lib/axios';
import type {
  ApiEvent,
  ApiOfficer,
  ApiProduct,
  ApiOrder,
  CreateOrderDto,
  AuthResponse,
} from '../types';

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
};
