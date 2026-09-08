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
            <div className="w-12 h-12 mx-auto rounded-full bg-brand-red-light dark:bg-[rgba(251,113,133,0.12)] flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-brand-red" />
            </div>
            <h2 className="heading-sm text-zinc-900 dark:text-text-dark-primary">Something went wrong</h2>
            <p className="body-sm">
              This section crashed. Your data is still saved locally. Try reloading, or export a backup from
              Settings before clearing data.
            </p>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <pre className="text-xs text-left bg-zinc-100 dark:bg-surface-dark-elevated p-3 rounded-lg overflow-auto max-h-32">
                {String(this.state.error.message || this.state.error)}
              </pre>
            )}
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-lg bg-brand-amber text-white text-sm font-medium hover:bg-brand-amber-hover transition-colors"
              >
                Reload section
              </button>
              <a
                href="/settings"
                className="px-4 py-2 rounded-lg border border-ivory-border dark:border-surface-dark-border text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-surface-dark-elevated transition-colors"
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
