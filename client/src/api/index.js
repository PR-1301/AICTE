import { mockDb } from './mockDb.js';

const ARTIFICIAL_DELAY_MS = 300;

const delay = (ms = ARTIFICIAL_DELAY_MS) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch all technical institution applications.
 * @returns {Promise<Array>}
 */
export async function getApplications() {
  await delay();
  return mockDb.getApplications();
}

/**
 * Fetch single application by its ID (e.g. 'APP-001').
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getApplication(id) {
  await delay();
  return mockDb.getApplicationById(id);
}

/**
 * Fetch findings for an application.
 * @param {string} appId
 * @returns {Promise<Array>}
 */
export async function getFindings(appId) {
  await delay();
  return mockDb.getFindingsByAppId(appId);
}

/**
 * Fetch a single finding by ID (e.g. 'F-003').
 * @param {string} fid
 * @returns {Promise<Object|null>}
 */
export async function getFinding(fid) {
  await delay();
  return mockDb.getFindingById(fid);
}

/**
 * Fetch audit events, optionally filtered by application ID.
 * @param {string} [appId]
 * @returns {Promise<Array>}
 */
export async function getAudit(appId) {
  await delay();
  return mockDb.getAuditEvents(appId);
}

/**
 * Submit officer scrutiny decision for an application.
 * @param {string} appId
 * @param {string|Object} decision
 * @param {string} [remarks]
 * @param {string} [officerId]
 * @returns {Promise<{ application: Object, auditEvents: Array }>}
 */
export async function submitDecision(appId, decision, remarks, officerId) {
  await delay();
  return mockDb.submitDecision(appId, decision, remarks, officerId);
}

/**
 * Fetch active alerts for the officer dashboard.
 * @returns {Promise<Array>}
 */
export async function getAlerts() {
  await delay();
  return mockDb.getAlerts();
}

/**
 * Reset demo state back to seed data.
 * @returns {Promise<boolean>}
 */
export async function resetDemo() {
  await delay(100);
  return mockDb.resetDemo();
}
