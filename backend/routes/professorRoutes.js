const express = require('express');
const router = express.Router();
const { getProfessorDashboard } = require('../controllers/professorController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/dashboard', verifyToken, getProfessorDashboard); // This makes /api/professors/dashboard

module.exports = router;