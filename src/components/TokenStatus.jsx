// src/components/TokenStatus.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const TokenStatus = ({ showDetails = false }) => {
  const { tokenExpiry, isTokenExpired, refreshAccessToken } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showFullDetails, setShowFullDetails] = useState(showDetails);

  // Update time remaining every second
  useEffect(() => {
    if (!tokenExpiry) return;

    const updateTimeRemaining = () => {
      const now = Date.now();
      const remainingMs = Math.max(0, tokenExpiry - now);
      
      if (remainingMs <= 0) {
        setTimeRemaining('Expired');
        return;
      }
      
      // Format remaining time
      const minutes = Math.floor(remainingMs / 60000);
      const seconds = Math.floor((remainingMs % 60000) / 1000);
      
      setTimeRemaining(`${minutes}m ${seconds}s`);
    };
    
    // Update immediately
    updateTimeRemaining();
    
    // Update every second
    const interval = setInterval(updateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [tokenExpiry]);

  // Force token refresh
  const handleRefreshToken = async () => {
    await refreshAccessToken();
  };

  // Status color based on time remaining
  const getStatusColor = () => {
    if (!tokenExpiry || isTokenExpired()) return 'bg-red-100 text-red-800';
    
    const remainingMs = tokenExpiry - Date.now();
    if (remainingMs < 300000) return 'bg-red-100 text-red-800'; // Less than 5 minutes
    if (remainingMs < 600000) return 'bg-yellow-100 text-yellow-800'; // Less than 10 minutes
    return 'bg-green-100 text-green-800';
  };

  if (!tokenExpiry) {
    return (
      <div className="text-gray-500 text-xs">
        No active session
      </div>
    );
  }

  return (
    <div className="text-xs">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded-full ${getStatusColor()}`}>
          {isTokenExpired() ? 'Expired' : 'Active'}
        </span>
        
        {!isTokenExpired() && (
          <span className="text-gray-600">
            Expires in: {timeRemaining}
          </span>
        )}
        
        <button
          onClick={handleRefreshToken}
          className="text-blue-600 hover:text-blue-800 text-xs underline"
        >
          Refresh
        </button>
        
        <button
          onClick={() => setShowFullDetails(!showFullDetails)}
          className="text-gray-600 hover:text-gray-800"
        >
          {showFullDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {showFullDetails && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-gray-700">
          <div>
            <strong>Expiry:</strong> {new Date(tokenExpiry).toLocaleString()}
          </div>
          <div>
            <strong>Status:</strong> {isTokenExpired() ? 'Expired' : 'Valid'}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenStatus;