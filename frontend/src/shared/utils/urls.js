// frontend/src/shared/utils/urls.js

// Checked variable names: swapped VITE_API_URL out for your actual VITE_API_BASE_URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const ASSET_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const resolveAssetUrl = (url) => {
  if (!url) return '/default-avatar.svg';
  
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  
  return `${ASSET_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};