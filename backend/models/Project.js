// backend/models/Project.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['To-Do', 'In Progress', 'Done'], default: 'To-Do' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deadline: { type: Date }
});

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requiredSkills: [String],
  researchField: [String],           // New
  duration: { type: String },        // e.g., "3 months", "6 months"
  isPaid: { type: Boolean, default: false },
  mode: { type: String, enum: ['Remote', 'On-site', 'Hybrid'], default: 'Remote' },
  deadline: { type: Date },
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Completed', 'Closed'], 
    default: 'Open' 
  },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tasks: [TaskSchema],
  messages: [{
    sender: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);