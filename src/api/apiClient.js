// src/api/apiClient.js
import axios from 'axios';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: '/api', // This will use the proxy from vite.config.js
  headers: {
    'Content-Type': 'application/json',
  },
});

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
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, log the user out
          logout();
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
};

export default apiClient;