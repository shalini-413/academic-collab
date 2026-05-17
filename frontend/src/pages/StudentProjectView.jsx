// frontend/src/pages/StudentProjectView.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { chatInitiationService } from '../shared/services/chatInitiationService';

const StudentProjectView = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);

  // Form State
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [additionalLinks, setAdditionalLinks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Application Status State
  const [applicationStatus, setApplicationStatus] = useState(null);

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL}${url}`;
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProject(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Project not found");
        navigate('/projects-feed');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, token, navigate]);

  useEffect(() => {
    const fetchApplicationStatus = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/applications/my-applications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const existingApp = res.data.find(
          (app) => (app.project._id || app.project) === id
        );

        if (existingApp) {
          setApplicationStatus(existingApp.status);
        }
      } catch (error) {
        console.error("Failed to fetch application status", error);
      }
    };

    if (token && id) {
      fetchApplicationStatus();
    }
  }, [id, token]);

  useEffect(() => {
    if (location.state?.openApply && !applicationStatus) {
      setShowApplyForm(true);
      setTimeout(() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' }), 200);
    }
  }, [location.state, applicationStatus]);

  const handleMessageClick = async () => {
    // SAFE ID EXTRACTION: Prevents crash if professor is string or object
    const profId = typeof project.professor === 'object' ? project.professor._id : project.professor;
    
    if (!profId) {
      toast.error("Professor information missing. Cannot start chat.");
      return;
    }

    try {
      const result = await chatInitiationService.start({
        receiverId: profId,
        projectId: id,
        initialMessage: `Hi, I am interested in your project "${project.title}". Would like to discuss further.`
      });
      if (result.action === 'created' || result.action === 'reopened') {
        toast.success("Message request sent!");
      }
      navigate('/messages', { state: { activeUserId: result.partnerId || profId } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate chat.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setResumeFile(file);
    } else {
      toast.error("Only PDF files are allowed");
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (project.status !== 'Open') {
      toast.error("This project is closed for new applications");
      return;
    }
    if (!coverLetter.trim()) {
      toast.error("Cover letter is required");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('projectId', id);
    formData.append('coverLetter', coverLetter.trim());
    
    if (resumeFile) formData.append('resume', resumeFile);
    if (additionalLinks.length > 0) formData.append('additionalLinks', JSON.stringify(additionalLinks));

    try {
      await axios.post(import.meta.env.VITE_API_URL + '/api/applications/apply', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });
      toast.success("Application submitted successfully!");
      setShowApplyForm(false);
      setApplicationStatus('Applied'); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#f77f00]"></div>
      </div>
    );
  }

  if (!project) return null;

  // SAFE ID EXTRACTION FOR THE "VIEW FULL PROFILE" LINK
  const profId = typeof project.professor === 'object' ? project.professor._id : project.professor;

  return (
    <div className="min-h-screen bg-[#fdfcfb] pb-20">
      
      {/* 1. HERO HEADER */}
      <div className="bg-[#003049] pt-12 pb-24 px-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f77f00] rounded-full blur-[150px] opacity-20 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="mb-6 text-sm font-bold text-white/60 hover:text-white flex items-center gap-2 uppercase tracking-widest transition-colors"
          >
            ← Back to Feed
          </button>
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="bg-[#f77f00] text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md">
              {project.status === 'Open' ? 'Accepting Applications' : 'Closed to Applications'}
            </span>
            <span className="bg-white/10 border border-white/20 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
              {project.mode || 'Remote'}
            </span>
            <span className="bg-white/10 border border-white/20 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
              {project.isPaid ? 'Paid Position' : 'Unpaid / Volunteer'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter max-w-4xl">
            {project.title}
          </h1>
        </div>
      </div>

      {/* 2. MAIN TWO-COLUMN LAYOUT */}
      <div className="max-w-6xl mx-auto px-6 -mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-slate-100">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
              Project Description
            </h2>
            <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {project.requiredSkills?.map((skill, i) => (
                    <span key={i} className="bg-slate-50 border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Research Fields</h3>
                <div className="flex flex-wrap gap-2">
                  {project.researchField?.map((field, i) => (
                    <span key={i} className="bg-[#7b2cbf]/10 border border-[#7b2cbf]/20 text-[#7b2cbf] px-4 py-2 rounded-xl text-xs font-bold shadow-sm">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {showApplyForm && !applicationStatus && (
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl border-2 border-[#f77f00]/30 scroll-mt-24" id="apply-form">
              <div className="mb-8 border-b border-slate-100 pb-6">
                <h2 className="text-2xl font-black text-[#003049]">Submit Your Application</h2>
                <p className="text-slate-500 font-medium mt-1">Stand out by explaining why you're the perfect fit.</p>
              </div>

              <form onSubmit={handleApply} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Cover Letter <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows="8"
                    placeholder="Dear Professor..."
                    className="w-full p-5 rounded-2xl border border-slate-200 focus:border-[#f77f00] focus:ring-4 focus:ring-[#f77f00]/10 outline-none resize-none transition-all text-slate-700"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Upload Resume (PDF)
                  </label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-full p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center hover:bg-slate-100 transition-colors">
                      <p className="font-bold text-[#003049]">{resumeFile ? resumeFile.name : 'Click or drag PDF to upload'}</p>
                      <p className="text-xs text-slate-400 mt-1">Maximum size: 5MB</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2 ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Additional Links</label>
                    <button type="button" onClick={() => setAdditionalLinks([...additionalLinks, { title: '', url: '' }])} className="text-[#f77f00] text-xs font-bold hover:underline">
                      + Add Link
                    </button>
                  </div>
                  <div className="space-y-3">
                    {additionalLinks.map((link, i) => (
                      <div key={i} className="flex gap-3">
                        <input 
                          type="text" 
                          placeholder="e.g. GitHub, Portfolio" 
                          value={link.title}
                          onChange={(e) => {
                            const updated = [...additionalLinks];
                            updated[i].title = e.target.value;
                            setAdditionalLinks(updated);
                          }}
                          className="flex-1 p-4 rounded-xl border border-slate-200 focus:border-[#f77f00] outline-none" 
                        />
                        <input 
                          type="url" 
                          placeholder="https://..." 
                          value={link.url}
                          onChange={(e) => {
                            const updated = [...additionalLinks];
                            updated[i].url = e.target.value;
                            setAdditionalLinks(updated);
                          }}
                          className="flex-[2] p-4 rounded-xl border border-slate-200 focus:border-[#f77f00] outline-none" 
                        />
                        <button type="button" onClick={() => setAdditionalLinks(additionalLinks.filter((_, idx) => idx !== i))} className="bg-red-50 text-red-500 px-4 rounded-xl font-bold hover:bg-red-100 transition-colors">
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-slate-100">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 bg-[#f77f00] hover:bg-orange-600 text-white py-4 rounded-xl font-black transition-all shadow-lg active:scale-95 disabled:opacity-70"
                  >
                    {isSubmitting ? "Sending..." : "Submit Application"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowApplyForm(false)}
                    className="px-8 py-4 bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Sticky Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-28 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col gap-3">
              
              {applicationStatus ? (
                <button
                  disabled
                  className={`w-full py-4 rounded-xl font-black shadow-md flex items-center justify-center gap-2 cursor-not-allowed text-white transition-all
                    ${
                      applicationStatus === 'Accepted' ? 'bg-emerald-600' :
                      applicationStatus === 'Rejected' ? 'bg-red-600' :
                      applicationStatus === 'Withdrawn' ? 'bg-slate-500' :
                      applicationStatus === 'Shortlisted' ? 'bg-amber-500' :
                      'bg-blue-400'
                    }
                  `}
                >
                  {applicationStatus === 'Applied' ? 'Application Pending' : `Status: ${applicationStatus}`}
                </button>
              ) : (
                <button 
                  onClick={() => {
                    if (project.status !== 'Open') {
                      toast.error("This project is closed for new applications");
                      return;
                    }
                    setShowApplyForm(true);
                    setTimeout(() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  disabled={project.status !== 'Open'}
                  className="w-full bg-[#003049] hover:bg-[#001f30] text-white py-4 rounded-xl font-black transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {project.status === 'Open' ? 'Apply Now' : 'Applications Closed'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              )}

              <button 
                onClick={handleMessageClick}
                className="w-full bg-white border-2 border-[#003049] text-[#003049] py-3.5 rounded-xl font-black hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                Message Professor
              </button>
              
              <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Duration</p>
                  <p className="font-bold text-[#003049]">{project.duration || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deadline</p>
                  <p className="font-bold text-red-500">
                    {project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}) : 'Rolling'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 group">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Posted By</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shadow-md overflow-hidden transform group-hover:rotate-6 transition-transform border border-slate-200">
                  <img 
                    src={project.professor?.avatar ? getFullUrl(project.professor.avatar) : '/default-avatar.svg'} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.svg'; }}
                  />
                </div>
                <div>
                  <h4 className="font-black text-lg text-[#003049] leading-tight">
                    {project.professor?.name || 'Faculty Member'}
                  </h4>
                  <p className="text-xs font-bold text-slate-500 mt-1">
                    {project.professor?.university || 'University'}
                  </p>
                </div>
              </div>
              <Link 
                to={profId ? `/user/${profId}` : '#'}
                onClick={(e) => {
                  if (!profId) {
                    e.preventDefault();
                    toast.error("Profile ID not found.");
                  }
                }}
                className="block text-center w-full bg-slate-50 text-slate-600 py-3 rounded-xl font-bold text-sm hover:bg-[#7b2cbf]/10 hover:text-[#7b2cbf] transition-colors"
              >
                View Full Profile
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProjectView;