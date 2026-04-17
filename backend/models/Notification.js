const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Receiver
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who triggered it
  type: { 
    type: String, 
    enum: ['application_received', 'message_received', 'application_status', 'deadline_reminder', 'chat_request'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // Project ID or Chat ID
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);