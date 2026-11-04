import React from 'react';
export function PageHeading({ title, description, children }) {
  return (
    <div className="v-page-heading">
      <div>
        <p className="v-eyebrow">Your money, in focus</p>
        <h1>{title}</h1>
        {description && <p className="v-muted">{description}</p>}
      </div>
      <div className="v-actions">{children}</div>
    </div>
  );
}
export function Panel({ title, action, children, className = '' }) {
  return (
    <section className={`v-panel ${className}`}>
      {title && (
        <div className="v-row v-panel-heading">
          <h2>{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function Metric({ label, value, note, featured = false }) {
  return (
    <div className={`v-metric ${featured ? 'v-featured' : ''}`}>
      <span>{label}</span>
      <strong data-financial>{value}</strong>
      {note && <small>{note}</small>}
    </div>
  );
}
export function Progress({ value, label }) {
  return (
    <div
      className="v-progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(Math.min(100, Math.max(0, value)))}
    >
      <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
