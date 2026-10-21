import React, { useState } from 'react';
import {
  DECISION_TYPE,
  DECISION_LABELS,
  DISCLAIMER_ADVISORY,
  SEVERITY,
  FINDING_STATUS,
  AUDIT_ACTOR,
} from '../../../constants';
import { submitDecision } from '../../../api';
import { useAppStore } from '../../../store/useAppStore';
import StatusBadge from '../../../components/StatusBadge';
import ConfirmDialog from '../../../components/ConfirmDialog';

/**
 * Officer Decision Panel (AGENTS.md sections 3 & 5.3).
 * Human-in-the-loop decision interface.
 * Non-negotiable domain rules:
 * - Human officer makes the decision. AI never approves or rejects.
 * - Minimum 10 characters required in remarks before submission.
 * - Open high-severity findings trigger confirmation dialog listing them.
 * - Displays locked outcome banner once decision is submitted.
 */
export default function DecisionPanel({
  application,
  findings = [],
  onDecisionSubmitted,
  className = '',
}) {
  const currentRole = useAppStore((state) => state.currentRole) || AUDIT_ACTOR.OFFICER;

  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [touched, setTouched] = useState(false);

  // Existing decision check (Locked state)
  const existingDecision = application?.decision || application?.lastDecision;
  const isTerminalStatus = [
    'APPROVED',
    'INFO_REQUESTED',
    'SENT_FOR_INSPECTION',
  ].includes(application?.status);

  // Identify open high-severity findings (severity high & status not verified)
  const openHighSeverityFindings = findings.filter(
    (f) =>
      (f.severity || '').toLowerCase() === SEVERITY.HIGH &&
      f.status !== FINDING_STATUS.VERIFIED
  );

  const trimmedRemarks = remarks.trim();
  const isRemarksValid = trimmedRemarks.length >= 10;

  // Handle action click
  const handleActionClick = (decision) => {
    setTouched(true);

    if (!isRemarksValid) {
      return;
    }

    if (decision === DECISION_TYPE.APPROVE && openHighSeverityFindings.length > 0) {
      // Trigger confirmation dialog listing open high-severity findings
      setShowConfirmModal(true);
      return;
    }

    executeSubmission(decision);
  };

  const executeSubmission = async (decision) => {
    try {
      setSubmitting(true);
      setErrorMessage(null);

      const result = await submitDecision(
        application.id,
        decision,
        trimmedRemarks,
        currentRole
      );

      setShowConfirmModal(false);

      if (onDecisionSubmitted && result?.application) {
        onDecisionSubmitted(result.application);
      }
    } catch (err) {
      console.error('Decision submission failed:', err);
      setErrorMessage(err.message || 'Failed to submit decision. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  // 1. LOCKED STATE BANNER: Renders after decision is submitted
  if (existingDecision || isTerminalStatus) {
    const decisionCode = existingDecision?.decision || application?.status;
    const decisionLabel = DECISION_LABELS[decisionCode] || decisionCode;
    const decisionRemarks = existingDecision?.remarks || 'Application processed by scrutiny officer.';
    const officerId = existingDecision?.officer || AUDIT_ACTOR.OFFICER;
    const timestamp = existingDecision?.ts
      ? new Date(existingDecision.ts).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : 'Recorded';

    return (
      <div className={`bg-white rounded-xl border-2 border-slate-300 shadow-xs overflow-hidden ${className}`}>
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#0F2A4A] text-white flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-slate-500 tracking-wider block">
                Official Determination Sealed
              </span>
              <h3 className="text-lg font-bold text-[#0F2A4A] tracking-tight">
                Scrutiny Decision Outcome
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Audit Logged</span>
            </span>
            <StatusBadge status={application.status} size="md" />
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-3 border-b border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Formal Determination</span>
                <span className="text-[#0F2A4A] text-base font-extrabold">{decisionLabel}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Sign-off Officer</span>
                <span className="text-slate-900 font-mono font-bold text-sm">{officerId}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Timestamp Recorded</span>
                <span className="text-slate-900 font-semibold text-sm">{timestamp}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Official Scrutiny Remarks & Regulatory Justification
              </span>
              <p className="text-sm text-slate-900 leading-relaxed bg-white p-4 rounded-lg border border-slate-200 font-mono">
                {decisionRemarks}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-600 italic flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <svg className="w-4 h-4 text-slate-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{DISCLAIMER_ADVISORY}</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. ACTIVE DECISION PANEL: Actions + Mandatory Remarks
  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 space-y-5 ${className}`}>
      {/* Header */}
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase text-slate-500 tracking-wider block">
            Statutory Action
          </span>
          <h3 className="text-lg font-bold text-[#0F2A4A] tracking-tight">
            Officer Scrutiny Determination
          </h3>
        </div>
        <div className="text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
          Acting Officer: <span className="font-mono font-bold text-[#0F2A4A]">{currentRole}</span>
        </div>
      </div>

      {/* Mandatory Remarks Field with Inline Validation */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="officer-remarks"
            className="text-sm font-bold text-slate-900"
          >
            Scrutiny Remarks & Regulatory Justification{' '}
            <span className="text-rose-600">*</span>
          </label>
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
              trimmedRemarks.length >= 10
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {trimmedRemarks.length} / 10 chars minimum
          </span>
        </div>
        <p className="text-xs text-slate-600 mb-2 leading-relaxed">
          Statutory record requires minimum 10 characters detailing regulatory justification before formal determination can be executed.
        </p>

        <textarea
          id="officer-remarks"
          rows={3}
          value={remarks}
          onChange={(e) => {
            setRemarks(e.target.value);
            if (!touched) setTouched(true);
          }}
          disabled={submitting}
          placeholder="Enter detailed scrutiny remarks regarding document validation findings, compliance discrepancies, or necessary institutional clarifications..."
          className={`w-full text-sm p-3.5 rounded-xl border font-mono transition-all focus:outline-none focus:ring-2 ${
            touched && !isRemarksValid
              ? 'border-rose-400 focus:ring-rose-100 bg-rose-50/20'
              : 'border-slate-300 focus:ring-blue-100 focus:border-[#1F6FEB] bg-white'
          }`}
        />

        {/* Inline validation message */}
        <div className="mt-1.5 text-xs">
          {touched && !isRemarksValid ? (
            <span className="text-rose-700 font-semibold flex items-center space-x-1.5">
              <svg className="w-4 h-4 text-rose-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>
                Remarks required: Please enter at least 10 characters before submitting ({trimmedRemarks.length}/10 entered).
              </span>
            </span>
          ) : (
            <span className="text-slate-500 font-normal">
              Officer remarks are committed immutably to the AICTE audit trail upon submission.
            </span>
          )}
        </div>
      </div>

      {/* Submission Error Banner if any */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl text-xs flex items-center space-x-2">
          <svg className="w-5 h-5 text-rose-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Action Buttons Row with Persistent Advisory Disclaimer */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
        <div className="text-xs text-amber-900 bg-amber-50/90 px-3.5 py-2 rounded-lg border border-amber-200 font-medium flex items-center space-x-1.5">
          <svg className="w-4 h-4 text-amber-700 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>{DISCLAIMER_ADVISORY}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Action 1: Request more info */}
          <button
            type="button"
            onClick={() => handleActionClick(DECISION_TYPE.REQUEST_MORE_INFO)}
            disabled={submitting}
            className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all disabled:opacity-50 cursor-pointer shadow-xs inline-flex items-center space-x-1.5"
            title="Request institutional clarifications or updated documents"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{DECISION_LABELS[DECISION_TYPE.REQUEST_MORE_INFO]}</span>
          </button>

          {/* Action 2: Send for inspection */}
          <button
            type="button"
            onClick={() => handleActionClick(DECISION_TYPE.SEND_FOR_INSPECTION)}
            disabled={submitting}
            className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-[#0F2A4A] hover:bg-[#1F6FEB] text-white transition-all disabled:opacity-50 cursor-pointer shadow-xs inline-flex items-center space-x-1.5"
            title="Refer application for expert committee on-site inspection"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>{DECISION_LABELS[DECISION_TYPE.SEND_FOR_INSPECTION]}</span>
          </button>

          {/* Action 3: Approve */}
          <button
            type="button"
            onClick={() => handleActionClick(DECISION_TYPE.APPROVE)}
            disabled={submitting}
            className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-all disabled:opacity-50 cursor-pointer shadow-xs inline-flex items-center space-x-1.5"
            title="Approve technical education extension of approval"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>{DECISION_LABELS[DECISION_TYPE.APPROVE]}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Approving with Open High-Severity Findings */}
      <ConfirmDialog
        isOpen={showConfirmModal}
        title="Confirm Approval with Open High-Severity Findings"
        confirmLabel="Confirm Officer Override & Approve"
        cancelLabel="Cancel & Review Findings"
        variant="danger"
        confirmDisabled={submitting}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={() => executeSubmission(DECISION_TYPE.APPROVE)}
      >
        <div className="space-y-3.5">
          <p className="text-slate-800 text-sm leading-relaxed">
            This application currently has{' '}
            <strong className="text-rose-700 font-extrabold">
              {openHighSeverityFindings.length} unresolved high-severity finding
              {openHighSeverityFindings.length > 1 ? 's' : ''}
            </strong>
            . Approving without resolving these regulatory defects requires explicit officer override:
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 max-h-48 overflow-y-auto">
            {openHighSeverityFindings.map((finding) => (
              <div
                key={finding.id}
                className="flex items-center justify-between text-xs p-2.5 bg-white rounded-lg border border-slate-200"
              >
                <div className="font-mono font-bold text-[#0F2A4A]">
                  {finding.rule}
                </div>
                <StatusBadge status={finding.status} size="sm" />
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 leading-relaxed font-medium">
            Your decision and justification remarks will be permanently recorded in the immutable audit trail under officer ID <strong>{currentRole}</strong>.
          </div>
        </div>
      </ConfirmDialog>
    </div>
  );
}

