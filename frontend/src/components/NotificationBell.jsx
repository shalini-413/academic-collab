// frontend/src/components/NotificationBell.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const NotificationBell = () => {
  const { token, user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchNotifications();
    
    if (user?.id) {
      const socket = io(import.meta.env.VITE_API_URL);
      socket.emit('join_chat', user.id);
      
      socket.on('receive_notification', (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
        toast.success(newNotif.title || "New Notification");
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [token, user]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-3 hover:bg-slate-100 rounded-full transition-all text-xl"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[18px] h-5 flex items-center justify-center rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          <div className="p-5 border-b font-bold text-[#003049] flex justify-between">
            <span>Notifications</span>
            <span className="text-xs text-slate-400">{unreadCount} unread</span>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No notifications yet</div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  onClick={() => markAsRead(notif._id)}
                  className={`p-5 border-b hover:bg-slate-50 cursor-pointer transition-all ${!notif.isRead ? 'bg-blue-50' : ''}`}
                >
                  <div className="font-semibold text-sm text-[#003049]">{notif.title}</div>
                  <div className="text-slate-600 text-sm mt-1 leading-snug">{notif.message}</div>
                  <div className="text-xs text-slate-400 mt-3">
                    {new Date(notif.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;