import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { buildSeed } from '../data/seed.js';
import { buildSubmission } from '../data/submission.js';
import { createAuditEvent, MINE_MANAGER } from '../data/models.js';
import { readJSON, removeKey, writeJSON } from '../lib/storage.js';

// Unified offline-first compliance store shared across all roles
// (Inspector, Manager, Supervisor, Verification Center, DGMS, Safety, Corporate).
// Everything is local to the browser (localStorage) — no backend or server sync.
const KEY = 'coaldrishti.compliance.v1';
const LEGACY_KEY = 'coaldrishti.inspector.v1';

const EMPTY = {
  inspections: [],
  violations: [],
  overriddenViolations: {}, // keyed by violation id: holds state mutations to seeded violations
  draft: null,
  syncedSeedIds: [],
};

const numberOf = (id) => parseInt(String(id).split('-').pop(), 10) || 0;

const ComplianceContext = createContext(null);

export function ComplianceStoreProvider({ children }) {
  const [state, setState] = useState(() => {
    const existing = readJSON(KEY, null);
    if (existing) {
      return { ...EMPTY, ...existing };
    }
    // Check if data from legacy inspector store is present
    const legacy = readJSON(LEGACY_KEY, null);
    if (legacy) {
      return { ...EMPTY, ...legacy };
    }
    return { ...EMPTY };
  });

  const [syncing, setSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [storageFull, setStorageFull] = useState(false);
  const seed = useMemo(() => buildSeed(new Date()), []);
  const timer = useRef();
  const syncingRef = useRef(false);

  useEffect(() => {
    setStorageFull(!writeJSON(KEY, state));
  }, [state]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const inspections = useMemo(() => {
    const seeded = seed.inspections.map((i) =>
      i.syncStatus === 'pending' && state.syncedSeedIds?.includes(i.id) ? { ...i, syncStatus: 'synced' } : i,
    );
    return [...state.inspections, ...seeded].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  }, [seed, state.inspections, state.syncedSeedIds]);

  const violations = useMemo(() => {
    // Map seeded violations, applying any overrides made by manager/supervisor/verifier
    const seeded = seed.violations.map((v) => {
      const override = state.overriddenViolations?.[v.id];
      return override ? { ...v, ...override } : v;
    });

    // Created violations from user inspections
    return [...state.violations, ...seeded].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [seed, state.violations, state.overriddenViolations]);

  const pendingSyncCount = inspections.filter((i) => i.syncStatus === 'pending').length;

  const allocateIds = useCallback(() => {
    const inspectionNumber = Math.max(0, ...inspections.map((i) => numberOf(i.id))) + 1;
    const violationBase = Math.max(0, ...violations.map((v) => numberOf(v.id))) + 1;
    return { inspectionNumber, violationBase };
  }, [inspections, violations]);

  const saveDraft = useCallback((draft) => setState((s) => ({ ...s, draft })), []);
  const discardDraft = useCallback(() => setState((s) => ({ ...s, draft: null })), []);

  const submitDraft = useCallback((draft, { online }) => {
    const { inspection, violations: created } = buildSubmission(draft, { online });
    setState((s) => ({
      ...s,
      inspections: [inspection, ...s.inspections],
      violations: [...created, ...s.violations],
      draft: null,
    }));
    return inspection.id;
  }, []);

  // Update a violation whether it originated from seed or user draft
  const updateViolation = useCallback((violationId, updater) => {
    setState((prev) => {
      const isUserCreated = prev.violations.some((v) => v.id === violationId);
      if (isUserCreated) {
        return {
          ...prev,
          violations: prev.violations.map((v) => (v.id === violationId ? updater(v) : v)),
        };
      }
      // Otherwise it is a seeded violation: record override
      const current = violations.find((v) => v.id === violationId);
      if (!current) return prev;
      const updated = updater(current);
      return {
        ...prev,
        overriddenViolations: {
          ...prev.overriddenViolations,
          [violationId]: updated,
        },
      };
    });
  }, [violations]);

  // Stage: ASSIGN (Mine Manager)
  const assignCorrectiveAction = useCallback(
    (violationId, { action, assignedTo, deadline, managerId = 'MGR-001' }) => {
      const at = new Date().toISOString();
      updateViolation(violationId, (v) => {
        const lastEv = v.auditEvents?.[v.auditEvents.length - 1];
        const newEv = createAuditEvent({
          at,
          label: 'Corrective action assigned',
          actor: managerId,
          note: `Owner ${assignedTo} · Due ${deadline}`,
          previousHash: lastEv?.hash,
        });
        return {
          ...v,
          status: 'Assigned',
          assignedTo,
          correctiveAction: { action, assignedTo, deadline },
          auditEvents: [...(v.auditEvents || []), newEv],
        };
      });
    },
    [updateViolation],
  );

  // Stage: CORRECT - In progress (Supervisor)
  const markInProgress = useCallback(
    (violationId, { supervisorId = 'SUP-001' } = {}) => {
      const at = new Date().toISOString();
      updateViolation(violationId, (v) => {
        const lastEv = v.auditEvents?.[v.auditEvents.length - 1];
        const newEv = createAuditEvent({
          at,
          label: 'Action marked in progress',
          actor: supervisorId,
          note: 'Remediation underway on site',
          previousHash: lastEv?.hash,
        });
        return {
          ...v,
          status: 'In progress',
          auditEvents: [...(v.auditEvents || []), newEv],
        };
      });
    },
    [updateViolation],
  );

  // Stage: CORRECT - Submit closure evidence (Supervisor)
  const submitClosureEvidence = useCallback(
    (violationId, { evidence, notes, supervisorId = 'SUP-001' }) => {
      const at = new Date().toISOString();
      updateViolation(violationId, (v) => {
        const lastEv = v.auditEvents?.[v.auditEvents.length - 1];
        const evList = Array.isArray(evidence) ? evidence : [evidence];
        const newEv1 = createAuditEvent({
          at,
          label: 'Closure evidence submitted',
          actor: supervisorId,
          note: notes || 'After-action photograph captured',
          previousHash: lastEv?.hash,
        });
        const newEv2 = createAuditEvent({
          at,
          label: 'Verification requested',
          actor: supervisorId,
          note: 'Sent to Verification Center queue',
          previousHash: newEv1.hash,
        });
        return {
          ...v,
          status: 'Awaiting verification',
          closureEvidence: {
            evidence: evList,
            notes: notes || '',
            submittedAt: at,
            submittedBy: supervisorId,
          },
          auditEvents: [...(v.auditEvents || []), newEv1, newEv2],
        };
      });
    },
    [updateViolation],
  );

  // Stage: VERIFY (Verification Center)
  const verifyViolation = useCallback(
    (violationId, { outcome, notes, verifierId = 'Verification Center' }) => {
      const at = new Date().toISOString();
      updateViolation(violationId, (v) => {
        const lastEv = v.auditEvents?.[v.auditEvents.length - 1];
        if (outcome === 'verified') {
          const newEv = createAuditEvent({
            at,
            label: 'Verification completed',
            actor: verifierId,
            note: notes || 'Closure evidence verified and approved. Issue resolved.',
            previousHash: lastEv?.hash,
          });
          const updatedClosure = v.closureEvidence
            ? {
                ...v.closureEvidence,
                evidence: (v.closureEvidence.evidence || []).map((e) => ({
                  ...e,
                  similarityStatus: 'verified',
                })),
              }
            : null;
          return {
            ...v,
            status: 'Verified',
            closureEvidence: updatedClosure,
            auditEvents: [...(v.auditEvents || []), newEv],
          };
        } else {
          // outcome === 'rejected' -> send back to 'In progress'
          const newEv = createAuditEvent({
            at,
            label: 'Verification rejected',
            actor: verifierId,
            note: notes ? `Rejected: ${notes}` : 'Evidence insufficient. Returned to Supervisor.',
            previousHash: lastEv?.hash,
          });
          return {
            ...v,
            status: 'In progress',
            auditEvents: [...(v.auditEvents || []), newEv],
          };
        }
      });
    },
    [updateViolation],
  );

  // Simulated synchronization: marks queued records as synced. No server involved.
  const syncAll = useCallback(() => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setSyncing(true);
    timer.current = setTimeout(() => {
      const at = new Date().toISOString();
      setState((s) => ({
        ...s,
        inspections: s.inspections.map((i) =>
          i.syncStatus === 'pending'
            ? {
                ...i,
                syncStatus: 'synced',
                auditEvents: [
                  ...i.auditEvents,
                  createAuditEvent({
                    at,
                    label: 'Synchronized (simulated)',
                    actor: 'COAL DRISHTI',
                    note: 'Prototype: no server involved',
                  }),
                ],
              }
            : i,
        ),
        violations: s.violations.map((v) => (v.syncStatus === 'pending' ? { ...v, syncStatus: 'synced' } : v)),
        syncedSeedIds: [
          ...new Set([
            ...(s.syncedSeedIds || []),
            ...seed.inspections.filter((i) => i.syncStatus === 'pending').map((i) => i.id),
          ]),
        ],
      }));
      setSyncing(false);
      syncingRef.current = false;
      setLastSyncedAt(at);
    }, 1600);
  }, [seed]);

  const resetDemo = useCallback(() => {
    setState({ ...EMPTY });
    setLastSyncedAt(null);
    removeKey(KEY);
    removeKey(LEGACY_KEY);
  }, []);

  const value = useMemo(
    () => ({
      inspections,
      violations,
      draft: state.draft,
      pendingSyncCount,
      syncing,
      lastSyncedAt,
      storageFull,
      userRecordCount: state.inspections.length + state.violations.length,
      getInspection: (id) => inspections.find((i) => i.id === id) ?? null,
      getViolation: (id) => violations.find((v) => v.id === id) ?? null,
      allocateIds,
      saveDraft,
      discardDraft,
      submitDraft,
      assignCorrectiveAction,
      markInProgress,
      submitClosureEvidence,
      verifyViolation,
      syncAll,
      resetDemo,
    }),
    [
      inspections,
      violations,
      state.draft,
      state.inspections.length,
      state.violations.length,
      pendingSyncCount,
      syncing,
      lastSyncedAt,
      storageFull,
      allocateIds,
      saveDraft,
      discardDraft,
      submitDraft,
      assignCorrectiveAction,
      markInProgress,
      submitClosureEvidence,
      verifyViolation,
      syncAll,
      resetDemo,
    ],
  );

  return <ComplianceContext.Provider value={value}>{children}</ComplianceContext.Provider>;
}

export function useComplianceStore() {
  const ctx = useContext(ComplianceContext);
  if (!ctx) throw new Error('useComplianceStore must be used inside ComplianceStoreProvider');
  return ctx;
}

// Aliases for seamless drop-in backwards compatibility with phase 1/2 Field Inspector code
export const useInspectorStore = useComplianceStore;
export const InspectorStoreProvider = ComplianceStoreProvider;
