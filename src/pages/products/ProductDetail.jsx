// src/pages/products/ProductDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import apiClient from '../../api/apiClient';
import DocumentViewer from '../../components/products/DocumentViewer';
import DocumentUploader from '../../components/products/DocumentUploader';
import DocumentSectionViewer from '../../components/products/DocumentSectionViewer';

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
  const [searchParams] = useSearchParams();
  const showUploadModal = searchParams.get('action') === 'upload';
  
  const [product, setProduct] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documentsError, setDocumentsError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [showUploader, setShowUploader] = useState(showUploadModal);
  const [viewDocumentSections, setViewDocumentSections] = useState(false);

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
        // Make sure to include all required parameters with the correct casing
        // Your backend expects ProductID (capital I, capital D) not product_id
        const response = await apiClient.get(`/products/${id}/documents`, {
          params: { 
            product_id: id,  // Add this even though it's in the URL path
            ProductID: id,   // Add this with the expected casing
            page_id: page,
            PageID: page,    // Add this with the expected casing
            page_size: pageSize,
            PageSize: pageSize // Add this with the expected casing
          }
        });
        
        const fetchedDocuments = response?.data || [];
        setDocuments(fetchedDocuments);
        
        // Don't show notification for empty documents on first load
        if (fetchedDocuments.length === 0 && page === 1) {
          // Silent - don't notify about initial empty state
          console.log("No documents found for this product.");
        }
      } catch (err) {
        console.error(`Error fetching documents for product ${id}:`, err);
        
        // Only show a single error notification, don't re-notify on every retry
        const errorMessage = err.response?.data?.error || 
                             err.message || 
                             'Failed to load documents';
                             
        setDocumentsError("No documents available.");
        
        // Set documents to empty array to prevent further retries
        setDocuments([]);
        
        // Don't show error notification for a product with no documents
        // console.log("Document fetch error:", errorMessage);
      } finally {
        setIsDocumentsLoading(false);
      }
    };

    // Only fetch documents once when the product first loads
    if (product && documents.length === 0) {
      fetchDocuments();
    }
  }, [id, product, notification]);

  const handleUploadComplete = (data) => {
    // Close the uploader
    setShowUploader(false);
    navigate(`/products/${id}`);
    
    // Update documents list
    setDocuments(prevDocs => [data.document, ...prevDocs]);
    
    // Update product document count if available
    if (product && data.document_count) {
      setProduct({
        ...product,
        document_count: { Int32: data.document_count, Valid: true }
      });
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      setIsLoading(true);
      
      await apiClient.delete(`/products/documents/details/${docId}`);
      
      // Remove document from list
      setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== docId));
      
      // Update document count
      if (product && product.document_count && product.document_count.Valid) {
        setProduct({
          ...product,
          document_count: { 
            Int32: Math.max(0, product.document_count.Int32 - 1), 
            Valid: true 
          }
        });
      }
      
      // Close any open document
      if (selectedDocument && selectedDocument.id === docId) {
        setSelectedDocument(null);
      }
      
      notification.showSuccess('Success', 'Document deleted successfully');
    } catch (err) {
      console.error(`Error deleting document ${docId}:`, err);
      notification.showError('Error', 'Failed to delete document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewSections = (document) => {
    setSelectedDocument(document);
    setViewDocumentSections(true);
  };

  // If loading initial product details, show spinner
  if (isLoading && !product) {
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

      {/* Document Uploader (shown conditionally) */}
      {showUploader && (
        <DocumentUploader 
          productId={id} 
          onUploadComplete={handleUploadComplete} 
        />
      )}

      {/* Documents Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Documents</h2>
          {!showUploader && (
            <button
              onClick={() => setShowUploader(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Upload Document
            </button>
          )}
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
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center mb-2">
                  <div className="h-10 w-10 bg-blue-100 rounded-md flex items-center justify-center text-blue-500 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <div className="flex mt-3 justify-between text-sm">
                  <div>
                    <button
                      onClick={() => setSelectedDocument(doc)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleViewSections(doc)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Sections
                    </button>
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && !viewDocumentSections && (
        <Modal
          isOpen={!!selectedDocument && !viewDocumentSections}
          onClose={() => setSelectedDocument(null)}
          title="Document Details"
          size="lg"
        >
          <DocumentViewer document={selectedDocument} />
        </Modal>
      )}

      {/* Document Sections Viewer Modal */}
      {selectedDocument && viewDocumentSections && (
        <Modal
          isOpen={!!selectedDocument && viewDocumentSections}
          onClose={() => {
            setSelectedDocument(null);
            setViewDocumentSections(false);
          }}
          title="Document Sections"
          size="xl"
        >
          <DocumentSectionViewer documentId={selectedDocument.document_id || selectedDocument.id} />
        </Modal>
      )}

      {isLoading && <Spinner fullPage />}
    </div>
  );
};

export default ProductDetail;