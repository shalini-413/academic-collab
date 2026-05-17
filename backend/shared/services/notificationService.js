const Notification = require('../../models/Notification');

exports.createNotification = async (req, payload) => {
  const notification = await Notification.create(payload);
  const io = req.app?.get('io');

  if (io && payload.user) {
    io.to(payload.user.toString()).emit('receive_notification', notification);
    io.to(payload.user.toString()).emit('new_notification');
  }

  return notification;
};

exports.notifyMany = async (req, notifications) => {
  return Promise.all(notifications.map((payload) => exports.createNotification(req, payload)));
};

