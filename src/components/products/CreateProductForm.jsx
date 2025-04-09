// src/components/products/CreateProductForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import Spinner from '../ui/Spinner';
import productsService from '../../api/productsService';

const CreateProductForm = ({ onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const notification = useNotification();
  
  const [isLoading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    currency: 'USD',
    is_active: true
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setProductData({ ...productData, [name]: checked });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Format price as string if it's a number
      const formattedData = {
        ...productData,
        price: productData.price.toString()
      };
      
      // Call API to create the product
      const newProduct = await productsService.createProduct(formattedData);
      
      notification.showSuccess('Success', 'Product created successfully');
      
      // Call success handler with the new product
      if (onSuccess) {
        onSuccess(newProduct);
      }
      
      // Optionally navigate to the new product page
      navigate(`/products/${newProduct.id}`);
    } catch (err) {
      console.error('Error creating product:', err);
      notification.showError('Error', 'Failed to create product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Create New Product</h2>
      
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
                Active (product will be visible)
              </label>
            </div>
          </div>
        </div>
        <div className="pt-4 border-t flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>

      {isLoading && <Spinner fullPage />}
    </div>
  );
};

export default CreateProductForm;