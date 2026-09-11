import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-14 h-14 mx-auto rounded bg-[#F5F5F5] dark:bg-[#1E1E1E] border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center">
          <Compass className="w-7 h-7 text-[#0A0A0A] dark:text-white" />
        </div>
        <p className="label font-mono">404 — Not found</p>
        <h1 className="heading-lg text-[#0A0A0A] dark:text-white">This page doesn&apos;t exist</h1>
        <p className="body-sm">The link may be broken, or the page was moved. Your financial data is safe.</p>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            to="/"
            className="px-4 py-2 rounded bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] text-sm font-medium hover:opacity-80 transition-opacity"
          >
            Back to Dashboard
          </Link>
          <Link
            to="/transactions"
            className="px-4 py-2 rounded border border-[#E5E5E5] dark:border-[#262626] text-sm font-medium hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E] transition-colors"
          >
            View Transactions
          </Link>
        </div>
      </div>
    </div>
  );
}
