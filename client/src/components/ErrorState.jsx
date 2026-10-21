import React from 'react';

/**
 * Reusable, accessible ErrorState component for Officer Portal.
 * Follows governmental calm aesthetics with retry action.
 */
export default function ErrorState({
  title = 'Unable to Load Data',
  message = 'An unexpected error occurred while communicating with the scrutiny data service.',
  onRetry = null,
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`bg-white rounded-xl border border-rose-200/90 shadow-sm p-6 sm:p-8 text-center max-w-xl mx-auto my-6 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-1.5">
        {title}
      </h3>
      <p className="text-base text-slate-600 leading-relaxed mb-5">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#0F2A4A] text-white text-base font-semibold hover:bg-[#1F6FEB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F6FEB] cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Try again</span>
        </button>
      )}
    </div>
  );
}
