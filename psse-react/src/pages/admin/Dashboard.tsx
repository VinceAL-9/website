import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaShoppingCart,
  FaUsers,
  FaSignOutAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaBox,
  FaImage,
  FaExternalLinkAlt,
  FaExclamationCircle,
} from 'react-icons/fa';
import { eventsApi, ordersApi, officersApi, productsApi } from '../../services/api';
import { useUserAuth } from '../../context';
import type {
  ApiEvent,
  ApiOrder,
  ApiOfficer,
  ApiProduct,
} from '../../types';
import { OrderStatus, Category } from '../../types/api.types';
import { Modal, Button } from '../../components/common';

type AdminView = 'events' | 'orders' | 'officers' | 'products';

interface EventFormData {
  title: string;
  date: string;
  description: string;
  location: string;
  isUpcoming: boolean;
}

const initialEventForm: EventFormData = {
  title: '',
  date: '',
  description: '',
  location: '',
  isUpcoming: true,
};

const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string; color: string }[] = [
  { value: OrderStatus.PENDING, label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: OrderStatus.PAID, label: 'Paid', color: 'bg-orange-100 text-orange-800' },
  { value: OrderStatus.READY_PICKUP, label: 'Ready for Pickup', color: 'bg-blue-100 text-blue-800' },
  { value: OrderStatus.COMPLETED, label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: OrderStatus.CANCELLED, label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

interface OfficerFormData {
  name: string;
  position: string;
  category: string;
  academicYear: string;
  order: string;
}

const initialOfficerForm: OfficerFormData = {
  name: '',
  position: '',
  category: 'EXEC',
  academicYear: '',
  order: '0',
};

const OFFICER_CATEGORY_OPTIONS = [
  { value: 'EXEC', label: 'Executive Board' },
  { value: 'ADMIN', label: 'Administrative' },
  { value: 'FINANCE', label: 'Finance & Treasury' },
  { value: 'REP', label: 'Year Level Reps' },
  { value: 'AMBASSADOR', label: 'Ambassadors' },
];

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: Category;
  isFeatured: boolean;
}

const initialProductForm: ProductFormData = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: Category.TSHIRT,
  isFeatured: false,
};

const PRODUCT_CATEGORY_OPTIONS = [
  { value: Category.LANYARD, label: 'Lanyard' },
  { value: Category.TSHIRT, label: 'T-Shirt' },
  { value: Category.STICKER, label: 'Sticker' },
];

export const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useUserAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Derive current view from URL path (avoids setState-in-effect)
  const currentView: AdminView = (() => {
    const path = location.pathname;
    if (path.includes('orders')) return 'orders';
    if (path.includes('officers')) return 'officers';
    if (path.includes('products')) return 'products';
    return 'events';
  })();

  // Events state
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ApiEvent | null>(null);
  const [eventForm, setEventForm] = useState<EventFormData>(initialEventForm);
  const [eventSubmitting, setEventSubmitting] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Orders state
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Officers state
  const [officers, setOfficers] = useState<ApiOfficer[]>([]);
  const [officersLoading, setOfficersLoading] = useState(false);
  const [officersError, setOfficersError] = useState<string | null>(null);
  const [showOfficerModal, setShowOfficerModal] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<ApiOfficer | null>(null);
  const [officerForm, setOfficerForm] = useState<OfficerFormData>(initialOfficerForm);
  const [officerSubmitting, setOfficerSubmitting] = useState(false);
  const [selectedOfficerPhotoFile, setSelectedOfficerPhotoFile] = useState<File | null>(null);
  const [officerPhotoPreview, setOfficerPhotoPreview] = useState<string | null>(null);

  // Products state
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);
  const [productForm, setProductForm] = useState<ProductFormData>(initialProductForm);
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [selectedProductImageFile, setSelectedProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);

  // Data loading functions (declared before the useEffect that references them)
  const loadEvents = async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const data = await eventsApi.getEvents();
      setEvents(data);
    } catch (err) {
      setEventsError('Failed to load events. Please try again.');
      console.error('Error loading events:', err);
    } finally {
      setEventsLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await ordersApi.getOrders();
      setOrders(data);
    } catch (err) {
      setOrdersError('Failed to load orders. Please try again.');
      console.error('Error loading orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadOfficers = async () => {
    setOfficersLoading(true);
    setOfficersError(null);
    try {
      const data = await officersApi.getOfficers();
      setOfficers(data);
    } catch (err) {
      setOfficersError('Failed to load officers. Please try again.');
      console.error('Error loading officers:', err);
    } finally {
      setOfficersLoading(false);
    }
  };

  const loadProducts = async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const data = await productsApi.getProducts();
      setProducts(data);
    } catch (err) {
      setProductsError('Failed to load products. Please try again.');
      console.error('Error loading products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Load data based on current view
  /* eslint-disable react-hooks/set-state-in-effect -- Async data fetching triggered by view change is a legitimate effect pattern */
  useEffect(() => {
    if (currentView === 'events') {
      loadEvents();
    } else if (currentView === 'orders') {
      loadOrders();
    } else if (currentView === 'officers') {
      loadOfficers();
    } else if (currentView === 'products') {
      loadProducts();
    }
  }, [currentView]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleLogout = () => {
    // Use context's logout to clear user state
    logout();
    navigate('/admin/login');
  };

  const handleViewChange = (view: AdminView) => {
    navigate(`/admin/dashboard/${view}`);
  };

  // Event handlers
  const openAddEventModal = () => {
    setEditingEvent(null);
    setEventForm(initialEventForm);
    setSelectedImageFile(null);
    setImagePreview(null);
    setShowEventModal(true);
  };

  const openEditEventModal = (event: ApiEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      date: event.date.split('T')[0], // Format for date input
      description: event.description,
      location: event.location,
      isUpcoming: event.isUpcoming,
    });
    setSelectedImageFile(null);
    setImagePreview(event.imageUrl); // Show existing image
    setShowEventModal(true);
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
    setEventForm(initialEventForm);
    setSelectedImageFile(null);
    setImagePreview(null);
  };

  const handleEventFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setEventForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleEventSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEventSubmitting(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', eventForm.title);
      formData.append('description', eventForm.description);
      formData.append('date', new Date(eventForm.date).toISOString());
      formData.append('location', eventForm.location);
      formData.append('isUpcoming', eventForm.isUpcoming.toString());

      // Add image file if selected
      if (selectedImageFile) {
        formData.append('image', selectedImageFile);
      }

      if (editingEvent) {
        await eventsApi.updateEvent(editingEvent.id, formData);
      } else {
        // For create, image is required
        if (!selectedImageFile) {
          alert('Please select an image for the event.');
          return;
        }
        await eventsApi.createEvent(formData);
      }

      closeEventModal();
      loadEvents();
    } catch (err) {
      console.error('Error saving event:', err);
      alert('Failed to save event. Please try again.');
    } finally {
      setEventSubmitting(false);
    }
  };

  const handleDeleteEvent = async (event: ApiEvent) => {
    if (!window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      return;
    }

    try {
      console.log('Attempting to delete event:', event.id);
      await eventsApi.deleteEvent(event.id);
      console.log('Event deleted successfully');
      loadEvents();
    } catch (err: unknown) {
      const error = err as { response?: { status?: number, data?: { message?: string } }, message?: string };
      console.error('Error deleting event:', {
        eventId: event.id,
        error: error,
        response: error.response,
        status: error.response?.status,
        message: error.response?.data?.message,
      });

      // Don't show alert if it's a 401 (user will be redirected to login)
      if (error.response?.status !== 401) {
        alert(`Failed to delete event: ${error.response?.data?.message || error.message || 'Unknown error'}`);
      }
    }
  };

  // Order handlers
  const handleOrderStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const updatedOrder = await ordersApi.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? updatedOrder : order
        )
      );
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Officer handlers
  const openAddOfficerModal = () => {
    setEditingOfficer(null);
    setOfficerForm(initialOfficerForm);
    setSelectedOfficerPhotoFile(null);
    setOfficerPhotoPreview(null);
    setShowOfficerModal(true);
  };

  const openEditOfficerModal = (officer: ApiOfficer) => {
    setEditingOfficer(officer);
    setOfficerForm({
      name: officer.name,
      position: officer.position,
      category: officer.category,
      academicYear: officer.academicYear,
      order: String(officer.order || 0),
    });
    setSelectedOfficerPhotoFile(null);
    setOfficerPhotoPreview(officer.photoUrl);
    setShowOfficerModal(true);
  };

  const closeOfficerModal = () => {
    setShowOfficerModal(false);
    setEditingOfficer(null);
    setOfficerForm(initialOfficerForm);
    setSelectedOfficerPhotoFile(null);
    setOfficerPhotoPreview(null);
  };

  const handleOfficerFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setOfficerForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOfficerSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setOfficerSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', officerForm.name);
      formData.append('position', officerForm.position);
      formData.append('category', officerForm.category);
      formData.append('academicYear', officerForm.academicYear);
      formData.append('order', officerForm.order);

      if (selectedOfficerPhotoFile) {
        formData.append('photo', selectedOfficerPhotoFile);
      }

      if (editingOfficer) {
        await officersApi.updateOfficer(editingOfficer.id, formData);
      } else {
        if (!selectedOfficerPhotoFile) {
          alert('Please select a photo for the officer.');
          return;
        }
        await officersApi.createOfficer(formData);
      }

      closeOfficerModal();
      loadOfficers();
    } catch (err) {
      console.error('Error saving officer:', err);
      alert('Failed to save officer. Please try again.');
    } finally {
      setOfficerSubmitting(false);
    }
  };

  const handleDeleteOfficer = async (officer: ApiOfficer) => {
    if (!window.confirm(`Are you sure you want to delete "${officer.name}"?`)) {
      return;
    }

    try {
      await officersApi.deleteOfficer(officer.id);
      loadOfficers();
    } catch (err: unknown) {
      const error = err as { response?: { status?: number, data?: { message?: string } }, message?: string };
      console.error('Error deleting product:', error);
      if (error.response?.status !== 401) {
        alert(`Failed to delete product: ${error.response?.data?.message || error.message || 'Unknown error'}`);
      }
    }
  };

  // Product handlers

  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm(initialProductForm);
    setSelectedProductImageFile(null);
    setProductImagePreview(null);
    setShowProductModal(true);
  };

  const openEditProductModal = (product: ApiProduct) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      isFeatured: product.isFeatured,
    });
    setSelectedProductImageFile(null);
    setProductImagePreview(product.imageUrl);
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setProductForm(initialProductForm);
    setSelectedProductImageFile(null);
    setProductImagePreview(null);
  };

  const handleProductFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleProductSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProductSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('stock', productForm.stock);
      formData.append('category', productForm.category);
      formData.append('isFeatured', productForm.isFeatured.toString());

      if (selectedProductImageFile) {
        formData.append('image', selectedProductImageFile);
      }

      if (editingProduct) {
        await productsApi.updateProduct(editingProduct.id, formData);
      } else {
        if (!selectedProductImageFile) {
          alert('Please select an image for the product.');
          setProductSubmitting(false);
          return;
        }
        await productsApi.createProduct(formData);
      }

      closeProductModal();
      loadProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product. Please try again.');
    } finally {
      setProductSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product: ApiProduct) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      await productsApi.deleteProduct(product.id);
      loadProducts();
    } catch (err: unknown) {
      const error = err as { response?: { status?: number, data?: { message?: string } }, message?: string };
      console.error('Error deleting product:', error);
      if (error.response?.status !== 401) {
        alert(`Failed to delete product: ${error.response?.data?.message || error.message || 'Unknown error'}`);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₱${num.toFixed(2)}`;
  };

  // Sidebar navigation items
  const navItems = [
    { id: 'events' as AdminView, label: 'Manage Events', icon: FaCalendarAlt },
    { id: 'orders' as AdminView, label: 'View Orders', icon: FaShoppingCart },
    { id: 'officers' as AdminView, label: 'Update Officers', icon: FaUsers },
    { id: 'products' as AdminView, label: 'Manage Products', icon: FaBox },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'
          } bg-psse-primary text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo/Header */}
        <div className="p-4 border-b border-psse-light">
          <h1 className={`font-bold ${sidebarOpen ? 'text-xl' : 'text-sm text-center'}`}>
            {sidebarOpen ? 'PSSE Admin' : 'PSSE'}
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === item.id
                ? 'bg-psse-accent text-white'
                : 'text-gray-200 hover:bg-psse-light'
                }`}
            >
              <item.icon className="text-lg shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Toggle & Logout */}
        <div className="p-4 border-t border-psse-light space-y-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full px-4 py-2 text-sm text-gray-200 hover:bg-psse-light rounded-lg transition-colors"
          >
            {sidebarOpen ? '← Collapse' : '→'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
          >
            <FaSignOutAlt />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Events View */}
        {currentView === 'events' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Manage Events</h2>
              <Button onClick={openAddEventModal}>
                <FaPlus className="mr-2" />
                Add Event
              </Button>
            </div>

            {eventsLoading ? (
              <div className="flex items-center justify-center py-12">
                <FaSpinner className="animate-spin text-3xl text-psse-accent" />
              </div>
            ) : eventsError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                {eventsError}
                <button onClick={loadEvents} className="ml-2 underline">
                  Retry
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {events.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          No events found. Click "Add Event" to create one.
                        </td>
                      </tr>
                    ) : (
                      events.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {event.imageUrl && (
                                <img
                                  src={event.imageUrl}
                                  alt={event.title}
                                  className="w-10 h-10 rounded-lg object-cover mr-3"
                                />
                              )}
                              <div>
                                <div className="font-medium text-gray-900">
                                  {event.title}
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {event.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDate(event.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {event.location}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${event.isUpcoming
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                              {event.isUpcoming ? 'Upcoming' : 'Past'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => openEditEventModal(event)}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <FaEdit className="mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event)}
                              className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <FaTrash className="mr-1" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Orders View */}
        {currentView === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">View Orders</h2>
              <button
                onClick={loadOrders}
                className="px-4 py-2 text-sm text-psse-accent hover:bg-psse-accent/10 rounded-lg transition-colors"
              >
                Refresh
              </button>
            </div>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-12">
                <FaSpinner className="animate-spin text-3xl text-psse-accent" />
              </div>
            ) : ordersError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                {ordersError}
                <button onClick={loadOrders} className="ml-2 underline">
                  Retry
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Proof
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          No orders found.
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => {
                        // Check if order needs review (awaiting payment with proof uploaded)
                        const needsReview = order.status === OrderStatus.PAID && order.paymentProofUrl;

                        return (
                          <tr
                            key={order.id}
                            className={`hover:bg-gray-50 ${needsReview
                              ? 'bg-amber-50 border-l-4 border-l-amber-500'
                              : ''
                              }`}
                          >
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              #{order.id}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {order.customerName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.customerEmail}
                              </div>
                              <div className="text-xs text-gray-400">
                                ID: {order.studentId}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {order.orderItems?.length || 0} item(s)
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {formatCurrency(order.totalAmount)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {formatDate(order.createdAt)}
                            </td>
                            <td className="px-6 py-4">
                              {order.paymentProofUrl ? (
                                <div className="flex items-center gap-2">
                                  <a
                                    href={order.paymentProofUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative"
                                  >
                                    <img
                                      src={order.paymentProofUrl}
                                      alt="Payment Proof"
                                      className="w-10 h-10 object-cover rounded border border-gray-300 hover:border-psse-accent transition-colors"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                      <FaExternalLinkAlt className="text-white text-xs" />
                                    </div>
                                  </a>
                                  {needsReview && (
                                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                                      <FaExclamationCircle className="text-amber-600" />
                                      Review
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="flex items-center gap-1 text-sm text-gray-400">
                                  <FaImage className="text-gray-300" />
                                  No proof
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {updatingOrderId === order.id ? (
                                  <FaSpinner className="animate-spin text-psse-accent" />
                                ) : order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED ? (
                                  // Locked status - display as badge (cannot be changed)
                                  <span
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${order.status === OrderStatus.COMPLETED
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                      }`}
                                  >
                                    {order.status === OrderStatus.COMPLETED ? 'Completed' : 'Cancelled'}
                                    <span className="ml-1 text-xs opacity-60">(Final)</span>
                                  </span>
                                ) : (
                                  // Editable status dropdown
                                  <select
                                    value={order.status}
                                    onChange={(e) =>
                                      handleOrderStatusChange(
                                        order.id,
                                        e.target.value as OrderStatus
                                      )
                                    }
                                    className="block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
                                  >
                                    {ORDER_STATUS_OPTIONS.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
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
              </div>
            )}
          </div>
        )}

        {/* Officers View */}
        {currentView === 'officers' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Update Officers</h2>
              <Button onClick={openAddOfficerModal}>
                <FaPlus className="mr-2" />
                Add Officer
              </Button>
            </div>

            {officersLoading ? (
              <div className="flex items-center justify-center py-12">
                <FaSpinner className="animate-spin text-3xl text-psse-accent" />
              </div>
            ) : officersError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                {officersError}
                <button onClick={loadOfficers} className="ml-2 underline">
                  Retry
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Photo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Academic Year
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {officers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          No officers found. Click "Add Officer" to create one.
                        </td>
                      </tr>
                    ) : (
                      officers.map((officer) => (
                        <tr key={officer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            {officer.photoUrl ? (
                              <img
                                src={officer.photoUrl}
                                alt={officer.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <FaUsers className="text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {officer.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {officer.position}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {officer.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {officer.academicYear}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => openEditOfficerModal(officer)}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <FaEdit className="mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteOfficer(officer)}
                              className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <FaTrash className="mr-1" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Products View */}
        {currentView === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Manage Products</h2>
              <Button onClick={openAddProductModal}>
                <FaPlus className="mr-2" />
                Add Product
              </Button>
            </div>

            {productsLoading ? (
              <div className="flex items-center justify-center py-12">
                <FaSpinner className="animate-spin text-3xl text-psse-accent" />
              </div>
            ) : productsError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                {productsError}
                <button onClick={loadProducts} className="ml-2 underline">
                  Retry
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Featured
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          No products found. Click "Add Product" to create one.
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {product.imageUrl && (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-12 h-12 rounded-lg object-cover mr-3"
                                />
                              )}
                              <div>
                                <div className="font-medium text-gray-900">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {product.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {formatCurrency(product.price)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${Number(product.stock) > 10
                                ? 'bg-green-100 text-green-800'
                                : Number(product.stock) > 0
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                                }`}
                            >
                              {product.stock} in stock
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${product.isFeatured
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                              {product.isFeatured ? 'Featured' : 'Not Featured'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => openEditProductModal(product)}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <FaEdit className="mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product)}
                              className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <FaTrash className="mr-1" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Event Modal */}
      <Modal
        isOpen={showEventModal}
        onClose={closeEventModal}
        title={editingEvent ? 'Edit Event' : 'Add New Event'}
        size="lg"
      >
        <form onSubmit={handleEventSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={eventForm.title}
              onChange={handleEventFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
              placeholder="Event title"
            />
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date *
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              value={eventForm.date}
              onChange={handleEventFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={eventForm.description}
              onChange={handleEventFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent resize-none"
              placeholder="Event description"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Event Image {!editingEvent && '*'}
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              required={!editingEvent}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedImageFile(file);
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setImagePreview(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                } else {
                  setSelectedImageFile(null);
                  setImagePreview(editingEvent?.imageUrl || null);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-psse-accent file:text-white hover:file:bg-psse-accent/90"
            />
            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                />
              </div>
            )}
            {editingEvent && !selectedImageFile && (
              <p className="mt-1 text-sm text-gray-500">
                Leave empty to keep existing image
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Location *
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              value={eventForm.location}
              onChange={handleEventFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
              placeholder="Event location"
            />
          </div>

          {/* Is Upcoming */}
          <div className="flex items-center gap-2">
            <input
              id="isUpcoming"
              name="isUpcoming"
              type="checkbox"
              checked={eventForm.isUpcoming}
              onChange={(e) =>
                setEventForm((prev) => ({ ...prev, isUpcoming: e.target.checked }))
              }
              className="w-4 h-4 text-psse-accent border-gray-300 rounded focus:ring-psse-accent"
            />
            <label htmlFor="isUpcoming" className="text-sm text-gray-700">
              Mark as upcoming event
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={closeEventModal}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={eventSubmitting}
            >
              Cancel
            </button>
            <Button type="submit" disabled={eventSubmitting}>
              {eventSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Saving...
                </>
              ) : editingEvent ? (
                'Update Event'
              ) : (
                'Create Event'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Officer Modal */}
      <Modal
        isOpen={showOfficerModal}
        onClose={closeOfficerModal}
        title={editingOfficer ? 'Edit Officer' : 'Add New Officer'}
        size="lg"
      >
        <form onSubmit={handleOfficerSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="officer-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name *
            </label>
            <input
              id="officer-name"
              name="name"
              type="text"
              required
              value={officerForm.name}
              onChange={handleOfficerFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
              placeholder="Officer name"
            />
          </div>

          {/* Position */}
          <div>
            <label
              htmlFor="officer-position"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Position *
            </label>
            <input
              id="officer-position"
              name="position"
              type="text"
              required
              value={officerForm.position}
              onChange={handleOfficerFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
              placeholder="e.g., President, Vice President, Secretary"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="officer-category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category *
            </label>
            <select
              id="officer-category"
              name="category"
              required
              value={officerForm.category}
              onChange={handleOfficerFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
            >
              {OFFICER_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year */}
          <div>
            <label
              htmlFor="officer-academicYear"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Academic Year *
            </label>
            <input
              id="officer-academicYear"
              name="academicYear"
              type="text"
              required
              value={officerForm.academicYear}
              onChange={handleOfficerFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
              placeholder="e.g., 2024-2025"
            />
          </div>

          {/* Order */}
          <div>
            <label
              htmlFor="officer-order"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Display Order (Higher numbers appear later)
            </label>
            <input
              id="officer-order"
              name="order"
              type="number"
              min="0"
              value={officerForm.order}
              onChange={handleOfficerFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label
              htmlFor="officer-photo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Photo {!editingOfficer && '*'}
            </label>
            <input
              id="officer-photo"
              name="photo"
              type="file"
              accept="image/*"
              required={!editingOfficer}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedOfficerPhotoFile(file);
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setOfficerPhotoPreview(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                } else {
                  setSelectedOfficerPhotoFile(null);
                  setOfficerPhotoPreview(editingOfficer?.photoUrl || null);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-psse-accent file:text-white hover:file:bg-psse-accent/90"
            />
            {editingOfficer && !selectedOfficerPhotoFile && (
              <p className="mt-2 text-sm text-gray-500">
                Leave empty to keep existing photo
              </p>
            )}
            {officerPhotoPreview && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  {selectedOfficerPhotoFile ? 'New Photo Preview' : 'Current Photo'}
                </span>
                <img
                  src={officerPhotoPreview}
                  alt="Photo preview"
                  className="w-24 h-24 object-cover rounded-full border-4 border-gray-200 shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={closeOfficerModal}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={officerSubmitting}
            >
              Cancel
            </button>
            <Button type="submit" disabled={officerSubmitting}>
              {officerSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Saving...
                </>
              ) : editingOfficer ? (
                'Update Officer'
              ) : (
                'Create Officer'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Product Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={closeProductModal}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={handleProductSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Product Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={productForm.name}
              onChange={handleProductFormChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
              placeholder="Enter product name"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={productForm.description}
              onChange={handleProductFormChange}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
              placeholder="Enter product description"
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Price (₱)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={productForm.price}
                onChange={handleProductFormChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Stock
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={productForm.stock}
                onChange={handleProductFormChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              value={productForm.category}
              onChange={handleProductFormChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent"
            >
              {PRODUCT_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Featured */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={productForm.isFeatured}
              onChange={handleProductFormChange}
              className="w-4 h-4 text-psse-accent border-gray-300 rounded focus:ring-psse-accent"
            />
            <label
              htmlFor="isFeatured"
              className="text-sm font-medium text-gray-700"
            >
              Featured Product
            </label>
          </div>

          {/* Image Upload */}
          <div>
            <label
              htmlFor="productImage"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Product Image {!editingProduct && <span className="text-red-500">*</span>}
            </label>
            <input
              type="file"
              id="productImage"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedProductImageFile(file);
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setProductImagePreview(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                } else {
                  setSelectedProductImageFile(null);
                  setProductImagePreview(editingProduct?.imageUrl || null);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-psse-accent file:text-white hover:file:bg-psse-accent/90"
            />
            {editingProduct && !selectedProductImageFile && (
              <p className="mt-2 text-sm text-gray-500">
                Leave empty to keep existing image
              </p>
            )}
            {productImagePreview && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  {selectedProductImageFile ? 'New Image Preview' : 'Current Image'}
                </span>
                <img
                  src={productImagePreview}
                  alt="Product preview"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={closeProductModal}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={productSubmitting}
            >
              Cancel
            </button>
            <Button type="submit" disabled={productSubmitting}>
              {productSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Saving...
                </>
              ) : editingProduct ? (
                'Update Product'
              ) : (
                'Create Product'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
