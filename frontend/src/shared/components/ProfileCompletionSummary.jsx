const ProfileCompletionSummary = ({ score, missingFields = [], tone = 'blue' }) => {
  const barClassName = tone === 'emerald' ? 'bg-emerald-500' : 'bg-blue-600';

  return (
    <div className="rounded-lg bg-white/10 p-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Completion</p>
          <p className="mt-1 text-3xl font-semibold">{score}%</p>
        </div>
        {missingFields.length > 0 && (
          <p className="max-w-52 text-right text-xs leading-5 text-white/65">
            Missing: {missingFields.slice(0, 3).join(', ')}{missingFields.length > 3 ? ` +${missingFields.length - 3}` : ''}
          </p>
        )}
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
        <div
          className={`h-full rounded-full ${barClassName} transition-[width] duration-700 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

export default ProfileCompletionSummary;

