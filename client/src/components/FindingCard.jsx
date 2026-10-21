import React from 'react';
import StatusBadge from './StatusBadge';
import SeverityTag from './SeverityTag';
import ConfidenceBar from './ConfidenceBar';
import { DISCLAIMER_PRELIMINARY, FINDING_STATUS } from '../constants';

/**
 * Shared FindingCard component.
 * Displays rule name, status badge, severity, side-by-side compared values,
 * confidence bar, plain explanation, and preliminary advisory disclaimer.
 * Formatted with prominent contrast and legible typography for video review.
 */
export default function FindingCard({ finding, className = '' }) {
  if (!finding) return null;

  const evidence = finding.evidence || [];
  const isMismatch = evidence.length >= 2;
  const isExpired = finding.status === FINDING_STATUS.EXPIRED || (evidence.length === 1 && !isMismatch);
  const isMissing = evidence.length === 0 || finding.status === FINDING_STATUS.MANUAL_REVIEW_REQUIRED;

  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 space-y-5 ${className}`}>
      {/* Top Header: Rule Name, Status Badge, Severity Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-slate-500 font-bold tracking-wider block mb-1">
            Statutory Validation Rule
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-[#0F2A4A] tracking-tight">
            {finding.rule?.replace(/_/g, ' ') || finding.rule}
          </h3>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <StatusBadge status={finding.status} size="md" />
          <SeverityTag severity={finding.severity} size="md" />
        </div>
      </div>

      {/* Side-by-Side Compared Values Comparison */}
      <div className="bg-slate-50/80 rounded-xl p-4 sm:p-5 border border-slate-200/80">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Extracted Evidence Comparison
        </div>

        {/* Case 1: Mismatch (2 values compared side by side) */}
        {isMismatch && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Source Document 1
              </span>
              <div className="text-base font-bold text-slate-800">
                {evidence[0].docName || 'Document 1'}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Field: <code className="text-slate-700 font-semibold">{evidence[0].field}</code>
              </div>
              <div className="pt-2">
                <span className="text-base sm:text-lg font-extrabold text-amber-950 bg-amber-50 border border-amber-300 px-3 py-1 rounded-md inline-block shadow-2xs">
                  {evidence[0].value}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Source Document 2 (Comparison)
              </span>
              <div className="text-base font-bold text-slate-800">
                {evidence[1].docName || 'Document 2'}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Field: <code className="text-slate-700 font-semibold">{evidence[1].field}</code>
              </div>
              <div className="pt-2">
                <span className="text-base sm:text-lg font-extrabold text-amber-950 bg-amber-50 border border-amber-300 px-3 py-1 rounded-md inline-block shadow-2xs">
                  {evidence[1].value}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Case 2: Expired (Single extracted date compared with threshold) */}
        {!isMismatch && isExpired && evidence.length === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-rose-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block">
                Submitted Institutional Certificate
              </span>
              <div className="text-base font-bold text-slate-800">
                {evidence[0].docName || 'Submitted Document'}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Extracted Validity Date:
              </div>
              <div className="pt-2">
                <span className="text-base sm:text-lg font-extrabold text-rose-950 bg-rose-50 border border-rose-300 px-3 py-1 rounded-md inline-block shadow-2xs">
                  {evidence[0].value} (Expired)
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                AICTE Regulatory Requirement
              </span>
              <div className="text-base font-bold text-slate-800">
                Statutory Clearance Norm
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Required Validity Window:
              </div>
              <div className="pt-2">
                <span className="text-base sm:text-lg font-bold text-slate-800 bg-slate-50 border border-slate-300 px-3 py-1 rounded-md inline-block shadow-2xs">
                  Active throughout Academic Year 2026-27
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Case 3: Missing Document (Omitted statutory evidence) */}
        {isMissing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-purple-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider block">
                Applicant Bundle Check
              </span>
              <div className="text-base font-bold text-slate-800">
                Mandatory Statutory Upload
              </div>
              <div className="pt-2">
                <span className="text-base sm:text-lg font-extrabold text-rose-900 bg-rose-50 border border-rose-300 px-3 py-1 rounded-md inline-block shadow-2xs">
                  Not Submitted (Omitted)
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Regulatory Handbook Requirement
              </span>
              <div className="text-base font-bold text-slate-800">
                Mandatory Accreditation
              </div>
              <div className="pt-2">
                <span className="text-base sm:text-lg font-bold text-slate-800 bg-slate-50 border border-slate-300 px-3 py-1 rounded-md inline-block shadow-2xs">
                  NBA / NAAC Grade &lsquo;A&rsquo; Minimum Required
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confidence Bar */}
      <div>
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="font-semibold text-slate-700">Algorithmic Confidence:</span>
          <span className="font-mono font-bold text-[#0F2A4A] bg-slate-100 px-2 py-0.5 rounded text-xs">
            {Math.round((finding.confidence || 0) * 100)}%
          </span>
        </div>
        <ConfidenceBar confidence={finding.confidence} size="md" />
      </div>

      {/* Plain Language Regulatory Explanation */}
      <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-200/80">
        <span className="text-xs font-bold uppercase text-[#1F6FEB] tracking-wider block mb-1">
          Regulatory Observation
        </span>
        <p className="text-base text-slate-800 leading-relaxed font-normal">
          {finding.explanation}
        </p>
      </div>

      {/* Advisory Preliminary Disclaimer (Rule #1, #2, #3) */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm text-slate-500">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-amber-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="font-medium italic text-slate-600">
            {DISCLAIMER_PRELIMINARY}
          </span>
        </div>
        <span className="font-mono text-xs text-slate-400">Rule Ref: {finding.id}</span>
      </div>
    </div>
  );
}
