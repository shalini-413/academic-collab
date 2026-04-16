// frontend/src/components/ProjectWorkspace.jsx
import { useEffect, useState, useContext, useRef } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ProjectWorkspace = ({ projectId }) => {
  const { user, token } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingUser, setTypingUser] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef(null);

  // Initialize Socket once
  useEffect(() => {
    socketRef.current = io('http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join_project', projectId);
    });

    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      socket.disconnect();
    };
  }, [projectId]);

  // Fetch initial project data + setup listeners
  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProject(res.data);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Failed to load workspace:", err);
      }
    };

    fetchWorkspace();

    const socket = socketRef.current;
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };

    const handleTaskUpdated = ({ taskId, status }) => {
      setProject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map(t =>
            t._id === taskId ? { ...t, status } : t
          )
        };
      });
    };

    const handleTyping = (username) => {
      setTypingUser(`${username} is typing...`);
      setTimeout(() => setTypingUser(''), 1800);
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('task_updated', handleTaskUpdated);
    socket.on('user_typing', handleTyping);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('task_updated', handleTaskUpdated);
      socket.off('user_typing', handleTyping);
    };
  }, [projectId, token]);

  const sendMessage = () => {
    if (!text.trim() || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      projectId,
      sender: user?.name || 'Anonymous',
      text: text.trim()
    });
    setText('');
  };

  const toggleTask = (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'Done' ? 'To-Do' : 'Done';
    if (socketRef.current) {
      socketRef.current.emit('update_task', { projectId, taskId, status: nextStatus });
    }
  };

  if (!project) {
    return (
      <div className="p-20 text-center animate-pulse text-[#003049] font-black">
        Loading secure workspace...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
      {/* Tasks Panel */}
      <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <header className="mb-8">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#d62828] mb-2">Milestones</h3>
          <h2 className="text-2xl font-black text-[#003049] tracking-tighter">Active Tasks</h2>
          <p className="text-xs text-slate-400 mt-1">
            {isConnected ? '● Live' : '○ Disconnected'}
          </p>
        </header>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {project.tasks?.length > 0 ? (
            project.tasks.map(task => (
              <div 
                key={task._id} 
                className="group p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-white hover:border-[#fcbf49] transition-all"
              >
                <div className="flex-1">
                  <p className={`text-sm font-bold ${task.status === 'Done' ? 'line-through text-slate-300' : 'text-[#003049]'}`}>
                    {task.title}
                  </p>
                  {task.description && <p className="text-xs text-slate-500 mt-1">{task.description}</p>}
                </div>
                <input 
                  type="checkbox" 
                  checked={task.status === 'Done'}
                  onChange={() => toggleTask(task._id, task.status)}
                  className="w-6 h-6 rounded-lg accent-[#f77f00] cursor-pointer"
                />
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-10">No tasks yet.</p>
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <div className="lg:col-span-8 bg-[#003049] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 bg-white/5 border-b border-white/10 flex justify-between items-center">
          <span className="text-[10px] font-black text-[#fcbf49] uppercase tracking-widest">Team Chat • End-to-End Encrypted</span>
          <span className="text-[10px] text-white/60 italic">{typingUser || '\u00A0'}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === user?.name ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-5 rounded-[1.5rem] text-sm font-medium ${
                msg.sender === user?.name 
                  ? 'bg-[#f77f00] text-white rounded-tr-none shadow-lg shadow-[#f77f00]/20' 
                  : 'bg-white/10 text-white rounded-tl-none border border-white/10'
              }`}>
                <p className="text-[9px] font-black uppercase text-white/50 mb-1">{msg.sender}</p>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-white/5 border-t border-white/10 flex gap-3">
          <input 
            type="text" 
            value={text} 
            placeholder="Type a message..."
            className="flex-1 bg-white/10 border-none rounded-2xl p-4 text-white placeholder-white/40 text-sm focus:ring-2 focus:ring-[#fcbf49] outline-none"
            onChange={(e) => {
              setText(e.target.value);
              if (socketRef.current) {
                socketRef.current.emit('typing', { projectId, username: user?.name });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
          />
          <button 
            onClick={sendMessage}
            disabled={!text.trim()}
            className="bg-[#fcbf49] text-[#003049] px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectWorkspace;