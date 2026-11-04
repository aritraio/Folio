import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * ErrorBoundary — catches render crashes (corrupt storage, chart NaN, etc.)
 * and shows a recoverable fallback instead of a white screen.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('UI crash captured by ErrorBoundary:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
    else window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-8" role="alert">
          <div className="card p-8 max-w-md text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded bg-[rgba(255,107,107,0.12)] border border-[#ff6b6b]/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-[var(--color-negative)]" />
            </div>
            <h2 className="heading-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
              Something went wrong
            </h2>
            <p className="body-sm">
              This section crashed. Your data is still saved locally. Try reloading, or export a backup from
              Settings before clearing data.
            </p>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <pre className="text-xs text-left font-mono bg-[var(--color-bg-tertiary)] dark:bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] dark:border-[var(--color-border)] p-3 rounded overflow-auto max-h-32">
                {String(this.state.error.message || this.state.error)}
              </pre>
            )}
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded bg-[var(--color-bg-tertiary)] dark:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Reload section
              </button>
              <a
                href="/settings"
                className="px-4 py-2 rounded border border-[var(--color-border)] dark:border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] dark:hover:bg-[var(--color-bg-tertiary)] transition-colors"
              >
                Go to Settings
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
