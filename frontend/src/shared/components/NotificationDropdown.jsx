// frontend/src/shared/components/NotificationDropdown.jsx
import { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { formatDate } from '../utils/formatters';

const NotificationDropdown = ({ enabled }) => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, loading, markAllAsRead } = useNotifications(enabled);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-200"
        aria-label="Notifications"
      >
        <span className="sr-only">Notifications</span>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V5a2 2 0 10-4 0v.3A6 6 0 006 11v3.2c0 .5-.2 1-.6 1.4L4 17h11z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Animated Dropdown Panel */}
      <div 
        className={`absolute right-0 mt-3 w-[min(360px,calc(100vw-24px))] origin-top-right rounded-lg border border-slate-200 bg-white text-slate-900 shadow-xl transition-all duration-200 ease-out ${
          open ? 'scale-100 opacity-100 visible translate-y-0' : 'scale-95 opacity-0 invisible -translate-y-2'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-slate-500">{unreadCount} unread</p>
          </div>
          <button type="button" onClick={markAllAsRead} className="text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors">
            Mark all read
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {loading && notifications.length === 0 ? (
            <p className="p-4 text-sm text-slate-500 text-center animate-pulse">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="p-4 text-sm text-slate-500 text-center">No notifications yet.</p>
          ) : (
            notifications.slice(0, 8).map((notification) => (
              <div 
                key={notification._id} 
                className={`rounded-lg p-3 transition-colors duration-200 ${notification.isRead ? 'bg-white hover:bg-slate-50' : 'bg-blue-50 hover:bg-blue-100/80'}`}
              >
                <div className="flex gap-3">
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notification.isRead ? 'bg-slate-300' : 'bg-blue-600'}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{notification.title}</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">{notification.message}</p>
                    <p className="mt-2 text-xs text-slate-400">{formatDate(notification.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;