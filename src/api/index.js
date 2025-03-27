// src/api/index.js
import apiClient, { apiService } from './apiClient';
import contactsService from './contactsService';

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
const conversationsService = createPlaceholderService('conversations');
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

// Agent settings service
const agentSettingsService = {
  getAgentSettings: async (pageId = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get('/agent-settings', { 
        params: { page_id: pageId, page_size: pageSize }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching agent settings:', error);
      throw error;
    }
  },
  
  getAgentSettingById: async (id) => {
    try {
      const response = await apiClient.get(`/agent-settings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching agent setting ${id}:`, error);
      throw error;
    }
  },
  
  getAgentSettingByType: async (agentType) => {
    try {
      const response = await apiClient.get(`/agent-settings/type/${agentType}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching agent setting for type ${agentType}:`, error);
      throw error;
    }
  },
  
  createAgentSetting: async (settingData) => {
    try {
      const response = await apiClient.post('/agent-settings', settingData);
      return response.data;
    } catch (error) {
      console.error('Error creating agent setting:', error);
      throw error;
    }
  },
  
  updateAgentSetting: async (agentType, settingData) => {
    try {
      const response = await apiClient.put(`/agent-settings/type/${agentType}`, settingData);
      return response.data;
    } catch (error) {
      console.error(`Error updating agent setting for type ${agentType}:`, error);
      throw error;
    }
  },
  
  toggleAgent: async (agentId, isActive) => {
    try {
      const response = await apiClient.post('/agents/toggle', { agent_id: agentId, is_active: isActive });
      return response.data;
    } catch (error) {
      console.error(`Error toggling agent ${agentId}:`, error);
      throw error;
    }
  },
  
  testAgentEmail: async (agentId, emailData) => {
    try {
      const response = await apiClient.post('/agents/test-email', {
        agent_id: agentId,
        ...emailData
      });
      return response.data;
    } catch (error) {
      console.error(`Error testing agent email for agent ${agentId}:`, error);
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
  conversationsService,
  meetingsService,
  salesFlowsService,
  authService,
  agentSettingsService,
  healthCheck
};