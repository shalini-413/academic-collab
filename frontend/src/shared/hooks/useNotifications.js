import { useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';

export const useNotifications = (enabled) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      setNotifications(await notificationService.list());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      setNotifications([]);
      return undefined;
    }

    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [enabled]);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const markAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
  };

  return { notifications, unreadCount, loading, refresh, markAllAsRead };
};

