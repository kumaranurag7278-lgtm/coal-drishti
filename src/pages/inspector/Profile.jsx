import { CheckCircle2, Database, Trash2 } from 'lucide-react';
import InstallButton from '../../components/InstallButton.jsx';
import Panel from '../../components/Panel.jsx';
import { useInspectorStore } from '../../context/InspectorStore.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { usePwa } from '../../context/PwaContext.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { INSPECTOR } from '../../data/inspectorMock.js';
import { BRAND } from '../../config/brand.js';

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <dt className="text-sm text-steel-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-coal-900">{children}</dd>
    </div>
  );
}

export default function Profile() {
  const { user } = useSession();
  const store = useInspectorStore();
  const { online, demoOffline, setDemoOffline } = useNetwork();
  const { installed, canInstall, offlineReady } = usePwa();
  const toast = useToast();

  const reset = () => {
    if (window.confirm('Clear inspections, violations and any draft saved on this device? Demo data is restored.')) {
      store.resetDemo();
      toast('Demo data reset.', 'info');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-4xl font-semibold leading-none text-coal-900">Profile</h1>
      </header>

      <Panel title="Inspector">
        <dl className="divide-y divide-steel-200">
          <Row label="Name">{INSPECTOR.name}</Row>
          <Row label="Inspector ID">
            <span className="tabular-nums">{user?.empId ?? INSPECTOR.id}</span>
          </Row>
          <Row label="Role">Field Inspector</Row>
          <Row label="Mine">{user?.org}</Row>
          <Row label="Area">{INSPECTOR.area}</Row>
        </dl>
      </Panel>

      <Panel title="App and offline">
        <dl className="divide-y divide-steel-200">
          <Row label="Connection">{online ? 'Online' : 'Offline mode'}</Row>
          <Row label="Works offline">
            {offlineReady ? (
              <span className="inline-flex items-center gap-1 text-ok">
                <CheckCircle2 size={15} /> Ready
              </span>
            ) : (
              'Available after the first full load in a production build'
            )}
          </Row>
          <Row label="Installed">{installed ? 'Yes' : 'No'}</Row>
        </dl>
        <div className="space-y-3 border-t border-steel-200 p-4">
          <InstallButton variant="light" />
          {!installed && !canInstall && (
            <p className="text-sm text-steel-600">
              To install {BRAND.name}, use your browser menu: Install app (Chrome, Edge) or Add to Home Screen (Safari).
            </p>
          )}
          <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 text-sm text-coal-800">
            <input type="checkbox" className="h-4 w-4 accent-primary-600" checked={demoOffline} onChange={(e) => setDemoOffline(e.target.checked)} />
            Simulate offline (demo switch)
          </label>
        </div>
      </Panel>

      <Panel title="Data on this device">
        <div className="space-y-3 p-4 text-sm text-steel-700">
          <p className="flex items-start gap-2">
            <Database size={16} className="mt-0.5 shrink-0" />
            {store.userRecordCount} inspection and violation records you created are stored in this browser
            {store.draft ? ', plus one draft' : ''}. Nothing is sent to a server.
          </p>
          {store.storageFull && <p className="text-danger">Storage is full. Evidence previews may not be saved.</p>}
          <button type="button" onClick={reset} className="btn-secondary h-11 px-4 text-danger">
            <Trash2 size={16} />
            Reset demo data
          </button>
        </div>
      </Panel>
    </div>
  );
}
