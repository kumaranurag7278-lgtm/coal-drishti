import { ArrowLeft } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { INSPECTOR_NAV } from '../../components/inspector/nav.js';

// Holding page for Assigned Tasks and Alerts, which come in a later phase.
export default function InspectorSection() {
  const { section } = useParams();
  const item = INSPECTOR_NAV.find((n) => n.slug === section && n.slug !== '');
  if (!item) return <Navigate to="/inspector" replace />;
  const Icon = item.icon;

  const body = `${item.label} is built in a later step of the prototype. The dashboard already shows a summary.`;

  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded bg-steel-100 text-steel-700">
        <Icon size={26} />
      </span>
      <h1 className="mt-5 font-display text-3xl font-semibold leading-none text-coal-900">{item.label}</h1>
      <p className="mt-3 text-steel-600">{body}</p>
      <Link to="/inspector" className="btn-secondary mt-7 h-12 px-5">
        <ArrowLeft size={18} />
        Back to dashboard
      </Link>
    </div>
  );
}
