// src/api/productsService.js
import apiClient from './apiClient';

export const productsService = {
  getProducts: async (pageId = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`/products?page_id=${pageId}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  
  getProduct: async (id) => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },
  
  createProduct: async (productData) => {
    try {
      const response = await apiClient.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },
  
  updateProduct: async (id, productData) => {
    try {
      const response = await apiClient.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },
  
  deleteProduct: async (id) => {
    try {
      const response = await apiClient.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },
  
  // Document-related methods
  getProductDocuments: async (productId, pageId = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`/products/${productId}/documents`, {
        params: { 
          product_id: productId,
          ProductID: productId, // Include with the exact casing expected by backend
          page_id: pageId,
          PageID: pageId,       // Include with the exact casing expected by backend
          page_size: pageSize,
          PageSize: pageSize    // Include with the exact casing expected by backend
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching documents for product ${productId}:`, error);
      // Return empty array instead of throwing if there are no documents
      if (error.response?.status === 400) {
        return [];
      }
      throw error;
    }
  },
  
  getDocumentSections: async (documentId, pageId = 1, pageSize = 100) => {
    try {
      const response = await apiClient.get(`/documents/${documentId}/sections`, {
        params: { page_id: pageId, page_size: pageSize }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching sections for document ${documentId}:`, error);
      throw error;
    }
  },
  
  uploadDocument: async (formData) => {
    try {
      const response = await apiClient.post('/products/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },
  
  getDocumentDetail: async (documentId) => {
    try {
      const response = await apiClient.get(`/products/documents/details/${documentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching document details ${documentId}:`, error);
      throw error;
    }
  },
  
  deleteDocument: async (documentId) => {
    try {
      const response = await apiClient.delete(`/products/documents/details/${documentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting document ${documentId}:`, error);
      throw error;
    }
  },
  
  searchDocuments: async (productId, query, pageId = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`/products/${productId}/documents/search`, {
        params: {
          query,
          page_id: pageId,
          page_size: pageSize
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error searching documents for product ${productId}:`, error);
      throw error;
    }
  },
  
  searchDocumentSections: async (documentId, query, pageId = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(`/documents/${documentId}/search`, {
        params: {
          query,
          page_id: pageId,
          page_size: pageSize
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error searching sections for document ${documentId}:`, error);
      throw error;
    }
  }
};

export default productsService;