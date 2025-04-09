// src/App.jsx
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { setupInterceptors } from './api/apiClient';


import CompanyDetail from './pages/companies/CompanyDetail';
import ProjectDetail from './pages/projects/ProjectDetail';
import ConversationDetail from './pages/conversations/ConversationDetail';
// Layout & Protected Route
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Companies from './pages/Companies';
import Projects from './pages/Projects';
import Conversations from './pages/Conversations';
import Meetings from './pages/Meetings';
import SalesFlows from './pages/SalesFlows';
import Settings from './pages/Settings';
import Integrations from './pages/Integrations';
import NotFound from './pages/NotFound';

import Products from './pages/Products';
import ProductDetail from './pages/products/ProductDetail';
import ProductEdit from './pages/products/ProductEdit';


import Agents from './pages/Agents';
import AgentDetail from './pages/agents/AgentDetail';
import AgentEdit from './pages/agents/AgentEdit';


// Entity Detail Pages
import ContactDetail from './pages/contacts/ContactDetail';
// import CompanyDetail from './pages/companies/CompanyDetail';
// import ProjectDetail from './pages/projects/ProjectDetail';
// import ConversationDetail from './pages/conversations/ConversationDetail';

// Notification Context
import { NotificationProvider } from './context/NotificationContext';

function App() {
  const { accessToken, refreshAccessToken, logout } = useAuth();
  const [appReady, setAppReady] = useState(false);

  // Setup API interceptors with auth functions
  useEffect(() => {
    setupInterceptors(
      () => accessToken,
      refreshAccessToken,
      logout
    );
    setAppReady(true);
  }, [accessToken, refreshAccessToken, logout]);

  if (!appReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/callback" element={<AuthCallback />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />


              <Route path="/agents" element={<Agents />} />
              <Route path="/agents/:id" element={<AgentDetail />} />
              <Route path="/agents/:id/edit" element={<AgentEdit />} />


              <Route path="/integrations" element={<Integrations />} />


              
              {/* Contacts routes */}
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/contacts/:id" element={<ContactDetail />} />
              
              {/* Companies routes */}
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:id" element={<CompanyDetail />} />
              
              {/* Projects routes */}
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              
              {/* Conversations routes */}
              <Route path="/conversations" element={<Conversations />} />
              <Route path="/conversations/:id" element={<ConversationDetail />} />
              
              {/* Other routes */}
              <Route path="/meetings" element={<Meetings />} />
              <Route path="/sales-flows" element={<SalesFlows />} />
              <Route path="/settings" element={<Settings />} />


              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/products/:id/edit" element={<ProductEdit />} />
            </Route>
          </Route>
          
          {/* Handled by ProtectedRoute - redirects to home if not authenticated */}
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;