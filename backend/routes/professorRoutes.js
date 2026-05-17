const express = require('express');
const router = express.Router();
const {
  getProfessorDashboard,
  browseStudents,
  getDiscoveryProjects,
  getRecommendedStudents,
  inviteStudent
} = require('../controllers/professorController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/dashboard', verifyToken, checkRole(['Professor']), getProfessorDashboard);
router.get('/students', verifyToken, checkRole(['Professor']), browseStudents);
router.get('/discovery-projects', verifyToken, checkRole(['Professor']), getDiscoveryProjects);
router.get('/recommend-students', verifyToken, checkRole(['Professor']), getRecommendedStudents);
router.post('/invite', verifyToken, checkRole(['Professor']), inviteStudent);

module.exports = router;
