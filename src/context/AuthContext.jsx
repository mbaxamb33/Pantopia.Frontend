// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [idToken, setIdToken] = useState(localStorage.getItem('idToken'));

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (accessToken) {
          // You could validate the token here with your backend or just decode it
          const userData = decodeToken(idToken || accessToken);
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [accessToken, idToken]);

  // A simple function to decode JWT tokens
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
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
    setAccessToken(null);
    setRefreshToken(null);
    setIdToken(null);
    setCurrentUser(null);
    
    // Redirect to your backend logout endpoint
    window.location.href = 'http://localhost:8080/logout';
  };

  // Function to handle tokens after successful authentication
  const handleAuthCallback = (tokens) => {
    const { access_token, refresh_token, id_token } = tokens;

    if (access_token) {
      localStorage.setItem('accessToken', access_token);
      setAccessToken(access_token);
    }

    if (refresh_token) {
      localStorage.setItem('refreshToken', refresh_token);
      setRefreshToken(refresh_token);
    }

    if (id_token) {
      localStorage.setItem('idToken', id_token);
      setIdToken(id_token);
      const userData = decodeToken(id_token);
      setCurrentUser(userData);
    }
  };

  // Function to refresh tokens
  const refreshAccessToken = async () => {
    if (!refreshToken) return null;

    try {
      const response = await fetch('http://localhost:8080/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) throw new Error('Failed to refresh token');

      const data = await response.json();
      
      if (data.access_token) {
        localStorage.setItem('accessToken', data.access_token);
        setAccessToken(data.access_token);
      }
      
      if (data.id_token) {
        localStorage.setItem('idToken', data.id_token);
        setIdToken(data.id_token);
      }
      
      return data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout(); // Logout on refresh failure
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