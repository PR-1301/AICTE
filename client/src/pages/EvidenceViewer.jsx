import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getApplication, getFinding, getFindings } from '../api';
import DocViewer from '../components/DocViewer';
import FindingCard from '../components/FindingCard';
import StatusBadge from '../components/StatusBadge';
import ErrorState from '../components/ErrorState';
import { FINDING_STATUS } from '../constants';

/**
 * Evidence Viewer Page (Hero Screen - AGENTS.md Section 5.1).
 * Shows two documents side-by-side with fractional bounding-box highlights,
 * accompanied by the FindingCard below.
 * Handles three cases:
 *  1. Mismatch (two fractional highlights across two distinct documents)
 *  2. Expired (one highlight on expiry date + official registry verification card)
 *  3. Missing document (empty-state checklist card, no image + regulatory handbook norm card)
 */
export default function EvidenceViewer() {
  const { id: appId, fid } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [application, setApplication] = useState(null);
  const [finding, setFinding] = useState(null);
  const [allFindings, setAllFindings] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadEvidenceData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch application, current finding, and sibling findings strictly via src/api
        const [appData, findingData, findingsList] = await Promise.all([
          getApplication(appId),
          getFinding(fid),
          getFindings(appId),
        ]);

        if (!isMounted) return;

        if (!appData) {
          setError(`Application ${appId} was not found.`);
          return;
        }

        if (!findingData) {
          setError(`Finding ${fid} was not found for application ${appId}.`);
          return;
        }

        setApplication(appData);
        setFinding(findingData);
        setAllFindings(findingsList || []);
        document.title = `Evidence: ${findingData.rule?.replace(/_/g, ' ') || fid} (${appData.id}) · AICTE Officer Portal`;
      } catch (err) {
        console.error('Failed to load evidence viewer:', err);
        if (isMounted) setError('An error occurred while loading validation evidence.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadEvidenceData();

    const handleReset = () => {
      loadEvidenceData();
    };
    window.addEventListener('aicte:reset-demo', handleReset);

    return () => {
      isMounted = false;
      window.removeEventListener('aicte:reset-demo', handleReset);
    };
  }, [appId, fid]);

  // Loading state skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading validation evidence">
        <div className="h-10 bg-white rounded-lg border border-slate-200 p-2 w-1/3"></div>
        <div className="h-24 bg-white rounded-xl border border-slate-200 p-5"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[480px]">
          <div className="bg-white rounded-xl border border-slate-200 p-6"></div>
          <div className="bg-white rounded-xl border border-slate-200 p-6"></div>
        </div>
        <div className="h-44 bg-white rounded-xl border border-slate-200 p-6"></div>
      </div>
    );
  }

  // Error state
  if (error || !finding || !application) {
    return (
      <ErrorState
        title="Validation Evidence Not Found"
        message={error || `Finding record "${fid}" for application "${appId}" could not be retrieved.`}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Resolve documents associated with this finding
  const docsMap = (application.documents || []).reduce((acc, d) => {
    acc[d.id] = d;
    return acc;
  }, {});

  const evidence = finding.evidence || [];
  const isMismatch = evidence.length >= 2;
  const isExpired = finding.status === FINDING_STATUS.EXPIRED;
  const isMissing = evidence.length === 0 || finding.status === FINDING_STATUS.MANUAL_REVIEW_REQUIRED;

  // Primary document
  const primaryEvidence = evidence[0];
  const primaryDoc = primaryEvidence ? docsMap[primaryEvidence.docId] : docsMap[finding.docId];

  // Secondary document (for mismatch comparisons)
  const secondaryEvidence = evidence[1];
  const secondaryDoc = secondaryEvidence ? docsMap[secondaryEvidence.docId] : null;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Navigation & Finding Switcher Workbench */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <Link
              to={`/officer/applications/${appId}`}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Docket</span>
            </Link>

            <span className="text-slate-300">|</span>

            <div>
              <div className="text-xs text-slate-500 font-medium">
                Application <span className="font-mono font-bold text-[#0A192F]">{appId}</span> · {application.institute}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0A192F] tracking-tight">
                Dual Document Scrutiny Workbench
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <StatusBadge status={finding.status} size="md" />
          </div>
        </div>

        {/* Quick Sibling Findings Switcher */}
        {allFindings.length > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <span className="text-xs text-slate-500 font-semibold shrink-0">
              Findings in Docket:
            </span>
            <div className="flex items-center space-x-1.5">
              {allFindings.map((f, idx) => {
                const isActive = f.id === fid;
                const isStatusVerified = f.status === FINDING_STATUS.VERIFIED;
                const isStatusExpired = f.status === FINDING_STATUS.EXPIRED;
                const isStatusMismatch = f.status === FINDING_STATUS.MISMATCH_DETECTED;

                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => navigate(`/officer/applications/${appId}/findings/${f.id}`)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1F6FEB] ${
                      isActive
                        ? 'bg-[#0A192F] text-white border-[#0A192F] shadow-xs ring-2 ring-blue-500/30'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isStatusVerified
                          ? 'bg-emerald-500'
                          : isStatusExpired
                          ? 'bg-rose-500'
                          : isStatusMismatch
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      }`}
                    />
                    <span>Finding {idx + 1}: {f.id}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Hero Visual Area: Two Side-By-Side DocViewers / Evidence Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Document View */}
        <div className="min-h-[480px]">
          <DocViewer
            doc={primaryDoc}
            title={primaryEvidence?.docName || primaryDoc?.type || 'Primary Statutory Filing'}
            highlights={primaryEvidence ? [primaryEvidence] : []}
            status={primaryDoc?.status || finding.status}
            emptyMessage={
              isMissing
                ? `Mandatory statutory document "${primaryDoc?.type || 'Accreditation Certificate'}" was omitted from the application bundle.`
                : null
            }
          />
        </div>

        {/* Right Document View */}
        <div className="min-h-[480px]">
          {/* Case 1: Mismatch (Two actual documents compared side by side) */}
          {isMismatch && secondaryDoc && (
            <DocViewer
              doc={secondaryDoc}
              title={secondaryEvidence?.docName || secondaryDoc?.type || 'Comparison Document (Deed)'}
              highlights={secondaryEvidence ? [secondaryEvidence] : []}
              status={secondaryDoc?.status}
            />
          )}

          {/* Case 2: Expired Document (Single document highlight + Right card showing Source Expiry details) */}
          {isExpired && !isMismatch && (
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="bg-[#0A192F] text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 ring-4 ring-rose-950/60"></span>
                  <h3 className="text-sm font-bold text-slate-100">
                    State Fire Directorate Registry Verification
                  </h3>
                </div>
                <StatusBadge status={FINDING_STATUS.EXPIRED} size="sm" />
              </div>

              <div className="flex-1 p-6 flex flex-col justify-center space-y-4 bg-[#F8FAFC]">
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                  <div className="flex items-center space-x-2 text-rose-900 font-bold text-sm">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                    <span>Statutory Validity Lapsed Before Anchor Date</span>
                  </div>
                  <p className="text-xs sm:text-sm text-rose-950 leading-relaxed font-medium">
                    Registry inquiry verified against State Directorate of Fire & Emergency Services records. The submitted No-Objection Certificate lapsed on <strong>30-06-2026</strong>. Statutory norms mandate an uninterrupted active permit throughout the Academic Year 2026–27.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs sm:text-sm space-y-3 text-slate-700 shadow-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Issuing Authority:</span>
                    <span className="font-semibold text-slate-900">Directorate of Fire & Emergency Services</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Lapsed Certificate Validity:</span>
                    <span className="font-bold text-rose-700 font-mono">30-06-2026</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Mandated Statutory Action:</span>
                    <span className="font-bold text-amber-800">Issue Notice for Current Valid NOC</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Case 3: Missing Document (Right card showing Statutory Checklist requirement) */}
          {isMissing && (
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="bg-[#0A192F] text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 ring-4 ring-rose-950/60"></span>
                  <h3 className="text-sm font-bold text-slate-100">
                    Statutory Gate Norm: Mandatory Accreditation
                  </h3>
                </div>
                <StatusBadge status={FINDING_STATUS.MANUAL_REVIEW_REQUIRED} size="sm" />
              </div>

              <div className="flex-1 p-6 flex flex-col justify-center space-y-4 bg-[#F8FAFC]">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-950 font-bold text-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    <span>Approval Process Handbook Norm (Rule 2.4)</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
                    Under AICTE Regulations Chapter II, any technical institution requesting an <strong>Intake Increase</strong> or <strong>New Course Addition</strong> must hold valid NBA accreditation for eligible programs or NAAC accreditation with minimum Grade &lsquo;A&rsquo;.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs sm:text-sm space-y-3 text-slate-700 shadow-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Category Applied:</span>
                    <span className="font-semibold text-slate-800">{application.category}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Required Statutory Filing:</span>
                    <span className="font-semibold text-slate-900">NBA / NAAC Grade Certificate</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Submission State:</span>
                    <span className="font-bold text-rose-700">Omitted from Package (Deficiency)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fallback Single Doc Card (for record lookup findings) */}
          {!isMismatch && !isExpired && !isMissing && (
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col h-full overflow-hidden">
              <div className="bg-slate-50/90 border-b border-slate-200/80 px-5 py-3.5 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800">
                  AICTE Central System Record
                </h3>
                <StatusBadge status={finding.status} size="sm" />
              </div>
              <div className="flex-1 p-6 flex flex-col justify-center space-y-4 bg-slate-50/50">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-950 leading-relaxed font-medium">
                  Cross-referenced with AICTE central master database record for approval category <strong>{application.category}</strong>.
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200/90 text-sm space-y-2.5 shadow-2xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Rule Evaluated:</span>
                    <span className="font-semibold text-slate-800">{finding.rule}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Validation Confidence:</span>
                    <span className="font-bold text-emerald-800 font-mono">
                      {Math.round((finding.confidence || 0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Finding Card Below Side-by-Side Viewers */}
      <div className="mt-6">
        <FindingCard finding={finding} />
      </div>
    </div>
  );
}
