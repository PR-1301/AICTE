import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function EvidenceViewerPlaceholder() {
  const { id, fid } = useParams();

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-600 mb-4">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-800 mb-2">Evidence Viewer Shell (Hero Screen)</h2>
      <p className="text-slate-500 text-sm max-w-md mx-auto mb-4">
        Side-by-side document comparison with fractional bounding-box highlights and explainable finding cards will be mounted here in step 4.
      </p>
      <div className="inline-flex items-center space-x-3 text-xs font-mono bg-slate-100 px-3 py-1.5 rounded text-slate-700 mb-4">
        <span>Application: <strong className="text-[#0F2A4A]">{id}</strong></span>
        <span>•</span>
        <span>Finding: <strong className="text-amber-700">{fid}</strong></span>
      </div>
      <div>
        <Link
          to={`/applications/${id || 'APP-001'}`}
          className="text-xs text-[#1F6FEB] hover:underline"
        >
          ← Back to Application Review
        </Link>
      </div>
    </div>
  );
}
