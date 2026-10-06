// Turns a finished draft into stored inspection + violation records (mock only).
import { getCategory } from './checklists.js';
import { createAuditEvent, MINE_MANAGER } from './models.js';
import { getZone } from './zones.js';
import { evidenceId } from '../lib/evidence.js';
import { pad } from '../lib/format.js';
import { computeRiskScore } from '../lib/risk.js';

export const violationDisplayId = (draft, index) => `VIOL-${pad(draft.violationBase + index, 5)}`;

export function buildSubmission(draft, { online }) {
  const end = new Date().toISOString();
  const zone = getZone(draft.zoneId);
  const syncStatus = online ? 'synced' : 'pending';

  const violations = draft.violations.map((dv, index) => {
    const id = violationDisplayId(draft, index);
    const riskScore = computeRiskScore({ severity: dv.severity, zoneId: draft.zoneId, categoryId: dv.categoryId });
    return {
      id,
      inspectionId: draft.id,
      categoryId: dv.categoryId,
      category: getCategory(dv.categoryId).name,
      checklistItemId: dv.checklistItemId,
      finding: dv.finding.trim(),
      severity: dv.severity,
      location: zone.name,
      zoneId: draft.zoneId,
      gps: { ...draft.gps },
      timestamp: dv.createdAt,
      // Evidence ids follow the final violation id
      evidence: dv.evidence.map((e, n) => ({ ...e, id: evidenceId(id, n + 1) })),
      riskScore,
      status: 'Open',
      assignedTo: MINE_MANAGER,
      correctiveAction: null,
      remarks: dv.remarks.trim(),
      suggestedAction: dv.suggestedAction.trim(),
      syncStatus,
      auditEvents: [
        createAuditEvent({ at: dv.createdAt, label: 'Violation detected', actor: draft.inspectorId, note: id }),
        createAuditEvent({ at: end, label: 'AI risk score generated', actor: 'COAL DRISHTI', note: `Risk ${riskScore.score}` }),
        createAuditEvent({ at: end, label: `Routed to ${MINE_MANAGER} for assignment`, actor: 'COAL DRISHTI' }),
      ],
    };
  });

  const inspection = {
    id: draft.id,
    inspectorId: draft.inspectorId,
    mineId: draft.mineId,
    zoneId: draft.zoneId,
    zone: zone.name,
    type: draft.type,
    startTime: draft.startTime,
    endTime: end,
    status: 'Submitted',
    syncStatus,
    checklistResults: { ...draft.results },
    violationIds: violations.map((v) => v.id),
    gps: { ...draft.gps },
    auditEvents: [
      createAuditEvent({ at: draft.startTime, label: 'Inspection started', actor: draft.inspectorId }),
      ...violations.map((v) => createAuditEvent({ at: v.timestamp, label: 'Violation detected', actor: draft.inspectorId, note: v.id })),
      createAuditEvent({
        at: end,
        label: online ? 'Inspection submitted' : 'Inspection saved locally',
        actor: draft.inspectorId,
        note: online ? '' : 'Sync pending',
      }),
    ],
  };

  return { inspection, violations };
}
