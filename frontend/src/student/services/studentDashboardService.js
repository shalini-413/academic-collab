import { apiClient } from '../../shared/services/apiClient';
import { authService } from '../../shared/services/authService';

export const studentDashboardService = {
  async loadDashboard() {
    const [recommendedProjects, recommendedProfessors, applications, savedProjects, profile] = await Promise.all([
      apiClient.get('/api/projects/recommended'),
      apiClient.get('/api/projects/recommend-professors'),
      apiClient.get('/api/projects/my-applications'),
      apiClient.get('/api/bookmarks/saved'),
      authService.getProfile()
    ]);

    return {
      recommendedProjects: recommendedProjects.data,
      recommendedProfessors: recommendedProfessors.data,
      applications: applications.data,
      savedProjects: savedProjects.data,
      profile
    };
  }
};

