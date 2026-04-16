// backend/routes/applicationRoutes.js
const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { applyToProject, getMyApplications } = require('../controllers/applicationController');

// Apply with resume file upload
router.post('/apply', verifyToken, upload.single('resume'), applyToProject);

router.get('/my-applications', verifyToken, getMyApplications);

module.exports = router;