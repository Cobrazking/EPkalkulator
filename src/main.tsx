import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('Starting EPKalk application...');

// Check if root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found');
  document.body.innerHTML = `
    <div style="padding: 20px; color: white; background: #0A0A0F; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div style="text-align: center;">
        <h1>Feil ved lasting av app</h1>
        <p>Root element ikke funnet</p>
      </div>
    </div>
  `;
} else {
  try {
    console.log('Rendering app...');
    
    // Clear loading content
    rootElement.innerHTML = '';
    
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Failed to render app:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: white; background: #0A0A0F; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="text-align: center;">
          <h1>Feil ved lasting av app</h1>
          <p>Kunne ikke starte applikasjonen</p>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #6366F1; color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 20px;">
            Last inn på nytt
          </button>
          <pre style="margin-top: 20px; font-size: 12px; color: #ccc; text-align: left; max-width: 600px;">${error}</pre>
        </div>
      </div>
    `;
  }
}