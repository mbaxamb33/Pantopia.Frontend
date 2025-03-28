// src/context/AuthContext.jsx - Updated with better token handling
import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [idToken, setIdToken] = useState(localStorage.getItem('idToken'));
  // Add token expiry tracking
  const [tokenExpiry, setTokenExpiry] = useState(parseInt(localStorage.getItem('tokenExpiry')) || 0);

  // Setup token expiry checker
  useEffect(() => {
    if (accessToken && tokenExpiry) {
      const now = Date.now();
      if (now >= tokenExpiry) {
        console.log('Token expired, attempting refresh');
        refreshAccessToken();
      } else {
        // Set timer to refresh token before it expires
        const timeUntilExpiry = tokenExpiry - now;
        const timeToRefresh = Math.max(0, timeUntilExpiry - 60000); // Refresh 1 minute before expiry
        
        const refreshTimer = setTimeout(() => {
          console.log('Token nearing expiry, refreshing');
          refreshAccessToken();
        }, timeToRefresh);
        
        return () => clearTimeout(refreshTimer);
      }
    }
  }, [accessToken, tokenExpiry]);

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (accessToken) {
          // Validate the token by fetching user info
          const response = await apiClient.get('/users/me', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });

          if (response.status === 200 && response.data) {
            setCurrentUser(response.data);
          } else {
            // If fetching user info fails, try to refresh the token
            const newToken = await refreshAccessToken();
            if (!newToken) {
              logout();
            }
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        // Only logout if the error is 401 Unauthorized
        if (error.response?.status === 401) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [accessToken]);

  // Function to check if token is expired
  const isTokenExpired = () => {
    if (!tokenExpiry) return true;
    return Date.now() >= tokenExpiry;
  };

  // Function to initiate AWS Cognito login
  const login = () => {
    // Redirect to your backend auth endpoint which will redirect to Cognito
    window.location.href = 'http://localhost:8080/login';
  };

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('tokenExpiry');
    setAccessToken(null);
    setRefreshToken(null);
    setIdToken(null);
    setTokenExpiry(0);
    setCurrentUser(null);
    
    // Redirect to your backend logout endpoint
    window.location.href = 'http://localhost:8080/logout';
  };

  // Function to handle tokens after successful authentication
  const handleAuthCallback = (tokens) => {
    const { access_token, refresh_token, id_token, expires_in } = tokens;

    console.log('Received tokens:', { 
      access_token: access_token ? 'Present' : 'Missing', 
      refresh_token: refresh_token ? 'Present' : 'Missing', 
      id_token: id_token ? 'Present' : 'Missing',
      expires_in: expires_in || '3600 (default)'
    });

    // Calculate token expiry time
    const expiryTime = Date.now() + ((expires_in || 3600) * 1000);
    
    if (access_token) {
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('tokenExpiry', expiryTime.toString());
      setAccessToken(access_token);
      setTokenExpiry(expiryTime);
    }

    if (refresh_token) {
      localStorage.setItem('refreshToken', refresh_token);
      setRefreshToken(refresh_token);
    }

    if (id_token) {
      localStorage.setItem('idToken', id_token);
      setIdToken(id_token);
    }

    // Attempt to fetch user info to confirm authentication
    apiClient.get('/users/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    })
    .then(response => {
      if (response.status === 200 && response.data) {
        setCurrentUser(response.data);
      } else {
        throw new Error('Failed to fetch user info');
      }
    })
    .catch(error => {
      console.error('Error fetching user info:', error);
      // Don't logout here, give the token a chance
    });
  };

  // Function to refresh tokens
  const refreshAccessToken = async () => {
    if (!refreshToken) return null;

    try {
      const response = await apiClient.post('/refresh-token', {
        refresh_token: refreshToken
      });

      if (response.status !== 200) throw new Error('Failed to refresh token');

      const data = response.data;
      
      console.log('Refresh token response:', { 
        access_token: data.access_token ? 'Present' : 'Missing', 
        id_token: data.id_token ? 'Present' : 'Missing',
        expires_in: data.expires_in || '3600 (default)'
      });

      // Calculate new token expiry time
      const newExpiryTime = Date.now() + ((data.expires_in || 3600) * 1000);
      
      if (data.access_token) {
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('tokenExpiry', newExpiryTime.toString());
        setAccessToken(data.access_token);
        setTokenExpiry(newExpiryTime);
      }
      
      if (data.id_token) {
        localStorage.setItem('idToken', data.id_token);
        setIdToken(data.id_token);
      }
      
      return data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Only logout if there's an error with the refresh token itself
      if (error.response?.status === 400 || error.response?.status === 401) {
        logout();
      }
      return null;
    }
  };

  const value = {
    currentUser,
    isLoading,
    accessToken,
    idToken,
    login,
    logout,
    handleAuthCallback,
    refreshAccessToken,
    isAuthenticated: !!currentUser,
    tokenExpiry,
    isTokenExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};