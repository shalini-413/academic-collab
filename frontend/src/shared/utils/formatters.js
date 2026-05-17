export const formatDate = (value) => {
  if (!value) return 'Rolling';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const statusTone = (status) => {
  if (status === 'Accepted') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'Shortlisted') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'Rejected' || status === 'Closed') return 'bg-red-50 text-red-700 border-red-200';
  if (status === 'Applied' || status === 'Open') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

