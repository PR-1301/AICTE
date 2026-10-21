import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * 404 Not Found screen for unknown Officer portal routes.
 * Renders inside the Officer layout with an accessible link back to /officer/dashboard.
 */
export default function OfficerNotFound() {
  useEffect(() => {
    document.title = 'Page Not Found · AICTE Officer Portal';
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center max-w-xl mx-auto my-12">
      <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4 border border-slate-200">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <div className="inline-block px-3 py-1 rounded bg-slate-100 text-slate-600 text-xs font-mono font-semibold mb-3">
        HTTP 404 · Route Not Found
      </div>

      <h1 className="text-2xl font-bold text-[#0F2A4A] tracking-tight mb-2">
        Requested Scrutiny Page Does Not Exist
      </h1>

      <p className="text-base text-slate-600 mb-6 leading-relaxed">
        The scrutiny URL or institutional record you requested is not indexed in this portal. Please return to the scrutiny worklist.
      </p>

      <Link
        to="/officer/dashboard"
        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#0F2A4A] text-white text-base font-semibold hover:bg-[#1F6FEB] transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
