import { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Product, OrderStatus, PaymentStatus, ApiOrder, CreateOrderDto, ApiProduct, Category } from '../types';
import { ordersApi, productsApi } from '../services/api';

// Cart Item type
export interface CartItem {
  productId: string;
  quantity: number;
}

// Form data for order submission (client-side)
export interface OrderFormData {
  customerName: string;
  studentId: string;
  contactNumber: string;
  customerEmail: string;
}

// Cart Actions - only cart-related actions remain
type CartAction =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_PRODUCTS'; payload: Product[] };

// State - simplified to only cart and products
interface CartState {
  products: Product[];
  cart: CartItem[];
}

// Context Type - updated to reflect API-based order management
interface OrderContextType {
  // Products & Cart
  products: Product[];
  cart: CartItem[];
  isLoadingProducts: boolean;
  productsError: string | null;

  // Order Submission
  submitOrder: (formData: OrderFormData) => Promise<ApiOrder>;
  isSubmitting: boolean;
  submitError: string | null;
  clearSubmitError: () => void;

  // Product helpers
  getProductById: (productId: string) => Product | undefined;

  // Status display helpers
  getStatusDisplayText: (status: OrderStatus) => string;
  getPaymentStatusDisplayText: (status: PaymentStatus) => string;

  // Cart operations
  addToCart: (productId: string, quantity: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => boolean;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

// Map API Category enum to local category type
const categoryMap: Record<Category, 'lanyard' | 'tshirt'> = {
  LANYARD: 'lanyard',
  TSHIRT: 'tshirt',
  STICKER: 'tshirt', // fallback for stickers
};

// Transform API product to local Product type
const transformApiProduct = (apiProduct: ApiProduct): Product => ({
  id: apiProduct.id.toString(),
  name: apiProduct.name,
  description: apiProduct.description,
  price: typeof apiProduct.price === 'string' ? parseFloat(apiProduct.price) : apiProduct.price,
  image: apiProduct.imageUrl,
  category: categoryMap[apiProduct.category] || 'tshirt',
  stock: apiProduct.stock,
  addedDate: new Date().toISOString(),
  featured: apiProduct.isFeatured,
  specifications: [],
});

// Initial State - only cart persisted
const getInitialState = (): CartState => {
  const savedCart = localStorage.getItem('psseCart');

  return {
    products: [],
    cart: savedCart ? JSON.parse(savedCart) : [],
  };
};

// Reducer - only handles cart actions
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };

    case 'ADD_TO_CART': {
      const existingItem = state.cart.find((item) => item.productId === action.payload.productId);
      if (existingItem) {
        const updatedCart = state.cart.map((item) =>
          item.productId === action.payload.productId
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        return { ...state, cart: updatedCart };
      }
      return { ...state, cart: [...state.cart, action.payload] };
    }

    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((item) => item.productId !== action.payload) };

    case 'UPDATE_CART_QUANTITY': {
      const updatedCart = state.cart.map((item) =>
        item.productId === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return { ...state, cart: updatedCart };
    }

    case 'CLEAR_CART':
      return { ...state, cart: [] };

    default:
      return state;
  }
};

// Context
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Provider
interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider = ({ children }: OrderProviderProps) => {
  const [state, dispatch] = useReducer(cartReducer, getInitialState());

  // Products loading state
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  // API request state for orders
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch products from API on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      setProductsError(null);

      try {
        const apiProducts = await productsApi.getProducts();
        const transformedProducts = apiProducts.map(transformApiProduct);
        dispatch({ type: 'SET_PRODUCTS', payload: transformedProducts });
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProductsError('Failed to load products. Please try again later.');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('psseCart', JSON.stringify(state.cart));
  }, [state.cart]);

  // Clear submit error
  const clearSubmitError = useCallback(() => {
    setSubmitError(null);
  }, []);

  // Submit Order to API
  const submitOrder = useCallback(async (formData: OrderFormData): Promise<ApiOrder> => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Build the order items from cart
      // Use productId as string (UUID format) for the API
      const orderItems = state.cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      if (orderItems.length === 0) {
        throw new Error('Cart is empty');
      }

      // Build CreateOrderDto payload matching backend structure
      const createOrderPayload: CreateOrderDto = {
        customerName: formData.customerName,
        studentId: formData.studentId,
        contactNumber: formData.contactNumber,
        customerEmail: formData.customerEmail,
        items: orderItems,
      };

      // Call the API
      const createdOrder = await ordersApi.createOrder(createOrderPayload);

      // Clear the cart on success
      dispatch({ type: 'CLEAR_CART' });

      return createdOrder;
    } catch (error) {
      // Handle error and provide user-friendly message
      let errorMessage = 'Failed to submit order. Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle axios error response
        const axiosError = error as { response?: { data?: { message?: string | string[] } } };
        if (axiosError.response?.data?.message) {
          const msg = axiosError.response.data.message;
          errorMessage = Array.isArray(msg) ? msg.join(', ') : msg;
        }
      }

      setSubmitError(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [state.cart]);

  // Get Product by ID
  const getProductByIdFromState = (productId: string) =>
    state.products.find((p) => p.id === productId);

  // Status Display Text
  const getStatusDisplayText = (status: OrderStatus): string => {
    const statusMap: Record<OrderStatus, string> = {
      pending_review: 'Order is being reviewed',
      awaiting_payment: 'Awaiting Payment',
      ready_pickup: 'Ready for Pickup',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return statusMap[status] || status;
  };

  // Payment Status Display Text
  const getPaymentStatusDisplayText = (status: PaymentStatus): string => {
    const statusMap: Record<PaymentStatus, string> = {
      pending: 'Payment Pending',
      processing: 'Processing Payment...',
      completed: 'Payment Completed',
      failed: 'Payment Failed',
    };
    return statusMap[status] || status;
  };

  // Add to Cart
  const addToCart = (productId: string, quantity: number): boolean => {
    const product = state.products.find((p) => p.id === productId);
    if (!product) return false;

    // Check if product is out of stock
    if (product.stock === 0) return false;

    const existingCartItem = state.cart.find((item) => item.productId === productId);
    const currentCartQty = existingCartItem ? existingCartItem.quantity : 0;

    if (product.stock < currentCartQty + quantity) {
      return false; // Insufficient stock
    }

    dispatch({ type: 'ADD_TO_CART', payload: { productId, quantity } });
    return true;
  };

  // Remove from Cart
  const removeFromCart = (productId: string): void => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  // Update Cart Quantity
  const updateCartQuantity = (productId: string, quantity: number): boolean => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return true;
    }

    const product = state.products.find((p) => p.id === productId);
    if (!product || product.stock < quantity) {
      return false;
    }

    dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { productId, quantity } });
    return true;
  };

  // Clear Cart
  const clearCart = (): void => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Get Cart Total
  const getCartTotal = (): number => {
    return state.cart.reduce((total, item) => {
      const product = state.products.find((p) => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  // Get Cart Item Count
  const getCartItemCount = (): number => {
    return state.cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value: OrderContextType = {
    products: state.products,
    cart: state.cart,
    isLoadingProducts,
    productsError,
    submitOrder,
    isSubmitting,
    submitError,
    clearSubmitError,
    getProductById: getProductByIdFromState,
    getStatusDisplayText,
    getPaymentStatusDisplayText,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

// Hook
export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
