const express = require('express');
const { 
  applyToProject, 
  getMyApplications, 
  getProjectApplications, 
  updateApplicationStatus,
  bulkUpdateApplicationStatus
} = require('../controllers/applicationController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const upload = require('../middleware/upload'); 

const router = express.Router();

// Student Routes
router.post('/apply', verifyToken, checkRole(['Student']), upload.single('resume'), applyToProject);
router.get('/my-applications', verifyToken, checkRole(['Student']), getMyApplications);

// Professor Routes
router.get('/project/:projectId', verifyToken, checkRole(['Professor']), getProjectApplications);

// Shared Route (Controller checks role logic)
router.put('/status', verifyToken, updateApplicationStatus);
router.put('/bulk-status', verifyToken, checkRole(['Professor']), bulkUpdateApplicationStatus);

module.exports = router;
