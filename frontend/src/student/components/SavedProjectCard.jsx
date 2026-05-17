import { useNavigate } from 'react-router-dom';

const formatDate = (value) => {
  if (!value) return 'Rolling';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const statusClassName = (status) => {
  if (status === 'Open') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'Closed') return 'bg-slate-100 text-slate-600 border-slate-200';
  return 'bg-blue-50 text-blue-700 border-blue-200';
};

const SavedProjectCard = ({ project, onRemove }) => {
  const navigate = useNavigate();
  const fields = project.researchField || [];
  const skills = project.requiredSkills || [];
  const matchScore = project.matchScore || project.score;

  return (
    <article className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClassName(project.status)}`}>
              {project.status || 'Open'}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {project.mode || 'Remote'}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {project.isPaid ? 'Paid' : 'Unpaid'}
            </span>
            {matchScore !== undefined && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {matchScore}% match
              </span>
            )}
          </div>

          <h2 className="text-xl font-semibold leading-snug text-slate-950">{project.title}</h2>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Prof. {project.professor?.name || 'Faculty Member'}{project.professor?.university ? `, ${project.professor.university}` : ''}
          </p>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{project.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-4 text-sm md:min-w-56">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Deadline</p>
            <p className="mt-1 font-semibold text-slate-800">{formatDate(project.deadline)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Duration</p>
            <p className="mt-1 font-semibold text-slate-800">{project.duration || 'Flexible'}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-3">
          {fields.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {fields.slice(0, 3).map((field) => (
                <span key={field} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{field}</span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 5).map((skill) => (
              <span key={skill} className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600">{skill}</span>
            ))}
            {skills.length > 5 && <span className="px-1 py-1 text-xs font-medium text-slate-400">+{skills.length - 5}</span>}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={() => navigate(`/project-view/${project._id}`, { state: { openApply: true } })} className="rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]">
            Quick Apply
          </button>
          <button type="button" onClick={() => navigate(`/project-view/${project._id}`)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            View Details
          </button>
          <button type="button" onClick={() => onRemove(project._id)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
            Remove
          </button>
        </div>
      </div>
    </article>
  );
};

export default SavedProjectCard;

