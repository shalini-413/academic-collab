import { authService } from '../../shared/services/authService';
import { uploadService } from '../../shared/services/uploadService';

export const emptyStudentProfile = {
  name: '',
  university: '',
  bio: '',
  avatar: '',
  resumeUrl: '',
  skills: [],
  researchInterests: [],
  github: '',
  linkedin: '',
  portfolio: '',
  additionalLinks: []
};

export const normalizeStudentProfile = (profile = {}) => ({
  ...emptyStudentProfile,
  name: profile.name || '',
  university: profile.university || '',
  bio: profile.bio || '',
  avatar: profile.avatar || '',
  resumeUrl: profile.resumeUrl || '',
  skills: Array.isArray(profile.skills) ? profile.skills : [],
  researchInterests: Array.isArray(profile.researchInterests) ? profile.researchInterests : [],
  github: profile.github || '',
  linkedin: profile.linkedin || '',
  portfolio: profile.portfolio || '',
  additionalLinks: Array.isArray(profile.additionalLinks) ? profile.additionalLinks : [],
  completionScore: profile.completionScore || 0,
  missingFields: Array.isArray(profile.missingFields) ? profile.missingFields : []
});

export const getStudentProfileCompletion = (profile) => {
  const checks = [
    { label: 'university', complete: Boolean(profile.university?.trim()) },
    { label: 'bio', complete: Boolean(profile.bio?.trim() && profile.bio.trim().length >= 10) },
    { label: 'skills', complete: profile.skills?.length > 0 },
    { label: 'research interests', complete: profile.researchInterests?.length > 0 },
    { label: 'portfolio or social link', complete: Boolean(profile.github || profile.linkedin || profile.portfolio) },
    { label: 'resume', complete: Boolean(profile.resumeUrl) }
  ];

  return {
    completionScore: Math.round((checks.filter((check) => check.complete).length / checks.length) * 100),
    missingFields: checks.filter((check) => !check.complete).map((check) => check.label)
  };
};

export const calculateStudentProfileCompletion = (profile) => getStudentProfileCompletion(profile).completionScore;

export const studentProfileService = {
  async getProfile() {
    return normalizeStudentProfile(await authService.getProfile());
  },

  async saveProfile(profile) {
    return authService.updateProfile({
      name: profile.name,
      university: profile.university,
      bio: profile.bio,
      avatar: profile.avatar,
      resumeUrl: profile.resumeUrl,
      skills: profile.skills || [],
      researchInterests: profile.researchInterests || [],
      github: profile.github,
      linkedin: profile.linkedin,
      portfolio: profile.portfolio,
      additionalLinks: profile.additionalLinks || []
    });
  },

  uploadFile: uploadService.uploadFile
};
