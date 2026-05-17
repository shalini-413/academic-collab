// frontend/src/pages/Profile.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { token, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  
  // Upload States
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    university: '',
    bio: '',
    avatar: '',          
    resumeUrl: '',       
    skills: [],
    researchInterests: [],
    github: '',
    linkedin: '',
    portfolio: '',
    additionalLinks: [], 
    googleScholar: '',
    publications: []
  });
  
  const [isProfessor, setIsProfessor] = useState(false);

  // Helper function to render local upload URLs correctly
  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL}${url}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_API_URL + '/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data;
        
        setFormData({
          name: data.name || '',
          designation: data.designation || '',
          university: data.university || '',
          bio: data.bio || '',
          avatar: data.avatar || '',
          resumeUrl: data.resumeUrl || '',
          skills: Array.isArray(data.skills) ? data.skills : [],
          researchInterests: Array.isArray(data.researchInterests) ? data.researchInterests : [],
          github: data.github || '',
          linkedin: data.linkedin || '',
          portfolio: data.portfolio || '',
          additionalLinks: Array.isArray(data.additionalLinks) ? data.additionalLinks : [],
          googleScholar: data.googleScholar || '',
          publications: Array.isArray(data.publications) ? data.publications : []
        });
        
        setIsProfessor(data.role === 'Professor');
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  // ==========================================
  // LOCAL SERVER UPLOAD HANDLER
  // ==========================================
  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (type === 'image' && !file.type.startsWith('image/')) {
      return toast.error("Please upload a valid image file.");
    }
    if (type === 'raw' && file.type !== 'application/pdf') {
      return toast.error("Please upload a valid PDF file.");
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("File size must be less than 5MB");
    }

    const isAvatar = type === 'image';
    isAvatar ? setUploadingAvatar(true) : setUploadingResume(true);
    const toastId = toast.loading(`Uploading ${isAvatar ? 'avatar' : 'resume'}...`);

    // Prepare Multipart Form Data
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      // Send to our new local backend upload route
      const res = await axios.post(import.meta.env.VITE_API_URL + '/api/upload', uploadData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      setFormData(prev => ({
        ...prev,
        [isAvatar ? 'avatar' : 'resumeUrl']: res.data.url
      }));
      
      toast.success("Upload complete!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file", { id: toastId });
    } finally {
      isAvatar ? setUploadingAvatar(false) : setUploadingResume(false);
    }
  };

  // ==========================================
  // UI HANDLERS
  // ==========================================
  const addTag = (field, value) => {
    if (!value || !value.trim()) return;
    if (formData[field].includes(value.trim())) {
      toast.error("Already added!");
      return;
    }
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()]
    }));
  };

  const removeTag = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const savePromise = axios.put(import.meta.env.VITE_API_URL + '/api/auth/profile', {
      ...formData,
      skills: Array.isArray(formData.skills) ? formData.skills : [],
      researchInterests: Array.isArray(formData.researchInterests) ? formData.researchInterests : [],
      publications: Array.isArray(formData.publications) ? formData.publications : [],
      additionalLinks: Array.isArray(formData.additionalLinks) ? formData.additionalLinks : []
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.promise(savePromise, {
      loading: 'Saving profile...',
      success: 'Profile updated successfully!',
      error: 'Failed to save profile.'
    });

    try {
      const res = await savePromise;
      if (res.data.user) {
        setFormData(prev => ({ ...prev, ...res.data.user }));
        setUser({ name: res.data.user.name, avatar: res.data.user.avatar });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfcfb] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#9d4edd]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcfb] pb-20">
      
      {/* 1. HERO HEADER WITH AVATAR UPLOAD */}
      <div className="bg-[#003049] pt-16 pb-32 px-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-10 w-96 h-96 bg-[#7b2cbf] rounded-full blur-[120px] opacity-30 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
          
          {/* Avatar Upload Container */}
          <div className="relative group cursor-pointer shrink-0">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#7b2cbf] to-[#f77f00] flex items-center justify-center text-white text-5xl font-black shadow-2xl border-4 border-white/10 overflow-hidden">
              {formData.avatar ? (
                <img src={getFullUrl(formData.avatar)} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                formData.name ? formData.name[0].toUpperCase() : 'U'
              )}
            </div>
            
            <div className={`absolute inset-0 rounded-3xl bg-black/60 flex flex-col items-center justify-center transition-all ${uploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              {uploadingAvatar ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <svg className="w-6 h-6 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Update</span>
                </>
              )}
            </div>
            
            <input 
              type="file" 
              accept="image/*" 
              disabled={uploadingAvatar}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
              onChange={(e) => handleFileUpload(e, 'image')} 
            />
          </div>

          <div className="text-center sm:text-left mt-2">
            <h1 className="text-4xl font-black tracking-tighter mb-1">My Settings</h1>
            <p className="text-white/70 font-medium">Manage your personal and academic information</p>
          </div>
        </div>
      </div>

      {/* 2. FORM CONTAINER */}
      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-20">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SECTION 1: Personal Details */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-slate-100">
            <h2 className="text-xl font-black text-[#003049] mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#f77f00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#f77f00] focus:ring-4 focus:ring-[#f77f00]/10 outline-none transition-all font-medium text-slate-700" 
                  required
                />
              </div>

              {isProfessor && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Designation</label>
                  <input 
                    type="text" 
                    value={formData.designation} 
                    onChange={e => setFormData({...formData, designation: e.target.value})} 
                    placeholder="e.g. Assistant Professor" 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#f77f00] focus:ring-4 focus:ring-[#f77f00]/10 outline-none transition-all font-medium text-slate-700" 
                  />
                </div>
              )}

              <div className={isProfessor ? "md:col-span-2" : ""}>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">University / Institution</label>
                <input 
                  type="text" 
                  value={formData.university} 
                  onChange={e => setFormData({...formData, university: e.target.value})} 
                  placeholder="e.g. NSUT"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#f77f00] focus:ring-4 focus:ring-[#f77f00]/10 outline-none transition-all font-medium text-slate-700" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Bio / Research Summary</label>
                <textarea 
                  rows="4" 
                  value={formData.bio} 
                  onChange={e => setFormData({...formData, bio: e.target.value})} 
                  placeholder="Tell colleagues about yourself and your research goals..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#f77f00] focus:ring-4 focus:ring-[#f77f00]/10 outline-none transition-all font-medium text-slate-700 resize-none" 
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Academic Profile (Skills & Interests & Resume) */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-slate-100">
            <h2 className="text-xl font-black text-[#003049] mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#9d4edd]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              Academic Profile
            </h2>

            <div className="space-y-8">
              {/* Resume Upload (Student Only) */}
              {!isProfessor && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Master Resume (PDF)</label>
                  {formData.resumeUrl ? (
                    <div className="flex items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 text-red-500 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                        </div>
                        <div>
                          <a href={getFullUrl(formData.resumeUrl)} target="_blank" rel="noreferrer" className="font-bold text-[#003049] hover:text-[#f77f00] hover:underline">View Uploaded Resume</a>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Active File</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, resumeUrl: ''})}
                        className="text-red-500 font-bold text-sm bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input 
                        type="file" 
                        accept=".pdf"
                        disabled={uploadingResume}
                        onChange={(e) => handleFileUpload(e, 'raw')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                      />
                      <div className="w-full p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center hover:bg-slate-100 transition-colors">
                        {uploadingResume ? (
                          <div className="flex items-center justify-center gap-3 text-[#f77f00] font-bold">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#f77f00]"></div>
                            Uploading PDF...
                          </div>
                        ) : (
                          <>
                            <p className="font-bold text-[#003049]">Click or drag PDF to upload resume</p>
                            <p className="text-xs text-slate-400 mt-1">Maximum size: 5MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Skills */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Technical Skills</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.skills.map((skill, i) => (
                    <span key={i} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 group">
                      {skill}
                      <button type="button" onClick={() => removeTag('skills', i)} className="text-slate-400 group-hover:text-red-500 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </span>
                  ))}
                </div>
                <input 
                  type="text" 
                  placeholder="Type a skill and press Enter..." 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#f77f00] outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400" 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag('skills', e.target.value);
                      e.target.value = '';
                    }
                  }} 
                />
              </div>

              {/* Research Interests */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Research Interests</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.researchInterests.map((interest, i) => (
                    <span key={i} className="bg-[#7b2cbf]/10 text-[#7b2cbf] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 group border border-[#7b2cbf]/20">
                      {interest}
                      <button type="button" onClick={() => removeTag('researchInterests', i)} className="text-[#7b2cbf]/50 group-hover:text-red-500 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </span>
                  ))}
                </div>
                <input 
                  type="text" 
                  placeholder="Type a research field and press Enter..." 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#f77f00] outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400" 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag('researchInterests', e.target.value);
                      e.target.value = '';
                    }
                  }} 
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: External Links & Publications */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-slate-100">
            <h2 className="text-xl font-black text-[#003049] mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
              Links & Publications
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* STUDENT LINKS */}
              {!isProfessor && (
                <>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">GitHub Profile</label>
                    <input type="url" value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})} placeholder="https://github.com/..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#f77f00] outline-none font-medium text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">LinkedIn Profile</label>
                    <input type="url" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} placeholder="https://linkedin.com/in/..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#f77f00] outline-none font-medium text-slate-700" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Personal Portfolio</label>
                    <input type="url" value={formData.portfolio} onChange={e => setFormData({...formData, portfolio: e.target.value})} placeholder="https://yourwebsite.com" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#f77f00] outline-none font-medium text-slate-700" />
                  </div>

                  {/* Dynamic Additional Links */}
                  <div className="md:col-span-2">
                    <div className="flex justify-between items-end mb-3 ml-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Additional Links</label>
                      <button type="button" onClick={() => setFormData(prev => ({...prev, additionalLinks: [...prev.additionalLinks, {title: '', url: ''}]}))} className="text-[#f77f00] text-xs font-bold hover:underline">
                        + Add Link
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {formData.additionalLinks.map((link, i) => (
                        <div key={i} className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <input 
                            type="text" 
                            placeholder="Link Title (e.g. Behance)" 
                            value={link.title || ''} 
                            onChange={(e) => {
                              const updated = [...formData.additionalLinks];
                              updated[i].title = e.target.value;
                              setFormData({...formData, additionalLinks: updated});
                            }} 
                            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#f77f00] outline-none text-sm" 
                          />
                          <input 
                            type="url" 
                            placeholder="URL" 
                            value={link.url || ''} 
                            onChange={(e) => {
                              const updated = [...formData.additionalLinks];
                              updated[i].url = e.target.value;
                              setFormData({...formData, additionalLinks: updated});
                            }} 
                            className="flex-[1.5] px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#f77f00] outline-none text-sm" 
                          />
                          <button 
                            type="button" 
                            onClick={() => {
                              const updated = formData.additionalLinks.filter((_, idx) => idx !== i);
                              setFormData({...formData, additionalLinks: updated});
                            }} 
                            className="bg-red-50 text-red-500 px-4 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* PROFESSOR LINKS */}
              {isProfessor && (
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Google Scholar URL</label>
                    <input type="url" value={formData.googleScholar} onChange={e => setFormData({...formData, googleScholar: e.target.value})} placeholder="https://scholar.google.com/..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#f77f00] outline-none font-medium text-slate-700" />
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-3 ml-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Notable Publications</label>
                      <button type="button" onClick={() => setFormData(prev => ({...prev, publications: [...prev.publications, {title: '', link: ''}]}))} className="text-[#f77f00] text-xs font-bold hover:underline">
                        + Add Publication
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {formData.publications.map((pub, i) => (
                        <div key={i} className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <input 
                            type="text" 
                            placeholder="Publication Title" 
                            value={pub.title || ''} 
                            onChange={(e) => {
                              const updated = [...formData.publications];
                              updated[i].title = e.target.value;
                              setFormData({...formData, publications: updated});
                            }} 
                            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#f77f00] outline-none text-sm" 
                          />
                          <input 
                            type="url" 
                            placeholder="Link (URL)" 
                            value={pub.link || ''} 
                            onChange={(e) => {
                              const updated = [...formData.publications];
                              updated[i].link = e.target.value;
                              setFormData({...formData, publications: updated});
                            }} 
                            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#f77f00] outline-none text-sm" 
                          />
                          <button 
                            type="button" 
                            onClick={() => {
                              const updated = formData.publications.filter((_, idx) => idx !== i);
                              setFormData({...formData, publications: updated});
                            }} 
                            className="bg-red-50 text-red-500 px-4 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors"
                          >
                            X
                          </button>
                        </div>
                      ))}
                      {formData.publications.length === 0 && (
                        <p className="text-slate-400 text-sm italic py-2">No publications added yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full bg-[#003049] hover:bg-[#f77f00] text-white py-5 rounded-2xl font-black text-xl transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Save Profile Changes
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default Profile;