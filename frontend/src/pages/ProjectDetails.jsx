// frontend/src/pages/ProjectDetails.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ProjectDetails = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [project, setProject] = useState(null);

  const fetchDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(res.data);
    } catch (err) {
      console.error("Failed to fetch project details", err);
    }
  };

  useEffect(() => { fetchDetails(); }, [id, token]);

  const handleAction = async (studentId, action) => {
    try {
      const endpoint = action === 'approve' ? 'approve' : 'reject';
      await axios.post(`http://localhost:5000/api/projects/${endpoint}`, 
        { projectId: id, studentId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Student ${action === 'approve' ? 'Accepted' : 'Declined'}`);
      fetchDetails(); // Refresh list without reloading page
    } catch (err) {
      alert("Action failed");
    }
  };

  if (!project) return <div className="p-20 text-center font-black">Loading Applications...</div>;

  return (
    <div className="min-h-screen bg-[#fdfcfb] p-8">
      <button onClick={() => navigate(-1)} className="mb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#f77f00]">← Back</button>
      
      <div className="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-[#003049] p-10 text-white">
          <h2 className="text-3xl font-black tracking-tighter">{project.title}</h2>
          <p className="text-[#fcbf49] font-bold uppercase tracking-widest text-[10px] mt-2">Manage Applicants</p>
        </div>

        <div className="p-10">
          <h3 className="text-sm font-black text-[#003049] mb-6 uppercase tracking-widest border-b pb-4">Pending Applications ({project.applicants.length})</h3>
          
          <div className="space-y-4">
            {project.applicants.length === 0 ? (
              <p className="text-slate-400 italic">No pending applications.</p>
            ) : (
              project.applicants.map(student => (
                <div key={student._id} className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="mb-4 md:mb-0">
                    <p className="font-black text-[#003049] text-lg">{student.name}</p>
                    <p className="text-xs text-slate-500 font-medium mb-2">{student.email}</p>
                    <div className="flex flex-wrap gap-2">
                      {student.skills?.map((s, i) => (
                        <span key={i} className="text-[9px] font-bold bg-white px-2 py-1 rounded border border-slate-200 uppercase">{s}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button onClick={() => handleAction(student._id, 'approve')} className="bg-green-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-green-700">Accept</button>
                    <button onClick={() => handleAction(student._id, 'reject')} className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-red-600 hover:text-white border border-red-200">Decline</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;