const express = require('express');
const router = express.Router();
const { getDashboardStats, deleteUser, deleteProject } = require('../controllers/adminController');
// FIXED: Changed 'middlerware' to 'middleware'
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// ALL routes require Admin role
router.get('/dashboard', verifyToken, checkRole(['Admin']), getDashboardStats);
router.delete('/user/:id', verifyToken, checkRole(['Admin']), deleteUser);
router.delete('/project/:id', verifyToken, checkRole(['Admin']), deleteProject);

module.exports = router;