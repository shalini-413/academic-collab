import { API_BASE_URL } from './urls';

export const getAvatarUrl = (avatarPath) => {
  // If no avatar, return the default SVG from the public folder
  if (!avatarPath) return '/default-avatar.svg';
  
  // If it's already a full URL (like Cloudinary or Google Auth), return it
  if (avatarPath.startsWith('http')) return avatarPath; 

  // Otherwise, it's a local multer upload. Attach the backend domain.
  // We remove '/api' from the base URL to point strictly to the server root
  const serverUrl = API_BASE_URL.replace('/api', ''); 
  
  // Ensure we don't double up on slashes
  const formattedPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
  
  return `${serverUrl}${formattedPath}`;
};