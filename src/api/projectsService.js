// src/api/projectsService.js
import apiClient from './apiClient';

export const projectsService = {
  // Fetch list of projects
  getProjects: async (pageId = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`/projects?page_id=${pageId}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },
  
  // Get a single project by ID
  getProject: async (id) => {
    try {
      const response = await apiClient.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new project
  createProject: async (projectData) => {
    try {
      const response = await apiClient.post('/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },
  
  // Update an existing project
  updateProject: async (id, projectData) => {
    try {
      const response = await apiClient.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a project
  deleteProject: async (id) => {
    try {
      const response = await apiClient.delete(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  },
  
  // Get project contacts
  getProjectContacts: async (projectId, pageId = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/contacts?page_id=${pageId}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contacts for project ${projectId}:`, error);
      throw error;
    }
  },
  
  // Add contact to project
  addContactToProject: async (projectId, contactData) => {
    try {
      const response = await apiClient.post(`/projects/${projectId}/contacts`, contactData);
      return response.data;
    } catch (error) {
      console.error(`Error adding contact to project ${projectId}:`, error);
      throw error;
    }
  },
  
  // Remove contact from project
  removeContactFromProject: async (projectId, contactId) => {
    try {
      const response = await apiClient.delete(`/projects/${projectId}/contacts/${contactId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing contact ${contactId} from project ${projectId}:`, error);
      throw error;
    }
  }
};