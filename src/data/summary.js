import { tally } from './checklists.js';
import { getZone } from './zones.js';
import { computeRiskScore } from '../lib/risk.js';

// Card-friendly numbers for a stored inspection.
export function inspectionSummary(inspection, allViolations) {
  const own = allViolations.filter((v) => inspection.violationIds.includes(v.id)).sort((a, b) => a.id.localeCompare(b.id));
  return {
    violationCount: own.length,
    highestRisk: own.length ? Math.max(...own.map((v) => v.riskScore.score)) : null,
    evidenceCount: own.reduce((n, v) => n + v.evidence.length, 0),
    tally: tally(inspection.checklistResults),
    violations: own,
  };
}

// Same numbers for an unfinished draft.
export function draftSummary(draft) {
  const scores = draft.violations
    .map((v) => computeRiskScore({ severity: v.severity, zoneId: draft.zoneId, categoryId: v.categoryId }))
    .filter(Boolean)
    .map((s) => s.score);
  return {
    violationCount: draft.violations.length,
    highestRisk: scores.length ? Math.max(...scores) : null,
    evidenceCount: draft.violations.reduce((n, v) => n + v.evidence.length, 0),
    tally: tally(draft.results),
  };
}

// A draft shaped like an inspection so lists can show both together.
export function draftAsInspection(draft) {
  return {
    id: draft.id,
    mineId: draft.mineId,
    zoneId: draft.zoneId,
    zone: getZone(draft.zoneId)?.name ?? 'Zone not selected',
    type: draft.type,
    startTime: draft.startTime,
    status: 'Draft',
    syncStatus: 'local',
    isDraft: true,
  };
}
