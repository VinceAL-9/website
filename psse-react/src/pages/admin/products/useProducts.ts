import { useState, useEffect } from 'react';
import { productsApi } from '../../../services/api';
import type { ApiProduct } from '../../../types/api.types';
import { Category } from '../../../types/api.types';

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: Category;
  isFeatured: boolean;
}

export const initialProductForm: ProductFormData = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: Category.TSHIRT,
  isFeatured: false,
};

export const useProducts = () => {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsApi.getProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productsApi.getProducts();
        if (active) setProducts(data);
      } catch (err) {
        if (active) setError('Failed to load products. Please try again.');
        console.error('Error loading products:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProducts();
    return () => { active = false; };
  }, []);

  return { products, loading, error, loadProducts, setProducts };
};
