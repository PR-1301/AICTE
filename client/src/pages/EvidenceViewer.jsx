import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getApplication, getFinding, getFindings } from '../api';
import DocViewer from '../components/DocViewer';
import FindingCard from '../components/FindingCard';
import StatusBadge from '../components/StatusBadge';
import { FINDING_STATUS } from '../constants';

/**
 * Evidence Viewer Page (Hero Screen - AGENTS.md Section 5.1).
 * Shows two documents side-by-side with fractional bounding-box highlights,
 * accompanied by the FindingCard. Loads strictly via src/api.
 * Handles:
 *  1. Mismatch (two highlights across two docs)
 *  2. Expired (one highlight on expiry date)
 *  3. Missing document (empty-state card, no image)
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
      } catch (err) {
        console.error('Failed to load evidence viewer:', err);
        if (isMounted) setError('An error occurred while loading validation evidence.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadEvidenceData();

    return () => {
      isMounted = false;
    };
  }, [appId, fid]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[450px]">
          <div className="bg-slate-200 rounded-lg"></div>
          <div className="bg-slate-200 rounded-lg"></div>
        </div>
        <div className="h-44 bg-slate-200 rounded-lg"></div>
      </div>
    );
  }

  // Error state
  if (error || !finding || !application) {
    return (
      <div className="bg-white rounded-lg border border-rose-200 shadow-sm p-8 text-center max-w-2xl mx-auto my-8">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Evidence Viewer Notice</h3>
        <p className="text-sm text-slate-600 mb-6">{error || 'Finding record unavailable.'}</p>
        <Link
          to={`/officer/applications/${appId || 'APP-001'}`}
          className="inline-flex items-center px-4 py-2 rounded-md bg-[#0F2A4A] text-white text-sm font-medium hover:bg-[#1F6FEB] transition-colors"
        >
          ← Return to Application Review
        </Link>
      </div>
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
    <div className="space-y-6 pb-12">
      {/* Navigation Breadcrumbs & Finding Selector Bar */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link to="/officer/dashboard" className="hover:text-[#1F6FEB]">
              Dashboard
            </Link>
            <span>/</span>
            <Link to={`/officer/applications/${appId}`} className="hover:text-[#1F6FEB]">
              {appId} ({application.institute})
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">Finding {fid}</span>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-[#0F2A4A] tracking-tight">
              Evidence Viewer
            </h1>
            <StatusBadge status={finding.status} size="sm" />
          </div>
        </div>

        {/* Quick Findings Switcher */}
        {allFindings.length > 0 && (
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-slate-400 font-medium shrink-0 mr-1">
              Switch finding:
            </span>
            {allFindings.map((f) => (
              <button
                key={f.id}
                onClick={() => navigate(`/officer/applications/${appId}/findings/${f.id}`)}
                className={`text-xs px-2.5 py-1 rounded font-mono font-medium border transition-colors shrink-0 cursor-pointer ${
                  f.id === fid
                    ? 'bg-[#0F2A4A] text-white border-[#0F2A4A] shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={`${f.rule} - ${f.status}`}
              >
                {f.id}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hero Visual Area: Two Side-By-Side DocViewers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Document View */}
        <div className="min-h-[460px]">
          <DocViewer
            doc={primaryDoc}
            title={primaryEvidence?.docName || primaryDoc?.type || 'Primary Document'}
            highlights={primaryEvidence ? [primaryEvidence] : []}
            status={primaryDoc?.status || finding.status}
            emptyMessage={
              isMissing
                ? `Mandatory document "${primaryDoc?.type || 'Accreditation Certificate'}" was not uploaded by applicant.`
                : null
            }
          />
        </div>

        {/* Right Document View */}
        <div className="min-h-[460px]">
          {/* Case 1: Mismatch (Two actual documents compared side by side) */}
          {isMismatch && secondaryDoc && (
            <DocViewer
              doc={secondaryDoc}
              title={secondaryEvidence?.docName || secondaryDoc?.type || 'Comparison Document'}
              highlights={secondaryEvidence ? [secondaryEvidence] : []}
              status={secondaryDoc?.status}
            />
          )}

          {/* Case 2: Expired Document (Single document highlight + Right card showing Source Expiry details) */}
          {isExpired && !isMismatch && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <h3 className="text-sm font-semibold text-slate-800">
                    State Registry / Source Verification Record
                  </h3>
                </div>
                <StatusBadge status={FINDING_STATUS.EXPIRED} size="sm" />
              </div>

              <div className="flex-1 p-6 flex flex-col justify-center space-y-4 bg-slate-50/50">
                <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 space-y-2">
                  <div className="flex items-center space-x-2 text-rose-800 font-semibold text-sm">
                    <svg className="w-4 h-4 text-rose-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>Validity Window Expired</span>
                  </div>
                  <p className="text-xs text-rose-900 leading-relaxed">
                    Automated check queried State Fire Services Registry. Certificate validity lapsed on <strong>30-06-2026</strong>. Technical institutions must maintain an active Fire Safety Clearance throughout the Academic Year.
                  </p>
                </div>

                <div className="bg-white p-4 rounded border border-slate-200 text-xs space-y-2 text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Registry Source:</span>
                    <span className="font-semibold text-slate-700">Directorate of Fire & Emergency Services</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Extracted Validity:</span>
                    <span className="font-semibold text-rose-700">30-06-2026</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Recommended Action:</span>
                    <span className="font-semibold text-amber-700">Officer Request for Renewed NOC</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Case 3: Missing Document (Right card showing Statutory Checklist requirement) */}
          {isMissing && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Statutory Rule Norm Requirement
                  </h3>
                </div>
                <StatusBadge status={FINDING_STATUS.MANUAL_REVIEW_REQUIRED} size="sm" />
              </div>

              <div className="flex-1 p-6 flex flex-col justify-center space-y-4 bg-slate-50/50">
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-900 font-semibold text-sm">
                    <svg className="w-4 h-4 text-amber-700 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Approval Process Handbook Norm (Rule 2.4)</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Under AICTE Regulations Chapter II, any technical institution requesting an <strong>Intake Increase</strong> or <strong>New Course Addition</strong> must hold valid NBA accreditation for eligible programs or NAAC accreditation with minimum Grade 'A'.
                  </p>
                </div>

                <div className="bg-white p-4 rounded border border-slate-200 text-xs space-y-2 text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Category Applied:</span>
                    <span className="font-semibold text-slate-700">{application.category}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Required Document:</span>
                    <span className="font-semibold text-slate-800">NBA / NAAC Certificate</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Upload Status:</span>
                    <span className="font-semibold text-rose-600">Omitted (Not Submitted)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Single doc non-expired / non-missing fallback (e.g. TER fee or single field verify) */}
          {!isMismatch && !isExpired && !isMissing && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">
                  AICTE Portal System Record
                </h3>
                <StatusBadge status={finding.status} size="sm" />
              </div>
              <div className="flex-1 p-6 flex flex-col justify-center space-y-3 bg-slate-50/50">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900">
                  Cross-referenced with central database record for application category <strong>{application.category}</strong>.
                </div>
                <div className="bg-white p-4 rounded border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rule Applied:</span>
                    <span className="font-semibold">{finding.rule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Confidence:</span>
                    <span className="font-semibold">{Math.round(finding.confidence * 100)}%</span>
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
