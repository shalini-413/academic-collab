import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProjectApplications = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW STATES FOR FILTERING & SORTING
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' or 'match'

  useEffect(() => {
    fetchApplications();
  }, [id, token]);

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/applications/project/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data);
    } catch (err) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/applications/status`, 
      { applicationId, status }, 
      { headers: { Authorization: `Bearer ${token}` }});
      
      toast.success(`Applicant ${status}!`);
      fetchApplications(); 
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // FILTER & SORT LOGIC
  const processedApplications = applications
    .filter(app => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const name = (app.studentSnapshot?.name || app.student?.name || '').toLowerCase();
      const skills = (app.studentSnapshot?.skills || []).join(' ').toLowerCase();
      const coverLetter = (app.coverLetter || '').toLowerCase();
      
      return name.includes(term) || skills.includes(term) || coverLetter.includes(term);
    })
    .sort((a, b) => {
      if (sortBy === 'match') {
        return (b.matchScore || 0) - (a.matchScore || 0); // Highest score first
      } else {
        return new Date(b.appliedAt) - new Date(a.appliedAt); // Newest first
      }
    });

  if (loading) return <div className="p-20 text-center">Loading applications...</div>;

  return (
    <div className="min-h-screen bg-[#fdfcfb] pb-20">
      <div className="bg-[#003049] py-12 px-8 text-white">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => navigate(-1)} className="text-white/60 mb-4 hover:text-white transition-all">← Back</button>
          <h1 className="text-4xl font-black mb-2">Manage Applications</h1>
          <p className="text-white/80">Review candidates, filter by skills, and update their status.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 -mt-8">
        
        {/* FILTER & SORT CONTROLS */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <input 
              type="text" 
              placeholder="Filter by keyword, skills, or applicant name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f77f00] text-slate-700"
            />
          </div>
          <div className="w-full md:w-auto flex items-center gap-3">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sort By:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl focus:outline-none text-slate-700 font-medium cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="match">Best Match Score</option>
            </select>
          </div>
        </div>

        {processedApplications.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow border border-slate-100 text-center text-slate-500 font-medium">
            No applications match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {processedApplications.map((app) => (
              <div key={app._id} className="bg-white rounded-2xl p-8 border border-slate-100 shadow-lg relative">
                
                {/* Match Score & Status Badge */}
                <div className="absolute top-8 right-8 flex flex-col items-end gap-2">
                  <span className={`px-4 py-1 text-xs font-bold rounded-full uppercase tracking-widest
                    ${app.status === 'Applied' ? 'bg-blue-100 text-blue-700' : ''}
                    ${app.status === 'Shortlisted' ? 'bg-amber-100 text-amber-700' : ''}
                    ${app.status === 'Accepted' ? 'bg-green-100 text-green-700' : ''}
                    ${app.status === 'Rejected' ? 'bg-red-100 text-red-700' : ''}
                  `}>
                    {app.status}
                  </span>
                  
                  {/* AI Match Score Display */}
                  <span className="bg-[#003049] text-white px-3 py-1 rounded-lg text-xs font-bold">
                    {app.matchScore}% Match
                  </span>
                </div>

                {/* Candidate Info */}
                <h2 className="text-2xl font-bold text-[#003049] mb-1">{app.studentSnapshot?.name || app.student?.name}</h2>
                <p className="text-slate-500 text-sm mb-6">{app.studentSnapshot?.university || app.student?.university}</p>

                <div className="grid md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Cover Letter</h4>
                    <p className="text-slate-700 bg-slate-50 p-4 rounded-xl text-sm leading-relaxed max-h-48 overflow-y-auto">
                      {app.coverLetter}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Skills & Links</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {app.studentSnapshot?.skills?.map((skill, i) => (
                        <span key={i} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-bold">{skill}</span>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 text-sm">
                      {app.resumeUrl && (
                        <a href={`http://localhost:5000${app.resumeUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">📄 View Resume</a>
                      )}
                      {app.student?.github && (
                        <a href={app.student.github} target="_blank" rel="noreferrer" className="text-slate-700 hover:text-black">🐙 GitHub Profile</a>
                      )}
                      {app.additionalLinks?.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noreferrer" className="text-[#f77f00] hover:underline">🔗 {link.title || 'External Link'}</a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
{/* Actions inside ProjectApplications.jsx */}
<div className="flex flex-col gap-4 pt-6 border-t border-slate-100">
  
  {/* Status Update Buttons */}
  <div className="flex gap-3">
    <button 
      onClick={() => handleStatusUpdate(app._id, 'Shortlisted')}
      disabled={app.status === 'Shortlisted' || app.status === 'Accepted'}
      className="px-6 py-2 bg-amber-50 text-amber-600 font-bold rounded-xl text-sm hover:bg-amber-100 disabled:opacity-50 transition-all"
    >
      Shortlist
    </button>
    <button 
      onClick={() => handleStatusUpdate(app._id, 'Accepted')}
      disabled={app.status === 'Accepted'}
      className="px-6 py-2 bg-green-50 text-green-600 font-bold rounded-xl text-sm hover:bg-green-100 disabled:opacity-50 transition-all"
    >
      Accept
    </button>
    <button 
      onClick={() => handleStatusUpdate(app._id, 'Rejected')}
      disabled={app.status === 'Rejected'}
      className="px-6 py-2 bg-red-50 text-red-600 font-bold rounded-xl text-sm hover:bg-red-100 disabled:opacity-50 transition-all"
    >
      Reject
    </button>
  </div>

  {/* NEW: Message Request Button (Shows only when Shortlisted/Accepted) */}
  {(app.status === 'Shortlisted' || app.status === 'Accepted') && (
    <button 
      onClick={async () => {
        try {
          await axios.post('http://localhost:5000/api/chat/request', {
            receiverId: app.student._id,
            projectId: app.project._id,
            initialMessage: `Hi ${app.studentSnapshot?.name.split(' ')[0]}, I have reviewed your application for '${app.project.title}' and would like to discuss it further.`
          }, { headers: { Authorization: `Bearer ${token}` } });
          
          toast.success("Chat request sent! Check your Messages.");
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to send request");
        }
      }}
      className="w-max px-6 py-2.5 bg-[#003049] text-white font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-[#f77f00] transition-all shadow-md"
    >
      💬 Initiate Chat with Applicant
    </button>
  )}
</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectApplications;