import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button — Terminal variants; sharp 4px geometry, no glow shadows.
 * Primary is high-contrast: white on dark, black on light.
 *
 * @param {'primary'|'secondary'|'ghost'|'destructive'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading
 * @param {boolean} fullWidth
 * @param {React.ReactNode} icon — optional leading icon
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  className = '',
  ...props
}) {
  const base = [
    'inline-flex items-center justify-center gap-2',
    'font-sans font-medium rounded max-md:min-h-[44px]',
    'transition-all duration-150 ease-out',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white dark:focus-visible:outline-white',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'select-none cursor-pointer',
    'active:scale-[0.97]',
  ].join(' ');

  const variants = {
    primary: [
      'bg-[#0A0A0A] text-white border border-[#0A0A0A]',
      'hover:bg-[#404040] hover:border-[#404040]',
      'dark:bg-white dark:text-[#0A0A0A] dark:border-white',
      'dark:hover:bg-[#E4E4E7] dark:hover:border-[#E4E4E7]',
    ].join(' '),
    secondary: [
      'bg-transparent text-[#0A0A0A] border border-[#E5E5E5]',
      'hover:bg-[#F5F5F5] hover:border-[#CCCCCC]',
      'dark:bg-transparent dark:text-white dark:border-[#262626]',
      'dark:hover:bg-[#1E1E1E] dark:hover:border-[#404040]',
    ].join(' '),
    ghost: [
      'bg-transparent text-[#404040] border border-transparent',
      'hover:bg-[#F5F5F5] hover:text-[#0A0A0A]',
      'dark:text-[#C4C7C8] dark:hover:bg-[#1E1E1E] dark:hover:text-white',
    ].join(' '),
    destructive: [
      'bg-[#ff6b6b] text-[#0A0A0A] border border-[#ff6b6b]',
      'hover:opacity-90',
      'dark:bg-[#ff6b6b] dark:text-[#0A0A0A] dark:border-[#ff6b6b]',
      'dark:hover:opacity-90',
    ].join(' '),
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
