const express = require('express');
const { 
  applyToProject, 
  getMyApplications, 
  getProjectApplications, 
  updateApplicationStatus 
} = require('../controllers/applicationController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const upload = require('../middleware/upload'); 

const router = express.Router();

// Student Routes
router.post('/apply', verifyToken, checkRole(['Student']), upload.single('resume'), applyToProject);
router.get('/my-applications', verifyToken, checkRole(['Student']), getMyApplications);

// Professor Routes
router.get('/project/:projectId', verifyToken, checkRole(['Professor']), getProjectApplications);
router.put('/status', verifyToken, checkRole(['Professor']), updateApplicationStatus);

module.exports = router;