// // frontend/src/pages/Register.jsx
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const Register = () => {
//   const [formData, setFormData] = useState({
//     name: '', email: '', password: '', role: 'Student', skills: ''
//   });
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       // Checkpoint: Convert string "React, Node" into ["React", "Node"]
//       const submissionData = {
//         ...formData,
//         skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== "")
//       };
      
//       const res = await axios.post('http://localhost:5000/api/auth/register', submissionData);
//       alert(res.data.message);
//       navigate('/login');
//     } catch (err) {
//       alert(err.response?.data?.message || "Registration failed");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2rem] shadow-xl w-full max-w-md space-y-4">
//         <h2 className="text-3xl font-black text-[#003049] text-center">Create Account</h2>
//         <input type="text" placeholder="Full Name" className="w-full p-4 bg-slate-100 rounded-xl" onChange={e => setFormData({...formData, name: e.target.value})} required />
//         <input type="email" placeholder="Email" className="w-full p-4 bg-slate-100 rounded-xl" onChange={e => setFormData({...formData, email: e.target.value})} required />
//         <input type="password" placeholder="Password" className="w-full p-4 bg-slate-100 rounded-xl" onChange={e => setFormData({...formData, password: e.target.value})} required />
//         <select className="w-full p-4 bg-slate-100 rounded-xl" onChange={e => setFormData({...formData, role: e.target.value})}>
//           <option value="Student">Student</option>
//           <option value="Professor">Professor</option>
//         </select>
//         <input type="text" placeholder="Skills (comma separated)" className="w-full p-4 bg-slate-100 rounded-xl" onChange={e => setFormData({...formData, skills: e.target.value})} />
//         <button className="w-full py-4 bg-[#003049] text-white rounded-xl font-black uppercase tracking-widest hover:bg-[#f77f00] transition-all">Register</button>
//       </form>
//     </div>
//   );
// };

// export default Register;



import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Student' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0f0c29]">
      {/* LEFT SIDE: FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0a001a] order-2 lg:order-1">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-4xl font-black text-white tracking-tight mb-2">Join Hub</h2>
            <p className="text-white/40 text-sm font-medium">Create your profile to start collaborating.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-[#9d4edd] uppercase tracking-[0.2em] mb-2 ml-1">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl text-white outline-none focus:border-[#9d4edd] focus:ring-4 focus:ring-[#9d4edd]/10 transition-all placeholder:text-white/20"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required 
              />
            </div>

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

            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="block text-[10px] font-black text-[#9d4edd] uppercase tracking-[0.2em] mb-2 ml-1">User Role</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl text-white outline-none focus:border-[#9d4edd] focus:ring-4 focus:ring-[#9d4edd]/10 transition-all cursor-pointer"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option className="bg-[#0a001a]" value="Student">Student</option>
                  <option className="bg-[#0a001a]" value="Professor">Professor</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#7b2cbf] hover:bg-[#9d4edd] text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-[#7b2cbf]/20 active:scale-95 mt-4"
            >
              CREATE ACCOUNT
            </button>
          </form>

          <p className="mt-10 text-center text-white/40 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-[#9d4edd] font-black hover:underline underline-offset-4">Sign In</Link>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: VISUAL */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-bl from-[#3c096c] via-[#240046] to-[#0a001a] items-center justify-center p-12 relative overflow-hidden order-1 lg:order-2">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]"></div>
        <div className="relative z-10 max-w-lg text-right">
          <h1 className="text-6xl font-black text-white leading-tight tracking-tighter mb-6">
            Start your <br />
            Next <span className="text-[#9d4edd]">Big Idea</span>.
          </h1>
          <p className="text-lavender-200 text-lg text-white/70 leading-relaxed font-medium">
            Register today to find the perfect research partner. Whether you're a student seeking guidance or a professor looking for talent.
          </p>
          <div className="mt-10 flex gap-4 justify-end">
            <div className="h-1 w-8 bg-white/20 rounded-full"></div>
            <div className="h-1 w-20 bg-[#9d4edd] rounded-full"></div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#9d4edd] rounded-full blur-[160px] opacity-10"></div>
      </div>
    </div>
  );
};

export default Register;