import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APPLICATION_STATUS, FINDING_STATUS } from '../../../constants';

// Document requirements per category (mirrors Admin checklist)
const CATEGORY_CHECKLISTS = {
  'EoA - Extension of Approval': [
    { id: 'aff', type: 'Affidavit for EoA & Land Details', description: 'Stamped & notarized affidavit confirming land area, ownership and compliance.', required: true },
    { id: 'noc', type: 'Fire Safety NOC', description: 'Valid Fire Safety NOC from State Fire Directorate (must be within validity period).', required: true },
    { id: 'land', type: 'Land Title & Ownership Deed', description: 'Registered deed or 7/12 extract confirming clear title and survey numbers.', required: true },
    { id: 'naac', type: 'NBA / NAAC Accreditation Certificate', description: 'Current valid accreditation certificate from NBA or NAAC.', required: true },
    { id: 'ter', type: 'TER Processing Fee Receipt', description: 'Official TER payment receipt as per AICTE fee schedule.', required: true },
  ],
  'EoA - Intake Increase': [
    { id: 'aff', type: 'Affidavit for EoA & Land Details', description: 'Notarized affidavit confirming land area and compliance.', required: true },
    { id: 'noc', type: 'Fire Safety NOC', description: 'Valid Fire Safety NOC from State Fire Directorate.', required: true },
    { id: 'land', type: 'Land Title & Ownership Deed', description: 'Land title confirming adequate area for increased intake.', required: true },
    { id: 'naac', type: 'NBA / NAAC Accreditation Certificate', description: 'Valid accreditation for the programme seeking intake increase.', required: true },
    { id: 'ter', type: 'TER Processing Fee Receipt', description: 'TER payment receipt as per revised intake fee schedule.', required: true },
    { id: 'infra', type: 'Infrastructure Compliance Certificate', description: 'Architect certificate confirming additional classroom / lab space.', required: true },
  ],
  'EoA - New Course Addition': [
    { id: 'aff', type: 'Affidavit for EoA & Land Details', description: 'Notarized affidavit confirming land area compliance.', required: true },
    { id: 'noc', type: 'Fire Safety NOC', description: 'Valid Fire Safety NOC covering new course area.', required: true },
    { id: 'land', type: 'Land Title & Ownership Deed', description: 'Land title confirming adequate area.', required: true },
    { id: 'prog', type: 'Programme Feasibility Report', description: 'Detailed feasibility study for the new technical programme.', required: true },
    { id: 'ter', type: 'TER Processing Fee Receipt', description: 'TER payment receipt for new course application.', required: true },
    { id: 'fac', type: 'Faculty Qualification Certificates', description: 'Qualification certificates and appointment letters for new course faculty.', required: true },
  ],
};

const CATEGORIES = Object.keys(CATEGORY_CHECKLISTS);

const COLLEGE_DETAILS = {
  name: 'Demo Institute of Technology',
  code: 'AICTE/WRO/MH/ENG/2026/0014',
  state: 'Maharashtra',
  type: 'Private Unaided',
};

export default function StartApplication() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const checklist = selectedCategory ? CATEGORY_CHECKLISTS[selectedCategory] : [];

  const handleProceed = () => {
    if (!selectedCategory) return;
    navigate('/college/upload');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Start New Application</h1>
            <p className="text-sm text-slate-500 mt-1">
              Select an application category and review the required document checklist before uploading.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="font-mono font-semibold text-slate-700">{COLLEGE_DETAILS.code}</span>
          </div>
        </div>

        {/* College Info */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Institution', value: COLLEGE_DETAILS.name },
            { label: 'State', value: COLLEGE_DETAILS.state },
            { label: 'Type', value: COLLEGE_DETAILS.type },
            { label: 'AY', value: '2026–27' },
          ].map((item) => (
            <div key={item.label} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</div>
              <div className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1 — Category Selection */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center space-x-3">
          <span className="w-7 h-7 rounded-full bg-[#0c4a2f] text-white text-sm font-bold flex items-center justify-center shrink-0">1</span>
          <div>
            <h2 className="text-base font-semibold text-slate-800">Select Application Category</h2>
            <p className="text-xs text-slate-500">Choose the type of approval you are applying for this academic year.</p>
          </div>
        </div>
        <div className="p-6 grid gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setConfirmed(false); }}
              className={`w-full text-left flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                selectedCategory === cat
                  ? 'border-[#0c4a2f] bg-emerald-50 shadow-sm'
                  : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selectedCategory === cat ? 'border-[#0c4a2f] bg-[#0c4a2f]' : 'border-slate-300'
                }`}>
                  {selectedCategory === cat && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                <div>
                  <div className="font-semibold text-slate-800">{cat}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {CATEGORY_CHECKLISTS[cat].length} documents required
                  </div>
                </div>
              </div>
              {selectedCategory === cat && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Selected</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2 — Document Checklist */}
      {selectedCategory && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center space-x-3">
            <span className="w-7 h-7 rounded-full bg-[#0c4a2f] text-white text-sm font-bold flex items-center justify-center shrink-0">2</span>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Required Documents — {selectedCategory}</h2>
              <p className="text-xs text-slate-500">Prepare all the documents listed below before proceeding to upload.</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {checklist.map((doc, idx) => (
              <div key={doc.id} className="px-6 py-4 flex items-start space-x-4">
                <span className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-800 text-sm">{doc.type}</span>
                    {doc.required && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{doc.description}</p>
                </div>
                <svg className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
            ))}
          </div>

          {/* Advisory Notice */}
          <div className="mx-6 mb-6 mt-2 p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>Important:</strong> All documents will be processed through an AI-assisted validation pipeline. 
              Ensure documents are clear, legible, and match the details in your institution's records. 
              Discrepancies will be flagged for officer review.
            </p>
          </div>

          {/* Confirm & Proceed */}
          <div className="px-6 pb-6">
            <label className="flex items-start space-x-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-sm text-slate-700">
                I confirm that I have reviewed the document requirements and the information I will submit is accurate to the best of my knowledge.
              </span>
            </label>
            <button
              onClick={handleProceed}
              disabled={!confirmed}
              className="w-full py-3 px-6 rounded-lg bg-[#0c4a2f] hover:bg-[#0a3622] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center justify-center space-x-2"
            >
              <span>Proceed to Upload Documents</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
