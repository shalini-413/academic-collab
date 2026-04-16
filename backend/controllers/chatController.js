// backend/controllers/chatController.js
const ChatRequest = require('../models/ChatRequest');
const Message = require('../models/Message');

// Send Chat Request (works both ways: student → professor or professor → student)
const sendChatRequest = async (req, res) => {
  try {
    const { receiverId, projectId, initialMessage } = req.body;
    const senderId = req.user.id;

    // Prevent sending request to self
    if (senderId === receiverId) {
      return res.status(400).json({ message: "Cannot send request to yourself" });
    }

    const existing = await ChatRequest.findOne({
      $or: [
        { student: senderId, professor: receiverId },
        { student: receiverId, professor: senderId }
      ],
      status: 'Pending'
    });

    if (existing) {
      return res.status(400).json({ message: "A chat request already exists" });
    }

    const newRequest = new ChatRequest({
      student: senderId.role === 'Student' ? senderId : receiverId,
      professor: senderId.role === 'Professor' ? senderId : receiverId,
      project: projectId,
      initialMessage: initialMessage || "I would like to connect and discuss.",
      status: 'Pending'
    });

    await newRequest.save();

    res.status(201).json({ 
      success: true, 
      message: "Chat request sent successfully. Waiting for acceptance." 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Pending Chat Requests for current user
const getMyChatRequests = async (req, res) => {
  try {
    const requests = await ChatRequest.find({
      $or: [
        { student: req.user.id, status: 'Pending' },
        { professor: req.user.id, status: 'Pending' }
      ]
    })
    .populate('student', 'name email university')
    .populate('professor', 'name email university')
    .populate('project', 'title')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Accept or Reject Request
const respondToRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body; // action = "Accepted" or "Rejected"

    const request = await ChatRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.student.toString() !== req.user.id && request.professor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    request.status = action;
    await request.save();

    res.json({ 
      success: true, 
      message: `Request ${action.toLowerCase()} successfully` 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { sendChatRequest, getMyChatRequests, respondToRequest };