const hasText = (value, minimumLength = 1) =>
  typeof value === 'string' && value.trim().length >= minimumLength;

const evaluateCompletion = (checks) => {
  const completed = checks.filter((check) => check.complete).length;

  return {
    completionScore: Math.round((completed / checks.length) * 100),
    missingFields: checks
      .filter((check) => !check.complete)
      .map((check) => check.label)
  };
};

exports.getStudentProfileCompletion = (user) => evaluateCompletion([
  { label: 'university', complete: hasText(user.university) },
  { label: 'bio', complete: hasText(user.bio, 10) },
  { label: 'skills', complete: Array.isArray(user.skills) && user.skills.length > 0 },
  { label: 'research interests', complete: Array.isArray(user.researchInterests) && user.researchInterests.length > 0 },
  { label: 'portfolio or social link', complete: Boolean(user.github || user.linkedin || user.portfolio) },
  { label: 'resume', complete: hasText(user.resumeUrl) }
]);

exports.getProfessorProfileCompletion = (user) => evaluateCompletion([
  { label: 'designation', complete: hasText(user.designation) },
  { label: 'university', complete: hasText(user.university) },
  { label: 'research summary', complete: hasText(user.bio, 20) },
  { label: 'research domains', complete: Array.isArray(user.researchInterests) && user.researchInterests.length > 0 },
  { label: 'recruiting skills', complete: Array.isArray(user.skills) && user.skills.length > 0 },
  { label: 'scholar profile or publication', complete: Boolean(user.googleScholar || (Array.isArray(user.publications) && user.publications.length > 0)) }
]);

exports.calculateStudentProfileCompletion = (user) => exports.getStudentProfileCompletion(user).completionScore;
exports.calculateProfessorProfileCompletion = (user) => exports.getProfessorProfileCompletion(user).completionScore;
