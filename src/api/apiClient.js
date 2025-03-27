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
  console.error('API Error:', error);
  
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
      // Don't add token to auth-related endpoints
      if (config.url.includes('/login') || config.url.includes('/signup') || config.url.includes('/refresh-token')) {
        return config;
      }

      // Get the access token (from context via the passed function)
      const token = getAccessToken();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for token refresh
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If the error is 401 and we haven't tried to refresh the token yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Try to refresh the token
          const newToken = await refreshAccessToken();
          
          if (newToken) {
            // Update the request with the new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            // Retry the request with the new token
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, log the user out
          console.error('Token refresh failed:', refreshError);
          logout();
          return Promise.reject(refreshError);
        }
      }
      
      // Return the original error for all other cases
      return Promise.reject(error);
    }
  );
};

// Export as both default and named export for flexibility
export default apiClient;
export const apiService = apiClient;