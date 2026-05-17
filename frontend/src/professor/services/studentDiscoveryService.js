import { apiClient } from '../../shared/services/apiClient';
import { chatInitiationService } from '../../shared/services/chatInitiationService';

export const studentDiscoveryService = {
  async projects() {
    const response = await apiClient.get('/api/professors/discovery-projects');
    return response.data;
  },

  async browse(filters) {
    const response = await apiClient.get('/api/professors/students', { params: filters });
    return response.data;
  },

  async invite(studentId, projectId) {
    const response = await apiClient.post('/api/professors/invite', { studentId, projectId });
    return response.data;
  },

  async shortlist(applicationId) {
    const response = await apiClient.put('/api/applications/status', { applicationId, status: 'Shortlisted' });
    return response.data;
  },

  async message(studentId, projectId, studentName) {
    return chatInitiationService.start({
      receiverId: studentId,
      projectId,
      initialMessage: `Hi ${studentName?.split(' ')[0] || 'there'}, I saw your profile and would like to discuss a research opportunity.`
    });
  }
};
