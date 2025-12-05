import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Order, OrderFormData, OrderStatus, PaymentStatus, Product } from '../types';
import { merchandise, getProductById } from '../data/merchandise';

// Cart Item type
export interface CartItem {
  productId: string;
  quantity: number;
}

// Order Actions
type OrderAction =
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_STATUS'; payload: { orderId: string; status: OrderStatus } }
  | { type: 'UPDATE_PAYMENT'; payload: { orderId: string; paymentStatus: PaymentStatus; method?: string; reference?: string } }
  | { type: 'CANCEL_ORDER'; payload: string }
  | { type: 'LOAD_ORDERS'; payload: Order[] }
  | { type: 'UPDATE_STOCK'; payload: { productId: string; quantity: number } }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

// State
interface OrderState {
  orders: Order[];
  products: Product[];
  lastOrderId: number;
  cart: CartItem[];
}

// Context Type
interface OrderContextType {
  orders: Order[];
  products: Product[];
  cart: CartItem[];
  addOrder: (formData: OrderFormData) => Order | null;
  cancelOrder: (orderId: string) => boolean;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  processPayment: (orderId: string, method: string, reference?: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getProductById: (productId: string) => Product | undefined;
  getStatusDisplayText: (status: OrderStatus) => string;
  getPaymentStatusDisplayText: (status: PaymentStatus) => string;
  addToCart: (productId: string, quantity: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => boolean;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

// Initial State
const getInitialState = (): OrderState => {
  const savedOrders = localStorage.getItem('psseOrders');
  const savedLastId = localStorage.getItem('psseLastOrderId');
  const savedCart = localStorage.getItem('psseCart');
  
  return {
    orders: savedOrders ? JSON.parse(savedOrders) : [],
    products: [...merchandise],
    lastOrderId: savedLastId ? parseInt(savedLastId) : 1000,
    cart: savedCart ? JSON.parse(savedCart) : [],
  };
};

// Reducer
const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case 'ADD_ORDER':
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        lastOrderId: state.lastOrderId + 1,
      };
    
    case 'UPDATE_STATUS': {
      const updatedOrders = state.orders.map((order) =>
        order.id === action.payload.orderId
          ? { ...order, status: action.payload.status, updatedAt: new Date().toISOString() }
          : order
      );
      return { ...state, orders: updatedOrders };
    }
    
    case 'UPDATE_PAYMENT': {
      const updatedOrders = state.orders.map((order) =>
        order.id === action.payload.orderId
          ? {
              ...order,
              paymentStatus: action.payload.paymentStatus,
              paymentMethod: action.payload.method || order.paymentMethod,
              paymentReference: action.payload.reference || order.paymentReference,
              updatedAt: new Date().toISOString(),
            }
          : order
      );
      return { ...state, orders: updatedOrders };
    }
    
    case 'CANCEL_ORDER': {
      const order = state.orders.find((o) => o.id === action.payload);
      if (!order) return state;
      
      // Restore stock
      const updatedProducts = state.products.map((product) =>
        product.id === order.itemId
          ? { ...product, stock: product.stock + order.quantity }
          : product
      );
      
      const updatedOrders = state.orders.map((o) =>
        o.id === action.payload
          ? { ...o, status: 'cancelled' as OrderStatus, updatedAt: new Date().toISOString() }
          : o
      );
      
      return { ...state, orders: updatedOrders, products: updatedProducts };
    }
    
    case 'UPDATE_STOCK': {
      const updatedProducts = state.products.map((product) =>
        product.id === action.payload.productId
          ? { ...product, stock: product.stock - action.payload.quantity }
          : product
      );
      return { ...state, products: updatedProducts };
    }
    
    case 'LOAD_ORDERS':
      return { ...state, orders: action.payload };
    
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
  const [state, dispatch] = useReducer(orderReducer, getInitialState());

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('psseOrders', JSON.stringify(state.orders));
    localStorage.setItem('psseLastOrderId', state.lastOrderId.toString());
    localStorage.setItem('psseCart', JSON.stringify(state.cart));
  }, [state.orders, state.lastOrderId, state.cart]);

  // Generate Order ID
  const generateOrderId = () => `ORD-${state.lastOrderId + 1}`;

  // Calculate estimated pickup (3-5 days)
  const calculateEstimatedPickup = () => {
    const today = new Date();
    const pickupDate = new Date(today);
    pickupDate.setDate(today.getDate() + Math.floor(Math.random() * 3) + 3);
    return pickupDate.toISOString();
  };

  // Add Order
  const addOrder = (formData: OrderFormData): Order | null => {
    const product = state.products.find((p) => p.id === formData.itemId);
    if (!product || product.stock < formData.quantity) {
      return null;
    }

    const newOrder: Order = {
      id: generateOrderId(),
      ...formData,
      totalAmount: product.price * formData.quantity,
      status: 'pending_review',
      paymentStatus: 'pending',
      paymentMethod: null,
      paymentReference: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedPickup: calculateEstimatedPickup(),
    };

    dispatch({ type: 'UPDATE_STOCK', payload: { productId: formData.itemId, quantity: formData.quantity } });
    dispatch({ type: 'ADD_ORDER', payload: newOrder });

    return newOrder;
  };

  // Cancel Order
  const cancelOrder = (orderId: string): boolean => {
    const order = state.orders.find((o) => o.id === orderId);
    if (!order || order.status === 'completed' || order.status === 'ready_pickup') {
      return false;
    }

    dispatch({ type: 'CANCEL_ORDER', payload: orderId });
    return true;
  };

  // Update Order Status
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    dispatch({ type: 'UPDATE_STATUS', payload: { orderId, status } });
  };

  // Process Payment
  const processPayment = (orderId: string, method: string, reference?: string) => {
    dispatch({
      type: 'UPDATE_PAYMENT',
      payload: { orderId, paymentStatus: 'processing', method, reference },
    });

    // Simulate payment processing
    setTimeout(() => {
      dispatch({
        type: 'UPDATE_PAYMENT',
        payload: { orderId, paymentStatus: 'completed' },
      });
      dispatch({
        type: 'UPDATE_STATUS',
        payload: { orderId, status: 'ready_pickup' },
      });
    }, 2000);
  };

  // Get Order by ID
  const getOrderById = (orderId: string) => state.orders.find((o) => o.id === orderId);

  // Get Product by ID
  const getProductByIdFromState = (productId: string) => 
    state.products.find((p) => p.id === productId) || getProductById(productId);

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
    orders: state.orders,
    products: state.products,
    cart: state.cart,
    addOrder,
    cancelOrder,
    updateOrderStatus,
    processPayment,
    getOrderById,
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
