// src/components/products/DocumentViewer.jsx
import { useState, useEffect } from 'react';
import Spinner from '../ui/Spinner';

const DocumentViewer = ({ document }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!document) return;

    try {
      // Parse metadata if it exists
      let parsedMetadata = null;
      
      if (document.metadata?.Valid && document.metadata.RawMessage) {
        try {
          parsedMetadata = JSON.parse(document.metadata.RawMessage);
        } catch (jsonErr) {
          console.error('Error parsing document metadata JSON:', jsonErr);
          // Try to handle the case where RawMessage is already a string representation of JSON
          if (typeof document.metadata.RawMessage === 'string') {
            try {
              parsedMetadata = JSON.parse(document.metadata.RawMessage);
            } catch (nestedErr) {
              console.error('Error parsing string metadata:', nestedErr);
            }
          }
        }
      }
      
      setMetadata(parsedMetadata);
    } catch (err) {
      console.error('Error handling document metadata:', err);
      setError('Failed to parse document metadata');
    }
  }, [document]);

  if (!document) {
    return (
      <div className="bg-gray-50 rounded p-4 text-center text-gray-500">
        No document selected
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
        <p className="font-semibold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Spinner size="md" />
      </div>
    );
  }

  // Helper function to safely extract file size
  const getFileSize = (size) => {
    if (!size && size !== 0) return 'Unknown';
    return formatFileSize(size);
  };

  // Extract content from nullable field
  const getExtractedContent = () => {
    if (!document.extracted_content) return null;
    if (typeof document.extracted_content === 'string') return document.extracted_content;
    return document.extracted_content.Valid ? document.extracted_content.String : null;
  };

  // Extract file name from nullable field
  const getFileName = () => {
    if (!document.file_name) return 'Unnamed Document';
    if (typeof document.file_name === 'string') return document.file_name;
    return document.file_name.Valid ? document.file_name.String : 'Unnamed Document';
  };

  // Get file type
  const getFileType = () => {
    return document.file_type || 'docx';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-100 p-4 border-b flex items-center">
        <div className="h-10 w-10 bg-blue-100 rounded-md flex items-center justify-center text-blue-500 mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold">{getFileName()}</h3>
          <p className="text-sm text-gray-500">
            {getFileType().toUpperCase()} • {getFileSize(document.file_size)} • Uploaded on {formatDate(document.created_at)}
          </p>
        </div>
      </div>
      
      {/* Document Metadata */}
      {metadata && (
        <div className="p-4 border-b">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Document Metadata</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metadata.title && (
              <div>
                <span className="text-xs text-gray-500">Title</span>
                <p className="text-sm">{metadata.title}</p>
              </div>
            )}
            {metadata.author && (
              <div>
                <span className="text-xs text-gray-500">Author</span>
                <p className="text-sm">{metadata.author}</p>
              </div>
            )}
            {metadata.created && (
              <div>
                <span className="text-xs text-gray-500">Created</span>
                <p className="text-sm">{metadata.created}</p>
              </div>
            )}
            {metadata.modified && (
              <div>
                <span className="text-xs text-gray-500">Modified</span>
                <p className="text-sm">{metadata.modified}</p>
              </div>
            )}
            {metadata.category && (
              <div>
                <span className="text-xs text-gray-500">Category</span>
                <p className="text-sm">{metadata.category}</p>
              </div>
            )}
            {metadata.description && (
              <div className="md:col-span-2">
                <span className="text-xs text-gray-500">Description</span>
                <p className="text-sm">{metadata.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Document Statistics */}
      {metadata && (
        <div className="p-4 border-b">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Document Statistics</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metadata.wordCount !== undefined && (
              <div className="bg-blue-50 p-3 rounded text-center">
                <p className="text-xl font-bold text-blue-600">{metadata.wordCount}</p>
                <p className="text-xs text-blue-700">Words</p>
              </div>
            )}
            {metadata.paragraphCount !== undefined && (
              <div className="bg-green-50 p-3 rounded text-center">
                <p className="text-xl font-bold text-green-600">{metadata.paragraphCount}</p>
                <p className="text-xs text-green-700">Paragraphs</p>
              </div>
            )}
            {metadata.headings && metadata.headings.length > 0 && (
              <div className="bg-purple-50 p-3 rounded text-center">
                <p className="text-xl font-bold text-purple-600">{metadata.headings.length}</p>
                <p className="text-xs text-purple-700">Headings</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Document Content Preview */}
      {getExtractedContent() && (
        <div className="p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Content Preview</h4>
          <div className="bg-gray-50 p-3 rounded border border-gray-200 max-h-60 overflow-y-auto">
            <p className="text-sm whitespace-pre-wrap">
              {getExtractedContent().substring(0, 500)}
              {getExtractedContent().length > 500 && '...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleString();
};

// Make sure to export the component as default
export default DocumentViewer;