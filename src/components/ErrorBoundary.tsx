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
        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-gradient)' }}>
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--danger)', marginBottom: '1rem' }}>
              <AlertCircle size={32} />
              <h1 className="text-2xl font-bold">Something went wrong</h1>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
              <pre style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {this.state.error?.toString()}
                {'\n\n'}
                {this.state.error?.stack}
              </pre>
            </div>
            <button 
              className="glass-button primary" 
              style={{ marginTop: '2rem' }}
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              Clear Data & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
