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
  const [expandedApp, setExpandedApp] = useState(null);

  useEffect(() => {
    if (token) fetchApplications();
  }, [token]);

  const filteredApplications = applications.filter(app => 
    filter === 'All' || app.status === filter
  );

  const toggleCoverLetter = (appId) => {
    setExpandedApp(expandedApp === appId ? null : appId);
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/api/applications/my-applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data);
    } catch (err) {
      toast.error("Failed to load your applications");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm("Are you sure you want to withdraw this application?")) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/applications/status`, 
      { applicationId, status: 'Withdrawn' }, 
      { headers: { Authorization: `Bearer ${token}` }});
      toast.success("Application withdrawn successfully!");
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to withdraw application");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Rejected: 'bg-rose-100 text-rose-800 border-rose-200',
      Shortlisted: 'bg-amber-100 text-amber-800 border-amber-200',
      Applied: 'bg-blue-100 text-blue-800 border-blue-200',
      Withdrawn: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.Applied}`}>
        {status === 'Accepted' && <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
        {status === 'Rejected' && <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4 bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">
            My Applications
          </h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">Track and manage the status of your research project applications.</p>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm inline-flex">
          {['All', 'Applied', 'Shortlisted', 'Accepted', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                filter === status 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
               <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">No applications found</h3>
            <p className="text-slate-500 mt-1">You haven't applied to any projects matching this filter.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((app) => (
              <div 
                key={app._id} 
                className="group bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 relative overflow-hidden"
              >
                {/* Decorative side accent */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  app.status === 'Accepted' ? 'bg-emerald-500' : 
                  app.status === 'Rejected' ? 'bg-rose-500' : 
                  app.status === 'Shortlisted' ? 'bg-amber-500' : 'bg-blue-500'
                }`}></div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pl-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusBadge(app.status)}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {app.project?.title || 'Project Untitled'}
                    </h3>
                    <p className="text-slate-600 mt-3 line-clamp-2 text-sm leading-relaxed">
                      {app.project?.description || 'No description available for this project.'}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-4 sm:gap-8 text-sm">
                      <div className="flex items-center text-slate-500">
                        <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="font-medium text-slate-700">{new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      {app.studentSnapshot?.university && (
                        <div className="flex items-center text-slate-500">
                          <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                          <span className="font-medium text-slate-700">{app.studentSnapshot.university}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0 mt-4 md:mt-0">
{/* Example logic for MyApplications.jsx */}
{app.status === 'Accepted' ? (
  <button 
    onClick={() => navigate(`/workspace/${app.project._id}`)}
    className="bg-[#003049] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#f77f00] transition-colors shadow-md"
  >
    Enter Workspace →
  </button>
) : (
  <span className="text-xs font-bold text-slate-500">{app.status}</span>
)}
                    
                    {(app.status === 'Applied' || app.status === 'Shortlisted') && (
                      <button 
                        onClick={() => handleWithdraw(app._id)}
                        className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-wider py-2"
                      >
                        Withdraw Application
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4 sm:items-center justify-between pl-2">
                   {/* Documents & Links */}
                   <div className="flex flex-wrap gap-4 items-center">
                      {app.resumeUrl && (
                        <a 
                          href={app.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors bg-blue-50 px-3 py-1.5 rounded-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          View Resume
                        </a>
                      )}
                      
                      {app.additionalLinks?.map((link, i) => (
                        <a 
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                          {link.title}
                        </a>
                      ))}
                   </div>

                   {/* Cover Letter Toggle */}
                   {app.coverLetter && (
                    <button 
                      onClick={() => toggleCoverLetter(app._id)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors focus:outline-none ml-auto"
                    >
                      {expandedApp === app._id ? 'Hide Cover Letter' : 'Show Cover Letter'}
                      <svg className={`w-4 h-4 transition-transform duration-200 ${expandedApp === app._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                   )}
                </div>

                {/* Animated Expandable Cover Letter */}
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${expandedApp === app._id ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}
                >
                  <div className="overflow-hidden">
                    <div className="p-5 bg-slate-50 rounded-xl text-sm text-slate-700 leading-relaxed border border-slate-200 pl-2 ml-2">
                      <p className="font-semibold text-slate-900 mb-2">Cover Letter</p>
                      <p className="whitespace-pre-wrap">{app.coverLetter}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;