// backend/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/authMiddleware');

// Configure Multer storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Make sure the 'uploads' folder exists in your backend root!
  },
  filename(req, file, cb) {
    // Save file with a unique timestamp to prevent naming collisions
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

const upload = multer({ storage });

// @route   POST /api/upload
// @desc    Upload a file to the local server
// @access  Private
router.post('/', verifyToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  // Return the local path to the file
  res.json({ 
    message: 'File uploaded successfully',
    url: `/uploads/${req.file.filename}` 
  });
});

module.exports = router;