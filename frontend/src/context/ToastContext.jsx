import React, { createContext, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';

// Create context
const ToastContext = createContext(null);

// Toast styles
const toastStyles = {
  success: {
    style: {
      background: '#4caf50',
      color: 'white',
      fontWeight: 'bold',
      padding: '16px',
      borderRadius: '8px',
    },
    iconTheme: {
      primary: 'white',
      secondary: '#4caf50',
    },
    duration: 3000,
  },
  error: {
    style: {
      background: '#f44336',
      color: 'white',
      fontWeight: 'bold',
      padding: '16px',
      borderRadius: '8px',
    },
    iconTheme: {
      primary: 'white',
      secondary: '#f44336',
    },
    duration: 4000,
  },
  info: {
    style: {
      background: '#2196f3',
      color: 'white',
      fontWeight: 'bold',
      padding: '16px',
      borderRadius: '8px',
    },
    iconTheme: {
      primary: 'white',
      secondary: '#2196f3',
    },
    duration: 3000,
  },
  warning: {
    style: {
      background: '#ff9800',
      color: 'white',
      fontWeight: 'bold',
      padding: '16px',
      borderRadius: '8px',
    },
    iconTheme: {
      primary: 'white',
      secondary: '#ff9800',
    },
    duration: 3500,
  },
};

export const ToastProvider = ({ children }) => {
  // Toast notification functions
  const showToast = (message, type = 'default') => {
    switch (type) {
      case 'success':
        toast.success(message, toastStyles.success);
        break;
      case 'error':
        toast.error(message, toastStyles.error);
        break;
      case 'info':
        toast(message, toastStyles.info);
        break;
      case 'warning':
        toast(message, toastStyles.warning);
        break;
      default:
        toast(message);
    }
  };

  // Custom methods for easy access
  const success = (message) => showToast(message, 'success');
  const error = (message) => showToast(message, 'error');
  const info = (message) => showToast(message, 'info');
  const warning = (message) => showToast(message, 'warning');

  const toastActions = {
    showToast,
    success,
    error,
    info,
    warning,
  };

  return (
    <ToastContext.Provider value={toastActions}>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            maxWidth: '500px',
          },
        }}
      />
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}; 