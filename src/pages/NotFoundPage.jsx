import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-14 h-14 mx-auto rounded bg-[var(--color-bg-tertiary)] dark:bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] dark:border-[var(--color-border)] flex items-center justify-center">
          <Compass className="w-7 h-7 text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]" />
        </div>
        <p className="label font-mono">404 — Not found</p>
        <h1 className="heading-lg text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
          This page doesn&apos;t exist
        </h1>
        <p className="body-sm">The link may be broken, or the page was moved. Your financial data is safe.</p>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            to="/"
            className="px-4 py-2 rounded bg-[var(--color-bg-tertiary)] dark:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] text-sm font-medium hover:opacity-80 transition-opacity"
          >
            Back to Dashboard
          </Link>
          <Link
            to="/transactions"
            className="px-4 py-2 rounded border border-[var(--color-border)] dark:border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-bg-tertiary)] dark:hover:bg-[var(--color-bg-tertiary)] transition-colors"
          >
            View Transactions
          </Link>
        </div>
      </div>
    </div>
  );
}
