// frontend/src/pages/StudentDashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios'; // <-- NEW IMPORT ADDED HERE
import { resolveAssetUrl } from '../shared/utils/urls';
import { studentDashboardService } from '../student/services/studentDashboardService';

// Custom Image Import
import studentBg from '../assets/student-bg.jpg'; 

const StudentDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [recommendedProfessors, setRecommendedProfessors] = useState([]);
  const [applications, setApplications] = useState({ applied: 0, shortlisted: 0, accepted: 0, rejected: 0 });
  const [savedProjects, setSavedProjects] = useState([]);
  const [profileStrength, setProfileStrength] = useState(0);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // 1. Load basic dashboard data (recommendations & profile)
        const dashboard = await studentDashboardService.loadDashboard();

        setRecommendedProjects(dashboard.recommendedProjects.slice(0, 4));
        setRecommendedProfessors(dashboard.recommendedProfessors.slice(0, 4));
        setSavedProjects(dashboard.savedProjects.slice(0, 3));
        setProfileStrength(dashboard.profile?.completionScore || 0);

        // 2. NEW: Fetch LIVE application data to calculate accurate stats
        const appsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/applications/my-applications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const allApps = appsRes.data || [];
        
        // Mathematically calculate the exact status counts
        setApplications({
          applied: allApps.length, // Total applications ever submitted
          shortlisted: allApps.filter(app => app.status === 'Shortlisted').length,
          accepted: allApps.filter(app => app.status === 'Accepted').length,
          rejected: allApps.filter(app => app.status === 'Rejected').length
        });

      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (token) loadDashboard();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfcfb] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#9d4edd]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcfb] pb-20">
      
      {/* 1. HERO SECTION */}
      <div 
        className="relative bg-cover bg-center pt-24 pb-32 text-white overflow-hidden"
        style={{ 
          backgroundImage: `linear-gradient(to right, rgba(10, 0, 26, 0.95), rgba(60, 9, 108, 0.85)), url(${studentBg})` 
        }}
      >
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="inline-block bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 backdrop-blur-sm">
            Student Console
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight">
            Welcome back, <br/> <span className="text-[#fcbf49]">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="mt-4 text-lg text-white/70 font-medium max-w-xl leading-relaxed">
            Your personalized research roadmap is ready. Explore new opportunities, connect with top faculty, and track your applications.
          </p>
        </div>
      </div>

      {/* 2. MAIN DASHBOARD CONTENT */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col justify-center items-center transform hover:-translate-y-1 transition-transform">
                <div className="text-3xl font-black text-[#003049]">{applications.applied}</div>
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Total Applied</div>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col justify-center items-center transform hover:-translate-y-1 transition-transform">
                <div className="text-3xl font-black text-[#fcbf49]">{applications.shortlisted}</div>
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Shortlisted</div>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col justify-center items-center transform hover:-translate-y-1 transition-transform">
                <div className="text-3xl font-black text-green-500">{applications.accepted}</div>
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Accepted</div>
              </div>
              <div 
                onClick={() => navigate('/my-applications')}
                className="bg-[#003049] rounded-3xl p-6 shadow-xl border border-[#001f30] flex flex-col justify-center items-center cursor-pointer hover:bg-[#9d4edd] transition-colors group"
              >
                <div className="text-white group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
                <div className="text-[10px] font-black uppercase text-white/70 tracking-widest mt-2 text-center">Manage<br/>Apps</div>
              </div>
            </div>

            {/* Recommended Projects */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-black text-[#003049]">Recommended Projects</h2>
                  <p className="text-sm font-medium text-slate-400 mt-1">Based on your skills & interests</p>
                </div>
                <button onClick={() => navigate('/projects-feed')} className="text-[#9d4edd] font-bold text-sm hover:underline">View All</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {recommendedProjects.map(project => (
                  <div 
                    key={project._id} 
                    onClick={() => navigate(`/project-view/${project._id}`)}
                    className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:shadow-lg hover:border-[#9d4edd]/30 transition-all cursor-pointer group flex flex-col"
                  >
                    <h3 className="font-bold text-lg text-[#003049] group-hover:text-[#9d4edd] transition-colors leading-tight line-clamp-2">
                      {project.title}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">
                      Prof. {project.professor?.name || 'Faculty Member'}
                    </p>
                    <p className="text-sm text-slate-600 mt-3 line-clamp-2 flex-1">{project.description}</p>
                    
                    <div className="mt-5 flex items-center justify-between">
                      <span className="bg-[#9d4edd]/10 text-[#7b2cbf] px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest" title={project.whyMatched || ''}>
                        {project.matchScore}% Match
                      </span>
                      <span className="text-slate-400 group-hover:text-[#9d4edd] transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white" title={project.whyMatched || ''}>
                      <div className="h-full rounded-full bg-[#9d4edd] transition-all duration-700" style={{ width: `${Math.max(0, Math.min(100, project.matchScore || 0))}%` }} />
                    </div>
                    {project.matchedKeywords?.length > 0 && (
                      <p className="mt-2 line-clamp-1 text-[10px] font-semibold text-slate-500" title={project.whyMatched}>
                        {project.matchedKeywords.slice(0, 4).join(', ')}
                      </p>
                    )}
                  </div>
                ))}

                {recommendedProjects.length === 0 && (
                  <div className="col-span-full py-10 text-center text-slate-400 italic font-medium">
                    No recommendations available yet.
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Faculty */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-black text-[#003049]">Top Faculty Matches</h2>
                  <p className="text-sm font-medium text-slate-400 mt-1">Professors looking for your skillset</p>
                </div>
                <button onClick={() => navigate('/recommended-professors')} className="text-[#9d4edd] font-bold text-sm hover:underline">View All</button>
              </div>
              
              <div className="flex gap-5 overflow-x-auto pb-4 custom-scrollbar">
                {recommendedProfessors.map(prof => (
                  <div 
                    key={prof._id} 
                    onClick={() => navigate(`/user/${prof._id}`)}
                    className="min-w-[260px] bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:shadow-lg hover:border-[#9d4edd]/30 transition-all cursor-pointer group flex flex-col items-center text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform overflow-hidden border border-slate-200">
                      <img 
                        src={prof.avatar ? resolveAssetUrl(prof.avatar) : '/default-avatar.svg'} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.svg'; }}
                      />
                    </div>
                    <h3 className="font-bold text-[#003049] group-hover:text-[#9d4edd] transition-colors">{prof.name}</h3>
                    <p className="text-xs font-semibold text-slate-500 mt-1 truncate w-full">{prof.university}</p>
                    <div className="mt-4 bg-white border border-[#9d4edd]/20 text-[#7b2cbf] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                      {prof.matchScore}% Match
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white" title={prof.whyMatched || ''}>
                      <div className="h-full rounded-full bg-[#9d4edd] transition-all duration-700" style={{ width: `${Math.max(0, Math.min(100, prof.matchScore || 0))}%` }} />
                    </div>
                    {prof.matchedKeywords?.length > 0 && (
                      <p className="mt-2 line-clamp-1 w-full text-[10px] font-semibold text-slate-500" title={prof.whyMatched}>
                        {prof.matchedKeywords.slice(0, 3).join(', ')}
                      </p>
                    )}
                  </div>
                ))}

                {recommendedProfessors.length === 0 && (
                  <div className="w-full py-10 text-center text-slate-400 italic font-medium">
                    No faculty recommendations available yet.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Conditional Profile Strength Widget */}
            {profileStrength < 100 && (
              <div className="bg-gradient-to-br from-[#10002b] to-[#3c096c] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#9d4edd] rounded-full blur-[60px] opacity-40"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="font-bold text-lg text-white">Profile Strength</h3>
                    <div className="text-4xl font-black text-[#fcbf49]">{profileStrength}%</div>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-6">
                    <div 
                      className="h-full bg-gradient-to-r from-[#fcbf49] to-[#f77f00] rounded-full transition-all duration-1000" 
                      style={{ width: `${profileStrength}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed mb-6 font-medium">
                    You're missing out on tailored opportunities! Add your bio, university, and skills to hit 100%.
                  </p>
                  <button 
                    onClick={() => navigate('/profile')} 
                    className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl font-bold text-sm transition-all"
                  >
                    Complete Profile
                  </button>
                </div>
              </div>
            )}

            {/* Saved Projects */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-xl text-[#003049]">Saved Projects</h3>
                <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-[10px] font-black">{savedProjects.length}</span>
              </div>
              
              <div className="space-y-4">
                {savedProjects.length > 0 ? (
                  savedProjects.map(p => (
                    <div 
                      key={p._id} 
                      onClick={() => navigate(`/project-view/${p._id}`)}
                      className="group cursor-pointer p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                    >
                      <h4 className="text-sm font-bold text-[#003049] group-hover:text-[#f77f00] transition-colors line-clamp-1">{p.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Prof. {p.professor?.name || 'Faculty'}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No saved projects</p>
                  </div>
                )}
              </div>
              
              {savedProjects.length > 0 && (
                <button 
                  onClick={() => navigate('/saved-projects')} 
                  className="w-full mt-4 py-3 text-slate-400 font-bold text-xs hover:text-[#003049] transition-colors uppercase tracking-widest"
                >
                  View All Bookmarks →
                </button>
              )}
            </div>

            {/* Recent Activity / System Log */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
              <h3 className="font-black text-xl mb-6 text-[#003049]">Recent Activity</h3>
              <div className="space-y-5">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-green-500 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Account verified and active</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">System • Today</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#9d4edd]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[#9d4edd] text-sm">★</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">AI Match Engine Initialized</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">System • Today</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;