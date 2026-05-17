// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); 

// CORRECTED: Import 'verifyToken' instead of 'protect'
const { verifyToken } = require('../middleware/authMiddleware'); 

// @route   GET /api/users/:id
// @desc    Get public profile of any user by ID
// @access  Private (Requires token)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    // Fetch the user but EXCLUDE the password and other sensitive backend fields
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error("Fetch User Error:", error);
    // If the ID is poorly formatted, it throws a CastError
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error retrieving user' });
  }
});

module.exports = router;