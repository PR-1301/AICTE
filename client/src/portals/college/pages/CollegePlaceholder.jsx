import React from 'react';

export default function CollegePlaceholder({ title = 'Coming Soon', description }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
      <p className="text-sm text-slate-500 max-w-md mx-auto">
        {description || 'This screen is being built as part of the College Application Portal. Check back soon.'}
      </p>
    </div>
  );
}
