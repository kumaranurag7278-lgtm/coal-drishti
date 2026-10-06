import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

const TONES = {
  ok: { icon: CheckCircle2, cls: 'bg-coal-900 text-white', iconCls: 'text-emerald-300' },
  info: { icon: Info, cls: 'bg-coal-900 text-white', iconCls: 'text-primary-300' },
  warn: { icon: TriangleAlert, cls: 'bg-coal-900 text-white', iconCls: 'text-warn-on' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const seq = useRef(0);

  const toast = useCallback((text, tone = 'ok', ms = 3200) => {
    seq.current += 1;
    const id = seq.current;
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6"
      >
        {toasts.map((t) => {
          const s = TONES[t.tone] ?? TONES.info;
          const Icon = s.icon;
          return (
            <div key={t.id} className={`pointer-events-auto flex max-w-md items-center gap-2.5 rounded-md px-4 py-3 text-sm shadow-lg ${s.cls}`}>
              <Icon size={18} className={`shrink-0 ${s.iconCls}`} />
              {t.text}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx.toast;
}
