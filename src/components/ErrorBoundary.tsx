import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0a0a0a' }}>
          <div className="glass-panel" style={{ padding: '3rem', maxWidth: '600px', width: '100%', borderTop: '4px solid #ef4444', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', color: '#ef4444', marginBottom: '1.5rem' }}>
              <AlertCircle size={48} />
            </div>
            <h1 className="text-3xl font-bold mb-4">Application Error</h1>
            <p className="text-secondary mb-6 text-lg">
              We encountered an unexpected error while rendering this page.
            </p>
            
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1.5rem', borderRadius: '12px', overflowX: 'auto', textAlign: 'left', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <pre style={{ color: '#fca5a5', fontSize: '0.875rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                {this.state.error?.toString()}
              </pre>
            </div>

            <p className="text-sm text-secondary mb-6">
              If this problem persists, you may need to clear your local cache and restart the app.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                className="glass-button" 
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
              <button 
                className="glass-button primary" 
                style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
              >
                Clear Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
