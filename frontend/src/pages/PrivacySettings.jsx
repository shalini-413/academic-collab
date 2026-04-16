// frontend/src/pages/PrivacySettings.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const PrivacySettings = () => {
  const { token } = useContext(AuthContext);
  const [settings, setSettings] = useState({
    profilePublic: true,
    showEmail: false,
    showUniversity: true,
    showSkills: true,
    showBio: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSettings(res.data.privacySettings || settings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const saveSettings = async () => {
    try {
      await axios.put('http://localhost:5000/api/auth/profile', {
        privacySettings: settings
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Privacy settings saved successfully!");
    } catch (err) {
      toast.error("Failed to save settings");
    }
  };

  if (loading) return <div className="p-20 text-center">Loading privacy settings...</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-[#003049] tracking-tighter">Privacy Settings</h1>
        <p className="text-slate-500 mt-3">Control what others can see on your profile</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-10 space-y-8">
        
        {/* Profile Visibility */}
        <div className="flex items-center justify-between py-4 border-b">
          <div>
            <h3 className="font-semibold text-lg">Make Profile Public</h3>
            <p className="text-slate-500 text-sm">Allow other users to view your full profile</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.profilePublic} 
              onChange={() => handleToggle('profilePublic')}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003049]"></div>
          </label>
        </div>

        {/* Show Email */}
        <div className="flex items-center justify-between py-4 border-b">
          <div>
            <h3 className="font-semibold text-lg">Show Email Address</h3>
            <p className="text-slate-500 text-sm">Allow others to see your email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.showEmail} 
              onChange={() => handleToggle('showEmail')}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003049]"></div>
          </label>
        </div>

        {/* Show University */}
        <div className="flex items-center justify-between py-4 border-b">
          <div>
            <h3 className="font-semibold text-lg">Show University</h3>
            <p className="text-slate-500 text-sm">Display your university on profile</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.showUniversity} 
              onChange={() => handleToggle('showUniversity')}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003049]"></div>
          </label>
        </div>

        {/* Show Skills */}
        <div className="flex items-center justify-between py-4 border-b">
          <div>
            <h3 className="font-semibold text-lg">Show Skills</h3>
            <p className="text-slate-500 text-sm">Make your skills visible to others</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.showSkills} 
              onChange={() => handleToggle('showSkills')}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003049]"></div>
          </label>
        </div>

        {/* Show Bio */}
        <div className="flex items-center justify-between py-4">
          <div>
            <h3 className="font-semibold text-lg">Show Bio / Research Summary</h3>
            <p className="text-slate-500 text-sm">Display your bio on profile</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.showBio} 
              onChange={() => handleToggle('showBio')}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003049]"></div>
          </label>
        </div>

        <button 
          onClick={saveSettings}
          className="mt-10 w-full bg-[#003049] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#f77f00] transition-all"
        >
          Save Privacy Settings
        </button>
      </div>
    </div>
  );
};

export default PrivacySettings;