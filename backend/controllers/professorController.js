const Project = require('../models/Project');
const Application = require('../models/Application');
const ChatRequest = require('../models/ChatRequest');

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