import React from 'react';
import StatusBadge from './StatusBadge';
import SeverityTag from './SeverityTag';
import ConfidenceBar from './ConfidenceBar';
import { DISCLAIMER_PRELIMINARY, FINDING_STATUS, LINK_TYPE_LABELS } from '../constants';

/**
 * Shared FindingCard component.
 * Displays rule name, status badge, severity, side-by-side compared values,
 * confidence bar, plain explanation, and preliminary advisory disclaimer.
 * Formatted with prominent contrast and legible typography for video review.
 */
export default function FindingCard({ finding, className = '' }) {
  if (!finding) return null;

  const evidence = finding.evidence || [];
  const isLinkAnalysis = Boolean(finding.linkType);
  const isMismatch = !isLinkAnalysis && evidence.length >= 2;
  const isExpired = !isLinkAnalysis && (finding.status === FINDING_STATUS.EXPIRED || (evidence.length === 1 && !isMismatch));
  const isMissing = !isLinkAnalysis && (evidence.length === 0 || finding.status === FINDING_STATUS.MANUAL_REVIEW_REQUIRED);

  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 space-y-6 ${className}`}>
      {/* Top Header: Rule Name, Status Badge, Severity Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono mb-1">
            <span>Rule #{finding.id || 'N/A'}</span>
            <span>·</span>
            <span className="text-slate-600 font-semibold">{finding.category || 'Regulatory Compliance'}</span>
          </div>
          <h3 className="text-xl font-extrabold text-[#0A192F] tracking-tight">
            {finding.rule?.replace(/_/g, ' ') || finding.rule}
          </h3>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <StatusBadge status={finding.status} size="md" />
          <SeverityTag severity={finding.severity} size="md" />
        </div>
      </div>

      {/* Side-by-Side Compared Values Comparison */}
      <div className="bg-[#F8FAFC] rounded-xl p-5 border border-slate-200">
        <div className="text-xs font-semibold text-slate-500 mb-3 flex items-center justify-between">
          <span>Comparative Evidence Extraction</span>
          <span className="font-mono text-[11px] text-slate-400">Resolution: Normalized Dual Scan</span>
        </div>

        {/* Case: Cross-Institution Link Analysis */}
        {isLinkAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-purple-800 uppercase tracking-wider block">
                Link Analysis Type
              </span>
              <div className="text-base font-extrabold text-slate-900">
                {LINK_TYPE_LABELS[finding.linkType] || finding.linkType}
              </div>
              <div className="text-xs text-slate-600 font-mono">
                Pattern: Inter-Institutional Graph Linkage
              </div>
              <div className="pt-1">
                <span className="text-xs font-bold text-purple-900 bg-purple-50 border border-purple-300 px-3 py-1 rounded-lg inline-block">
                  Cross-Institution Verification Required
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Corroborated Path Nodes
              </span>
              <div className="text-xs font-mono font-bold text-slate-800">
                {finding.evidencePath?.length || 0} Entities in Correlation Path
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {finding.evidencePath?.map((id) => (
                  <span key={id} className="text-xs font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                    {id}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Case 1: Mismatch (2 values compared side by side) */}
        {isMismatch && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
              <span className="text-xs font-medium text-slate-500 block">
                Primary Submission Record
              </span>
              <div className="text-sm font-bold text-slate-800">
                {evidence[0].docName || 'Source Document 1'}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Field: <code className="text-slate-700 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">{evidence[0].field}</code>
              </div>
              <div className="pt-2">
                <span className="text-lg font-mono font-extrabold text-amber-950 bg-amber-50 border border-amber-300 px-3.5 py-1.5 rounded-lg inline-block shadow-2xs">
                  {evidence[0].value}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
              <span className="text-xs font-medium text-slate-500 block">
                Corroborating Document (Verification)
              </span>
              <div className="text-sm font-bold text-slate-800">
                {evidence[1].docName || 'Source Document 2'}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Field: <code className="text-slate-700 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">{evidence[1].field}</code>
              </div>
              <div className="pt-2">
                <span className="text-lg font-mono font-extrabold text-amber-950 bg-amber-50 border border-amber-300 px-3.5 py-1.5 rounded-lg inline-block shadow-2xs">
                  {evidence[1].value}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Case 2: Expired (Single extracted date compared with threshold) */}
        {!isMismatch && isExpired && evidence.length === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs space-y-1.5">
              <span className="text-xs font-medium text-rose-700 block">
                Submitted Statutory Permit
              </span>
              <div className="text-sm font-bold text-slate-800">
                {evidence[0].docName || 'Submitted Document'}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Extracted Expiry Date:
              </div>
              <div className="pt-2">
                <span className="text-lg font-mono font-extrabold text-rose-950 bg-rose-50 border border-rose-300 px-3.5 py-1.5 rounded-lg inline-block shadow-2xs">
                  {evidence[0].value} (Expired)
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
              <span className="text-xs font-medium text-slate-500 block">
                Statutory Regulatory Norm
              </span>
              <div className="text-sm font-bold text-slate-800">
                Required Validity Window
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Anchor Evaluation:
              </div>
              <div className="pt-2">
                <span className="text-sm font-medium text-slate-800 bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-lg inline-block">
                  Must remain valid through AY 2026-27 (post 21 Oct 2026)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Case 3: Missing Document (Omitted statutory evidence) */}
        {isMissing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs space-y-1.5">
              <span className="text-xs font-medium text-rose-700 block">
                Submission Verification Gate
              </span>
              <div className="text-sm font-bold text-slate-800">
                Mandatory Regulatory Upload
              </div>
              <div className="pt-2">
                <span className="text-sm font-bold text-rose-900 bg-rose-50 border border-rose-300 px-3.5 py-2 rounded-lg inline-block">
                  Not Submitted in Applicant Bundle
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
              <span className="text-xs font-medium text-slate-500 block">
                Statutory Compliance Rule
              </span>
              <div className="text-sm font-bold text-slate-800">
                Minimum Accreditation
              </div>
              <div className="pt-2">
                <span className="text-sm font-medium text-slate-800 bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-lg inline-block">
                  NBA / NAAC Grade &lsquo;A&rsquo; certification required for intake expansion
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Algorithmic Confidence & Observation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="font-semibold text-slate-700">Algorithmic Scrutiny Confidence</span>
          <span className="font-mono font-bold text-[#0A192F] bg-slate-100 px-2.5 py-1 rounded-md text-xs border border-slate-200">
            {Math.round((finding.confidence || 0) * 100)}% Match Fidelity
          </span>
        </div>
        <ConfidenceBar confidence={finding.confidence} size="md" />
      </div>

      {/* Plain Language Regulatory Explanation */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="text-xs font-bold text-slate-700 mb-1">
          Regulatory Observation
        </div>
        <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
          {finding.explanation}
        </p>
      </div>

      {/* Advisory Preliminary Disclaimer (Rule #1, #2, #3) */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
          <span className="font-medium text-slate-600">
            {DISCLAIMER_PRELIMINARY}
          </span>
        </div>
        <span className="font-mono text-xs text-slate-400">Rule Ref: {finding.id}</span>
      </div>
    </div>
  );
}
