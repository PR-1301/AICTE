import initialApplications from '../mock/applications.json';
import initialFindings from '../mock/findings.json';
import initialAudit from '../mock/audit.json';
import initialAlerts from '../mock/alerts.json';
import {
  AUDIT_ACTION,
  AUDIT_ACTOR,
  DECISION_TO_APPLICATION_STATUS,
  APPLICATION_STATUS,
  FINDING_STATUS,
  SEVERITY,
  DEMO_TODAY,
} from '../constants.js';

// Deep clone helper
const clone = (data) => JSON.parse(JSON.stringify(data));

// In-memory state
let applications = clone(initialApplications);
let findings = clone(initialFindings);
let auditTrail = clone(initialAudit);
let alerts = clone(initialAlerts);

function get90DaysLimit(anchorStr) {
  const d = new Date(anchorStr + 'T00:00:00Z');
  d.setDate(d.getDate() + 90);
  return d.toISOString().slice(0, 10);
}

/**
 * Enriches an application with derived computed fields:
 * - openFindings (count of findings whose status is not VERIFIED)
 * - highSeverityOpen (count of findings with status not VERIFIED and severity HIGH)
 * - hasExpired (boolean indicating if any document or finding has lapsed validity against DEMO_TODAY)
 * - lastUpdated (timestamp of latest audit event for this application)
 */
function enrichApplication(app) {
  const appFindings = findings.filter((f) => f.applicationId === app.id);

  // Open findings: status not VERIFIED
  const openFindings = appFindings.filter((f) => f.status !== FINDING_STATUS.VERIFIED).length;

  // High-severity open: status not VERIFIED and severity high
  const highSeverityOpen = appFindings.filter(
    (f) =>
      f.status !== FINDING_STATUS.VERIFIED &&
      (f.severity || '').toLowerCase() === SEVERITY.HIGH
  ).length;

  // Expired check: document status EXPIRED, doc.validUpto < DEMO_TODAY, or finding status EXPIRED
  const hasExpired = Boolean(
    app.documents?.some(
      (d) =>
        d.status === FINDING_STATUS.EXPIRED ||
        (d.validUpto && d.validUpto < DEMO_TODAY)
    ) ||
    appFindings.some((f) => f.status === FINDING_STATUS.EXPIRED)
  );

  // Latest audit event timestamp for application
  const appAudit = auditTrail.filter((e) => e.applicationId === app.id);
  let lastUpdated = app.submittedOn ? `${app.submittedOn}T10:00:00Z` : new Date().toISOString();
  if (appAudit.length > 0) {
    const sorted = [...appAudit].sort(
      (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
    );
    lastUpdated = sorted[0].ts;
  }

  return {
    ...clone(app),
    openFindings,
    highSeverityOpen,
    hasExpired,
    lastUpdated,
  };
}

/**
 * Dynamically derives alerts from current data (AGENTS.md Section 5.4 & Step 8 instructions):
 * - Documents expiring within 90 days of DEMO_TODAY
 * - Documents with VERIFICATION_PENDING or SOURCE_UNAVAILABLE
 * - Unresolved high-severity discrepancies on applications with no decision yet
 * Applications with an officer decision no longer raise unresolved alerts.
 */
function deriveAlerts() {
  const limitDateStr = get90DaysLimit(DEMO_TODAY);
  const derivedList = [];

  for (const app of applications) {
    // Check if an officer decision has already been recorded
    const hasDecision = Boolean(
      app.decision ||
      app.lastDecision ||
      [
        APPLICATION_STATUS.APPROVED,
        APPLICATION_STATUS.INFO_REQUESTED,
        APPLICATION_STATUS.SENT_FOR_INSPECTION,
      ].includes(app.status)
    );

    // If decided, application no longer raises unresolved alerts
    if (hasDecision) {
      continue;
    }

    const appFindings = findings.filter((f) => f.applicationId === app.id);
    const handledDocIds = new Set();

    // 1. Documents expiring soon, expired, pending, or source unavailable
    if (Array.isArray(app.documents)) {
      for (const doc of app.documents) {
        // Expired check
        const isDocExpired =
          doc.status === FINDING_STATUS.EXPIRED ||
          (doc.validUpto && doc.validUpto < DEMO_TODAY);

        if (isDocExpired) {
          handledDocIds.add(doc.id);
          const finding = appFindings.find(
            (f) => f.docId === doc.id && f.status === FINDING_STATUS.EXPIRED
          );
          derivedList.push({
            id: `ALT-${app.id}-${doc.id}-expired`,
            type: 'DOCUMENT_EXPIRED',
            title: `${doc.type || 'Document'} Expired`,
            message: `${doc.type || 'Document'} expired${doc.validUpto ? ` on ${doc.validUpto}` : ''}. Extension of Approval requires valid statutory coverage.`,
            applicationId: app.id,
            institute: app.institute,
            severity: SEVERITY.HIGH,
            link: finding
              ? `/officer/applications/${app.id}/findings/${finding.id}`
              : `/officer/applications/${app.id}`,
            ts: app.submittedOn ? `${app.submittedOn}T10:15:00Z` : new Date().toISOString(),
          });
          continue;
        }

        // Expiring within 90 days of DEMO_TODAY
        if (doc.validUpto && doc.validUpto >= DEMO_TODAY && doc.validUpto <= limitDateStr) {
          handledDocIds.add(doc.id);
          derivedList.push({
            id: `ALT-${app.id}-${doc.id}-expiring-soon`,
            type: 'EXPIRING_SOON',
            title: `${doc.type || 'Document'} Expiring Soon`,
            message: `${doc.type || 'Document'} validity ends on ${doc.validUpto} (within 90 days of review). Verification needed.`,
            applicationId: app.id,
            institute: app.institute,
            severity: SEVERITY.MEDIUM,
            link: `/officer/applications/${app.id}`,
            ts: app.submittedOn ? `${app.submittedOn}T10:20:00Z` : new Date().toISOString(),
          });
          continue;
        }

        // Verification pending
        if (doc.status === FINDING_STATUS.VERIFICATION_PENDING) {
          handledDocIds.add(doc.id);
          derivedList.push({
            id: `ALT-${app.id}-${doc.id}-pending`,
            type: 'VERIFICATION_PENDING',
            title: `${doc.type || 'Document'} Verification Pending`,
            message: `Automated verification query queued with issuing authority for ${doc.type || 'document'}.`,
            applicationId: app.id,
            institute: app.institute,
            severity: SEVERITY.LOW,
            link: `/officer/applications/${app.id}`,
            ts: app.submittedOn ? `${app.submittedOn}T10:25:00Z` : new Date().toISOString(),
          });
          continue;
        }

        // Source unavailable
        if (doc.status === FINDING_STATUS.SOURCE_UNAVAILABLE) {
          handledDocIds.add(doc.id);
          derivedList.push({
            id: `ALT-${app.id}-${doc.id}-source-unavail`,
            type: 'SOURCE_UNAVAILABLE',
            title: `${doc.type || 'Document'} Issuing Source Unavailable`,
            message: `Issuing source repository unavailable for ${doc.type || 'document'}. Requires manual officer verification.`,
            applicationId: app.id,
            institute: app.institute,
            severity: SEVERITY.MEDIUM,
            link: `/officer/applications/${app.id}`,
            ts: app.submittedOn ? `${app.submittedOn}T10:30:00Z` : new Date().toISOString(),
          });
          continue;
        }
      }
    }

    // 2. Unresolved high-severity discrepancies on applications with no decision yet
    for (const f of appFindings) {
      if ((f.severity || '').toLowerCase() === SEVERITY.HIGH && f.status !== FINDING_STATUS.VERIFIED) {
        // If already added through doc expired check, avoid duplicate alert
        if (f.status === FINDING_STATUS.EXPIRED && f.docId && handledDocIds.has(f.docId)) {
          continue;
        }

        let alertType = 'UNRESOLVED_DISCREPANCY';
        if (f.status === FINDING_STATUS.EXPIRED) alertType = 'DOCUMENT_EXPIRED';
        else if (f.status === FINDING_STATUS.MANUAL_REVIEW_REQUIRED) alertType = 'MANUAL_REVIEW_REQUIRED';

        derivedList.push({
          id: `ALT-${app.id}-${f.id}`,
          type: alertType,
          title: `${f.rule.replace(/_/g, ' ')} Discrepancy`,
          message: f.explanation || 'Discrepancy detected during statutory rule validation.',
          applicationId: app.id,
          institute: app.institute,
          severity: SEVERITY.HIGH,
          link: `/officer/applications/${app.id}/findings/${f.id}`,
          ts: app.submittedOn ? `${app.submittedOn}T10:14:00Z` : new Date().toISOString(),
        });
      }
    }
  }

  // Sort by severity: HIGH first, then MEDIUM, then LOW
  const severityRank = {
    [SEVERITY.HIGH]: 0,
    [SEVERITY.MEDIUM]: 1,
    [SEVERITY.LOW]: 2,
  };

  derivedList.sort((a, b) => {
    const rankDiff = (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9);
    if (rankDiff !== 0) return rankDiff;
    return new Date(b.ts).getTime() - new Date(a.ts).getTime();
  });

  return clone(derivedList);
}

export const mockDb = {
  getApplications: () => {
    return applications.map((app) => enrichApplication(app));
  },

  getApplicationById: (id) => {
    const app = applications.find((a) => a.id === id);
    return app ? enrichApplication(app) : null;
  },

  getFindingsByAppId: (appId) => {
    return clone(findings.filter((f) => f.applicationId === appId));
  },

  getFindingById: (fid) => {
    const finding = findings.find((f) => f.id === fid);
    return finding ? clone(finding) : null;
  },

  getAuditEvents: (appId) => {
    const list = appId
      ? auditTrail.filter((e) => e.applicationId === appId)
      : auditTrail;
    return clone(
      [...list].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    );
  },

  getAlerts: () => {
    return deriveAlerts();
  },

  /**
   * Submit officer decision. Supports both:
   * submitDecision(appId, decision, remarks, officerId)
   * and submitDecision(appId, { decision, remarks, officer })
   */
  submitDecision: (appId, decisionArg, remarksArg, officerIdArg) => {
    const appIndex = applications.findIndex((a) => a.id === appId);
    if (appIndex === -1) {
      throw new Error(`Application with id ${appId} not found`);
    }

    let decision, remarks, officerId;
    if (typeof decisionArg === 'object' && decisionArg !== null) {
      decision = decisionArg.decision;
      remarks = decisionArg.remarks;
      officerId = decisionArg.officer || decisionArg.officerId || AUDIT_ACTOR.OFFICER;
    } else {
      decision = decisionArg;
      remarks = remarksArg;
      officerId = officerIdArg || AUDIT_ACTOR.OFFICER;
    }

    // Determine target terminal status based on mapping in constants.js
    const newStatus =
      DECISION_TO_APPLICATION_STATUS[decision] || APPLICATION_STATUS.UNDER_OFFICER_REVIEW;

    const timestamp = new Date().toISOString();

    const decisionRecord = {
      decision,
      remarks,
      officer: officerId,
      ts: timestamp,
    };

    // Mutate application in memory
    applications[appIndex] = {
      ...applications[appIndex],
      status: newStatus,
      decision: decisionRecord,
      lastDecision: decisionRecord,
    };

    // 1. Append DECISION_SUBMITTED audit event
    const decisionEvent = {
      id: `AUD-${Date.now()}-1`,
      applicationId: appId,
      ts: timestamp,
      actor: officerId,
      action: AUDIT_ACTION.DECISION_SUBMITTED,
      detail: `Officer decision submitted: ${decision}. Remarks: ${remarks}`,
      ref: appId,
    };

    // 2. Append status-change audit event
    const statusEvent = {
      id: `AUD-${Date.now()}-2`,
      applicationId: appId,
      ts: new Date(Date.now() + 50).toISOString(),
      actor: officerId,
      action: 'APPLICATION_STATUS_UPDATED',
      detail: `Application status transitioned to ${newStatus}`,
      ref: appId,
    };

    auditTrail.unshift(statusEvent);
    auditTrail.unshift(decisionEvent);

    return {
      application: enrichApplication(applications[appIndex]),
      auditEvents: [decisionEvent, statusEvent],
    };
  },

  resetDemo: () => {
    applications = clone(initialApplications);
    findings = clone(initialFindings);
    auditTrail = clone(initialAudit);
    alerts = clone(initialAlerts);
    return true;
  },
};
