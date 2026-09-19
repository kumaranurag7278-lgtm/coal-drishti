const STEPS = ['Detect', 'Prioritize', 'Assign', 'Correct', 'Verify', 'Audit'];

// The platform story as a real sequence. "Verify" is the differentiator.
export default function LifecycleStrip() {
  return (
    <div>
      <ol className="relative flex">
        <span aria-hidden="true" className="absolute left-[8.33%] right-[8.33%] top-[5px] h-px bg-white/25" />
        {STEPS.map((step) => {
          const key = step === 'Verify';
          return (
            <li key={step} className="relative flex flex-1 flex-col items-center gap-2 text-sm">
              <span
                aria-hidden="true"
                className={`h-[11px] w-[11px] rounded-full border-2 ${
                  key ? 'border-primary-300 bg-primary-300' : 'border-steel-400 bg-coal-950'
                }`}
              />
              <span className={key ? 'font-medium text-white' : 'text-steel-300'}>{step}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-5 text-sm text-steel-300">A closure only counts once it can be trusted.</p>
    </div>
  );
}
