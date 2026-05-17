const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Professor', 'Admin'], required: true },
  
  // Profile Fields
  avatar: { type: String, default: "" }, // <-- The PFP field
  university: { type: String, default: "" },
  designation: { type: String, default: "" }, 
  department: { type: String, default: "" },
  bio: { type: String, default: "" },
  skills: [{ type: String }],
  researchInterests: [{ type: String }],
  
  // Social & Academic Links
  github: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  portfolio: { type: String, default: "" },
  googleScholar: { type: String, default: "" },
  
  // Documents
  resumeUrl: { type: String, default: "" },
  
  // Professor Specific
  publications: [{ title: String, link: String }],
  additionalLinks: [{ title: String, url: String }],
  
  // Privacy & Settings
  privacySettings: {
    profilePublic: { type: Boolean, default: true },
    showEmail: { type: Boolean, default: false },
    showUniversity: { type: Boolean, default: true },
    showSkills: { type: Boolean, default: true },
    showBio: { type: Boolean, default: true }
  },

  savedProjects: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project' 
  }],

  savedFaculty: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

// Password Hashing Hook
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Cascade Delete Hook
userSchema.pre('findOneAndDelete', async function () {
  const userId = this.getQuery()._id;
  await mongoose.model('Project').deleteMany({ professor: userId });
  await mongoose.model('Application').deleteMany({ student: userId });
  await mongoose.model('ChatRequest').deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });
  await mongoose.model('Message').deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });
});

module.exports = mongoose.model('User', userSchema);
