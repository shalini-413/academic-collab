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

const app = express();
app.use(cors());
app.use(express.json());


const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  // backend/server.js → Inside io.on('connection', (socket) => {

// Inside io.on('connection', (socket) => { ... })
socket.on('join_chat', (userId) => {
  if (userId) {
    const roomId = userId.toString();
    socket.join(roomId);
    console.log(`✅ Socket connected: User ${roomId} joined their private room.`);
  }
});

socket.on('send_direct_message', async (data) => {
  try {
    const { receiverId, message, senderId } = data;
    const newMessage = new Message({ sender: senderId, receiver: receiverId, message });
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
app.use('/api/projects/feed', require('./routes/projectFeedRoutes'));
app.use('/api/bookmarks', require('./routes/bookmarkRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/notifications', notificationRoutes);
app.use('/api/professors', professorRoutes);


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('DB Error: ', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server on port ${PORT}`));