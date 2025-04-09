// src/pages/products/ProductEdit.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import Spinner from '../../components/ui/Spinner';
import apiClient from '../../api/apiClient';

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    currency: 'USD',
    is_active: true
  });
  
  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.get(`/products/${id}`);
        const product = response.data;
        
        // Update form with product data
        setProductData({
          name: product.name,
          description: product.description?.Valid ? product.description.String : '',
          category: product.category?.Valid ? product.category.String : '',
          price: product.price?.Valid ? product.price.String : '',
          currency: product.currency?.Valid ? product.currency.String : 'USD',
          is_active: product.is_active?.Bool || false
        });
      } catch (err) {
        console.error(`Error fetching product ${id}:`, err);
        setError('Failed to load product details. Please try again later.');
        notification.showError('Error', 'Failed to load product details');
        
        // For development - mock data
        setProductData({
          name: 'Enterprise Software Solution',
          description: 'Complete business management platform',
          category: 'Software',
          price: '1499.99',
          currency: 'USD',
          is_active: true
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, notification]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Call API to update product
      const response = await apiClient.put(`/products/${id}`, productData);
      
      notification.showSuccess('Success', 'Product updated successfully');
      
      // Navigate back to product details
      navigate(`/products/${id}`);
    } catch (err) {
      console.error('Error updating product:', err);
      notification.showError('Error', 'Failed to update product. Please try again.');
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setProductData({ ...productData, [name]: checked });
  };
  
  if (isLoading && !productData.name) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (error && !productData.name) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <button
          onClick={() => navigate(`/products/${id}`)}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Back to Product
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {isLoading && <Spinner fullPage />}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <button
          onClick={() => navigate(`/products/${id}`)}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={productData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={productData.description}
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
                value={productData.category}
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
                  value={productData.price}
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
                  value={productData.currency}
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
                  checked={productData.is_active}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t flex justify-end">
            <button
              type="button"
              onClick={() => navigate(`/products/${id}`)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEdit;