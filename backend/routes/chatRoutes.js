// // backend/routes/chatRoutes.js
// const express = require('express');
// const router = express.Router();
// const { verifyToken } = require('../middleware/authMiddleware');
// const { sendChatRequest, getMyChatRequests, respondToRequest, getActiveChats, getChatHistory } = require('../controllers/chatController');

// router.post('/request', verifyToken, sendChatRequest);
// router.get('/requests', verifyToken, getMyChatRequests);
// router.post('/respond', verifyToken, respondToRequest);

// // NEW ROUTES
// router.get('/active', verifyToken, getActiveChats);
// router.get('/history/:otherUserId', verifyToken, getChatHistory);

// module.exports = router;




// backend/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { 
  sendRequest, getPendingRequests, acceptRequest, rejectRequest,
  getConversations, getChatHistory, sendMessage, checkChatStatus, markAsRead,
  deleteMessage, deleteConversation, editMessage // <-- Added editMessage
} = require('../controllers/chatController');

router.post('/request', verifyToken, sendRequest);
router.get('/requests/pending', verifyToken, getPendingRequests);
router.put('/request/:id/accept', verifyToken, acceptRequest);
router.put('/request/:id/reject', verifyToken, rejectRequest);

router.get('/conversations', verifyToken, getConversations);
router.get('/history/:partnerId', verifyToken, getChatHistory);
router.post('/send', verifyToken, sendMessage);
router.put('/read/:partnerId', verifyToken, markAsRead);

// Deletion & Editing Routes
router.delete('/message/:messageId', verifyToken, deleteMessage);
router.put('/message/:messageId', verifyToken, editMessage); // <-- NEW
router.delete('/conversation/:partnerId', verifyToken, deleteConversation);

router.get('/status/:userId', verifyToken, checkChatStatus);

module.exports = router;