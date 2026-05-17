const User = require('../../models/User');
const { getProfessorProfileCompletion } = require('../../shared/utils/profileCompletion');
const { clearCacheForUser } = require('../../utils/aiMatcher');

const allowedProfessorFields = [
  'name',
  'designation',
  'department',
  'university',
  'bio',
  'avatar',
  'skills',
  'researchInterests',
  'googleScholar',
  'publications',
  'privacySettings'
];

const pickAllowed = (payload) => allowedProfessorFields.reduce((updates, field) => {
  if (payload[field] !== undefined) updates[field] = payload[field];
  return updates;
}, {});

exports.updateProfessorProfile = async (userId, payload) => {
  const updates = pickAllowed(payload);
  const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select('-password');
  
  if (updates.skills || updates.researchInterests) {
    clearCacheForUser(userId);
  }
  
  return updatedUser;
};

exports.decorateProfessorProfile = (user) => ({
  ...user.toObject(),
  ...getProfessorProfileCompletion(user)
});
