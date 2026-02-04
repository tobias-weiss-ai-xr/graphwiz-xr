import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@graphwiz/ui-kit';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('Error caught by ErrorBoundary:', error, errorInfo);
          const errorData = {
            timestamp: new Date().toISOString(),
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            userAgent: navigator.userAgent
          };
          console.error('Error data:', errorData);
        }}
      >
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
