// src/components/products/DocumentUpload.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import Spinner from '../ui/Spinner';
import Modal from '../ui/Modal';
import apiClient from '../../api/apiClient';

const DocumentUpload = ({ productId, onSuccess }) => {
  const notification = useNotification();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      notification.showWarning('No File Selected', 'Please select a file to upload');
      return;
    }

    // Check file type (only docx for now, as per API)
    if (!file.name.toLowerCase().endsWith('.docx')) {
      notification.showWarning('Invalid File Type', 'Only Word documents (.docx) are supported');
      return;
    }

    setIsLoading(true);
    setProgress(10);

    try {
      // Create form data with exact field names expected by the backend
      const formData = new FormData();
      formData.append('file', file);
      formData.append('product_id', productId); // Make sure this is an integer value
      
      if (description) {
        formData.append('description', description);
      }

      console.log('Uploading document with product_id:', productId);
      
      setProgress(30);

      // Upload document
      const response = await apiClient.post('/products/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 70) / progressEvent.total);
          setProgress(30 + percentCompleted); // Start from 30%, go up to 100%
        }
      });

      console.log('Upload response:', response);
      
      setProgress(100);
      
      // Show success notification
      notification.showSuccess('Upload Successful', 'Document uploaded successfully');
      
      // Close modal and reset state
      setIsOpen(false);
      setFile(null);
      setDescription('');
      
      // Refresh document list
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(response.data);
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      
      // Log detailed error information
      console.error('Upload error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.error || 
                          err.message || 
                          'Failed to upload document. Please try again.';
      
      notification.showError('Upload Failed', errorMessage);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
      >
        Upload Document
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => !isLoading && setIsOpen(false)}
        title="Upload Document"
        size="md"
      >
        <form onSubmit={handleUpload}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document (Word .docx files only)
              </label>
              <input
                type="file"
                accept=".docx"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Only Microsoft Word (.docx) files are supported
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Enter document description"
                disabled={isLoading}
              ></textarea>
            </div>

            {isLoading && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-center text-sm text-gray-600 mt-1">
                  {progress < 100 ? 'Uploading...' : 'Processing document...'}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => !isLoading && setIsOpen(false)}
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
              {isLoading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default DocumentUpload;