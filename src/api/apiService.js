// src/api/apiService.js
import apiClient from './apiClient';

// User-related API calls
export const userService = {
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }
};

// Contacts-related API calls
export const contactService = {
  getContacts: async (pageId = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`/contacts?page_id=${pageId}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  },
  
  getContact: async (id) => {
    try {
      const response = await apiClient.get(`/contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contact ${id}:`, error);
      throw error;
    }
  },
  
  createContact: async (contactData) => {
    try {
      const response = await apiClient.post('/contacts', contactData);
      return response.data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  },
  
  updateContact: async (id, contactData) => {
    try {
      const response = await apiClient.put(`/contacts/${id}`, contactData);
      return response.data;
    } catch (error) {
      console.error(`Error updating contact ${id}:`, error);
      throw error;
    }
  },
  
  deleteContact: async (id) => {
    try {
      const response = await apiClient.delete(`/contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting contact ${id}:`, error);
      throw error;
    }
  }
};

// Health check endpoint
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};