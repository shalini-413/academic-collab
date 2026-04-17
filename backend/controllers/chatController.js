const ChatRequest = require('../models/ChatRequest'); // <--- THIS LINE IS CRUCIAL
const Message = require('../models/Message');
const User = require('../models/User');

exports.sendChatRequest = async (req, res) => {
  try {
    const { receiverId, projectId, initialMessage } = req.body;
    const senderId = req.user.id;
    const senderRole = req.user.role;

    if (senderId === receiverId) return res.status(400).json({ message: "Apne aap ko request nahi bhej sakte." });

    // Check existing request
    const existing = await ChatRequest.findOne({
      project: projectId,
      $or: [
        { student: senderId, professor: receiverId },
        { student: receiverId, professor: senderId }
      ]
    });

    if (existing) return res.status(400).json({ message: "conection already exists" });

    const newRequest = new ChatRequest({
      student: senderRole === 'Student' ? senderId : receiverId,
      professor: senderRole === 'Professor' ? senderId : receiverId,
      project: projectId,
      initialMessage: initialMessage || "I'd like to discuss this project.",
      status: 'Pending',
      // Kaun initiate kar raha hai? Isse Accept/Reject logic easy ho jayega
      initiatedBy: senderId 
    });

    await newRequest.save();
    res.status(201).json({ success: true, message: "Chat request bhej di gayi hai!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

  // Inside sendChatRequest, after await newRequest.save():
await new Notification({
  user: receiverId, 
  sender: req.user.id,
  type: 'chat_request',
  title: 'New Chat Request',
  message: `${req.user.name} wants to connect regarding the project.`,
  relatedId: projectId
}).save();
};

exports.respondToRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    
    // Authorization check added
    const request = await ChatRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request nahi mili." });

    // Sirf wahi accept kar sakta hai jise request mili ho (receiver)
    if (request.initiatedBy.toString() === req.user.id) {
      return res.status(403).json({ message: "Aap apni hi bheji hui request accept nahi kar sakte." });
    }

    request.status = action;
    await request.save();
    res.json({ success: true, message: `Request ${action.toLowerCase()} successfully.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getActiveChats = async (req, res) => {
  try {
    const userId = req.user.id.toString(); // Force to String
    const chats = await ChatRequest.find({
      $or: [{ student: userId }, { professor: userId }],
      status: 'Accepted'
    })
    .populate('student', 'name email role')
    .populate('professor', 'name email role')
    .populate('project', 'title');

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyChatRequests = async (req, res) => {
  try {
    const requests = await ChatRequest.find({
      $or: [{ student: req.user.id, status: 'Pending' }, { professor: req.user.id, status: 'Pending' }]
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

exports.respondToRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    const request = await ChatRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });
    request.status = action;
    await request.save();
    res.json({ success: true, message: `Request ${action.toLowerCase()} successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};