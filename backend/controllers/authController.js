// backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  updateStudentProfile,
  decorateStudentProfile
} = require('../student/services/studentProfileService');
const {
  updateProfessorProfile,
  decorateProfessorProfile
} = require('../professor/services/professorProfileService');

const ALLOWED_ROLES = ['Student', 'Professor', 'Admin'];

const normalizeRole = (role) => {
  const normalized = String(role || 'Student').trim().toLowerCase();
  if (normalized === 'professor') return 'Professor';
  if (normalized === 'admin') return 'Admin';
  return 'Student';
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  skills: user.skills || [],
  avatar: user.avatar || ''
});

exports.register = async (req, res) => {
  try {
    const { name, email, password, skills } = req.body;
    const role = normalizeRole(req.body.role);

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    // --- Strict Password Enforcement ---
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number." 
      });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      skills: Array.isArray(skills) ? skills : []
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!", user: publicUser(newUser) });
  } catch (error) {
    console.error("Registration Logic Error:", error);
    res.status(500).json({ message: "Server Error during registration", error: error.message });
  }
};

// In updateProfile function
// backend/controllers/authController.js

// backend/controllers/authController.js
// Keep only this version and ensure it includes professor-specific fields
exports.updateProfile = async (req, res) => {
  try {
    // 1. Whitelist allowed fields to prevent Mass Assignment attacks
    const allowedFields = [
      'name', 'avatar', 'university', 'designation', 'department', 
      'bio', 'skills', 'researchInterests', 'github', 'linkedin', 
      'portfolio', 'googleScholar', 'resumeUrl', 'privacySettings'
    ];

    let updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Formatting for Tag-based research fields
    if (updates.researchInterests) {
      updates.researchInterests = Array.isArray(updates.researchInterests) 
        ? updates.researchInterests 
        : updates.researchInterests.split(',').map(s => s.trim()).filter(Boolean);
    }

    const user = req.user.role === 'Professor'
      ? await updateProfessorProfile(req.user.id, updates)
      : await updateStudentProfile(req.user.id, updates);

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ... include login and getProfile as previously defined

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'development-only-secret',
      { expiresIn: '1d' }
    );

    res.status(200).json({ 
      token, 
      user: publicUser(user)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });

        const profile = user.role === 'Professor'
          ? decorateProfessorProfile(user)
          : decorateStudentProfile(user);

        res.json(profile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
