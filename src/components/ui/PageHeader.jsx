import React from 'react';

/**
 * PageHeader — shared editorial header (§85: same pattern on every page).
 * Eyebrow (uppercase tracked) + serif title + optional description/actions.
 */
export default function PageHeader({ eyebrow, title, description, actions, children }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h1 className="heading-lg text-zinc-900 dark:text-text-dark-primary">{title}</h1>
        {description && <p className="body-sm mt-1.5 max-w-xl">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>}
    </div>
  );
}
