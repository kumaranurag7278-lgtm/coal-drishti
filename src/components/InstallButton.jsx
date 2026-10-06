import { Download, Share } from 'lucide-react';
import { useState } from 'react';
import { BRAND } from '../config/brand.js';
import { usePwa } from '../context/PwaContext.jsx';

// Shows "Install COAL DRISHTI" only when installing is actually possible.
// iPhone and iPad have no install prompt, so they get a short how-to instead.
export default function InstallButton({ variant = 'dark', className = '' }) {
  const { canInstall, install, needsIosHint } = usePwa();
  const [hint, setHint] = useState(false);

  const look =
    variant === 'dark'
      ? 'border border-brand/60 text-brand hover:bg-brand/10'
      : 'border border-steel-300 bg-white text-coal-800 hover:bg-steel-50';

  if (canInstall) {
    return (
      <button type="button" onClick={install} className={`btn h-10 px-3.5 text-sm ${look} ${className}`}>
        <Download size={16} />
        Install {BRAND.name}
      </button>
    );
  }

  if (needsIosHint) {
    return (
      <div className={className}>
        <button type="button" onClick={() => setHint((h) => !h)} aria-expanded={hint} className={`btn h-10 px-3.5 text-sm ${look}`}>
          <Download size={16} />
          Install {BRAND.name}
        </button>
        {hint && (
          <p className={`mt-2 flex items-start gap-2 text-sm ${variant === 'dark' ? 'text-steel-300' : 'text-steel-600'}`}>
            <Share size={16} className="mt-0.5 shrink-0" />
            In Safari, tap Share, then Add to Home Screen.
          </p>
        )}
      </div>
    );
  }
  return null;
}
