// backend/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { sendChatRequest, getMyChatRequests, respondToRequest } = require('../controllers/chatController');

router.post('/request', verifyToken, sendChatRequest);
router.get('/requests', verifyToken, getMyChatRequests);
router.post('/respond', verifyToken, respondToRequest);

module.exports = router;