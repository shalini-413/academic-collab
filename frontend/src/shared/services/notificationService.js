import { apiClient } from './apiClient';

export const notificationService = {
  async list() {
    const response = await apiClient.get('/api/notifications');
    return response.data;
  },

  async unreadCount() {
    const notifications = await this.list();
    return notifications.filter((notification) => !notification.isRead).length;
  },

  async markAsRead(id) {
    const response = await apiClient.put(`/api/notifications/${id}/read`, {});
    return response.data;
  },

  async markAllAsRead() {
    const response = await apiClient.put('/api/notifications/read-all', {});
    return response.data;
  }
};
