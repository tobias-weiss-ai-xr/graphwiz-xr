import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch errors in component tree
 * and display a fallback UI instead of crashing the entire app
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            background: '#1a1a1a',
            color: '#ffffff'
          }}
        >
          <h1 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>Something went wrong</h1>
          <p style={{ marginBottom: '1.5rem', color: '#cccccc' }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <details
            style={{
              background: '#2a2a2a',
              padding: '1rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              maxWidth: '600px',
              width: '100%'
            }}
          >
            <summary style={{ cursor: 'pointer', marginBottom: '0.5rem', color: '#4a9eff' }}>
              Error details
            </summary>
            <pre
              style={{
                overflow: 'auto',
                background: '#1a1a1a',
                padding: '1rem',
                borderRadius: '4px',
                fontSize: '0.875rem',
                color: '#ff6b6b'
              }}
            >
              {this.state.error && this.state.error.toString()}
              {this.state.errorInfo && (
                <>
                  {'\n'}
                  {this.state.errorInfo.componentStack}
                </>
              )}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#4a9eff',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
