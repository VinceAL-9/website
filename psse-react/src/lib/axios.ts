import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import type { AuthResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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
        config.headers = {} as unknown as InternalAxiosRequestConfig['headers'];
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
  async (error) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const statusCode = error.response?.status;
    const requestUrl = originalRequest?.url || '';
    const isRefreshRequest = requestUrl.includes('/auth/refresh');
    const isLoginRequest = requestUrl.includes('/auth/login');

    if (statusCode === 401 && originalRequest && !originalRequest._retry && !isRefreshRequest && !isLoginRequest) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axiosInstance.post<AuthResponse>('/auth/refresh', {}, { withCredentials: true });
        const newAccessToken = refreshResponse.data.access_token;
        const adminToken = localStorage.getItem('access_token');
        const userToken = localStorage.getItem('user_access_token');
        const authHeader = originalRequest.headers?.Authorization as string | undefined;

        let tokenKey: 'access_token' | 'user_access_token' | null = null;
        if (authHeader && adminToken && authHeader.includes(adminToken)) {
          tokenKey = 'access_token';
        } else if (authHeader && userToken && authHeader.includes(userToken)) {
          tokenKey = 'user_access_token';
        } else if (adminToken) {
          tokenKey = 'access_token';
        } else if (userToken) {
          tokenKey = 'user_access_token';
        }

        if (tokenKey) {
          localStorage.setItem(tokenKey, newAccessToken);
        }

        originalRequest.headers = originalRequest.headers ?? ({} as unknown as InternalAxiosRequestConfig['headers']);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_access_token');
        return Promise.reject(refreshError);
      }
    }

    // Extract error message from backend API response
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data?.error ||
      error.message || 
      'An unexpected error occurred';
    
    if (!isRefreshRequest) {
      // Show error toast
      toast.error(errorMessage);
    }
    
    // Handle 401 Unauthorized - clear tokens but let the component handle redirect
    if (statusCode === 401) {
      console.error('401 Unauthorized error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: statusCode,
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
