import React from 'react';
import StatusBadge from '../components/StatusBadge';
import SeverityTag from '../components/SeverityTag';
import ConfidenceBar from '../components/ConfidenceBar';
import { FINDING_STATUS, APPLICATION_STATUS, SEVERITY } from '../constants';

export default function ComponentsShowcase() {
  return (
    <div className="space-y-8 pb-12">
      {/* Page Title & Scope Notice */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-[#0F2A4A] tracking-tight">
              Shared UI Components Showcase
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Visual verification page for <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">/officer/_components</code> (Step 3).
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-mono bg-blue-50 text-[#1F6FEB] border border-blue-200 px-2.5 py-1 rounded">
            Temporary Inspection View
          </span>
        </div>
      </div>

      {/* 1. Finding Statuses */}
      <section className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1 border-b border-slate-100 pb-2">
          1. Finding Status Badges (`FINDING_STATUS`)
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Non-negotiable rule: Every status pairs color, icon, and text label. Lightness differs across statuses to survive video compression.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Object.values(FINDING_STATUS).map((status) => (
            <div
              key={status}
              className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 flex flex-col justify-between space-y-2"
            >
              <div className="text-xs font-mono text-slate-500 font-medium">
                {status}
              </div>
              <div>
                <StatusBadge status={status} size="md" />
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-semibold text-slate-700 mb-3">Sizes comparison (e.g. `MISMATCH_DETECTED`):</h3>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">sm:</span>
            <StatusBadge status={FINDING_STATUS.MISMATCH_DETECTED} size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">md:</span>
            <StatusBadge status={FINDING_STATUS.MISMATCH_DETECTED} size="md" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">lg:</span>
            <StatusBadge status={FINDING_STATUS.MISMATCH_DETECTED} size="lg" />
          </div>
        </div>
      </section>

      {/* 2. Application Lifecycle Statuses */}
      <section className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1 border-b border-slate-100 pb-2">
          2. Application Lifecycle Badges (`APPLICATION_STATUS`)
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Unified <code className="bg-slate-100 px-1 py-0.5 rounded">StatusBadge</code> also handles application lifecycle states.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(APPLICATION_STATUS).map((status) => (
            <div
              key={status}
              className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 flex flex-col justify-between space-y-2"
            >
              <div className="text-xs font-mono text-slate-500 font-medium">
                {status}
              </div>
              <div>
                <StatusBadge status={status} size="md" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Severity Tags */}
      <section className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1 border-b border-slate-100 pb-2">
          3. Severity Tags (`SEVERITY`)
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Clear visual hierarchy from low (slate neutral) to medium (amber warning) to high (rose/crimson critical).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {Object.values(SEVERITY).map((sev) => (
            <div
              key={sev}
              className="p-4 rounded-lg border border-slate-100 bg-slate-50/60 space-y-3"
            >
              <div className="text-xs font-mono text-slate-500 font-semibold uppercase">
                Level: {sev}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-16">Default:</span>
                  <SeverityTag severity={sev} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-16">Full Label:</span>
                  <SeverityTag severity={sev} fullLabel />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-16">Small:</span>
                  <SeverityTag severity={sev} size="sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Confidence Bars */}
      <section className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1 border-b border-slate-100 pb-2">
          4. Confidence Bars (`ConfidenceBar`)
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Fractional score visualizer with qualitative tiers and high-contrast color tracks.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg border border-slate-100 bg-slate-50/60 space-y-4">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Score Examples:
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 block mb-1">High (0.98 - Institute Name Fuzzy Match):</span>
                <ConfidenceBar confidence={0.98} />
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1">High (0.94 - Land Area Discrepancy):</span>
                <ConfidenceBar confidence={0.94} />
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1">Moderate (0.82):</span>
                <ConfidenceBar confidence={0.82} />
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1">Low (0.60):</span>
                <ConfidenceBar confidence={0.60} />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-slate-100 bg-slate-50/60 space-y-4">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Sizes & Configurations:
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Large Bar (`lg`):</span>
                <ConfidenceBar confidence={0.95} size="lg" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1">Small Bar (`sm`):</span>
                <ConfidenceBar confidence={0.95} size="sm" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1">Value Only (no header label):</span>
                <ConfidenceBar confidence={0.91} showLabel={false} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Compound Demo Card */}
      <section className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1 border-b border-slate-100 pb-2">
          5. Combined Presentation Preview (Finding Card Teaser)
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Demonstration of StatusBadge + SeverityTag + ConfidenceBar arranged as they will appear in FindingCard.
        </p>

        <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/40 space-y-3 max-w-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <StatusBadge status={FINDING_STATUS.MISMATCH_DETECTED} size="sm" />
              <SeverityTag severity={SEVERITY.HIGH} size="sm" />
            </div>
            <span className="text-xs font-mono font-medium text-slate-500">Rule: LAND_AREA_CONSISTENCY</span>
          </div>

          <p className="text-sm text-slate-700">
            Land area in the affidavit differs from the registered land document (4.2 acres vs 3.8 acres).
          </p>

          <ConfidenceBar confidence={0.94} size="sm" />

          <div className="text-[11px] text-amber-900/80 italic pt-1 border-t border-amber-200/60">
            Preliminary indicator. Human verification required.
          </div>
        </div>
      </section>
    </div>
  );
}
