// frontend/src/pages/StudentDashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

// 1. IMPORT YOUR IMAGE HERE (Ensure it is in src/assets/)
import studentBg from '../assets/student-bg.jpg'; 

const StudentDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [recommendedProfessors, setRecommendedProfessors] = useState([]);
  const [applications, setApplications] = useState({ applied: 0, shortlisted: 0, accepted: 0, rejected: 0 });
  const [savedProjects, setSavedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [recProjRes, recProfRes, appRes, savedRes] = await Promise.all([
          axios.get('http://localhost:5000/api/projects/recommendations', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/projects/recommend-professors', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/projects/my-applications', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/bookmarks/saved', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setRecommendedProjects(recProjRes.data.slice(0, 4));
        setRecommendedProfessors(recProfRes.data.slice(0, 4));

        const pending = appRes.data.pending?.length || 0;
        const accepted = appRes.data.accepted?.length || 0;
        setApplications({
          applied: pending + accepted,
          shortlisted: 0, 
          accepted: accepted,
          rejected: 0     
        });

        setSavedProjects(savedRes.data.slice(0, 3));
      } catch (err) {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (token) loadDashboard();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      
      {/* Welcome Hero WITH CUSTOM IMAGE */}
      <div 
        className="relative bg-cover bg-center py-24 text-white"
        style={{ 
          // Professional gradient overlay: Dark Purple to Midnight
          backgroundImage: `linear-gradient(to right, rgba(15, 12, 41, 0.9), rgba(60, 9, 108, 0.7)), url(${studentBg})` 
        }}
      >
        <div className="max-w-6xl mx-auto px-8 relative z-10">
          <h1 className="text-6xl font-black tracking-tighter">
            Hello, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-4 text-xl text-white/80 font-medium max-w-2xl">
            Your personalized research roadmap is ready. Explore new opportunities and track your progress.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12">

        {/* Profile Strength */}
        <div className="bg-white rounded-3xl p-8 mb-12 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">Profile Strength</h3>
              <p className="text-slate-500 text-sm">Complete your profile to get better recommendations</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-[#9d4edd]">78%</div>
            </div>
          </div>
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-[78%] bg-gradient-to-r from-[#7b2cbf] to-[#9d4edd]"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-12">

            {/* Recommended Projects */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-[#003049]">Recommended Projects</h2>
                <button onClick={() => navigate('/projects-feed')} className="text-[#9d4edd] font-bold hover:underline">View All →</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendedProjects.map(project => (
                  <div key={project._id} 
                       onClick={() => navigate(`/project-view/${project._id}`)}
                       className="bg-white rounded-3xl p-6 border border-slate-100 hover:shadow-xl hover:border-[#9d4edd]/20 transition-all cursor-pointer group">
                    <h3 className="font-bold text-lg group-hover:text-[#9d4edd] transition-colors">{project.title}</h3>
                    <p className="text-sm text-slate-600 mt-3 line-clamp-2">{project.description}</p>
                    <div className="mt-4 text-[#9d4edd] font-black uppercase tracking-widest text-[10px]">{project.matchScore}% Match Score</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Professors */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-[#003049]">Recommended Faculty</h2>
                <button onClick={() => navigate('/recommended-professors')} className="text-[#9d4edd] font-bold hover:underline">View All →</button>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
                {recommendedProfessors.map(prof => (
                  <div key={prof._id} className="min-w-[280px] bg-white rounded-3xl p-6 border border-slate-100 hover:shadow-xl transition-all">
                    <h3 className="font-bold text-[#003049]">{prof.name}</h3>
                    <p className="text-sm text-slate-500">{prof.university}</p>
                    <div className="mt-4 inline-block bg-purple-50 text-[#7b2cbf] px-3 py-1 rounded-full text-[10px] font-black">{prof.matchScore}% Match</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">

            {/* Applications Overview */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-xl mb-6 text-[#003049]">Applications</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-black text-[#7b2cbf]">{applications.applied}</div>
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Applied</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-green-600">{applications.accepted}</div>
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Accepted</div>
                </div>
              </div>
              <button onClick={() => navigate('/my-applications')} className="mt-6 w-full py-4 bg-slate-50 text-[#003049] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#9d4edd] hover:text-white transition-all">View All Applications</button>
            </div>

            {/* Saved Projects */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-xl mb-6 text-[#003049]">Saved Projects</h3>
              {savedProjects.length > 0 ? (
                savedProjects.map(p => (
                  <div key={p._id} className="py-3 border-b last:border-0 text-sm font-bold text-slate-600 hover:text-[#9d4edd] cursor-pointer">{p.title}</div>
                ))
              ) : (
                <p className="text-slate-400 italic text-sm">No saved projects yet</p>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-[#0a001a] rounded-3xl p-8 text-white shadow-xl">
              <h3 className="font-bold text-xl mb-6">Recent Activity</h3>
              <div className="space-y-5 text-[11px] font-medium text-white/60">
                <div className="flex gap-3 items-center">
                  <span className="w-1.5 h-1.5 bg-[#9d4edd] rounded-full"></span>
                  You applied to "AI Research Assistant"
                </div>
                <div className="flex gap-3 items-center">
                  <span className="w-1.5 h-1.5 bg-[#9d4edd] rounded-full"></span>
                  Professor Sharma viewed your profile
                </div>
                <div className="flex gap-3 items-center">
                  <span className="w-1.5 h-1.5 bg-[#9d4edd] rounded-full"></span>
                  New message from Dr. Priya Patel
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