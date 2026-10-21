import initialApplications from '../mock/applications.json';
import initialFindings from '../mock/findings.json';
import initialAudit from '../mock/audit.json';
import initialAlerts from '../mock/alerts.json';
import { APPLICATION_STATUS, AUDIT_ACTION, AUDIT_ACTOR, DECISION_TYPE } from '../constants';

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
    if (appId) {
      return clone(auditTrail.filter((e) => e.applicationId === appId));
    }
    return clone(auditTrail);
  },

  getAlerts: () => clone(alerts),

  submitDecision: (appId, { decision, remarks, officer = AUDIT_ACTOR.OFFICER }) => {
    const appIndex = applications.findIndex((a) => a.id === appId);
    if (appIndex === -1) {
      throw new Error(`Application with id ${appId} not found`);
    }

    // Determine target terminal status based on officer decision
    let newStatus = APPLICATION_STATUS.UNDER_OFFICER_REVIEW;
    if (decision === DECISION_TYPE.APPROVE) {
      newStatus = APPLICATION_STATUS.APPROVED;
    } else if (decision === DECISION_TYPE.REQUEST_MORE_INFO) {
      newStatus = APPLICATION_STATUS.INFO_REQUESTED;
    } else if (decision === DECISION_TYPE.SEND_FOR_INSPECTION) {
      newStatus = APPLICATION_STATUS.SENT_FOR_INSPECTION;
    }

    // Mutate application in memory
    applications[appIndex] = {
      ...applications[appIndex],
      status: newStatus,
      lastDecision: {
        decision,
        remarks,
        officer,
        ts: new Date().toISOString(),
      },
    };

    // Append to audit trail
    const auditRecord = {
      id: `AUD-${Date.now()}`,
      applicationId: appId,
      ts: new Date().toISOString(),
      actor: officer,
      action: AUDIT_ACTION.DECISION_SUBMITTED,
      detail: `Officer submitted decision: ${decision}. Remarks: ${remarks}`,
      ref: appId,
    };
    auditTrail.unshift(auditRecord);

    return {
      application: clone(applications[appIndex]),
      auditEvent: clone(auditRecord),
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
