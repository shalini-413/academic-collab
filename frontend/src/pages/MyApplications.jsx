// frontend/src/pages/MyApplications.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MyApplications = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [expandedApp, setExpandedApp] = useState(null); // Track which cover letter is expanded

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/applications/my-applications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(res.data);
      } catch (err) {
        toast.error("Failed to load your applications");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchApplications();
  }, [token]);

  const filteredApplications = applications.filter(app => 
    filter === 'All' || app.status === filter
  );

  const toggleCoverLetter = (appId) => {
    setExpandedApp(expandedApp === appId ? null : appId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted': return 'bg-green-100 text-green-700 border border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border border-red-200';
      case 'Shortlisted': return 'bg-amber-100 text-amber-700 border border-amber-200';
      default: return 'bg-blue-100 text-blue-700 border border-blue-200';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]">Loading your applications...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-[#003049] tracking-tighter">My Applications</h1>
        <p className="text-slate-500 mt-2">Track status of all your project applications</p>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 mb-8 border-b pb-6">
        {['All', 'Applied', 'Shortlisted', 'Accepted', 'Rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-3 rounded-2xl font-semibold text-sm transition-all ${
              filter === status 
                ? 'bg-[#003049] text-white shadow-md' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredApplications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border">
          <p className="text-slate-400">No applications found in this filter.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredApplications.map((app) => (
            <div 
              key={app._id} 
              className="bg-white rounded-3xl border border-slate-100 p-8 hover:shadow-xl transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#003049]">{app.project?.title}</h3>
                  <p className="text-slate-600 mt-3 line-clamp-3">{app.project?.description}</p>

                  <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                    <div>
                      <span className="text-xs text-slate-400 block">Applied On</span>
                      <span className="font-medium">{new Date(app.appliedAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    {app.studentSnapshot?.university && (
                      <div>
                        <span className="text-xs text-slate-400 block">University</span>
                        <span className="font-medium">{app.studentSnapshot.university}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`px-6 py-2.5 rounded-2xl text-sm font-bold self-start ${getStatusColor(app.status)}`}>
                  {app.status}
                </div>
              </div>

              {/* Cover Letter Section - Inline Expandable */}
              {app.coverLetter && (
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <div 
                    onClick={() => toggleCoverLetter(app._id)}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <span className="font-semibold text-slate-700 group-hover:text-[#003049]">
                      Cover Letter
                    </span>
                    <span className="text-[#f77f00] text-sm">
                      {expandedApp === app._id ? 'Hide ▲' : 'Show ▼'}
                    </span>
                  </div>

                  {expandedApp === app._id && (
                    <div className="mt-4 p-6 bg-slate-50 rounded-2xl text-slate-700 leading-relaxed border border-slate-100">
                      {app.coverLetter}
                    </div>
                  )}
                </div>
              )}

              {/* Resume Link */}
              {app.resumeUrl && (
                <div className="mt-6">
                  <a 
                    href={app.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#f77f00] hover:underline font-medium"
                  >
                    📄 View Resume
                  </a>
                </div>
              )}

              {/* Additional Links */}
              {app.additionalLinks && app.additionalLinks.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-bold text-slate-400 mb-3">ADDITIONAL LINKS</p>
                  <div className="flex flex-wrap gap-3">
                    {app.additionalLinks.map((link, i) => (
                      <a 
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-50 hover:bg-slate-100 px-5 py-2.5 rounded-2xl text-sm transition-colors"
                      >
                        {link.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;