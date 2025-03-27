// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// Add error boundary for better debugging
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border-2 border-red-500 rounded-md m-6 text-left">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Something went wrong</h1>
          <details className="whitespace-pre-wrap">
            <summary className="text-lg font-semibold mb-2 cursor-pointer">Show Error Details</summary>
            <p className="text-red-600 mb-2">{this.state.error?.toString()}</p>
            <p className="text-gray-700 text-sm overflow-auto max-h-96">
              {this.state.errorInfo?.componentStack}
            </p>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

console.log("Starting to render React application...");

// Verify DOM element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Failed to find the root element. Make sure there is a div with id='root' in index.html");
  // Create a visible error on the page
  document.body.innerHTML = `
    <div style="padding: 20px; background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 5px; margin: 20px;">
      <h2>Rendering Error</h2>
      <p>Failed to find the root element. Make sure there is a div with id='root' in index.html</p>
    </div>
  `;
} else {
  console.log("Root element found, mounting React application...");
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ErrorBoundary>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log("React application mounted successfully");
  } catch (error) {
    console.error("Failed to render React application:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 5px; margin: 20px;">
        <h2>Rendering Error</h2>
        <p>${error.message}</p>
        <pre>${error.stack}</pre>
      </div>
    `;
  }
}