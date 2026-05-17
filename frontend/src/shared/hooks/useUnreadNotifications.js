import { useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';

export const useUnreadNotifications = (enabled) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setUnreadCount(0);
      return undefined;
    }

    let mounted = true;

    const loadCount = async () => {
      try {
        const count = await notificationService.unreadCount();
        if (mounted) setUnreadCount(count);
      } catch (error) {
        if (mounted) setUnreadCount(0);
      }
    };

    loadCount();
    const interval = setInterval(loadCount, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [enabled]);

  return unreadCount;
};

