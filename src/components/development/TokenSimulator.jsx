// src/components/development/TokenSimulator.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * This component is for DEVELOPMENT use only!
 * It allows simulating token expiration without waiting for the real timer.
 */
const TokenSimulator = () => {
  const { tokenExpiry, isTokenExpired, refreshAccessToken } = useAuth();
  const [showSimulator, setShowSimulator] = useState(false);

  const handleExpireToken = () => {
    // Directly manipulate the token expiry in localStorage to simulate expiration
    localStorage.setItem('tokenExpiry', (Date.now() - 1000).toString());
    
    // Force a page reload to apply the change
    window.location.reload();
  };

  const handleSetShortExpiry = () => {
    // Set token to expire in 30 seconds
    localStorage.setItem('tokenExpiry', (Date.now() + 30000).toString());
    
    // Force a page reload to apply the change
    window.location.reload();
  };

  if (!showSimulator) {
    return (
      <button 
        onClick={() => setShowSimulator(true)}
        className="fixed bottom-4 right-4 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-xs px-2 py-1 rounded-full shadow-lg"
      >
        Dev Tools
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 w-72">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold">Dev: Auth Simulator</h3>
        <button 
          onClick={() => setShowSimulator(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Current status:</span>
          <span className={isTokenExpired() ? 'text-red-400' : 'text-green-400'}>
            {isTokenExpired() ? 'Expired' : 'Valid'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Expires at:</span>
          <span>{new Date(tokenExpiry).toLocaleTimeString()}</span>
        </div>
        
        <div className="pt-2 space-y-2">
          <button
            onClick={handleExpireToken}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded text-xs"
          >
            Simulate Expired Token
          </button>
          
          <button
            onClick={handleSetShortExpiry}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-1 px-2 rounded text-xs"
          >
            Set 30 Second Expiry
          </button>
          
          <button
            onClick={refreshAccessToken}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-xs"
          >
            Refresh Token Now
          </button>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        This tool is for development only and will not appear in production.
      </div>
    </div>
  );
};

export default TokenSimulator;