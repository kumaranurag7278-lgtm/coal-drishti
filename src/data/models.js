/**
 * Frontend mock data model. Nothing here is sent to a server.
 *
 * Inspector       { id, name, initials, title, area }
 * Inspection      { id, inspectorId, mineId, zoneId, zone, type, startTime, endTime, status,
 *                   syncStatus, checklistResults, violationIds, gps, auditEvents }
 *                 status: 'Submitted' (drafts live separately)    syncStatus: 'synced' | 'pending'
 * ChecklistItem   { id, text, categoryId }   result: 'pass' | 'fail' | 'na'
 * Violation       { id, inspectionId, category, categoryId, checklistItemId, finding, severity,
 *                   location, zoneId, gps, timestamp, evidence, riskScore, status, assignedTo,
 *                   correctiveAction, remarks, suggestedAction, syncStatus, auditEvents }
 *                 severity: LOW | MEDIUM | HIGH | CRITICAL
 *                 status: Open | Assigned | In progress | Awaiting verification | Verified
 * Evidence        { id, fileName, timestamp, latitude, longitude, hash, similarityStatus, preview }
 * CorrectiveAction{ action, assignedTo, deadline }
 * RiskScore       { score, level, label, factors: [{ key, label, points, max }], model }
 * AuditEvent      { id, at, label, actor, note }
 */

import { pseudoHash } from '../lib/evidence.js';

export const VIOLATION_FLOW = ['Open', 'Assigned', 'In progress', 'Awaiting verification', 'Verified'];
export const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const MINE_MANAGER = 'Mine Manager';

let eventSeq = 0;
export function createAuditEvent({ at = new Date().toISOString(), label, actor, note = '', previousHash = null }) {
  eventSeq += 1;
  const id = `ev-${Date.now().toString(36)}-${eventSeq}`;
  const payload = `${id}|${at}|${label}|${actor || ''}|${note || ''}|${previousHash || '0000000000000000'}`;
  const hash = pseudoHash(payload);
  return { id, at, label, actor, note, hash, previousHash };
}

