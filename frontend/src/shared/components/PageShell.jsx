const PageShell = ({ eyebrow, title, description, action, children }) => (
  <div className="min-h-screen bg-[#f8fafc] pb-16">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            {eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{eyebrow}</p>}
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
            {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>}
          </div>
          {action}
        </div>
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
  </div>
);

export default PageShell;

