// frontend/src/components/ProjectForm.jsx
import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProjectForm = ({ onProjectCreated }) => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    researchField: '',
    duration: '',
    isPaid: false,
    mode: 'Remote',
    deadline: '',
    applicantLimit: 0,
    visibility: 'Public'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        researchField: formData.researchField.split(',').map(s => s.trim()).filter(Boolean)
      };

      await axios.post(import.meta.env.VITE_API_URL + '/api/projects/create', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Project posted successfully!");
      onProjectCreated();
      setFormData({
        title: '',
        description: '',
        requiredSkills: '',
        researchField: '',
        duration: '',
        isPaid: false,
        mode: 'Remote',
        deadline: '',
        applicantLimit: 0,
        visibility: 'Public'
      });
    } catch (err) {
      toast.error("Failed to post project");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 space-y-8">
      <h2 className="text-3xl font-black text-[#003049]">Post New Research Project</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-semibold mb-2">Project Title</label>
          <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-4 border border-slate-200 rounded-2xl" required />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Duration</label>
          <input type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="3 months" className="w-full p-4 border border-slate-200 rounded-2xl" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Description</label>
        <textarea rows="5" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 border border-slate-200 rounded-2xl" required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-semibold mb-2">Required Skills (comma separated)</label>
          <input type="text" value={formData.requiredSkills} onChange={e => setFormData({...formData, requiredSkills: e.target.value})} placeholder="Python, Machine Learning, NLP" className="w-full p-4 border border-slate-200 rounded-2xl" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Research Field</label>
          <input type="text" value={formData.researchField} onChange={e => setFormData({...formData, researchField: e.target.value})} placeholder="AI, Computer Vision" className="w-full p-4 border border-slate-200 rounded-2xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div>
          <label className="block text-sm font-semibold mb-2">Mode</label>
          <select value={formData.mode} onChange={e => setFormData({...formData, mode: e.target.value})} className="w-full p-4 border border-slate-200 rounded-2xl">
            <option value="Remote">Remote</option>
            <option value="On-site">On-site</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Paid / Unpaid</label>
          <select value={formData.isPaid} onChange={e => setFormData({...formData, isPaid: e.target.value === 'true'})} className="w-full p-4 border border-slate-200 rounded-2xl">
            <option value="false">Unpaid</option>
            <option value="true">Paid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Deadline</label>
          <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full p-4 border border-slate-200 rounded-2xl" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Applicant Limit</label>
          <input type="number" min="0" value={formData.applicantLimit} onChange={e => setFormData({...formData, applicantLimit: e.target.value})} className="w-full p-4 border border-slate-200 rounded-2xl" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Visibility</label>
          <select value={formData.visibility} onChange={e => setFormData({...formData, visibility: e.target.value})} className="w-full p-4 border border-slate-200 rounded-2xl">
            <option>Public</option>
            <option>Invite-only</option>
            <option>Hidden</option>
          </select>
        </div>
      </div>

      <button type="submit" className="w-full bg-[#003049] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#f77f00] transition-all">
        Post Project
      </button>
    </form>
  );
};

export default ProjectForm;
