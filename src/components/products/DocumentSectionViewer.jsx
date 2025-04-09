// src/components/products/DocumentSectionViewer.jsx
import { useState, useEffect } from 'react';
import Spinner from '../ui/Spinner';
import apiClient from '../../api/apiClient';

const DocumentSectionViewer = ({ documentId }) => {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    const fetchDocumentSections = async () => {
      if (!documentId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.get(`/documents/${documentId}/sections`, {
          params: { page_id: 1, page_size: 100 }
        });
        
        const fetchedSections = response.data || [];
        setSections(fetchedSections);
        
        // Initially expand top-level sections
        const initialExpanded = {};
        fetchedSections.forEach(section => {
          if (!section.parent_id || !section.parent_id.Valid) {
            initialExpanded[section.id] = true;
          }
        });
        setExpandedSections(initialExpanded);
      } catch (err) {
        console.error(`Error fetching sections for document ${documentId}:`, err);
        setError('Failed to load document sections');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentSections();
  }, [documentId]);

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Build nested section hierarchy
  const buildSectionTree = () => {
    const sectionMap = {};
    const rootSections = [];
    
    // First pass: create section objects in map
    sections.forEach(section => {
      sectionMap[section.id] = {
        ...section,
        children: []
      };
    });
    
    // Second pass: build parent-child relationships
    sections.forEach(section => {
      if (section.parent_id && section.parent_id.Valid && section.parent_id.Int64 > 0) {
        const parentId = section.parent_id.Int64;
        if (sectionMap[parentId]) {
          sectionMap[parentId].children.push(sectionMap[section.id]);
        } else {
          // If parent not found, treat as root
          rootSections.push(sectionMap[section.id]);
        }
      } else {
        // Section has no parent, it's a root section
        rootSections.push(sectionMap[section.id]);
      }
    });
    
    // Sort sections by their order
    rootSections.sort((a, b) => a.section_order - b.section_order);
    
    return rootSections;
  };

  // Render a section and its children recursively
  const renderSection = (section, depth = 0) => {
    const isExpanded = expandedSections[section.id];
    const hasChildren = section.children && section.children.length > 0;
    
    return (
      <div 
        key={section.id} 
        className="border-l-2 border-gray-200 pl-4 mb-4"
        style={{ marginLeft: `${depth * 16}px` }}
      >
        <div 
          className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded"
          onClick={() => toggleSection(section.id)}
        >
          {hasChildren && (
            <span className="mt-1 mr-2 text-gray-500">
              {isExpanded ? '▼' : '►'}
            </span>
          )}
          <div className="flex-1">
            <h3 className={`font-medium ${getHeadingClass(section.level)}`}>
              {section.title}
            </h3>
            
            {isExpanded && (
              <div className="mt-2 text-gray-700 whitespace-pre-wrap">
                {section.content}
              </div>
            )}
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="mt-2">
            {section.children
              .sort((a, b) => a.section_order - b.section_order)
              .map(child => renderSection(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Get appropriate heading class based on level
  const getHeadingClass = (level) => {
    switch (level) {
      case 1: return 'text-xl text-gray-900';
      case 2: return 'text-lg text-gray-800';
      case 3: return 'text-base text-gray-800';
      default: return 'text-sm text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded bg-red-50 text-red-600">
        <p className="font-semibold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="p-4 border border-gray-200 rounded bg-gray-50 text-gray-500 text-center">
        No sections found for this document.
      </div>
    );
  }

  const sectionTree = buildSectionTree();

  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Document Sections</h2>
      <div className="mt-4">
        {sectionTree.map(section => renderSection(section))}
      </div>
    </div>
  );
};

export default DocumentSectionViewer;