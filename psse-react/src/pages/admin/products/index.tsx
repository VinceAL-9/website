import { createContext, useContext, useState, useMemo, useEffect, useRef, type FormEvent, type ReactNode } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import { Button, Filter, Modal } from '../../../components/common';
import { productsApi } from '../../../services/api';
import type { ApiProduct } from '../../../types/api.types';
import { Category } from '../../../types/api.types';
import { useProducts, initialProductForm, type ProductFormData } from './useProducts';
import { useScrollPagination } from '../../../hooks/useScrollPagination';

const PRODUCT_CATEGORY_OPTIONS = [{ value: Category.LANYARD, label: 'Lanyard' }, { value: Category.TSHIRT, label: 'T-Shirt' }, { value: Category.STICKER, label: 'Sticker' }];

interface ProductsContextType {
    products: ApiProduct[];
    loading: boolean;
    error: string | null;
    loadProducts: () => Promise<void>;
    showProductModal: boolean;
    closeProductModal: () => void;
    handleProductSubmit: (e: FormEvent) => Promise<void>;
    productForm: ProductFormData;
    setProductForm: React.Dispatch<React.SetStateAction<ProductFormData>>;
    editingProduct: ApiProduct | null;
    productSubmitting: boolean;
    setSelectedProductImageFile: React.Dispatch<React.SetStateAction<File | null>>;
    productImagePreview: string | null;
    setProductImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
    openEditProductModal: (product: ApiProduct) => void;
    handleDeleteProduct: (product: ApiProduct) => Promise<void>;
    openAddProductModal: () => void;
    productCategoryFilter: string;
    setProductCategoryFilter: React.Dispatch<React.SetStateAction<string>>;
    productFeaturedFilter: string;
    setProductFeaturedFilter: React.Dispatch<React.SetStateAction<string>>;
    displayedProducts: ApiProduct[];
    hasMore: boolean;
    loadMore: () => void;
}

const ProductsContext = createContext<ProductsContextType | null>(null);

export const ProductsHeader = () => {
  const context = useContext(ProductsContext);
  if (!context) return null;
  const { openAddProductModal, productCategoryFilter, setProductCategoryFilter, productFeaturedFilter, setProductFeaturedFilter } = context;
  return (
    <div className="sticky top-0 z-10 bg-gray-100 border-b border-gray-200 py-4 px-6 flex justify-between items-center gap-3 w-full">
        <h2 className="text-xl font-bold text-gray-800">Manage Products</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Filter label="Category" options={[{ label: 'All Categories', value: 'all' }, ...PRODUCT_CATEGORY_OPTIONS]} selected={productCategoryFilter} onFilterChange={setProductCategoryFilter} className="w-48" />
          <Filter label="Featured" options={[{ label: 'All', value: 'all' }, { label: 'Featured', value: 'featured' }, { label: 'Not Featured', value: 'not_featured' }]} selected={productFeaturedFilter} onFilterChange={setProductFeaturedFilter} className="w-48" />
          <Button onClick={openAddProductModal}><FaPlus className="mr-2" /> Add Product</Button>
        </div>
      </div>
  );
};

export const ProductsContent = () => {
    const context = useContext(ProductsContext);
    if (!context) return null;
    const { displayedProducts, loading, error, loadProducts, showProductModal, closeProductModal, handleProductSubmit, productForm, setProductForm, editingProduct, productSubmitting, openEditProductModal, handleDeleteProduct, setSelectedProductImageFile, productImagePreview, setProductImagePreview, hasMore, loadMore } = context;

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
    if (error) return <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">{error}<button onClick={loadProducts} className="ml-2 underline">Retry</button></div>;

    return (
        <div ref={containerRef} className="p-6 space-y-6 bg-white rounded-xl shadow-sm overflow-y-auto max-h-[80vh]">
            <table className="w-full">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-200">
                    {displayedProducts.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No products found.</td></tr>
                    ) : (
                    displayedProducts.map((product: ApiProduct) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4"><div className="flex items-center">{product.imageUrl && <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover mr-3" />}<div><div className="font-medium">{product.name}</div><div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div></div></div></td>
                        <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{product.category}</span></td>
                        <td className="px-6 py-4 font-medium">₱{Number(product.price).toFixed(2)}</td>
                        <td className="px-6 py-4">{product.stock}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${product.isFeatured ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>{product.isFeatured ? 'Featured' : 'Not Featured'}</span></td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => openEditProductModal(product)} className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"><FaEdit className="mr-1" /> Edit</button>
                          <button onClick={() => handleDeleteProduct(product)} className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><FaTrash className="mr-1" /> Delete</button>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
                {hasMore && <div className="py-4 text-center text-gray-500">Loading more...</div>}
            <Modal isOpen={showProductModal} onClose={closeProductModal} title={editingProduct ? 'Edit Product' : 'Add New Product'} size="lg">
                <form onSubmit={handleProductSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" required value={productForm.name} onChange={(e) => setProductForm((prev: ProductFormData) => ({...prev, name: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent" placeholder="Product name" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Description *</label><textarea required value={productForm.description} onChange={(e) => setProductForm((prev: ProductFormData) => ({...prev, description: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent" /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Price *</label><input type="number" required value={productForm.price} onChange={(e) => setProductForm((prev: ProductFormData) => ({...prev, price: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label><input type="number" required value={productForm.stock} onChange={(e) => setProductForm((prev: ProductFormData) => ({...prev, stock: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Category *</label><select required value={productForm.category} onChange={(e) => setProductForm((prev: ProductFormData) => ({...prev, category: e.target.value as Category}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent">{PRODUCT_CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo {!editingProduct && '*'}</label>
                  <input type="file" accept="image/*" required={!editingProduct} onChange={(e) => { const file = e.target.files?.[0]; if (file) { setSelectedProductImageFile(file); const reader = new FileReader(); reader.onloadend = () => setProductImagePreview(reader.result as string); reader.readAsDataURL(file); } else { setSelectedProductImageFile(null); setProductImagePreview(editingProduct?.imageUrl || null); } }} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-psse-accent focus:border-transparent" />
                  {productImagePreview && <div className="mt-4 flex flex-col items-center gap-2"><img src={productImagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border-4 border-gray-200" /></div>}
                </div>
                <div className="flex items-center gap-2"><input type="checkbox" checked={productForm.isFeatured} onChange={(e) => setProductForm((prev: ProductFormData) => ({...prev, isFeatured: e.target.checked}))} className="rounded text-psse-accent focus:ring-psse-accent" /><label className="text-sm font-medium text-gray-700">Featured</label></div>
                <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={closeProductModal} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg" disabled={productSubmitting}>Cancel</button><Button type="submit" disabled={productSubmitting}>{productSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}</Button></div>
                </form>
            </Modal>
        </div>
    );
};


export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const { products, loading, error, loadProducts } = useProducts();
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);
  const [productForm, setProductForm] = useState<ProductFormData>(initialProductForm);
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [selectedProductImageFile, setSelectedProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productFeaturedFilter, setProductFeaturedFilter] = useState('all');

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (productCategoryFilter !== 'all') filtered = filtered.filter((p) => p.category === productCategoryFilter);
    if (productFeaturedFilter !== 'all') filtered = filtered.filter((p) => p.isFeatured === (productFeaturedFilter === 'featured'));
    return filtered;
  }, [products, productCategoryFilter, productFeaturedFilter]);

  const { displayedItems: displayedProducts, hasMore, loadMore, reset: resetPagination } = useScrollPagination(filteredProducts);

  useEffect(() => {
    resetPagination();
  }, [filteredProducts, resetPagination]);

  const openAddProductModal = () => { setEditingProduct(null); setProductForm(initialProductForm); setSelectedProductImageFile(null); setProductImagePreview(null); setShowProductModal(true); };
  const openEditProductModal = (product: ApiProduct) => { setEditingProduct(product); setProductForm({ name: product.name, description: product.description, price: String(product.price), stock: String(product.stock), category: product.category, isFeatured: product.isFeatured }); setSelectedProductImageFile(null); setProductImagePreview(product.imageUrl); setShowProductModal(true); };
  const closeProductModal = () => { setShowProductModal(false); setEditingProduct(null); setProductForm(initialProductForm); setSelectedProductImageFile(null); setProductImagePreview(null); };

  const handleProductSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProductSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', productForm.name); formData.append('description', productForm.description); formData.append('price', productForm.price); formData.append('stock', productForm.stock); formData.append('category', productForm.category); formData.append('isFeatured', productForm.isFeatured.toString());
      if (selectedProductImageFile) formData.append('image', selectedProductImageFile);
      if (editingProduct) await productsApi.updateProduct(editingProduct.id, formData);
      else { if (!selectedProductImageFile) { alert('Please select an image.'); setProductSubmitting(false); return; } await productsApi.createProduct(formData); }
      closeProductModal(); loadProducts();
    } catch (err) { console.error('Error saving product:', err); alert('Failed to save.'); } finally { setProductSubmitting(false); }
  };

  const handleDeleteProduct = async (product: ApiProduct) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try { await productsApi.deleteProduct(product.id); loadProducts(); } catch (err: unknown) {
      const error = err as { response?: { status?: number, data?: { message?: string } }, message?: string };
      if (error.response?.status !== 401) alert(`Failed to delete: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <ProductsContext.Provider value={{ products, loading, error, loadProducts, showProductModal, closeProductModal, handleProductSubmit, productForm, setProductForm, editingProduct, productSubmitting, setSelectedProductImageFile, productImagePreview, setProductImagePreview, openEditProductModal, handleDeleteProduct, openAddProductModal, productCategoryFilter, setProductCategoryFilter, productFeaturedFilter, setProductFeaturedFilter, displayedProducts, hasMore, loadMore }}>
        {children}
    </ProductsContext.Provider>
  );
};

export const ProductsView = () => {
  return (
    <ProductsProvider>
        <ProductsHeader />
        <div className="mt-6">
            <ProductsContent />
        </div>
    </ProductsProvider>
  );
};
