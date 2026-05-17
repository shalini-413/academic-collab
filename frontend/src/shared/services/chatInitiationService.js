import { apiClient } from './apiClient';

const cleanId = (value) => {
  if (value === undefined || value === null || value === '') return null;
  return String(value);
};

export const chatInitiationService = {
  async start({ receiverId, projectId = null, initialMessage = '' }) {
    const cleanedReceiverId = cleanId(receiverId);
    if (!cleanedReceiverId) {
      throw new Error('A valid user is required to start chat.');
    }

    const payload = {
      receiverId: cleanedReceiverId,
      initialMessage: String(initialMessage || '').trim()
    };

    const cleanedProjectId = cleanId(projectId);
    if (cleanedProjectId) payload.projectId = cleanedProjectId;

    const response = await apiClient.post('/api/chat/request', payload);
    return response.data;
  },

  getNavigationState(receiverId, result = {}) {
    return {
      activeUserId: String(result.partnerId || receiverId || '')
    };
  }
};
