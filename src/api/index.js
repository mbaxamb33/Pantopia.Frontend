// src/api/index.js
import { apiService } from './apiClient';
import contactsService from './contactsService';

// Create a placeholder service for other entity types that will be fully implemented later
const createPlaceholderService = (basePath) => ({
  getAll: async (pageId = 1, pageSize = 10) => 
    await apiService.get(`/${basePath}`, { page_id: pageId, page_size: pageSize }),
  
  getById: async (id) => 
    await apiService.get(`/${basePath}/${id}`),
  
  create: async (data) => 
    await apiService.post(`/${basePath}`, data),
  
  update: async (id, data) => 
    await apiService.put(`/${basePath}/${id}`, data),
  
  delete: async (id) => 
    await apiService.delete(`/${basePath}/${id}`)
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
      return await apiService.get('/users/me');
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },
  
  updateUser: async (userData) => {
    try {
      return await apiService.put('/users/me', userData);
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
      return await apiService.get('/agent-settings', { page_id: pageId, page_size: pageSize });
    } catch (error) {
      console.error('Error fetching agent settings:', error);
      throw error;
    }
  },
  
  getAgentSettingById: async (id) => {
    try {
      return await apiService.get(`/agent-settings/${id}`);
    } catch (error) {
      console.error(`Error fetching agent setting ${id}:`, error);
      throw error;
    }
  },
  
  getAgentSettingByType: async (agentType) => {
    try {
      return await apiService.get(`/agent-settings/type/${agentType}`);
    } catch (error) {
      console.error(`Error fetching agent setting for type ${agentType}:`, error);
      throw error;
    }
  },
  
  createAgentSetting: async (settingData) => {
    try {
      return await apiService.post('/agent-settings', settingData);
    } catch (error) {
      console.error('Error creating agent setting:', error);
      throw error;
    }
  },
  
  updateAgentSetting: async (agentType, settingData) => {
    try {
      return await apiService.put(`/agent-settings/type/${agentType}`, settingData);
    } catch (error) {
      console.error(`Error updating agent setting for type ${agentType}:`, error);
      throw error;
    }
  },
  
  toggleAgent: async (agentId, isActive) => {
    try {
      return await apiService.post('/agents/toggle', { agent_id: agentId, is_active: isActive });
    } catch (error) {
      console.error(`Error toggling agent ${agentId}:`, error);
      throw error;
    }
  },
  
  testAgentEmail: async (agentId, emailData) => {
    try {
      return await apiService.post('/agents/test-email', {
        agent_id: agentId,
        ...emailData
      });
    } catch (error) {
      console.error(`Error testing agent email for agent ${agentId}:`, error);
      throw error;
    }
  }
};

// Health check function
const healthCheck = async () => {
  try {
    return await apiService.get('/health');
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export {
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