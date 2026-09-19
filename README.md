# COALCRAFT AI: frontend prototype (phase 1)

Smart Mine Governance & Compliance Platform. SIH 2026, SIH26024.
Frontend only. Mock data, no backend, no real authentication, no real AI.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

Fonts (Barlow Condensed, IBM Plex Sans) are bundled with the app, so the demo works offline.

## What is built in this phase

| Screen | Route |
| --- | --- |
| Role selection (all 7 roles) | `/` |
| Login, changes with the selected role (switch between all 7 roles) | `/login/:roleId` |
| Field Inspector dashboard | `/inspector` |
| Holding page for the other 6 roles | `/workspace/:roleId` |
| Holding page for inspector screens not built yet | `/inspector/:section` |

## Demo access

All roles use password `demo123` and the first mine or region in the list.

| Role | ID |
| --- | --- |
| Field Inspector | INS-001 |
| Supervisor | SUP-001 |
| Safety Officer | SAF-001 |
| Mine Manager | MGR-001 |
| Contractor | CON-001 |
| Corporate | COR-001 |
| DGMS Inspector | DGM-001 |

The login screen has a "Fill these details" button so nobody types during the demo.

## Things worth showing

- Offline mode chip in the inspector top bar. Open it and press "Simulate reconnect": sync pending drops to 0, the queued Haul Road inspection becomes Submitted, and the Pending submissions KPI goes to 0.
- KPI numbers are computed from the mock data (`src/data/inspectorMock.js`), so changing the data keeps them consistent.
- On mobile width the inspector gets a bottom tab bar with a large Start button.

## Where to change things

- Product name and copy: `src/config/brand.js`
- Roles, demo credentials, which roles are built: `src/data/roles.js`
- Inspector mock data: `src/data/inspectorMock.js`
- Colours and fonts: `tailwind.config.js`

## Next phases (not built yet)

Start inspection, checklist, violation form, AI risk-priority score, Mine Manager dashboard, corrective action, Supervisor dashboard, closure evidence, Verification Center, audit timeline.
