import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-ivory-muted dark:bg-surface-dark-elevated flex items-center justify-center">
          <Compass className="w-7 h-7 text-brand-amber" />
        </div>
        <p className="label">404 — Not found</p>
        <h1 className="heading-lg text-zinc-900 dark:text-text-dark-primary">This page doesn&apos;t exist</h1>
        <p className="body-sm">The link may be broken, or the page was moved. Your financial data is safe.</p>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Back to Dashboard
          </Link>
          <Link
            to="/transactions"
            className="px-4 py-2 rounded-lg border border-ivory-border dark:border-surface-dark-border text-sm font-medium hover:bg-zinc-50 dark:hover:bg-surface-dark-elevated transition-colors"
          >
            View Transactions
          </Link>
        </div>
      </div>
    </div>
  );
}
