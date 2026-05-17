import { apiClient } from './apiClient';

export const uploadService = {
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data;
  }
};

