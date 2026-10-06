import {
  Building2,
  ClipboardCheck,
  HardHat,
  Pickaxe,
  Scale,
  ShieldCheck,
  Truck,
} from 'lucide-react';

export const MINES = ['Mine A', 'Mine B', 'Mine C'];
const REGIONS = ['Region East', 'Region Central', 'Region West'];

/**
 * phase:
 *  'ready'    dashboard is built in this prototype
 *  'building' dashboard is built in a later step of this prototype
 *  'later'    shown for the multi-role story; dashboard is a later prototype phase
 */
export const ROLES = [
  {
    id: 'inspector',
    name: 'Field Inspector',
    group: 'field',
    icon: ClipboardCheck,
    description: 'Conduct field inspections, capture evidence and report violations.',
    idLabel: 'Employee ID',
    idHint: 'e.g. INS-001',
    orgLabel: 'Mine',
    orgOptions: MINES,
    phase: 'ready',
    home: '/inspector',
    demo: { id: 'INS-001', password: 'demo123', org: 'Mine A' },
  },
  {
    id: 'supervisor',
    name: 'Supervisor',
    group: 'field',
    icon: HardHat,
    description: 'Monitor work zones and manage assigned corrective actions.',
    idLabel: 'Employee ID',
    idHint: 'e.g. SUP-001',
    orgLabel: 'Mine',
    orgOptions: MINES,
    phase: 'ready',
    home: '/supervisor',
    demo: { id: 'SUP-001', password: 'demo123', org: 'Mine A' },
  },
  {
    id: 'safety',
    name: 'Safety Officer',
    group: 'field',
    icon: ShieldCheck,
    description: 'Monitor safety risks, incidents and verification requests.',
    idLabel: 'Employee ID',
    idHint: 'e.g. SAF-001',
    orgLabel: 'Mine',
    orgOptions: MINES,
    phase: 'ready',
    home: '/safety',
    demo: { id: 'SAF-001', password: 'demo123', org: 'Mine A' },
  },
  {
    id: 'manager',
    name: 'Mine Manager',
    group: 'management',
    icon: Pickaxe,
    description: 'Monitor mine-wide safety, compliance, production and operations.',
    idLabel: 'Employee ID',
    idHint: 'e.g. MGR-001',
    orgLabel: 'Mine',
    orgOptions: MINES,
    phase: 'ready',
    home: '/manager',
    demo: { id: 'MGR-001', password: 'demo123', org: 'Mine A' },
  },
  {
    id: 'contractor',
    name: 'Contractor',
    group: 'management',
    icon: Truck,
    description: 'Manage contractor workforce, work activities and safety actions.',
    idLabel: 'Contractor ID',
    idHint: 'e.g. CON-001',
    orgLabel: 'Mine',
    orgOptions: MINES,
    phase: 'ready',
    home: '/contractor',
    demo: { id: 'CON-001', password: 'demo123', org: 'Mine A' },
  },
  {
    id: 'corporate',
    name: 'Corporate',
    group: 'oversight',
    icon: Building2,
    description: 'Monitor multiple mines and cross-mine performance.',
    idLabel: 'Corporate ID',
    idHint: 'e.g. COR-001',
    orgLabel: 'Region',
    orgOptions: REGIONS,
    phase: 'ready',
    home: '/corporate',
    demo: { id: 'COR-001', password: 'demo123', org: 'Region East' },
  },
  {
    id: 'dgms',
    name: 'DGMS Inspector',
    group: 'oversight',
    icon: Scale,
    description: 'Access mine oversight, inspection records and compliance information.',
    idLabel: 'Officer ID',
    idHint: 'e.g. DGM-001',
    orgLabel: 'Jurisdiction',
    orgOptions: REGIONS,
    phase: 'ready',
    home: '/dgms',
    demo: { id: 'DGM-001', password: 'demo123', org: 'Region East' },
  },
];

export const ROLE_GROUPS = [
  { id: 'field', label: 'Field operations', roleIds: ['inspector', 'supervisor', 'safety'] },
  { id: 'management', label: 'Mine management', roleIds: ['manager', 'contractor'] },
  { id: 'oversight', label: 'Oversight', roleIds: ['corporate', 'dgms'] },
];

export const getRole = (id) => ROLES.find((r) => r.id === id) ?? null;
