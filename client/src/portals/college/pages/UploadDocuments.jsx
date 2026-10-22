import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const REQUIRED_DOCS = [
  { id: 'aff', type: 'Affidavit for EoA & Land Details', description: 'Stamped & notarized affidavit', required: true, acceptedFormats: 'PDF, JPG, PNG' },
  { id: 'noc', type: 'Fire Safety NOC', description: 'Valid Fire Safety NOC from State Fire Directorate', required: true, acceptedFormats: 'PDF, JPG' },
  { id: 'land', type: 'Land Title & Ownership Deed', description: 'Registered deed or 7/12 extract', required: true, acceptedFormats: 'PDF, JPG, PNG' },
  { id: 'naac', type: 'NBA / NAAC Accreditation Certificate', description: 'Current valid accreditation certificate', required: false, acceptedFormats: 'PDF' },
  { id: 'ter', type: 'TER Processing Fee Receipt', description: 'Official TER payment receipt', required: true, acceptedFormats: 'PDF, JPG' },
];

const FILE_STATES = { IDLE: 'idle', UPLOADING: 'uploading', DONE: 'done', ERROR: 'error' };

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocUploadRow({ doc, file, fileState, progress, onFileSelect, onRemove }) {
  const inputRef = useRef(null);

  return (
    <div className={`p-5 rounded-xl border-2 transition-all ${
      fileState === FILE_STATES.DONE
        ? 'border-emerald-300 bg-emerald-50'
        : fileState === FILE_STATES.ERROR
        ? 'border-red-300 bg-red-50'
        : fileState === FILE_STATES.UPLOADING
        ? 'border-blue-300 bg-blue-50'
        : 'border-slate-200 bg-white'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {/* Status Icon */}
          <div className={`mt-0.5 w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
            fileState === FILE_STATES.DONE ? 'bg-emerald-500' :
            fileState === FILE_STATES.ERROR ? 'bg-red-500' :
            fileState === FILE_STATES.UPLOADING ? 'bg-blue-500' :
            'bg-slate-100'
          }`}>
            {fileState === FILE_STATES.DONE ? (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            ) : fileState === FILE_STATES.ERROR ? (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : fileState === FILE_STATES.UPLOADING ? (
              <svg className="w-5 h-5 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              <span className="font-semibold text-slate-800 text-sm">{doc.type}</span>
              {doc.required && (
                <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">Required</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{doc.description} · Accepts: {doc.acceptedFormats}</p>

            {/* File info */}
            {file && (
              <div className="mt-2 flex items-center space-x-2 text-xs">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-slate-600 font-medium truncate max-w-[180px]">{file.name}</span>
                <span className="text-slate-400">{formatBytes(file.size)}</span>
              </div>
            )}

            {/* Progress bar */}
            {fileState === FILE_STATES.UPLOADING && (
              <div className="mt-2">
                <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-blue-600 mt-1">Uploading… {progress}%</p>
              </div>
            )}
            {fileState === FILE_STATES.DONE && (
              <p className="text-xs text-emerald-600 font-medium mt-1">✓ Uploaded successfully</p>
            )}
            {fileState === FILE_STATES.ERROR && (
              <p className="text-xs text-red-600 font-medium mt-1">Upload failed. Please try again.</p>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="shrink-0">
          {fileState === FILE_STATES.DONE ? (
            <button
              onClick={() => onRemove(doc.id)}
              className="text-xs text-red-600 hover:text-red-800 hover:underline font-medium cursor-pointer focus:outline-none"
            >
              Remove
            </button>
          ) : fileState === FILE_STATES.UPLOADING ? null : (
            <button
              onClick={() => inputRef.current?.click()}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-[#0c4a2f] hover:bg-[#0a3622] text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {fileState === FILE_STATES.ERROR ? 'Retry' : 'Choose File'}
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFileSelect(doc.id, f);
              e.target.value = '';
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function UploadDocuments() {
  const navigate = useNavigate();
  const [uploads, setUploads] = useState(() =>
    Object.fromEntries(REQUIRED_DOCS.map((d) => [d.id, { file: null, state: FILE_STATES.IDLE, progress: 0 }]))
  );

  const handleFileSelect = (docId, file) => {
    setUploads((prev) => ({
      ...prev,
      [docId]: { file, state: FILE_STATES.UPLOADING, progress: 0 },
    }));

    // Simulate upload progress
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.floor(Math.random() * 20) + 10;
      if (prog >= 100) {
        prog = 100;
        clearInterval(interval);
        setUploads((prev) => ({
          ...prev,
          [docId]: { ...prev[docId], state: FILE_STATES.DONE, progress: 100 },
        }));
      } else {
        setUploads((prev) => ({
          ...prev,
          [docId]: { ...prev[docId], progress: prog },
        }));
      }
    }, 250);
  };

  const handleRemove = (docId) => {
    setUploads((prev) => ({
      ...prev,
      [docId]: { file: null, state: FILE_STATES.IDLE, progress: 0 },
    }));
  };

  const doneCount = Object.values(uploads).filter((u) => u.state === FILE_STATES.DONE).length;
  const allRequired = REQUIRED_DOCS.filter((d) => d.required);
  const allRequiredDone = allRequired.every((d) => uploads[d.id]?.state === FILE_STATES.DONE);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Upload Documents</h1>
            <p className="text-sm text-slate-500 mt-1">
              Upload all required statutory documents. Each file will be queued for AI-assisted classification and validation.
            </p>
          </div>
          {/* Progress summary */}
          <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#0c4a2f]">{doneCount}</div>
              <div className="text-[11px] text-slate-500">of {REQUIRED_DOCS.length}</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-xs text-slate-600">
              <div className="font-semibold">Documents Uploaded</div>
              <div className="text-slate-400">{REQUIRED_DOCS.length - doneCount} remaining</div>
            </div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-4">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0c4a2f] rounded-full transition-all duration-500"
              style={{ width: `${(doneCount / REQUIRED_DOCS.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">{Math.round((doneCount / REQUIRED_DOCS.length) * 100)}% complete</p>
        </div>
      </div>

      {/* Document Upload List */}
      <div className="space-y-3">
        {REQUIRED_DOCS.map((doc) => (
          <DocUploadRow
            key={doc.id}
            doc={doc}
            file={uploads[doc.id]?.file}
            fileState={uploads[doc.id]?.state}
            progress={uploads[doc.id]?.progress}
            onFileSelect={handleFileSelect}
            onRemove={handleRemove}
          />
        ))}
      </div>

      {/* Submit Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {!allRequiredDone && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start space-x-2 text-xs text-amber-800">
            <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>
              Upload all <strong>{allRequired.length} required documents</strong> to proceed. 
              {allRequired.length - allRequired.filter((d) => uploads[d.id]?.state === FILE_STATES.DONE).length} still missing.
            </span>
          </div>
        )}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => navigate('/college/application')}
            className="text-sm font-medium text-slate-600 hover:text-slate-800 flex items-center space-x-1 cursor-pointer focus:outline-none"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Category</span>
          </button>
          <button
            onClick={() => navigate('/college/processing')}
            disabled={!allRequiredDone}
            className="py-3 px-8 rounded-lg bg-[#0c4a2f] hover:bg-[#0a3622] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center space-x-2"
          >
            <span>Submit for AI Validation</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
