const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { browseFaculty, toggleSaveFaculty, getFacultyOpenProjects } = require('../controllers/facultyController');

router.get('/', verifyToken, checkRole(['Student']), browseFaculty);
router.post('/save/:facultyId', verifyToken, checkRole(['Student']), toggleSaveFaculty);
router.get('/:facultyId/open-projects', verifyToken, checkRole(['Student']), getFacultyOpenProjects);

module.exports = router;

