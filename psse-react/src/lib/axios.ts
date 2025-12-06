import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check for both admin and user tokens
    const adminToken = localStorage.getItem('access_token');
    const userToken = localStorage.getItem('user_access_token');
    const token = adminToken || userToken;
    
    if (token && token !== 'undefined') {
      if (!config.headers) {
        config.headers = {} as any;
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract error message from backend API response
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data?.error ||
      error.message || 
      'An unexpected error occurred';
    
    // Show error toast
    toast.error(errorMessage);
    
    // Handle 401 Unauthorized - clear tokens but let the component handle redirect
    if (error.response?.status === 401) {
      console.error('401 Unauthorized error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: errorMessage,
        hasAuthHeader: !!error.config?.headers?.Authorization,
      });
      // Clear both tokens on 401
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_access_token');
      // Don't redirect automatically - let the login component handle it
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
