import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getApplication, getFindings, getAudit } from '../api';
import StatusBadge from '../components/StatusBadge';
import SeverityTag from '../components/SeverityTag';
import ErrorState from '../components/ErrorState';
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
      document.title = `${appData.institute} (${appData.id}) · AICTE Officer Portal`;
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
      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading application details">
        <div className="h-36 bg-white rounded-xl border border-slate-200/90 p-6 space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 h-28 bg-white rounded-xl border border-slate-200/90 p-4"></div>
        <div className="h-96 bg-white rounded-xl border border-slate-200/90 p-6"></div>
      </div>
    );
  }

  // Error State for Unknown Application
  if (error || !application) {
    return (
      <ErrorState
        title="Application Record Not Found"
        message={error || `No record matching application ID "${appId}" was located in the scrutiny database.`}
        onRetry={loadData}
      />
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
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/officer/dashboard"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-[#0F2A4A] transition-colors py-1 px-2 -ml-2 rounded hover:bg-slate-200/50"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Applications Worklist</span>
        </Link>

        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
          ID: {application.id}
        </span>
      </div>

      {/* Institutional Application Header Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-[#0F2A4A] font-bold border border-slate-200">
                {application.id}
              </span>
              <span className="text-slate-300">•</span>
              <span>Submitted on <strong className="text-slate-700 font-semibold">{application.submittedOn}</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">Academic Year 2026–27</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2A4A] tracking-tight">
              {application.institute}
            </h1>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="text-xs font-medium text-slate-500">Category:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200/70">
                {application.category}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">Mandatory Statutory Scrutiny</span>
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end space-y-1.5 shrink-0 bg-slate-50/70 lg:bg-transparent p-3 lg:p-0 rounded-lg border lg:border-none border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Application Scrutiny Status
            </span>
            <StatusBadge status={application.status} size="lg" />
          </div>
        </div>

        {/* Dynamic Summary Strip (4 prominent high-contrast metric tiles) */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Verified Metric */}
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-emerald-900 tracking-wider block">
                  Verified
                </span>
                <span className="text-3xl font-extrabold text-emerald-950 tabular-nums">
                  {verifiedCount}
                </span>
                <span className="text-[11px] text-emerald-800 font-medium block mt-0.5">
                  Statutory checks passed
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100/90 flex items-center justify-center text-emerald-700 shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Mismatch Metric */}
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-amber-900 tracking-wider block">
                  Mismatch Detected
                </span>
                <span className="text-3xl font-extrabold text-amber-950 tabular-nums">
                  {mismatchCount}
                </span>
                <span className="text-[11px] text-amber-800 font-medium block mt-0.5">
                  Cross-record variance
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-100/90 flex items-center justify-center text-amber-700 shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Expired Metric */}
            <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-rose-900 tracking-wider block">
                  Expired
                </span>
                <span className="text-3xl font-extrabold text-rose-950 tabular-nums">
                  {expiredCount}
                </span>
                <span className="text-[11px] text-rose-800 font-medium block mt-0.5">
                  Validity lapse detected
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-rose-100/90 flex items-center justify-center text-rose-700 shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Manual Review Metric */}
            <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-indigo-900 tracking-wider block">
                  Manual Review
                </span>
                <span className="text-3xl font-extrabold text-indigo-950 tabular-nums">
                  {manualReviewCount}
                </span>
                <span className="text-[11px] text-indigo-800 font-medium block mt-0.5">
                  Missing or pending checks
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100/90 flex items-center justify-center text-indigo-700 shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Application All-Green Banner (for clean cases like APP-002) */}
        {isClean && (
          <div className="mt-5 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-400 flex items-start space-x-3.5 text-emerald-950">
            <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center shrink-0 text-emerald-800 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-base text-emerald-950">
                All Statutory Checks Verified &middot; No Discrepancies Identified
              </h4>
              <p className="text-sm text-emerald-800 mt-0.5 leading-relaxed">
                All mandatory statutory filings have been uploaded, authenticated against regulatory repositories, and cross-reconciled with zero open findings.
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
          className={`py-3 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2.5 ${
            activeTab === 'review'
              ? 'border-[#0F2A4A] text-[#0F2A4A] bg-white rounded-t-lg border-t border-l border-r border-slate-200 -mb-px'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <span>Scrutiny & Findings</span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
            activeTab === 'review' ? 'bg-[#0F2A4A] text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {documentRows.length + crossDocFindings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`py-3 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2.5 ${
            activeTab === 'audit'
              ? 'border-[#0F2A4A] text-[#0F2A4A] bg-white rounded-t-lg border-t border-l border-r border-slate-200 -mb-px'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <span>Application Audit Trail</span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
            activeTab === 'audit' ? 'bg-[#0F2A4A] text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {auditEvents.length}
          </span>
        </button>
      </div>

      {activeTab === 'review' ? (
        <>
          {/* 1. Required Document Checklist */}
          <section className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#0F2A4A] tracking-tight">
                  Required Documents Checklist
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Mandatory statutory institutional filings (prioritized by scrutiny urgency)
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-white px-3 py-1 rounded border border-slate-200">
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
                        ? 'bg-rose-50/30'
                        : hasFinding && doc.effectiveStatus === FINDING_STATUS.EXPIRED
                        ? 'bg-rose-50/20'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start space-x-3.5">
                        <div className="mt-0.5">
                          {doc.notSubmitted ? (
                            <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center font-bold text-sm">
                              !
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-base font-bold text-slate-900">
                              {doc.type}
                            </h3>
                            {doc.required && (
                              <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                Mandatory
                              </span>
                            )}
                          </div>

                          {doc.notSubmitted ? (
                            <p className="text-xs text-rose-800 font-semibold mt-1">
                              Not submitted &mdash; Mandatory statutory document omitted by applicant
                            </p>
                          ) : (
                            <p className="text-xs text-slate-500 mt-1 font-mono">
                              Document ID: {doc.id}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 self-start sm:self-auto shrink-0">
                        <StatusBadge status={doc.effectiveStatus} size="sm" />

                        {/* Link to Evidence Viewer if document has findings or is missing */}
                        {(primaryFinding || doc.notSubmitted) && (
                          <Link
                            to={`/officer/applications/${appId}/findings/${primaryFinding?.id || 'F-004'}`}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#0F2A4A] text-white hover:bg-[#1F6FEB] transition-colors whitespace-nowrap shadow-xs inline-flex items-center space-x-1"
                          >
                            <span>Inspect Evidence</span>
                            <span aria-hidden="true">&rarr;</span>
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Sub-row for document-specific findings (e.g. Expired Fire NOC) */}
                    {hasFinding && (
                      <div className="mt-3.5 pl-0 sm:pl-11">
                        {doc.docSpecificFindings.map((f) => (
                          <div
                            key={f.id}
                            className="p-3.5 bg-white rounded-lg border border-rose-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-mono font-bold text-slate-800">
                                  {f.rule}
                                </span>
                                <SeverityTag severity={f.severity} size="sm" />
                              </div>
                              <p className="text-xs text-slate-700 font-medium">
                                {f.explanation}
                              </p>
                            </div>
                            <Link
                              to={`/officer/applications/${appId}/findings/${f.id}`}
                              className="text-xs text-[#1F6FEB] hover:text-[#0F2A4A] font-bold shrink-0 inline-flex items-center space-x-1"
                            >
                              <span>View Highlighted Box</span>
                              <span aria-hidden="true">&rarr;</span>
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
          <section className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#0F2A4A] tracking-tight">
                  Cross-Document and Record Checks
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Automated corroboration across multiple filings and central AICTE records
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-white px-3 py-1 rounded border border-slate-200">
                {crossDocFindings.length} Cross Checks
              </span>
            </div>

            <div className="divide-y divide-slate-200">
              {crossDocFindings.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No cross-document discrepancies recorded for this application.
                </div>
              ) : (
                crossDocFindings.map((f) => (
                  <div
                    key={f.id}
                    className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center flex-wrap gap-2.5">
                        <span className="text-xs font-mono font-bold text-[#0F2A4A] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {f.rule}
                        </span>
                        <StatusBadge status={f.status} size="sm" />
                        <SeverityTag severity={f.severity} size="sm" />
                        <span className="text-xs text-slate-500 font-mono font-semibold">
                          Confidence: {Math.round(f.confidence * 100)}%
                        </span>
                      </div>

                      <p className="text-sm font-medium text-slate-800 leading-relaxed">
                        {f.explanation}
                      </p>

                      {/* Summary of compared documents */}
                      {f.evidence && f.evidence.length > 1 && (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 pt-1">
                          <span className="font-bold text-slate-700">Compared:</span>
                          <span className="bg-slate-100 px-2.5 py-1 rounded font-mono text-slate-800 border border-slate-200">
                            {f.evidence[0].docName || 'Doc 1'}: <strong className="text-slate-900">{f.evidence[0].value}</strong>
                          </span>
                          <span className="text-slate-400 font-bold">&ne;</span>
                          <span className="bg-slate-100 px-2.5 py-1 rounded font-mono text-slate-800 border border-slate-200">
                            {f.evidence[1].docName || 'Doc 2'}: <strong className="text-slate-900">{f.evidence[1].value}</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0">
                      <Link
                        to={`/officer/applications/${appId}/findings/${f.id}`}
                        className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-lg bg-[#0F2A4A] text-white text-xs font-bold hover:bg-[#1F6FEB] transition-colors shadow-xs"
                      >
                        <span>Open Evidence Viewer</span>
                        <span aria-hidden="true">&rarr;</span>
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
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#0F2A4A]">
                Audit Timeline for {application.id} ({application.institute})
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Read-only immutable record of rules applied, records checked, source responses, and officer decisions.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
              {auditEvents.length} Recorded Events
            </span>
          </div>

          <AuditTimeline events={auditEvents} highlightAppId={appId} />
        </section>
      )}
    </div>
  );
}

