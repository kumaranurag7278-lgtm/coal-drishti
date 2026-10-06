// Seeded demo history for Mine A. Dates are rebuilt relative to "now" each load,
// so "today" always has a few inspections on the dashboard.
import { getCategory } from './checklists.js';
import { INSPECTOR } from './inspectorMock.js';
import { createAuditEvent, MINE_MANAGER } from './models.js';
import { getZone, zoneGps } from './zones.js';
import { pad, startOfDay } from '../lib/format.js';
import { pseudoHash, sampleImage } from '../lib/evidence.js';
import { syntheticScore } from '../lib/risk.js';

const MINE = 'Mine A';
const min = 60000;

const HISTORY = [
  // Older violations, one inspection each
  { insp: 31, days: 9, at: '11:00', zone: 'workshop', type: 'Routine Inspection', cat: 'hemm', fail: 'hemm.1', v: { n: 473, finding: 'Machine guard missing on ventilation fan', sev: 'MEDIUM', risk: 44, status: 'Verified' } },
  { insp: 33, days: 6, at: '13:45', zone: 'crusher', type: 'Safety Inspection', cat: 'light', fail: 'light.0', v: { n: 474, finding: 'Poor lighting at crusher feed', sev: 'LOW', risk: 27, status: 'Open' } },
  { insp: 34, days: 3, at: '10:10', zone: 'workshop', type: 'Routine Inspection', cat: 'hemm', fail: 'hemm.2', v: { n: 475, finding: 'Faulty reverse alarm', sev: 'MEDIUM', risk: 58, status: 'Awaiting verification' } },
  { insp: 35, days: 2, at: '09:15', zone: 'pit-b', type: 'Safety Inspection', cat: 'roof', fail: 'roof.1', v: { n: 476, finding: 'Loose material on bench', sev: 'HIGH', risk: 74, status: 'In progress' } },
  { insp: 36, days: 2, at: '13:00', zone: 'crusher', type: 'Routine Inspection', cat: 'ppe', fail: 'ppe.0', v: { n: 477, finding: 'Helmet not worn', sev: 'MEDIUM', risk: 38, status: 'Open' } },
  { insp: 37, days: 1, at: '10:40', zone: 'haul-road', type: 'Routine Inspection', cat: 'haul', fail: 'haul.4', v: { n: 478, finding: 'Poor visibility at junction', sev: 'MEDIUM', risk: 52, status: 'Assigned' } },
  { insp: 38, days: 1, at: '14:50', zone: 'haul-road', type: 'Follow-up Inspection', cat: 'haul', fail: 'haul.2', v: { n: 479, finding: 'Edge protection damaged', sev: 'HIGH', risk: 79, status: 'Open' } },
];

const ACTIONS = {
  Assigned: 'Restore sight-line at the junction and mark the safe stopping point.',
  'In progress': 'Scale down loose material and re-check bench stability before work resumes.',
  'Awaiting verification': 'Repair the reverse alarm and test it before the machine returns to service.',
  Verified: 'Refit the guard on the ventilation fan and confirm it is secure.',
};

const plus = (iso, minutes) => new Date(new Date(iso).getTime() + minutes * min).toISOString();

function atDaysAgo(now, days, hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = startOfDay(now);
  d.setDate(d.getDate() - days);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

// Today's seeds are placed relative to now, never in the future.
function todayAgo(now, minutesAgo) {
  const floor = startOfDay(now).getTime() + 5 * min;
  return new Date(Math.max(floor, now.getTime() - minutesAgo * min)).toISOString();
}

function results(categoryId, failId) {
  const out = {};
  getCategory(categoryId).items.forEach((i) => {
    out[i.id] = i.id === failId ? 'fail' : 'pass';
  });
  return out;
}

function violationEvents(v, detectedAt) {
  const ev = [
    createAuditEvent({ at: detectedAt, label: 'Violation detected', actor: INSPECTOR.id, note: v.id }),
    createAuditEvent({ at: plus(detectedAt, 3), label: 'AI risk score generated', actor: 'COAL DRISHTI', note: `Risk ${v.riskScore.score}` }),
  ];
  const flow = ['Open', 'Assigned', 'In progress', 'Awaiting verification', 'Verified'];
  const at = flow.indexOf(v.status);
  if (at >= 1) ev.push(createAuditEvent({ at: plus(detectedAt, 45), label: 'Corrective action assigned', actor: 'MGR-001', note: 'Owner SUP-001' }));
  if (at >= 2) ev.push(createAuditEvent({ at: plus(detectedAt, 180), label: 'Action marked in progress', actor: 'SUP-001' }));
  if (at >= 3) {
    ev.push(createAuditEvent({ at: plus(detectedAt, 420), label: 'Closure evidence submitted', actor: 'SUP-001' }));
    ev.push(createAuditEvent({ at: plus(detectedAt, 423), label: 'Verification requested', actor: 'SUP-001' }));
  }
  if (at >= 4) ev.push(createAuditEvent({ at: plus(detectedAt, 900), label: 'Verification completed', actor: 'Verification Center' }));
  return ev;
}

function seedViolation({ n, finding, sev, risk, status }, { inspectionId, zoneId, categoryId, itemId, when, syncStatus = 'synced' }) {
  const id = `VIOL-${pad(n, 5)}`;
  const zone = getZone(zoneId);
  const coords = zoneGps(zoneId);
  const evId = `EV-${pad(n, 5)}-01`;
  const evidence = [
    {
      id: evId,
      fileName: `${zone.id}-${categoryId}.jpg`,
      timestamp: plus(when, 2),
      latitude: coords.latitude,
      longitude: coords.longitude,
      hash: pseudoHash(evId),
      similarityStatus: 'pending',
      preview: sampleImage(finding),
      source: 'sample',
    },
  ];
  let closureEvidence = null;
  if (status === 'Awaiting verification' || status === 'Verified') {
    const closeEvId = `EV-${pad(n, 5)}-02`;
    closureEvidence = {
      evidence: [
        {
          id: closeEvId,
          fileName: `${zone.id}-${categoryId}-closure.jpg`,
          timestamp: plus(when, 420),
          latitude: coords.latitude ? coords.latitude + 0.0001 : null,
          longitude: coords.longitude ? coords.longitude + 0.0001 : null,
          hash: pseudoHash(closeEvId),
          similarityStatus: status === 'Verified' ? 'verified' : 'pending',
          preview: sampleImage(`Remediation verified: ${finding}`),
          source: 'device',
        },
      ],
      notes: `Corrective action executed per standards. Tested in zone ${zone.name}.`,
      submittedAt: plus(when, 420),
      submittedBy: 'SUP-001',
    };
  }

  const v = {
    id,
    inspectionId,
    categoryId,
    category: getCategory(categoryId).name,
    checklistItemId: itemId,
    finding,
    severity: sev,
    location: zone.name,
    zoneId,
    gps: { available: true, ...coords, capturedAt: when },
    timestamp: when,
    evidence,
    closureEvidence,
    riskScore: syntheticScore(risk, sev),
    status,
    assignedTo: status === 'Open' ? MINE_MANAGER : 'SUP-001',
    correctiveAction:
      status === 'Open'
        ? null
        : { action: ACTIONS[status], assignedTo: 'SUP-001', deadline: plus(when, 24 * 60) },
    remarks: '',
    suggestedAction: '',
    syncStatus,
    seed: true,
  };
  v.auditEvents = violationEvents(v, when);
  return v;
}

function seedInspection({ id, zoneId, type, start, end, categoryId, failId, violations, syncStatus = 'synced' }) {
  const zone = getZone(zoneId);
  const events = [
    createAuditEvent({ at: start, label: 'Inspection started', actor: INSPECTOR.id }),
    ...violations.map((v) => createAuditEvent({ at: v.timestamp, label: 'Violation detected', actor: INSPECTOR.id, note: v.id })),
    createAuditEvent({
      at: plus(end, 1),
      label: syncStatus === 'pending' ? 'Inspection saved locally' : 'Inspection submitted',
      actor: INSPECTOR.id,
      note: syncStatus === 'pending' ? 'Sync pending' : '',
    }),
  ];
  return {
    id,
    inspectorId: INSPECTOR.id,
    mineId: MINE,
    zoneId,
    zone: zone.name,
    type,
    startTime: start,
    endTime: end,
    status: 'Submitted',
    syncStatus,
    checklistResults: results(categoryId, failId),
    violationIds: violations.map((v) => v.id),
    gps: { available: true, ...zoneGps(zoneId), capturedAt: start },
    auditEvents: events,
    seed: true,
  };
}

export function buildSeed(now = new Date()) {
  const inspections = [];
  const violations = [];

  HISTORY.forEach((h) => {
    const start = atDaysAgo(now, h.days, h.at);
    const end = plus(start, 24);
    const inspectionId = `INS-2026-${pad(h.insp)}`;
    const v = seedViolation(h.v, {
      inspectionId,
      zoneId: h.zone,
      categoryId: h.cat,
      itemId: h.fail,
      when: plus(start, 14),
    });
    violations.push(v);
    inspections.push(seedInspection({ id: inspectionId, zoneId: h.zone, type: h.type, start, end, categoryId: h.cat, failId: h.fail, violations: [v] }));
  });

  // Today
  const s39 = todayAgo(now, 240);
  inspections.push(seedInspection({ id: 'INS-2026-0039', zoneId: 'stockyard', type: 'Routine Inspection', start: s39, end: plus(s39, 32), categoryId: 'safety', failId: null, violations: [] }));

  const s40 = todayAgo(now, 170);
  const v480 = seedViolation(
    { n: 480, finding: 'Missing reflective vest', sev: 'MEDIUM', risk: 46, status: 'Open' },
    { inspectionId: 'INS-2026-0040', zoneId: 'pit-b', categoryId: 'ppe', itemId: 'ppe.3', when: plus(s40, 15) },
  );
  violations.push(v480);
  inspections.push(seedInspection({ id: 'INS-2026-0040', zoneId: 'pit-b', type: 'Routine Inspection', start: s40, end: plus(s40, 21), categoryId: 'ppe', failId: 'ppe.3', violations: [v480] }));

  // Completed with no signal: saved on the device, waiting to sync.
  const s41 = todayAgo(now, 95);
  inspections.push(seedInspection({ id: 'INS-2026-0041', zoneId: 'haul-road', type: 'Routine Inspection', start: s41, end: plus(s41, 26), categoryId: 'haul', failId: null, violations: [], syncStatus: 'pending' }));

  return { inspections, violations };
}
