// src/api/index.js
import apiClient, { apiService } from './apiClient';
import contactsService from './contactsService';
import { conversationsService } from './conversationsService';
import { agentService } from './agentService';  // Add this line
import productsService from './productsService';

// Create a placeholder service for other entity types that will be fully implemented later
const createPlaceholderService = (basePath) => ({
  getAll: async (pageId = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`/${basePath}`, { 
        params: { page_id: pageId, page_size: pageSize }
      });
      return response.data;
    } catch (error) {
      console.error(`Error in ${basePath} getAll:`, error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/${basePath}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error in ${basePath} getById:`, error);
      throw error;
    }
  },
  
  create: async (data) => {
    try {
      const response = await apiClient.post(`/${basePath}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error in ${basePath} create:`, error);
      throw error;
    }
  },
  
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/${basePath}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error in ${basePath} update:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/${basePath}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error in ${basePath} delete:`, error);
      throw error;
    }
  }
});

// Placeholder services for other entities
const companiesService = createPlaceholderService('companies');
const projectsService = createPlaceholderService('projects');
// const conversationsService = createPlaceholderService('conversations');  // Comment this out
const meetingsService = createPlaceholderService('meeting-records');
const salesFlowsService = createPlaceholderService('sales-flows');

// Auth related services
const authService = {
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },
  
  updateUser: async (userData) => {
    try {
      const response = await apiClient.put('/users/me', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
};

// Health check function
const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export {
  apiClient,
  apiService,
  contactsService,
  companiesService,
  projectsService,
  agentService,
  conversationsService,
  meetingsService,
  salesFlowsService,
  authService,
  productsService,
  healthCheck
};