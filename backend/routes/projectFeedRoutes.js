// backend/routes/projectFeedRoutes.js
const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { verifyToken } = require('../middleware/authMiddleware');

// GET All Projects for Feed - Only needs login (no role restriction)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { q, isPaid, mode } = req.query;
    let query = { status: 'Open' }; // only show Open projects in feed

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { requiredSkills: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (isPaid === 'true') query.isPaid = true;
    if (isPaid === 'false') query.isPaid = false;
    if (mode && mode !== '') query.mode = mode;

    const projects = await Project.find(query)
      .populate('professor', 'name university')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while loading feed" });
  }
});

module.exports = router;