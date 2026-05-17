// frontend/src/pages/ProfessorDashboard.jsx

import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProjectForm from '../components/ProjectForm';
import toast from 'react-hot-toast';
import { professorDashboardService } from '../professor/services/professorDashboardService';
import bgImage from '../assets/professor-bg.jpg'; // <-- Added background image import

const ProfessorDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [recommendedStudents, setRecommendedStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Derived Stats
  const totalApplicants = projects.reduce((sum, p) => sum + (p.applications?.length || p.applicants?.length || 0), 0);
  const activeProjects = projects.filter(p => p.status === 'Open').length;

  const fetchDashboardData = async () => {
    try {
      const dashboard = await professorDashboardService.loadDashboard();
      setProjects(dashboard.projects);
      setRecommendedStudents(dashboard.recommendedStudents.slice(0, 5) || []);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token]);

  const toggleProjectStatus = async (projectId, currentStatus) => {
    const newStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
    
    // Quick confirm
    if (!window.confirm(`Mark this project as ${newStatus}?`)) return;

    try {
      await professorDashboardService.toggleProjectStatus(projectId);
      toast.success(`Project marked as ${newStatus}`);
      fetchDashboardData();
    } catch (err) {
      toast.error("Failed to update project status");
    }
  };

  const deleteProject = async (projectId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this project permanently? This cannot be undone.")) return;
    try {
      await professorDashboardService.deleteProject(projectId);
      toast.success("Project deleted");
      fetchDashboardData();
    } catch (err) {
      toast.error("Failed to delete project");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfcfb] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#f77f00]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcfb] pb-20">
      
      {/* 1. HERO SECTION - Updated with Background Image */}
      <div 
        className="pt-16 pb-32 px-6 text-white relative overflow-hidden bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(to right, rgba(0, 48, 73, 0.95), rgba(0, 48, 73, 0.8)), url(${bgImage})` 
        }}
      >
        <div className="absolute top-0 right-10 w-96 h-96 bg-[#f77f00] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex justify-between items-end">
          <div>
            <div className="inline-block bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 backdrop-blur-sm">
              Faculty Command Center
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
              Welcome, Prof. <span className="text-[#fcbf49]">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="mt-3 text-white/80 font-medium max-w-xl">
              Manage your active research, review applications, and discover top-tier student talent matched by our AI engine.
            </p>
          </div>
          
          <button 
            onClick={() => setShowForm(!showForm)}
            className="hidden md:flex bg-[#f77f00] text-white px-6 py-3.5 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg items-center gap-2"
          >
            {showForm ? 'Close Form' : '+ Post New Project'}
          </button>
        </div>
      </div>

      {/* 2. MAIN DASHBOARD CONTENT */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        
        {showForm && (
          <div className="mb-8 bg-white rounded-3xl p-8 shadow-2xl border-2 border-[#f77f00]/30 animate-fade-in-down">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-black text-[#003049]">Create New Opportunity</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-red-500 font-bold">Close X</button>
            </div>
            <ProjectForm onProjectCreated={() => { setShowForm(false); fetchDashboardData(); }} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Projects & Stats */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col items-center justify-center transform hover:-translate-y-1 transition-transform">
                <div className="text-4xl font-black text-[#003049]">{projects.length}</div>
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1 text-center">Total<br/>Projects</div>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col items-center justify-center transform hover:-translate-y-1 transition-transform">
                <div className="text-4xl font-black text-[#f77f00]">{totalApplicants}</div>
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1 text-center">Total<br/>Applicants</div>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col items-center justify-center transform hover:-translate-y-1 transition-transform">
                <div className="text-4xl font-black text-green-500">{activeProjects}</div>
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1 text-center">Active<br/>Workspaces</div>
              </div>
            </div>

            {/* My Projects (Compact View) */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-black text-[#003049]">My Projects</h2>
                  <p className="text-sm font-medium text-slate-400 mt-1">Click a project to view details & applications</p>
                </div>
                <button 
                  onClick={() => setShowForm(true)}
                  className="md:hidden text-[#f77f00] font-bold text-sm hover:underline"
                >
                  + New Project
                </button>
              </div>

              <div className="space-y-4">
                {projects.map((project) => {
                  const applicantCount = project.applications?.length || project.applicants?.length || 0;
                  
                  return (
                    <div 
                      key={project._id} 
                      onClick={() => navigate(`/project/${project._id}`)}
                      className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#f77f00]/50 hover:shadow-lg transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-[#003049] group-hover:text-[#f77f00] transition-colors leading-tight line-clamp-1">
                            {project.title}
                          </h3>
                          <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md shrink-0 ${project.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            {project.status}
                          </span>
                        </div>
                        
                        {/* Domain / Skills Preview */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.researchField?.slice(0, 1).map((field, i) => (
                            <span key={i} className="text-[10px] font-bold text-[#7b2cbf] bg-[#7b2cbf]/10 px-2 py-1 rounded">
                              {field}
                            </span>
                          ))}
                          {project.requiredSkills?.slice(0, 3).map((skill, i) => (
                            <span key={i} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                        
                        {/* Applicant Count Badge */}
                        <div className="flex flex-col items-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 min-w-[90px]">
                          <span className="text-lg font-black text-[#003049] leading-none">{applicantCount}</span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Applicants</span>
                        </div>

                        {/* Quick Actions Dropdown / Icons */}
                        <div className="flex items-center gap-2">
{/* NEW: Open Workspace Button */}
<button 
                          onClick={(e) => { 
                            e.stopPropagation(); // Prevents the main card click from firing
                            navigate(`/workspace/${project._id}`); 
                          }}
                          className="bg-white border-2 border-[#003049] text-[#003049] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#003049] hover:text-white transition-all shadow-sm whitespace-nowrap"
                        >
                          Workspace
                        </button>
                          <button 
                            onClick={(e) => deleteProject(project._id, e)}
                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Project"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {projects.length === 0 && (
                  <div className="text-center py-16 bg-slate-50 border border-slate-100 border-dashed rounded-3xl">
                    <p className="text-slate-400 font-medium">You haven't posted any projects yet.</p>
                    <button onClick={() => setShowForm(true)} className="mt-4 text-[#f77f00] font-bold hover:underline">
                      Post your first project
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar (AI Recommendations) */}
          <div className="lg:col-span-4 space-y-8">
            
            <div className="bg-gradient-to-br from-[#10002b] to-[#3c096c] rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#fcbf49] rounded-full blur-[70px] opacity-20 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xl">✨</span>
                  <h3 className="font-black text-xl text-white">AI Candidate Match</h3>
                </div>
                <p className="text-sm text-white/70 mb-6 font-medium">
                  We scanned the platform's top students. Here are the candidates whose skills perfectly align with your open projects.
                </p>

                <div className="space-y-4">
                  {recommendedStudents.length > 0 ? (
                    recommendedStudents.map((student) => (
                      <div key={student._id} className="bg-white/10 border border-white/10 rounded-2xl p-5 hover:bg-white/20 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f77f00] to-[#fcbf49] flex items-center justify-center text-white font-black text-sm shadow-md">
                              {student.name ? student.name[0].toUpperCase() : 'S'}
                            </div>
                            <div>
                              <h4 className="font-bold text-white leading-tight">{student.name}</h4>
                              <p className="text-[10px] text-white/50 uppercase tracking-widest">{student.university || 'Student'}</p>
                            </div>
                          </div>
                          
                          <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-[10px] font-black border border-green-500/30" title={student.whyMatched || ''}>
                            {student.matchScore || 0}% Match
                          </div>
                        </div>

                        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10" title={student.whyMatched || ''}>
                          <div className="h-full rounded-full bg-green-400 transition-all duration-700" style={{ width: `${Math.max(0, Math.min(100, student.matchScore || 0))}%` }} />
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {(student.matchedKeywords?.length ? student.matchedKeywords : student.skills)?.slice(0, 3).map((skill, i) => (
                            <span key={i} className="text-[9px] font-bold text-white/80 bg-white/5 border border-white/10 px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>

                        <button 
                          onClick={() => navigate(`/user/${student._id}`)}
                          className="w-full py-2.5 bg-white/10 hover:bg-white text-white hover:text-[#10002b] rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
                        >
                          View Profile
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                      <p className="text-white/50 text-xs font-bold uppercase tracking-widest leading-relaxed px-4">
                        Post a detailed project to receive AI candidate matches.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessorDashboard;
