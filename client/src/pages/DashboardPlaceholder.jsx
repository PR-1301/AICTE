import React from 'react';

export default function DashboardPlaceholder() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-[#1F6FEB] mb-4">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-800 mb-2">Officer Dashboard Shell</h2>
      <p className="text-slate-500 text-sm max-w-md mx-auto mb-4">
        Stat cards, applications table, Recharts distribution chart, and alerts panel will be mounted here in step 8.
      </p>
      <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono">
        Route: /dashboard
      </div>
    </div>
  );
}
