const express = require('express');
const router = express.Router();
const { toggleSave, getSavedProjects } = require('../controllers/bookmarkController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/toggle/:projectId', verifyToken, toggleSave);
router.get('/saved', verifyToken, getSavedProjects);

router.get('/my-saved', verifyToken, async (req, res) => {
    try {
      const User = require('../models/User');
      // .populate() converts the IDs into full project objects
      const user = await User.findById(req.user.id).populate('savedProjects');
      res.json(user.savedProjects);
    } catch (err) {
      res.status(500).json({ message: "Error fetching bookmarks" });
    }
  });

module.exports = router;