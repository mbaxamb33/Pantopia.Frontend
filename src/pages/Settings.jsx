// src/pages/Settings.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { currentUser } = useAuth();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white p-6 rounded shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        {currentUser && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">User ID</label>
              <div className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded">
                {currentUser.sub || currentUser.cognito_sub || 'Not available'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded">
                {currentUser.email || 'Not available'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <div className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded">
                {currentUser.name || 'Not available'}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-semibold mb-4">Authentication Details</h2>
        <p className="text-gray-500 text-sm mb-4">
          This shows your current authentication information. Useful for debugging.
        </p>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-60">
          {JSON.stringify(currentUser, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default Settings;