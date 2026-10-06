# COAL DRISHTI

**AI-Powered Smart Governance & Monitoring for Coal Mines**
*From Mine Data to Verified Action*

Smart India Hackathon 2026 · Problem statement **SIH26024**: *AI-Based Smart Governance and Compliance Monitoring System for Coal Mines* · Theme: Smart Automation · Category: Software · Team: Samosa Chutney

> **Frontend Prototype:** All data is local mock storage (`localStorage['coaldrishti.compliance.v1']`). There is no external server, no real database, and simulated GPS/sync. Operates 100% offline-first as an installable PWA.

---

## 1. The Core Platform Story

```
DETECT → PRIORITIZE → ASSIGN → CORRECT → VERIFY → AUDIT
```

| Step | Role | Status | Description |
| --- | --- | --- | --- |
| **Detect** | Field Inspector | ✅ Built | Walks work zones, runs interactive checklists, captures evidence photo + metadata |
| **Prioritize** | AI Engine (Mock) | ✅ Built | Scores risk (XGBoost + SHAP label) to rank severe hazards first |
| **Assign** | Mine Manager | ✅ Built | Reviews open violations, delegates corrective action, designates supervisor, sets deadline |
| **Correct** | Field Supervisor | ✅ Built | Carries out remediation, submits verifiable "after" photographic evidence |
| **Verify** | Verification Center | ✅ Built | **Competitive Differentiator:** Cryptographically validates closure evidence against baseline to prevent fake or gamed compliance |
| **Audit** | DGMS Inspector | ✅ Built | Immutable, hash-chained chronological audit ledger and statutory report exporter |

---

## 2. All 7 Roles Supported

1. **Field Inspector** (`/inspector`) — ID: `INS-001` · Conducts field inspections, logs violations, and captures baseline evidence.
2. **Mine Manager** (`/manager`) — ID: `MGR-001` · Assigns corrective actions, sets deadlines, and oversees GIS work zones.
3. **Supervisor** (`/supervisor`) — ID: `SUP-001` · Receives assigned actions, marks work in progress, and submits closure evidence.
4. **Verification Center** (`/verification`) · Side-by-side forensic verification, SHA-256 hash checks, GPS proximity checks, and certify/reject actions.
5. **DGMS Inspector / Auditor** (`/dgms`) — ID: `DGM-001` · Inspects tamper-evident SHA-256 event chains and exports printable statutory compliance dossiers.
6. **Safety Officer** (`/safety`) — ID: `SAF-001` · Monitors mine-wide safety alerts, hazard clusters, and incident trends.
7. **Corporate ESG Directorate** (`/corporate`) — ID: `COR-001` · Multi-mine rollup scorecard across Mine A, Mine B, and Mine C.
8. **Contractor Safety Portal** (`/contractor`) — ID: `CON-001` · Tracks outsourced HEMM machinery, haulage, and PPE actions.

*(Password for all demo accounts: `demo123`)*

---

## 3. End-to-End Walkthrough Demo (5 Minutes)

Experience the complete closed-loop lifecycle from hazard detection to certified audit closure:

### Step 1: Detect (Field Inspector)
1. Log in as **Field Inspector** (`INS-001`).
2. Tap **Start Inspection**, select **Pit A**, and open the **HEMM / Machinery** checklist.
3. Mark *Machine guarding in place* as **FAIL**. Select severity **CRITICAL**, attach a photo (or tap *Use a sample image*), and submit the inspection.
4. Check **My Violations**: the finding is created with `status: 'Open'` and assigned to the Mine Manager.

### Step 2: Assign (Mine Manager)
1. Log out and log in as **Mine Manager** (`MGR-001`).
2. The newly detected violation appears at the top of the **Unassigned Action Queue** ranked by AI Risk Score.
3. Click **Assign**, select supervisor **SUP-001 (Rajesh Verma)**, prescribe the corrective action, and pick a target deadline.
4. Confirm assignment: status immediately updates to `status: 'Assigned'` and a new audit event is logged.

### Step 3: Correct (Supervisor)
1. Log in as **Supervisor** (`SUP-001`).
2. On your **Remediation Hub**, the assigned violation is waiting under your tasks.
3. Click **Start Work** → Tap **Mark Task In Progress** (`status: 'In progress'`).
4. Remediate the issue and upload an after-action photo under **Submit Closure Evidence**, enter resolution notes, and tap **Submit for Verification Review** (`status: 'Awaiting verification'`).

### Step 4: Verify (Verification Center — The Differentiator)
1. Open the **Verification Center** (`/verification`).
2. The submission is queued in the **Pending Verification Queue**. Tap **Inspect & Verify**.
3. Inspect the **Side-by-Side Comparison**: Field Inspector's before photo vs Supervisor's after photo.
4. Review the **Automated Anti-Fraud Heuristics** (SHA-256 uniqueness, GPS proximity corroboration, chronological sequence, scene variation index).
5. Click **Verify & Certify Closure**: status switches to `status: 'Verified'` and closure is certified.

### Step 5: Audit (DGMS Inspector)
1. Log in as **DGMS Inspector** (`DGM-001`).
2. Inspect the **DGMS Statutory Compliance Ledger** (`/dgms`) showing 100% intact cryptographic SHA-256 event chains.
3. Click **Generate Statutory Report** (`/dgms/report`) to view or print the formal statutory safety audit dossier.

---

## 4. Tech Stack & Architecture

- **Frontend:** React 18 + Vite + Tailwind CSS + React Router + Lucide Icons
- **State & Storage:** Unified `ComplianceStore` backed by `localStorage['coaldrishti.compliance.v1']` with multi-role state mutations and backward compatibility.
- **PWA:** `vite-plugin-pwa` with service worker, offline app shell, and install prompt.
- **Cryptography:** Real SHA-256 digest hashing via Web Crypto API with fallback deterministic generator.
- **Styling:** Design tokens (`coal`, `steel`, `brand`, `ok`, `warn`, `hi`, `danger`) with `Barlow Condensed` and `IBM Plex Sans`.

---

## 5. Development & Build

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Production build
npm run build

# Preview build (test PWA & service worker)
npm run preview
```

---

## 6. Honest Prototype Disclaimers

- Sync is simulated; records reside locally in `localStorage`.
- GPS coordinates are simulated demonstrations of location capture and do not constitute legal proof.
- SHA-256 hashes provide cryptographic audit trail traceability and anti-tamper detection.
- AI risk priority scores assist triage decisions; final operational responsibility rests with authorized mining officials.

---

## 7. Team & Credits

Built with ❤️ by our team:
- **Anurag Kumar**
- **Agham**
- **Amarpal**
- **Pooja**
- **Sujal**
- **Ayush**
- **Arshdeep Kaur**

