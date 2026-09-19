import {
  Bell,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  TriangleAlert,
  User,
} from 'lucide-react';

export const INSPECTOR_NAV = [
  { slug: '', label: 'Dashboard', to: '/inspector', icon: LayoutDashboard, end: true },
  { slug: 'start-inspection', label: 'Start Inspection', to: '/inspector/start-inspection', icon: ClipboardCheck },
  { slug: 'my-inspections', label: 'My Inspections', to: '/inspector/my-inspections', icon: ClipboardList },
  { slug: 'my-violations', label: 'My Violations', to: '/inspector/my-violations', icon: TriangleAlert },
  { slug: 'assigned-tasks', label: 'Assigned Tasks', to: '/inspector/assigned-tasks', icon: ListChecks },
  { slug: 'alerts', label: 'Alerts', to: '/inspector/alerts', icon: Bell, badge: 3 },
  { slug: 'profile', label: 'Profile', to: '/inspector/profile', icon: User },
];
