import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from '@graphwiz/ui-kit';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(ErrorBoundary, { onError: (error, errorInfo) => {
            console.error('Error caught by ErrorBoundary:', error, errorInfo);
            const errorData = {
                timestamp: new Date().toISOString(),
                error: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                userAgent: navigator.userAgent
            };
            console.error('Error data:', errorData);
        }, children: _jsx(App, {}) }) }));
