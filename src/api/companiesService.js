// src/api/companiesService.js
import apiClient from './apiClient';

export const companiesService = {
  // Fetch list of companies
  getCompanies: async (pageId = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`/companies?page_id=${pageId}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },
  
  // Get a single company by ID
  getCompany: async (id) => {
    try {
      const response = await apiClient.get(`/companies/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching company ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new company
  createCompany: async (companyData) => {
    try {
      const response = await apiClient.post('/companies', companyData);
      return response.data;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  },
  
  // Update an existing company
  updateCompany: async (id, companyData) => {
    try {
      const response = await apiClient.put(`/companies/${id}`, companyData);
      return response.data;
    } catch (error) {
      console.error(`Error updating company ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a company
  deleteCompany: async (id) => {
    try {
      const response = await apiClient.delete(`/companies/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting company ${id}:`, error);
      throw error;
    }
  },
  
  // Get company contacts
  getCompanyContacts: async (companyId, pageId = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`/companies/${companyId}/contacts?page_id=${pageId}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contacts for company ${companyId}:`, error);
      throw error;
    }
  }
};