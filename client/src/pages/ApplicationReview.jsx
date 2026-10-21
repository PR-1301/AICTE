import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getApplication, getFindings, getAudit } from '../api';
import StatusBadge from '../components/StatusBadge';
import SeverityTag from '../components/SeverityTag';
import DecisionPanel from '../portals/officer/components/DecisionPanel';
import AuditTimeline from '../portals/officer/components/AuditTimeline';
import { FINDING_STATUS, SEVERITY } from '../constants';

/**
 * Urgency sorting comparator.
 * Sorts by urgency: High severity first, then expired/mismatch/manual review, then verified.
 */
function getUrgencyRank(item) {
  const severity = (item.severity || '').toLowerCase();
  const status = item.status;

  if (severity === SEVERITY.HIGH) return 5;
  if (status === FINDING_STATUS.EXPIRED) return 4;
  if (status === FINDING_STATUS.MISMATCH_DETECTED) return 3;
  if (status === FINDING_STATUS.MANUAL_REVIEW_REQUIRED) return 2;
  if (severity === SEVERITY.MEDIUM) return 2;
  return 1; // Verified or Low
}

function sortByUrgency(a, b) {
  return getUrgencyRank(b) - getUrgencyRank(a);
}

/**
 * Application Review Page (Route: /officer/applications/:id).
 * Loads strictly through src/api.
 * Dynamically calculates counts from documents & findings (does not read stored counts).
 * Includes Scrutiny & Findings tab and dedicated scoped Audit Trail tab.
 */
export default function ApplicationReview() {
  const { id: appId } = useParams();

  const [application, setApplication] = useState(null);
  const [findings, setFindings] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'audit'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [appData, findingsData, auditData] = await Promise.all([
        getApplication(appId),
        getFindings(appId),
        getAudit(appId),
      ]);

      if (!appData) {
        setError(`Application ${appId} was not found in the scrutiny database.`);
        return;
      }

      setApplication(appData);
      setFindings(findingsData || []);
      setAuditEvents(auditData || []);
    } catch (err) {
      console.error('Failed to load application review:', err);
      setError('Unable to load application details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleReset = () => loadData();
    window.addEventListener('aicte:reset-demo', handleReset);
    return () => {
      window.removeEventListener('aicte:reset-demo', handleReset);
    };
  }, [appId]);

  // Loading Skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-lg"></div>
        <div className="grid grid-cols-4 gap-4 h-20 bg-slate-200 rounded-lg"></div>
        <div className="h-64 bg-slate-200 rounded-lg"></div>
      </div>
    );
  }

  // Error State for Unknown Application
  if (error || !application) {
    return (
      <div className="bg-white rounded-lg border border-rose-200 shadow-sm p-8 text-center max-w-xl mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Application Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          {error || `No record matching application ID "${appId}".`}
        </p>
        <Link
          to="/officer/dashboard"
          className="inline-flex items-center px-4 py-2 rounded-md bg-[#0F2A4A] text-white text-sm font-medium hover:bg-[#1F6FEB] transition-colors"
        >
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  const documents = application.documents || [];

  // DYNAMIC COMPUTATION OF COUNTS (AGENTS.md step 5: Do not read stored counts field)
  // Compute from actual loaded findings and document submission statuses
  const mismatchCount = findings.filter((f) => f.status === FINDING_STATUS.MISMATCH_DETECTED).length;
  const expiredCount = findings.filter((f) => f.status === FINDING_STATUS.EXPIRED).length;
  const manualReviewCount =
    findings.filter((f) => f.status === FINDING_STATUS.MANUAL_REVIEW_REQUIRED).length +
    documents.filter((d) => d.notSubmitted && !findings.some((f) => f.docId === d.id)).length;

  const verifiedFindingsCount = findings.filter((f) => f.status === FINDING_STATUS.VERIFIED).length;
  // Also count verified documents that have no open defect findings
  const cleanDocsCount = documents.filter(
    (d) =>
      !d.notSubmitted &&
      d.status === FINDING_STATUS.VERIFIED &&
      !findings.some(
        (f) =>
          (f.docId === d.id || f.evidence?.some((e) => e.docId === d.id)) &&
          f.status !== FINDING_STATUS.VERIFIED
      )
  ).length;

  const verifiedCount = verifiedFindingsCount + cleanDocsCount;
  const isClean = mismatchCount === 0 && expiredCount === 0 && manualReviewCount === 0;

  // Split findings into:
  // 1. Single-document findings (belonging to document checklist)
  // 2. Cross-document and record checks (spans >1 document or external AICTE record reconciliation)
  const crossDocFindings = findings
    .filter(
      (f) =>
        (f.evidence && f.evidence.length > 1) ||
        f.rule.includes('RECONCILIATION') ||
        f.rule === 'TER_FEE_RECONCILIATION' ||
        f.rule === 'INSTITUTE_NAME_MATCH' ||
        f.rule === 'LAND_AREA_CONSISTENCY'
    )
    .sort(sortByUrgency);

  // Group document-specific findings by docId
  const docFindingsMap = {};
  findings.forEach((f) => {
    // If it's already in crossDocFindings, don't duplicate under a single doc
    if (crossDocFindings.some((cf) => cf.id === f.id)) return;

    const targetDocId = f.docId || (f.evidence && f.evidence[0]?.docId);
    if (targetDocId) {
      if (!docFindingsMap[targetDocId]) docFindingsMap[targetDocId] = [];
      docFindingsMap[targetDocId].push(f);
    }
  });

  // Prepare sorted document checklist rows
  const documentRows = documents
    .map((doc) => {
      const docSpecificFindings = docFindingsMap[doc.id] || [];
      const worstFinding = docSpecificFindings.sort(sortByUrgency)[0];

      // Effective status and urgency
      let effectiveStatus = doc.status || FINDING_STATUS.VERIFIED;
      let effectiveSeverity = SEVERITY.LOW;

      if (doc.notSubmitted) {
        effectiveStatus = FINDING_STATUS.MANUAL_REVIEW_REQUIRED;
        effectiveSeverity = SEVERITY.HIGH;
      } else if (worstFinding) {
        effectiveStatus = worstFinding.status;
        effectiveSeverity = worstFinding.severity;
      }

      return {
        ...doc,
        effectiveStatus,
        effectiveSeverity,
        docSpecificFindings,
      };
    })
    .sort((a, b) =>
      sortByUrgency(
        { status: a.effectiveStatus, severity: a.effectiveSeverity },
        { status: b.effectiveStatus, severity: b.effectiveSeverity }
      )
    );

  return (
    <div className="space-y-6 pb-16">
      {/* Back to Dashboard Navigation Link */}
      <div>
        <Link
          to="/officer/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-[#0F2A4A] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Applications Worklist</span>
        </Link>
      </div>

      {/* Application Header Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-1">
              <span>Application ID:</span>
              <strong className="text-[#0F2A4A] text-sm">{application.id}</strong>
              <span className="text-slate-300">|</span>
              <span>Submitted: {application.submittedOn}</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0F2A4A] tracking-tight">
              {application.institute}
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Category: <span className="font-semibold text-slate-800">{application.category}</span>
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Application Scrutiny Status
            </span>
            <StatusBadge status={application.status} size="lg" />
          </div>
        </div>

        {/* Dynamic Summary Strip (Computed strictly from loaded findings & documents) */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase text-emerald-800 tracking-wider block">
                  Verified
                </span>
                <span className="text-2xl font-bold text-emerald-900 tabular-nums">
                  {verifiedCount}
                </span>
              </div>
              <svg className="w-6 h-6 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase text-amber-800 tracking-wider block">
                  Mismatch
                </span>
                <span className="text-2xl font-bold text-amber-950 tabular-nums">
                  {mismatchCount}
                </span>
              </div>
              <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase text-rose-800 tracking-wider block">
                  Expired
                </span>
                <span className="text-2xl font-bold text-rose-950 tabular-nums">
                  {expiredCount}
                </span>
              </div>
              <svg className="w-6 h-6 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="p-3 rounded-lg bg-purple-50/70 border border-purple-200/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase text-purple-800 tracking-wider block">
                  Manual Review
                </span>
                <span className="text-2xl font-bold text-purple-950 tabular-nums">
                  {manualReviewCount}
                </span>
              </div>
              <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Clean Application All-Green State (Requirement: Short "No issues found" message) */}
        {isClean && (
          <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center space-x-3 text-emerald-900">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-sm">All Statutory Checks Verified &middot; No Issues Found</h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Every required document is active, valid, and fully reconciled across regulatory sources with zero discrepancies.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs: Scrutiny Findings vs Audit Trail */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          type="button"
          onClick={() => setActiveTab('review')}
          className={`py-2.5 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
            activeTab === 'review'
              ? 'border-[#0F2A4A] text-[#0F2A4A]'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <span>Scrutiny & Findings</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-mono">
            {documentRows.length + crossDocFindings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`py-2.5 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
            activeTab === 'audit'
              ? 'border-[#0F2A4A] text-[#0F2A4A]'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <span>Application Audit Trail</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-mono">
            {auditEvents.length}
          </span>
        </button>
      </div>

      {activeTab === 'review' ? (
        <>
          {/* 1. Required Document Checklist */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800 tracking-tight">
                  Required Documents Checklist
                </h2>
                <p className="text-xs text-slate-500">
                  Mandatory statutory filings (sorted by scrutiny urgency)
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {documentRows.length} Documents
              </span>
            </div>

            <div className="divide-y divide-slate-200">
              {documentRows.map((doc) => {
                const hasFinding = doc.docSpecificFindings.length > 0;
                const primaryFinding = doc.docSpecificFindings[0];

                return (
                  <div
                    key={doc.id}
                    className={`p-5 transition-colors ${
                      doc.notSubmitted
                        ? 'bg-purple-50/30'
                        : hasFinding && doc.effectiveStatus === FINDING_STATUS.EXPIRED
                        ? 'bg-rose-50/30'
                        : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          {doc.notSubmitted ? (
                            <div className="w-6 h-6 rounded bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                              !
                            </div>
                          ) : (
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-semibold text-slate-800">
                              {doc.type}
                            </h3>
                            {doc.required && (
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Mandatory
                              </span>
                            )}
                          </div>

                          {doc.notSubmitted ? (
                            <p className="text-xs text-rose-700 font-medium mt-0.5">
                              Not submitted &mdash; Statutory document omitted by applicant
                            </p>
                          ) : (
                            <p className="text-xs text-slate-500 mt-0.5 font-mono">
                              Document ID: {doc.id}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 self-start sm:self-auto">
                        <StatusBadge status={doc.effectiveStatus} size="sm" />

                        {/* Link to Evidence Viewer if document has findings or is missing */}
                        {(primaryFinding || doc.notSubmitted) && (
                          <Link
                            to={`/officer/applications/${appId}/findings/${primaryFinding?.id || 'F-004'}`}
                            className="text-xs font-semibold px-2.5 py-1 rounded bg-[#0F2A4A] text-white hover:bg-[#1F6FEB] transition-colors whitespace-nowrap"
                          >
                            Inspect Evidence &rarr;
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Sub-row for document-specific findings (e.g. Expired Fire NOC) */}
                    {hasFinding && (
                      <div className="mt-3 pl-8">
                        {doc.docSpecificFindings.map((f) => (
                          <div
                            key={f.id}
                            className="p-3 bg-white rounded border border-rose-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-mono font-bold text-slate-700">
                                  {f.rule}
                                </span>
                                <SeverityTag severity={f.severity} size="sm" />
                              </div>
                              <p className="text-xs text-slate-600">
                                {f.explanation}
                              </p>
                            </div>
                            <Link
                              to={`/officer/applications/${appId}/findings/${f.id}`}
                              className="text-xs text-[#1F6FEB] hover:underline font-semibold shrink-0"
                            >
                              View highlighted box &rarr;
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 2. Cross-Document and Record Checks */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800 tracking-tight">
                  Cross-Document and Record Checks
                </h2>
                <p className="text-xs text-slate-500">
                  Corroboration across multiple filings and central AICTE records (sorted by severity)
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {crossDocFindings.length} Cross Checks
              </span>
            </div>

            <div className="divide-y divide-slate-200">
              {crossDocFindings.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  No cross-document discrepancies recorded for this application.
                </div>
              ) : (
                crossDocFindings.map((f) => (
                  <div
                    key={f.id}
                    className="p-5 hover:bg-slate-50/60 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-xs font-mono font-bold text-[#0F2A4A]">
                          {f.rule}
                        </span>
                        <StatusBadge status={f.status} size="sm" />
                        <SeverityTag severity={f.severity} size="sm" />
                        <span className="text-xs text-slate-400 font-mono">
                          Confidence: {Math.round(f.confidence * 100)}%
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 leading-relaxed">
                        {f.explanation}
                      </p>

                      {/* Summary of compared documents */}
                      {f.evidence && f.evidence.length > 1 && (
                        <div className="flex items-center space-x-2 text-xs text-slate-500 pt-1">
                          <span className="font-semibold text-slate-600">Compared:</span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                            {f.evidence[0].docName || 'Doc 1'} ({f.evidence[0].value})
                          </span>
                          <span>vs</span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                            {f.evidence[1].docName || 'Doc 2'} ({f.evidence[1].value})
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0">
                      <Link
                        to={`/officer/applications/${appId}/findings/${f.id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-md bg-[#0F2A4A] text-white text-xs font-semibold hover:bg-[#1F6FEB] transition-colors shadow-2xs"
                      >
                        Open Evidence Viewer &rarr;
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 3. Officer Decision Panel */}
          <section>
            <DecisionPanel
              application={application}
              findings={findings}
              onDecisionSubmitted={async (updatedApp) => {
                setApplication(updatedApp);
                const updatedAudit = await getAudit(appId);
                setAuditEvents(updatedAudit || []);
              }}
            />
          </section>
        </>
      ) : (
        /* Scoped Application Audit Trail Tab */
        <section className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Audit Timeline for {application.id} ({application.institute})
              </h3>
              <p className="text-xs text-slate-500">
                Read-only record of rules applied, records checked, source responses and officer actions.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
              {auditEvents.length} Recorded Events
            </span>
          </div>

          <AuditTimeline events={auditEvents} highlightAppId={appId} />
        </section>
      )}
    </div>
  );
}
