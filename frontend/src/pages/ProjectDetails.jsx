import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingScreen from '../shared/components/LoadingScreen';
import PageShell from '../shared/components/PageShell';
import { notify } from '../shared/services/notify';
import { formatDate, statusTone } from '../shared/utils/formatters';
import { projectManagementService } from '../professor/services/projectManagementService';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [controls, setControls] = useState({ applicantLimit: 0, visibility: 'Public' });
  const [saving, setSaving] = useState(false);

  const loadProject = async () => {
    try {
      const data = await projectManagementService.getProject(id);
      setProject(data);
      setControls({ applicantLimit: data.applicantLimit || 0, visibility: data.visibility || 'Public' });
    } catch (error) {
      notify.error('Failed to load project details');
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const updateControls = async () => {
    setSaving(true);
    try {
      const result = await projectManagementService.updateProject(id, controls);
      setProject((current) => ({ ...current, ...result.project }));
      notify.success('Project controls updated');
    } catch (error) {
      notify.error('Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    try {
      const result = await projectManagementService.toggleStatus(id);
      setProject(result.project);
      notify.success(result.message);
      loadProject();
    } catch (error) {
      notify.error('Failed to update project status');
    }
  };

  if (!project) return <LoadingScreen label="Loading project" />;

  const stats = project.applicationStats || {};
  const accepted = stats.Accepted || 0;
  const pending = stats.Applied || 0;
  const rejected = stats.Rejected || 0;
  const shortlisted = stats.Shortlisted || 0;

  return (
    <PageShell
      eyebrow="Professor Project"
      title={project.title}
      description={project.description}
      action={<button onClick={() => navigate(`/project/${project._id}/applications`)} className="rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]">View Applications</button>}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(project.status)}`}>{project.status}</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">{project.mode}</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">{project.isPaid ? 'Paid' : 'Unpaid'}</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">{project.visibility || 'Public'}</span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {[['Total', stats.total || 0], ['Pending', pending], ['Accepted', accepted], ['Rejected', rejected]].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-950">Required Skills</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(project.requiredSkills || []).map((skill) => <span key={skill} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{skill}</span>)}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-950">Research Fields</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(project.researchField || []).map((field) => <span key={field} className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{field}</span>)}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Project Analytics</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-4"><p className="text-xs text-slate-400">Conversion</p><p className="mt-1 text-xl font-semibold">{stats.total ? Math.round((accepted / stats.total) * 100) : 0}%</p></div>
              <div className="rounded-lg border border-slate-200 p-4"><p className="text-xs text-slate-400">Shortlisted</p><p className="mt-1 text-xl font-semibold">{shortlisted}</p></div>
              <div className="rounded-lg border border-slate-200 p-4"><p className="text-xs text-slate-400">Deadline</p><p className="mt-1 text-xl font-semibold">{formatDate(project.deadline)}</p></div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Controls</h2>
            <div className="mt-5 space-y-4">
              <button onClick={toggleStatus} className="w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                {project.status === 'Open' ? 'Close Project' : 'Reopen Project'}
              </button>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Applicant Limit</span>
                <input type="number" min="0" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={controls.applicantLimit} onChange={(event) => setControls((current) => ({ ...current, applicantLimit: event.target.value }))} />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Visibility</span>
                <select className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={controls.visibility} onChange={(event) => setControls((current) => ({ ...current, visibility: event.target.value }))}>
                  <option>Public</option>
                  <option>Invite-only</option>
                  <option>Hidden</option>
                </select>
              </label>
              <button disabled={saving} onClick={updateControls} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">Save Controls</button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Recent Activity</h2>
            <div className="mt-4 space-y-3">
              {(project.recentActivity || []).length === 0 ? <p className="text-sm text-slate-500">No recent application activity.</p> : project.recentActivity.map((item, index) => (
                <div key={index} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Application marked <span className="font-semibold text-slate-900">{item.status}</span></div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
};

export default ProjectDetails;

