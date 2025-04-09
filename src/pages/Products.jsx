// src/pages/Products.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import apiClient from '../api/apiClient';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    currency: 'USD',
    is_active: true
  });
  
  const navigate = useNavigate();
  const notification = useNotification();

  // Fetch products from API
// Corrected useEffect hook
useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.get(`/products?page_id=${page}&page_size=${pageSize}`);
        setProducts(response.data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        notification.showError('Error', 'Failed to load products. Please try again later.');
        
        // For development, set mock data
        const mockProducts = [
          {
            id: 1,
            name: 'Enterprise Software Solution',
            description: { String: 'Complete business management platform', Valid: true },
            category: { String: 'Software', Valid: true },
            price: { String: '1499.99', Valid: true },
            currency: { String: 'USD', Valid: true },
            is_active: { Bool: true, Valid: true },
            document_count: 3,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Cloud Storage Service',
            description: { String: 'Secure cloud storage for businesses', Valid: true },
            category: { String: 'Service', Valid: true },
            price: { String: '49.99', Valid: true },
            currency: { String: 'USD', Valid: true },
            is_active: { Bool: true, Valid: true },
            document_count: 1,
            created_at: new Date().toISOString()
          }
        ];
        setProducts(mockProducts);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchProducts();
  }, [page, pageSize, notification]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Call the API to create the product
      const response = await apiClient.post('/products', newProduct);
      
      // Update the products list
      setProducts([...products, response.data]);
      
      // Reset form and close modal
      setNewProduct({
        name: '',
        description: '',
        category: '',
        price: '',
        currency: 'USD',
        is_active: true
      });
      setShowAddModal(false);
      
      notification.showSuccess('Success', 'Product created successfully');
    } catch (err) {
      console.error('Error creating product:', err);
      notification.showError('Error', 'Failed to create product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      setIsLoading(true);
      
      // Call the API to delete the product
      await apiClient.delete(`/products/${selectedProduct.id}`);
      
      // Remove product from list
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      
      // Close modal
      setShowDeleteModal(false);
      setSelectedProduct(null);
      
      notification.showSuccess('Success', 'Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      notification.showError('Error', 'Failed to delete product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setNewProduct({ ...newProduct, [name]: checked });
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
        >
          Add Product
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Products list */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documents
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No products found. Add your first product!
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      <Link to={`/products/${product.id}`} className="hover:text-blue-600 hover:underline">
                        {product.name}
                      </Link>
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.description?.Valid ? product.description.String.substring(0, 50) + (product.description.String.length > 50 ? '...' : '') : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.category?.Valid ? product.category.String : '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.price?.Valid && product.currency?.Valid ? (
                      <div className="text-sm text-gray-900">
                        {product.currency.String} {parseFloat(product.price.String).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.document_count?.Valid ? product.document_count.Int32 : 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.is_active?.Bool 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.is_active?.Bool ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/products/${product.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                      View
                    </Link>
                    <Link to={`/products/${product.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-3">
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleOpenDeleteModal(product)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Product"
        size="lg"
      >
        <form onSubmit={handleCreateProduct}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={newProduct.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  name="currency"
                  value={newProduct.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={newProduct.is_active}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Product
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div>
          <p className="text-gray-700">
            Are you sure you want to delete product{' '}
            <span className="font-semibold">
              {selectedProduct ? selectedProduct.name : ''}
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
              onClick={handleDeleteProduct}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Loading overlay */}
      {isLoading && <Spinner fullPage />}
    </div>
  );
};

// Create a productsService to centralize API calls
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
        params: { page_id: pageId, page_size: pageSize }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching documents for product ${productId}:`, error);
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
  
  deleteDocument: async (documentId) => {
    try {
      const response = await apiClient.delete(`/products/documents/${documentId}`);
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
  }
};

export default Products; 