import { createContext, useContext, useState, useMemo, useEffect, useRef, type ReactNode } from 'react';
import { FaSpinner, FaExternalLinkAlt, FaExclamationCircle, FaImage } from 'react-icons/fa';
import { Filter } from '../../../components/common';
import { useOrders } from './useOrders';
import { OrderStatus, type ApiOrder } from '../../../types/api.types';
import { useScrollPagination } from '../../../hooks/useScrollPagination';

const ORDER_STATUS_OPTIONS = [
  { value: OrderStatus.PENDING, label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: OrderStatus.PAID, label: 'Paid', color: 'bg-orange-100 text-orange-800' },
  { value: OrderStatus.READY_PICKUP, label: 'Ready for Pickup', color: 'bg-blue-100 text-blue-800' },
  { value: OrderStatus.COMPLETED, label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: OrderStatus.CANCELLED, label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

interface OrdersContextType {
    orders: ApiOrder[];
    loading: boolean;
    error: string | null;
    loadOrders: () => Promise<void>;
    updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
    updatingOrderId: string | null;
    orderStatusFilter: string;
    setOrderStatusFilter: React.Dispatch<React.SetStateAction<string>>;
    orderDateFilter: string;
    setOrderDateFilter: React.Dispatch<React.SetStateAction<string>>;
    displayedOrders: ApiOrder[];
    hasMore: boolean;
    loadMore: () => void;
    orderDateOptions: { label: string; value: string; }[];
    formatDate: (dateString: string) => string;
    formatCurrency: (amount: number | string) => string;
}

const OrdersContext = createContext<OrdersContextType | null>(null);

export const OrdersHeader = () => {
  const context = useContext(OrdersContext);
  if (!context) return null;
  const { loadOrders, orderDateOptions, orderDateFilter, setOrderDateFilter, orderStatusFilter, setOrderStatusFilter } = context;
  return (
    <div className="sticky top-0 z-10 bg-gray-100 border-b border-gray-200 py-4 px-6 flex justify-between items-center gap-3 w-full">
        <h2 className="text-xl font-bold text-gray-800">View Orders</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Filter label="Filter by Date" options={orderDateOptions} selected={orderDateFilter} onFilterChange={setOrderDateFilter} className="w-48" />
          <Filter label="Filter by Status" options={[{ label: 'All Statuses', value: 'all' }, ...ORDER_STATUS_OPTIONS.map(o => ({ label: o.label, value: o.value }))]} selected={orderStatusFilter} onFilterChange={setOrderStatusFilter} className="w-48" />
          <button onClick={loadOrders} className="px-4 py-2 text-sm text-psse-accent hover:bg-psse-accent/10 rounded-lg transition-colors">Refresh</button>
        </div>
      </div>
  );
};

export const OrdersContent = () => {
    const context = useContext(OrdersContext);
    if (!context) return null;
    const { displayedOrders, loading, error, loadOrders, updatingOrderId, updateOrderStatus, formatDate, formatCurrency, hasMore, loadMore } = context;

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            const container = containerRef.current;
            if (!container) return;
            
            const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
            
            if (isAtBottom && hasMore) {
                loadMore();
            }
        };
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [hasMore, loadMore]);

    if (loading) return <div className="flex items-center justify-center py-12"><FaSpinner className="animate-spin text-3xl text-psse-accent" /></div>;
    if (error) return <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">{error}<button onClick={loadOrders} className="ml-2 underline">Retry</button></div>;

    return (
        <div ref={containerRef} className="p-6 space-y-6 bg-white rounded-xl shadow-sm overflow-y-auto max-h-[80vh]">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Proof</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayedOrders.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No orders found.</td></tr>
            ) : (
              displayedOrders.map((order) => {
                const needsReview = order.status === OrderStatus.PAID && order.paymentProofUrl;
                return (
                  <tr key={order.id} className={`hover:bg-gray-50 ${needsReview ? 'bg-amber-50 border-l-4 border-l-amber-500' : ''}`}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      <div className="text-xs text-gray-400">ID: {order.studentId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.orderItems?.length || 0} item(s)</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4">
                      {order.paymentProofUrl ? (
                        <div className="flex items-center gap-2">
                          <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="group relative">
                            <img src={order.paymentProofUrl} alt="Payment Proof" className="w-10 h-10 object-cover rounded border border-gray-300 hover:border-psse-accent transition-colors" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded"><FaExternalLinkAlt className="text-white text-xs" /></div>
                          </a>
                          {needsReview && <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full"><FaExclamationCircle className="text-amber-600" /> Review</span>}
                        </div>
                      ) : <span className="flex items-center gap-1 text-sm text-gray-400"><FaImage className="text-gray-300" /> No proof</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {updatingOrderId === order.id ? <FaSpinner className="animate-spin text-psse-accent" /> : order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED ? (
                          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {order.status === OrderStatus.COMPLETED ? 'Completed' : 'Cancelled'}<span className="ml-1 text-xs opacity-60">(Final)</span>
                          </span>
                        ) : (
                          <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)} className="block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent">
                            {ORDER_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {hasMore && <div className="py-4 text-center text-gray-500">Loading more...</div>}
      </div>
    );
};


export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const { orders, loading, error, loadOrders, updateOrderStatus, updatingOrderId } = useOrders();
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderDateFilter, setOrderDateFilter] = useState('all');

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    if (orderStatusFilter !== 'all') filtered = filtered.filter((o) => o.status === orderStatusFilter);
    if (orderDateFilter !== 'all') filtered = filtered.filter((o) => new Date(o.createdAt).toLocaleDateString('en-CA') === orderDateFilter);
    return filtered;
  }, [orders, orderStatusFilter, orderDateFilter]);

  const { displayedItems: displayedOrders, hasMore, loadMore, reset: resetPagination } = useScrollPagination(filteredOrders);

  useEffect(() => {
    resetPagination();
  }, [filteredOrders, resetPagination]);

  const orderDateOptions = useMemo(() => {
    const dateMap = new Map<string, string>();
    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const key = date.toLocaleDateString('en-CA');
      if (!dateMap.has(key)) dateMap.set(key, date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));
    });
    const sortedKeys = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a));
    return [{ label: 'All Dates', value: 'all' }, ...sortedKeys.map((key) => ({ label: dateMap.get(key) ?? key, value: key }))];
  }, [orders]);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const formatCurrency = (amount: number | string) => `₱${(typeof amount === 'string' ? parseFloat(amount) : amount).toFixed(2)}`;

  return (
    <OrdersContext.Provider value={{ orders, loading, error, loadOrders, updateOrderStatus, updatingOrderId, orderStatusFilter, setOrderStatusFilter, orderDateFilter, setOrderDateFilter, displayedOrders, hasMore, loadMore, orderDateOptions, formatDate, formatCurrency }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const OrdersView = () => {
  return (
    <OrdersProvider>
      <OrdersHeader />
      <div className="mt-6">
        <OrdersContent />
      </div>
    </OrdersProvider>
  );
};
