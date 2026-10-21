import initialApplications from '../mock/applications.json';
import initialFindings from '../mock/findings.json';
import initialAudit from '../mock/audit.json';
import initialAlerts from '../mock/alerts.json';
import {
  AUDIT_ACTION,
  AUDIT_ACTOR,
  DECISION_TO_APPLICATION_STATUS,
  APPLICATION_STATUS,
} from '../constants';

// Deep clone helper
const clone = (data) => JSON.parse(JSON.stringify(data));

// In-memory state
let applications = clone(initialApplications);
let findings = clone(initialFindings);
let auditTrail = clone(initialAudit);
let alerts = clone(initialAlerts);

export const mockDb = {
  getApplications: () => clone(applications),

  getApplicationById: (id) => {
    const app = applications.find((a) => a.id === id);
    return app ? clone(app) : null;
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

  getAlerts: () => clone(alerts),

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
      application: clone(applications[appIndex]),
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
