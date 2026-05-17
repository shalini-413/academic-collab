import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { accountNavByRole, primaryNavByRole } from '../routing/navigationConfig';
import { roleHomePath, ROLES } from '../utils/roles';
import { resolveAssetUrl } from '../utils/urls';
import NotificationDropdown from './NotificationDropdown';

const IconButton = ({ children, title }) => (
  <span
    title={title}
    className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
  >
    {children}
  </span>
);

const AppNavbar = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const profileRef = useRef(null);

  const primaryNav = primaryNavByRole[user?.role] || [];
  const accountNav = accountNavByRole[user?.role] || [];
  const searchPath = user?.role === ROLES.PROFESSOR ? '/browse-students' : '/recommended-professors';

  useEffect(() => {
    const closeProfileMenu = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', closeProfileMenu);
    return () => document.removeEventListener('mousedown', closeProfileMenu);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileOpen(false);
    navigate('/login');
  };

  const navClassName = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition ${
      isActive ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to={user ? roleHomePath(user.role) : '/login'} className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-950 text-sm font-bold text-white">AC</div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold text-slate-950">Academic Collab</p>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{user?.role || 'Research Platform'}</p>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {primaryNav.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClassName}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link to={searchPath}>
                <IconButton title="Search">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </IconButton>
              </Link>
              <Link to="/messages">
                <IconButton title="Messages">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.4-4 8-9 8a9.9 9.9 0 01-4.3-.9L3 20l1.4-3.7A7.4 7.4 0 013 12c0-4.4 4-8 9-8s9 3.6 9 8z" /></svg>
                </IconButton>
              </Link>
              <NotificationDropdown enabled={Boolean(token)} />

              <div className="relative ml-1" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1.5 pr-3 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  {/* <img src={getAvatarUrl(user.avatar)} alt="" className="h-8 w-8 rounded-md object-cover" /> */}
                  <img src={resolveAssetUrl(user?.avatar)} alt="Profile" className="h-8 w-8 rounded-md object-cover" />
                  <span className="max-w-28 truncate text-sm font-semibold text-slate-800">{user.name?.split(' ')[0] || 'User'}</span>
                  <svg className={`h-4 w-4 text-slate-400 transition ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>

                <div className={`absolute right-0 mt-2 w-72 origin-top-right rounded-lg border border-slate-200 bg-white p-2 shadow-xl transition ${profileOpen ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible -translate-y-1 scale-95 opacity-0'}`}>
                  <div className="flex items-center gap-3 border-b border-slate-100 p-3">
                    {/* <img src={getAvatarUrl(user.avatar)} alt="" className="h-11 w-11 rounded-lg object-cover" /> */}
                    <img src={resolveAssetUrl(user?.avatar)} alt="Profile" className="h-8 w-8 rounded-md object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">{user.name}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="py-2">
                    {accountNav.map((item) => (
                      <Link key={item.to} to={item.to} onClick={() => setProfileOpen(false)} className="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <button type="button" onClick={handleLogout} className="w-full rounded-md border-t border-slate-100 px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50">
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Log In</Link>
              <Link to="/register" className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Create Account</Link>
            </>
          )}
        </div>

        <button type="button" className="rounded-lg border border-slate-200 p-2 text-slate-600 md:hidden" onClick={() => setMobileOpen((open) => !open)}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
        </button>
      </div>

      <div className={`overflow-hidden border-t border-slate-200 bg-white transition-all duration-300 md:hidden ${mobileOpen ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="space-y-2 px-4 py-4">
          {user && (
            <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
              {/* <img src={getAvatarUrl(user.avatar)} alt="" className="h-10 w-10 rounded-lg object-cover" /> */}
              <img src={resolveAssetUrl(user?.avatar)} alt="Profile" className="h-8 w-8 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-950">{user.name}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
              <NotificationDropdown enabled={Boolean(token)} />
            </div>
          )}
          {[...primaryNav, ...(user ? [{ to: searchPath, label: 'Search' }, { to: '/messages', label: 'Messages' }, ...accountNav] : [])].map((item) => (
            <NavLink key={`${item.to}-${item.label}`} to={item.to} onClick={() => setMobileOpen(false)} className={navClassName}>
              {item.label}
            </NavLink>
          ))}
          {user ? (
            <button type="button" onClick={handleLogout} className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50">Sign Out</button>
          ) : (
            <div className="grid gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-center text-sm font-semibold text-slate-600 hover:bg-slate-100">Log In</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="rounded-lg bg-slate-950 px-3 py-2 text-center text-sm font-semibold text-white">Create Account</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
