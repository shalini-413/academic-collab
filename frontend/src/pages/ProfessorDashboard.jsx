// frontend/src/pages/ProfessorDashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProjectForm from '../components/ProjectForm';
import toast from 'react-hot-toast';

const ProfessorDashboard = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchMyProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/projects/my-projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (err) {
      toast.error("Failed to load projects");
    }
  };

  useEffect(() => {
    fetchMyProjects();
  }, [token]);

  const handleProjectCreated = () => {
    fetchMyProjects();
    setShowForm(false);
  };

  const toggleProjectStatus = async (projectId, currentStatus) => {
    const newStatus = currentStatus === 'Open' ? 'Closed' : 'Open';

    // Show confirmation toast
    const isConfirmed = await new Promise((resolve) => {
      toast((t) => (
        <div className="flex flex-col gap-3">
          <p>Mark this project as <strong>{newStatus}</strong>?</p>
          <div className="flex gap-3">
            <button 
              onClick={() => { toast.dismiss(t.id); resolve(true); }}
              className="bg-[#003049] text-white px-5 py-2 rounded-xl text-sm"
            >
              Yes, {newStatus}
            </button>
            <button 
              onClick={() => { toast.dismiss(t.id); resolve(false); }}
              className="bg-gray-200 px-5 py-2 rounded-xl text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ), { duration: 5000 });
    });

    if (!isConfirmed) return;

    try {
      await axios.put(`http://localhost:5000/api/projects/close/${projectId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Project marked as ${newStatus}`);
      fetchMyProjects();
    } catch (err) {
      toast.error("Failed to update project status");
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm("Delete this project permanently?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/projects/delete/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Project deleted");
      fetchMyProjects();
    } catch (err) {
      toast.error("Failed to delete project");
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      <div className="bg-[#003049] py-16 px-8 text-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-black">My Research Projects</h1>
          <p className="mt-3 text-white/80">Manage all your posted research opportunities</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 -mt-8">
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-[#f77f00] text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest mb-10 hover:bg-orange-600 transition-all"
        >
          {showForm ? 'Close Form' : '+ Post New Project'}
        </button>

        {showForm && (
          <div className="mb-12">
            <ProjectForm onProjectCreated={handleProjectCreated} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div 
              key={project._id} 
              className="bg-white rounded-3xl p-8 border border-slate-100 hover:shadow-xl transition-all cursor-pointer group"
              onClick={() => navigate(`/project/${project._id}`)}   // Click card → Project Details
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-xl leading-tight flex-1 pr-4 group-hover:text-[#f77f00]">
                  {project.title}
                </h3>
                <span className={`px-4 py-1 text-xs font-bold rounded-full ${project.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {project.status}
                </span>
              </div>

              <p className="text-slate-600 mt-4 line-clamp-3">{project.description}</p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap gap-3" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/project/${project._id}`);   // View Applications / Details
                  }}
                  className="flex-1 py-3 bg-[#003049] text-white font-medium rounded-2xl text-sm hover:bg-[#f77f00] transition-all"
                >
                  View Applications
                </button>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleProjectStatus(project._id, project.status);
                  }}
                  className="flex-1 py-3 bg-amber-100 text-amber-700 font-medium rounded-2xl text-sm hover:bg-amber-200 transition-all"
                >
                  {project.status === 'Open' ? 'Close Project' : 'Reopen Project'}
                </button>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(project._id);
                  }}
                  className="px-5 py-3 bg-red-100 text-red-600 font-medium rounded-2xl text-sm hover:bg-red-200 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            No projects posted yet.<br />
            Click "+ Post New Project" to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessorDashboard;