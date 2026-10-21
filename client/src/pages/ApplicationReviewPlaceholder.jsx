import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ApplicationReviewPlaceholder() {
  const { id } = useParams();

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-4">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-800 mb-2">Application Review Shell</h2>
      <p className="text-slate-500 text-sm max-w-md mx-auto mb-4">
        Summary header, required documents checklist, and officer decision panel will be mounted here in step 5 & 6.
      </p>
      <div className="inline-flex items-center space-x-2 text-xs font-mono bg-slate-100 px-3 py-1 rounded text-slate-700 mb-4">
        <span>Application ID:</span>
        <span className="font-bold text-[#0F2A4A]">{id || 'APP-001'}</span>
      </div>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link
          to={`/officer/applications/${id || 'APP-001'}/findings/F-003`}
          className="text-xs px-3 py-1.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 font-medium"
        >
          Case 1: Mismatch (F-003 Land Area) →
        </Link>
        <Link
          to={`/officer/applications/${id || 'APP-001'}/findings/F-002`}
          className="text-xs px-3 py-1.5 rounded-md bg-rose-50 text-rose-900 border border-rose-300 hover:bg-rose-100 font-medium"
        >
          Case 2: Expired (F-002 Fire NOC) →
        </Link>
        <Link
          to={`/officer/applications/${id || 'APP-001'}/findings/F-004`}
          className="text-xs px-3 py-1.5 rounded-md bg-purple-50 text-purple-900 border border-purple-300 hover:bg-purple-100 font-medium"
        >
          Case 3: Missing Doc (F-004 NAAC Certificate) →
        </Link>
      </div>
    </div>
  );
}
