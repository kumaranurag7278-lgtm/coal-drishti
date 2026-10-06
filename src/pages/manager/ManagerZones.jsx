import { AlertTriangle, CheckCircle, Compass, Layers, MapPin, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RiskMeter, SeverityBadge, StatusBadge } from '../../components/Badge.jsx';
import Panel from '../../components/Panel.jsx';
import { useComplianceStore } from '../../context/ComplianceStore.jsx';
import { ZONES, zoneGps } from '../../data/zones.js';
import { formatWhen } from '../../lib/format.js';

export default function ManagerZones() {
  const { violations } = useComplianceStore();
  const [selectedZoneId, setSelectedZoneId] = useState('pit-a');

  const selectedZone = ZONES.find((z) => z.id === selectedZoneId) || ZONES[0];
  const selectedGps = zoneGps(selectedZone.id);

  const zoneViolations = violations.filter((v) => v.zoneId === selectedZone.id);
  const activeZoneViolations = zoneViolations.filter((v) => v.status !== 'Verified');

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold leading-none text-coal-900 sm:text-4xl">
          GIS Mine Work Zone Overview
        </h1>
        <p className="mt-1 text-sm text-steel-600">
          Spatial overview of safety compliance and hazard density across Mine A extraction and processing sectors.
        </p>
      </div>

      {/* Spatial Zone Grid Map */}
      <Panel
        title="Mine Sector Layout Map (Simulated GIS Grid)"
        action={
          <span className="flex items-center gap-1 text-xs text-steel-500">
            <Compass size={14} className="text-primary-600" />
            Base: 30.7046° N, 76.7179° E
          </span>
        }
      >
        <div className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ZONES.map((zone) => {
              const Icon = zone.icon;
              const count = violations.filter((v) => v.zoneId === zone.id && v.status !== 'Verified').length;
              const hasHigh = violations.some((v) => v.zoneId === zone.id && v.status !== 'Verified' && v.riskScore?.score >= 70);
              const isSelected = zone.id === selectedZoneId;

              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`text-left rounded-lg border p-4 transition-all ${
                    isSelected
                      ? 'border-primary-600 bg-primary-50/50 shadow-md ring-2 ring-primary-500/30'
                      : 'border-steel-200 bg-white hover:border-steel-300 hover:bg-steel-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded ${
                        hasHigh ? 'bg-danger/10 text-danger' : count > 0 ? 'bg-warn-soft text-warn' : 'bg-steel-100 text-steel-700'
                      }`}
                    >
                      <Icon size={20} />
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-bold ${
                        hasHigh
                          ? 'bg-danger text-white'
                          : count > 0
                          ? 'bg-warn text-white'
                          : 'bg-ok-soft text-ok border border-ok-line'
                      }`}
                    >
                      {count} active
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-lg font-semibold text-coal-900 leading-tight">
                    {zone.name}
                  </h3>
                  <p className="text-xs text-steel-500 mt-0.5">{zone.description}</p>

                  <div className="mt-3 border-t border-steel-200/60 pt-2 flex items-center justify-between text-[11px] text-steel-500">
                    <span>Base Risk: {zone.risk}</span>
                    <span className="font-mono">{zoneGps(zone.id).latitude.toFixed(3)}° N</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Panel>

      {/* Selected Zone Deep Dive */}
      <Panel
        title={`Selected Sector: ${selectedZone.name} — Violations (${activeZoneViolations.length} Active / ${zoneViolations.length} Total)`}
        action={
          <div className="flex items-center gap-2 text-xs text-steel-600">
            <MapPin size={14} className="text-primary-600" />
            <span className="font-mono tabular-nums">
              {selectedGps.latitude}° N, {selectedGps.longitude}° E
            </span>
          </div>
        }
      >
        {zoneViolations.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle size={32} className="mx-auto text-ok" />
            <h4 className="mt-2 font-display text-lg font-semibold text-coal-900">Zone Fully Compliant</h4>
            <p className="mt-1 text-sm text-steel-500">
              No reported violations in {selectedZone.name}.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-steel-200">
            {zoneViolations.map((v) => (
              <li
                key={v.id}
                className="flex flex-col gap-3 p-4 transition-colors hover:bg-steel-50 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold tabular-nums text-primary-700">{v.id}</span>
                    <SeverityBadge level={v.severity} />
                    <StatusBadge status={v.status} />
                    <span className="text-xs text-steel-400">· {formatWhen(v.timestamp)}</span>
                  </div>
                  <p className="mt-1 font-medium text-coal-900">{v.finding}</p>
                  <p className="text-xs text-steel-500 mt-0.5">
                    Assigned to: <strong className="text-coal-700">{v.assignedTo}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <RiskMeter score={v.riskScore?.score ?? 0} />
                  <Link
                    to={`/manager/violations/${v.id}`}
                    className="btn-secondary h-9 px-3 text-xs font-semibold"
                  >
                    View / Manage
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
