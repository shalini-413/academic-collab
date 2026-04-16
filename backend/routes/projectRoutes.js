// backend/routes/projectRoutes.js
const express = require('express');
const router = express.Router();

const { 
  createProject, 
  getRecommendedProjects, 
  applyForProject, 
  approveStudent,
  rejectStudent,       
  getMyApplications,   
  getProjectDetails,
  getMyProjects,
  getRecommendedProfessors   // ← Add this line
} = require('../controllers/projectController');

const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// ==================== PROFESSOR ROUTES ====================
router.post('/create', verifyToken, checkRole(['Professor']), createProject);
router.post('/approve', verifyToken, checkRole(['Professor']), approveStudent);
router.post('/reject', verifyToken, checkRole(['Professor']), rejectStudent);
router.get('/my-projects', verifyToken, checkRole(['Professor']), getMyProjects);

// ==================== STUDENT ROUTES ====================
router.get('/recommendations', verifyToken, checkRole(['Student']), getRecommendedProjects);
router.get('/recommend-professors', verifyToken, checkRole(['Student']), getRecommendedProfessors);  // ← New route
router.post('/apply/:id', verifyToken, checkRole(['Student']), applyForProject);
router.get('/my-applications', verifyToken, checkRole(['Student']), getMyApplications);

// ==================== PUBLIC FEED ROUTE ====================
router.get('/feed', verifyToken, async (req, res) => {
  try {
    const projects = await require('../models/Project').find()
      .populate('professor', 'name university')
      .sort({ createdAt: -1 });
    
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== SPECIFIC PROJECT DETAIL ====================
router.get('/:id', verifyToken, getProjectDetails);

module.exports = router;