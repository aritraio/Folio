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
              <AlertTriangle className="w-6 h-6 text-[#ff6b6b]" />
            </div>
            <h2 className="heading-sm text-[#0A0A0A] dark:text-white">Something went wrong</h2>
            <p className="body-sm">
              This section crashed. Your data is still saved locally. Try reloading, or export a backup from
              Settings before clearing data.
            </p>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <pre className="text-xs text-left font-mono bg-[#F5F5F5] dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] p-3 rounded overflow-auto max-h-32">
                {String(this.state.error.message || this.state.error)}
              </pre>
            )}
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Reload section
              </button>
              <a
                href="/settings"
                className="px-4 py-2 rounded border border-[#E5E5E5] dark:border-[#262626] text-sm font-medium text-[#404040] dark:text-[#C4C7C8] hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E] transition-colors"
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
