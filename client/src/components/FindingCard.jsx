import React from 'react';
import StatusBadge from './StatusBadge';
import SeverityTag from './SeverityTag';
import ConfidenceBar from './ConfidenceBar';
import { DISCLAIMER_PRELIMINARY, FINDING_STATUS } from '../constants';

/**
 * Shared FindingCard component.
 * Displays rule name, status badge, severity, side-by-side compared values,
 * confidence bar, explanation, and preliminary advisory disclaimer.
 */
export default function FindingCard({ finding, className = '' }) {
  if (!finding) return null;

  const evidence = finding.evidence || [];
  const isMismatch = evidence.length >= 2;
  const isExpired = finding.status === FINDING_STATUS.EXPIRED || (evidence.length === 1 && !isMismatch);
  const isMissing = evidence.length === 0 || finding.status === FINDING_STATUS.MANUAL_REVIEW_REQUIRED;

  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4 ${className}`}>
      {/* Top Header: Rule Name, Status Badge, Severity Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <span className="text-[11px] font-mono uppercase text-slate-500 font-semibold tracking-wider block">
            Automated Validation Rule
          </span>
          <h3 className="text-base font-bold text-[#0F2A4A] tracking-tight">
            {finding.rule}
          </h3>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <StatusBadge status={finding.status} size="sm" />
          <SeverityTag severity={finding.severity} size="sm" />
        </div>
      </div>

      {/* Side-by-Side Compared Values Comparison */}
      <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/70">
        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2.5">
          Extracted Evidence Comparison
        </div>

        {/* Case 1: Mismatch (2 values compared side by side) */}
        {isMismatch && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 block">
                {evidence[0].docName || 'Document 1'}
              </span>
              <span className="text-xs text-slate-400 block mb-1">
                Field: <code className="text-slate-600">{evidence[0].field}</code>
              </span>
              <span className="text-sm font-bold text-slate-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                {evidence[0].value}
              </span>
            </div>

            <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 block">
                {evidence[1].docName || 'Document 2'}
              </span>
              <span className="text-xs text-slate-400 block mb-1">
                Field: <code className="text-slate-600">{evidence[1].field}</code>
              </span>
              <span className="text-sm font-bold text-slate-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                {evidence[1].value}
              </span>
            </div>
          </div>
        )}

        {/* Case 2: Expired (Single extracted date compared with threshold) */}
        {!isMismatch && isExpired && evidence.length === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded border border-rose-200 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 block">
                {evidence[0].docName || 'Submitted Document'}
              </span>
              <span className="text-xs text-slate-400 block mb-1">
                Extracted Expiry Date:
              </span>
              <span className="text-sm font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block">
                {evidence[0].value} (Expired)
              </span>
            </div>

            <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 block">
                Statutory Requirement
              </span>
              <span className="text-xs text-slate-400 block mb-1">
                Required Validity Window:
              </span>
              <span className="text-sm font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block">
                Valid through Academic Year 2026-27
              </span>
            </div>
          </div>
        )}

        {/* Case 3: Missing Document (Not submitted) */}
        {isMissing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded border border-rose-200 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 block">
                Institutional Submission Bundle
              </span>
              <span className="text-xs text-slate-400 block mb-1">
                Upload Status:
              </span>
              <span className="text-sm font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block">
                Not Submitted / File Absent
              </span>
            </div>

            <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 block">
                Statutory Rule Norm
              </span>
              <span className="text-xs text-slate-400 block mb-1">
                Approval Process Handbook:
              </span>
              <span className="text-sm font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block">
                Mandatory Statutory Document
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="space-y-1">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
          Explanation & Findings Details
        </span>
        <p className="text-sm text-slate-700 leading-relaxed bg-white rounded">
          {finding.explanation}
        </p>
      </div>

      {/* Confidence Bar */}
      <div className="pt-1">
        <ConfidenceBar confidence={finding.confidence} />
      </div>

      {/* Mandatory Advisory Notice (Rule #3 & #2) */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-1.5 text-amber-800 font-medium bg-amber-50/80 px-2.5 py-1 rounded border border-amber-200/50">
          <svg className="w-3.5 h-3.5 text-amber-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>{DISCLAIMER_PRELIMINARY}</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">ID: {finding.id}</span>
      </div>
    </div>
  );
}
