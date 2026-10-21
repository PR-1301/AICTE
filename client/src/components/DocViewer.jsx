import React from 'react';
import StatusBadge from './StatusBadge';
import { FINDING_STATUS } from '../constants';

/**
 * Shared DocViewer component.
 * Displays synthetic document image with absolutely positioned bounding-box highlights
 * stored as FRACTIONS (0 to 1), never pixels (AGENTS.md Section 5.1).
 * Also handles the missing document empty state with clear governmental guidance.
 */
export default function DocViewer({
  doc,
  title,
  highlights = [],
  status = null,
  emptyMessage = null,
  className = '',
}) {
  // Case 3: Missing document empty-state (no image or doc marked notSubmitted)
  if (!doc?.image) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col h-full overflow-hidden ${className}`}>
        {/* Document Header */}
        <div className="bg-slate-50/90 border-b border-slate-200/80 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
            <h3 className="text-base font-bold text-slate-800 tracking-tight truncate">
              {title || doc?.type || 'Required Document'}
            </h3>
          </div>
          <StatusBadge status={status || doc?.status || FINDING_STATUS.MANUAL_REVIEW_REQUIRED} size="sm" />
        </div>

        {/* Empty state visual */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 min-h-[420px]">
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-2xs">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-1">
            Document Not Submitted
          </h4>
          <p className="text-base text-slate-600 max-w-sm mb-4 leading-relaxed">
            {emptyMessage || 'This mandatory regulatory document was omitted from the institutional application package.'}
          </p>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-sm text-amber-950 font-medium">
            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Verification blocked: Missing statutory evidence</span>
          </div>
        </div>
      </div>
    );
  }

  // Active document with image & fractional highlights
  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col h-full overflow-hidden ${className}`}>
      {/* Document Header Bar */}
      <div className="bg-slate-50/90 border-b border-slate-200/80 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 min-w-0">
          <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="text-base font-bold text-slate-800 truncate" title={title || doc.type}>
            {title || doc.type}
          </h3>
        </div>
        {(status || doc.status) && (
          <StatusBadge status={status || doc.status} size="sm" />
        )}
      </div>

      {/* Image Container with Fractional Highlights */}
      <div className="flex-1 bg-slate-100/90 p-4 overflow-auto flex items-start justify-center">
        <div className="relative shadow-md rounded-lg border border-slate-300 max-w-full bg-white select-none">
          <img
            src={doc.image}
            alt={title || doc.type || 'Document page'}
            className="w-full h-auto block rounded-lg"
            loading="lazy"
          />

          {/* Fractional Bounding Box Highlights (AGENTS.md Section 5.1) */}
          {highlights.map((item, idx) => {
            const b = item.bbox;
            if (!b) return null;

            const isNearTop = b.y < 0.12;
            const tooltipPlacement = isNearTop ? 'top-full mt-2' : '-top-9';

            return (
              <div
                key={idx}
                className="absolute border-2 border-amber-500 bg-amber-400/25 ring-2 ring-amber-400/40 rounded shadow-sm transition-all duration-200 group hover:bg-amber-400/40 hover:border-amber-600 motion-safe:animate-pulse"
                style={{
                  left: `${b.x * 100}%`,
                  top: `${b.y * 100}%`,
                  width: `${b.w * 100}%`,
                  height: `${b.h * 100}%`,
                }}
              >
                {/* Extracted value badge on hover with intelligent top/bottom positioning */}
                {item.value && (
                  <div className={`absolute ${tooltipPlacement} left-0 bg-[#0F2A4A] text-white text-xs font-semibold px-2.5 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none opacity-95 group-hover:opacity-100 z-20 border border-slate-700`}>
                    {item.field ? (
                      <span className="text-slate-300 font-mono text-[11px] mr-1.5">
                        {item.field}:
                      </span>
                    ) : null}
                    <span className="text-amber-300 font-bold">{item.value}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
