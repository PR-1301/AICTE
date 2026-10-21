import React from 'react';
import {
  FINDING_STATUS,
  FINDING_STATUS_LABELS,
  APPLICATION_STATUS,
  APPLICATION_STATUS_LABELS,
} from '../constants';

const STATUS_CONFIGS = {
  // Finding Statuses
  [FINDING_STATUS.VERIFIED]: {
    label: FINDING_STATUS_LABELS[FINDING_STATUS.VERIFIED],
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-400/80',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  [FINDING_STATUS.MISMATCH_DETECTED]: {
    label: FINDING_STATUS_LABELS[FINDING_STATUS.MISMATCH_DETECTED],
    classes: 'bg-amber-100 text-amber-950 border-amber-500',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  [FINDING_STATUS.EXPIRED]: {
    label: FINDING_STATUS_LABELS[FINDING_STATUS.EXPIRED],
    classes: 'bg-rose-100 text-rose-950 border-rose-400',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
  },
  [FINDING_STATUS.VERIFICATION_PENDING]: {
    label: FINDING_STATUS_LABELS[FINDING_STATUS.VERIFICATION_PENDING],
    classes: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
  [FINDING_STATUS.SOURCE_UNAVAILABLE]: {
    label: FINDING_STATUS_LABELS[FINDING_STATUS.SOURCE_UNAVAILABLE],
    classes: 'bg-zinc-200 text-zinc-900 border-zinc-400',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.366zM6.523 5.11A6 6 0 0114.89 13.476L6.523 5.11zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
      </svg>
    ),
  },
  [FINDING_STATUS.MANUAL_REVIEW_REQUIRED]: {
    label: FINDING_STATUS_LABELS[FINDING_STATUS.MANUAL_REVIEW_REQUIRED],
    classes: 'bg-purple-100 text-purple-950 border-purple-400',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
      </svg>
    ),
  },

  // Application Lifecycle Statuses
  [APPLICATION_STATUS.DRAFT]: {
    label: APPLICATION_STATUS_LABELS[APPLICATION_STATUS.DRAFT],
    classes: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  [APPLICATION_STATUS.SUBMITTED]: {
    label: APPLICATION_STATUS_LABELS[APPLICATION_STATUS.SUBMITTED],
    classes: 'bg-sky-50 text-sky-800 border-sky-300',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
      </svg>
    ),
  },
  [APPLICATION_STATUS.AI_VALIDATING]: {
    label: APPLICATION_STATUS_LABELS[APPLICATION_STATUS.AI_VALIDATING],
    classes: 'bg-blue-100 text-blue-900 border-blue-400',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  [APPLICATION_STATUS.VALIDATION_COMPLETE]: {
    label: APPLICATION_STATUS_LABELS[APPLICATION_STATUS.VALIDATION_COMPLETE],
    classes: 'bg-indigo-50 text-indigo-900 border-indigo-300',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  [APPLICATION_STATUS.UNDER_OFFICER_REVIEW]: {
    label: APPLICATION_STATUS_LABELS[APPLICATION_STATUS.UNDER_OFFICER_REVIEW],
    classes: 'bg-amber-50 text-amber-900 border-amber-300',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
      </svg>
    ),
  },
  [APPLICATION_STATUS.APPROVED]: {
    label: APPLICATION_STATUS_LABELS[APPLICATION_STATUS.APPROVED],
    classes: 'bg-emerald-100 text-emerald-950 border-emerald-500 font-semibold',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  [APPLICATION_STATUS.INFO_REQUESTED]: {
    label: APPLICATION_STATUS_LABELS[APPLICATION_STATUS.INFO_REQUESTED],
    classes: 'bg-orange-100 text-orange-950 border-orange-400',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  },
  [APPLICATION_STATUS.SENT_FOR_INSPECTION]: {
    label: APPLICATION_STATUS_LABELS[APPLICATION_STATUS.SENT_FOR_INSPECTION],
    classes: 'bg-violet-100 text-violet-950 border-violet-400',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
      </svg>
    ),
  },
};

/**
 * Shared StatusBadge component.
 * Non-negotiable domain rules:
 * - Color + Icon + Text label (never color alone)
 * - Contrast & lightness differentiation for video compression survival
 */
export default function StatusBadge({ status, size = 'md', className = '' }) {
  const config = STATUS_CONFIGS[status] || {
    label: status || 'Unknown',
    classes: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs sm:text-sm px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm sm:text-base px-3 py-1.5 gap-2 font-semibold',
  }[size] || 'text-xs sm:text-sm px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-md border shadow-2xs whitespace-nowrap transition-colors ${config.classes} ${sizeClasses} ${className}`}
      title={config.label}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}
