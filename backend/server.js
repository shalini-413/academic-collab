// backend/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Project = require('./models/Project'); // Import Project model for persistence
const ChatRequest = require('./models/ChatRequest');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const notificationRoutes = require('./routes/notificationRoutes');
const professorRoutes = require('./routes/professorRoutes');
const path = require('path');
const User = require('./models/User');

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "https://academic-collab-o6lazaylk-shalini-413s-projects.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());


const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || "http://localhost:5173", methods: ["GET", "POST"] }
});
app.set('io', io);

io.on('connection', (socket) => {
  // backend/server.js → Inside io.on('connection', (socket) => {

  // Inside io.on('connection', (socket) => { ... })
  socket.on('join_chat', (userId) => {
    if (userId) {
      socket.userId = userId;
      const roomId = userId.toString();
      socket.join(roomId);
      console.log(`✅ Socket connected: User ${roomId} joined their private room.`);
    }
  });

  socket.on('typing', ({ receiverId }) => {
  if (!socket.userId) return;
  if (!receiverId) return;
  socket.to(receiverId.toString()).emit('user_typing', socket.userId);
});

socket.on('stop_typing', ({ receiverId }) => {
  if (!socket.userId) return;
  if (!receiverId) return;
  socket.to(receiverId.toString()).emit('user_stopped_typing', socket.userId);
});

socket.on('messages_read', ({ receiverId }) => {
  if (!socket.userId) return;
  if (!receiverId) return;
  socket.to(receiverId.toString()).emit('messages_marked_read', socket.userId);
});

socket.on('delete_message', ({ receiverId, messageId }) => {
  if (!socket.userId) return;
  if (!receiverId || !messageId) return;
  socket.to(receiverId.toString()).emit('message_deleted', messageId);
});

socket.on('delete_chat', ({ receiverId }) => {
  if (!socket.userId) return;
  if (!receiverId) return;
  socket.to(receiverId.toString()).emit('chat_deleted', socket.userId);
});

socket.on('edit_message', ({ receiverId, messageData }) => {
  if (!socket.userId) return;
  if (!receiverId || !messageData) return;
  socket.to(receiverId.toString()).emit('message_edited', messageData);
});

  socket.on('send_direct_message', async (data) => {
    try {
      const { receiverId, message, senderId } = data;
      if (!receiverId || !senderId) return;
      const newMessage = new Message({ sender: senderId, receiver: receiverId, text: message });
      await newMessage.save();

      // FEATURE 6: Save notification for the history page
      const sender = await User.findById(senderId);
      await new Notification({
        user: receiverId,
        sender: senderId,
        type: 'message_received',
        title: 'New Message',
        message: `You received a message from ${sender.name}`,
        relatedId: newMessage._id
      }).save();

      io.to(receiverId).emit('receive_direct_message', newMessage);
      io.to(senderId).emit('message_sent', newMessage);
      io.to(receiverId).emit('receive_notification', {
        _id: newMessage._id,
        user: receiverId,
        sender: senderId,
        type: 'message_received',
        title: 'New Message',
        message: `You received a message from ${sender.name}`,
        relatedId: newMessage._id,
        createdAt: new Date()
      });

    } catch (err) {
      console.error(err);
    }
  });

  // Workspace Events
  socket.on('join_project', (projectId) => {
    socket.join(projectId);
    console.log(`✅ User joined project workspace: ${projectId}`);
  });

  socket.on('send_message', async ({ projectId, sender, receiver, text, _id, attachmentUrl, attachmentName, createdAt, read, isEdited }) => {
    try {
      if (!projectId && sender && receiver) {
        socket.to(receiver.toString()).emit('receive_message', {
          _id,
          sender,
          receiver,
          text,
          attachmentUrl,
          attachmentName,
          createdAt,
          read,
          isEdited
        });
        return;
      }
      if (!projectId) return;
      const msg = { sender, text, timestamp: new Date() };
      await Project.findByIdAndUpdate(projectId, { $push: { messages: msg } });
      io.to(projectId).emit('receive_message', msg);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('typing', ({ projectId, username }) => {
    if (!projectId || !username) return;
    socket.to(projectId).emit('user_typing', username);
  });

  socket.on('update_task', async ({ projectId, taskId, status }) => {
    try {
      await Project.updateOne(
        { _id: projectId, "tasks._id": taskId },
        { $set: { "tasks.$.status": status } }
      );
      io.to(projectId).emit('task_updated', { taskId, status });
    } catch (err) {
      console.error(err);
    }
  });

});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/bookmarks', require('./routes/bookmarkRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/professors', professorRoutes);
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

app.use('/api/upload', require('./routes/uploadRoutes'))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// backend/server.js
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('DB Error: ', err));

const PORT = process.env.PORT || 5000;

// FIXED: Changed app.listen to server.listen to correctly mount HTTP wrapper + WebSockets
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});