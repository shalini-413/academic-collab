import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const AdminSecretRegister = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // We hardcode the role to 'Admin' here
      await axios.post(import.meta.env.VITE_API_URL + '/api/auth/register', {
        ...formData,
        role: 'Admin'
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Admin registration failed.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md text-white border-t-4 border-red-500">
        <h2 className="text-2xl font-bold text-center mb-2">Internal Admin Portal</h2>
        <p className="text-slate-400 text-center text-sm mb-6">Restricted Access Only</p>
        
        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-900/50 border border-green-500 text-green-200 p-3 rounded mb-4 text-sm">Admin created! Redirecting to login...</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2">Admin Full Name</label>
            <input type="text" name="name" onChange={handleChange} required className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white" />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2">Secure Email</label>
            <input type="email" name="email" onChange={handleChange} required className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white" />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-bold mb-2">Master Password</label>
            <input type="password" name="password" onChange={handleChange} required className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white" />
          </div>
          <button type="submit" className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300 shadow-lg">
            Initialize Admin Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSecretRegister;