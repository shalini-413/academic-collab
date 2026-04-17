import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import moment from 'moment'; // Make sure to run: npm install moment
import toast from 'react-hot-toast';

const Notifications = () => {
  const { token, user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Notification fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchNotifications();
  }, [token]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state to reflect read status immediately
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
      toast.success("All caught up!");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f77f00]"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#003049] tracking-tighter">Activity Center</h1>
          <p className="text-slate-500">History of your interactions and alerts</p>
        </div>
        {notifications.length > 0 && (
          <button onClick={markAllRead} className="text-sm font-bold text-[#f77f00] hover:text-orange-700 transition-colors">
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white p-16 rounded-[2.5rem] text-center border-2 border-dashed border-slate-100">
            <span className="text-5xl mb-4 block">📭</span>
            <p className="text-slate-400 font-medium">Your inbox is clear! No new notifications.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n._id} 
              onClick={() => !n.isRead && handleMarkAsRead(n._id)}
              className={`group p-6 rounded-3xl border transition-all duration-300 ${
                n.isRead 
                ? 'bg-slate-50/50 border-slate-100 opacity-60' 
                : 'bg-white border-slate-200 shadow-md hover:shadow-xl border-l-8 border-l-[#f77f00]'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className={`text-2xl p-3 rounded-2xl ${n.isRead ? 'bg-slate-200' : 'bg-orange-100'}`}>
                    {n.type === 'message_received' ? '💬' : n.type === 'application_received' ? '📄' : '🔔'}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${n.isRead ? 'text-slate-600' : 'text-[#003049]'}`}>
                      {n.title}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">{n.message}</p>
                    
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-[10px] bg-[#003049] text-white px-3 py-1 rounded-full font-bold">
                        {n.sender?.name || 'System'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {moment(n.createdAt).format('MMM DD, YYYY • h:mm A')}
                      </span>
                    </div>
                  </div>
                </div>
                {!n.isRead && (
                  <div className="w-3 h-3 bg-[#f77f00] rounded-full"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;