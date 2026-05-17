import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingScreen from '../shared/components/LoadingScreen';
import PageShell from '../shared/components/PageShell';
import { notify } from '../shared/services/notify';
import { formatDate, statusTone } from '../shared/utils/formatters';
import { projectManagementService } from '../professor/services/projectManagementService';

const statuses = ['All', 'Applied', 'Shortlisted', 'Accepted', 'Rejected'];

const ProjectApplications = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('All');
  const [sortBy, setSortBy] = useState('match');
  const [selectedIds, setSelectedIds] = useState([]);

  const loadApplications = async () => {
    try {
      setApplications(await projectManagementService.getApplications(id));
    } catch (error) {
      notify.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [id]);

  const processed = useMemo(() => {
    const term = search.toLowerCase();
    return applications
      .filter((application) => statusTab === 'All' || application.status === statusTab)
      .filter((application) => {
        if (!term) return true;
        const snapshot = application.studentSnapshot || {};
        return [
          snapshot.name,
          snapshot.university,
          application.coverLetter,
          ...(snapshot.skills || []),
          ...(snapshot.researchInterests || [])
        ].filter(Boolean).join(' ').toLowerCase().includes(term);
      })
      .sort((a, b) => {
        if (sortBy === 'match') return (b.matchScore || 0) - (a.matchScore || 0);
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        return new Date(b.appliedAt) - new Date(a.appliedAt);
      });
  }, [applications, search, statusTab, sortBy]);

  const updateStatus = async (applicationId, status) => {
    try {
      await projectManagementService.setApplicationStatus(applicationId, status);
      notify.success(`Application marked ${status}`);
      loadApplications();
    } catch (error) {
      notify.error('Failed to update application');
    }
  };

  const bulkUpdate = async (status) => {
    try {
      await projectManagementService.bulkStatus(selectedIds, status);
      notify.success(`Selected applications marked ${status}`);
      setSelectedIds([]);
      loadApplications();
    } catch (error) {
      notify.error('Bulk action failed');
    }
  };

  if (loading) return <LoadingScreen label="Loading applications" />;

  const counts = statuses.reduce((map, status) => {
    map[status] = status === 'All' ? applications.length : applications.filter((application) => application.status === status).length;
    return map;
  }, {});

  return (
    <PageShell
      eyebrow="Applications"
      title="Review Applicants"
      description="Search, filter, sort, and update applicant decisions with clear status handling."
      action={<button onClick={() => navigate(-1)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Back</button>}
    >
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button key={status} onClick={() => setStatusTab(status)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${statusTab === status ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                {status} <span className="opacity-70">{counts[status]}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Search applicants or skills" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="match">Best match</option>
              <option value="recent">Most recent</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
        {selectedIds.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <span className="text-sm font-semibold text-slate-600">{selectedIds.length} selected</span>
            {['Shortlisted', 'Accepted', 'Rejected'].map((status) => (
              <button key={status} onClick={() => bulkUpdate(status)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Mark {status}</button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {processed.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No applications match your filters.</div>
        ) : processed.map((application) => {
          const snapshot = application.studentSnapshot || {};
          const selected = selectedIds.includes(application._id);
          return (
            <article key={application._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                  <input type="checkbox" checked={selected} onChange={(event) => setSelectedIds((ids) => event.target.checked ? [...ids, application._id] : ids.filter((idValue) => idValue !== application._id))} className="mt-1" />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">{snapshot.name || application.student?.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{snapshot.university || application.student?.university} · Applied {formatDate(application.appliedAt)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(application.status)}`}>{application.status}</span>
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700" title={application.whyMatched || ''}>{application.matchScore}% match</span>
                    </div>
                    <div className="mt-3 h-1.5 max-w-xs overflow-hidden rounded-full bg-slate-100" title={application.whyMatched || ''}>
                      <div className="h-full rounded-full bg-[#2563eb] transition-all duration-700" style={{ width: `${Math.max(0, Math.min(100, application.matchScore || 0))}%` }} />
                    </div>
                    {application.matchedKeywords?.length > 0 && (
                      <p className="mt-2 line-clamp-1 text-xs font-semibold text-slate-500" title={application.whyMatched}>
                        {application.matchedKeywords.slice(0, 5).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Shortlisted', 'Accepted', 'Rejected'].map((status) => (
                    <button key={status} disabled={application.status === status} onClick={() => updateStatus(application._id, status)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{status}</button>
                  ))}
                  <button onClick={() => projectManagementService.messageApplicant(application).then((result) => {
                    if (result.action === 'created' || result.action === 'reopened') notify.success('Chat request sent');
                    navigate('/messages', { state: { activeUserId: result.partnerId || application.student?._id } });
                  }).catch((error) => notify.error(error.response?.data?.message || 'Failed to message applicant'))} className="rounded-lg bg-[#2563eb] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]">Message</button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 lg:grid-cols-2">
                <p className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">{application.coverLetter}</p>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Skills</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(snapshot.skills || application.student?.skills || []).map((skill) => <span key={skill} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{skill}</span>)}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
};

export default ProjectApplications;
