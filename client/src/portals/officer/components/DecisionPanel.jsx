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
      <div className={`bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden ${className}`}>
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-[11px] font-mono font-semibold uppercase text-slate-500 tracking-wider block">
              Officer Determination
            </span>
            <h3 className="text-lg font-bold text-[#0F2A4A] tracking-tight">
              Scrutiny Decision Outcome
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-xs text-blue-900 font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Audit event recorded</span>
            </span>
            <StatusBadge status={application.status} size="sm" />
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-1 border-b border-slate-200 pb-2.5">
              <div>
                <span className="text-slate-400">Formal Decision: </span>
                <strong className="text-slate-900 text-sm font-bold">{decisionLabel}</strong>
              </div>
              <div className="flex items-center space-x-3 text-slate-500">
                <span>Officer: <strong className="text-slate-700">{officerId}</strong></span>
                <span>&bull;</span>
                <span>Timestamp: <strong className="text-slate-700">{timestamp}</strong></span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Official Remarks & Findings Justification
              </span>
              <p className="text-sm text-slate-800 leading-relaxed bg-white p-3 rounded border border-slate-200/60 font-mono">
                {decisionRemarks}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 italic flex items-center space-x-1.5">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>{DISCLAIMER_ADVISORY}</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. ACTIVE DECISION PANEL: Actions + Mandatory Remarks
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5 ${className}`}>
      {/* Header */}
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase text-slate-500 tracking-wider block">
            Official Action
          </span>
          <h3 className="text-lg font-bold text-[#0F2A4A] tracking-tight">
            Officer Scrutiny Determination
          </h3>
        </div>
        <div className="text-xs text-slate-500">
          Acting Officer: <span className="font-mono font-semibold text-slate-800">{currentRole}</span>
        </div>
      </div>

      {/* Mandatory Remarks Field with Inline Validation */}
      <div>
        <label
          htmlFor="officer-remarks"
          className="block text-sm font-semibold text-slate-800 mb-1"
        >
          Scrutiny Remarks & Findings Justification{' '}
          <span className="text-rose-600">*</span>
        </label>
        <p className="text-xs text-slate-500 mb-2">
          Required before submitting decision. Minimum 10 characters detailing regulatory justification.
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
          placeholder="Enter detailed scrutiny remarks regarding verification findings, regulatory compliance, or additional requirements..."
          className={`w-full text-sm p-3 rounded-lg border font-mono transition-colors focus:outline-none focus:ring-2 ${
            touched && !isRemarksValid
              ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
              : 'border-slate-300 focus:ring-blue-100 focus:border-[#1F6FEB] bg-white'
          }`}
        />

        {/* Inline validation message */}
        <div className="flex items-center justify-between mt-1 text-xs">
          <div>
            {touched && !isRemarksValid ? (
              <span className="text-rose-600 font-medium flex items-center space-x-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>
                  Remarks are required (minimum 10 characters; {trimmedRemarks.length}/10 entered)
                </span>
              </span>
            ) : (
              <span className="text-slate-400">
                Minimum 10 characters required for statutory audit compliance.
              </span>
            )}
          </div>
          <span
            className={`font-mono text-[11px] ${
              trimmedRemarks.length >= 10 ? 'text-emerald-700 font-semibold' : 'text-slate-400'
            }`}
          >
            {trimmedRemarks.length} chars
          </span>
        </div>
      </div>

      {/* Submission Error Banner if any */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center space-x-2">
          <svg className="w-4 h-4 text-rose-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="text-xs text-amber-900 bg-amber-50 px-3 py-1.5 rounded border border-amber-200/60 font-medium">
          {DISCLAIMER_ADVISORY}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Action 1: Request more info */}
          <button
            type="button"
            onClick={() => handleActionClick(DECISION_TYPE.REQUEST_MORE_INFO)}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            title="Request institutional clarifications or updated documents"
          >
            {DECISION_LABELS[DECISION_TYPE.REQUEST_MORE_INFO]}
          </button>

          {/* Action 2: Send for inspection */}
          <button
            type="button"
            onClick={() => handleActionClick(DECISION_TYPE.SEND_FOR_INSPECTION)}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-purple-700 hover:bg-purple-800 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            title="Refer application for expert committee on-site inspection"
          >
            {DECISION_LABELS[DECISION_TYPE.SEND_FOR_INSPECTION]}
          </button>

          {/* Action 3: Approve */}
          <button
            type="button"
            onClick={() => handleActionClick(DECISION_TYPE.APPROVE)}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            title="Approve technical education extension of approval"
          >
            {DECISION_LABELS[DECISION_TYPE.APPROVE]}
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Approving with Open High-Severity Findings */}
      <ConfirmDialog
        isOpen={showConfirmModal}
        title="Confirm Approval with Open High-Severity Findings"
        confirmLabel="Approve anyway"
        cancelLabel="Cancel"
        variant="danger"
        confirmDisabled={submitting}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={() => executeSubmission(DECISION_TYPE.APPROVE)}
      >
        <div className="space-y-3">
          <p className="text-slate-700 text-sm">
            This application still has{' '}
            <strong className="text-rose-700 font-bold">
              {openHighSeverityFindings.length} unresolved high-severity finding
              {openHighSeverityFindings.length > 1 ? 's' : ''}
            </strong>
            . Approving without rectifying these deficiencies requires conscious officer override:
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
            {openHighSeverityFindings.map((finding) => (
              <div
                key={finding.id}
                className="flex items-center justify-between text-xs p-2 bg-white rounded border border-slate-200"
              >
                <div className="font-mono font-bold text-slate-800">
                  {finding.rule}
                </div>
                <StatusBadge status={finding.status} size="sm" />
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 leading-relaxed">
            Your decision and justification remarks will be permanently recorded in the immutable audit trail under officer ID <strong>{currentRole}</strong>.
          </div>
        </div>
      </ConfirmDialog>
    </div>
  );
}
