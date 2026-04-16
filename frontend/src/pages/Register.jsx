// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'Student', skills: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Checkpoint: Convert string "React, Node" into ["React", "Node"]
      const submissionData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== "")
      };
      
      const res = await axios.post('http://localhost:5000/api/auth/register', submissionData);
      alert(res.data.message);
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2rem] shadow-xl w-full max-w-md space-y-4">
        <h2 className="text-3xl font-black text-[#003049] text-center">Create Account</h2>
        <input type="text" placeholder="Full Name" className="w-full p-4 bg-slate-100 rounded-xl" onChange={e => setFormData({...formData, name: e.target.value})} required />
        <input type="email" placeholder="Email" className="w-full p-4 bg-slate-100 rounded-xl" onChange={e => setFormData({...formData, email: e.target.value})} required />
        <input type="password" placeholder="Password" className="w-full p-4 bg-slate-100 rounded-xl" onChange={e => setFormData({...formData, password: e.target.value})} required />
        <select className="w-full p-4 bg-slate-100 rounded-xl" onChange={e => setFormData({...formData, role: e.target.value})}>
          <option value="Student">Student</option>
          <option value="Professor">Professor</option>
        </select>
        <input type="text" placeholder="Skills (comma separated)" className="w-full p-4 bg-slate-100 rounded-xl" onChange={e => setFormData({...formData, skills: e.target.value})} />
        <button className="w-full py-4 bg-[#003049] text-white rounded-xl font-black uppercase tracking-widest hover:bg-[#f77f00] transition-all">Register</button>
      </form>
    </div>
  );
};

export default Register;