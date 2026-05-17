import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaShoppingBag, FaCalendar, FaCreditCard, FaReceipt, FaUpload, FaCheckCircle, FaExternalLinkAlt, FaTimesCircle } from 'react-icons/fa';
import { useUserAuth } from '../../context';
import { ordersApi } from '../../services/api';
import type { ApiOrder } from '../../types';
import { OrderStatus } from '../../types/api.types';

export const TransactionHistory = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useUserAuth();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for tracking file upload
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // State for tracking order cancellation
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);

  // Refs for hidden file inputs (one per order)
  const fileInputRefs = useRef<Map<string, HTMLInputElement | null>>(new Map());

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Function to fetch orders
  const fetchOrders = useCallback(async () => {
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
  }, [isAuthenticated]);

  // Fetch user's orders
  /* eslint-disable react-hooks/set-state-in-effect -- Async data fetching on mount is a legitimate effect pattern */
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /**
   * Handle file upload for payment proof
   */
  const handleFileUpload = async (orderId: string, file: File) => {
    setUploadingOrderId(orderId);
    setUploadError(null);

    try {
      await ordersApi.uploadPaymentProof(orderId, file);
      // Refresh orders list on success
      await fetchOrders();
    } catch (err) {
      console.error('Failed to upload payment proof:', err);
      setUploadError('Failed to upload payment proof. Please try again.');
    } finally {
      setUploadingOrderId(null);
    }
  };

  /**
   * Trigger file input click for a specific order
   */
  const triggerFileInput = (orderId: string) => {
    const input = fileInputRefs.current.get(orderId);
    if (input) {
      input.click();
    }
  };

  /**
   * Handle file input change
   */
  const handleFileInputChange = (orderId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(orderId, file);
    }
    // Reset input value to allow re-uploading the same file
    event.target.value = '';
  };

  /**
   * Handle order cancellation
   */
  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrderId(orderId);
    setCancelError(null);
    setShowCancelConfirm(null);

    try {
      await ordersApi.cancelOrder(orderId);
      // Refresh orders list on success
      await fetchOrders();
    } catch (err) {
      console.error('Failed to cancel order:', err);
      setCancelError('Failed to cancel order. Please try again.');
    } finally {
      setCancellingOrderId(null);
    }
  };

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
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-orange-100 text-orange-800',
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

        {/* Upload Error State */}
        {uploadError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{uploadError}</p>
          </div>
        )}

        {/* Cancel Error State */}
        {cancelError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{cancelError}</p>
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
                {/* Hidden file input for this order */}
                <input
                  type="file"
                  accept="image/*"
                  ref={(el) => { fileInputRefs.current.set(order.id, el); }}
                  onChange={(e) => handleFileInputChange(order.id, e)}
                  className="hidden"
                />

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

                  {/* Payment Proof Section - Shown while payment is pending/paid */}
                  {(order.status === OrderStatus.PENDING || order.status === OrderStatus.PAID) && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      {!order.paymentProofUrl ? (
                        // No proof uploaded yet - show upload button and cancel option
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <p className="text-sm text-white/90">
                              Please upload your GCash payment screenshot to proceed.
                            </p>
                            <button
                              onClick={() => triggerFileInput(order.id)}
                              disabled={uploadingOrderId === order.id}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${uploadingOrderId === order.id
                                ? 'bg-white/30 cursor-not-allowed'
                                : 'bg-white text-psse-primary hover:bg-orange-50 hover:shadow-md'
                                }`}
                            >
                              {uploadingOrderId === order.id ? (
                                <>
                                  <FaSpinner className="animate-spin h-4 w-4" />
                                  <span>Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <FaUpload className="h-4 w-4" />
                                  <span>Upload GCash Proof</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Cancel Order Section - Only shown when no payment proof uploaded */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            {showCancelConfirm === order.id ? (
                              // Confirmation dialog
                              <div className="flex items-center gap-3 px-4 py-2 bg-red-500/20 rounded-lg border border-red-400/30">
                                <span className="text-sm text-white">
                                  Are you sure you want to cancel this order?
                                </span>
                                <button
                                  onClick={() => handleCancelOrder(order.id)}
                                  disabled={cancellingOrderId === order.id}
                                  className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                  {cancellingOrderId === order.id ? (
                                    <FaSpinner className="animate-spin h-4 w-4" />
                                  ) : (
                                    'Yes, Cancel'
                                  )}
                                </button>
                                <button
                                  onClick={() => setShowCancelConfirm(null)}
                                  disabled={cancellingOrderId === order.id}
                                  className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded hover:bg-white/30 transition-colors disabled:opacity-50"
                                >
                                  No, Keep Order
                                </button>
                              </div>
                            ) : (
                              // Cancel button
                              <button
                                onClick={() => setShowCancelConfirm(order.id)}
                                disabled={cancellingOrderId === order.id}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-red-200 hover:text-white hover:bg-red-500/30 rounded-lg transition-all"
                              >
                                <FaTimesCircle className="h-4 w-4" />
                                <span>Cancel Order</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        // Proof already uploaded - show confirmation
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-lg border border-green-400/30">
                            <FaCheckCircle className="h-4 w-4 text-green-300" />
                            <span className="text-sm font-medium text-green-100">
                              Proof Submitted - Awaiting Review
                            </span>
                          </div>
                          <a
                            href={order.paymentProofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white transition-colors"
                          >
                            <FaExternalLinkAlt className="h-3 w-3" />
                            View Proof
                          </a>
                        </div>
                      )}
                    </div>
                  )}
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

