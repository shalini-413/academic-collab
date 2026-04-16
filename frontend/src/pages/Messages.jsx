// frontend/src/pages/Messages.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const socket = io('http://localhost:5000');

const Messages = () => {
  const { user, token } = useContext(AuthContext);
  const [tab, setTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (user?._id) socket.emit('join_chat', user._id);

    const handleReceive = (msg) => {
      if (selectedChat && (msg.sender === selectedChat._id || msg.receiver === selectedChat._id)) {
        setMessages(prev => [...prev, msg]);
      }
    };

    socket.on('receive_direct_message', handleReceive);
    socket.on('message_sent', handleReceive);

    return () => {
      socket.off('receive_direct_message', handleReceive);
      socket.off('message_sent', handleReceive);
    };
  }, [user, selectedChat]);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/chat/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  const respondToRequest = async (requestId, action) => {
    try {
      await axios.post('http://localhost:5000/api/chat/respond', { requestId, action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Request ${action.toLowerCase()}`);
      fetchRequests();
    } catch (err) {
      toast.error("Failed to respond");
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    socket.emit('send_direct_message', {
      senderId: user._id,
      receiverId: selectedChat._id,
      message: newMessage.trim()
    });

    setNewMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-black text-[#003049] tracking-tighter mb-2">Messages</h1>
      <p className="text-slate-500">Connect and collaborate with professors</p>

      {/* Tabs */}
      <div className="flex gap-2 mt-10 mb-8 border-b pb-6">
        <button 
          onClick={() => setTab('requests')}
          className={`px-8 py-3 rounded-2xl font-semibold transition-all ${tab === 'requests' ? 'bg-[#003049] text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200'}`}
        >
          Chat Requests ({requests.length})
        </button>
        <button 
          onClick={() => setTab('chats')}
          className={`px-8 py-3 rounded-2xl font-semibold transition-all ${tab === 'chats' ? 'bg-[#003049] text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200'}`}
        >
          Active Chats
        </button>
      </div>

      {tab === 'requests' && (
        <div className="space-y-6">
          {requests.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border">
              <p className="text-slate-400">No pending chat requests yet.</p>
            </div>
          ) : (
            requests.map(req => (
              <div key={req._id} className="bg-white rounded-3xl p-8 border border-slate-100 hover:shadow-xl transition-all">
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold text-xl">{req.student?.name}</p>
                    <p className="text-slate-500 mt-1">{req.initialMessage}</p>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => respondToRequest(req._id, 'Accepted')}
                      className="bg-green-600 text-white px-8 py-3.5 rounded-2xl font-medium hover:bg-green-700 transition-all"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => respondToRequest(req._id, 'Rejected')}
                      className="bg-red-100 text-red-700 px-8 py-3.5 rounded-2xl font-medium hover:bg-red-200 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'chats' && (
        <div className="bg-white rounded-3xl p-20 text-center border border-slate-100">
          <p className="text-slate-400 text-lg">No active chats yet.</p>
          <p className="text-sm text-slate-500 mt-2">Accepted requests will appear here</p>
        </div>
      )}
    </div>
  );
};

export default Messages;