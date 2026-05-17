import { authService } from '../../shared/services/authService';
import { uploadService } from '../../shared/services/uploadService';

export const emptyProfessorProfile = {
  name: '',
  designation: '',
  university: '',
  department: '',
  bio: '',
  avatar: '',
  skills: [],
  researchInterests: [],
  googleScholar: '',
  publications: []
};

export const normalizeProfessorProfile = (profile = {}) => ({
  ...emptyProfessorProfile,
  name: profile.name || '',
  designation: profile.designation || '',
  university: profile.university || '',
  department: profile.department || '',
  bio: profile.bio || '',
  avatar: profile.avatar || '',
  skills: Array.isArray(profile.skills) ? profile.skills : [],
  researchInterests: Array.isArray(profile.researchInterests) ? profile.researchInterests : [],
  googleScholar: profile.googleScholar || '',
  publications: Array.isArray(profile.publications) ? profile.publications : [],
  completionScore: profile.completionScore || 0,
  missingFields: Array.isArray(profile.missingFields) ? profile.missingFields : []
});

export const getProfessorProfileCompletion = (profile) => {
  const checks = [
    { label: 'designation', complete: Boolean(profile.designation?.trim()) },
    { label: 'university', complete: Boolean(profile.university?.trim()) },
    { label: 'research summary', complete: Boolean(profile.bio?.trim() && profile.bio.trim().length >= 20) },
    { label: 'research domains', complete: profile.researchInterests?.length > 0 },
    { label: 'recruiting skills', complete: profile.skills?.length > 0 },
    { label: 'scholar profile or publication', complete: Boolean(profile.googleScholar || profile.publications?.length) }
  ];

  return {
    completionScore: Math.round((checks.filter((check) => check.complete).length / checks.length) * 100),
    missingFields: checks.filter((check) => !check.complete).map((check) => check.label)
  };
};

export const calculateProfessorProfileCompletion = (profile) => getProfessorProfileCompletion(profile).completionScore;

export const professorProfileService = {
  async getProfile() {
    return normalizeProfessorProfile(await authService.getProfile());
  },

  async saveProfile(profile) {
    return authService.updateProfile({
      name: profile.name,
      designation: profile.designation,
      university: profile.university,
      department: profile.department,
      bio: profile.bio,
      avatar: profile.avatar,
      skills: profile.skills || [],
      researchInterests: profile.researchInterests || [],
      googleScholar: profile.googleScholar,
      publications: profile.publications || []
    });
  },

  uploadFile: uploadService.uploadFile
};
