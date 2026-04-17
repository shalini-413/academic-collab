// backend/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { sendChatRequest, getMyChatRequests, respondToRequest, getActiveChats, getChatHistory } = require('../controllers/chatController');

router.post('/request', verifyToken, sendChatRequest);
router.get('/requests', verifyToken, getMyChatRequests);
router.post('/respond', verifyToken, respondToRequest);

// NEW ROUTES
router.get('/active', verifyToken, getActiveChats);
router.get('/history/:otherUserId', verifyToken, getChatHistory);

module.exports = router;