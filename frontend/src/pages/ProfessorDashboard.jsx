// frontend/src/pages/ProfessorDashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProjectForm from '../components/ProjectForm';

const ProfessorDashboard = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/projects/my-projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => { if (token) fetchProjects(); }, [token]);

  return (
    <div className="min-h-screen bg-[#fdfcfb] pb-20">
      <div className="bg-[#003049] pt-16 pb-24 px-8 flex justify-between items-center">
        <h1 className="text-white text-5xl font-black tracking-tighter">My <span className="text-[#fcbf49]">Research.</span></h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-[#f77f00] text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px]"
        >
          {showForm ? 'Close' : 'New Project'}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-8 -mt-10">
        {showForm && <div className="mb-12"><ProjectForm onProjectCreated={() => { fetchProjects(); setShowForm(false); }} /></div>}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map(p => (
            <div key={p._id} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
              <h3 className="text-xl font-black text-[#003049] mb-4 uppercase tracking-tight">{p.title}</h3>
              <div className="flex gap-4 border-t border-slate-50 pt-6">
                <button 
                  onClick={() => navigate(`/project/${p._id}`)}
                  className="flex-1 py-3 bg-slate-50 text-[#003049] font-black text-[10px] uppercase rounded-lg border border-slate-200"
                >
                  Review Apps
                </button>
                <button 
                  onClick={() => navigate(`/workspace/${p._id}`)}
                  className="flex-1 py-3 bg-[#003049] text-white font-black text-[10px] uppercase rounded-lg"
                >
                  Workspace
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfessorDashboard;