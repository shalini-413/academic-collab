import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProjectDetails = () => {
  const { id } = useParams();
  const { token, user } = useContext(AuthContext); // Added 'user' here
  const navigate = useNavigate();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProject(res.data);
      } catch (err) {
        toast.error("Failed to load project details");
      }
    };
    fetchProject();
  }, [id, token]);

  if (!project) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#fdfcfb] pb-20">
      <div className="bg-[#003049] py-16 px-8 text-white">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="text-white/60 mb-4 hover:text-white transition-all">
            ← Back to Dashboard
          </button>
          
          {/* Flex container to place Title and Button side by side */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black">{project.title}</h1>
              <div className="flex gap-3 mt-4">
                <span className="bg-[#f77f00] px-4 py-1 rounded-full text-xs font-bold">{project.mode}</span>
                <span className="bg-white/20 px-4 py-1 rounded-full text-xs font-bold">{project.isPaid ? 'Paid' : 'Unpaid'}</span>
              </div>
            </div>

            {/* View Applications Button - Only visible to Professors */}
            {user?.role === 'Professor' && (
              <button 
                onClick={() => navigate(`/project/${project._id}/applications`)}
                className="bg-[#f77f00] text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg whitespace-nowrap"
              >
                View All Applications
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 -mt-10">
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100">
          <section className="mb-8">
            <h3 className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-3">Project Description</h3>
            <p className="text-slate-700 leading-relaxed text-lg">{project.description}</p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {project.requiredSkills?.map((skill, i) => (
                  <span key={i} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-sm font-medium">{skill}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-3">Research Fields</h3>
              <div className="flex flex-wrap gap-2">
                {project.researchField?.map((field, i) => (
                  <span key={i} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-medium">{field}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-100">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase">Duration</p>
              <p className="font-bold text-[#003049]">{project.duration || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase">Application Deadline</p>
              <p className="font-bold text-[#003049]">{new Date(project.deadline).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase">Current Status</p>
              <p className={`font-bold ${project.status === 'Open' ? 'text-green-600' : 'text-red-500'}`}>{project.status}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;