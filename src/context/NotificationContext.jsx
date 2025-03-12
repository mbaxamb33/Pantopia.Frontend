// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../components/ui/Notification';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add new notification
  const addNotification = useCallback((notification) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, ...notification }]);
    return id;
  }, []);

  // Remove notification by id
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Shorthand methods for different notification types
  const showSuccess = useCallback((title, message, duration = 5000) => {
    return addNotification({ type: 'success', title, message, duration });
  }, [addNotification]);

  const showError = useCallback((title, message, duration = 8000) => {
    return addNotification({ type: 'error', title, message, duration });
  }, [addNotification]);

  const showInfo = useCallback((title, message, duration = 5000) => {
    return addNotification({ type: 'info', title, message, duration });
  }, [addNotification]);

  const showWarning = useCallback((title, message, duration = 5000) => {
    return addNotification({ type: 'warning', title, message, duration });
  }, [addNotification]);

  // Value to provide to consumer components
  const value = {
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
        {notifications.map(({ id, ...props }) => (
          <Notification
            key={id}
            {...props}
            onClose={() => removeNotification(id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};