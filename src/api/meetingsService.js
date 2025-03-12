// src/api/meetingsService.js
import apiClient from './apiClient';

export const meetingsService = {
  // Fetch list of meeting records
  getMeetingRecords: async (pageId = 1, pageSize = 10, conversationId = null) => {
    try {
      let url = `/meeting-records?page_id=${pageId}&page_size=${pageSize}`;
      if (conversationId) {
        url += `&conversation_id=${conversationId}`;
      }
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching meeting records:', error);
      throw error;
    }
  },
  
  // Get a single meeting record by ID
  getMeetingRecord: async (id) => {
    try {
      const response = await apiClient.get(`/meeting-records/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching meeting record ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new meeting record
  createMeetingRecord: async (meetingData) => {
    try {
      const response = await apiClient.post('/meeting-records', meetingData);
      return response.data;
    } catch (error) {
      console.error('Error creating meeting record:', error);
      throw error;
    }
  },
  
  // Update an existing meeting record
  updateMeetingRecord: async (id, meetingData) => {
    try {
      const response = await apiClient.put(`/meeting-records/${id}`, meetingData);
      return response.data;
    } catch (error) {
      console.error(`Error updating meeting record ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a meeting record
  deleteMeetingRecord: async (id) => {
    try {
      const response = await apiClient.delete(`/meeting-records/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting meeting record ${id}:`, error);
      throw error;
    }
  },
  
  // Process a meeting recording
  processMeetingRecording: async (meetingId) => {
    try {
      const response = await apiClient.post(`/meeting-records/${meetingId}/process`);
      return response.data;
    } catch (error) {
      console.error(`Error processing recording for meeting ${meetingId}:`, error);
      throw error;
    }
  }
};