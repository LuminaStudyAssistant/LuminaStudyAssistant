
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill process.env for browser environment to prevent ReferenceErrors
// This ensures that 'process.env.API_KEY' doesn't crash the app on deployment.
if (typeof window !== 'undefined') {
  (window as any).process = {
    env: {
      API_KEY: (window as any).process?.env?.API_KEY || ''
    },
    ...(window as any).process || {}
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
