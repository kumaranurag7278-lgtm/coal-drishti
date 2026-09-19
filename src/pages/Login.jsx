import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import AccessShell from '../components/AccessShell.jsx';
import RoleSwitcher from '../components/RoleSwitcher.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { getRole } from '../data/roles.js';

function LoginForm({ role, onChangeRole }) {
  const navigate = useNavigate();
  const { signIn } = useSession();
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const [org, setOrg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const timer = useRef();
  const Icon = role.icon;
  const orgWord = role.orgLabel.toLowerCase();

  useEffect(() => () => clearTimeout(timer.current), []);

  function fillDemo() {
    setEmpId(role.demo.id);
    setPassword(role.demo.password);
    setOrg(role.demo.org);
    setError('');
  }

  function submit(e) {
    e.preventDefault();
    setError('');
    if (!empId.trim() || !password || !org) {
      setError(`Enter your ${role.idLabel.toLowerCase()} and password, and select a ${orgWord}.`);
      return;
    }
    const idOk = empId.trim().toUpperCase() === role.demo.id;
    if (!idOk || password !== role.demo.password) {
      setError('These details do not match the demo account for this role. Use the demo access details below.');
      return;
    }
    setBusy(true);
    timer.current = setTimeout(() => {
      signIn({ roleId: role.id, empId: role.demo.id, org });
      navigate(role.home);
    }, 600);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-11rem)] max-w-md flex-col justify-center px-5 py-8 lg:min-h-screen lg:py-12">
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded bg-primary-600 text-white">
          <Icon size={28} />
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold leading-none text-coal-900">{role.name} login</h1>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-steel-600">
            <span className="h-2 w-2 rounded-full bg-primary-500" aria-hidden="true" />
            Selected role
          </p>
        </div>
      </div>
      <p className="mt-5 text-steel-700">Sign in to continue to your mine workspace.</p>
      <p className="mt-1 text-sm text-steel-500">{role.description}</p>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="emp-id" className="mb-1.5 block text-sm font-medium text-coal-900">
            {role.idLabel}
          </label>
          <input
            id="emp-id"
            className="field"
            value={empId}
            onChange={(e) => setEmpId(e.target.value)}
            placeholder={role.idHint}
            autoComplete="username"
            autoCapitalize="characters"
            spellCheck={false}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-coal-900">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="field pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded text-steel-500 hover:text-coal-900"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="org" className="mb-1.5 block text-sm font-medium text-coal-900">
            {role.orgLabel}
          </label>
          <select id="org" className="field" value={org} onChange={(e) => setOrg(e.target.value)}>
            <option value="">Select {orgWord}</option>
            {role.orgOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div aria-live="polite">
          {error && (
            <p className="rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>
          )}
        </div>

        <button type="submit" disabled={busy} className="btn-primary h-12 w-full text-base">
          {busy ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Signing in
            </>
          ) : (
            'Log in'
          )}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => setForgot((v) => !v)}
          className="font-medium text-primary-700 underline-offset-2 hover:underline"
        >
          Forgot password?
        </button>
        <button
          type="button"
          onClick={onChangeRole}
          className="inline-flex items-center gap-1.5 font-medium text-steel-700 hover:text-coal-900"
        >
          <ArrowLeft size={16} />
          Change role
        </button>
      </div>
      {forgot && (
        <p className="mt-3 rounded border border-steel-200 bg-white px-3 py-2 text-sm text-steel-600">
          Password reset is switched off in this prototype. Use the demo access details below.
        </p>
      )}

      <section aria-labelledby="demo-heading" className="mt-8 rounded-md border border-dashed border-steel-300 bg-steel-100 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="demo-heading" className="text-sm font-semibold text-coal-900">
            Demo access
          </h2>
          <button
            type="button"
            onClick={fillDemo}
            className="text-sm font-medium text-primary-700 underline-offset-2 hover:underline"
          >
            Fill these details
          </button>
        </div>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
          <dt className="text-steel-600">{role.idLabel}</dt>
          <dd className="font-medium tabular-nums text-coal-900">{role.demo.id}</dd>
          <dt className="text-steel-600">Password</dt>
          <dd className="font-medium text-coal-900">{role.demo.password}</dd>
          <dt className="text-steel-600">{role.orgLabel}</dt>
          <dd className="font-medium text-coal-900">{role.demo.org}</dd>
        </dl>
        <p className="mt-3 text-xs text-steel-500">Prototype only. There is no real sign-in and nothing is sent anywhere.</p>
      </section>
    </div>
  );
}

export default function Login() {
  const { roleId } = useParams();
  const role = getRole(roleId);
  const navigate = useNavigate();
  const { setSelectedRoleId } = useSession();

  useEffect(() => {
    if (role) setSelectedRoleId(role.id);
  }, [role, setSelectedRoleId]);

  if (!role) return <Navigate to="/" replace />;

  const switchRole = (id) => navigate(`/login/${id}`);

  return (
    <AccessShell
      mobileExtra={
        <>
          <p className="mb-2 text-sm text-steel-300">Switch role</p>
          <RoleSwitcher variant="chips" currentId={role.id} onSelect={switchRole} />
        </>
      }
      panel={
        <>
          <h2 className="mt-10 max-w-md font-display text-4xl font-semibold leading-[1.06] xl:text-5xl">
            Same platform, a different workspace for every role.
          </h2>
          <div className="mt-7 min-h-0 flex-1 overflow-y-auto pb-4">
            <p className="mb-3 text-sm font-semibold text-steel-300">Switch role</p>
            <RoleSwitcher variant="list" currentId={role.id} onSelect={switchRole} />
          </div>
        </>
      }
    >
      {/* key resets the form when the presenter switches role */}
      <LoginForm key={role.id} role={role} onChangeRole={() => navigate('/')} />
    </AccessShell>
  );
}
