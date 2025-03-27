// src/api/contactsService.js
import apiClient, { apiService } from './apiClient';

export const contactsService = {
  // Fetch list of contacts with pagination and filtering
  getContacts: async (pageId = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`/contacts?page_id=${pageId}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  },
  
  // Get a single contact by ID
  getContact: async (id) => {
    try {
      const response = await apiClient.get(`/contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contact ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new contact
  createContact: async (contactData) => {
    try {
      // Structure the data according to the API's expected format
      const formattedData = {
        name: contactData.first_name && contactData.last_name 
          ? `${contactData.first_name} ${contactData.last_name}` 
          : contactData.first_name || contactData.last_name || '',
        email: contactData.email,
        phone: contactData.phone,
        company_name: contactData.company_name,
        address: contactData.address
      };
      
      const response = await apiClient.post('/contacts', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  },
  
  // Update an existing contact
  updateContact: async (id, contactData) => {
    try {
      // Ensure the data structure matches what the API expects
      const updateData = {
        id: parseInt(id),
        // If the API expects first_name and last_name separately
        first_name: contactData.first_name,
        last_name: contactData.last_name,
        email: contactData.email,
        phone: contactData.phone,
        company_name: contactData.company_name,
        address: contactData.address
      };
      
      const response = await apiClient.put(`/contacts/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating contact ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a contact
  deleteContact: async (id) => {
    try {
      const response = await apiClient.delete(`/contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting contact ${id}:`, error);
      throw error;
    }
  },
  
  // Search contacts
  searchContacts: async (query, pageId = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get('/contacts', { 
        params: {
          q: query,
          page_id: pageId, 
          page_size: pageSize 
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error searching contacts:`, error);
      throw error;
    }
  },
  
  // Get contacts by company
  getContactsByCompany: async (companyId, pageId = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`/companies/${companyId}/contacts`, {
        params: {
          page_id: pageId,
          page_size: pageSize
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching contacts for company ${companyId}:`, error);
      throw error;
    }
  },
  
  // Get all tags for a contact
  getContactTags: async (contactId) => {
    try {
      const response = await apiClient.get(`/contacts/${contactId}/tags`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tags for contact ${contactId}:`, error);
      throw error;
    }
  },
  
  // Get recent contacts activity
  getRecentContacts: async (limit = 5) => {
    try {
      // This might need adjustment based on your actual API endpoint
      const response = await apiClient.get('/contacts', { 
        params: {
          sort: 'updated_at',
          order: 'desc',
          limit
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching recent contacts:`, error);
      throw error;
    }
  }
};

export default contactsService;