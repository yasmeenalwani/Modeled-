import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { clearMockData } from './utils/mockDataService'

console.log('Starting app...');
console.log('Root element:', document.getElementById('root'));

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  const root = document.getElementById('root');
  if (root) {
    root.style.background = 'red';
    root.style.color = 'white';
    root.style.padding = '2rem';
    root.innerHTML = `
      <h1>Error Loading App</h1>
      <p>${event.error?.message || 'Unknown error'}</p>
      <pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; overflow: auto;">
        ${event.error?.stack || 'No stack trace'}
      </pre>
    `;
  }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const root = document.getElementById('root');

// Demo reset helper (query param or console)
try {
  const url = new URL(window.location.href);
  if (url.searchParams.has('resetDemo')) {
    clearMockData();
    url.searchParams.delete('resetDemo');
    window.history.replaceState({}, '', url.toString());
  }
  window.resetDemoData = () => {
    clearMockData();
    window.location.reload();
  };
} catch (error) {
  console.warn('Demo reset helper unavailable:', error);
}
if (root) {
  // Set a test background to verify root exists
  root.style.minHeight = '100vh';
  root.style.background = '#FFFEF9';
  
  try {
    console.log('Creating React root...');
    const reactRoot = createRoot(root);
    console.log('Rendering App component...');
    reactRoot.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log('App rendered successfully!');
  } catch (error) {
    console.error('Error rendering app:', error);
    root.style.background = 'red';
    root.style.color = 'white';
    root.style.padding = '2rem';
    root.innerHTML = `
      <h1>Error Rendering App</h1>
      <p>${error.message}</p>
      <pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; overflow: auto; max-height: 400px;">
        ${error.stack}
      </pre>
      <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: white; color: red; border: none; border-radius: 4px; cursor: pointer;">
        Reload Page
      </button>
    `;
  }
} else {
  document.body.innerHTML = '<div style="padding: 2rem; background: red; color: white;"><h1>ROOT NOT FOUND</h1><p>The #root element is missing from the HTML.</p></div>';
}
