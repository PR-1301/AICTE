import React, { useState } from 'react';
import { FINDING_STATUS, SEVERITY } from '../../../constants';

const SEVERITY_CONFIG = {
  [SEVERITY.HIGH]: { label: 'High', textColor: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
  [SEVERITY.MEDIUM]: { label: 'Medium', textColor: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
  [SEVERITY.LOW]: { label: 'Low', textColor: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-400' },
};

// Rules catalogue
const INITIAL_RULES = [
  {
    id: 'RULE-001',
    name: 'INSTITUTE_NAME_FUZZY_MATCH',
    label: 'Institute Name Consistency (Fuzzy)',
    description: 'Checks that the institution name across all submitted documents matches within the allowed fuzzy-match threshold. Abbreviations and minor variations are tolerated.',
    status: FINDING_STATUS.VERIFIED,
    severity: SEVERITY.LOW,
    version: 'v1.4',
    threshold: 85,
    thresholdUnit: '% similarity',
    enabled: true,
    category: 'Consistency',
  },
  {
    id: 'RULE-002',
    name: 'NOC_VALIDITY_DATE',
    label: 'Fire Safety NOC Validity Check',
    description: 'Verifies that the Fire Safety NOC submitted is not expired as of the review date (DEMO_TODAY). Expired NOCs are flagged as high severity.',
    status: FINDING_STATUS.EXPIRED,
    severity: SEVERITY.HIGH,
    version: 'v2.1',
    threshold: 0,
    thresholdUnit: 'days grace',
    enabled: true,
    category: 'Validity',
  },
  {
    id: 'RULE-003',
    name: 'LAND_AREA_CONSISTENCY',
    label: 'Land Area Cross-Document Check',
    description: 'Cross-references the land area stated in the Affidavit against the registered Land Deed. Discrepancies beyond the tolerance are flagged as mismatches.',
    status: FINDING_STATUS.MISMATCH_DETECTED,
    severity: SEVERITY.HIGH,
    version: 'v1.2',
    threshold: 0.05,
    thresholdUnit: 'acres tolerance',
    enabled: true,
    category: 'Consistency',
  },
  {
    id: 'RULE-004',
    name: 'TER_AMOUNT_CHECK',
    label: 'TER Fee Amount Verification',
    description: 'Compares the TER amount on the submitted receipt against the AICTE portal fee record for the application category and intake size.',
    status: FINDING_STATUS.MISMATCH_DETECTED,
    severity: SEVERITY.MEDIUM,
    version: 'v1.0',
    threshold: 0,
    thresholdUnit: '₹ tolerance',
    enabled: true,
    category: 'Verification',
  },
  {
    id: 'RULE-005',
    name: 'ACCREDITATION_REQUIRED',
    label: 'NBA/NAAC Certificate Presence',
    description: 'Checks that at least one valid NBA or NAAC accreditation certificate is present in the submission. Missing certificate triggers Manual Review Required.',
    status: FINDING_STATUS.MANUAL_REVIEW_REQUIRED,
    severity: SEVERITY.HIGH,
    version: 'v1.1',
    threshold: null,
    thresholdUnit: null,
    enabled: true,
    category: 'Completeness',
  },
  {
    id: 'RULE-006',
    name: 'AFFIDAVIT_STAMP_DUTY',
    label: 'Affidavit Stamp Duty Detection',
    description: 'Uses OCR to detect and verify the presence of stamp duty markings on the submitted affidavit. Low confidence → Manual Review.',
    status: FINDING_STATUS.VERIFICATION_PENDING,
    severity: SEVERITY.MEDIUM,
    version: 'v0.9',
    threshold: 70,
    thresholdUnit: '% confidence',
    enabled: true,
    category: 'Verification',
  },
  {
    id: 'RULE-007',
    name: 'LAND_SURVEY_NUMBER',
    label: 'Survey Number Cross-Reference',
    description: 'Validates that land survey numbers in the Affidavit and Land Deed are identical. Uses exact string match with normalization.',
    status: FINDING_STATUS.VERIFIED,
    severity: SEVERITY.MEDIUM,
    version: 'v1.0',
    threshold: 100,
    thresholdUnit: '% match required',
    enabled: false,
    category: 'Consistency',
  },
];

const CATEGORIES = ['All', 'Consistency', 'Validity', 'Verification', 'Completeness'];

export default function ValidationRules() {
  const [rules, setRules] = useState(INITIAL_RULES);
  const [activeCategory, setActiveCategory] = useState('All');
  const [editingRule, setEditingRule] = useState(null);
  const [editBuffer, setEditBuffer] = useState({});
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = rules.filter((r) => {
    const matchCat = activeCategory === 'All' || r.category === activeCategory;
    const matchSearch = search === '' ||
      r.label.toLowerCase().includes(search.toLowerCase()) ||
      r.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleEnabled = (id) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
    setSaved(false);
  };

  const startEdit = (rule) => {
    setEditingRule(rule.id);
    setEditBuffer({ severity: rule.severity, threshold: rule.threshold, description: rule.description });
  };

  const saveEdit = (id) => {
    setRules((prev) => prev.map((r) =>
      r.id === id ? { ...r, ...editBuffer, version: bumpVersion(r.version) } : r
    ));
    setEditingRule(null);
    setSaved(false);
  };

  const bumpVersion = (v) => {
    const parts = v.replace('v', '').split('.').map(Number);
    parts[1] = (parts[1] || 0) + 1;
    return `v${parts.join('.')}`;
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Validation Rules</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage the rule engine that powers AI-assisted document validation. Adjust thresholds, severity levels, and rule toggles.
            </p>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              saved ? 'bg-emerald-500 text-white' : 'bg-[#3b1764] hover:bg-[#2e1065] text-white'
            }`}
          >
            {saved ? (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg><span>Saved</span></>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg><span>Save Changes</span></>
            )}
          </button>
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Rules', value: rules.length, color: 'text-slate-700' },
            { label: 'Active', value: rules.filter((r) => r.enabled).length, color: 'text-purple-700' },
            { label: 'High Severity', value: rules.filter((r) => r.severity === SEVERITY.HIGH && r.enabled).length, color: 'text-red-700' },
            { label: 'Disabled', value: rules.filter((r) => !r.enabled).length, color: 'text-slate-400' },
          ].map((s) => (
            <div key={s.label} className="bg-slate-50 rounded-lg border border-slate-100 p-3 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rules…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                activeCategory === cat
                  ? 'bg-[#3b1764] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-purple-300 hover:text-purple-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400 text-sm">No rules match the current filters.</div>
        )}
        {filtered.map((rule) => {
          const sev = SEVERITY_CONFIG[rule.severity] || SEVERITY_CONFIG[SEVERITY.LOW];
          const isEditing = editingRule === rule.id;
          return (
            <div
              key={rule.id}
              className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden transition-all ${
                !rule.enabled ? 'border-slate-200 opacity-60' : 'border-slate-200'
              }`}
            >
              <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-2 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${sev.dot}`} />
                  <span className="font-semibold text-slate-800 text-sm">{rule.label}</span>
                  <span className="font-mono text-[11px] text-slate-400">{rule.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${sev.textColor} ${sev.bg} ${sev.border}`}>{sev.label}</span>
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">{rule.version}</span>
                  <span className="text-[11px] text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded">{rule.category}</span>
                  {!rule.enabled && <span className="text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">Disabled</span>}
                </div>
              </div>

              <div className="p-5">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                      <textarea
                        value={editBuffer.description}
                        onChange={(e) => setEditBuffer((b) => ({ ...b, description: e.target.value }))}
                        rows={2}
                        className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Severity</label>
                        <select
                          value={editBuffer.severity}
                          onChange={(e) => setEditBuffer((b) => ({ ...b, severity: e.target.value }))}
                          className="text-sm rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        >
                          <option value={SEVERITY.LOW}>Low</option>
                          <option value={SEVERITY.MEDIUM}>Medium</option>
                          <option value={SEVERITY.HIGH}>High</option>
                        </select>
                      </div>
                      {rule.threshold !== null && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Threshold ({rule.thresholdUnit})
                          </label>
                          <input
                            type="number"
                            value={editBuffer.threshold ?? ''}
                            onChange={(e) => setEditBuffer((b) => ({ ...b, threshold: parseFloat(e.target.value) }))}
                            className="w-28 text-sm rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                        </div>
                      )}
                      <div className="flex items-center space-x-3 ml-auto pt-4">
                        <button onClick={() => setEditingRule(null)} className="text-sm text-slate-500 hover:text-slate-700 font-medium cursor-pointer">Cancel</button>
                        <button
                          onClick={() => saveEdit(rule.id)}
                          className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#3b1764] hover:bg-[#2e1065] text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400"
                        >
                          Save Rule
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-600 leading-relaxed">{rule.description}</p>
                      {rule.threshold !== null && (
                        <p className="text-xs text-slate-400 mt-1.5">
                          Threshold: <strong className="text-slate-600">{rule.threshold} {rule.thresholdUnit}</strong>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 shrink-0">
                      <button
                        onClick={() => startEdit(rule)}
                        className="text-xs font-semibold text-purple-700 hover:text-purple-900 hover:underline cursor-pointer focus:outline-none"
                      >
                        Edit
                      </button>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <span className="text-xs text-slate-500">{rule.enabled ? 'Active' : 'Disabled'}</span>
                        <button
                          role="switch"
                          aria-checked={rule.enabled}
                          onClick={() => toggleEnabled(rule.id)}
                          className={`relative inline-flex items-center w-9 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer ${
                            rule.enabled ? 'bg-purple-600' : 'bg-slate-300'
                          }`}
                        >
                          <span className={`inline-block w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${rule.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
