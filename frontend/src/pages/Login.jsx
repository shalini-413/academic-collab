import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Authenticating...');
    try {
      // login now returns the result of the API call
      const result = await login(formData.email, formData.password);
      
      toast.dismiss(loadingToast);
      toast.success('Access Granted');

      // Redirection based on user role from the response
      if (result.user.role === 'Professor') {
        navigate('/professor-dashboard');
      } else if (result.user.role === 'Admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      const message = err.response?.data?.message || 'Authentication Failed';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0f0c29]">
      {/* LEFT SIDE: VISUAL */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#240046] via-[#3c096c] to-[#10002b] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="relative z-10 max-w-lg">
          <h1 className="text-6xl font-black text-white leading-tight tracking-tighter mb-6">
            Advance your <br />
            <span className="text-[#9d4edd]">Research</span> Hub.
          </h1>
          <p className="text-lavender-200 text-lg text-white/70 leading-relaxed font-medium">
            Log in to access your dashboard, collaborate with global scholars, and manage your academic projects in real-time.
          </p>
          <div className="mt-10 flex gap-4">
            <div className="h-1 w-20 bg-[#9d4edd] rounded-full"></div>
            <div className="h-1 w-8 bg-white/20 rounded-full"></div>
          </div>
        </div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#7b2cbf] rounded-full blur-[120px] opacity-30"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#3c096c] rounded-full blur-[120px] opacity-30"></div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0a001a]">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
             <h2 className="text-3xl font-black text-white">RESEARCH<span className="text-[#9d4edd]">HUB</span></h2>
          </div>
          
          <div className="mb-10">
            <h2 className="text-4xl font-black text-white tracking-tight mb-2">Sign In</h2>
            <p className="text-white/40 text-sm font-medium">Enter your credentials to continue your journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-[#9d4edd] uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
              <input 
                type="email" 
                placeholder="name@university.edu"
                className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl text-white outline-none focus:border-[#9d4edd] focus:ring-4 focus:ring-[#9d4edd]/10 transition-all placeholder:text-white/20"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required 
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#9d4edd] uppercase tracking-[0.2em] mb-2 ml-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl text-white outline-none focus:border-[#9d4edd] focus:ring-4 focus:ring-[#9d4edd]/10 transition-all placeholder:text-white/20"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required 
              />
            </div>

            <div className="flex justify-end">
              <Link to="#" className="text-xs font-bold text-white/40 hover:text-[#9d4edd] transition-colors">Forgot Password?</Link>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#7b2cbf] hover:bg-[#9d4edd] text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-[#7b2cbf]/20 active:scale-95"
            >
              SIGN IN TO HUB
            </button>
          </form>

          <p className="mt-10 text-center text-white/40 text-sm">
            New to the platform?{' '}
            <Link to="/register" className="text-[#9d4edd] font-black hover:underline underline-offset-4">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;