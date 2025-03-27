// src/api/apiClient.js
import axios from 'axios';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: '/api', // This will use the proxy from vite.config.js
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Helper function to handle API responses
export const handleApiResponse = (response) => {
  if (response.data) {
    return response.data;
  }
  return response;
};

// Helper function to handle API errors
export const handleApiError = (error) => {
  // Log the error for debugging
  console.error('API Error:', {
    status: error.response?.status,
    data: error.response?.data,
    headers: error.response?.headers,
    message: error.message
  });
  
  // Create a standardized error object
  const errorResponse = {
    status: error.response?.status || 500,
    message: error.response?.data?.error || error.message || 'An unknown error occurred',
    details: error.response?.data?.details || {},
  };
  
  throw errorResponse;
};

// Add auth interceptor to dynamically add the auth token to requests
export const setupInterceptors = (getAccessToken, refreshAccessToken, logout) => {
  // Request interceptor
  apiClient.interceptors.request.use(
    async (config) => {
      // Enhanced logging for request configuration
      console.group('🚀 API Request Interceptor');
      console.log('Request URL:', config.url);
      console.log('Request Method:', config.method);

      // Don't add token to auth-related endpoints
      const isAuthRelatedEndpoint = 
        config.url.includes('/login') || 
        config.url.includes('/signup') || 
        config.url.includes('/refresh-token');

      if (isAuthRelatedEndpoint) {
        console.log('Skipping token for auth-related endpoint');
        console.groupEnd();
        return config;
      }

      // Get the access token (from context via the passed function)
      const token = getAccessToken();
      
      if (token) {
        // Detailed token logging (be careful in production)
        console.log('Token Status:', token ? 'Token Present' : 'No Token');
        
        // Truncate token for safe logging
        const logSafeToken = token.length > 10 
          ? `${token.substring(0, 5)}...${token.substring(token.length - 5)}` 
          : token;
        console.log('Token Preview:', logSafeToken);
        
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('⚠️ No access token available for request');
      }
      
      console.groupEnd();
      return config;
    },
    (error) => {
      console.error('Request Interceptor Error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for token refresh
  apiClient.interceptors.response.use(
    (response) => {
      // Log successful responses
      console.group('✅ API Response');
      console.log('URL:', response.config.url);
      console.log('Status:', response.status);
      console.groupEnd();
      return response;
    },
    async (error) => {
      console.group('❌ API Error Response');
      console.log('Error Details:', {
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method
      });

      const originalRequest = error.config;
      
      // If the error is 401 and we haven't tried to refresh the token yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        console.log('Attempting token refresh due to 401 error');
        originalRequest._retry = true;
        
        try {
          // Try to refresh the token
          const newToken = await refreshAccessToken();
          
          if (newToken) {
            console.log('Token refreshed successfully');
            
            // Update the request with the new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            // Retry the request with the new token
            console.log('Retrying original request');
            console.groupEnd();
            return apiClient(originalRequest);
          } else {
            console.log('Token refresh failed, logging out');
            logout();
            console.groupEnd();
            return Promise.reject(error);
          }
        } catch (refreshError) {
          // If refresh fails, log the user out
          console.error('Token refresh failed:', refreshError);
          logout();
          console.groupEnd();
          return Promise.reject(refreshError);
        }
      }
      
      console.groupEnd();
      // Return the original error for all other cases
      return Promise.reject(error);
    }
  );
};

// Export as both default and named export for flexibility
export default apiClient;
export const apiService = apiClient;