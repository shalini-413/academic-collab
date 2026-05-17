// backend/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const { matchingEngine } = require('../utils/aiMatcher');

const projectController = require('../controllers/projectController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// ==================== PROFESSOR ROUTES ====================
router.post('/create', verifyToken, checkRole(['Professor']), projectController.createProject);
router.get('/my-projects', verifyToken, checkRole(['Professor']), projectController.getMyProjects);
router.put('/update/:id', verifyToken, checkRole(['Professor']), projectController.updateProject);
router.delete('/delete/:id', verifyToken, checkRole(['Professor']), projectController.deleteProject);
router.put('/close/:id', verifyToken, checkRole(['Professor']), projectController.closeProject);

// ==================== STUDENT ROUTES ====================
router.get('/recommended', verifyToken, projectController.getRecommendedProjects);
router.get('/recommend-professors', verifyToken, checkRole(['Student']), projectController.getRecommendedProfessors);
router.post('/apply/:id', verifyToken, checkRole(['Student']), projectController.applyForProject);
router.get('/my-applications', verifyToken, checkRole(['Student']), projectController.getMyApplications);

// ==================== PUBLIC FEED ====================
router.get('/feed', verifyToken, async (req, res) => {
  try {
    const projects = await Project.find({ status: 'Open', visibility: { $ne: 'Hidden' } })
      .populate('professor', 'name university avatar')
      .sort({ createdAt: -1 });
    const currentUser = await User.findById(req.user.id).select('skills researchInterests department bio role');
    const scoredProjects = currentUser?.role === 'Student'
      ? projects.map((project) => {
          const match = matchingEngine.getStudentProjectMatchScore(currentUser, project);
          return {
            ...project.toObject(),
            matchScore: match.matchScore,
            matchedDetails: match.matchedDetails
          };
        })
      : projects.map((project) => project.toObject());
    scoredProjects.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    res.json(scoredProjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== MATCH SCORE ENDPOINTS ====================
router.get('/:projectId/match/:studentId', verifyToken, async (req, res) => {
  try {
    const { projectId, studentId } = req.params;
    
    const [student, project] = await Promise.all([
      User.findById(studentId).select('skills researchInterests bio department'),
      Project.findById(projectId).populate('professor', 'name university')
    ]);
    
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    const match = matchingEngine.getStudentProjectMatchScore(student, project);
    
    res.json({
      studentId,
      projectId,
      matchScore: match.matchScore,
      matchedDetails: match.matchedDetails,
      professorName: project.professor?.name,
      professorUniversity: project.professor?.university
    });
  } catch (error) {
    console.error('Match score error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/match/batch', verifyToken, async (req, res) => {
  try {
    const { projectIds, studentId } = req.query;
    
    if (!studentId) return res.status(400).json({ message: 'Student ID required' });
    
    const student = await User.findById(studentId).select('skills researchInterests bio department');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    const projectIdsArray = projectIds ? projectIds.split(',') : [];
    let projects;
    
    if (projectIdsArray.length > 0) {
      projects = await Project.find({ _id: { $in: projectIdsArray } })
        .populate('professor', 'name university');
    } else {
      projects = await Project.find({ status: 'Open', visibility: { $ne: 'Hidden' } })
        .populate('professor', 'name university')
        .limit(50);
    }
    
    const matchScores = projects.map(project => {
      const match = matchingEngine.getStudentProjectMatchScore(student, project);
      return {
        projectId: project._id,
        matchScore: match.matchScore,
        matchedDetails: match.matchedDetails,
        professorName: project.professor?.name,
        professorUniversity: project.professor?.university
      };
    });
    
    res.json(matchScores);
  } catch (error) {
    console.error('Batch match score error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Changed 'auth' to 'verifyToken' to match your middleware exports
router.get('/professor/:id', verifyToken, async (req, res) => {
  try {
    const projects = await Project.find({ 
      professor: req.params.id,
      status: 'Open' // We usually only want to show 'Open' projects on a public profile
    }).sort({ createdAt: -1 }); // Sort by newest first

    res.json(projects);
  } catch (error) {
    console.error("Fetch Professor Projects Error:", error);
    res.status(500).json({ message: 'Server error retrieving projects' });
  }
});

// ==================== PROJECT DETAIL ====================
router.get('/:id', verifyToken, projectController.getProjectDetails);

module.exports = router;
