const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');

router.get('/', verifyToken, getNotifications);
router.put('/:id/read', verifyToken, markAsRead);
router.put('/read-all', verifyToken, markAllAsRead);

module.exports = router;