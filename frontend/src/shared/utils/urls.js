// frontend/src/shared/utils/urls.js

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const ASSET_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const resolveAssetUrl = (url) => {
  // If no URL is provided, return the default avatar in the public folder
  if (!url) return '/default-avatar.svg';
  
  // If the URL is already an absolute path (e.g., from Google OAuth or Amazon S3), return it directly
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  
  // Otherwise, prepend the backend base URL to the relative path
  return `${ASSET_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};