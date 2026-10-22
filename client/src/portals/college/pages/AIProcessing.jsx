import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PIPELINE_STEPS = [
  {
    id: 'scan',
    label: 'Document Scan & Ingestion',
    description: 'Raw files are ingested and pre-processed for clarity and legibility.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    subSteps: [
      'Image pre-processing and deskew correction',
      'OCR text layer extraction (PaddleOCR)',
      'Page segmentation and layout analysis',
    ],
    durationMs: 2800,
  },
  {
    id: 'classify',
    label: 'Document Classification',
    description: 'Each document is classified by type using a trained ML model.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    subSteps: [
      'Document-type classification (scikit-learn)',
      'Confidence scoring per document',
      'Checklist matching — 4 documents parsed, 1 mandatory missing',
    ],
    durationMs: 2200,
  },
  {
    id: 'extract',
    label: 'Field Extraction',
    description: 'Structured fields are extracted from each document using NLP models.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    subSteps: [
      'Named entity recognition for dates, amounts, names',
      'Bounding-box annotation for highlighted fields',
      'Cross-document field mapping',
    ],
    durationMs: 3200,
  },
  {
    id: 'validate',
    label: 'Regulatory Rule Validation',
    description: 'Extracted fields are checked against AICTE validation rules and issuing source records.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    subSteps: [
      'Cross-document consistency checks (rapidfuzz)',
      'Validity date checks against DEMO_TODAY',
      'External source verification queries',
    ],
    durationMs: 3600,
  },
];

const STEP_STATUS = { WAITING: 'waiting', RUNNING: 'running', DONE: 'done' };

const FINAL_FINDINGS = [
  { label: 'Verified', count: 3, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { label: 'Mismatch Detected', count: 2, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { label: 'Expired', count: 1, color: 'text-red-700 bg-red-50 border-red-200' },
  { label: 'Manual Review', count: 1, color: 'text-blue-700 bg-blue-50 border-blue-200' },
];

export default function AIProcessing() {
  const navigate = useNavigate();
  const [stepStatuses, setStepStatuses] = useState(
    PIPELINE_STEPS.map(() => STEP_STATUS.WAITING)
  );
  const [currentSubStep, setCurrentSubStep] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [started, setStarted] = useState(false);

  const startProcessing = () => {
    setStarted(true);
    let delay = 0;
    PIPELINE_STEPS.forEach((step, idx) => {
      setTimeout(() => {
        setStepStatuses((prev) => {
          const updated = [...prev];
          updated[idx] = STEP_STATUS.RUNNING;
          return updated;
        });
        // Animate sub-steps
        step.subSteps.forEach((_, si) => {
          setTimeout(() => {
            setCurrentSubStep((prev) => ({ ...prev, [idx]: si }));
          }, (si + 1) * (step.durationMs / (step.subSteps.length + 1)));
        });
        setTimeout(() => {
          setStepStatuses((prev) => {
            const updated = [...prev];
            updated[idx] = STEP_STATUS.DONE;
            return updated;
          });
          if (idx === PIPELINE_STEPS.length - 1) {
            setTimeout(() => setIsComplete(true), 600);
          }
        }, step.durationMs);
      }, delay);
      delay += step.durationMs;
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">AI Validation Pipeline</h1>
            <p className="text-sm text-slate-500 mt-1">
              Your documents are being processed through the AI-assisted validation pipeline. This is strictly advisory — the officer makes all final decisions.
            </p>
          </div>
          {isComplete && (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-sm font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Validation Complete</span>
            </span>
          )}
        </div>

        {!started && (
          <div className="mt-4">
            <button
              onClick={startProcessing}
              className="py-3 px-8 rounded-lg bg-[#0c4a2f] hover:bg-[#0a3622] text-white font-semibold text-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Run AI Validation</span>
            </button>
          </div>
        )}
      </div>

      {/* Pipeline Steps */}
      <div className="space-y-3">
        {PIPELINE_STEPS.map((step, idx) => {
          const status = stepStatuses[idx];
          const subIdx = currentSubStep[idx] ?? -1;
          return (
            <div
              key={step.id}
              className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden transition-all duration-500 ${
                status === STEP_STATUS.DONE
                  ? 'border-emerald-300'
                  : status === STEP_STATUS.RUNNING
                  ? 'border-blue-400 shadow-blue-100'
                  : 'border-slate-200 opacity-60'
              }`}
            >
              <div className="p-5 flex items-start space-x-4">
                {/* Step Number / Status Icon */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                  status === STEP_STATUS.DONE
                    ? 'bg-emerald-500 text-white'
                    : status === STEP_STATUS.RUNNING
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {status === STEP_STATUS.DONE ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : status === STEP_STATUS.RUNNING ? (
                    <div className="animate-spin">
                      {step.icon}
                    </div>
                  ) : (
                    step.icon
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-slate-800 text-base">{step.label}</h3>
                    <span className="text-xs font-mono text-slate-400">Step {idx + 1}</span>
                    {status === STEP_STATUS.RUNNING && (
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full animate-pulse">
                        Processing…
                      </span>
                    )}
                    {status === STEP_STATUS.DONE && (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Complete
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>

                  {/* Sub-steps */}
                  {(status === STEP_STATUS.RUNNING || status === STEP_STATUS.DONE) && (
                    <ul className="mt-3 space-y-1.5">
                      {step.subSteps.map((sub, si) => {
                        const subDone = status === STEP_STATUS.DONE || si <= subIdx;
                        const subActive = status === STEP_STATUS.RUNNING && si === subIdx + 1;
                        return (
                          <li key={si} className={`flex items-center space-x-2 text-xs transition-all duration-300 ${subDone ? 'text-slate-700' : 'text-slate-400'}`}>
                            <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${
                              subDone ? 'border-emerald-400 bg-emerald-400' : 'border-slate-300'
                            }`}>
                              {subDone && (
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </span>
                            <span>{sub}</span>
                            {subActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Card */}
      {isComplete && (
        <div className="bg-white rounded-xl border-2 border-emerald-300 shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Preliminary Validation Complete</h2>
              <p className="text-xs text-slate-500">Your application has been queued for officer scrutiny. Findings are advisory only.</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 mb-4">
            <strong>Advisory notice:</strong> These findings are preliminary indicators generated by the AI pipeline. 
            All regulatory determinations will be made by an authorized AICTE Scrutiny Officer. 
            You will be notified of the outcome and any deficiency notices.
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {FINAL_FINDINGS.map((f) => (
              <div key={f.label} className={`rounded-lg border p-3 text-center ${f.color}`}>
                <div className="text-2xl font-bold">{f.count}</div>
                <div className="text-[11px] font-semibold mt-0.5">{f.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">Application ID: <strong className="text-slate-700 font-mono">APP-001</strong> · Status: Queued for Officer Review</p>
            <button
              onClick={() => navigate('/college/deficiencies')}
              className="py-2.5 px-6 rounded-lg bg-[#0c4a2f] hover:bg-[#0a3622] text-white font-semibold text-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center space-x-2"
            >
              <span>View Deficiency Notices</span>
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
