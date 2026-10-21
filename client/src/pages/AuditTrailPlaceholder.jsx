import React from 'react';

export default function AuditTrailPlaceholder() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-4">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-800 mb-2">Audit Trail Shell (Auditor View)</h2>
      <p className="text-slate-500 text-sm max-w-md mx-auto mb-4">
        Vertical timeline of system rules and live officer actions, filterable by actor and linked to findings, will be mounted here in step 7.
      </p>
      <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono">
        Route: /audit
      </div>
    </div>
  );
}
