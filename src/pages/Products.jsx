// src/pages/Products.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import CreateProductForm from '../components/products/CreateProductForm';
import productsService from '../api/productsService';

const Products = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const [searchParams] = useSearchParams();
  const showAddModal = searchParams.get('action') === 'new';
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(showAddModal);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await productsService.getProducts(page, pageSize);
        
        if (Array.isArray(data)) {
          setProducts(data);
          setTotalProducts(data.length < pageSize ? (page - 1) * pageSize + data.length : page * pageSize + 1);
        } else {
          setProducts([]);
          setTotalProducts(0);
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        notification.showError('Error', 'Failed to load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchProducts();
  }, [page, pageSize, notification]);

  const handleProductCreated = (newProduct) => {
    // Add the new product to the list
    setProducts(prevProducts => [newProduct, ...prevProducts]);
    
    // Update total count
    setTotalProducts(prevTotal => prevTotal + 1);
    
    // Close the form
    setShowAddForm(false);
    
    // Clear search params
    navigate('/products');
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      setIsLoading(true);
      
      // Call the API to delete the product
      await productsService.deleteProduct(selectedProduct.id);
      
      // Remove product from list
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      
      // Update total count
      setTotalProducts(prevTotal => prevTotal - 1);
      
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

  // Format nullable fields from SQL
  const formatName = (product) => product.name || '';
  
  const formatDescription = (product) => {
    if (!product.description) return '';
    return product.description.Valid ? product.description.String : '';
  };
  
  const formatCategory = (product) => {
    if (!product.category) return '';
    return product.category.Valid ? product.category.String : '';
  };
  
  const formatPrice = (product) => {
    if (!product.price || !product.price.Valid || !product.currency || !product.currency.Valid) {
      return '-';
    }
    
    try {
      const price = parseFloat(product.price.String);
      return `${product.currency.String} ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } catch (err) {
      return product.price.String;
    }
  };
  
  const isProductActive = (product) => {
    if (!product.is_active) return false;
    return product.is_active.Valid ? product.is_active.Bool : false;
  };

  const getDocumentCount = (product) => {
    if (!product.document_count) return 0;
    if (typeof product.document_count === 'number') return product.document_count;
    return product.document_count.Int32 || 0;
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
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
        >
          Add Product
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Product Creation Form (conditional) */}
      {showAddForm && (
        <Modal
          isOpen={showAddForm}
          onClose={() => {
            setShowAddForm(false);
            navigate('/products');
          }}
          title="Add New Product"
          size="lg"
        >
          <CreateProductForm 
            onSuccess={handleProductCreated}
            onCancel={() => {
              setShowAddForm(false);
              navigate('/products');
            }}
          />
        </Modal>
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
                        {formatName(product)}
                      </Link>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDescription(product).substring(0, 50)}
                      {formatDescription(product).length > 50 ? '...' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCategory(product) || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatPrice(product)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getDocumentCount(product)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      isProductActive(product) 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isProductActive(product) ? 'Active' : 'Inactive'}
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
        
        {/* Pagination */}
        {totalProducts > pageSize && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={products.length < pageSize}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  products.length < pageSize ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

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
              {selectedProduct ? formatName(selectedProduct) : ''}
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

export default Products;