import React from 'react';
import { Loader2 } from 'lucide-react';
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`v-button ${variant === 'primary' ? 'v-primary' : variant === 'destructive' ? 'v-destructive' : variant === 'ghost' ? 'v-ghost' : ''} ${size === 'sm' ? 'v-button-small' : ''} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}
