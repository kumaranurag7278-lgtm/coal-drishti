export default function Panel({ title, action, children, className = '' }) {
  return (
    <section className={`rounded-md border border-steel-200 bg-white ${className}`}>
      <header className="flex items-center justify-between gap-3 border-b border-steel-200 px-4 py-3">
        <h2 className="font-display text-xl font-semibold leading-none text-coal-900">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}
