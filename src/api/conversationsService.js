// src/api/conversationsService.js
import apiClient from './apiClient';

export const conversationsService = {
  // Fetch list of conversations
  getConversations: async (pageId = 1, pageSize = 10, contactId = null) => {
    try {
      let url = `/conversations?page_id=${pageId}&page_size=${pageSize}`;
      if (contactId) {
        url += `&contact_id=${contactId}`;
      }
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },
  
  // Get a single conversation by ID
  getConversation: async (id) => {
    try {
      const response = await apiClient.get(`/conversations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching conversation ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new conversation
  createConversation: async (conversationData) => {
    try {
      const response = await apiClient.post('/conversations', conversationData);
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },
  
  // Update an existing conversation
  updateConversation: async (id, conversationData) => {
    try {
      const response = await apiClient.put(`/conversations/${id}`, conversationData);
      return response.data;
    } catch (error) {
      console.error(`Error updating conversation ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a conversation
  deleteConversation: async (id) => {
    try {
      const response = await apiClient.delete(`/conversations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting conversation ${id}:`, error);
      throw error;
    }
  }
};

export default conversationsService;