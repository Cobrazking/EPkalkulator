import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add error boundary for better debugging
class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if ((this.state as any).hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          color: 'white', 
          backgroundColor: '#0A0A0F',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <h1>Noe gikk galt</h1>
          <p>Appen kunne ikke lastes. Sjekk konsollen for mer informasjon.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6366F1',
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
      );
    }

    return (this.props as any).children;
  }
}

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
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
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
        </div>
      </div>
    `;
  }
}