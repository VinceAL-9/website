import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Order, OrderFormData, OrderStatus, PaymentStatus, Product } from '../types';
import { merchandise, getProductById } from '../data/merchandise';

// Order Actions
type OrderAction =
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_STATUS'; payload: { orderId: string; status: OrderStatus } }
  | { type: 'UPDATE_PAYMENT'; payload: { orderId: string; paymentStatus: PaymentStatus; method?: string; reference?: string } }
  | { type: 'CANCEL_ORDER'; payload: string }
  | { type: 'LOAD_ORDERS'; payload: Order[] }
  | { type: 'UPDATE_STOCK'; payload: { productId: string; quantity: number } };

// State
interface OrderState {
  orders: Order[];
  products: Product[];
  lastOrderId: number;
}

// Context Type
interface OrderContextType {
  orders: Order[];
  products: Product[];
  addOrder: (formData: OrderFormData) => Order | null;
  cancelOrder: (orderId: string) => boolean;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  processPayment: (orderId: string, method: string, reference?: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getProductById: (productId: string) => Product | undefined;
  getStatusDisplayText: (status: OrderStatus) => string;
  getPaymentStatusDisplayText: (status: PaymentStatus) => string;
}

// Initial State
const getInitialState = (): OrderState => {
  const savedOrders = localStorage.getItem('psseOrders');
  const savedLastId = localStorage.getItem('psseLastOrderId');
  
  return {
    orders: savedOrders ? JSON.parse(savedOrders) : [],
    products: [...merchandise],
    lastOrderId: savedLastId ? parseInt(savedLastId) : 1000,
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
  }, [state.orders, state.lastOrderId]);

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

  const value: OrderContextType = {
    orders: state.orders,
    products: state.products,
    addOrder,
    cancelOrder,
    updateOrderStatus,
    processPayment,
    getOrderById,
    getProductById: getProductByIdFromState,
    getStatusDisplayText,
    getPaymentStatusDisplayText,
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
