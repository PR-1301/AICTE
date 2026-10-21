import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AUDIT_ACTION, AUDIT_ACTION_LABELS, AUDIT_ACTOR } from '../../../constants';

// Action icon & visual accent mapping
function getActionConfig(action) {
  switch (action) {
    case AUDIT_ACTION.APPLICATION_RECEIVED:
      return {
        label: AUDIT_ACTION_LABELS[action] || 'Application Received',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
        dotClass: 'bg-blue-500 border-blue-200',
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      };
    case AUDIT_ACTION.DOCUMENTS_CLASSIFIED:
      return {
        label: AUDIT_ACTION_LABELS[action] || 'Documents Classified',
        badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        dotClass: 'bg-indigo-500 border-indigo-200',
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        ),
      };
    case AUDIT_ACTION.FIELDS_EXTRACTED:
      return {
        label: AUDIT_ACTION_LABELS[action] || 'Fields Extracted',
        badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
        dotClass: 'bg-sky-500 border-sky-200',
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      };
    case AUDIT_ACTION.RULE_APPLIED:
      return {
        label: AUDIT_ACTION_LABELS[action] || 'Rule Applied',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
        dotClass: 'bg-slate-600 border-slate-200',
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        ),
      };
    case AUDIT_ACTION.RECORD_CHECKED:
      return {
        label: AUDIT_ACTION_LABELS[action] || 'Record Checked',
        badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
        dotClass: 'bg-teal-600 border-teal-200',
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        ),
      };
    case AUDIT_ACTION.SOURCE_RESPONSE:
      return {
        label: AUDIT_ACTION_LABELS[action] || 'Source Response',
        badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        dotClass: 'bg-cyan-600 border-cyan-200',
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        ),
      };
    case AUDIT_ACTION.ALERT_RAISED:
      return {
        label: AUDIT_ACTION_LABELS[action] || 'Alert Raised',
        badgeClass: 'bg-rose-100 text-rose-900 border-rose-400 font-semibold',
        dotClass: 'bg-rose-600 border-rose-200 ring-2 ring-rose-400/40',
        icon: (
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ),
      };
    case AUDIT_ACTION.VALIDATION_COMPLETE:
      return {
        label: AUDIT_ACTION_LABELS[action] || 'Validation Complete',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-400 font-semibold',
        dotClass: 'bg-emerald-600 border-emerald-200 ring-2 ring-emerald-400/40',
        icon: (
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
      };
    case AUDIT_ACTION.DECISION_SUBMITTED:
      return {
        label: AUDIT_ACTION_LABELS[action] || 'Officer Decision',
        badgeClass: 'bg-[#0F2A4A] text-white border-[#0F2A4A] font-bold shadow-xs',
        dotClass: 'bg-[#0F2A4A] border-amber-400 ring-4 ring-amber-300/50',
        icon: (
          <svg className="w-3.5 h-3.5 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a1 1 0 00-.707.293l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7A1 1 0 0010 2z" />
          </svg>
        ),
      };
    case AUDIT_ACTION.APPLICATION_STATUS_UPDATED:
      return {
        label: AUDIT_ACTION_LABELS[action] || 'Status Transitioned',
        badgeClass: 'bg-purple-100 text-purple-900 border-purple-300 font-semibold',
        dotClass: 'bg-purple-600 border-purple-200',
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        ),
      };
    default:
      return {
        label: action,
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
        dotClass: 'bg-slate-400 border-slate-200',
        icon: (
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        ),
      };
  }
}

function formatDateHeading(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return 'Timeline Log';
  }
}

function formatEventTime(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return ts;
  }
}

/**
 * Shared AuditTimeline component.
 * Vertical timeline with grouped date headings, truncated long details,
 * finding links, and prominent officer decision accents.
 */
export default function AuditTimeline({
  events = [],
  highlightAppId = null,
  className = '',
}) {
  const [expandedDetails, setExpandedDetails] = useState({});

  const toggleDetail = (id) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!events || events.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
        No audit events recorded.
      </div>
    );
  }

  // Group events by formatted date string
  const groups = events.reduce((acc, evt) => {
    const dateKey = formatDateHeading(evt.ts);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(evt);
    return acc;
  }, {});

  return (
    <div className={`space-y-8 ${className}`}>
      {Object.entries(groups).map(([dateLabel, groupEvents]) => (
        <div key={dateLabel} className="space-y-4">
          {/* Date Heading */}
          <div className="sticky top-12 z-10 flex items-center space-x-3 py-1">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-slate-200 text-slate-700 rounded-md border border-slate-300 shadow-2xs">
              {dateLabel}
            </span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          {/* Vertical Timeline Item List */}
          <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 ml-3">
            {groupEvents.map((evt) => {
              const config = getActionConfig(evt.action);
              const isOfficer = evt.actor && evt.actor !== AUDIT_ACTOR.SYSTEM;
              const isDecisionEvent = evt.action === AUDIT_ACTION.DECISION_SUBMITTED;
              const isExpanded = !!expandedDetails[evt.id];
              const isFindingRef = evt.ref && evt.ref.startsWith('F-');

              return (
                <div key={evt.id} className="relative group">
                  {/* Timeline Dot Indicator */}
                  <span
                    className={`absolute -left-[31px] top-3.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-all ${config.dotClass}`}
                  />

                  {/* Event Card (Visually distinct for officer decisions) */}
                  <div
                    className={`rounded-lg p-4 border transition-all ${
                      isDecisionEvent
                        ? 'bg-amber-50/70 border-amber-300 shadow-sm ring-1 ring-amber-300/40'
                        : isOfficer
                        ? 'bg-blue-50/40 border-blue-200 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Event Header: Action badge, Actor chip, Timestamp, Application tag */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center flex-wrap gap-2">
                        {/* Action Label with Icon */}
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded border text-xs font-medium ${config.badgeClass}`}
                        >
                          {config.icon}
                          <span>{config.label}</span>
                        </span>

                        {/* Actor Chip */}
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                            isOfficer
                              ? 'bg-[#0F2A4A] text-white border border-[#0F2A4A]'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isOfficer ? 'bg-amber-300' : 'bg-slate-400'
                            }`}
                          />
                          <span>{isOfficer ? `Officer: ${evt.actor}` : 'System Pipeline'}</span>
                        </span>

                        {/* Application Tag (when viewing global audit) */}
                        {evt.applicationId && (!highlightAppId || highlightAppId !== evt.applicationId) && (
                          <Link
                            to={`/officer/applications/${evt.applicationId}`}
                            className="text-[11px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                            title="Go to Application"
                          >
                            {evt.applicationId}
                          </Link>
                        )}
                      </div>

                      {/* Precise Timestamp */}
                      <span className="text-xs font-mono text-slate-500 tabular-nums">
                        {formatEventTime(evt.ts)}
                      </span>
                    </div>

                    {/* Event Detail Text with Truncation */}
                    <div className="text-sm text-slate-700 leading-relaxed font-sans">
                      <p className={!isExpanded ? 'line-clamp-2' : ''}>
                        {evt.detail}
                      </p>

                      {evt.detail && evt.detail.length > 120 && (
                        <button
                          type="button"
                          onClick={() => toggleDetail(evt.id)}
                          className="mt-1 text-xs text-[#1F6FEB] font-semibold hover:underline cursor-pointer focus:outline-none"
                        >
                          {isExpanded ? 'Show less' : 'Show more...'}
                        </button>
                      )}
                    </div>

                    {/* Evidence Viewer Link if ref points to a finding */}
                    {isFindingRef && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-xs">
                        <Link
                          to={`/officer/applications/${evt.applicationId || 'APP-001'}/findings/${evt.ref}`}
                          className="inline-flex items-center space-x-1 text-[#1F6FEB] font-semibold hover:text-[#0F2A4A] hover:underline"
                        >
                          <span>Inspect Evidence Viewer for rule finding</span>
                          <span className="font-mono bg-blue-50 text-blue-900 border border-blue-200 px-1.5 py-0.2 rounded font-bold">
                            {evt.ref}
                          </span>
                          <span>&rarr;</span>
                        </Link>
                        <span className="text-[11px] font-mono text-slate-400">
                          Ref: {evt.ref}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
