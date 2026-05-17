import axios from 'axios';
import { API_BASE_URL } from '../utils/urls';

export const apiClient = axios.create({
  // FIXED: Removed the trailing "/api" concatenation string 
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    } 
    else if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Server is taking too long to respond.';
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      error.message = 'Unable to connect to server. Please check if the backend is running.';
    } else if (error.response?.status === 0) {
      error.message = 'Network error. Please check your internet connection.';
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }
  delete apiClient.defaults.headers.common.Authorization;
  delete axios.defaults.headers.common.Authorization;
};

export const withAuth = (token, config = {}) => ({
  ...config,
  headers: {
    ...(config.headers || {}),
    Authorization: `Bearer ${token}`
  }
});