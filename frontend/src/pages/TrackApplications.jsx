// frontend/src/pages/TrackApplications.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { chatInitiationService } from '../shared/services/chatInitiationService';

const TrackApplications = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // Core State
  const [activeTab, setActiveTab] = useState('applicants'); // 'applicants' | 'discover'
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [applications, setApplications] = useState([]);
  const [discoveredStudents, setDiscoveredStudents] = useState([]);
  const [projects, setProjects] = useState([]);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch the Professor's Projects (for the filter dropdown)
      const projRes = await axios.get(import.meta.env.VITE_API_URL + '/api/projects/my-projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(projRes.data);

      // Fetch Applications
      try {
        const appRes = await axios.get(import.meta.env.VITE_API_URL + '/api/applications/professor', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(appRes.data);
      } catch (err) {
        console.log("No applications found or endpoint missing");
      }

      // Fetch AI Discovered Students
      try {
        const studentRes = await axios.get(import.meta.env.VITE_API_URL + '/api/professors/recommend-students', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDiscoveredStudents(studentRes.data);
      } catch (err) {
        console.log("No recommended students found or endpoint missing");
      }

    } catch (err) {
      toast.error("Failed to load ATS data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // Handle Application Status Update
  const updateApplicationStatus = async (appId, newStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/applications/${appId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Application marked as ${newStatus}`);
      
      // Optimistically update UI
      setApplications(prev => prev.map(app => app._id === appId ? { ...app, status: newStatus } : app));
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Helper for initiating a chat with discovered students
  const initiateChat = async (studentId) => {
    try {
      const result = await chatInitiationService.start({
        receiverId: studentId,
        initialMessage: "Hi, I viewed your profile and think your skills would be a great fit for my research. Let's chat!"
      });
      if (result.action === 'created' || result.action === 'reopened') toast.success("Chat invitation sent!");
      navigate('/messages', { state: { activeUserId: result.partnerId || studentId } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send chat invitation");
    }
  };

  // Filtering Logic
  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchTerm || app.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || app.student?.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesProject = !filterProject || app.project?._id === filterProject;
    const matchesStatus = !filterStatus || app.status === filterStatus;
    return matchesSearch && matchesProject && matchesStatus;
  });

  const filteredDiscovered = discoveredStudents.filter(student => {
    return !searchTerm || student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || student.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  // UI Helpers
  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted': return 'bg-green-100 text-green-700 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'Shortlisted': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL}${url}`;
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] pb-20">
      
      {/* 1. ATS HERO HEADER */}
      <div className="bg-[#003049] pt-16 pb-28 px-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-10 w-96 h-96 bg-[#fcbf49] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Applicant Tracking</h1>
          <p className="text-white/70 text-lg max-w-2xl font-medium">
            Review incoming applications, update candidate statuses, and discover AI-matched talent for your open projects.
          </p>

          {/* Custom Tabs */}
          <div className="flex gap-4 mt-8 bg-white/5 p-1.5 rounded-2xl w-fit border border-white/10 backdrop-blur-sm">
            <button 
              onClick={() => setActiveTab('applicants')}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'applicants' ? 'bg-[#f77f00] text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              Inbox ({applications.length})
            </button>
            <button 
              onClick={() => setActiveTab('discover')}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'discover' ? 'bg-[#7b2cbf] text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              AI Discover
              <span className="text-lg leading-none">✨</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
        
        {/* 2. FILTERS BAR */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-4 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input
              type="text"
              placeholder="Search students or skills..."
              className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:border-[#f77f00] focus:ring-2 focus:ring-[#f77f00]/10 outline-none transition-all font-medium text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {activeTab === 'applicants' && (
            <>
              <select 
                value={filterProject} 
                onChange={(e) => setFilterProject(e.target.value)} 
                className="px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#f77f00] text-slate-600 font-bold cursor-pointer max-w-xs"
              >
                <option value="">All Projects</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)} 
                className="px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#f77f00] text-slate-600 font-bold cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </>
          )}
        </div>

        {/* 3. CONTENT AREA */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#f77f00]"></div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* ================= TAB 1: APPLICANTS ================= */}
            {activeTab === 'applicants' && (
              <div className="grid grid-cols-1 gap-6">
                {filteredApplications.map((app) => (
                  <div key={app._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all p-6 md:p-8 flex flex-col md:flex-row gap-8">
                    
                    {/* Left: Student Profile Snapshot */}
                    <div className="md:w-1/3 flex flex-col border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center shadow-md overflow-hidden shrink-0 border border-slate-200">
                          <img 
                            src={app.student?.avatar ? getFullUrl(app.student.avatar) : '/default-avatar.svg'} 
                            alt="Avatar" 
                            className="w-full h-full object-cover" 
                            onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.svg'; }}
                          />
                        </div>
                        <div>
                          <h3 
                            onClick={() => navigate(`/user/${app.student?._id}`)}
                            className="font-black text-xl text-[#003049] hover:text-[#f77f00] transition-colors cursor-pointer leading-tight"
                          >
                            {app.student?.name}
                          </h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {app.student?.university || 'University'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {app.student?.skills?.slice(0, 4).map((skill, i) => (
                          <span key={i} className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto flex items-center gap-3">
                        <span className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                        {app.matchScore && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#7b2cbf] bg-[#7b2cbf]/10 px-2 py-1.5 rounded-lg">
                            {app.matchScore}% Match
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Application Details & Actions */}
                    <div className="md:w-2/3 flex flex-col">
                      <div className="mb-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Applied For Project:</p>
                        <Link to={`/project/${app.project?._id}`} className="font-bold text-[#003049] hover:text-[#f77f00] hover:underline text-lg">
                          {app.project?.title}
                        </Link>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-5 mb-6 flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Cover Letter / Pitch</p>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                          {app.coverLetter}
                        </p>
                      </div>

                      <div className="flex flex-wrap justify-between items-center gap-4 mt-auto">
                        <div className="flex gap-3">
                          {app.resume && (
                            <a href={getFullUrl(app.resume)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-[#003049] bg-white border-2 border-slate-200 px-4 py-2.5 rounded-xl hover:border-[#003049] transition-colors">
                              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                              View Resume
                            </a>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {app.status === 'Pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => updateApplicationStatus(app._id, 'Rejected')} className="px-5 py-2.5 rounded-xl font-bold text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Reject</button>
                            <button onClick={() => updateApplicationStatus(app._id, 'Shortlisted')} className="px-5 py-2.5 rounded-xl font-bold text-sm bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors">Shortlist</button>
                            <button onClick={() => updateApplicationStatus(app._id, 'Accepted')} className="px-5 py-2.5 rounded-xl font-bold text-sm bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md">Accept</button>
                          </div>
                        )}
                        {app.status === 'Shortlisted' && (
                          <div className="flex gap-2">
                            <button onClick={() => updateApplicationStatus(app._id, 'Rejected')} className="px-5 py-2.5 rounded-xl font-bold text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Reject</button>
                            <button onClick={() => updateApplicationStatus(app._id, 'Accepted')} className="px-5 py-2.5 rounded-xl font-bold text-sm bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md">Accept Candidate</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredApplications.length === 0 && (
                  <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm max-w-2xl mx-auto">
                    <span className="text-4xl block mb-4">📥</span>
                    <h3 className="text-2xl font-black text-[#003049] mb-2">Inbox Empty</h3>
                    <p className="text-slate-500">You don't have any applications matching your filters.</p>
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 2: AI DISCOVER ================= */}
            {activeTab === 'discover' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredDiscovered.map((student) => (
                  <div key={student._id} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#7b2cbf]/5 to-[#f77f00]/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                    
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center shadow-md overflow-hidden border border-slate-200">
                          <img 
                            src={student.avatar ? getFullUrl(student.avatar) : '/default-avatar.svg'} 
                            alt="Avatar" 
                            className="w-full h-full object-cover" 
                            onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.svg'; }}
                          />
                        </div>
                        <div>
                          <h3 
                            onClick={() => navigate(`/user/${student._id}`)}
                            className="font-black text-xl text-[#003049] hover:text-[#f77f00] transition-colors cursor-pointer leading-tight"
                          >
                            {student.name}
                          </h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {student.university || 'Student'}
                          </p>
                        </div>
                      </div>
                      
                      {student.matchScore && (
                        <div className="bg-[#fcbf49]/10 border border-[#fcbf49]/30 text-[#f77f00] px-3 py-2 rounded-xl text-center shadow-sm">
                          <div className="text-xl font-black leading-none">{student.matchScore}%</div>
                          <div className="text-[8px] font-black uppercase tracking-widest mt-1">Match</div>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-2 mb-6 italic">
                      "{student.bio || 'Highly motivated student seeking research opportunities.'}"
                    </p>

                    <div className="mb-8">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Matched Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {student.skills?.slice(0, 5).map((skill, i) => (
                          <span key={i} className="text-[10px] font-bold text-[#7b2cbf] bg-[#7b2cbf]/10 border border-[#7b2cbf]/20 px-2 py-1 rounded-md">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-auto">
                      <button 
                        onClick={() => initiateChat(student._id)}
                        className="flex-1 bg-white border-2 border-[#003049] text-[#003049] py-3.5 rounded-xl font-black hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        Invite to Chat
                      </button>
                      <button 
                        onClick={() => navigate(`/user/${student._id}`)}
                        className="bg-[#003049] text-white px-6 py-3.5 rounded-xl font-bold hover:bg-[#f77f00] transition-colors shadow-md"
                      >
                        View Profile
                      </button>
                    </div>

                  </div>
                ))}

                {filteredDiscovered.length === 0 && (
                  <div className="col-span-full bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm max-w-2xl mx-auto">
                    <span className="text-4xl block mb-4">🔍</span>
                    <h3 className="text-2xl font-black text-[#003049] mb-2">No Matches Found</h3>
                    <p className="text-slate-500">The AI hasn't found any new students matching your active projects yet.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default TrackApplications;
