import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const SavedProjects = () => {
  const [saved, setSaved] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/bookmarks/saved', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSaved(res.data);
      } catch (err) {
        toast.error("Failed to load bookmarks");
      }
    };
    if (token) fetchSaved();
  }, [token]);

  // NEW: Handler to remove bookmark
  const handleRemove = async (projectId) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/bookmarks/toggle/${projectId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.action === "removed") {
        // Update the UI by filtering out the removed project
        setSaved(prev => prev.filter(p => p._id !== projectId));
        toast.success("Bookmark removed");
      }
    } catch (err) {
      toast.error("Failed to remove bookmark");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-black text-navy mb-8">Saved Projects</h1>
      {saved.length === 0 ? (
        <p className="text-slate-500">You haven't saved any projects yet.</p>
      ) : (
        <div className="grid gap-6">
          {saved.map(project => (
            <div key={project._id} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-navy">{project.title}</h3>
              <p className="text-slate-600 mt-2 line-clamp-2">{project.description}</p>
              
              <div className="mt-4 flex justify-between items-center border-t pt-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Professor</span>
                  <p className="text-sm font-medium text-navy">{project.professor?.name || "N/A"}</p>
                </div>
                
                {/* Updated Button */}
                <button 
                  onClick={() => handleRemove(project._id)}
                  className="px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Remove Bookmark
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedProjects;