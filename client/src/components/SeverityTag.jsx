import React from 'react';
import { SEVERITY, SEVERITY_LABELS } from '../constants';

const SEVERITY_CONFIGS = {
  [SEVERITY.LOW]: {
    label: 'Low',
    fullLabel: SEVERITY_LABELS[SEVERITY.LOW],
    classes: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: (
      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
      </svg>
    ),
  },
  [SEVERITY.MEDIUM]: {
    label: 'Medium',
    fullLabel: SEVERITY_LABELS[SEVERITY.MEDIUM],
    classes: 'bg-amber-100 text-amber-950 border-amber-400 font-medium',
    icon: (
      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  [SEVERITY.HIGH]: {
    label: 'High',
    fullLabel: SEVERITY_LABELS[SEVERITY.HIGH],
    classes: 'bg-rose-100 text-rose-950 border-rose-500 font-semibold',
    icon: (
      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.316.492-.533 1.035-.722 1.587-.308.9-.5 1.802-.634 2.65a8.72 8.72 0 00-.094 1.13c-.027.67-.006 1.487-.248 2.062a.75.75 0 01-.305.372 1.745 1.745 0 01-1.02.197c-.815-.067-1.554-.45-2.094-1.027a1 1 0 00-1.597 1.164 6.745 6.745 0 003.585 2.518c.348.113.71.18 1.077.202.13.008.261.01.391.006 1.58-.052 3.033-.77 4.093-1.928 1.06-1.157 1.62-2.695 1.62-4.304 0-1.554-.537-3.037-1.517-4.148a7.14 7.14 0 00-1.288-.988z" clipRule="evenodd" />
      </svg>
    ),
  },
};

/**
 * Shared SeverityTag component.
 * Distinguishes severity clearly through color lightness, border, and iconography.
 */
export default function SeverityTag({
  severity = SEVERITY.LOW,
  size = 'md',
  fullLabel = false,
  showIcon = true,
  className = '',
}) {
  const normSeverity = (severity || '').toLowerCase();
  const config = SEVERITY_CONFIGS[normSeverity] || SEVERITY_CONFIGS[SEVERITY.LOW];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs sm:text-sm px-2.5 py-0.5 gap-1.5',
    lg: 'text-sm px-3 py-1 gap-2',
  }[size] || 'text-xs px-2.5 py-0.5 gap-1.5';

  const displayText = fullLabel ? config.fullLabel : `${config.label} Severity`;

  return (
    <span
      className={`inline-flex items-center rounded border whitespace-nowrap uppercase tracking-wider ${config.classes} ${sizeClasses} ${className}`}
      title={config.fullLabel}
    >
      {showIcon && config.icon}
      <span>{displayText}</span>
    </span>
  );
}
