const FormField = ({ label, children, className = '' }) => (
  <label className={`block ${className}`}>
    <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{label}</span>
    {children}
  </label>
);

export const inputClassName = 'w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#2563eb] focus:ring-4 focus:ring-blue-100';

export default FormField;

