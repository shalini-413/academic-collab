const Project = require('../models/Project');
const User = require('../models/User');
const { browseFaculty } = require('../student/services/facultyDiscoveryService');

exports.browseFaculty = async (req, res) => {
  try {
    res.json(await browseFaculty(req.user.id, req.query));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleSaveFaculty = async (req, res) => {
  try {
    const faculty = await User.findOne({ _id: req.params.facultyId, role: 'Professor' });
    if (!faculty) return res.status(404).json({ message: 'Faculty member not found' });

    const student = await User.findById(req.user.id);
    const alreadySaved = student.savedFaculty.some((id) => id.toString() === req.params.facultyId);

    if (alreadySaved) {
      student.savedFaculty = student.savedFaculty.filter((id) => id.toString() !== req.params.facultyId);
      await student.save();
      return res.json({ action: 'removed', message: 'Faculty removed from saved' });
    }

    student.savedFaculty.push(req.params.facultyId);
    await student.save();
    res.json({ action: 'saved', message: 'Faculty saved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFacultyOpenProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      professor: req.params.facultyId,
      status: 'Open',
      visibility: { $ne: 'Hidden' }
    }).sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

