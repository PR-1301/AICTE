import React from 'react';
import { DISCLAIMER_ADVISORY } from '../constants';

/**
 * STEP 6 PLACEHOLDER: Decision Panel will be implemented in Step 6.
 * Actions: Approve, Request more info, Send for inspection with mandatory remarks.
 */
export default function DecisionPanelPlaceholder() {
  return (
    <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 p-6 text-center space-y-3">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-500 mx-auto">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-700">
          Officer Decision Panel Slot
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-0.5">
          [Step 6 Placeholder: Officer actions (Approve, Request more info, Send for physical inspection) with mandatory remarks will be mounted here.]
        </p>
      </div>

      <div className="pt-2 text-xs text-amber-800 bg-amber-50 rounded py-2 px-3 inline-block border border-amber-200/60 font-medium">
        {DISCLAIMER_ADVISORY}
      </div>
    </div>
  );
}
