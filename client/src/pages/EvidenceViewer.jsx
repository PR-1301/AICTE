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
      {/* Top Navigation Bar: Back button */}
      <div className="flex items-center justify-between">
        <Link
          to={`/officer/applications/${appId}`}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:text-[#0F2A4A] hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#1F6FEB]"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Return to Application Review ({appId})</span>
        </Link>
      </div>

      {/* Breadcrumbs & Interactive Finding Selector Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs font-medium text-slate-500 mb-1.5">
            <Link to="/officer/dashboard" className="hover:text-[#1F6FEB] transition-colors">
              Dashboard
            </Link>
            <span className="text-slate-300">/</span>
            <Link to={`/officer/applications/${appId}`} className="hover:text-[#1F6FEB] transition-colors">
              {appId} ({application.institute})
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold">Evidence: {fid}</span>
          </nav>
          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F2A4A] tracking-tight">
              Scrutiny Evidence Viewer
            </h1>
            <StatusBadge status={finding.status} size="sm" />
          </div>
        </div>

        {/* Quick Sibling Findings Switcher */}
        {allFindings.length > 0 && (
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0">
            <span className="text-xs text-slate-500 font-semibold shrink-0 mr-1">
              Switch Finding:
            </span>
            {allFindings.map((f) => {
              const isActive = f.id === fid;
              const isStatusVerified = f.status === FINDING_STATUS.VERIFIED;
              const isStatusExpired = f.status === FINDING_STATUS.EXPIRED;
              const isStatusMismatch = f.status === FINDING_STATUS.MISMATCH_DETECTED;

              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => navigate(`/officer/applications/${appId}/findings/${f.id}`)}
                  className={`inline-flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-lg font-mono font-bold border transition-colors shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1F6FEB] ${
                    isActive
                      ? 'bg-[#0F2A4A] text-white border-[#0F2A4A] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200/90 hover:bg-slate-100'
                  }`}
                  title={`${f.rule} - ${f.status}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isStatusVerified
                        ? 'bg-emerald-400'
                        : isStatusExpired
                        ? 'bg-rose-500'
                        : isStatusMismatch
                        ? 'bg-amber-400'
                        : 'bg-purple-400'
                    }`}
                  />
                  <span>{f.id}</span>
                </button>
              );
            })}
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
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col h-full overflow-hidden">
              <div className="bg-slate-50/90 border-b border-slate-200/80 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <h3 className="text-base font-bold text-slate-800">
                    State Registry / Source Verification Record
                  </h3>
                </div>
                <StatusBadge status={FINDING_STATUS.EXPIRED} size="sm" />
              </div>

              <div className="flex-1 p-6 flex flex-col justify-center space-y-4 bg-slate-50/50">
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 space-y-2">
                  <div className="flex items-center space-x-2 text-rose-800 font-bold text-base">
                    <svg className="w-5 h-5 text-rose-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>Statutory Validity Window Expired</span>
                  </div>
                  <p className="text-sm text-rose-950 leading-relaxed font-medium">
                    Automated check queried State Directorate of Fire & Emergency Services Registry. Certificate validity lapsed on <strong>30-06-2026</strong>. Technical institutions must maintain an active Fire Safety Clearance throughout the Academic Year 2026-27.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-200/90 text-sm space-y-2.5 text-slate-700 shadow-2xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Issuing Registry Authority:</span>
                    <span className="font-semibold text-slate-800">Directorate of Fire & Emergency Services</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Lapsed Certificate Validity:</span>
                    <span className="font-bold text-rose-700 font-mono">30-06-2026</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Recommended Officer Action:</span>
                    <span className="font-bold text-amber-800">Issue Request for Renewed NOC</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Case 3: Missing Document (Right card showing Statutory Checklist requirement) */}
          {isMissing && (
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col h-full overflow-hidden">
              <div className="bg-slate-50/90 border-b border-slate-200/80 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <h3 className="text-base font-bold text-slate-800">
                    Statutory Rule Norm Requirement
                  </h3>
                </div>
                <StatusBadge status={FINDING_STATUS.MANUAL_REVIEW_REQUIRED} size="sm" />
              </div>

              <div className="flex-1 p-6 flex flex-col justify-center space-y-4 bg-slate-50/50">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-950 font-bold text-base">
                    <svg className="w-5 h-5 text-amber-700 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Approval Process Handbook Norm (Rule 2.4)</span>
                  </div>
                  <p className="text-sm text-amber-950 leading-relaxed font-medium">
                    Under AICTE Regulations Chapter II, any technical institution requesting an <strong>Intake Increase</strong> or <strong>New Course Addition</strong> must hold valid NBA accreditation for eligible programs or NAAC accreditation with minimum Grade &lsquo;A&rsquo;.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-200/90 text-sm space-y-2.5 text-slate-700 shadow-2xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Category Applied:</span>
                    <span className="font-semibold text-slate-800">{application.category}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Required Document:</span>
                    <span className="font-semibold text-slate-900">NBA / NAAC Certificate</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Submission Status:</span>
                    <span className="font-bold text-rose-700">Omitted (Not Submitted)</span>
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
