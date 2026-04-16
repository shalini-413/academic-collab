// frontend/src/pages/StudentDashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

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

        // Count applications by status
        const pending = appRes.data.pending?.length || 0;
        const accepted = appRes.data.accepted?.length || 0;
        setApplications({
          applied: pending + accepted,
          shortlisted: 0, // You can enhance this later
          accepted: accepted,
          rejected: 0     // You can enhance this later
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
      {/* Welcome Hero */}
      <div className="bg-gradient-to-br from-[#003049] to-[#001f33] text-white py-20">
        <div className="max-w-6xl mx-auto px-8">
          <h1 className="text-6xl font-black tracking-tighter">
            Hello, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-4 text-xl text-white/80">Here's what's happening with your research journey today.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12">

        {/* Profile Strength */}
        <div className="bg-white rounded-3xl p-8 mb-12 border border-slate-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">Profile Strength</h3>
              <p className="text-slate-500 text-sm">Complete your profile to get better recommendations</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-[#f77f00]">78%</div>
            </div>
          </div>
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-[78%] bg-gradient-to-r from-[#f77f00] to-[#fcbf49]"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-12">

            {/* Recommended Projects */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-[#003049]">Recommended Projects</h2>
                <button onClick={() => navigate('/projects-feed')} className="text-[#f77f00] font-medium hover:underline">View All →</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendedProjects.map(project => (
                  <div key={project._id} 
                       onClick={() => navigate(`/project-view/${project._id}`)}
                       className="bg-white rounded-3xl p-6 border border-slate-100 hover:shadow-xl transition-all cursor-pointer">
                    <h3 className="font-bold text-lg">{project.title}</h3>
                    <p className="text-sm text-slate-600 mt-3 line-clamp-2">{project.description}</p>
                    <div className="mt-4 text-[#f77f00] font-bold">{project.matchScore}% Match</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Professors */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-[#003049]">Recommended Professors</h2>
                <button onClick={() => navigate('/recommended-professors')} className="text-[#f77f00] font-medium hover:underline">View All →</button>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-6">
                {recommendedProfessors.map(prof => (
                  <div key={prof._id} className="min-w-[280px] bg-white rounded-3xl p-6 border border-slate-100 hover:shadow-xl transition-all">
                    <h3 className="font-bold">{prof.name}</h3>
                    <p className="text-sm text-slate-500">{prof.university}</p>
                    <div className="mt-4 text-[#f77f00] font-bold">{prof.matchScore}% Match</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">

            {/* Applications Overview */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100">
              <h3 className="font-bold text-xl mb-6">Applications Overview</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-black text-blue-600">{applications.applied}</div>
                  <div className="text-sm text-slate-500">Applied</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-green-600">{applications.accepted}</div>
                  <div className="text-sm text-slate-500">Accepted</div>
                </div>
              </div>
              <button onClick={() => navigate('/my-applications')} className="mt-6 w-full py-4 bg-slate-100 rounded-2xl font-medium">View All Applications</button>
            </div>

            {/* Saved Projects */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100">
              <h3 className="font-bold text-xl mb-6">Saved Projects</h3>
              {savedProjects.length > 0 ? (
                savedProjects.map(p => (
                  <div key={p._id} className="py-3 border-b last:border-0 text-sm font-medium">{p.title}</div>
                ))
              ) : (
                <p className="text-slate-400">No saved projects yet</p>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100">
              <h3 className="font-bold text-xl mb-6">Recent Activity</h3>
              <div className="space-y-5 text-sm text-slate-600">
                <div>You applied to "AI Research Assistant"</div>
                <div>Professor Sharma viewed your profile</div>
                <div>New message from Dr. Priya Patel</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;