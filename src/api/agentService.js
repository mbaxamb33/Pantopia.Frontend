// src/api/agentService.js
import apiClient from './apiClient';

export const agentService = {
  // Get all agent settings
  getAgentSettings: async (pageId = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`/agent-settings?page_id=${pageId}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching agent settings:', error);
      throw error;
    }
  },
  
  // Get a specific agent setting by ID
  getAgentSetting: async (id) => {
    try {
      const response = await apiClient.get(`/agent-settings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching agent setting ${id}:`, error);
      throw error;
    }
  },
  
  // Get agent setting by type
  getAgentSettingByType: async (agentType) => {
    try {
      const response = await apiClient.get(`/agent-settings/type/${agentType}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching agent setting for type ${agentType}:`, error);
      throw error;
    }
  },
  
  // Create a new agent setting
  createAgentSetting: async (agentData) => {
    try {
      const response = await apiClient.post('/agent-settings', agentData);
      return response.data;
    } catch (error) {
      console.error('Error creating agent setting:', error);
      throw error;
    }
  },
  
  // Update an existing agent setting
  updateAgentSetting: async (agentType, agentData) => {
    try {
      const response = await apiClient.put(`/agent-settings/type/${agentType}`, agentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating agent setting for type ${agentType}:`, error);
      throw error;
    }
  },
  
  // Delete an agent setting
  deleteAgentSetting: async (id) => {
    try {
      const response = await apiClient.delete(`/agent-settings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting agent setting ${id}:`, error);
      throw error;
    }
  },
  
  // Toggle agent on/off
  toggleAgent: async (agentId, isActive) => {
    try {
      const response = await apiClient.post('/agents/toggle', {
        agent_id: agentId,
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      console.error(`Error toggling agent ${agentId}:`, error);
      throw error;
    }
  },
  
  // Test an agent with an email
  testAgent: async (agentId, emailData) => {
    try {
      const response = await apiClient.post('/agents/test-email', {
        agent_id: agentId,
        from_email: emailData.fromEmail,
        subject: emailData.subject,
        email_body: emailData.emailBody,
        simulate_now: emailData.simulateNow || true
      });
      return response.data;
    } catch (error) {
      console.error(`Error testing agent ${agentId}:`, error);
      throw error;
    }
  },
  
  // Test agent with mock email (new method using the email testing endpoint)
  testAgentWithMockEmail: async (agentId, emailData) => {
    try {
      const response = await apiClient.post('/api/test/mock-email', {
        agent_id: agentId,
        from_email: emailData.fromEmail,
        to_email: emailData.toEmail || '',
        subject: emailData.subject,
        body: emailData.body,
        simulate_now: emailData.simulateNow
      });
      return response.data;
    } catch (error) {
      console.error(`Error testing agent with mock email ${agentId}:`, error);
      throw error;
    }
  },
  
  // Get recent agent actions
  getRecentAgentActions: async (agentId, limit = 10) => {
    try {
      const response = await apiClient.get(`/api/agents/${agentId}/recent-actions?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching recent actions for agent ${agentId}:`, error);
      throw error;
    }
  },
  
  // Get agent actions
  getAgentActions: async (filters = {}, pageId = 1, pageSize = 10) => {
    try {
      let url = `/agent-actions?page_id=${pageId}&page_size=${pageSize}`;
      
      if (filters.agentId) {
        url += `&agent_id=${filters.agentId}`;
      }
      
      if (filters.conversationId) {
        url += `&conversation_id=${filters.conversationId}`;
      }
      
      if (filters.actionType) {
        url += `&action_type=${filters.actionType}`;
      }
      
      if (filters.status) {
        url += `&status=${filters.status}`;
      }
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching agent actions:', error);
      throw error;
    }
  }
};

export default agentService;