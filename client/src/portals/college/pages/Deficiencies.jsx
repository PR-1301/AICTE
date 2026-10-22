import React, { useState, useRef, useEffect } from 'react';

// Mock deficiency data representing what the officer flagged on APP-001
const DEFICIENCIES = [
  {
    id: 'DEF-001',
    docType: 'Affidavit for EoA & Land Details',
    ruleLabel: 'Land Area Consistency',
    status: 'MISMATCH_DETECTED',
    severity: 'high',
    officerNote: 'Land area in the affidavit (4.2 acres) differs from the registered land deed (3.8 acres). Please re-upload a corrected affidavit that matches the land document or provide a clarification letter.',
    raisedOn: '2026-10-20',
    deadline: '2026-11-04',
    resolved: false,
  },
  {
    id: 'DEF-002',
    docType: 'Fire Safety NOC',
    ruleLabel: 'Document Validity Check',
    status: 'EXPIRED',
    severity: 'high',
    officerNote: 'The submitted Fire Safety NOC expired on 30 June 2026. A valid NOC is mandatory for Extension of Approval. Please upload a renewed NOC from the State Fire Directorate.',
    raisedOn: '2026-10-20',
    deadline: '2026-11-04',
    resolved: false,
  },
  {
    id: 'DEF-003',
    docType: 'TER Processing Fee Receipt',
    ruleLabel: 'TER Fee Reconciliation',
    status: 'MISMATCH_DETECTED',
    severity: 'medium',
    officerNote: 'The TER receipt amount (₹1,50,000) does not match the mandated AICTE fee schedule (₹2,00,000) for requested intake increase category. Please upload revised payment receipt or fee difference challan.',
    raisedOn: '2026-10-20',
    deadline: '2026-11-04',
    resolved: false,
  },
  {
    id: 'DEF-004',
    docType: 'NBA / NAAC Accreditation Certificate',
    ruleLabel: 'Required Document Missing',
    status: 'MANUAL_REVIEW_REQUIRED',
    severity: 'high',
    officerNote: 'Accreditation certificate was not submitted. This is a mandatory document for EoA - Intake Increase. Please upload your current NBA or NAAC accreditation certificate.',
    raisedOn: '2026-10-20',
    deadline: '2026-11-04',
    resolved: false,
  },
];

const SEVERITY_CONFIG = {
  high: { label: 'High', textColor: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
  medium: { label: 'Medium', textColor: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
  low: { label: 'Low', textColor: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
};

const STATUS_CONFIG = {
  MISMATCH_DETECTED: { label: 'Mismatch Detected', textColor: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  EXPIRED: { label: 'Expired', textColor: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  MANUAL_REVIEW_REQUIRED: { label: 'Manual Review Required', textColor: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
};

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function DeficiencyCard({ deficiency, onResolveToggle }) {
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [note, setNote] = useState('');
  const fileRef = useRef(null);
  const sev = SEVERITY_CONFIG[deficiency.severity] || SEVERITY_CONFIG.medium;
  const statusCfg = STATUS_CONFIG[deficiency.status] || {};

  const handleReUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploadDone(true);
    }, 1500);
    e.target.value = '';
  };

  const handleSubmit = () => {
    if (uploadDone || deficiency.resolved) onResolveToggle(deficiency.id);
  };

  return (
    <div className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden ${
      deficiency.resolved ? 'border-emerald-300' : deficiency.severity === 'high' ? 'border-red-200' : 'border-amber-200'
    }`}>
      {/* Header */}
      <div className={`px-5 py-3 flex items-center justify-between flex-wrap gap-2 ${
        deficiency.resolved ? 'bg-emerald-50' : deficiency.severity === 'high' ? 'bg-red-50' : 'bg-amber-50'
      }`}>
        <div className="flex items-center space-x-3">
          {deficiency.resolved ? (
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${sev.dot}`} />
          )}
          <span className="text-sm font-semibold text-slate-800">{deficiency.docType}</span>
          <span className="font-mono text-xs text-slate-400">{deficiency.id}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${sev.textColor} ${sev.bg} ${sev.border}`}>
            {sev.label} Severity
          </span>
          {!deficiency.resolved && (
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusCfg.textColor} ${statusCfg.bg} ${statusCfg.border}`}>
              {statusCfg.label}
            </span>
          )}
          {deficiency.resolved && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 text-emerald-700 bg-emerald-100">
              Resolved
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Rule & Dates */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500">
          <span>Rule: <strong className="text-slate-700">{deficiency.ruleLabel}</strong></span>
          <div className="flex items-center space-x-3">
            <span>Raised: <strong className="text-slate-700">{formatDate(deficiency.raisedOn)}</strong></span>
            {!deficiency.resolved && (
              <span className="text-red-600 font-semibold">
                Deadline: {formatDate(deficiency.deadline)}
              </span>
            )}
          </div>
        </div>

        {/* Officer Remarks */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center space-x-2 mb-1.5">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Officer Remarks</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{deficiency.officerNote}</p>
        </div>

        {/* Resolved Note */}
        {deficiency.resolved && deficiency.resolvedNote && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="flex items-center space-x-2 mb-1">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Resolution Note</span>
            </div>
            <p className="text-sm text-emerald-800">{deficiency.resolvedNote}</p>
          </div>
        )}

        {/* Re-upload action */}
        {!deficiency.resolved && (
          <div className="space-y-3">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional: Add a clarification note for the officer…"
              rows={2}
              className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center space-x-2 text-sm font-semibold px-4 py-2 rounded-lg border border-slate-300 hover:border-emerald-400 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60"
              >
                {uploading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
                <span>{uploading ? 'Uploading…' : uploadDone ? '✓ Uploaded — Re-upload?' : 'Upload Corrected Document'}</span>
              </button>
              <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleReUpload} />
              {(uploadDone) && (
                <button
                  onClick={handleSubmit}
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0c4a2f] hover:bg-[#0a3622] text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  Submit Response
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Deficiencies() {
  const [deficiencies, setDeficiencies] = useState(DEFICIENCIES);

  useEffect(() => {
    const handleReset = () => setDeficiencies(DEFICIENCIES);
    window.addEventListener('aicte:reset-demo', handleReset);
    return () => window.removeEventListener('aicte:reset-demo', handleReset);
  }, []);

  const handleResolveToggle = (id) => {
    setDeficiencies((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, resolved: true, resolvedNote: 'Corrected document uploaded and response submitted.' }
          : d
      )
    );
  };

  const openCount = deficiencies.filter((d) => !d.resolved).length;
  const resolvedCount = deficiencies.filter((d) => d.resolved).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 pl-7 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0c4a2f]" aria-hidden="true" />
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-1">
              <span className="font-bold text-[#0c4a2f] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                APP-001
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700">Demo Institute of Technology</span>
              <span>•</span>
              <span className="text-slate-500">EoA - Intake Increase</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Deficiency Notices</h1>
            <p className="text-sm text-slate-500 mt-1">
              Review flagged deficiencies, read officer remarks, upload corrected documents, and respond to each notice.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {openCount > 0 && (
              <div className="text-center px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{openCount}</div>
                <div className="text-[11px] text-red-600 font-semibold">Open</div>
              </div>
            )}
            <div className="text-center px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="text-2xl font-bold text-emerald-700">{resolvedCount}</div>
              <div className="text-[11px] text-emerald-600 font-semibold">Resolved</div>
            </div>
          </div>
        </div>

        {openCount === 0 && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center space-x-3">
            <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-emerald-800 font-medium">All deficiencies resolved. Your responses have been sent to the officer for review.</p>
          </div>
        )}

        {openCount > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start space-x-3">
            <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-amber-800">
              <strong>{openCount} open {openCount === 1 ? 'deficiency' : 'deficiencies'}</strong> require your response. 
              Upload corrected documents and submit your response before the deadline.
            </p>
          </div>
        )}
      </div>

      {/* Deficiency Cards */}
      <div className="space-y-4">
        {deficiencies.map((def) => (
          <DeficiencyCard
            key={def.id}
            deficiency={def}
            onResolveToggle={handleResolveToggle}
          />
        ))}
      </div>

      {/* Advisory Footer */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start space-x-3">
        <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-blue-800 leading-relaxed">
          <strong>Advisory Notice:</strong> Deficiency notices are issued based on AI-assisted preliminary findings.
          The authorized AICTE Scrutiny Officer will make all final regulatory determinations.
          Your submitted responses will be reviewed by the officer before any decision is recorded.
        </p>
      </div>
    </div>
  );
}
