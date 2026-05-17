// backend/controllers/chatController.js
const ChatRequest = require('../models/ChatRequest');
const Message = require('../models/Message');
const User = require('../models/User');
const Project = require('../models/Project');
const Notification = require('../models/Notification'); 
const mongoose = require('mongoose');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ''));
const normalizeOptionalObjectId = (value) => {
  if (value === undefined || value === null || value === '') return null;
  return isValidObjectId(value) ? value : false;
};

const getConversationKey = (userA, userB) => [String(userA), String(userB)].sort().join(':');

const serializeRequest = (request, currentUserId) => ({
  request,
  connectionId: request._id,
  status: request.status,
  partnerId: request.sender.toString() === currentUserId ? request.receiver : request.sender,
  isInitiator: request.sender.toString() === currentUserId
});

// --- HELPER: Safely generate database notifications ---
const sendNotification = async (req, receiverId, messageText, type) => {
  try {
    if (!Notification) return; 
    await Notification.create({
      user: receiverId,
      recipient: receiverId, 
      message: messageText,
      title: type,
      type: type,
      isRead: false
    });
    
    if (req.app && req.app.get('io')) {
      req.app.get('io').to(receiverId.toString()).emit('new_notification');
    }
  } catch (err) {
    console.error("Notification creation failed:", err.message);
  }
};

exports.sendRequest = async (req, res) => {
  try {
    const { receiverId, projectId, initialMessage } = req.body;
    if (!receiverId || !isValidObjectId(receiverId)) {
      return res.status(400).json({ message: 'Valid receiver is required.' });
    }

    if (receiverId.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'You cannot start a chat with yourself.' });
    }

    const receiver = await User.findById(receiverId).select('_id');
    if (!receiver) return res.status(404).json({ message: 'User not found.' });

    const normalizedProjectId = normalizeOptionalObjectId(projectId);
    if (normalizedProjectId === false) {
      return res.status(400).json({ message: 'Invalid project id.' });
    }

    if (normalizedProjectId) {
      const project = await Project.findById(normalizedProjectId).select('_id');
      if (!project) return res.status(404).json({ message: 'Project not found.' });
    }

    const conversationKey = getConversationKey(req.user.id, receiverId);
    const messageText = String(initialMessage || '').trim();

    const existingReq = await ChatRequest.findOne({
      $or: [
        { conversationKey },
        { sender: req.user.id, receiver: receiverId },
        { sender: receiverId, receiver: req.user.id }
      ]
    });

    if (existingReq) {
      if (!existingReq.conversationKey) {
        existingReq.conversationKey = conversationKey;
        await existingReq.save();
      }

      if (existingReq.status === 'Rejected') {
        existingReq.status = 'Pending';
        existingReq.sender = req.user.id;
        existingReq.receiver = receiverId;
        if (normalizedProjectId) existingReq.project = normalizedProjectId;
        else existingReq.project = undefined;
        existingReq.initialMessage = messageText;
        await existingReq.save();
        if (messageText) {
          await Message.create({ sender: req.user.id, receiver: receiverId, text: messageText });
        }
        
        const sender = await User.findById(req.user.id);
        await sendNotification(req, receiverId, `${sender ? sender.name : 'Someone'} wants to connect and sent a chat request.`, 'chat_request');
        return res.status(200).json({ action: 'reopened', ...serializeRequest(existingReq, req.user.id) });
      }

      return res.status(200).json({ action: 'existing', ...serializeRequest(existingReq, req.user.id) });
    }

    const payload = {
      sender: req.user.id,
      receiver: receiverId,
      conversationKey,
      initialMessage: messageText
    };
    if (normalizedProjectId) payload.project = normalizedProjectId;

    let newRequest;
    try {
      newRequest = await ChatRequest.create(payload);
    } catch (createError) {
      if (createError.code === 11000) {
        const retryExisting = await ChatRequest.findOne({
          $or: [
            { conversationKey: getConversationKey(req.user.id, receiverId) },
            { sender: req.user.id, receiver: receiverId },
            { sender: receiverId, receiver: req.user.id }
          ]
        });
        if (retryExisting) {
          return res.status(200).json({ action: 'existing', ...serializeRequest(retryExisting, req.user.id) });
        }
      }
      throw createError;
    }

    if (messageText) {
      await Message.create({ sender: req.user.id, receiver: receiverId, text: messageText });
    }
    
    const sender = await User.findById(req.user.id);
    await sendNotification(req, receiverId, `${sender ? sender.name : 'Someone'} wants to connect and sent a chat request.`, 'chat_request');

    res.status(201).json({ action: 'created', ...serializeRequest(newRequest, req.user.id) });
  } catch (error) {
    console.error('sendRequest error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid request id.' });
    const request = await ChatRequest.findById(req.params.id).populate('receiver', 'name');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.receiver._id.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    request.status = 'Accepted';
    await request.save();

    await sendNotification(req, request.sender, `${request.receiver.name} accepted your chat request!`, 'chat_accepted');

    res.json({ message: 'Chat request accepted', request });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.rejectRequest = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid request id.' });
    const request = await ChatRequest.findById(req.params.id).populate('receiver', 'name');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'Rejected';
    await request.save();

    // Alert the sender that they were declined with a Notification
    await sendNotification(req, request.sender, `${request.receiver.name} declined your chat request.`, 'chat_rejected');

    // Instantly ping the sender's socket to update their Messages page
    if (req.app && req.app.get('io')) {
      req.app.get('io').to(request.sender.toString()).emit('request_rejected_live', request._id);
    }

    res.json({ message: 'Chat request rejected' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text, attachmentUrl, attachmentName } = req.body;
    if (!receiverId || !isValidObjectId(receiverId)) {
      return res.status(400).json({ message: 'Valid receiver is required.' });
    }

    const connection = await ChatRequest.findOne({
      $or: [
        { conversationKey: getConversationKey(req.user.id, receiverId) },
        { sender: req.user.id, receiver: receiverId },
        { sender: receiverId, receiver: req.user.id }
      ],
      status: { $in: ['Accepted', 'Pending'] }
    });

    if (!connection) return res.status(403).json({ message: 'Start a chat request before sending messages.' });
    if (connection.status === 'Pending' && connection.receiver.toString() === req.user.id) {
      return res.status(403).json({ message: 'Accept this chat request before replying.' });
    }

    const msg = await Message.create({ sender: req.user.id, receiver: receiverId, text, attachmentUrl, attachmentName });
    
    const sender = await User.findById(req.user.id);
    const notifMsg = `New message from ${sender ? sender.name : 'a connection'}`;
    
    const recentThreshold = new Date(Date.now() - 5 * 60 * 1000);
    const existingNotif = await Notification.findOne({
      $or: [{ user: receiverId }, { recipient: receiverId }],
      type: 'new_message',
      sender: req.user.id,
      isRead: false,
      createdAt: { $gte: recentThreshold }
    }).sort({ createdAt: -1 });

    if (!existingNotif) {
      await sendNotification(req, receiverId, notifMsg, 'new_message');
    } else {
      if (req.app && req.app.get('io')) {
        req.app.get('io').to(receiverId.toString()).emit('new_notification');
      }
    }

    res.status(201).json(msg);
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await ChatRequest.find({ receiver: req.user.id, status: 'Pending' })
      .populate('sender', 'name avatar university role')
      .populate('project', 'title').sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getConversations = async (req, res) => {
  try {
    const connections = await ChatRequest.find({
      $or: [
        { sender: req.user.id, status: { $in: ['Accepted', 'Pending', 'Rejected'] } },
        { receiver: req.user.id, status: 'Accepted' }
      ]
    }).populate('sender', 'name avatar role university').populate('receiver', 'name avatar role university');

    const partnerIds = connections.map(conn => {
      const isSender = conn.sender._id.toString() === req.user.id;
      return isSender ? conn.receiver._id : conn.sender._id;
    });

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          sender: { $in: partnerIds },
          receiver: req.user.id,
          read: false
        }
      },
      {
        $group: {
          _id: '$sender',
          count: { $sum: 1 }
        }
      }
    ]);

    const unreadCountMap = new Map(
      unreadCounts.map(item => [item._id.toString(), item.count])
    );

    const lastMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user.id, receiver: { $in: partnerIds } },
            { sender: { $in: partnerIds }, receiver: req.user.id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$sender', req.user.id] },
              then: '$receiver',
              else: '$sender'
            }
          },
          lastMessage: { $first: '$$ROOT' }
        }
      }
    ]);

    const lastMessageMap = new Map(
      lastMessages.map(item => [item._id.toString(), item.lastMessage])
    );

    const conversationsWithMeta = connections.map((conn) => {
      const isSender = conn.sender._id.toString() === req.user.id;
      const partner = isSender ? conn.receiver : conn.sender;
      const partnerId = partner._id.toString();
      
      const unreadCount = unreadCountMap.get(partnerId) || 0;
      const lastMessage = lastMessageMap.get(partnerId);

      return {
        connectionId: conn._id,
        partner,
        status: conn.status,
        isInitiator: isSender,
        unreadCount,
        lastMessageText: lastMessage ? (lastMessage.attachmentName ? '📎 Attachment' : lastMessage.text) : 'Say hello!',
        lastMessageDate: lastMessage ? lastMessage.createdAt : conn.updatedAt
      };
    });

    conversationsWithMeta.sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate));
    res.json(conversationsWithMeta);
  } catch (error) {
    console.error('getConversations error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;

    if (!isValidObjectId(partnerId)) return res.status(400).json({ message: 'Invalid user id.' });

    const [messages, total] = await Promise.all([
      Message.find({
        $or: [
          { sender: req.user.id, receiver: partnerId },
          { sender: partnerId, receiver: req.user.id }
        ]
      })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({
        $or: [
          { sender: req.user.id, receiver: partnerId },
          { sender: partnerId, receiver: req.user.id }
        ]
      })
    ]);

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + messages.length < total
      }
    });
  } catch (error) {
    console.error('getChatHistory error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { partnerId } = req.params;
    if (!isValidObjectId(partnerId)) return res.status(400).json({ message: 'Invalid user id.' });
    await Message.updateMany(
      { sender: partnerId, receiver: req.user.id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.checkChatStatus = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.userId)) return res.status(400).json({ message: 'Invalid user id.' });
    const reqDoc = await ChatRequest.findOne({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    });
    if (!reqDoc) return res.json({ status: 'None' });
    res.json({ status: reqDoc.status, isInitiator: reqDoc.sender.toString() === req.user.id, connectionId: reqDoc._id });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteMessage = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.messageId)) return res.status(400).json({ message: 'Invalid message id.' });
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.sender.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    await message.deleteOne();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.editMessage = async (req, res) => {
  try {
    const { newText } = req.body;
    if (!isValidObjectId(req.params.messageId)) return res.status(400).json({ message: 'Invalid message id.' });
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.sender.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const timeElapsed = Date.now() - new Date(message.createdAt).getTime();
    if (timeElapsed > 15 * 60 * 1000) return res.status(400).json({ message: 'Messages can only be edited within 15 minutes.' });

    message.text = newText;
    message.isEdited = true;
    await message.save();
    res.json({ message: 'Message updated', data: message });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteConversation = async (req, res) => {
  try {
    const partnerId = req.params.partnerId;
    const currentUserId = req.user.id;
    if (!isValidObjectId(partnerId)) return res.status(400).json({ message: 'Invalid user id.' });

    await ChatRequest.findOneAndDelete({
      $or: [
        { sender: currentUserId, receiver: partnerId },
        { sender: partnerId, receiver: currentUserId }
      ]
    });

    await Message.deleteMany({
      $or: [
        { sender: currentUserId, receiver: partnerId },
        { sender: partnerId, receiver: currentUserId }
      ]
    });

    res.json({ message: 'Conversation deleted permanently' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
