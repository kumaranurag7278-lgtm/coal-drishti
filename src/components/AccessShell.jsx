import { BRAND } from '../config/brand.js';
import InstallButton from './InstallButton.jsx';
import Logo from './Logo.jsx';
import TopoBackdrop from './TopoBackdrop.jsx';

/**
 * Shared frame for role selection and login.
 * Desktop: dark map panel on the left, content on the right.
 * Mobile: compact dark header (with `mobileExtra`), content below.
 */
export default function AccessShell({ panel, mobileExtra, children }) {
  return (
    <div className="min-h-screen bg-steel-50 lg:grid lg:grid-cols-[minmax(380px,42%)_minmax(0,1fr)]">
      <aside className="relative overflow-hidden bg-coal-950 text-white lg:sticky lg:top-0 lg:h-screen">
        <TopoBackdrop className="absolute inset-0 h-full w-full" />
        <div className="relative flex h-full flex-col px-5 py-4 lg:px-10 lg:py-10">
          <div>
            <Logo />
            <p className="mt-2 hidden text-sm text-steel-300 lg:block">{BRAND.subtitle}</p>
            <div className="mt-3 empty:hidden">
              <InstallButton variant="dark" />
            </div>
          </div>
          <div className="mt-4 lg:hidden">{mobileExtra}</div>
          <div className="hidden min-h-0 flex-1 flex-col lg:flex">{panel}</div>
          <p className="hidden max-w-sm text-xs leading-relaxed text-steel-400 lg:block [@media(max-height:820px)]:lg:hidden">{BRAND.event}</p>
        </div>
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
