import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    
    if (result.success) {
      // Redirect based on role
      if (result.role === 'Student') navigate('/student-dashboard');
      else if (result.role === 'Professor') navigate('/professor-dashboard');
      else if (result.role === 'Admin') navigate('/admin-dashboard');
    } else {
      setError(result.message);
    }
  };

return (
  <div className="min-h-[85vh] flex items-center justify-center p-6">
    <div className="w-full max-w-md premium-card overflow-hidden">
      {/* Decorative Brand Header */}
      <div className="bg-brand-navy p-12 text-center relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 rounded-full -mr-16 -mt-16"></div>
        <h2 className="text-4xl font-extrabold text-white tracking-tighter">Welcome.</h2>
        <p className="text-brand-yellow font-bold uppercase tracking-[0.3em] text-[10px] mt-4">Authorized Access</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-10 space-y-8">
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-widest ml-1 opacity-60">University ID</label>
          <input 
            type="email" 
            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-brand-orange focus:bg-white outline-none transition-all font-medium"
            placeholder="admin@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-widest ml-1 opacity-60">Security Key</label>
          <input 
            type="password" 
            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-brand-orange focus:bg-white outline-none transition-all font-medium"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn-primary w-full py-5 text-lg">Sign In</button>
      </form>
    </div>
  </div>
);
};

export default Login;