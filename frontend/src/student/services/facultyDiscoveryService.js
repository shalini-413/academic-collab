import { apiClient } from '../../shared/services/apiClient';
import { chatInitiationService } from '../../shared/services/chatInitiationService';

export const facultyDiscoveryService = {
  async browse(filters) {
    const response = await apiClient.get('/api/faculty', { params: filters });
    return response.data;
  },

  async toggleSave(facultyId) {
    const response = await apiClient.post(`/api/faculty/save/${facultyId}`, {});
    return response.data;
  },

  async message(facultyId, facultyName) {
    return chatInitiationService.start({
      receiverId: facultyId,
      initialMessage: `Hi ${facultyName?.split(' ')[0] || 'Professor'}, I am interested in your research and would like to connect.`
    });
  }
};
