// src/pages/products/ProductDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import apiClient from '../../api/apiClient';
import DocumentViewer from '../../components/products/DocumentViewer';

// Helper function to safely extract string values from nullable fields
const extractString = (nullableField) => {
  if (!nullableField) return '';
  if (typeof nullableField === 'string') return nullableField;
  if (nullableField.Valid && nullableField.String) return nullableField.String;
  return '';
};

// Helper function to safely extract boolean values from nullable fields
const extractBool = (nullableBool) => {
  if (nullableBool === null || nullableBool === undefined) return false;
  if (typeof nullableBool === 'boolean') return nullableBool;
  if (nullableBool.Valid) return nullableBool.Bool;
  return false;
};

// Helper function to safely extract number values from nullable fields
const extractNumber = (nullableNumber) => {
  if (!nullableNumber) return 0;
  if (typeof nullableNumber === 'number') return nullableNumber;
  if (nullableNumber.Valid && nullableNumber.Int32) return nullableNumber.Int32;
  return 0;
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  
  const [product, setProduct] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documentsError, setDocumentsError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error(`Error fetching product ${id}:`, err);
        const errorMessage = err.response?.data?.error || 
                             err.message || 
                             'Failed to load product details. Please try again later.';
        setError(errorMessage);
        notification.showError('Error', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, notification]);

  // Fetch product documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!product) return;
      
      setIsDocumentsLoading(true);
      setDocumentsError(null);
      
      try {
        // Try fetching documents using multiple potential endpoints
        const endpoints = [
          `/products/${id}/documents`,
          `/documents?product_id=${id}`,
          `/api/products/${id}/documents`
        ];

        let response;
        for (const endpoint of endpoints) {
          try {
            response = await apiClient.get(endpoint, {
              params: { page_id: page, page_size: pageSize }
            });
            
            // If request succeeds, break the loop
            if (response.data) break;
          } catch (err) {
            // Continue to next endpoint if this one fails
            console.warn(`Failed to fetch from ${endpoint}:`, err);
          }
        }

        // Validate and extract documents
        const fetchedDocuments = response?.data ? 
          (Array.isArray(response.data) ? response.data : 
           (response.data.documents || response.data.data || [])) : [];
        
        setDocuments(fetchedDocuments);
        
        // Optional: Notify if no documents found
        if (fetchedDocuments.length === 0) {
          notification.showInfo('No Documents', 'No documents found for this product.');
        }
      } catch (err) {
        console.error(`Error fetching documents for product ${id}:`, err);
        
        // Extract meaningful error message
        const errorMessage = err.response?.data?.error || 
                             err.message || 
                             'Failed to load documents';
        
        setDocumentsError(errorMessage);
        notification.showError('Error', errorMessage);
        
        // Optional: Set mock documents for development/testing
        const mockDocuments = [
          {
            id: 1,
            file_name: { String: 'Product_Specification.docx', Valid: true },
            file_type: 'docx',
            file_size: 1024 * 100, // 100 KB
            description: { String: 'Technical specifications', Valid: true },
            metadata: { 
              Valid: true, 
              RawMessage: JSON.stringify({ 
                title: 'Product Specification', 
                author: 'John Doe' 
              }) 
            }
          }
        ];
        
        setDocuments(mockDocuments);
      } finally {
        setIsDocumentsLoading(false);
      }
    };

    if (product) {
      fetchDocuments();
    }
  }, [id, product, page, pageSize, notification]);

  // If loading initial product details, show spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // If there's an error loading product details
  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <button
          onClick={() => navigate('/products')}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Back to Products
        </button>
      </div>
    );
  }

  // Safely extract product details
  const name = extractString(product.name);
  const description = extractString(product.description);
  const category = extractString(product.category);
  const price = product.price?.Valid ? parseFloat(product.price.String).toFixed(2) : '0.00';
  const currency = extractString(product.currency);
  const isActive = extractBool(product.is_active);
  const documentCount = extractNumber(product.document_count);

  return (
    <div className="space-y-6">
      {/* Product Details Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{name}</h1>
          {category && <p className="text-gray-600">{category}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate(`/products/${id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Product Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Description</label>
                  <div className="mt-1">{description || 'No description available'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Price</label>
                  <div className="mt-1">
                    {price && currency ? (
                      <span className="font-semibold">
                        {currency} {price}
                      </span>
                    ) : (
                      'Not specified'
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Category</label>
                  <div className="mt-1">{category || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Created</label>
                  <div className="mt-1">{new Date(product.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                  <div className="mt-1">{new Date(product.updated_at).toLocaleString()}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Documents</label>
                  <div className="mt-1">
                    <span className="font-semibold">{documentCount}</span> documents attached
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Documents</h2>
          <button
            onClick={() => navigate(`/products/${id}?action=upload`)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Upload Document
          </button>
        </div>
        
        {isDocumentsLoading ? (
          <div className="flex justify-center py-6">
            <Spinner size="md" />
          </div>
        ) : documentsError ? (
          <div className="py-6 text-center text-red-500">
            {documentsError}
            <button 
              onClick={() => window.location.reload()}
              className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : documents.length === 0 ? (
          <div className="py-6 text-center text-gray-500">
            No documents have been uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc, index) => (
              <div 
                key={`${doc.id}-${index}`} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedDocument(doc)}
              >
                <div className="flex items-center mb-2">
                  <div className="mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{extractString(doc.file_name)}</h3>
                    <p className="text-xs text-gray-500">
                      {extractString(doc.description) || 'No description'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <Modal
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          title="Document Details"
          size="lg"
        >
          <DocumentViewer document={selectedDocument} />
        </Modal>
      )}
    </div>
  );
};

export default ProductDetail;