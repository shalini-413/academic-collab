// frontend/src/pages/RecommendedProfessors.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const RecommendedProfessors = () => {
  const { token } = useContext(AuthContext);
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/projects/recommend-professors', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfessors(res.data);
      } catch (err) {
        toast.error("Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-black text-[#003049] tracking-tighter mb-2">Recommended Professors</h1>
      <p className="text-slate-500 mb-10">Based on your skills and research interests</p>

      {loading ? (
        <div className="text-center py-20">Finding best matches for you...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {professors.map(prof => (
            <div key={prof._id} className="bg-white rounded-3xl p-8 border border-slate-100 hover:shadow-xl transition-all">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold text-2xl text-[#003049]">{prof.name}</h3>
                  <p className="text-[#f77f00]">{prof.university}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-[#f77f00]">{prof.matchScore}%</div>
                  <div className="text-xs text-slate-400">Match</div>
                </div>
              </div>

              <p className="mt-6 text-slate-600 line-clamp-3">{prof.bio || "No bio available"}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {prof.researchInterests?.slice(0, 4).map((interest, i) => (
                  <span key={i} className="text-xs bg-slate-100 px-3 py-1 rounded-full">
                    {interest}
                  </span>
                ))}
              </div>

              <button className="mt-8 w-full bg-[#003049] text-white py-4 rounded-2xl font-bold hover:bg-[#f77f00]">
                View Profile & Projects
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedProfessors;