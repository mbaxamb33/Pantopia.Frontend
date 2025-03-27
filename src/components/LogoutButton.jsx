// src/components/LogoutButton.jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LogoutButton = ({ 
  className = "", 
  variant = "primary", 
  size = "md",
  showIcon = true
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Button variants
  const variants = {
    primary: "bg-red-600 hover:bg-red-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    outline: "bg-transparent hover:bg-red-50 text-red-600 border border-red-600"
  };

  // Button sizes
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-2 text-base"
  };

  return (
    <button
      onClick={handleLogout}
      className={`
        ${variants[variant]} 
        ${sizes[size]} 
        font-medium rounded flex items-center transition-colors duration-200
        ${className}
      `}
    >
      {showIcon && (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
          />
        </svg>
      )}
      Logout
    </button>
  );
};

export default LogoutButton;