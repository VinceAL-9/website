import { useState, useMemo } from 'react';
import { FaList, FaInfoCircle, FaShoppingCart, FaShoppingBag } from 'react-icons/fa';
import { PageLayout } from '../components/layout';
import { Button, Modal, Badge } from '../components/common';
import { ProductCard } from '../components/features';
import { useOrders } from '../context';
import { useScrollAnimationList } from '../hooks';
import type { Product, OrderFormData, OrderStatus, PaymentStatus } from '../types';

type TabType = 'all' | 'lanyard' | 'tshirt';

const tabs: { id: TabType; label: string }[] = [
  { id: 'all', label: 'All Items' },
  { id: 'lanyard', label: 'Lanyards' },
  { id: 'tshirt', label: 'T-Shirts' },
];

export const Merchandise = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<OrderFormData>>({
    quantity: 1,
  });
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const {
    orders,
    products,
    addOrder,
    cancelOrder,
    getProductById,
    getStatusDisplayText,
    getPaymentStatusDisplayText,
  } = useOrders();

  const filteredProducts = useMemo(() => {
    if (activeTab === 'all') return products;
    return products.filter((p) => p.category === activeTab);
  }, [activeTab, products]);

  const { containerRef, visibleItems } = useScrollAnimationList(filteredProducts.length, 100);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleOrderClick = (product: Product) => {
    setSelectedProduct(product);
    setFormData({ quantity: 1 });
    setIsOrderModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) return;

    // Validation
    const requiredFields = ['customerName', 'studentId', 'contactNumber', 'customerEmail'] as const;
    for (const field of requiredFields) {
      if (!formData[field]?.toString().trim()) {
        showNotification(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
        return;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customerEmail || '')) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    const orderData: OrderFormData = {
      itemId: selectedProduct.id,
      quantity: formData.quantity || 1,
      customerName: formData.customerName || '',
      studentId: formData.studentId || '',
      contactNumber: formData.contactNumber || '',
      customerEmail: formData.customerEmail || '',
    };

    const order = addOrder(orderData);
    if (order) {
      showNotification(`Order ${order.id} placed successfully!`, 'success');
      setIsOrderModalOpen(false);
      setSelectedProduct(null);
      setFormData({ quantity: 1 });
    } else {
      showNotification('Insufficient stock available', 'error');
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      const success = cancelOrder(orderId);
      if (success) {
        showNotification(`Order ${orderId} cancelled successfully`, 'success');
      } else {
        showNotification('Unable to cancel order', 'error');
      }
    }
  };

  const totalAmount = selectedProduct ? selectedProduct.price * (formData.quantity || 1) : 0;

  const getStatusBadgeVariant = (status: OrderStatus): 'warning' | 'info' | 'success' | 'primary' | 'danger' | 'secondary' => {
    const variants: Record<OrderStatus, 'warning' | 'info' | 'success' | 'primary' | 'danger' | 'secondary'> = {
      pending_review: 'warning',
      awaiting_payment: 'info',
      ready_pickup: 'success',
      completed: 'primary',
      cancelled: 'danger',
    };
    return variants[status] || 'secondary';
  };

  const getPaymentBadgeVariant = (status: PaymentStatus): 'warning' | 'info' | 'success' | 'danger' | 'secondary' => {
    const variants: Record<PaymentStatus, 'warning' | 'info' | 'success' | 'danger' | 'secondary'> = {
      pending: 'warning',
      processing: 'info',
      completed: 'success',
      failed: 'danger',
    };
    return variants[status] || 'secondary';
  };

  return (
    <PageLayout>
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-lg animate-slide-down ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          {notification.message}
        </div>
      )}

      {/* Header Section */}
      <section className="py-16 px-4 bg-linear-to-b from-gray-100 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-psse-accent mb-4">
            PSSE Official Merchandise
          </h1>
          <p className="text-xl text-gray-600">
            Support PSSE with our exclusive merchandise designed by our talented members!
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-psse-accent text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div
            ref={containerRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className={`transition-all duration-500 ${
                  visibleItems.has(index)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
              >
                <ProductCard product={product} onOrder={handleOrderClick} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* My Orders Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">My Orders</h3>
            <Button variant="secondary" onClick={() => setIsOrdersModalOpen(true)}>
              <FaList className="mr-2" />
              View Orders
            </Button>
          </div>
        </div>
      </section>

      {/* Order Modal */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title="Place Your Order"
        size="lg"
      >
        {selectedProduct && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Product Details */}
            <div className="md:col-span-1 text-center">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => {
                  e.currentTarget.src = '/images/placeholder-image.jpg';
                }}
              />
              <h6 className="font-semibold text-gray-900">{selectedProduct.name}</h6>
              <p className="text-sm text-gray-600 mt-1">{selectedProduct.description}</p>
              <p className="text-2xl font-bold text-psse-accent mt-2">₱{selectedProduct.price}</p>
            </div>

            {/* Order Form */}
            <div className="md:col-span-2">
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName || ''}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID *
                    </label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId || ''}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber || ''}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail || ''}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity || 1}
                      onChange={handleFormChange}
                      min="1"
                      max={selectedProduct.stock}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Amount
                    </label>
                    <p className="text-2xl font-bold text-psse-accent">₱{totalAmount}</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FaInfoCircle className="text-blue-500 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <strong>Order Process:</strong> After placing your order, you'll receive a
                      confirmation email. Payment will be collected upon pickup at the PSSE office.
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsOrderModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    <FaShoppingCart className="mr-2" />
                    Place Order
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Modal>

      {/* Orders Modal */}
      <Modal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        title="My Orders"
        size="lg"
      >
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <FaShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h5 className="text-lg font-medium text-gray-500 mb-2">No orders yet</h5>
            <p className="text-gray-400">Start shopping to see your orders here!</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {orders.map((order) => {
              const product = getProductById(order.itemId);
              return (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h6 className="font-semibold text-gray-900">
                        {product?.name || 'Unknown Item'}
                      </h6>
                      <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {getStatusDisplayText(order.status)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Customer:</span>{' '}
                      <span className="text-gray-900">{order.customerName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Student ID:</span>{' '}
                      <span className="text-gray-900">{order.studentId}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Quantity:</span>{' '}
                      <span className="text-gray-900">{order.quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Total:</span>{' '}
                      <span className="font-semibold text-gray-900">₱{order.totalAmount}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Payment:</span>{' '}
                      <Badge variant={getPaymentBadgeVariant(order.paymentStatus)} className="ml-1">
                        {getPaymentStatusDisplayText(order.paymentStatus)}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-500">Order Date:</span>{' '}
                      <span className="text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {(order.status === 'pending_review' || order.status === 'awaiting_payment') && (
                    <div className="mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelOrder(order.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Cancel Order
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </PageLayout>
  );
};
