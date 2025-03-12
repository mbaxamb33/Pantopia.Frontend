// src/api/usersService.js
import apiClient from './apiClient';

export const usersService = {
  // Get current authenticated user
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },
  
  // Update current user
  updateCurrentUser: async (userData) => {
    try {
      const response = await apiClient.put('/users/me', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating current user:', error);
      throw error;
    }
  },
  
  // Get agent settings
  getAgentSettings: async (agentType) => {
    try {
      const response = await apiClient.get(`/agent-settings/${agentType}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching agent settings for ${agentType}:`, error);
      throw error;
    }
  },
  
  // Create agent settings
  createAgentSettings: async (settingsData) => {
    try {
      const response = await apiClient.post('/agent-settings', settingsData);
      return response.data;
    } catch (error) {
      console.error('Error creating agent settings:', error);
      throw error;
    }
  },
  
  // Update agent settings
  updateAgentSettings: async (agentType, settingsData) => {
    try {
      const response = await apiClient.put(`/agent-settings/${agentType}`, settingsData);
      return response.data;
    } catch (error) {
      console.error(`Error updating agent settings for ${agentType}:`, error);
      throw error;
    }
  },
  
  // List all agent settings
  listAgentSettings: async (pageId = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`/agent-settings?page_id=${pageId}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching agent settings:', error);
      throw error;
    }
  }
};