import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const socket = io('http://localhost:5000');

const Messages = () => {
  const { user, token } = useContext(AuthContext);
  const [tab, setTab] = useState('chats');
  const [requests, setRequests] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (user?.id) {
      socket.emit('join_chat', user.id);
    }

    const handleNewMessage = (msg) => {
      setMessages(prev => {
        // Prevent duplication
        if (prev.find(m => m._id === msg._id)) return prev;
        // Only append if the message is from/to the currently open chat
        if (selectedChatUser && (msg.sender === selectedChatUser._id || msg.receiver === selectedChatUser._id)) {
          return [...prev, msg];
        }
        return prev;
      });
    };

    socket.on('receive_direct_message', handleNewMessage);
    socket.on('message_sent', handleNewMessage);

    return () => {
      socket.off('receive_direct_message');
      socket.off('message_sent');
    };
  }, [user, selectedChatUser]);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [reqs, chats] = await Promise.all([
        axios.get('http://localhost:5000/api/chat/requests', config),
        axios.get('http://localhost:5000/api/chat/active', config)
      ]);
      setRequests(reqs.data);
      setActiveChats(chats.data);
    } catch (err) {
      console.error("Data fetch failed", err);
    }
  };

  useEffect(() => { if (token) fetchData(); }, [token]);

  // Identify the other person in the connection
  const getPartner = (chat) => {
    if (!chat.student || !chat.professor) return { name: "Unknown User" };
    // Strict string comparison to avoid identity confusion
    const myIdStr = user.id.toString();
    const studentIdStr = (chat.student._id || chat.student).toString();
    return studentIdStr === myIdStr ? chat.professor : chat.student;
  };

  const openChat = async (partner) => {
    setSelectedChatUser(partner);
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/history/${partner._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      toast.error("Could not load history");
    }
  };

  const respondToRequest = async (requestId, action) => {
    try {
      await axios.post('http://localhost:5000/api/chat/respond', 
        { requestId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Request ${action.toLowerCase()}!`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChatUser) return;
    socket.emit('send_direct_message', {
      senderId: user.id,
      receiverId: selectedChatUser._id,
      message: newMessage.trim()
    });
    setNewMessage('');
  };

  // Filter to only show requests sent TO you (you are the receiver)
  const incomingRequests = requests.filter(req => req.initiatedBy !== user.id);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 h-[calc(100vh-120px)] flex flex-col font-sans">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-[#003049] tracking-tighter">Communications</h1>
        <p className="text-slate-500 mt-1">Manage your professional project inquiries</p>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setTab('chats')} 
          className={`px-8 py-3 rounded-2xl font-bold transition-all shadow-sm ${tab === 'chats' ? 'bg-[#003049] text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Active Chats
        </button>
        <button 
          onClick={() => setTab('requests')} 
          className={`px-8 py-3 rounded-2xl font-bold transition-all shadow-sm ${tab === 'requests' ? 'bg-[#003049] text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Requests ({incomingRequests.length})
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {tab === 'chats' ? (
          <>
            {/* Sidebar */}
            <div className="w-1/3 bg-white border border-slate-100 rounded-3xl p-4 overflow-y-auto shadow-sm">
              {activeChats.length === 0 ? (
                <div className="text-center text-slate-400 mt-10 text-sm">No active conversations.</div>
              ) : (
                activeChats.map(chat => {
                  const partner = getPartner(chat);
                  return (
                    <div 
                      key={chat._id} 
                      onClick={() => openChat(partner)} 
                      className={`p-5 rounded-2xl cursor-pointer mb-3 transition-all ${selectedChatUser?._id === partner._id ? 'bg-[#003049] text-white shadow-xl scale-[1.02]' : 'hover:bg-slate-50 border border-transparent'}`}
                    >
                      <p className="font-bold text-base">{partner.name}</p>
                      <p className={`text-[10px] uppercase tracking-widest font-black mt-1 ${selectedChatUser?._id === partner._id ? 'text-white/60' : 'text-slate-400'}`}>
                        {chat.project?.title || "Collaboration"}
                      </p>
                    </div>
                  )
                })
              )}
            </div>

            {/* Chat Window */}
            <div className="flex-1 bg-white border border-slate-100 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
              {selectedChatUser ? (
                <>
                  <div className="p-6 border-b border-slate-100 bg-[#fdfcfb] flex items-center justify-between">
                    <div>
                      <p className="font-black text-xl text-[#003049]">{selectedChatUser.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Online Session</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
                    {messages.map((m, i) => {
                      const isMe = m.sender === user.id;
                      return (
                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] px-5 py-3 rounded-2xl text-sm shadow-sm leading-relaxed ${isMe ? 'bg-[#003049] text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'}`}>
                            {m.message}
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-5 bg-white border-t border-slate-100 flex gap-4">
                    <input 
                      value={newMessage} 
                      onChange={e => setNewMessage(e.target.value)} 
                      onKeyPress={e => e.key === 'Enter' && sendMessage()} 
                      className="flex-1 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#f77f00] transition-all" 
                      placeholder="Write your message..." 
                    />
                    <button onClick={sendMessage} className="bg-[#f77f00] text-white px-10 py-4 rounded-2xl font-black hover:bg-orange-600 transition-all shadow-lg active:scale-95">
                      SEND
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                  <span className="text-6xl mb-4">💬</span>
                  <p className="font-bold">Select a colleague to start chatting</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="w-full space-y-4 overflow-y-auto pr-2">
            {incomingRequests.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-20 text-center border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium italic">No pending requests found.</p>
              </div>
            ) : (
              incomingRequests.map(req => {
                const partner = getPartner(req);
                return (
                  <div key={req._id} className="bg-white p-8 border border-slate-100 rounded-[2rem] flex justify-between items-center shadow-lg transition-hover hover:shadow-xl">
                    <div className="flex-1">
                      <p className="font-black text-[#003049] text-2xl">{partner.name}</p>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter mb-4">Project: {req.project?.title}</p>
                      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl italic text-slate-600 text-sm">
                        "{req.initialMessage}"
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 ml-10">
                      <button onClick={() => respondToRequest(req._id, 'Accepted')} className="bg-green-600 text-white px-10 py-3 rounded-2xl font-black hover:bg-green-700 transition-all shadow-md">ACCEPT</button>
                      <button onClick={() => respondToRequest(req._id, 'Rejected')} className="bg-red-50 text-red-600 px-10 py-3 rounded-2xl font-black hover:bg-red-100 transition-all">DECLINE</button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;