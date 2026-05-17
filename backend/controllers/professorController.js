const Project = require('../models/Project');
const Application = require('../models/Application');
const ChatRequest = require('../models/ChatRequest');
const User = require('../models/User');
const { matchingEngine } = require('../utils/aiMatcher');
const { browseStudents, getProfessorProjects } = require('../professor/services/studentDiscoveryService');
const { createNotification } = require('../shared/services/notificationService');

exports.getProfessorDashboard = async (req, res) => {
  try {
    const profId = req.user.id;

    // 1. Fetch Stats
    const totalProjects = await Project.countDocuments({ professor: profId });
    const activeProjectsCount = await Project.countDocuments({ professor: profId, status: 'Open' });
    
    // Get all project IDs by this professor to filter applications
    const profProjects = await Project.find({ professor: profId }).select('_id');
    const projectIds = profProjects.map(p => p._id);

    const totalApplications = await Application.countDocuments({ project: { $in: projectIds } });
    const shortlistedCount = await Application.countDocuments({ 
      project: { $in: projectIds }, 
      status: { $in: ['Shortlisted', 'Accepted'] } 
    });

    // 2. Fetch Recent Applications (Top 5)
    const recentApplications = await Application.find({ project: { $in: projectIds } })
      .populate('student', 'name email university')
      .populate('project', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // 3. Fetch Active Projects List (Top 5)
    const activeProjects = await Project.find({ professor: profId, status: 'Open' })
      .sort({ createdAt: -1 })
      .limit(5);

    // 4. Fetch Recent Chat Requests (Top 5)
    const recentChats = await ChatRequest.find({
      $or: [{ student: profId }, { professor: profId }],
      status: 'Accepted'
    })
    .populate('student', 'name')
    .populate('professor', 'name')
    .sort({ updatedAt: -1 })
    .limit(5);

    res.json({
      stats: {
        totalProjects,
        activeProjectsCount,
        totalApplications,
        shortlistedCount
      },
      recentApplications,
      activeProjects,
      recentChats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.browseStudents = async (req, res) => {
  try {
    const students = await browseStudents(req.user.id, req.query);
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDiscoveryProjects = async (req, res) => {
  try {
    res.json(await getProfessorProjects(req.user.id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecommendedStudents = async (req, res) => {
  try {
    const professor = await User.findById(req.user.id).select('skills researchInterests department bio');
    const students = await User.find({ role: 'Student' })
      .select('name avatar university department bio skills researchInterests')
      .sort({ createdAt: -1 });

    const scored = students
      .map((student) => ({ ...student.toObject(), ...matchingEngine.compareProfiles(professor, student) }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8);

    res.json(scored);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.inviteStudent = async (req, res) => {
  try {
    const { studentId, projectId, message } = req.body;
    const project = await Project.findOne({ _id: projectId, professor: req.user.id });
    if (!project) return res.status(404).json({ message: 'Project not found or unauthorized' });

    await createNotification(req, {
      user: studentId,
      sender: req.user.id,
      type: 'project_invite',
      title: 'Project Invitation',
      message: message || `You were invited to apply for "${project.title}".`,
      relatedId: project._id
    });

    res.json({ message: 'Invitation sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
