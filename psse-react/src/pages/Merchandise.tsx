import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaSpinner, FaExclamationTriangle, FaSignInAlt } from 'react-icons/fa';
import { PageLayout } from '../components/layout';
import { Button } from '../components/common';
import { ProductCard, CheckoutModal } from '../components/features';
import { useOrders, useUserAuth } from '../context';
import { useScrollAnimationList } from '../hooks';
import type { Product } from '../types';

type TabType = 'all' | 'lanyard' | 'tshirt';

const tabs: { id: TabType; label: string }[] = [
  { id: 'all', label: 'All Items' },
  { id: 'lanyard', label: 'Lanyards' },
  { id: 'tshirt', label: 'T-Shirts' },
];

export const Merchandise = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { isAuthenticated, isLoading: authLoading } = useUserAuth();

  const {
    products,
    isLoadingProducts,
    productsError,
    addToCart,
    getCartItemCount,
    validateCartStock,
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

  const handleAddToCart = (product: Product) => {
    // Check stock before adding
    if (product.stock === 0) {
      showNotification('This item is out of stock', 'error');
      return;
    }

    const success = addToCart(product.id, 1);
    if (success) {
      showNotification(`${product.name} added to cart!`, 'success');
    } else {
      showNotification('Insufficient stock available', 'error');
    }
  };

  const handleOpenCheckout = async () => {
    try {
      const stockCheck = await validateCartStock();
      const unavailableItems = stockCheck.items.filter((item) => !item.available);

      if (unavailableItems.length > 0) {
        const names = unavailableItems.map((item) => item.name || 'Item').join(', ');
        showNotification(`Insufficient stock for: ${names}`, 'error');
        return;
      }

      setIsCheckoutModalOpen(true);
    } catch (error) {
      console.error('Failed to validate stock:', error);
      showNotification('Failed to validate stock. Please try again.', 'error');
    }
  };

  // Loading state
  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <FaSpinner className="w-12 h-12 text-psse-accent animate-spin mb-4" />
      <p className="text-gray-600 text-lg">Loading products...</p>
    </div>
  );

  // Error state
  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <FaExclamationTriangle className="w-12 h-12 text-red-500 mb-4" />
      <p className="text-gray-800 text-lg font-medium mb-2">Oops! Something went wrong</p>
      <p className="text-gray-600 mb-4">{productsError}</p>
      <Button
        variant="primary"
        onClick={() => window.location.reload()}
      >
        Try Again
      </Button>
    </div>
  );

  // Empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <FaShoppingCart className="w-12 h-12 text-gray-300 mb-4" />
      <p className="text-gray-600 text-lg">No products available at the moment.</p>
    </div>
  );

  return (
    <PageLayout>
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-lg animate-slide-down ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
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
          <p className="text-xl text-gray-600 mb-6">
            Support PSSE with our exclusive merchandise designed by our talented members!
          </p>

          {/* Cart Button - Only for authenticated users */}
          {!authLoading && isAuthenticated && (
            <div className="flex justify-center">
              <Button
                variant="primary"
                onClick={handleOpenCheckout}
                className="relative"
              >
                <FaShoppingCart className="mr-2" />
                View Cart
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </Button>
            </div>
          )}

          {/* Login Prompt - For non-authenticated users */}
          {!authLoading && !isAuthenticated && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto">
              <p className="text-blue-700 mb-3">
                <FaSignInAlt className="inline mr-2" />
                Login to purchase merchandise
              </p>
              <Link to="/user/login">
                <Button variant="primary" size="sm">
                  Login to Purchase
                </Button>
              </Link>
            </div>
          )}
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
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${activeTab === tab.id
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
          {isLoadingProducts && renderLoadingState()}

          {!isLoadingProducts && productsError && renderErrorState()}

          {!isLoadingProducts && !productsError && filteredProducts.length === 0 && renderEmptyState()}

          {!isLoadingProducts && !productsError && filteredProducts.length > 0 && (
            <div
              ref={containerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className={`transition-all duration-500 ${visibleItems.has(index)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                    }`}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={isAuthenticated ? handleAddToCart : undefined}
                    showPurchaseOptions={isAuthenticated}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
      />
    </PageLayout>
  );
};
