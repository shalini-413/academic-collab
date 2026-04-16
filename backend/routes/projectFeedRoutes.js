// backend/routes/projectFeedRoutes.js
const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { verifyToken } = require('../middleware/authMiddleware');

// GET All Projects for Feed - Only needs login (no role restriction)
router.get('/', verifyToken, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('professor', 'name university')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while loading feed" });
  }
});

module.exports = router;