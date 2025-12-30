'use client';

'use client';

import React, { ReactNode, ReactElement } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactElement;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error details for monitoring
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    
    // Call optional callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <div className="max-w-md w-full">
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 mb-4">
                <h1 className="text-2xl font-bold text-red-400 mb-2">Oops! Something went wrong</h1>
                <p className="text-red-300 text-sm mb-4">
                  We encountered an unexpected error. Please try refreshing the page.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="text-xs text-red-200 bg-black/50 p-2 rounded overflow-auto max-h-32 mb-4">
                    <summary className="cursor-pointer font-mono mb-2">Error Details</summary>
                    <code className="whitespace-pre-wrap">
                      {this.state.error.toString()}
                      {'\n\n'}
                      {this.state.error.stack}
                    </code>
                  </details>
                )}
              </div>
              <button
                onClick={this.resetError}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
