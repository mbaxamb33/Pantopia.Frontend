// src/App.jsx
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { setupInterceptors } from './api/apiClient';

// Layout
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
import NotFound from './pages/NotFound';

function App() {
  const { accessToken, refreshAccessToken, logout } = useAuth();

  // Setup API interceptors with auth functions
  useEffect(() => {
    setupInterceptors(
      () => accessToken,
      refreshAccessToken,
      logout
    );
  }, [accessToken, refreshAccessToken, logout]);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/callback" element={<AuthCallback />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/sales-flows" element={<SalesFlows />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
        
        {/* Handled by ProtectedRoute - redirects to home if not authenticated */}
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;