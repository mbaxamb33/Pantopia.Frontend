// src/pages/products/ProductDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import apiClient from '../../api/apiClient';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  
  const [product, setProduct] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [uploadFormData, setUploadFormData] = useState({
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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
        setError('Failed to load product details. Please try again later.');
        notification.showError('Error', 'Failed to load product details');
        
        // For development, set mock data
        setProduct({
          id: parseInt(id),
          name: 'Enterprise Software Solution',
          description: { String: 'Complete business management platform', Valid: true },
          category: { String: 'Software', Valid: true },
          price: { String: '1499.99', Valid: true },
          currency: { String: 'USD', Valid: true },
          is_active: { Bool: true, Valid: true },
          document_count: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
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
      
      try {
        // If search is active, use search endpoint
        let endpoint = `/products/${id}/documents`;
        let params = { page_id: page, page_size: pageSize };
        
        if (isSearching && searchQuery.trim()) {
          endpoint = `/products/${id}/documents/search`;
          params.query = searchQuery;
        }
        
        const response = await apiClient.get(endpoint, { params });
        setDocuments(response.data || []);
      } catch (err) {
        console.error(`Error fetching documents for product ${id}:`, err);
        notification.showError('Error', 'Failed to load documents');
        
        // For development, set mock documents
        setDocuments([
          {
            id: 1,
            product_id: parseInt(id),
            file_name: 'Product_Specifications.docx',
            file_type: 'docx',
            file_size: 1024 * 100, // 100 KB
            description: { String: 'Technical specifications document', Valid: true },
            created_at: new Date().toISOString(),
            metadata: { Valid: true, RawMessage: JSON.stringify({ title: 'Product Specifications', author: 'John Doe' }) }
          },
          {
            id: 2,
            product_id: parseInt(id),
            file_name: 'User_Manual.docx',
            file_type: 'docx',
            file_size: 1024 * 250, // 250 KB
            description: { String: 'User manual and guidelines', Valid: true },
            created_at: new Date().toISOString(),
            metadata: { Valid: true, RawMessage: JSON.stringify({ title: 'User Manual', author: 'Jane Smith' }) }
          }
        ]);
      } finally {
        setIsDocumentsLoading(false);
      }
    };

    fetchDocuments();
  }, [id, product, page, pageSize, notification, searchQuery, isSearching]);

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      notification.showError('Error', 'Please select a file to upload');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('product_id', id);
      formData.append('description', uploadFormData.description);
      
      // Call API to upload document
      const response = await apiClient.post('/products/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Reset form
      setSelectedFile(null);
      setUploadFormData({ description: '' });
      setShowUploadModal(false);
      
      // Refresh documents
      setPage(1);
      
      // Update product document count
      if (product) {
        setProduct({
          ...product,
          document_count: (product.document_count || 0) + 1
        });
      }
      
      notification.showSuccess('Success', 'Document uploaded successfully');
    } catch (err) {
      console.error('Error uploading document:', err);
      notification.showError('Error', 'Failed to upload document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;
    
    try {
      setIsLoading(true);
      
      // Call API to delete document
      await apiClient.delete(`/products/documents/${selectedDocument.id}`);
      
      // Remove document from list
      setDocuments(documents.filter(doc => doc.id !== selectedDocument.id));
      
      // Update product document count
      if (product && product.document_count > 0) {
        setProduct({
          ...product,
          document_count: product.document_count - 1
        });
      }
      
      // Close modal
      setShowDeleteModal(false);
      setSelectedDocument(null);
      
      notification.showSuccess('Success', 'Document deleted successfully');
    } catch (err) {
      console.error('Error deleting document:', err);
      notification.showError('Error', 'Failed to delete document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadFormData({ ...uploadFormData, [name]: value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setIsSearching(!!searchQuery.trim());
    setPage(1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Parse metadata
  const parseMetadata = (metadata) => {
    if (!metadata?.Valid) return {};
    
    try {
      return JSON.parse(metadata.RawMessage);
    } catch (err) {
      console.error('Error parsing metadata:', err);
      return {};
    }
  };

  if (isLoading && !product) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !product) {
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

  if (!product) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
        <p className="font-bold">Not Found</p>
        <p>Product not found. It may have been deleted or you don't have access.</p>
        <button
          onClick={() => navigate('/products')}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isLoading && <Spinner fullPage />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          {product.category?.Valid && (
            <p className="text-gray-600">{product.category.String}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate(`/products/${id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Upload Document
          </button>
          <button
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Product Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Description</label>
                  <div className="mt-1">
                    {product.description?.Valid ? product.description.String : 'No description available'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Price</label>
                  <div className="mt-1">
                    {product.price?.Valid && product.currency?.Valid ? (
                      <span className="font-semibold">
                        {product.currency.String} {parseFloat(product.price.String).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                      product.is_active?.Bool 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.is_active?.Bool ? 'Active' : 'Inactive'}
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
                  <div className="mt-1">{product.category?.Valid ? product.category.String : 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Created</label>
                  <div className="mt-1">{formatDate(product.created_at)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                  <div className="mt-1">{formatDate(product.updated_at)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Documents</label>
                  <div className="mt-1">
                    <span className="font-semibold">{product.document_count || 0}</span> documents attached
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Documents Section */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Documents</h2>
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 text-white rounded-r hover:bg-blue-700"
              >
                Search
              </button>
              {isSearching && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="ml-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear
                </button>
              )}
            </form>
          </div>
          
          {isSearching && (
            <div className="mb-4 bg-blue-50 p-2 rounded text-sm">
              Showing results for: <span className="font-semibold">{searchQuery}</span>
            </div>
          )}
          
          {isDocumentsLoading ? (
            <div className="flex justify-center py-6">
              <Spinner size="md" />
            </div>
          ) : documents.length === 0 ? (
            <div className="py-6 text-center text-gray-500">
              {isSearching ? 'No documents found matching your search.' : 'No documents have been uploaded yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((doc) => {
                    const metadata = parseMetadata(doc.metadata);
                    return (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                              {doc.file_type === 'docx' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{doc.file_name}</div>
                              <div className="text-sm text-gray-500">{doc.description?.Valid ? doc.description.String : ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {doc.file_type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatFileSize(doc.file_size)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(doc.created_at)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedDocument(doc);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Upload Document Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Document"
        size="lg"
      >
        <form onSubmit={handleUploadDocument}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
              <input
                type="file"
                accept=".docx"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Only Word documents (.docx) are supported</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={uploadFormData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional document description"
              ></textarea>
            </div>
            <div className="bg-yellow-50 p-4 rounded-md text-sm">
              <p className="font-semibold text-yellow-800">Document Processing</p>
              <p className="text-yellow-700 mt-1">
                When you upload a Word document, the system will automatically:
              </p>
              <ul className="list-disc list-inside mt-2 text-yellow-700 space-y-1">
                <li>Extract text content for full-text search</li>
                <li>Parse document metadata (title, author, etc.)</li>
                <li>Count paragraphs, words, and headings</li>
                <li>Store a structured representation for analysis</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
            >
              Upload
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Document Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div>
          <p className="text-gray-700">
            Are you sure you want to delete document{' '}
            <span className="font-semibold">
              {selectedDocument ? selectedDocument.file_name : ''}
            </span>?
            This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteDocument}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDetail;