import { apiClient } from '../../shared/services/apiClient';
import { chatInitiationService } from '../../shared/services/chatInitiationService';

export const projectManagementService = {
  async getProject(projectId) {
    const response = await apiClient.get(`/api/projects/${projectId}`);
    return response.data;
  },

  async updateProject(projectId, payload) {
    const response = await apiClient.put(`/api/projects/update/${projectId}`, payload);
    return response.data;
  },

  async toggleStatus(projectId) {
    const response = await apiClient.put(`/api/projects/close/${projectId}`, {});
    return response.data;
  },

  async getApplications(projectId) {
    const response = await apiClient.get(`/api/applications/project/${projectId}`);
    return response.data;
  },

  async setApplicationStatus(applicationId, status) {
    const response = await apiClient.put('/api/applications/status', { applicationId, status });
    return response.data;
  },

  async bulkStatus(applicationIds, status) {
    const response = await apiClient.put('/api/applications/bulk-status', { applicationIds, status });
    return response.data;
  },

  async messageApplicant(application, token) {
    return chatInitiationService.start({
      receiverId: application.student?._id,
      projectId: application.project?._id || application.project,
      initialMessage: `Hi ${application.studentSnapshot?.name?.split(' ')[0] || 'there'}, I reviewed your application for "${application.project?.title || 'my project'}" and would like to discuss it further.`
    });
  }
};
