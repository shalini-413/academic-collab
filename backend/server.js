// backend/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Project = require('./models/Project'); // Import Project model for persistence
const Message = require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json());


const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  // backend/server.js → Inside io.on('connection', (socket) => {

  // Direct Messaging - Simplified
  socket.on('join_chat', (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`User joined chat room: ${userId}`);
    }
  });

  socket.on('send_direct_message', async (data) => {
    try {
      const { receiverId, message, senderId } = data;
  
      const newMessage = new Message({ sender: senderId, receiver: receiverId, message });
      await newMessage.save();
  
      // Send real-time message
      io.to(receiverId).emit('receive_direct_message', newMessage);
  
      // === AUTOMATIC NOTIFICATION ===
      await new Notification({
        user: receiverId,
        type: 'message',
        title: 'New Message',
        message: `You have a new message from a user.`,
        relatedId: senderId
      }).save();
  
      socket.emit('message_sent', newMessage);
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
router.post('/create', verifyToken, checkRole(['Professor']), createProject);
router.get('/my-projects', verifyToken, checkRole(['Professor']), getMyProjects);
router.put('/close/:id', verifyToken, checkRole(['Professor']), closeProject);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('DB Error: ', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server on port ${PORT}`));