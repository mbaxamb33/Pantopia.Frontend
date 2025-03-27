// src/components/Layout.jsx
import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-blue-800 text-white transition-width duration-300 ease-in-out h-screen`}
      >
        <div className="p-4 flex justify-between items-center">
          {isSidebarOpen && <h1 className="text-xl font-bold">Pantopia</h1>}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded hover:bg-blue-700 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isSidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        <nav className="mt-8">
          <NavItem to="/dashboard" icon="📊" label="Dashboard" isSidebarOpen={isSidebarOpen} />
          <NavItem to="/contacts" icon="👥" label="Contacts" isSidebarOpen={isSidebarOpen} />
          <NavItem to="/companies" icon="🏢" label="Companies" isSidebarOpen={isSidebarOpen} />
          <NavItem to="/projects" icon="📁" label="Projects" isSidebarOpen={isSidebarOpen} />
          <NavItem to="/conversations" icon="💬" label="Conversations" isSidebarOpen={isSidebarOpen} />
          <NavItem to="/meetings" icon="📅" label="Meetings" isSidebarOpen={isSidebarOpen} />
          <NavItem to="/sales-flows" icon="🔄" label="Sales Flows" isSidebarOpen={isSidebarOpen} />
          <NavItem to="/settings" icon="⚙️" label="Settings" isSidebarOpen={isSidebarOpen} />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
            
            <div className="flex items-center">
              {currentUser && (
                <div className="relative">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-700">
                      {currentUser.name || currentUser.email || 'User'}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// NavItem component
const NavItem = ({ to, icon, label, isSidebarOpen }) => (
  <Link
    to={to}
    className="flex items-center py-2 px-4 text-gray-200 hover:bg-blue-700 transition duration-200"
  >
    <span className="w-6 text-center">{icon}</span>
    {isSidebarOpen && <span className="ml-3">{label}</span>}
  </Link>
);

export default Layout;