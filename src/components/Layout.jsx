// src/components/Layout.jsx
import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pageTitle, setPageTitle] = useState('Dashboard');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Update page title based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/dashboard')) {
      setPageTitle('Dashboard');
    } else if (path.includes('/contacts')) {
      if (path.includes('/contacts/')) {
        setPageTitle('Contact Details');
      } else {
        setPageTitle('Contacts');
      }
    } else if (path.includes('/companies')) {
      setPageTitle('Companies');
    } else if (path.includes('/projects')) {
      setPageTitle('Projects');
    } else if (path.includes('/conversations')) {
      setPageTitle('Conversations');
    } else if (path.includes('/meetings')) {
      setPageTitle('Meetings');
    } else if (path.includes('/sales-flows')) {
      setPageTitle('Sales Flows');
    } else if (path.includes('/settings')) {
      setPageTitle('Settings');
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-blue-800 text-white transition-all duration-300 ease-in-out h-screen fixed`}
      >
        <div className="p-4 flex justify-between items-center border-b border-blue-700">
          {isSidebarOpen ? (
            <h1 className="text-xl font-bold">Pantopia</h1>
          ) : (
            <h1 className="text-xl font-bold">P</h1>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded hover:bg-blue-700 focus:outline-none"
          >
            {isSidebarOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        <nav className="mt-6">
          <NavItem 
            to="/dashboard" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>} 
            label="Dashboard" 
            isSidebarOpen={isSidebarOpen}
            isActive={location.pathname === '/dashboard'} 
          />
          <NavItem 
            to="/contacts" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>} 
            label="Contacts" 
            isSidebarOpen={isSidebarOpen} 
            isActive={location.pathname.includes('/contacts')}
          />
          <NavItem 
            to="/companies" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>} 
            label="Companies" 
            isSidebarOpen={isSidebarOpen} 
            isActive={location.pathname.includes('/companies')}
          />
          <NavItem 
            to="/projects" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>} 
            label="Projects" 
            isSidebarOpen={isSidebarOpen} 
            isActive={location.pathname.includes('/projects')}
          />
          <NavItem 
            to="/conversations" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>} 
            label="Conversations" 
            isSidebarOpen={isSidebarOpen} 
            isActive={location.pathname.includes('/conversations')}
          />
          <NavItem 
            to="/meetings" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>} 
            label="Meetings" 
            isSidebarOpen={isSidebarOpen} 
            isActive={location.pathname.includes('/meetings')}
          />
          <NavItem 
            to="/sales-flows" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>} 
            label="Sales Flows" 
            isSidebarOpen={isSidebarOpen} 
            isActive={location.pathname.includes('/sales-flows')}
          />
          <NavItem 
            to="/settings" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>} 
            label="Settings" 
            isSidebarOpen={isSidebarOpen} 
            isActive={location.pathname.includes('/settings')}
          />
        </nav>
      </div>

      {/* Main Content */}
      <div className={`flex flex-col flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out`}>
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">{pageTitle}</h2>
            
            <div className="flex items-center">
              {currentUser && (
                <div className="relative group">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold mr-2">
                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="text-gray-700">
                        {currentUser.name || currentUser.email || 'User'}
                      </span>
                    </div>
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
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// NavItem component
const NavItem = ({ to, icon, label, isSidebarOpen, isActive }) => (
  <Link
    to={to}
    className={`flex items-center py-3 px-4 ${
      isActive 
        ? 'bg-blue-700 text-white' 
        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
    } transition duration-200`}
  >
    <span className="min-w-[20px]">{icon}</span>
    {isSidebarOpen && <span className="ml-4 text-sm font-medium">{label}</span>}
  </Link>
);

export default Layout;