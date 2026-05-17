// frontend/src/pages/WorkspacePage.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { resolveAssetUrl } from '../shared/utils/urls';

const WorkspacePage = () => {
  const { projectId } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, team, tasks, files

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        // 1. Fetch Project Details
        const projRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProject(projRes.data);

        // 2. Fetch Team Members (Accepted Applications)
        // If the user is a student and the backend blocks this, it will fail silently and gracefully.
        try {
          const appsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/applications/project/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const acceptedStudents = appsRes.data
            .filter(app => app.status === 'Accepted')
            .map(app => app.student);
          setTeam(acceptedStudents);
        } catch (teamErr) {
          console.warn("Could not fetch full team roster (likely due to student permissions).");
        }

      } catch (err) {
        console.error("Failed to load workspace", err);
        toast.error("Error loading workspace or unauthorized access.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (token && projectId) fetchWorkspaceData();
  }, [projectId, token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfcfb] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#003049]"></div>
      </div>
    );
  }

  if (!project) return null;

  const isProfessor = user.role === 'Professor';

  return (
    <div className="min-h-screen bg-[#fdfcfb] flex flex-col md:flex-row pt-16">
      
      {/* LEFT SIDEBAR: Navigation */}
      <div className="w-full md:w-64 bg-[#003049] text-white flex flex-col min-h-[calc(100vh-4rem)] border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-white/10">
          <div className="bg-[#f77f00] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 inline-block rounded-full mb-3 shadow-md">
            Active Workspace
          </div>
          <h2 className="text-xl font-black leading-tight line-clamp-2">{project.title}</h2>
          <p className="text-white/50 text-xs font-bold mt-2 uppercase tracking-widest">
            {isProfessor ? 'Role: Lead Investigator' : 'Role: Research Assistant'}
          </p>
        </div>

        <nav className="p-4 flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'overview' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('team')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'team' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Team Roster
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'tasks' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            Task Board
          </button>
          <button 
            onClick={() => setActiveTab('files')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'files' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
            Shared Files
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={() => navigate(isProfessor ? '/professor-dashboard' : '/student-dashboard')} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl font-bold text-sm transition-colors text-center">
            Exit Workspace
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-6 md:p-10 max-h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-black text-[#003049]">Workspace Overview</h1>
                  <p className="text-slate-500 font-medium mt-1">Review project goals and core requirements.</p>
                </div>
                {isProfessor && (
                  <button onClick={() => navigate(`/project/${projectId}`)} className="text-sm font-bold text-[#f77f00] hover:underline bg-[#f77f00]/10 px-4 py-2 rounded-lg">
                    Edit Project Settings
                  </button>
                )}
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Project Description</h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{project.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.requiredSkills?.map((skill, i) => (
                      <span key={i} className="bg-slate-50 text-slate-600 border border-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Logistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-sm text-slate-500 font-bold">Mode</span>
                      <span className="text-sm text-[#003049] font-black">{project.mode || 'Remote'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-sm text-slate-500 font-bold">Compensation</span>
                      <span className="text-sm text-[#003049] font-black">{project.isPaid ? 'Paid' : 'Unpaid'}</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-sm text-slate-500 font-bold">Duration</span>
                      <span className="text-sm text-[#003049] font-black">{project.duration || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TEAM ROSTER */}
          {activeTab === 'team' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="text-3xl font-black text-[#003049]">Team Roster</h1>
                <p className="text-slate-500 font-medium mt-1">The minds behind the research.</p>
              </div>

              {/* Professor Card */}
              <div className="bg-gradient-to-br from-[#003049] to-[#001f30] p-6 rounded-3xl shadow-md border border-[#003049]/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-2 border-white/20">
                     <img src={project.professor?.avatar ? resolveAssetUrl(project.professor.avatar) : '/default-avatar.svg'} className="w-full h-full object-cover" alt="Professor" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg">{project.professor?.name || 'Professor'}</h3>
                    <p className="text-[#f77f00] text-[10px] font-black uppercase tracking-widest">Lead Investigator</p>
                  </div>
                </div>
                {!isProfessor && (
                  <button onClick={() => navigate('/messages')} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-colors border border-white/10">
                    Message Lead
                  </button>
                )}
              </div>

              {/* Students List */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 ml-2">Accepted Research Assistants ({team.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {team.length > 0 ? team.map((member, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden">
                         <img src={member?.avatar ? resolveAssetUrl(member.avatar) : '/default-avatar.svg'} className="w-full h-full object-cover" alt="Student" />
                       </div>
                       <div>
                         <h4 className="font-bold text-[#003049] text-sm">{member.name || 'Student'}</h4>
                         <p className="text-slate-500 text-xs font-medium">{member.university || 'University'}</p>
                       </div>
                    </div>
                  )) : (
                    <div className="col-span-2 text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-slate-400 font-bold text-sm">No students have been accepted yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: TASKS (UI Shell for future integration) */}
          {activeTab === 'tasks' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h1 className="text-3xl font-black text-[#003049]">Task Board</h1>
                  <p className="text-slate-500 font-medium mt-1">Track milestones and assignments.</p>
                </div>
                {isProfessor && (
                  <button className="bg-[#f77f00] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#e87000] shadow-sm transition-all">
                    + Create Task
                  </button>
                )}
              </div>
              
              {/* Dummy Data for Visual Polish */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                </div>
                <h3 className="text-lg font-black text-[#003049] mb-2">Task Board Initialization</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  The Task Management API is currently being configured. Soon, you will be able to assign deadlines, track progress, and submit deliverables directly here.
                </p>
              </div>
            </div>
          )}

          {/* TAB: FILES (UI Shell for future integration) */}
          {activeTab === 'files' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h1 className="text-3xl font-black text-[#003049]">Shared Files</h1>
                  <p className="text-slate-500 font-medium mt-1">Datasets, papers, and resources.</p>
                </div>
                <button className="bg-[#003049] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#001f30] shadow-sm transition-all flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  Upload File
                </button>
              </div>

              <div className="bg-slate-50 rounded-3xl p-10 border border-dashed border-slate-200 text-center">
                 <p className="text-slate-400 font-bold text-sm">No files uploaded yet. Drag and drop resources here to share with the team.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;