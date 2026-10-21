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
      <div className={`bg-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col h-full overflow-hidden ${className}`}>
        {/* Document Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0 ring-4 ring-rose-950/60"></span>
            <span className="text-sm font-semibold tracking-tight text-slate-100 truncate">
              {title || doc?.type || 'Statutory Requirement'}
            </span>
          </div>
          <StatusBadge status={status || doc?.status || FINDING_STATUS.MANUAL_REVIEW_REQUIRED} size="sm" />
        </div>

        {/* Empty state visual */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F8FAFC] min-h-[460px]">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 mb-4 shadow-xs">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-1">
            Statutory Document Not Submitted
          </h4>
          <p className="text-sm text-slate-600 max-w-sm mb-5 leading-relaxed">
            {emptyMessage || 'This required regulatory instrument was omitted from the institutional submission package.'}
          </p>
          <div className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>Prerequisite Block: Scrutiny requires complete statutory record</span>
          </div>
        </div>
      </div>
    );
  }

  // Active document with image & fractional highlights
  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col h-full overflow-hidden ${className}`}>
      {/* Document Header Bar */}
      <div className="bg-[#0A192F] text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2.5 min-w-0">
          <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="truncate">
            <div className="text-sm font-bold text-slate-100 truncate leading-snug" title={title || doc.type}>
              {title || doc.type}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Statutory Record · Page 1 of 1
            </div>
          </div>
        </div>
        {(status || doc.status) && (
          <StatusBadge status={status || doc.status} size="sm" />
        )}
      </div>

      {/* Image Container with Fractional Highlights */}
      <div className="flex-1 bg-slate-100/90 p-4 sm:p-5 overflow-auto flex items-start justify-center">
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
                className="absolute border-2 border-amber-500 bg-amber-400/20 ring-4 ring-amber-400/30 rounded transition-all duration-200 group hover:bg-amber-400/35 hover:border-amber-600 motion-safe:animate-pulse"
                style={{
                  left: `${b.x * 100}%`,
                  top: `${b.y * 100}%`,
                  width: `${b.w * 100}%`,
                  height: `${b.h * 100}%`,
                }}
              >
                {/* Corner targets for forensic visual cues */}
                <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-amber-600"></span>
                <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-amber-600"></span>
                <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-amber-600"></span>
                <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-amber-600"></span>

                {/* Subtle value badge with clean high-contrast styling */}
                {item.value && (
                  <div className={`absolute ${tooltipPlacement} left-0 bg-[#0A192F] text-white text-xs font-semibold px-2.5 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none opacity-90 group-hover:opacity-100 z-20 border border-slate-700`}>
                    {item.field ? (
                      <span className="text-slate-300 font-mono text-[11px] mr-1.5">
                        {item.field}:
                      </span>
                    ) : null}
                    <span className="text-amber-300 font-mono font-bold">{item.value}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Forensic Sector Telemetry Footer */}
      {highlights.length > 0 && highlights[0]?.bbox && (
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Target Region: [x: {(highlights[0].bbox.x * 100).toFixed(1)}%, y: {(highlights[0].bbox.y * 100).toFixed(1)}%, w: {(highlights[0].bbox.w * 100).toFixed(1)}%, h: {(highlights[0].bbox.h * 100).toFixed(1)}%]</span>
          </div>
          <span className="text-slate-400">Normalized Fractional Grid</span>
        </div>
      )}
    </div>
  );
}
