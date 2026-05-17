import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../shared/components/LoadingScreen';
import PageShell from '../shared/components/PageShell';
import { notify } from '../shared/services/notify';
import { getAvatarUrl } from '../shared/utils/helpers';
import { facultyDiscoveryService } from '../student/services/facultyDiscoveryService';

const initialFilters = {
  domain: '',
  department: '',
  researchInterests: '',
  technologies: '',
  activeProjects: '',
  minMatch: ''
};

const RecommendedProfessors = () => {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);

  const loadFaculty = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setFaculty(await facultyDiscoveryService.browse(nextFilters));
    } catch (error) {
      notify.error('Failed to load faculty');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaculty(initialFilters);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadFaculty(filters), 250);
    return () => clearTimeout(timer);
  }, [filters]);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const matchLabel = (professor) => (professor.whyMatched || `Matched because of ${(professor.matchedKeywords || []).slice(0, 5).join(', ')}`).trim();

  const messageFaculty = async (professor) => {
    try {
      const result = await facultyDiscoveryService.message(professor._id, professor.name);
      if (result.action === 'created' || result.action === 'reopened') notify.success('Chat request sent');
      navigate('/messages', { state: { activeUserId: result.partnerId || professor._id } });
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to start chat');
    }
  };

  const toggleSave = async (professor) => {
    try {
      const result = await facultyDiscoveryService.toggleSave(professor._id);
      setFaculty((items) => items.map((item) => item._id === professor._id ? { ...item, isSaved: result.action === 'saved' } : item));
      notify.success(result.message);
    } catch (error) {
      notify.error('Failed to update saved faculty');
    }
  };

  return (
    <PageShell
      eyebrow="Student"
      title="Search Faculty"
      description="Explore faculty by domain, research interests, technologies, department, and active projects."
    >
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Domain" value={filters.domain} onChange={(event) => updateFilter('domain', event.target.value)} />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Department" value={filters.department} onChange={(event) => updateFilter('department', event.target.value)} />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Research interests" value={filters.researchInterests} onChange={(event) => updateFilter('researchInterests', event.target.value)} />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Technologies" value={filters.technologies} onChange={(event) => updateFilter('technologies', event.target.value)} />
          <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={filters.activeProjects} onChange={(event) => updateFilter('activeProjects', event.target.value)}>
            <option value="">Any projects</option>
            <option value="true">Has active projects</option>
          </select>
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" type="number" placeholder="Min match" value={filters.minMatch} onChange={(event) => updateFilter('minMatch', event.target.value)} />
        </div>
      </div>

      {loading ? <LoadingScreen label="Finding faculty" /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {faculty.map((professor) => (
            <article key={professor._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-4">
                  <img src={getAvatarUrl(professor.avatar)} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">{professor.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{professor.designation || 'Faculty'} · {professor.department || professor.university || 'University'}</p>
                  </div>
                </div>
                <div className="min-w-[96px] text-right" title={matchLabel(professor)}>
                  <p className="text-2xl font-semibold text-slate-950">{professor.matchScore}%</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">match</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#2563eb] transition-all duration-700" style={{ width: `${Math.max(0, Math.min(100, professor.matchScore || 0))}%` }} />
                  </div>
                </div>
              </div>

              <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{professor.bio || 'No research summary added yet.'}</p>

              <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/60 p-3" title={matchLabel(professor)}>
                <p className="text-xs font-semibold text-blue-800">{professor.whyMatched || 'No strong overlap yet.'}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(professor.matchedKeywords || []).slice(0, 5).map((term) => (
                    <span key={term} className="rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-blue-700">{term}</span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(professor.researchInterests || []).slice(0, 5).map((interest) => (
                  <span key={interest} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{interest}</span>
                ))}
              </div>

              <div className="mt-5 rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Open Projects</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{professor.openProjectCount} active</p>
                {professor.openProjects?.[0] && <p className="mt-2 text-sm text-slate-600">{professor.openProjects[0].title}</p>}
              </div>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <button onClick={() => navigate(`/user/${professor._id}`)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">View Profile</button>
                <button onClick={() => messageFaculty(professor)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Message</button>
                <button onClick={() => navigate(`/user/${professor._id}`)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Open Projects</button>
                <button onClick={() => toggleSave(professor)} className="rounded-lg bg-[#2563eb] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]">{professor.isSaved ? 'Saved' : 'Save Faculty'}</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default RecommendedProfessors;
