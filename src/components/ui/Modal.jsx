import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * Modal — Terminal overlay. Surface #141414, 1px #262626, sharp 6px.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  showClose = true,
  children,
  className = '',
}) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const previousActiveRef = useRef(null);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const getFocusable = useCallback(() => {
    if (!contentRef.current) return [];
    return Array.from(
      contentRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = getFocusable();
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose, getFocusable]
  );

  useEffect(() => {
    if (!isOpen) return;

    previousActiveRef.current = document.activeElement;
    document.addEventListener('keydown', handleKeyDown, true);
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      const focusable = getFocusable();
      if (focusable?.length) focusable[0].focus();
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = '';
      clearTimeout(timer);
      if (previousActiveRef.current && previousActiveRef.current.focus) {
        previousActiveRef.current.focus();
      }
    };
  }, [isOpen, handleKeyDown, getFocusable]);

  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="backdrop-overlay flex items-center justify-center p-4 max-md:items-end max-md:p-0 max-md:pb-0"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={contentRef}
        className={`
          w-full ${sizes[size]}
          bg-white dark:bg-[#141414]
          border border-[#E5E5E5] dark:border-[#262626]
          overflow-y-auto
          md:rounded-md md:max-h-[90vh] md:animate-fade-in-scale motion-reduce:animate-none
          max-md:rounded-t-md max-md:rounded-b-none max-md:max-h-[95vh] max-md:animate-slide-up motion-reduce:animate-none
          ${className}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E5E5E5] dark:border-[#262626]">
            {title && (
              <h2 id="modal-title" className="heading-sm text-[#0A0A0A] dark:text-white">
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="
                  p-1.5 rounded
                  text-[#8E9192] hover:text-[#0A0A0A] hover:bg-[#F5F5F5]
                  dark:hover:text-white dark:hover:bg-[#1E1E1E]
                  transition-colors duration-150
                "
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        <div className="px-6 pb-6 pt-5">{children}</div>
      </div>
    </div>
  );
}
