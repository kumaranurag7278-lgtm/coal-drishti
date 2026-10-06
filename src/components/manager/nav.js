import { AlertTriangle, LayoutDashboard, MapPin, ShieldAlert } from 'lucide-react';

export const MANAGER_NAV = [
  { slug: '', label: 'Dashboard', to: '/manager', end: true, icon: LayoutDashboard },
  { slug: 'violations', label: 'Violations & Actions', to: '/manager/violations', icon: AlertTriangle },
  { slug: 'zones', label: 'GIS Zone Overview', to: '/manager/zones', icon: MapPin },
];
