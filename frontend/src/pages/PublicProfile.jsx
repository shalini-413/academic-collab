// frontend/src/pages/PublicProfile.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { chatInitiationService } from '../shared/services/chatInitiationService';

const PublicProfile = () => {
  const { id } = useParams();
  const { token, user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [profProjects, setProfProjects] = useState([]);
  const [chatStatus, setChatStatus] = useState('None');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = userRes.data;
        
        const currentUserId = currentUser?.id || currentUser?._id;
        if (userData.role === 'Student' && userData.privacySettings?.profilePublic === false && currentUserId !== id) {
            toast.error("This student's profile is private.");
            navigate(-1);
            return;
        }
        
        setProfile(userData);

        if (userData.role === 'Professor') {
          const projRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects/professor/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProfProjects(projRes.data);
        }

        // Fetch Chat Status
        if (currentUserId !== id) {
          const chatRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/status/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setChatStatus(chatRes.data.status);
        }

      } catch (err) {
        toast.error("Profile not found or access denied.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchPublicData();
  }, [id, token, navigate, currentUser]);

 const handleChatClick = async () => {
    try {
      const result = await chatInitiationService.start({
        receiverId: profile._id,
        initialMessage: `Hi ${profile.name}, I am interested in connecting with you regarding your research.`
      });
      if (result.action === 'created' || result.action === 'reopened') toast.success("Message request sent!");
      navigate('/messages', { state: { activeUserId: result.partnerId || profile._id } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate chat.");
    }
  };

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL}${url}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-[#003049]">Loading profile...</div>;
  if (!profile) return null;

  const isProfessor = profile.role === 'Professor';
  const privacy = profile.privacySettings || {};
  const currentUserId = currentUser?.id || currentUser?._id;

  return (
    <div className="min-h-screen bg-[#fdfcfb] pb-20">
      
      {/* Profile Header */}
      <div className="bg-[#003049] pt-16 pb-24 px-8 text-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20 overflow-hidden shrink-0">
            <img src={profile.avatar ? getFullUrl(profile.avatar) : '/default-avatar.svg'} alt="Profile" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.svg'; }} />
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-black tracking-tight">{profile.name}</h1>
            <p className="text-[#fcbf49] font-bold tracking-widest uppercase text-sm mt-2">
              {isProfessor ? profile.designation || 'Professor' : 'Student'}
            </p>
            {(isProfessor || privacy.showUniversity !== false) && profile.university && (
              <p className="text-white/80 mt-2 text-lg">{profile.university}</p>
            )}
            {(isProfessor || privacy.showEmail === true) && profile.email && (
              <p className="text-white/60 mt-1 text-sm">{profile.email}</p>
            )}
          </div>

          {/* MESSAGE BUTTON */}
          {currentUserId !== profile._id && (
            <div className="mt-6 md:mt-0 md:ml-auto shrink-0">
              <button 
                onClick={handleChatClick}
                className="bg-[#f77f00] text-white px-8 py-3.5 rounded-2xl font-black shadow-xl hover:bg-orange-600 transition-all flex items-center gap-2 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                {chatStatus === 'None' || chatStatus === 'Rejected' ? 'Message ' + (isProfessor ? 'Professor' : 'Student') : 'Open Chat'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 -mt-12">
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100">
          
          {(isProfessor || privacy.showBio !== false) && profile.bio && (
            <section className="mb-10">
              <h3 className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-4">About / Bio</h3>
              <p className="text-slate-700 leading-relaxed text-lg">{profile.bio}</p>
            </section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {(isProfessor || privacy.showSkills !== false) && (
              <div>
                {profile.skills?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, i) => <span key={i} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium">{skill}</span>)}
                    </div>
                  </div>
                )}
                {profile.researchInterests?.length > 0 && (
                  <div>
                    <h3 className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-3">Research Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.researchInterests.map((interest, i) => <span key={i} className="bg-[#9d4edd]/10 text-[#7b2cbf] px-3 py-1.5 rounded-lg text-sm font-medium">{interest}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isProfessor && (
              <div>
                <h3 className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-3">Academic Links</h3>
                <div className="space-y-3">
                  {profile.googleScholar && (
                    <a href={profile.googleScholar} target="_blank" rel="noreferrer" className="block text-[#f77f00] hover:underline font-bold">Google Scholar Profile</a>
                  )}
                  {profile.publications?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-bold text-slate-700 mb-2">Publications:</h4>
                      <ul className="list-disc list-inside text-slate-600 text-sm space-y-1 ml-4">
                        {profile.publications.map((pub, i) => (
                          <li key={i}><a href={pub.link} target="_blank" rel="noreferrer" className="hover:text-[#f77f00] hover:underline">{pub.title}</a></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {isProfessor && (
          <div className="mt-12">
            <h2 className="text-2xl font-black text-[#003049] mb-6">Open Projects by {profile.name}</h2>
            {profProjects.length === 0 ? (
              <p className="text-slate-500 italic bg-white p-8 rounded-2xl border border-slate-100 text-center">No active projects at the moment.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profProjects.map(project => (
                  <Link to={`/project-view/${project._id}`} key={project._id} className="bg-white p-6 rounded-3xl border border-slate-100 hover:shadow-xl hover:border-[#f77f00]/30 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-[#003049] group-hover:text-[#f77f00] transition-colors">{project.title}</h3>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{project.status}</span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
                    <div className="mt-4 flex gap-2">
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold uppercase">{project.mode}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold uppercase">{project.isPaid ? 'Paid' : 'Unpaid'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
