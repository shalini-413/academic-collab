const User = require('../../models/User');
const { getStudentProfileCompletion } = require('../../shared/utils/profileCompletion');
const { clearCacheForUser } = require('../../utils/aiMatcher');

const allowedStudentFields = [
  'name',
  'university',
  'bio',
  'avatar',
  'resumeUrl',
  'skills',
  'researchInterests',
  'github',
  'linkedin',
  'portfolio',
  'additionalLinks',
  'privacySettings'
];

const pickAllowed = (payload) => allowedStudentFields.reduce((updates, field) => {
  if (payload[field] !== undefined) updates[field] = payload[field];
  return updates;
}, {});

exports.updateStudentProfile = async (userId, payload) => {
  const updates = pickAllowed(payload);
  const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select('-password');
  
  if (updates.skills || updates.researchInterests) {
    clearCacheForUser(userId);
  }
  
  return updatedUser;
};

exports.decorateStudentProfile = (user) => ({
  ...user.toObject(),
  ...getStudentProfileCompletion(user)
});
