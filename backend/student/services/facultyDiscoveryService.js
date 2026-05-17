const Project = require('../../models/Project');
const User = require('../../models/User');
const Application = require('../../models/Application'); // Imported to sync app status
const { matchingEngine } = require('../../utils/aiMatcher');

const asLower = (value) => String(value || '').toLowerCase();

// Smart AI Filter logic utilizing your matching engine synonyms
const includesAny = (values = [], query) => {
  const qLower = asLower(query);
  const qNormalized = matchingEngine.normalizeKeyword(query);

  return values.some((value) => {
    const vLower = asLower(value);
    const vNormalized = matchingEngine.normalizeKeyword(value);
    return vLower.includes(qLower) || vNormalized === qNormalized;
  });
};

exports.browseFaculty = async (studentId, filters = {}) => {
  // Added 'department' and 'bio' to ensure Cosine Similarity math is symmetric
  const student = await User.findById(studentId).select('skills researchInterests department bio savedFaculty');

  // ANTI-CRASH PROTECTION: If DB was wiped but user is still "logged in"
  if (!student) {
    throw new Error("Student profile not found in database. Please log out and log back in.");
  }

  const professors = await User.find({ role: 'Professor' })
    .select('name email avatar university department designation bio skills researchInterests googleScholar publications savedFaculty createdAt')
    .sort({ createdAt: -1 });

  const activeProjects = await Project.find({
    professor: { $in: professors.map((professor) => professor._id) },
    status: 'Open',
    visibility: { $ne: 'Hidden' }
  }).select('title professor requiredSkills researchField status deadline');

  // Fetch applications made by this specific student
  const studentApplications = await Application.find({ student: studentId }).select('project status');
  const appliedProjectMap = new Map(
    studentApplications.map(app => [app.project.toString(), app.status])
  );

  const projectsByProfessor = activeProjects.reduce((map, project) => {
    const professorId = project.professor.toString();
    map.set(professorId, [...(map.get(professorId) || []), project]);
    return map;
  }, new Map());

  const domainFilter = asLower(filters.domain);
  const departmentFilter = asLower(filters.department);
  const interestFilter = asLower(filters.researchInterests);
  const technologyFilter = asLower(filters.technologies);
  const activeOnly = filters.activeProjects === 'true';
  const minMatch = Number(filters.minMatch || 0);
  const savedFacultyIds = new Set((student.savedFaculty || []).map((id) => id.toString()));

  return professors
    .map((professor) => {
      // Inject application status into open projects for the UI
      const rawOpenProjects = projectsByProfessor.get(professor._id.toString()) || [];
      const openProjects = rawOpenProjects.map(project => ({
        ...project.toObject(),
        applicationStatus: appliedProjectMap.get(project._id.toString()) || 'Not applied' 
      }));

      const match = matchingEngine.compareProfiles(student, professor);
      return {
        ...professor.toObject(),
        ...match,
        openProjects,
        openProjectCount: openProjects.length,
        isSaved: savedFacultyIds.has(professor._id.toString())
      };
    })
    .filter((professor) => {
      if (domainFilter && !includesAny(professor.researchInterests, domainFilter)) return false;
      if (interestFilter && !includesAny(professor.researchInterests, interestFilter)) return false;
      if (technologyFilter && !includesAny(professor.skills, technologyFilter)) return false;
      if (departmentFilter && !asLower(professor.department || professor.university).includes(departmentFilter)) return false;
      if (activeOnly && professor.openProjectCount === 0) return false;
      if (minMatch && professor.matchScore < minMatch) return false;
      return true;
    })
    .sort((a, b) => b.matchScore - a.matchScore);
};