// src/pages/Login.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to Pantopia</h1>
        <p className="mb-6 text-gray-600 text-center">
          Sign in to access your dashboard
        </p>
        
        <button
          onClick={login}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition duration-200"
        >
          Sign in with AWS Cognito
        </button>
        
        <div className="mt-4 text-center">
          <span className="text-gray-600 text-sm">
            Don't have an account? Contact your administrator.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;