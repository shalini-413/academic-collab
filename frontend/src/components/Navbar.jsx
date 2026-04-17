// import { useState, useContext, useEffect, useRef } from 'react';
// import { NavLink, Link, useNavigate } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';
// import axios from 'axios';

// const Navbar = () => {
//   const { user, logout, token } = useContext(AuthContext);
//   const navigate = useNavigate();
  
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [unreadCount, setUnreadCount] = useState(0); // FEATURE 6: Unread count state
//   const dropdownRef = useRef(null);

//   // FEATURE 6: Fetch unread notification count
//   const fetchUnreadCount = async () => {
//     if (!token) return;
//     try {
//       const res = await axios.get('http://localhost:5000/api/notifications', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const unread = res.data.filter(n => !n.isRead).length;
//       setUnreadCount(unread);
//     } catch (err) {
//       console.error("Error fetching notification count", err);
//     }
//   };

//   useEffect(() => {
//     fetchUnreadCount();
//     // Optional: Poll for new notifications every 60 seconds
//     const interval = setInterval(fetchUnreadCount, 60000);
//     return () => clearInterval(interval);
//   }, [token]);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsDropdownOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleLogout = () => {
//     logout();
//     setIsDropdownOpen(false);
//     setIsMobileMenuOpen(false);
//     navigate('/login');
//   };

//   const navLinkClass = ({ isActive }) => 
//     `font-semibold text-sm tracking-wide transition-all duration-300 ${
//       isActive 
//         ? "text-[#f77f00] border-b-2 border-[#f77f00] pb-1" 
//         : "text-white/80 hover:text-white hover:border-b-2 hover:border-white/30 pb-1"
//     }`;

//   return (
//     <nav className="bg-[#003049] text-white sticky top-0 z-50 shadow-xl border-b border-white/10">
//       <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
//         {/* LOGO */}
//         <Link to={user?.role === 'Student' ? '/student-dashboard' : '/professor-dashboard'} className="flex items-center gap-2 group z-50">
//           <div className="bg-[#f77f00] text-white p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg">
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
//             </svg>
//           </div>
//           <span className="text-2xl font-black tracking-tight text-white">
//             RESEARCH<span className="text-[#f77f00]">HUB</span>
//           </span>
//         </Link>

//         {/* DESKTOP NAVIGATION */}
//         <div className="hidden md:flex items-center gap-8">
          
//           {user?.role === 'Student' && (
//             <div className="flex gap-6">
//               <NavLink to="/student-dashboard" className={navLinkClass}>Home</NavLink>
//               <NavLink to="/projects-feed" className={navLinkClass}>Find Projects</NavLink>
//               <NavLink to="/recommended-professors" className={navLinkClass}>Professors</NavLink>
//             </div>
//           )}

//           {user?.role === 'Professor' && (
//             <NavLink to="/professor-dashboard" className={navLinkClass}>My Dashboard</NavLink>
//           )}

//           {user ? (
//             <div className="flex items-center gap-5 ml-4">
              
//               {/* FEATURE 6: NOTIFICATION BELL */}
//               <Link to="/notifications" className="relative group p-2 bg-white/5 rounded-full hover:bg-white/15 transition-all">
//                 <svg className="w-6 h-6 text-white/80 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
//                 </svg>
//                 {unreadCount > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-[#003049] animate-pulse">
//                     {unreadCount}
//                   </span>
//                 )}
//               </Link>

//               {/* PROFILE DROPDOWN */}
//               <div className="relative" ref={dropdownRef}>
//                 <button 
//                   onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                   className="flex items-center gap-3 bg-white/5 hover:bg-white/15 px-2 py-1.5 pr-4 rounded-full border border-white/10 transition-all focus:ring-2 focus:ring-[#f77f00] outline-none"
//                 >
//                   <div className="w-9 h-9 bg-gradient-to-br from-[#f77f00] to-orange-600 rounded-full flex items-center justify-center font-bold text-white shadow-inner">
//                     {user.name ? user.name[0].toUpperCase() : 'U'}
//                   </div>
//                   <div className="text-left flex flex-col justify-center">
//                     <span className="font-bold text-sm leading-tight">{user.name?.split(' ')[0] || 'User'}</span>
//                     <span className="text-[10px] text-white/50 font-semibold uppercase tracking-widest leading-tight">{user.role}</span>
//                   </div>
//                   <svg className={`w-4 h-4 text-white/50 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </button>

//                 {isDropdownOpen && (
//                   <div className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-2xl py-2 border border-slate-100 text-slate-800 overflow-hidden transform origin-top-right transition-all z-50">
//                     <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
//                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Signed in as</p>
//                       <p className="font-bold text-[#003049] truncate text-sm">{user.email}</p>
//                     </div>

//                     <div className="py-2">
//                       <Link to="/profile" className="px-5 py-2.5 hover:bg-[#f8f9fa] hover:text-[#f77f00] transition-colors flex items-center gap-3 text-sm font-semibold text-slate-600" onClick={() => setIsDropdownOpen(false)}>
//                         <span className="text-lg">👤</span> My Profile
//                       </Link>

//                       {user.role === 'Student' && (
//                         <>
//                           <Link to="/my-applications" className="px-5 py-2.5 hover:bg-[#f8f9fa] hover:text-[#f77f00] transition-colors flex items-center gap-3 text-sm font-semibold text-slate-600" onClick={() => setIsDropdownOpen(false)}>
//                             <span className="text-lg">📝</span> My Applications
//                           </Link>
//                           <Link to="/saved-projects" className="px-5 py-2.5 hover:bg-[#f8f9fa] hover:text-[#f77f00] transition-colors flex items-center gap-3 text-sm font-semibold text-slate-600" onClick={() => setIsDropdownOpen(false)}>
//                             <span className="text-lg">🔖</span> Saved Projects
//                           </Link>
//                         </>
//                       )}

//                       <Link to="/messages" className="px-5 py-2.5 hover:bg-[#f8f9fa] hover:text-[#f77f00] transition-colors flex items-center gap-3 text-sm font-semibold text-slate-600" onClick={() => setIsDropdownOpen(false)}>
//                         <span className="text-lg">💬</span> Messages
//                       </Link>
//                     </div>

//                     <div className="border-t border-slate-100 mt-1 py-1">
//                       <button onClick={handleLogout} className="w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 font-bold transition-colors flex items-center gap-3 text-sm">
//                         <span className="text-lg">🚪</span> Sign Out
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div className="flex gap-3">
//               <Link to="/login" className="px-5 py-2.5 font-bold text-white hover:text-[#f77f00] transition-colors text-sm tracking-wide">Log In</Link>
//               <Link to="/register" className="bg-[#f77f00] px-6 py-2.5 rounded-full font-bold text-white hover:bg-orange-600 transition-colors shadow-md text-sm tracking-wide">Create Account</Link>
//             </div>
//           )}
//         </div>

//         {/* MOBILE MENU TOGGLE (HIDDEN ON DESKTOP) */}
//         <button className="md:hidden text-white p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
//           <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             {isMobileMenuOpen ? (
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//             ) : (
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
//             )}
//           </svg>
//         </button>
//       </div>
      
//       {/* MOBILE MENU LOGIC */}
//       {isMobileMenuOpen && (
//         <div className="md:hidden bg-[#003049] border-t border-white/10 absolute w-full left-0 shadow-2xl pb-6 z-50">
//           <div className="flex flex-col px-6 pt-4 space-y-4">
//              <Link to="/notifications" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-semibold text-[#f77f00]">
//                🔔 Notifications ({unreadCount})
//              </Link>
//              {/* ... (Other mobile links same as desktop) */}
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;



import { useState, useContext, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Navbar = () => {
  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Nav fetch error", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  // Modern NavLink styling with the new purple theme
  const navLinkClass = ({ isActive }) => 
    `text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
      isActive 
        ? "text-[#9d4edd] border-b-2 border-[#9d4edd] pb-1" 
        : "text-white/50 hover:text-white pb-1"
    }`;

  return (
    <nav className="bg-[#0a001a]/90 backdrop-blur-xl text-white sticky top-0 z-50 border-b border-white/5 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* BRAND LOGO */}
        <Link to={user?.role === 'Student' ? '/student-dashboard' : '/professor-dashboard'} className="flex items-center gap-3 group">
          <div className="bg-[#7b2cbf] text-white p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-[0_0_20px_rgba(157,78,221,0.3)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase">
            RESEARCH<span className="text-[#9d4edd]">HUB</span>
          </span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-10">
          
          <div className="flex gap-8">
            {user?.role === 'Student' ? (
              <>
                <NavLink to="/student-dashboard" className={navLinkClass}>Home</NavLink>
                <NavLink to="/projects-feed" className={navLinkClass}>Projects</NavLink>
                <NavLink to="/recommended-professors" className={navLinkClass}>Faculty</NavLink>
              </>
            ) : user?.role === 'Professor' ? (
              <NavLink to="/professor-dashboard" className={navLinkClass}>Console</NavLink>
            ) : null}
          </div>

          {user ? (
            <div className="flex items-center gap-6 border-l border-white/10 pl-6">
              
              {/* NOTIFICATION BELL */}
              <Link to="/notifications" className="relative group p-2.5 bg-white/5 rounded-2xl hover:bg-[#9d4edd]/20 transition-all border border-white/5">
                <svg className="w-5 h-5 text-white/60 group-hover:text-[#9d4edd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ff006e] text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-[#0a001a] animate-pulse shadow-[0_0_10px_rgba(255,0,110,0.5)]">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* PROFILE DROPDOWN */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-1.5 pr-4 rounded-2xl border border-white/5 transition-all outline-none group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#7b2cbf] to-[#9d4edd] rounded-xl flex items-center justify-center font-black text-white text-xs shadow-lg group-hover:scale-105 transition-transform">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-[11px] font-black text-white leading-none">{user.name?.split(' ')[0]}</p>
                    <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest mt-1">{user.role}</p>
                  </div>
                  <svg className={`w-3 h-3 text-white/30 transition-transform duration-500 ${isDropdownOpen ? 'rotate-180 text-[#9d4edd]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-4 w-60 bg-[#10002b] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-3 border border-white/10 text-white overflow-hidden transform origin-top-right transition-all">
                    <div className="px-5 py-4 border-b border-white/5 bg-white/5">
                      <p className="text-[8px] text-white/30 font-black uppercase tracking-[0.2em] mb-1">Account Info</p>
                      <p className="font-bold text-xs truncate text-white/80">{user.email}</p>
                    </div>

                    <div className="p-2 space-y-1">
                      {[
                        { to: '/profile', icon: '👤', label: 'My Profile' },
                        { to: '/messages', icon: '💬', label: 'Messages' },
                        ...(user.role === 'Student' ? [{ to: '/my-applications', icon: '📄', label: 'Applications' }] : [])
                      ].map((item, idx) => (
                        <Link 
                          key={idx} 
                          to={item.to} 
                          className="px-4 py-3 hover:bg-[#9d4edd]/10 rounded-2xl transition-colors flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-[#9d4edd]"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="text-base">{item.icon}</span> {item.label}
                        </Link>
                      ))}
                    </div>

                    <div className="px-2 pt-2 border-t border-white/5">
                      <button onClick={handleLogout} className="w-full text-left px-4 py-4 text-red-400 hover:bg-red-500/10 rounded-2xl font-black transition-all flex items-center gap-3 text-[10px] uppercase tracking-widest">
                        <span className="text-base">🚪</span> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-4 items-center">
              <Link to="/login" className="text-[10px] font-black text-white/50 hover:text-white uppercase tracking-widest transition-colors">Log In</Link>
              <Link to="/register" className="bg-[#7b2cbf] hover:bg-[#9d4edd] px-6 py-3 rounded-2xl font-black text-white transition-all shadow-xl shadow-[#7b2cbf]/20 text-[10px] uppercase tracking-widest active:scale-95">
                Join Hub
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;