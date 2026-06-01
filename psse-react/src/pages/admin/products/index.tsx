import { createContext, useContext, useState, useMemo, type FormEvent, type ReactNode } from 'react';
import { FaPlus, FaSpinner } from 'react-icons/fa';
import { Button, Filter, Modal } from '../../../components/common';
import { productsApi } from '../../../services/api';
import type { ApiProduct } from '../../../types/api.types';
import { Category } from '../../../types/api.types';
import { useProducts, initialProductForm, type ProductFormData } from './useProducts';

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
    openEditProductModal: (product: ApiProduct) => void;
    handleDeleteProduct: (product: ApiProduct) => Promise<void>;
    openAddProductModal: () => void;
    productCategoryFilter: string;
    setProductCategoryFilter: React.Dispatch<React.SetStateAction<string>>;
    productFeaturedFilter: string;
    setProductFeaturedFilter: React.Dispatch<React.SetStateAction<string>>;
    filteredProducts: ApiProduct[];
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
    const { filteredProducts, loading, error, loadProducts, showProductModal, closeProductModal, handleProductSubmit, productForm, setProductForm, editingProduct, productSubmitting, openEditProductModal, handleDeleteProduct } = context;

    if (loading) return <div className="flex items-center justify-center py-12"><FaSpinner className="animate-spin text-3xl text-psse-accent" /></div>;
    if (error) return <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">{error}<button onClick={loadProducts} className="ml-2 underline">Retry</button></div>;

    return (
        <div className="p-6 space-y-6 bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-200">
                    {filteredProducts.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No products found.</td></tr>
                    ) : (
                    filteredProducts.map((product: ApiProduct) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4"><div className="flex items-center">{product.imageUrl && <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover mr-3" />}<div><div className="font-medium">{product.name}</div><div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div></div></div></td>
                        <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{product.category}</span></td>
                        <td className="px-6 py-4 font-medium">₱{Number(product.price).toFixed(2)}</td>
                        <td className="px-6 py-4">{product.stock}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${product.isFeatured ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>{product.isFeatured ? 'Featured' : 'Not Featured'}</span></td>
                        <td className="px-6 py-4 text-right space-x-2"><button onClick={() => openEditProductModal(product)} className="text-blue-600">Edit</button><button onClick={() => handleDeleteProduct(product)} className="text-red-600">Delete</button></td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            <Modal isOpen={showProductModal} onClose={closeProductModal} title={editingProduct ? 'Edit Product' : 'Add New Product'} size="lg">
                <form onSubmit={handleProductSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium">Name</label><input type="text" required value={productForm.name} onChange={(e) => setProductForm((prev: ProductFormData) => ({...prev, name: e.target.value}))} className="w-full px-4 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium">Description</label><textarea required value={productForm.description} onChange={(e) => setProductForm((prev: ProductFormData) => ({...prev, description: e.target.value}))} className="w-full px-4 py-2 border rounded-lg" /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium">Price</label><input type="number" required value={productForm.price} onChange={(e) => setProductForm((prev: ProductFormData) => ({...prev, price: e.target.value}))} className="w-full px-4 py-2 border rounded-lg" /></div>
                    <div><label className="block text-sm font-medium">Stock</label><input type="number" required value={productForm.stock} onChange={(e) => setProductForm((prev: ProductFormData) => ({...prev, stock: e.target.value}))} className="w-full px-4 py-2 border rounded-lg" /></div>
                </div>
                <div><label className="block text-sm font-medium">Category</label><select value={productForm.category} onChange={(e) => setProductForm((prev: ProductFormData) => ({...prev, category: e.target.value as Category}))} className="w-full px-4 py-2 border rounded-lg">{PRODUCT_CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                <div className="flex items-center gap-2"><input type="checkbox" checked={productForm.isFeatured} onChange={(e) => setProductForm((prev: ProductFormData) => ({...prev, isFeatured: e.target.checked}))} /><label>Featured</label></div>
                <div className="flex justify-end pt-4"><Button type="submit" disabled={productSubmitting}>{productSubmitting ? 'Saving...' : 'Save Product'}</Button></div>
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
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productFeaturedFilter, setProductFeaturedFilter] = useState('all');

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (productCategoryFilter !== 'all') filtered = filtered.filter((p) => p.category === productCategoryFilter);
    if (productFeaturedFilter !== 'all') filtered = filtered.filter((p) => p.isFeatured === (productFeaturedFilter === 'featured'));
    return filtered;
  }, [products, productCategoryFilter, productFeaturedFilter]);

  const openAddProductModal = () => { setEditingProduct(null); setProductForm(initialProductForm); setSelectedProductImageFile(null); setShowProductModal(true); };
  const openEditProductModal = (product: ApiProduct) => { setEditingProduct(product); setProductForm({ name: product.name, description: product.description, price: String(product.price), stock: String(product.stock), category: product.category, isFeatured: product.isFeatured }); setSelectedProductImageFile(null); setShowProductModal(true); };
  const closeProductModal = () => { setShowProductModal(false); setEditingProduct(null); setProductForm(initialProductForm); setSelectedProductImageFile(null); };

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
    <ProductsContext.Provider value={{ products, loading, error, loadProducts, showProductModal, closeProductModal, handleProductSubmit, productForm, setProductForm, editingProduct, productSubmitting, openEditProductModal, handleDeleteProduct, openAddProductModal, productCategoryFilter, setProductCategoryFilter, productFeaturedFilter, setProductFeaturedFilter, filteredProducts }}>
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
