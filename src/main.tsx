import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('🚀 Starting EPKalk application...');

// Simple error boundary component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Error in app:', error);
    return (
      <div style={{
        padding: '20px',
        color: 'white',
        background: '#0A0A0F',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1>Feil ved lasting av app</h1>
          <p>Noe gikk galt. Prøv å laste siden på nytt.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: '#6366F1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Last inn på nytt
          </button>
        </div>
      </div>
    );
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found');
  document.body.innerHTML = `
    <div style="padding: 20px; color: white; background: #0A0A0F; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div style="text-align: center;">
        <h1>Feil ved lasting av app</h1>
        <p>Root element ikke funnet</p>
      </div>
    </div>
  `;
} else {
  console.log('✅ Root element found, rendering app...');
  
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
    console.log('✅ App rendered successfully');
  } catch (error) {
    console.error('❌ Failed to render app:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: white; background: #0A0A0F; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="text-align: center;">
          <h1>Feil ved lasting av app</h1>
          <p>Kunne ikke starte applikasjonen</p>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #6366F1; color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 20px;">
            Last inn på nytt
          </button>
          <details style="margin-top: 20px; text-align: left;">
            <summary style="cursor: pointer;">Vis feildetaljer</summary>
            <pre style="font-size: 12px; color: #ccc; margin-top: 10px; max-width: 600px; overflow: auto;">${error}</pre>
          </details>
        </div>
      </div>
    `;
  }
}