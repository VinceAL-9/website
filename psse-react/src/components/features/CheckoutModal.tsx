import { useState } from 'react';
import { FaShoppingCart, FaTrash, FaMinus, FaPlus, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { Modal, Button } from '../common';
import { useOrders } from '../../context';
import { ordersApi } from '../../services';
import type { CreateOrderDto } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CheckoutFormData {
  customerName: string;
  studentId: string;
  customerEmail: string;
  contactNumber: string;
}

type CheckoutStep = 'cart' | 'form' | 'success' | 'error';

export const CheckoutModal = ({ isOpen, onClose }: CheckoutModalProps) => {
  const {
    cart,
    getProductById,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
  } = useOrders();

  const [step, setStep] = useState<CheckoutStep>('cart');
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    studentId: '',
    customerEmail: '',
    contactNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderReferenceId, setOrderReferenceId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const requiredFields: (keyof CheckoutFormData)[] = [
      'customerName',
      'studentId',
      'customerEmail',
      'contactNumber',
    ];

    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        setErrorMessage(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customerEmail)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setStep('error');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Construct the payload matching CreateOrderDto
      const orderPayload: CreateOrderDto = {
        customerName: formData.customerName,
        studentId: formData.studentId,
        customerEmail: formData.customerEmail,
        contactNumber: formData.contactNumber,
        items: cart.map((item) => ({
          productId: parseInt(item.productId),
          quantity: item.quantity,
        })),
      };

      const response = await ordersApi.createOrder(orderPayload);
      
      // Success - store the order reference ID
      setOrderReferenceId(response.id.toString());
      clearCart();
      setStep('success');
    } catch (error: unknown) {
      // Handle error response
      let message = 'An error occurred while placing your order. Please try again.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string | string[] } } };
        const responseMessage = axiosError.response?.data?.message;
        
        if (Array.isArray(responseMessage)) {
          message = responseMessage.join(', ');
        } else if (typeof responseMessage === 'string') {
          message = responseMessage;
        }
      }
      
      setErrorMessage(message);
      setStep('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    if (step === 'success') {
      setFormData({
        customerName: '',
        studentId: '',
        customerEmail: '',
        contactNumber: '',
      });
    }
    setStep('cart');
    setErrorMessage('');
    setOrderReferenceId('');
    onClose();
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    setStep('form');
  };

  const handleBackToCart = () => {
    setStep('cart');
    setErrorMessage('');
  };

  const renderCartStep = () => (
    <div className="space-y-4">
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <FaShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h5 className="text-lg font-medium text-gray-500 mb-2">Your cart is empty</h5>
          <p className="text-gray-400">Add items to your cart to proceed with checkout.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 max-h-[40vh] overflow-y-auto">
            {cart.map((item) => {
              const product = getProductById(item.productId);
              if (!product) return null;

              return (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder-image.jpg';
                    }}
                  />
                  <div className="flex-1">
                    <h6 className="font-medium text-gray-900">{product.name}</h6>
                    <p className="text-sm text-gray-500">₱{product.price} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                      className="p-1 text-gray-500 hover:text-psse-accent hover:bg-gray-200 rounded"
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus size={12} />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                      className="p-1 text-gray-500 hover:text-psse-accent hover:bg-gray-200 rounded"
                      disabled={item.quantity >= product.stock}
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>
                  <p className="font-semibold text-gray-900 w-20 text-right">
                    ₱{product.price * item.quantity}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-lg">
              <span className="font-medium text-gray-700">Total:</span>
              <span className="font-bold text-psse-accent">₱{getCartTotal()}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={handleClose}>
              Continue Shopping
            </Button>
            <Button variant="primary" onClick={handleProceedToCheckout}>
              Proceed to Checkout
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const renderFormStep = () => (
    <form onSubmit={handleSubmitOrder} className="space-y-6">
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
        <div className="space-y-2 text-sm">
          {cart.map((item) => {
            const product = getProductById(item.productId);
            if (!product) return null;
            return (
              <div key={item.productId} className="flex justify-between">
                <span className="text-gray-600">
                  {product.name} × {item.quantity}
                </span>
                <span className="font-medium">₱{product.price * item.quantity}</span>
              </div>
            );
          })}
          <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-psse-accent">₱{getCartTotal()}</span>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Customer Information</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
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
              value={formData.studentId}
              onChange={handleFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number *
            </label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={handleBackToCart}>
          Back to Cart
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          <FaShoppingCart className="mr-2" />
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </Button>
      </div>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="text-center py-8">
      <FaCheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
      <h4 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h4>
      <p className="text-gray-600 mb-4">Thank you for your order.</p>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-green-700 mb-1">Your Order Reference ID:</p>
        <p className="text-2xl font-bold text-green-800">ORD-{orderReferenceId}</p>
      </div>
      
      <p className="text-sm text-gray-500 mb-6">
        Please save this reference ID. You will receive a confirmation email shortly.
        Payment will be collected upon pickup at the PSSE office.
      </p>
      
      <Button variant="primary" onClick={handleClose}>
        Continue Shopping
      </Button>
    </div>
  );

  const renderErrorStep = () => (
    <div className="text-center py-8">
      <FaExclamationTriangle className="w-20 h-20 text-red-500 mx-auto mb-6" />
      <h4 className="text-2xl font-bold text-gray-900 mb-2">Order Failed</h4>
      
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-700">{errorMessage}</p>
      </div>
      
      <div className="flex justify-center gap-3">
        <Button variant="ghost" onClick={handleBackToCart}>
          Back to Cart
        </Button>
        <Button variant="primary" onClick={() => setStep('form')}>
          Try Again
        </Button>
      </div>
    </div>
  );

  const getTitle = () => {
    switch (step) {
      case 'cart':
        return 'Shopping Cart';
      case 'form':
        return 'Checkout';
      case 'success':
        return 'Order Confirmed';
      case 'error':
        return 'Order Error';
      default:
        return 'Checkout';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getTitle()} size="lg">
      {step === 'cart' && renderCartStep()}
      {step === 'form' && renderFormStep()}
      {step === 'success' && renderSuccessStep()}
      {step === 'error' && renderErrorStep()}
    </Modal>
  );
};
