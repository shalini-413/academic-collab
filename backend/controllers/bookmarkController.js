// backend/controllers/bookmarkController.js
const User = require('../models/User');

const toggleSave = async (req, res) => {
  try {
    const studentId = req.user.id;
    const projectId = req.params.projectId;

    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Initialize array if it doesn't exist
    if (!Array.isArray(user.savedProjects)) {
      user.savedProjects = [];
    }

    const isAlreadySaved = user.savedProjects.some(id => id.toString() === projectId);

    if (isAlreadySaved) {
      user.savedProjects = user.savedProjects.filter(id => id.toString() !== projectId);
      await user.save();
      return res.json({ message: "Project removed from saved", action: "removed" });
    } else {
      user.savedProjects.push(projectId);
      await user.save();
      return res.json({ message: "Project saved successfully", action: "saved" });
    }
  } catch (err) {
    console.error("Bookmark Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getSavedProjects = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'savedProjects',
        select: 'title description professor requiredSkills researchField duration isPaid mode deadline status createdAt',
        populate: {
          path: 'professor',
          select: 'name university avatar'
        }
      });

    res.json(user?.savedProjects || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { toggleSave, getSavedProjects };
