// src/components/products/DocumentUploader.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../ui/Spinner';
import { useNotification } from '../../context/NotificationContext';
import apiClient from '../../api/apiClient';

const DocumentUploader = ({ productId, onUploadComplete }) => {
  const navigate = useNavigate();
  const notification = useNotification();
  
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        notification.showError('Invalid File', 'Only Word documents (.docx) are supported');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      notification.showError('No File', 'Please select a document to upload');
      return;
    }
    
    try {
      setIsLoading(true);
      setProgress(10);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('product_id', productId);
      formData.append('description', description);
      
      setProgress(30);
      
      // Configure request with progress tracking
      const response = await apiClient.post('/products/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 70) / progressEvent.total);
          setProgress(30 + percentCompleted); // Start from 30% and go up to 100%
        }
      });
      
      setProgress(100);
      notification.showSuccess('Upload Successful', 'Document has been uploaded successfully');
      
      // Reset form
      setFile(null);
      setDescription('');
      
      // Call completion handler if provided
      if (onUploadComplete) {
        onUploadComplete(response.data);
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      notification.showError(
        'Upload Failed', 
        err.response?.data?.error || 'Failed to upload document. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Document
          </label>
          <input
            type="file"
            accept=".docx"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Only Word documents (.docx) are supported
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Enter a description for this document..."
            disabled={isLoading}
          ></textarea>
        </div>
        
        {progress > 0 && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-center mt-1 text-gray-600">
              {progress < 100 ? `Uploading: ${progress}%` : 'Processing document...'}
            </p>
          </div>
        )}
        
        <div className="pt-4 border-t flex justify-end">
          <button
            type="button"
            onClick={() => navigate(`/products/${productId}`)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            disabled={isLoading || !file}
          >
            {isLoading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </form>

      {isLoading && <Spinner fullPage />}
    </div>
  );
};

export default DocumentUploader;