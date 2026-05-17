import { apiClient } from '../../shared/services/apiClient';

export const professorDashboardService = {
  async loadDashboard() {
    const projects = await apiClient.get('/api/projects/my-projects');

    try {
      const recommendedStudents = await apiClient.get('/api/professors/recommend-students');
      return {
        projects: projects.data,
        recommendedStudents: recommendedStudents.data
      };
    } catch (error) {
      return {
        projects: projects.data,
        recommendedStudents: []
      };
    }
  },

  async toggleProjectStatus(projectId) {
    const response = await apiClient.put(`/api/projects/close/${projectId}`, {});
    return response.data;
  },

  async deleteProject(projectId) {
    const response = await apiClient.delete(`/api/projects/delete/${projectId}`);
    return response.data;
  }
};

