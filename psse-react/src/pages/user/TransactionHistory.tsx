import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaShoppingBag, FaCalendar, FaCreditCard, FaReceipt } from 'react-icons/fa';
import { useUserAuth } from '../../context';
import { ordersApi } from '../../services/api';
import type { ApiOrder } from '../../types';

export const TransactionHistory = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useUserAuth();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch user's orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      setError(null);

      try {
        const userOrders = await ordersApi.getMyOrders();
        setOrders(userOrders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load transaction history. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending_review: 'bg-yellow-100 text-yellow-800',
      awaiting_payment: 'bg-orange-100 text-orange-800',
      ready_pickup: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  // Format status text
  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FaSpinner className="animate-spin h-8 w-8 text-psse-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaShoppingBag className="text-psse-primary" />
            Transaction History
          </h1>
          <p className="mt-2 text-gray-600">View all your merchandise orders and transaction details</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && orders.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate('/merchandise')}
              className="inline-flex items-center px-6 py-3 bg-psse-primary text-white rounded-lg hover:bg-psse-dark transition-colors"
            >
              Browse Merchandise
            </button>
          </div>
        )}

        {/* Orders List */}
        {orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="bg-linear-to-r from-psse-primary to-psse-dark p-6 text-white">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FaReceipt />
                        <span className="text-sm font-medium">Reference ID</span>
                      </div>
                      <p className="text-xl font-bold">{order.referenceId}</p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <FaCalendar />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(
                          order.status
                        )}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-6">
                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {order.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.product.name}</p>
                            <p className="text-sm text-gray-500">
                              Quantity: {item.quantity} × ₱{parseFloat(String(item.priceAtTime)).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ₱{(parseFloat(String(item.priceAtTime)) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Customer Name:</span>
                      <span className="font-medium text-gray-900">{order.customerName}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Student ID:</span>
                      <span className="font-medium text-gray-900">{order.studentId}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Contact Number:</span>
                      <span className="font-medium text-gray-900">{order.contactNumber}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">{order.customerEmail}</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                      <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FaCreditCard />
                        Total Amount:
                      </span>
                      <span className="text-2xl font-bold text-psse-primary">
                        ₱{parseFloat(String(order.totalAmount)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
