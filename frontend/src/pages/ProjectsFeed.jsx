// frontend/src/pages/ProjectsFeed.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProjectsFeed = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [savedProjectIds, setSavedProjectIds] = useState(new Set());
  const [appliedProjects, setAppliedProjects] = useState({}); 
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaid, setIsPaid] = useState('');
  const [mode, setMode] = useState('');

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL}${url}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedRes, savedRes, appsRes] = await Promise.all([
          axios.get(import.meta.env.VITE_API_URL + '/api/projects/feed', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(import.meta.env.VITE_API_URL + '/api/bookmarks/saved', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(import.meta.env.VITE_API_URL + '/api/applications/my-applications', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        setProjects(feedRes.data || []);
        
        const savedIds = new Set((savedRes.data || []).map(p => p._id));
        setSavedProjectIds(savedIds);

        // Safely map applications for O(1) lookup
        const appliedMap = {};
        if (Array.isArray(appsRes.data)) {
          appsRes.data.forEach(app => {
            if (app && app.project) {
              appliedMap[app.project._id || app.project] = app.status;
            }
          });
        }
        setAppliedProjects(appliedMap);

      } catch (err) {
        console.error("Failed to load feed data", err);
        toast.error("Failed to load feed");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const handleToggleSave = async (projectId) => {
    try {
      setSavedProjectIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(projectId)) newSet.delete(projectId);
        else newSet.add(projectId);
        return newSet;
      });

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/bookmarks/toggle/${projectId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message);
    } catch (err) {
      toast.error("Failed to update bookmark");
    }
  };

  // NEW: Safe navigation handler to prevent crashing on missing IDs
  const handleNavigateToProject = (projectId) => {
    if (!projectId) {
      toast.error("Project ID is missing! Backend error.");
      return;
    }
    navigate(`/project-view/${projectId}`);
  };

  const filteredProjects = projects.filter(project => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      project.title?.toLowerCase().includes(searchLower) || 
      project.description?.toLowerCase().includes(searchLower) ||
      (Array.isArray(project.requiredSkills) && project.requiredSkills.some(skill => skill.toLowerCase().includes(searchLower)));
    
    const matchesPaid = isPaid === '' || String(project.isPaid) === isPaid;
    const matchesMode = mode === '' || project.mode === mode;

    return matchesSearch && matchesPaid && matchesMode;
  });

  return (
    <div className="min-h-screen bg-[#fdfcfb] pb-20">
      
      {/* HERO HEADER */}
      <div className="bg-[#003049] pt-16 pb-28 px-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-10 w-96 h-96 bg-[#7b2cbf] rounded-full blur-[120px] opacity-30 pointer-events-none"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Discover Opportunities</h1>
          <p className="text-white/70 text-lg max-w-2xl font-medium">
            Search the latest research projects, filter by your preferences, and apply to collaborate with top faculty.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-20">
        
        {/* SEARCH & FILTER BAR */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-4 mb-10 flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input
              type="text"
              placeholder="Search projects, skills, or keywords..."
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-[#f77f00] focus:ring-2 focus:ring-[#f77f00]/10 outline-none transition-all font-medium text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <select 
              value={isPaid} 
              onChange={(e) => setIsPaid(e.target.value)} 
              className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#f77f00] text-slate-600 font-bold cursor-pointer transition-all"
            >
              <option value="">Compensation</option>
              <option value="true">Paid Only</option>
              <option value="false">Unpaid / Volunteer</option>
            </select>
            
            <select 
              value={mode} 
              onChange={(e) => setMode(e.target.value)} 
              className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#f77f00] text-slate-600 font-bold cursor-pointer transition-all"
            >
              <option value="">Work Mode</option>
              <option value="Remote">Remote</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        {/* PROJECTS FEED */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#f77f00]"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            {filteredProjects.map((project) => {
              const isSaved = savedProjectIds.has(project._id);
              const myAppStatus = appliedProjects[project._id]; 

              return (
                <div 
                  key={project._id} 
                  className="bg-white p-6 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer"
                  onClick={() => handleNavigateToProject(project._id || project.id)}
                >
                  
                  {/* TOP ROW: Title & Bookmark */}
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h2 className="text-xl font-black text-[#003049] group-hover:text-[#f77f00] transition-colors line-clamp-2">
                      {project.title}
                    </h2>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSave(project._id);
                      }}
                      className={`shrink-0 p-2 rounded-xl transition-all border ${
                        isSaved 
                          ? 'bg-[#f77f00]/10 text-[#f77f00] border-[#f77f00]/30 shadow-inner' 
                          : 'bg-slate-50 text-slate-400 hover:text-[#f77f00] hover:bg-[#f77f00]/10 border-slate-100'
                      }`}
                      title={isSaved ? "Remove Bookmark" : "Bookmark Project"}
                    >
                      {isSaved ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                      )}
                    </button>
                  </div>

                  {/* SECOND ROW: Professor & Tags */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shadow-sm overflow-hidden border border-slate-200">
                        <img src={project.professor?.avatar ? getFullUrl(project.professor.avatar) : '/default-avatar.svg'} alt="Profile" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.svg'; }} />
                      </div>
                      <div>
                        <h3 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Safely extract professor ID
                            const profId = typeof project.professor === 'object' ? project.professor._id : project.professor;
                            if (profId) navigate(`/user/${profId}`);
                          }}
                          className="font-bold text-sm text-[#003049] hover:text-[#f77f00] transition-colors leading-tight"
                        >
                          {project.professor?.name || 'Faculty Member'}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          {project.professor?.university || 'University'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                        {project.mode || 'Remote'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${project.isPaid ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                        {project.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${project.status === 'Open' ? 'bg-[#f77f00]/10 text-[#f77f00]' : 'bg-red-50 text-red-600'}`}>
                        {project.status}
                      </span>
                      
                      {myAppStatus && (
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest text-white shadow-sm
                          ${myAppStatus === 'Accepted' ? 'bg-emerald-500' :
                            myAppStatus === 'Rejected' ? 'bg-red-500' :
                            myAppStatus === 'Shortlisted' ? 'bg-amber-500' :
                            myAppStatus === 'Withdrawn' ? 'bg-slate-500' :
                            'bg-blue-500'}`}
                        >
                          {myAppStatus === 'Applied' ? 'Pending App' : myAppStatus}
                        </span>
                      )}

                      {project.matchScore !== undefined && (
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest" title={project.whyMatched || ''}>
                          {project.matchScore}% Match
                        </span>
                      )}
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-5">
                    {project.description}
                  </p>

                  {/* BOTTOM ROW: Skills & CTA */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-slate-100 mt-auto">
                    
                    <div className="flex-1">
                      {project.matchScore !== undefined && (
                        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100" title={project.whyMatched || ''}>
                          <div className="h-full rounded-full bg-[#2563eb] transition-all duration-700" style={{ width: `${Math.max(0, Math.min(100, project.matchScore || 0))}%` }} />
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                      {Array.isArray(project.requiredSkills) && project.requiredSkills.slice(0, 4).map((skill, i) => (
                        <span key={i} className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md">
                          {skill}
                        </span>
                      ))}
                      {Array.isArray(project.requiredSkills) && project.requiredSkills.length > 4 && (
                        <span className="text-[10px] font-bold text-slate-400 px-1 py-1">
                          +{project.requiredSkills.length - 4}
                        </span>
                      )}
                      </div>
                      {project.matchedKeywords?.length > 0 && (
                        <p className="mt-2 line-clamp-1 text-[10px] font-semibold text-slate-500" title={project.whyMatched}>
                          Matched because of {project.matchedKeywords.slice(0, 4).join(', ')}
                        </p>
                      )}
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToProject(project._id || project.id);
                      }}
                      className="shrink-0 bg-[#003049] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#f77f00] transition-colors shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                    >
                      View Details
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredProjects.length === 0 && (
          <div className="bg-white rounded-[3rem] border border-slate-100 p-16 text-center shadow-sm max-w-3xl mx-auto mt-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <h3 className="text-xl font-black text-[#003049] mb-2">No projects found</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
              We couldn't find any opportunities matching your current search and filters.
            </p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setIsPaid('');
                setMode('');
              }}
              className="mt-6 text-[#f77f00] font-bold text-sm hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsFeed;