import React, { useState } from 'react';

// Required document types per application category
const INITIAL_CHECKLISTS = {
  'EoA - Extension of Approval': [
    { id: 'aff', type: 'Affidavit for EoA & Land Details', required: true, enabled: true, notes: 'Stamped & notarized. Must include survey numbers.' },
    { id: 'noc', type: 'Fire Safety NOC', required: true, enabled: true, notes: 'Valid NOC from State Fire Directorate. Must not be expired.' },
    { id: 'land', type: 'Land Title & Ownership Deed', required: true, enabled: true, notes: 'Registered deed or 7/12 extract.' },
    { id: 'naac', type: 'NBA / NAAC Accreditation Certificate', required: true, enabled: true, notes: 'Current valid accreditation.' },
    { id: 'ter', type: 'TER Processing Fee Receipt', required: true, enabled: true, notes: 'As per AICTE fee schedule.' },
  ],
  'EoA - Intake Increase': [
    { id: 'aff', type: 'Affidavit for EoA & Land Details', required: true, enabled: true, notes: 'Must reference additional intake capacity.' },
    { id: 'noc', type: 'Fire Safety NOC', required: true, enabled: true, notes: 'Valid NOC covering additional intake area.' },
    { id: 'land', type: 'Land Title & Ownership Deed', required: true, enabled: true, notes: 'Confirm adequate land for increased intake.' },
    { id: 'naac', type: 'NBA / NAAC Accreditation Certificate', required: true, enabled: true, notes: 'For the programme seeking intake increase.' },
    { id: 'ter', type: 'TER Processing Fee Receipt', required: true, enabled: true, notes: 'Revised fee for increased intake.' },
    { id: 'infra', type: 'Infrastructure Compliance Certificate', required: true, enabled: true, notes: 'Architect certificate for additional labs/classrooms.' },
  ],
  'EoA - New Course Addition': [
    { id: 'aff', type: 'Affidavit for EoA & Land Details', required: true, enabled: true, notes: 'Cover new course area.' },
    { id: 'noc', type: 'Fire Safety NOC', required: true, enabled: true, notes: 'Valid NOC for new course premises.' },
    { id: 'land', type: 'Land Title & Ownership Deed', required: true, enabled: true, notes: 'Confirm land adequacy for new programme.' },
    { id: 'prog', type: 'Programme Feasibility Report', required: true, enabled: true, notes: 'Detailed feasibility study including job market analysis.' },
    { id: 'ter', type: 'TER Processing Fee Receipt', required: true, enabled: true, notes: 'New course application fee.' },
    { id: 'fac', type: 'Faculty Qualification Certificates', required: true, enabled: true, notes: 'Qualification certs and appointment letters.' },
  ],
};

export default function ChecklistEditor() {
  const [checklists, setChecklists] = useState(INITIAL_CHECKLISTS);
  const [activeCategory, setActiveCategory] = useState(Object.keys(INITIAL_CHECKLISTS)[0]);
  const [saved, setSaved] = useState(false);
  const [editingNote, setEditingNote] = useState(null); // { cat, id }
  const [noteValue, setNoteValue] = useState('');

  const categories = Object.keys(checklists);
  const docs = checklists[activeCategory] || [];

  const toggleEnabled = (docId) => {
    setChecklists((prev) => ({
      ...prev,
      [activeCategory]: prev[activeCategory].map((d) =>
        d.id === docId ? { ...d, enabled: !d.enabled } : d
      ),
    }));
    setSaved(false);
  };

  const toggleRequired = (docId) => {
    setChecklists((prev) => ({
      ...prev,
      [activeCategory]: prev[activeCategory].map((d) =>
        d.id === docId ? { ...d, required: !d.required } : d
      ),
    }));
    setSaved(false);
  };

  const handleSaveNote = () => {
    if (!editingNote) return;
    setChecklists((prev) => ({
      ...prev,
      [editingNote.cat]: prev[editingNote.cat].map((d) =>
        d.id === editingNote.id ? { ...d, notes: noteValue } : d
      ),
    }));
    setEditingNote(null);
    setSaved(false);
  };

  const handleSave = () => {
    // Simulate save
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Checklist Editor</h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure required documents per application category. Changes affect what institutions must submit.
            </p>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              saved
                ? 'bg-emerald-500 text-white'
                : 'bg-[#3b1764] hover:bg-[#2e1065] text-white'
            }`}
          >
            {saved ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Saved</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

        {/* Advisory */}
        <div className="mt-4 p-3 rounded-lg bg-purple-50 border border-purple-200 flex items-start space-x-2 text-xs text-purple-800">
          <svg className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            <strong>Concept demo:</strong> Changes here update the in-memory checklist used by the College portal. 
            In the production system, changes would be versioned and require approval.
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        {/* Category Tabs */}
        <div className="md:w-56 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 sticky top-24">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5 mb-1">
              Application Categories
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer mb-1 ${
                  activeCategory === cat
                    ? 'bg-[#3b1764] text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="block leading-snug">{cat}</span>
                <span className={`text-[11px] font-normal mt-0.5 ${activeCategory === cat ? 'text-purple-200' : 'text-slate-400'}`}>
                  {checklists[cat].filter((d) => d.enabled).length} active docs
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Document Checklist Table */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-800 text-base">{activeCategory}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {docs.filter((d) => d.required && d.enabled).length} required, {docs.filter((d) => !d.required && d.enabled).length} optional, {docs.filter((d) => !d.enabled).length} disabled
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {docs.map((doc, idx) => (
                <div key={doc.id} className={`px-6 py-4 ${!doc.enabled ? 'opacity-50 bg-slate-50' : ''}`}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <span className="text-xs text-slate-400 font-mono">#{idx + 1}</span>
                        <span className="font-semibold text-slate-800 text-sm">{doc.type}</span>
                        {doc.required && doc.enabled && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">Required</span>
                        )}
                        {!doc.required && doc.enabled && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">Optional</span>
                        )}
                        {!doc.enabled && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded">Disabled</span>
                        )}
                      </div>

                      {/* Notes */}
                      {editingNote?.cat === activeCategory && editingNote?.id === doc.id ? (
                        <div className="mt-2 flex items-center space-x-2">
                          <input
                            type="text"
                            value={noteValue}
                            onChange={(e) => setNoteValue(e.target.value)}
                            className="flex-1 text-xs rounded border border-slate-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-700"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveNote()}
                          />
                          <button onClick={handleSaveNote} className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer">Save</button>
                          <button onClick={() => setEditingNote(null)} className="text-xs text-slate-500 hover:underline cursor-pointer">Cancel</button>
                        </div>
                      ) : (
                        <div className="mt-1 flex items-start space-x-1.5">
                          <p className="text-xs text-slate-500">{doc.notes}</p>
                          <button
                            onClick={() => { setEditingNote({ cat: activeCategory, id: doc.id }); setNoteValue(doc.notes); }}
                            className="text-[11px] text-purple-600 hover:underline shrink-0 cursor-pointer"
                          >Edit</button>
                        </div>
                      )}
                    </div>

                    {/* Toggles */}
                    <div className="flex items-center space-x-4 shrink-0">
                      <label className="flex items-center space-x-2 cursor-pointer" title="Toggle required">
                        <span className="text-xs text-slate-500">Required</span>
                        <button
                          role="switch"
                          aria-checked={doc.required}
                          onClick={() => toggleRequired(doc.id)}
                          className={`relative inline-flex items-center w-9 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer ${
                            doc.required ? 'bg-red-500' : 'bg-slate-300'
                          }`}
                        >
                          <span className={`inline-block w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${doc.required ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer" title="Toggle enabled">
                        <span className="text-xs text-slate-500">Enabled</span>
                        <button
                          role="switch"
                          aria-checked={doc.enabled}
                          onClick={() => toggleEnabled(doc.id)}
                          className={`relative inline-flex items-center w-9 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer ${
                            doc.enabled ? 'bg-purple-600' : 'bg-slate-300'
                          }`}
                        >
                          <span className={`inline-block w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${doc.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
