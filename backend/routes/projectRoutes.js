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
  getRecommendedProfessors,
  updateProject,        // ← Added
  deleteProject,        // ← Added
  closeProject          // ← Added
} = require('../controllers/projectController');

const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// ==================== PROFESSOR ROUTES ====================
router.post('/create', verifyToken, checkRole(['Professor']), createProject);
router.get('/my-projects', verifyToken, checkRole(['Professor']), getMyProjects);
router.put('/update/:id', verifyToken, checkRole(['Professor']), updateProject);
router.delete('/delete/:id', verifyToken, checkRole(['Professor']), deleteProject);
router.put('/close/:id', verifyToken, checkRole(['Professor']), closeProject);

// ==================== STUDENT ROUTES ====================
router.get('/recommendations', verifyToken, checkRole(['Student']), getRecommendedProjects);
router.get('/recommend-professors', verifyToken, checkRole(['Student']), getRecommendedProfessors);
router.post('/apply/:id', verifyToken, checkRole(['Student']), applyForProject);
router.get('/my-applications', verifyToken, checkRole(['Student']), getMyApplications);

// ==================== PUBLIC FEED ====================
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

// ==================== PROJECT DETAIL ====================
router.get('/:id', verifyToken, getProjectDetails);

module.exports = router;