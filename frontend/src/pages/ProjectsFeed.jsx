import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProjectsFeed = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/projects/feed', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(res.data);
      } catch (err) {
        console.error("Failed to load projects feed", err);
        toast.error("Failed to load feed");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProjects();
  }, [token]);

  const handleToggleSave = async (projectId) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/bookmarks/toggle/${projectId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message);
      // Optional: Update local state to show saved icon
    } catch (err) {
      toast.error("Failed to save project");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-navy">Projects Feed</h1>
          <p className="text-slate-500">Latest opportunities from professors</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">Loading feed...</div>
      ) : (
        <div className="space-y-8">
          {projects.map((project) => (
            <div 
              key={project._id} 
              className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-all group cursor-pointer"
              onClick={() => navigate(`/project-view/${project._id}`)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-navy group-hover:text-orange transition-colors">
                    {project.title}
                  </h2>
                  <p className="text-slate-600 mt-3 line-clamp-2">{project.description}</p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/project-view/${project._id}`);
                  }}
                  className="bg-navy text-white px-10 py-3 rounded-xl font-bold hover:bg-orange transition-colors"
                >
                  View Details & Apply
                </button>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSave(project._id);
                  }}
                  className="flex items-center gap-2 text-slate-400 hover:text-orange font-medium"
                >
                  ⭐ Save
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsFeed;