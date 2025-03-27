// src/api/contactsService.js
import { apiService } from './apiClient';

export const contactsService = {
  // Fetch list of contacts with pagination and filtering
  getContacts: async (pageId = 1, pageSize = 10) => {
    try {
      return await apiService.get('/contacts', { page_id: pageId, page_size: pageSize });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  },
  
  // Get a single contact by ID
  getContact: async (id) => {
    try {
      return await apiService.get(`/contacts/${id}`);
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
      
      return await apiService.post('/contacts', formattedData);
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
      
      return await apiService.put(`/contacts/${id}`, updateData);
    } catch (error) {
      console.error(`Error updating contact ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a contact
  deleteContact: async (id) => {
    try {
      return await apiService.delete(`/contacts/${id}`);
    } catch (error) {
      console.error(`Error deleting contact ${id}:`, error);
      throw error;
    }
  },
  
  // Search contacts
  searchContacts: async (query, pageId = 1, pageSize = 10) => {
    try {
      return await apiService.get('/contacts', { 
        q: query,
        page_id: pageId, 
        page_size: pageSize 
      });
    } catch (error) {
      console.error(`Error searching contacts:`, error);
      throw error;
    }
  },
  
  // Get contacts by company
  getContactsByCompany: async (companyId, pageId = 1, pageSize = 10) => {
    try {
      return await apiService.get(`/companies/${companyId}/contacts`, {
        page_id: pageId,
        page_size: pageSize
      });
    } catch (error) {
      console.error(`Error fetching contacts for company ${companyId}:`, error);
      throw error;
    }
  },
  
  // Get all tags for a contact
  getContactTags: async (contactId) => {
    try {
      return await apiService.get(`/contacts/${contactId}/tags`);
    } catch (error) {
      console.error(`Error fetching tags for contact ${contactId}:`, error);
      throw error;
    }
  },
  
  // Get recent contacts activity
  getRecentContacts: async (limit = 5) => {
    try {
      // This might need adjustment based on your actual API endpoint
      return await apiService.get('/contacts', { 
        sort: 'updated_at',
        order: 'desc',
        limit
      });
    } catch (error) {
      console.error(`Error fetching recent contacts:`, error);
      throw error;
    }
  }
};

export default contactsService;