// frontend/src/pages/Messages.jsx
import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const Messages = () => {
  const { user, token } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  
  // Core State
  const [activeTab, setActiveTab] = useState('chats'); 
  const [requests, setRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Premium UX States
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Inline Edit & Delete States
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');
  const [deletingMessageId, setDeletingMessageId] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 1. INITIALIZE SOCKET & LISTENERS
  useEffect(() => {
    if (!user) return;
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    setSocket(newSocket);
    newSocket.emit('join_chat', user.id || user._id);

    newSocket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
      if (activeChat && activeChat.partner._id === message.sender) {
        markChatAsRead(message.sender);
      } else {
        fetchData(); 
      }
    });

    newSocket.on('messages_marked_read', (partnerId) => {
      setMessages((prev) => prev.map(msg => (msg.receiver === partnerId && !msg.read) ? { ...msg, read: true } : msg));
    });

    newSocket.on('user_typing', (partnerId) => {
      if (activeChat && activeChat.partner._id === partnerId) setIsPartnerTyping(true);
    });

    newSocket.on('user_stopped_typing', (partnerId) => {
      if (activeChat && activeChat.partner._id === partnerId) setIsPartnerTyping(false);
    });

    newSocket.on('message_deleted', (messageId) => {
      setMessages((prev) => prev.filter(msg => msg._id !== messageId));
    });

    newSocket.on('message_edited', (updatedMessage) => {
      setMessages((prev) => prev.map(msg => msg._id === updatedMessage._id ? updatedMessage : msg));
    });

    newSocket.on('chat_deleted', (partnerId) => {
      toast.error("The other user has ended this conversation.");
      if (activeChat && activeChat.partner._id === partnerId) {
        setActiveChat(null);
        setMessages([]);
      }
      fetchData(); 
    });

    // NEW: Realtime trigger when someone declines your request
    newSocket.on('request_rejected_live', () => {
      fetchData(); 
      if (activeChat?.status === 'Pending') {
        setActiveChat(prev => ({ ...prev, status: 'Rejected' }));
      }
    });

    return () => newSocket.disconnect();
  }, [user, activeChat]);

  // 2. FETCH DATA
  const fetchData = async () => {
    try {
      const [reqRes, convRes] = await Promise.all([
        axios.get(import.meta.env.VITE_API_URL + '/api/chat/requests/pending', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(import.meta.env.VITE_API_URL + '/api/chat/conversations', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setRequests(reqRes.data);
      setConversations(convRes.data);
    } catch (err) { console.error("Failed to load chat data"); }
  };

  useEffect(() => { if (token) fetchData(); }, [token]);

  useEffect(() => {
    if (location.state?.activeUserId && (conversations.length > 0 || requests.length > 0)) {
      const userId = location.state.activeUserId;
      const convChat = conversations.find(c => c.partner._id === userId);
      if (convChat) {
        loadChat(convChat);
        setActiveTab('chats');
      } else {
        const reqChat = requests.find(r => r.sender._id === userId);
        if (reqChat) {
          loadChat({ connectionId: reqChat._id, partner: reqChat.sender, status: 'Pending', isInitiator: false });
          setActiveTab('requests');
        }
      }
      navigate(location.pathname, { replace: true });
    }
  }, [conversations, requests, location.state, navigate]);

  // 3. CORE ACTIONS
  const markChatAsRead = async (partnerId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/chat/read/${partnerId}`, {}, { headers: { Authorization: `Bearer ${token}` }});
      if (socket) socket.emit('messages_read', { receiverId: partnerId });
      fetchData(); 
    } catch (err) { console.error(err); }
  };

  const loadChat = async (chatObj) => {
    setActiveChat(chatObj);
    cancelInlineEdit();
    setDeletingMessageId(null);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/history/${chatObj.partner._id}`, { 
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, limit: 50 }
      });
      setMessages(res.data.messages || res.data);
      scrollToBottom();
      if (chatObj.unreadCount > 0) markChatAsRead(chatObj.partner._id);
    } catch (err) { toast.error("Failed to load messages"); }
  };

  // --- DELETE & EDIT ACTIONS ---
  const confirmDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/chat/message/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      if (socket && activeChat) {
        socket.emit('delete_message', { receiverId: activeChat.partner._id, messageId });
      }
      setDeletingMessageId(null);
      toast.success("Message deleted");
    } catch (err) {
      toast.error("Failed to delete message");
      setDeletingMessageId(null);
    }
  };

  const initiateInlineEdit = (msg) => {
    setEditingMessageId(msg._id);
    setEditText(msg.text);
    setDeletingMessageId(null);
  };

  const cancelInlineEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const saveInlineEdit = async (messageId) => {
    if (!editText.trim()) return cancelInlineEdit();
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/chat/message/${messageId}`, 
        { newText: editText }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (socket && activeChat) socket.emit('edit_message', { receiverId: activeChat.partner._id, messageData: res.data.data });
      setMessages(prev => prev.map(msg => msg._id === messageId ? res.data.data : msg));
      toast.success("Message updated");
      cancelInlineEdit();
    } catch (err) {
      toast.error("Failed to update message");
    }
  };

  const handleDeleteConversation = async () => {
    if (!window.confirm("Are you sure you want to delete this entire conversation? This cannot be undone for either of you.")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/chat/conversation/${activeChat.partner._id}`, { headers: { Authorization: `Bearer ${token}` }});
      if (socket) socket.emit('delete_chat', { receiverId: activeChat.partner._id });
      toast.success("Conversation deleted");
      setActiveChat(null);
      setMessages([]);
      fetchData();
    } catch (err) { toast.error("Failed to delete conversation"); }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (socket && activeChat && !editingMessageId) {
      socket.emit('typing', { receiverId: activeChat.partner._id });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => socket.emit('stop_typing', { receiverId: activeChat.partner._id }), 2000);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("File size must be under 5MB");
    
    setIsUploading(true);
    const toastId = toast.loading("Sending file...");
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + '/api/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      await executeSendMessage("", res.data.url, file.name);
      toast.success("File sent", { id: toastId });
    } catch (error) { toast.error("Failed to send file", { id: toastId }); } 
    finally { setIsUploading(false); e.target.value = ''; }
  };

  const executeSendMessage = async (text = "", attachmentUrl = null, attachmentName = null) => {
    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + '/api/chat/send', {
        receiverId: activeChat.partner._id, text, attachmentUrl, attachmentName
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      socket.emit('send_message', res.data);
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      socket.emit('stop_typing', { receiverId: activeChat.partner._id });
      fetchData(); 
      scrollToBottom();
    } catch (err) { toast.error("Failed to send message"); }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    executeSendMessage(newMessage);
  };

  // UX HELPERS
  const scrollToBottom = () => setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  const getFullUrl = (url) => { if (!url) return ''; return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`; };

  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach(msg => {
      const msgDate = new Date(msg.createdAt);
      const today = new Date();
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      let dateLabel = msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      if (msgDate.toDateString() === today.toDateString()) dateLabel = "Today";
      else if (msgDate.toDateString() === yesterday.toDateString()) dateLabel = "Yesterday";
      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push(msg);
    });
    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);
  
  // UPDATED LOCK LOGIC: Input is locked if Pending (and you aren't initiator) OR if Rejected entirely
  const isInputLocked = (activeChat?.status === 'Pending' && !activeChat?.isInitiator) || activeChat?.status === 'Rejected';

  // Accept/Reject Requests
  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/chat/request/${requestId}/accept`, {}, { headers: { Authorization: `Bearer ${token}` }});
      toast.success("Request accepted!");
      if (activeChat && activeChat.connectionId === requestId) setActiveChat(prev => ({ ...prev, status: 'Accepted' }));
      fetchData(); 
    } catch (err) { toast.error("Failed to accept"); }
  };
  
  const handleRejectRequest = async (requestId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/chat/request/${requestId}/reject`, {}, { headers: { Authorization: `Bearer ${token}` }});
      toast.success("Request declined");
      if (activeChat && activeChat.connectionId === requestId) setActiveChat(null);
      fetchData(); 
    } catch (err) { toast.error("Failed to decline"); }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] pt-8 pb-20 px-6">
      <div className="max-w-[1400px] mx-auto bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row h-[85vh]">
        
        {/* ==================================================== */}
        {/* LEFT SIDEBAR */}
        {/* ==================================================== */}
        <div className="w-full md:w-96 bg-slate-50 border-r border-slate-100 flex flex-col z-10 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-black text-[#003049] mb-5">Messages</h2>
            <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-100">
              <button onClick={() => setActiveTab('chats')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'chats' ? 'bg-[#003049] text-white shadow-md' : 'text-slate-500 hover:text-[#003049]'}`}>Active Chats</button>
              <button onClick={() => setActiveTab('requests')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all relative ${activeTab === 'requests' ? 'bg-[#f77f00] text-white shadow-md' : 'text-slate-500 hover:text-[#f77f00]'}`}>
                Requests
                {requests.length > 0 && <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm"></span>}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {activeTab === 'chats' && conversations.map((conv) => (
              <div key={conv.connectionId} onClick={() => loadChat(conv)} className={`p-4 rounded-2xl cursor-pointer flex flex-col gap-2 transition-all group ${activeChat?.partner._id === conv.partner._id ? 'bg-[#003049] text-white shadow-lg translate-x-2' : 'hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm'}`}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl flex shrink-0 items-center justify-center text-white font-black overflow-hidden shadow-inner ${conv.status === 'Rejected' ? 'bg-slate-300 grayscale' : 'bg-gradient-to-br from-[#7b2cbf] to-[#f77f00]'}`}>
                      {conv.partner.avatar ? <img src={getFullUrl(conv.partner.avatar)} alt="Avatar" className="w-full h-full object-cover" /> : conv.partner.name[0].toUpperCase()}
                    </div>
                    {conv.status === 'Pending' && <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-white rounded-full"></div>}
                    {conv.status === 'Rejected' && <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></div>}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className={`font-bold text-sm truncate ${activeChat?.partner._id === conv.partner._id ? 'text-white' : 'text-[#003049]'}`}>{conv.partner.name}</h4>
                      <span className={`text-[9px] font-bold ${activeChat?.partner._id === conv.partner._id ? 'text-white/60' : 'text-slate-400'}`}>{new Date(conv.lastMessageDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <p className={`text-[11px] truncate ${activeChat?.partner._id === conv.partner._id ? 'text-white/70' : (conv.unreadCount > 0 ? 'text-[#003049] font-bold' : 'text-slate-500')}`}>
                      {conv.status === 'Pending' ? 'Request Pending...' : conv.status === 'Rejected' ? 'Request Declined' : conv.lastMessageText}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && activeChat?.partner._id !== conv.partner._id && (
                    <div className="w-5 h-5 rounded-full bg-[#f77f00] text-white text-[9px] font-black flex items-center justify-center shadow-sm">{conv.unreadCount}</div>
                  )}
                </div>
              </div>
            ))}

            {activeTab === 'requests' && requests.map((req) => (
              <div key={req._id} onClick={() => loadChat({ connectionId: req._id, partner: req.sender, status: 'Pending', isInitiator: false })} className={`p-4 rounded-2xl cursor-pointer flex items-center gap-4 transition-all ${activeChat?.partner._id === req.sender._id ? 'bg-[#f77f00] text-white shadow-lg translate-x-2' : 'hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm'}`}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex shrink-0 items-center justify-center text-white font-black overflow-hidden">
                   {req.sender.avatar ? <img src={getFullUrl(req.sender.avatar)} alt="Avatar" className="w-full h-full object-cover" /> : req.sender.name[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <h4 className={`font-bold text-sm truncate ${activeChat?.partner._id === req.sender._id ? 'text-white' : 'text-[#003049]'}`}>{req.sender.name}</h4>
                  <p className={`text-[9px] uppercase tracking-widest truncate mt-0.5 ${activeChat?.partner._id === req.sender._id ? 'text-white/70' : 'text-slate-400'}`}>Wants to connect</p>
                </div>
              </div>
            ))}
            
            {activeTab === 'chats' && conversations.length === 0 && <div className="text-center p-6 text-slate-400 text-sm font-medium mt-10">No active conversations.</div>}
            {activeTab === 'requests' && requests.length === 0 && <div className="text-center p-6 text-slate-400 text-sm font-medium mt-10">No pending requests.</div>}
          </div>
        </div>

        {/* ==================================================== */}
        {/* RIGHT MAIN: Chat Interface */}
        {/* ==================================================== */}
        <div className="flex-1 flex flex-col bg-[#fdfcfb] relative overflow-hidden">
          {activeChat ? (
            <>
              {/* HEADER */}
              <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black overflow-hidden shadow-sm ${activeChat.status === 'Rejected' ? 'bg-slate-300 grayscale' : 'bg-gradient-to-br from-[#003049] to-[#001f30]'}`}>
                    {activeChat.partner.avatar ? <img src={getFullUrl(activeChat.partner.avatar)} alt="Avatar" className="w-full h-full object-cover" /> : activeChat.partner.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-[#003049] leading-tight cursor-pointer hover:text-[#f77f00]" onClick={() => navigate(`/user/${activeChat.partner._id}`)}>{activeChat.partner.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{activeChat.partner.university || 'User'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate(`/user/${activeChat.partner._id}`)} className="text-xs font-bold text-slate-400 hover:text-[#003049] bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors">Profile</button>
                  <button onClick={handleDeleteConversation} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors" title={activeChat.status === 'Rejected' ? "Remove from list" : "Delete Entire Chat"}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>

              {/* STATUS BANNER (PENDING OR REJECTED) */}
              {activeChat.status === 'Pending' && (
                <div className="bg-amber-50 border-b border-amber-100 p-3 px-6 flex items-center justify-between text-amber-800 text-xs font-bold shrink-0 z-10 shadow-inner">
                  {activeChat.isInitiator ? (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                      <span>Request Pending. You can send messages, but they must accept before replying.</span>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
                      <span>{activeChat.partner.name} wants to connect.</span>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleRejectRequest(activeChat.connectionId)} className="px-4 py-1.5 bg-white text-red-500 border border-red-100 rounded-lg shadow-sm hover:bg-red-50 transition-colors">Decline</button>
                        <button onClick={() => handleAcceptRequest(activeChat.connectionId)} className="px-4 py-1.5 bg-[#f77f00] text-white rounded-lg shadow-sm hover:bg-orange-600 transition-colors">Accept Request</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeChat.status === 'Rejected' && (
                <div className="bg-red-50 border-b border-red-100 p-3 px-6 flex items-center justify-between text-red-800 text-xs font-bold shrink-0 z-10 shadow-inner">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <span>This chat request was declined. You cannot send messages at this time.</span>
                  </div>
                </div>
              )}

              {/* MESSAGES AREA */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative bg-[#fdfcfb]">
                {messages.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-10">
                    <span className="text-4xl mb-4">👋</span>
                    <p className="text-lg font-bold text-[#003049]">You are now connected!</p>
                    <p className="text-sm mt-1">Say hello to {activeChat.partner.name.split(' ')[0]} to start the conversation.</p>
                  </div>
                )}

                {Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
                  <div key={dateLabel}>
                    <div className="flex justify-center my-6">
                      <span className="text-[10px] bg-slate-100/80 text-slate-400 px-4 py-1.5 rounded-full uppercase tracking-widest font-black shadow-sm backdrop-blur-sm">{dateLabel}</span>
                    </div>
                    <div className="space-y-5">
                      {msgs.map((msg, index) => {
                        const isMe = msg.sender === (user.id || user._id);
                        const timeElapsed = Date.now() - new Date(msg.createdAt).getTime();
                        const canEdit = isMe && (timeElapsed < 15 * 60 * 1000) && !msg.attachmentUrl;
                        const isEditingThis = editingMessageId === msg._id;
                        const isDeletingThis = deletingMessageId === msg._id;

                        return (
                          <div key={msg._id || index} className={`flex flex-col w-full group relative ${isMe ? 'items-end' : 'items-start'}`}>
                            
                            {/* --- INLINE EDIT MODE --- */}
                            {isEditingThis ? (
                              <div className="bg-white border-2 border-[#f77f00] p-4 rounded-3xl shadow-xl w-full max-w-sm mb-1 animate-fade-in-down">
                                <textarea
                                  autoFocus
                                  className="w-full text-sm text-slate-700 outline-none resize-none bg-transparent mb-2"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  rows="3"
                                />
                                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                  <button onClick={cancelInlineEdit} className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2 bg-slate-100 rounded-xl transition-colors">Cancel</button>
                                  <button onClick={() => saveInlineEdit(msg._id)} className="text-xs font-bold text-white bg-[#f77f00] hover:bg-orange-600 px-4 py-2 rounded-xl shadow-md transition-all active:scale-95">Save Changes</button>
                                </div>
                              </div>
                            ) : 
                            
                            /* --- INLINE DELETE CONFIRMATION --- */
                            isDeletingThis ? (
                              <div className="bg-red-50 border border-red-200 p-4 rounded-3xl shadow-md w-fit mb-1 flex flex-col items-center gap-3 animate-fade-in-down">
                                <p className="text-xs font-bold text-red-700">Delete this message?</p>
                                <div className="flex gap-2">
                                  <button onClick={() => setDeletingMessageId(null)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200">Cancel</button>
                                  <button onClick={() => confirmDeleteMessage(msg._id)} className="text-[10px] font-black uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg shadow-sm">Delete</button>
                                </div>
                              </div>
                            ) : 
                            
                            /* --- STANDARD MESSAGE BUBBLE --- */
                            (
                              <div className="flex items-center gap-2 relative max-w-[75%]">
                                
                                {/* Hover Action Menu (Left side if 'Me') */}
                                {isMe && !isEditingThis && !isDeletingThis && activeChat.status !== 'Rejected' && (
                                  <div className="absolute top-1/2 -translate-y-1/2 -left-[84px] flex gap-1 opacity-0 group-hover:opacity-100 transition-all bg-white shadow-lg border border-slate-100 rounded-xl p-1 z-10 scale-95 group-hover:scale-100 origin-right">
                                    {canEdit && (
                                      <button onClick={() => initiateInlineEdit(msg)} className="p-2 text-slate-400 hover:text-[#f77f00] hover:bg-orange-50 rounded-lg transition-colors" title="Edit Message">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                      </button>
                                    )}
                                    <button onClick={() => setDeletingMessageId(msg._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Message">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                  </div>
                                )}

                                {/* Premium Attachment Card */}
                                {msg.attachmentUrl ? (
                                  <a href={getFullUrl(msg.attachmentUrl)} target="_blank" rel="noreferrer" className={`flex items-center gap-4 px-6 py-4 rounded-[2rem] shadow-sm text-sm transition-all border ${isMe ? 'bg-[#003049] text-white border-[#003049] rounded-br-sm hover:shadow-md' : 'bg-white border-slate-200 text-[#003049] rounded-bl-sm hover:shadow-md'}`}>
                                    <div className={`p-3 rounded-2xl ${isMe ? 'bg-white/10 text-white' : 'bg-red-50 text-red-500'}`}>
                                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <div className="flex flex-col pr-2">
                                      <span className="font-black truncate max-w-[200px]">{msg.attachmentName || 'Attachment'}</span>
                                      <span className={`text-[10px] uppercase font-bold tracking-widest mt-1 ${isMe ? 'text-white/60' : 'text-slate-400'}`}>Click to open file</span>
                                    </div>
                                  </a>
                                ) : (
                                  /* Text Bubble */
                                  <div className={`px-6 py-4 rounded-3xl shadow-sm text-sm leading-relaxed ${isMe ? 'bg-[#003049] text-white rounded-br-sm' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'}`}>
                                    {msg.text}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Timestamps & Read Receipts */}
                            {!isEditingThis && !isDeletingThis && (
                              <div className="flex items-center gap-1.5 mt-1.5 px-2">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {msg.isEdited && <span className="text-[9px] italic font-medium text-slate-400">(edited)</span>}
                                {isMe && <svg className={`w-3.5 h-3.5 ml-1 ${msg.read ? 'text-blue-500' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={msg.read ? "M5 13l4 4L19 7 M5 18l4 4L19 12" : "M5 13l4 4L19 7"}></path></svg>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Sleek Typing Indicator */}
                {isPartnerTyping && (
                  <div className="flex self-start items-start mr-auto max-w-[75%] animate-fade-in-down">
                    <div className="px-5 py-4 bg-white border border-slate-100 rounded-[2rem] rounded-bl-sm shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-[#f77f00] rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-[#f77f00] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-2 h-2 bg-[#f77f00] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT AREA */}
              <div className={`p-4 bg-white border-t border-slate-100 flex items-end gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] ${isInputLocked ? 'opacity-50 pointer-events-none bg-slate-50' : ''}`}>
                <div className="relative shrink-0">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current.click()} disabled={isUploading || isInputLocked} className="p-3.5 text-slate-400 hover:text-[#f77f00] hover:bg-orange-50 rounded-2xl transition-colors disabled:opacity-50" title="Attach File (PDF/Image)">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                  </button>
                </div>
                <form onSubmit={sendMessage} className="flex-1 flex gap-3 relative">
                  <textarea 
                    rows="1" 
                    placeholder={activeChat.status === 'Rejected' ? "Request declined." : isInputLocked ? "Accept request to reply..." : "Type your message..."} 
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:border-[#f77f00] focus:ring-4 focus:ring-[#f77f00]/10 transition-all text-slate-700 resize-none custom-scrollbar min-h-[56px] max-h-[120px]" 
                    value={newMessage} 
                    onChange={handleTyping} 
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }} 
                    disabled={isInputLocked} 
                  />
                  <button type="submit" disabled={!newMessage.trim() || isInputLocked || isUploading} className="absolute right-2 top-2 bottom-2 bg-[#f77f00] text-white px-5 rounded-xl font-black shadow-md hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 text-center bg-[#fdfcfb]">
              <div className="w-24 h-24 bg-white shadow-sm border border-slate-100 rounded-[2rem] flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              </div>
              <h3 className="text-2xl font-black text-[#003049] mb-2">Your Workspace Chat</h3>
              <p className="max-w-sm leading-relaxed text-sm">Select an active conversation or pending request from the sidebar to start collaborating.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;