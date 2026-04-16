// backend/models/Application.js
const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  coverLetter: { type: String, required: true },

  // ← Changed: Now stores actual uploaded file URL (Cloudinary / local)
  resumeUrl: { type: String },

  additionalLinks: [{
    title: String,
    url: String
  }],

  status: { 
    type: String, 
    enum: ['Applied', 'Shortlisted', 'Accepted', 'Rejected'], 
    default: 'Applied' 
  },

  studentSnapshot: {
    name: String,
    email: String,
    university: String,
    bio: String,
    skills: [String],
    researchInterests: [String],
    github: String,
    linkedin: String,
    portfolio: String,
    resumeUrl: String
  },

  appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);