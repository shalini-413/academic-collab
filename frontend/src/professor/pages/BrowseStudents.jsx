import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../../shared/components/LoadingScreen';
import PageShell from '../../shared/components/PageShell';
import { notify } from '../../shared/services/notify';
import { statusTone } from '../../shared/utils/formatters';
import { getAvatarUrl } from '../../shared/utils/helpers';
import { studentDiscoveryService } from '../services/studentDiscoveryService';
import { useAuth } from '../../shared/hooks/useAuth';

const initialFilters = {
  skills: '',
  interests: '',
  department: '',
  techStack: '',
  projectId: '',
  minMatch: ''
};

const BrowseStudents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [viewMode, setViewMode] = useState('cards');
  const [loading, setLoading] = useState(true);


  // Check if the user has neither skills nor interests
const isProfileEmpty = (!user?.skills || user.skills.length === 0) && 
(!user?.researchInterests || user.researchInterests.length === 0);

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === filters.projectId),
    [projects, filters.projectId]
  );

  const loadStudents = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setStudents(await studentDiscoveryService.browse(nextFilters));
    } catch (error) {
      notify.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const boot = async () => {
      try {
        const projectList = await studentDiscoveryService.projects();
        setProjects(projectList);
        await loadStudents(initialFilters);
      } catch (error) {
        notify.error('Failed to load student discovery');
        setLoading(false);
      }
    };

    boot();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadStudents(filters), 250);
    return () => clearTimeout(timer);
  }, [filters]);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const matchLabel = (student) => (student.whyMatched || `Matched because of ${(student.matchedKeywords || []).slice(0, 5).join(', ')}`).trim();

  const inviteStudent = async (student) => {
    if (!filters.projectId) return notify.info('Select a project before inviting a student');
    try {
      await studentDiscoveryService.invite(student._id, filters.projectId);
      notify.success('Invitation sent');
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to send invitation');
    }
  };

  const shortlistStudent = async (student) => {
    if (!student.applicationId) return notify.info('Shortlisting requires an existing application');
    try {
      await studentDiscoveryService.shortlist(student.applicationId);
      notify.success('Student shortlisted');
      loadStudents(filters);
    } catch (error) {
      notify.error('Failed to shortlist student');
    }
  };

  const messageStudent = async (student) => {
    try {
      const result = await studentDiscoveryService.message(student._id, filters.projectId, student.name);
      if (result.action === 'created' || result.action === 'reopened') notify.success('Chat request sent');
      navigate('/messages', { state: { activeUserId: result.partnerId || student._id } });
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to start chat');
    }
  };

  const StudentCard = ({ student }) => (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          <img src={getAvatarUrl(student.avatar)} alt="" className="h-12 w-12 rounded-lg object-cover" />
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-950">{student.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{student.university || student.department || 'Student'}</p>
          </div>
        </div>
        <div className="min-w-[96px] text-right" title={matchLabel(student)}>
          <p className="text-2xl font-semibold text-slate-950">{student.matchScore}%</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">match</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-[#2563eb] transition-all duration-700" style={{ width: `${Math.max(0, Math.min(100, student.matchScore || 0))}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(student.applicationStatus)}`}>{student.applicationStatus}</span>
        {selectedProject && <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">{selectedProject.title}</span>}
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{student.bio || 'No bio added yet.'}</p>

      <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/60 p-3" title={matchLabel(student)}>
        <p className="text-xs font-semibold text-blue-800">{student.whyMatched || 'No strong overlap yet.'}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(student.matchedKeywords || []).slice(0, 5).map((term) => (
            <span key={term} className="rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-blue-700">{term}</span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[...(student.skills || []), ...(student.researchInterests || [])].slice(0, 6).map((tag) => (
          <span key={tag} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{tag}</span>
        ))}
      </div>

      {/* <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <button onClick={() => navigate(`/user/${student._id}`)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">View Profile</button>
        <button onClick={() => shortlistStudent(student)} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100">Shortlist</button>
        <button onClick={() => messageStudent(student)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Message</button>
        <button onClick={() => inviteStudent(student)} className="rounded-lg bg-[#2563eb] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]">Invite</button>
      </div> */}


<div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        {/* Always available actions */}
        <button onClick={() => navigate(`/user/${student._id}`)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">View Profile</button>
        <button onClick={() => messageStudent(student)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Message</button>

        {/* Dynamic actions based on application status */}
        {student.applicationStatus === 'Not applied' && (
          <button onClick={() => inviteStudent(student)} className="rounded-lg bg-[#2563eb] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]">Invite</button>
        )}

        {student.applicationStatus === 'Pending' && (
          <button onClick={() => shortlistStudent(student)} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100">Shortlist</button>
        )}

        {/* Disabled state for already processed applications */}
        {['Shortlisted', 'Accepted', 'Rejected', 'Invited'].includes(student.applicationStatus) && (
          <button disabled className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-500">
            {student.applicationStatus}
          </button>
        )}
      </div>
    </article>
  );

  return (
    <PageShell
      eyebrow="Professor"
      title="Browse Students"
      description="Find students whose profile skills and research interests align with your lab and selected projects."
      action={<button className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700" onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}>{viewMode === 'cards' ? 'Table View' : 'Card View'}</button>}
    >

      {/* --- ADD THIS WARNING BANNER BLOCK --- */}
      {isProfileEmpty && (
        <div className="mb-6 flex items-start justify-between rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div>
            <span className="font-bold">⚠️ Profile Incomplete: </span>
            The AI matching engine needs to know your skills and research interests to recommend the best students accurately. Currently, all students will show a 0% match.
          </div>
          <button 
            onClick={() => navigate('/profile')} 
            className="ml-4 whitespace-nowrap rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
          >
            Complete Profile
          </button>
        </div>
      )}
      {/* ------------------------------------- */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Skills" value={filters.skills} onChange={(event) => updateFilter('skills', event.target.value)} />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Interests" value={filters.interests} onChange={(event) => updateFilter('interests', event.target.value)} />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Department" value={filters.department} onChange={(event) => updateFilter('department', event.target.value)} />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Tech stack" value={filters.techStack} onChange={(event) => updateFilter('techStack', event.target.value)} />
          <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={filters.projectId} onChange={(event) => updateFilter('projectId', event.target.value)}>
            <option value="">All projects</option>
            {projects.map((project) => <option key={project._id} value={project._id}>{project.title}</option>)}
          </select>
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" type="number" placeholder="Min match" value={filters.minMatch} onChange={(event) => updateFilter('minMatch', event.target.value)} />
        </div>
      </div>

      {loading ? <LoadingScreen label="Finding students" /> : viewMode === 'cards' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {students.map((student) => <StudentCard key={student._id} student={student} />)}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="p-4">Student</th><th>Match</th><th>Status</th><th>Skills</th><th className="p-4">Actions</th></tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className="border-t border-slate-100">
                  <td className="p-4 font-semibold text-slate-900">{student.name}<p className="text-xs font-normal text-slate-500">{student.university}</p></td>
                  <td title={matchLabel(student)}>
                    <div className="w-24">
                      <span className="font-semibold text-slate-900">{student.matchScore}%</span>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-[#2563eb] transition-all duration-700" style={{ width: `${Math.max(0, Math.min(100, student.matchScore || 0))}%` }} />
                      </div>
                    </div>
                  </td>
                  <td><span className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusTone(student.applicationStatus)}`}>{student.applicationStatus}</span></td>
                  <td className="max-w-xs truncate">{(student.skills || []).join(', ')}</td>
                  <td className="p-4"><button onClick={() => navigate(`/user/${student._id}`)} className="text-sm font-semibold text-[#2563eb]">Profile</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
  
};

export default BrowseStudents;
