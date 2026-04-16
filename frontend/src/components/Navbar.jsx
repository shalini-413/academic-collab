// frontend/src/components/Navbar.jsx
import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  return (
    <nav className="h-20 bg-white border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      
      {/* Left - Branding */}
      <Link to="/student-dashboard" className="flex items-center gap-3 group">
        <div className="w-10 h-10 bg-gradient-to-br from-[#003049] to-[#00263d] rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
          <span className="text-[#fcbf49] font-black text-3xl tracking-tighter">AH</span>
        </div>
        <div>
          <span className="text-2xl font-black tracking-tight text-[#003049]">AcademicHub</span>
        </div>
      </Link>

      {/* Center - Main Navigation */}
      <div className="hidden md:flex items-center gap-9 text-sm font-medium text-slate-700">
        <Link to="/student-dashboard" className="hover:text-[#003049] transition-colors">Home</Link>
        <Link to="/projects-feed" className="hover:text-[#003049] transition-colors">Projects</Link>
        <Link to="/recommended-professors" className="hover:text-[#003049] transition-colors">Professors</Link>
        <Link to="/messages" className="hover:text-[#003049] transition-colors">Messages</Link>
        <Link to="/my-applications" className="hover:text-[#003049] transition-colors">Applications</Link>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">
        <NotificationBell />

        {/* Profile Dropdown */}
        <div className="relative">
          <div 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-9 h-9 bg-[#003049] text-white rounded-2xl flex items-center justify-center font-semibold">
              {user?.name?.[0]}
            </div>
            <div className="hidden md:block text-right">
              <div className="font-semibold text-sm text-[#003049]">{user?.name}</div>
              <div className="text-xs text-slate-500 -mt-0.5">Student</div>
            </div>
          </div>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-xl border border-slate-100 py-2 z-50">
              <Link to="/profile" className="block px-6 py-3 hover:bg-slate-50">View Profile</Link>
              <Link to="/privacy-settings" className="block px-6 py-3 hover:bg-slate-50">Privacy Settings</Link>
              <Link to="/saved-projects" className="block px-6 py-3 hover:bg-slate-50">Saved Projects</Link>
              <div className="border-t my-2"></div>
              <button 
                onClick={logout}
                className="w-full text-left px-6 py-3 text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;