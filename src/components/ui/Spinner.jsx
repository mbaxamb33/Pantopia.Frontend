// src/components/ui/Spinner.jsx
import React from 'react';

const Spinner = ({ size = 'md', color = 'blue', fullPage = false }) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4'
  };

  // Color classes
  const colorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
    yellow: 'border-yellow-500',
    purple: 'border-purple-500',
    gray: 'border-gray-500',
    white: 'border-white'
  };

  const spinnerClasses = `
    animate-spin rounded-full 
    ${sizeClasses[size] || sizeClasses.md} 
    ${colorClasses[color] || colorClasses.blue}
    border-t-transparent
  `;

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div className={spinnerClasses}></div>
      </div>
    );
  }

  return <div className={spinnerClasses}></div>;
};

export default Spinner;