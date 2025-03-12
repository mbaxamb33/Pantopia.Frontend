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
  },
  
  // Get messages for a conversation
  getMessages: async (conversationId, pageId = 1, pageSize = 50) => {
    try {
      const response = await apiClient.get(`/conversations/${conversationId}/messages?page_id=${pageId}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching messages for conversation ${conversationId}:`, error);
      throw error;
    }
  },
  
  // Create a new message in a conversation
  createMessage: async (conversationId, messageData) => {
    try {
      const response = await apiClient.post(`/conversations/${conversationId}/messages`, messageData);
      return response.data;
    } catch (error) {
      console.error(`Error creating message in conversation ${conversationId}:`, error);
      throw error;
    }
  },
  
  // Mark a message as read
  markMessageRead: async (messageId) => {
    try {
      const response = await apiClient.put(`/messages/${messageId}/read`);
      return response.data;
    } catch (error) {
      console.error(`Error marking message ${messageId} as read:`, error);
      throw error;
    }
  },
  
  // Delete a message
  deleteMessage: async (messageId) => {
    try {
      const response = await apiClient.delete(`/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting message ${messageId}:`, error);
      throw error;
    }
  }
};