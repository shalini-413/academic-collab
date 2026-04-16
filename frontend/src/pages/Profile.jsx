// frontend/src/pages/Profile.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { token } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    university: '',
    bio: '',
    skills: [],
    researchInterests: [],
    github: '',
    linkedin: '',
    portfolio: '',
    googleScholar: '',
    publications: []
  });

  const [isProfessor, setIsProfessor] = useState(false);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = res.data;

        setFormData({
          name: data.name || '',
          designation: data.designation || '',
          university: data.university || '',
          bio: data.bio || '',
          skills: Array.isArray(data.skills) ? data.skills : [],
          researchInterests: Array.isArray(data.researchInterests) ? data.researchInterests : [],
          github: data.github || '',
          linkedin: data.linkedin || '',
          portfolio: data.portfolio || '',
          googleScholar: data.googleScholar || '',
          publications: Array.isArray(data.publications) ? data.publications : []
        });

        setIsProfessor(data.role === 'Professor');
      } catch (err) {
        toast.error("Failed to load profile");
      }
    };

    fetchProfile();
  }, [token]);

  // Add tag
  const addTag = (field, value) => {
    if (!value || !value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()]
    }));
  };

  // Remove tag
  const removeTag = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const payload = {
        ...formData,
        skills: Array.isArray(formData.skills) ? formData.skills : [],
        researchInterests: Array.isArray(formData.researchInterests) ? formData.researchInterests : [],
        publications: Array.isArray(formData.publications) ? formData.publications : []
      };
  
      const res = await axios.put('http://localhost:5000/api/auth/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      // Reload fresh data from server
      const freshData = res.data;
      setFormData({
        name: freshData.name || '',
        designation: freshData.designation || '',
        university: freshData.university || '',
        bio: freshData.bio || '',
        skills: Array.isArray(freshData.skills) ? freshData.skills : [],
        researchInterests: Array.isArray(freshData.researchInterests) ? freshData.researchInterests : [],
        github: freshData.github || '',
        linkedin: freshData.linkedin || '',
        portfolio: freshData.portfolio || '',
        googleScholar: freshData.googleScholar || '',
        publications: Array.isArray(freshData.publications) ? freshData.publications : []
      });
  
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to save profile");
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-[#003049] px-12 py-12 text-white">
          <h1 className="text-4xl font-black tracking-tighter">My Academic Profile</h1>
          <p className="text-white/80 mt-2">Keep your profile updated</p>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-12">

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="text-sm font-semibold text-slate-500 block mb-2">Full Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 border border-slate-200 rounded-2xl focus:border-[#f77f00]" />
            </div>

            {isProfessor && (
              <div>
                <label className="text-sm font-semibold text-slate-500 block mb-2">Designation</label>
                <input type="text" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="Assistant Professor" className="w-full p-4 border border-slate-200 rounded-2xl focus:border-[#f77f00]" />
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-500 block mb-2">University</label>
            <input type="text" value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} className="w-full p-4 border border-slate-200 rounded-2xl focus:border-[#f77f00]" />
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm font-semibold text-slate-500 block mb-2">Bio / Research Summary</label>
            <textarea rows="5" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full p-4 border border-slate-200 rounded-2xl focus:border-[#f77f00]" />
          </div>

          {/* Skills */}
          <div>
            <label className="text-sm font-semibold text-slate-500 block mb-3">Skills</label>
            <div className="flex flex-wrap gap-3 mb-4">
              {formData.skills.map((skill, i) => (
                <span key={i} className="bg-[#f77f00]/10 text-[#f77f00] px-5 py-2 rounded-2xl flex items-center gap-2">
                  {skill}
                  <button type="button" onClick={() => removeTag('skills', i)} className="text-red-500">×</button>
                </span>
              ))}
            </div>
            <input 
              type="text" 
              placeholder="Add skill and press Enter" 
              className="w-full p-4 border border-slate-200 rounded-2xl focus:border-[#f77f00]" 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag('skills', e.target.value);
                  e.target.value = '';
                }
              }} 
            />
          </div>

          {/* Research Interests - Fixed Version */}
          <div>
            <label className="text-sm font-semibold text-slate-500 block mb-3">Research Interests</label>
            <div className="flex flex-wrap gap-3 mb-4">
              {formData.researchInterests.map((interest, i) => (
                <span key={i} className="bg-[#003049]/10 text-[#003049] px-5 py-2 rounded-2xl flex items-center gap-2">
                  {interest}
                  <button type="button" onClick={() => removeTag('researchInterests', i)} className="text-red-500">×</button>
                </span>
              ))}
            </div>
            <input 
              type="text" 
              placeholder="Add research interest and press Enter" 
              className="w-full p-4 border border-slate-200 rounded-2xl focus:border-[#f77f00]" 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag('researchInterests', e.target.value);
                  e.target.value = '';
                }
              }} 
            />
          </div>

          {/* Professor Specific */}
          {isProfessor && (
            <>
              <div>
                <label className="text-sm font-semibold text-slate-500 block mb-2">Google Scholar</label>
                <input type="url" value={formData.googleScholar} onChange={e => setFormData({...formData, googleScholar: e.target.value})} className="w-full p-4 border border-slate-200 rounded-2xl focus:border-[#f77f00]" />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-500 block mb-3">Publications</label>
                {formData.publications.map((pub, i) => (
                  <div key={i} className="flex gap-4 mb-4">
                    <input type="text" placeholder="Title" value={pub.title || ''} onChange={(e) => {
                      const updated = [...formData.publications];
                      updated[i].title = e.target.value;
                      setFormData({...formData, publications: updated});
                    }} className="flex-1 p-4 border border-slate-200 rounded-2xl" />
                    <input type="url" placeholder="Link" value={pub.link || ''} onChange={(e) => {
                      const updated = [...formData.publications];
                      updated[i].link = e.target.value;
                      setFormData({...formData, publications: updated});
                    }} className="flex-1 p-4 border border-slate-200 rounded-2xl" />
                  </div>
                ))}
                <button type="button" onClick={() => setFormData(prev => ({...prev, publications: [...prev.publications, {title: '', link: ''}]}))} className="text-[#f77f00] text-sm font-medium">+ Add Publication</button>
              </div>
            </>
          )}

          <button type="submit" className="w-full bg-[#003049] hover:bg-[#f77f00] text-white py-5 rounded-2xl font-black text-lg transition-all">
            Save All Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;