// backend/models/ChatRequest.js
const mongoose = require('mongoose');

const ChatRequestSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  professor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project' 
  }, // Optional - if request is from a specific project
  initialMessage: { 
    type: String, 
    default: "I would like to discuss regarding your project." 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Rejected'], 
    default: 'Pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('ChatRequest', ChatRequestSchema);