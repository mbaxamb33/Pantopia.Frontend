// src/api/index.js
import { contactsService } from './contactsService';
import { companiesService } from './companiesService';
import { projectsService } from './projectsService';
import { conversationsService } from './conversationsService';
import { meetingsService } from './meetingsService';
import { salesFlowsService } from './salesFlowsService';
import { usersService } from './usersService';

export {
  contactsService,
  companiesService,
  projectsService,
  conversationsService,
  meetingsService,
  salesFlowsService,
  usersService
};

// Health check function
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};