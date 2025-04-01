// src/pages/AuthCallback.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const AuthCallback = () => {
  const [error, setError] = useState('');
  const { handleAuthCallback } = useAuth();
  const navigate = useNavigate();
  const notification = useNotification();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Log all query parameters for debugging
        const queryParams = new URLSearchParams(window.location.search);
        console.log('Callback Query Params:', Object.fromEntries(queryParams));

        // Check for Gmail-specific callback
        if (queryParams.has('code') && queryParams.has('state')) {
          console.log('Detected Gmail callback');
          
          // Redirect to integrations page with success query parameter
          navigate('/integrations?gmail_connected=true');
          return;
        }
        
        // Existing authentication logic remains the same...
        if (queryParams.has('access_token') && queryParams.has('id_token')) {
          const tokens = {
            access_token: queryParams.get('access_token'),
            id_token: queryParams.get('id_token'),
            refresh_token: queryParams.get('refresh_token')
          };
          
          handleAuthCallback(tokens);
          navigate('/dashboard');
          return;
        }
        
        // If we get a code from AWS Cognito that needs to be exchanged
        if (queryParams.has('code')) {
          // Fetch the tokens from your backend endpoint
          const response = await fetch(`http://localhost:8080/callback?${queryParams.toString()}`);
          
          if (!response.ok) {
            throw new Error('Failed to exchange code for tokens');
          }
          
          const tokens = await response.json();
          handleAuthCallback(tokens);
          navigate('/dashboard');
          return;
        }
        
        // If the API returns the tokens in the page (check for message property)
        if (queryParams.has('message') && queryParams.get('message') === 'User authenticated') {
          const tokens = {
            access_token: queryParams.get('access_token'),
            id_token: queryParams.get('id_token'),
            refresh_token: queryParams.get('refresh_token')
          };
          
          handleAuthCallback(tokens);
          navigate('/dashboard');
          return;
        }
        
        // If tokens are in the URL hash (implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        if (hashParams.has('access_token')) {
          const tokens = {
            access_token: hashParams.get('access_token'),
            id_token: hashParams.get('id_token'),
            refresh_token: hashParams.get('refresh_token')
          };
          
          handleAuthCallback(tokens);
          navigate('/dashboard');
          return;
        }
        
        // Fallback: If tokens are not in the URL, try to fetch them from the current endpoint
        const response = await fetch(window.location.href);
        if (response.ok) {
          const tokens = await response.json();
          if (tokens && tokens.access_token && tokens.id_token) {
            handleAuthCallback(tokens);
            navigate('/dashboard');
            return;
          }
        }
        
        setError('No authentication tokens found in the response');
      } catch (err) {
        console.error('Error processing callback:', err);
        setError('Authentication failed: ' + (err.message || 'Unknown error'));
      }
    };

    processCallback();
  }, [handleAuthCallback, navigate, notification]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => navigate('/')} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">Completing authentication...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback;