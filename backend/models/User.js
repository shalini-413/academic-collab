// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Professor', 'Admin'], required: true },
  
  // New fields for Student Profile
  university: { type: String, default: "" },
  country: { type: String, default: "" },
  bio: { type: String, default: "" },
  skills: [{ type: String }],
  researchInterests: [{ type: String }],
  
  // Links
  github: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  portfolio: { type: String, default: "" },
  
  // Resume
  resumeUrl: { type: String, default: "" },
  
  // Student's own projects
  myProjects: [{
    title: String,
    description: String,
    link: String,
    date: { type: Date, default: Date.now }
  }],

  savedProjects: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project' 
  }],

  privacySettings: {
    profilePublic: { type: Boolean, default: true },
    showEmail: { type: Boolean, default: false },
    showUniversity: { type: Boolean, default: true },
    showSkills: { type: Boolean, default: true },
    showBio: { type: Boolean, default: true }
  },

  designation: { type: String, default: "" }, 
  publications: [{ title: String, link: String, year: Number }],
  googleScholar: { type: String, default: "" },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

// === MODERN ASYNC HOOK (No 'next' needed) ===
userSchema.pre('save', async function() {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return;
  
  // Mongoose automatically catches errors in async hooks
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
module.exports = mongoose.model('User', userSchema);