// src/pages/Integrations.jsx
import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';
import apiClient from '../api/apiClient';
import { useSearchParams } from 'react-router-dom';

const Integrations = () => {
  const notification = useNotification();
  const { accessToken } = useAuth();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [gmailIntegration, setGmailIntegration] = useState({
    isConnected: false,
    email: null,
    lastRefreshed: null
  });

  // Check for Gmail connection success from query params
  useEffect(() => {
    const gmailConnected = searchParams.get('gmail_connected');
    if (gmailConnected === 'true') {
      notification.showSuccess('Success', 'Gmail account connected successfully');
    }
  }, [searchParams, notification]);

  // Check Gmail integration status on component mount
  useEffect(() => {
    const checkGmailIntegration = async () => {
      try {
        const response = await apiClient.get('/gmail/auth', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        setGmailIntegration({
          isConnected: response.data.is_connected,
          email: response.data.email,
          lastRefreshed: response.data.last_refreshed 
            ? new Date(response.data.last_refreshed).toLocaleString() 
            : null
        });
      } catch (error) {
        console.error('Error checking Gmail integration:', error);
        notification.showError('Error', 'Failed to check Gmail integration status');
      }
    };

    if (accessToken) {
      checkGmailIntegration();
    }
  }, [accessToken, notification]);

  const handleConnectGmail = async () => {
    try {
      // First, get the Gmail auth URL with the current access token
      const response = await apiClient.get('/gmail/auth', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      // If the response includes a direct URL, use that
      if (response.data.auth_url) {
        window.location.href = response.data.auth_url;
      } else {
        // Fallback to the default endpoint
        window.location.href = 'http://localhost:8080/gmail/auth';
      }
    } catch (error) {
      console.error('Error initiating Gmail connection:', error);
      notification.showError('Error', 'Failed to initiate Gmail connection');
    }
  };

  const handleRefreshGmailToken = async () => {
    try {
      setIsLoading(true);
      
      const response = await apiClient.post('/refresh-token-proactive', {}, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      notification.showSuccess('Success', 'Gmail token refreshed successfully');
      
      // Update integration status
      setGmailIntegration(prev => ({
        ...prev,
        lastRefreshed: new Date().toLocaleString()
      }));
    } catch (error) {
      console.error('Error refreshing Gmail token:', error);
      notification.showError('Error', 'Failed to refresh Gmail token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Integrations</h1>

      {/* Gmail Integration */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Gmail</h2>
            <p className="text-gray-500 text-sm">
              {gmailIntegration.isConnected 
                ? `Connected with ${gmailIntegration.email}` 
                : 'Not connected'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {!gmailIntegration.isConnected ? (
              <button
                onClick={handleConnectGmail}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                Connect Gmail
              </button>
            ) : (
              <button
                onClick={handleRefreshGmailToken}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-200 flex items-center disabled:opacity-50"
              >
                {isLoading ? (
                  <Spinner size="sm" color="white" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                Refresh Token
              </button>
            )}
          </div>
        </div>

        {gmailIntegration.isConnected && (
          <div className="mt-4 bg-gray-50 p-3 rounded text-sm text-gray-600">
            <p>
              <strong>Last Refreshed:</strong>{' '}
              {gmailIntegration.lastRefreshed || 'Not available'}
            </p>
          </div>
        )}
      </div>

      {/* Placeholder for future integrations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Other Integrations</h2>
        <p className="text-gray-500 text-center">
          More integrations coming soon!
        </p>
      </div>

      {isLoading && <Spinner fullPage />}
    </div>
  );
};

export default Integrations;