const ProfileSection = ({ title, eyebrow, children, aside }) => (
  <section className="bg-white border border-slate-200 rounded-lg shadow-sm">
    <div className="border-b border-slate-100 px-6 py-5 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{eyebrow}</p>}
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      </div>
      {aside}
    </div>
    <div className="p-6">{children}</div>
  </section>
);

export default ProfileSection;

