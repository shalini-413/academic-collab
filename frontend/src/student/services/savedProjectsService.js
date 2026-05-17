import { apiClient } from '../../shared/services/apiClient';

export const savedProjectsService = {
  async list() {
    const response = await apiClient.get('/api/bookmarks/saved');
    return response.data;
  },

  async toggle(projectId) {
    const response = await apiClient.post(`/api/bookmarks/toggle/${projectId}`, {});
    return response.data;
  }
};

