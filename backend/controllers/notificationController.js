const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate('sender', 'name role')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};