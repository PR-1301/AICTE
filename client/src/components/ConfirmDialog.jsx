import React, { useEffect, useRef } from 'react';

/**
 * Shared ConfirmDialog component.
 * Generic modal dialog with accessible keyboard focus (Cancel focused by default, Escape to close)
 * and reusable across portals (no Approve-specific logic baked into the dialog).
 */
export default function ConfirmDialog({
  isOpen,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning', // 'warning' | 'danger' | 'primary'
  confirmDisabled = false,
}) {
  const cancelBtnRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Focus Cancel button by default
    const timer = setTimeout(() => {
      cancelBtnRef.current?.focus();
    }, 50);

    // Escape key listener to close
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const confirmColors = {
    warning: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
    primary: 'bg-[#0F2A4A] hover:bg-[#1F6FEB] text-white focus:ring-blue-500',
  }[variant] || 'bg-amber-600 hover:bg-amber-700 text-white';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        className="relative bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-left transform transition-all animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3
              id="confirm-dialog-title"
              className="text-lg font-bold text-slate-800 tracking-tight"
            >
              {title}
            </h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="text-sm text-slate-600 mb-6 leading-relaxed">
          {children}
        </div>

        {/* Action Buttons: Cancel is default focused */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={confirmDisabled}
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer focus:outline-none focus:ring-2 disabled:opacity-50 ${confirmColors}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
