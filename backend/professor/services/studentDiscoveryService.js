const Application = require('../../models/Application');
const Project = require('../../models/Project');
const User = require('../../models/User');
const { matchingEngine } = require('../../utils/aiMatcher');

const asLower = (value) => String(value || '').toLowerCase();
// const includesAny = (values = [], query) => values.some((value) => asLower(value).includes(asLower(query)));
// Smart inclusion check utilizing the AI's synonym dictionary
const includesAny = (values = [], query) => {
  const qLower = asLower(query);
  const qNormalized = matchingEngine.normalizeKeyword(query);
  
  return values.some((value) => {
    const vLower = asLower(value);
    const vNormalized = matchingEngine.normalizeKeyword(value);
    // Match exact substrings OR AI-recognized synonyms
    return vLower.includes(qLower) || vNormalized === qNormalized;
  });
};

exports.browseStudents = async (professorId, filters = {}) => {
  const projects = await Project.find({ professor: professorId }).select('title description requiredSkills researchField status');
  const selectedProject = filters.projectId
    ? projects.find((project) => project._id.toString() === filters.projectId)
    : null;

  const professor = await User.findById(professorId).select('skills researchInterests department bio');
  const students = await User.find({ role: 'Student' })
    .select('name email avatar university department bio skills researchInterests resumeUrl github linkedin portfolio createdAt')
    .sort({ createdAt: -1 });

  const applications = await Application.find({
    student: { $in: students.map((student) => student._id) },
    ...(selectedProject ? { project: selectedProject._id } : { project: { $in: projects.map((project) => project._id) } })
  }).select('student project status');

  const applicationByStudent = applications.reduce((map, application) => {
    const current = map.get(application.student.toString());
    if (!current || application.status === 'Accepted') {
      map.set(application.student.toString(), application);
    }
    return map;
  }, new Map());

  const skillFilter = asLower(filters.skills);
  const interestFilter = asLower(filters.interests);
  const departmentFilter = asLower(filters.department);
  const techFilter = asLower(filters.techStack);
  const minMatch = Number(filters.minMatch || 0);
  // const hasRankingFilters = Boolean(skillFilter || interestFilter || departmentFilter || techFilter || selectedProject);

  // return students
  //   .map((student) => {
  //     const match = hasRankingFilters
  //       ? matchingEngine.compareProfileToFilters(professor, student, filters, selectedProject)
  //       : matchingEngine.compareProfiles(professor, student);

  // Only alter the score if a specific PROJECT is being viewed. 
  // Standard profile-to-profile matches should remain strictly symmetric.
  return students
  .map((student) => {
    let match;
    if (selectedProject) {
      // FIX: Synchronize with the Applications page.
      // Purely evaluate the Student against the Project, ignoring the Professor's general profile.
      match = matchingEngine.compareUserToProject(student, selectedProject);
    } else {
      // Pure Student <-> Professor symmetric match
      match = matchingEngine.compareProfiles(professor, student);
    }

    const application = applicationByStudent.get(student._id.toString());

    return {
      ...student.toObject(),
      ...match,
      projectMatchScore: match.contextScore || match.score || 0,
      profileMatchScore: match.profileScore || match.score,
      applicationStatus: application?.status || 'Not applied',
      applicationId: application?._id || null,
      selectedProject: selectedProject ? { _id: selectedProject._id, title: selectedProject.title } : null
    };
  })
    .filter((student) => {
      if (skillFilter && !includesAny(student.skills, skillFilter)) return false;
      if (interestFilter && !includesAny(student.researchInterests, interestFilter)) return false;
      if (techFilter && !includesAny(student.skills, techFilter)) return false;
      if (departmentFilter && !asLower(student.department || student.university).includes(departmentFilter)) return false;
      if (minMatch && student.matchScore < minMatch) return false;
      return true;
    })
    .sort((a, b) => b.matchScore - a.matchScore);
};

exports.getProfessorProjects = async (professorId) => {
  return Project.find({ professor: professorId })
    .select('title requiredSkills researchField status')
    .sort({ createdAt: -1 });
};
