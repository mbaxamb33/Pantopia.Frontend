// src/api/salesFlowsService.js
import apiClient from './apiClient';

export const salesFlowsService = {
  // Fetch list of sales flows
  getSalesFlows: async (pageId = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`/sales-flows?page_id=${pageId}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales flows:', error);
      throw error;
    }
  },
  
  // Get a single sales flow by ID
  getSalesFlow: async (id) => {
    try {
      const response = await apiClient.get(`/sales-flows/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sales flow ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new sales flow
  createSalesFlow: async (flowData) => {
    try {
      const response = await apiClient.post('/sales-flows', flowData);
      return response.data;
    } catch (error) {
      console.error('Error creating sales flow:', error);
      throw error;
    }
  },
  
  // Update an existing sales flow
  updateSalesFlow: async (id, flowData) => {
    try {
      const response = await apiClient.put(`/sales-flows/${id}`, flowData);
      return response.data;
    } catch (error) {
      console.error(`Error updating sales flow ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a sales flow
  deleteSalesFlow: async (id) => {
    try {
      const response = await apiClient.delete(`/sales-flows/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting sales flow ${id}:`, error);
      throw error;
    }
  },
  
  // Assign flow to project
  assignFlowToProject: async (projectId, flowData) => {
    try {
      const response = await apiClient.post(`/projects/${projectId}/flows`, flowData);
      return response.data;
    } catch (error) {
      console.error(`Error assigning flow to project ${projectId}:`, error);
      throw error;
    }
  },
  
  // Update project flow status
  updateProjectFlowStatus: async (projectId, flowId, statusData) => {
    try {
      const response = await apiClient.put(`/projects/${projectId}/flows/${flowId}`, statusData);
      return response.data;
    } catch (error) {
      console.error(`Error updating flow ${flowId} status for project ${projectId}:`, error);
      throw error;
    }
  },
  
  // Remove flow from project
  removeFlowFromProject: async (projectId, flowId) => {
    try {
      const response = await apiClient.delete(`/projects/${projectId}/flows/${flowId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing flow ${flowId} from project ${projectId}:`, error);
      throw error;
    }
  },
  
  // Get project flows
  getProjectFlows: async (projectId, pageId = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/flows?page_id=${pageId}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching flows for project ${projectId}:`, error);
      throw error;
    }
  }
};