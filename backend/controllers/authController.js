// backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, skills } = req.body;

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      email: email.trim().toLowerCase(),
      password, // Plain text here; User.js hashes it
      role,
      skills: Array.isArray(skills) ? skills : []
    });

    await newUser.save(); // This triggers the pre-save hook
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Registration Logic Error:", error);
    res.status(500).json({ message: "Server Error during registration", error: error.message });
  }
};

// In updateProfile function
// backend/controllers/authController.js

// backend/controllers/authController.js
exports.updateProfile = async (req, res) => {
  try {
    let updates = { ...req.body };

    // Force arrays to be proper arrays
    if (updates.skills) {
      updates.skills = Array.isArray(updates.skills) ? updates.skills : 
                       typeof updates.skills === 'string' ? updates.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
    }

    if (updates.researchInterests) {
      updates.researchInterests = Array.isArray(updates.researchInterests) ? updates.researchInterests : 
                                  typeof updates.researchInterests === 'string' ? updates.researchInterests.split(',').map(s => s.trim()).filter(Boolean) : [];
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ 
      message: "Profile updated successfully", 
      user 
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Helper function for completion %
function calculateProfileCompletion(user) {
  let score = 20; // base for name + email
  if (user.university) score += 10;
  if (user.bio && user.bio.length > 30) score += 15;
  if (user.skills && user.skills.length >= 3) score += 20;
  if (user.researchInterests && user.researchInterests.length >= 2) score += 15;
  if (user.github || user.linkedin || user.portfolio) score += 10;
  if (user.resumeUrl) score += 10;
  return Math.min(score, 100);
}
// ... include login and getProfile as previously defined

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(200).json({ 
      token, 
      user: { id: user._id, name: user.name, role: user.role, skills: user.skills } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// NEW: Profile Update Logic
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    // Don't allow password updates through this specific route for security
    delete updates.password; 
    
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};