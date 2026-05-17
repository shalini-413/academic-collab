// backend/controllers/applicationController.js
const Application = require('../models/Application');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification'); // ADDED THIS
const { matchingEngine } = require('../utils/aiMatcher');

const applyToProject = async (req, res) => {
  try {
    const { projectId, coverLetter, additionalLinks } = req.body;
    const studentId = req.user.id;

    // For file upload (multer will add req.file)
    const resumeUrl = req.file ? `/uploads/resumes/${req.file.filename}` : null;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.status !== 'Open') {
      return res.status(400).json({ message: "This project is closed for new applications." });
    }
    if (project.applicantLimit > 0) {
      const activeApplicationCount = await Application.countDocuments({ project: projectId, status: { $nin: ['Rejected', 'Withdrawn'] } });
      if (activeApplicationCount >= project.applicantLimit) {
        return res.status(400).json({ message: "This project has reached its applicant limit." });
      }
    }

    const existing = await Application.findOne({ project: projectId, student: studentId });
    if (existing) return res.status(400).json({ message: "You have already applied for this project." });

    const student = await User.findById(studentId).select(
      'name email university bio skills researchInterests github linkedin portfolio resumeUrl'
    );

    const newApplication = new Application({
      project: projectId,
      student: studentId,
      coverLetter: coverLetter || "No cover letter provided.",
      resumeUrl: resumeUrl,
      additionalLinks: additionalLinks ? JSON.parse(additionalLinks) : [],
      status: 'Applied',
      studentSnapshot: {
        name: student.name,
        email: student.email,
        university: student.university,
        bio: student.bio,
        skills: student.skills || [],
        researchInterests: student.researchInterests || [],
        github: student.github,
        linkedin: student.linkedin,
        portfolio: student.portfolio,
        resumeUrl: student.resumeUrl
      }
    });

    await newApplication.save();

    if (!project.applicants.includes(studentId)) {
      project.applicants.push(studentId);
      await project.save();
    }

    const notification = await new Notification({
      user: project.professor, // Receiver
      sender: studentId,       // Student who applied
      type: 'application_received',
      title: 'New Project Application',
      message: `${student.name} has applied for your project: "${project.title}"`,
      relatedId: project._id
    }).save();

    const io = req.app.get('io');
    if (io) {
      io.to(project.professor.toString()).emit('receive_notification', notification);
    }

    res.status(201).json({ message: "Application submitted successfully!" });

  } catch (err) {
    console.error("Apply Error:", err);
    res.status(500).json({ message: "Failed to submit application" });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate('project', 'title description')
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

// ADDED THIS: Need to fetch applications for a specific project
const getProjectApplications = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const project = await Project.findById(projectId);

    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.professor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to view these applications" });
    }

    const applications = await Application.find({ project: projectId })
      .populate('student', 'name email university skills researchInterests github linkedin portfolio')
      .populate('project', 'title status applicantLimit')
      .sort({ appliedAt: -1 });

    const scoredApplications = applications.map(app => {
      const studentProfile = {
        ...(app.student?.toObject?.() || app.student || {}),
        ...(app.studentSnapshot || {})
      };
      const match = matchingEngine.getStudentProjectMatchScore(studentProfile, project);
      return { ...app.toObject(), ...match };
    });

    res.status(200).json(scoredApplications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// IMPROVED: Update application status and sync with Project team
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId, status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const application = await Application.findById(applicationId)
      .populate('project')
      .populate('student');

    if (!application) return res.status(404).json({ message: "Application not found" });

    const project = await Project.findById(application.project._id);

    // Authorization checks
    if (userRole === 'Student') {
      if (application.student._id.toString() !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      if (status !== 'Withdrawn') {
        return res.status(403).json({ message: "Students can only withdraw their applications" });
      }
    } else if (userRole === 'Professor') {
      if (project.professor.toString() !== userId) {
        return res.status(403).json({ message: "Unauthorized to update this application" });
      }
      if (status === 'Withdrawn') {
        return res.status(403).json({ message: "Professors cannot withdraw an application" });
      }
    }

    application.status = status;
    await application.save();

    // Sync with Project array: Move to team if accepted, remove if rejected or withdrawn
    if (status === 'Accepted') {
      if (!project.teamMembers.includes(application.student._id)) {
        project.teamMembers.push(application.student._id);
      }
      project.applicants = project.applicants.filter(id => id.toString() !== application.student._id.toString());
    } else if (status === 'Rejected' || status === 'Withdrawn') {
      project.applicants = project.applicants.filter(id => id.toString() !== application.student._id.toString());
      project.teamMembers = project.teamMembers.filter(id => id.toString() !== application.student._id.toString()); // Remove if they were previously accepted
    }
    
    await project.save();

    // Send Notification only if professor updates status
    if (userRole === 'Professor') {
      const notification = await new Notification({
        user: application.student._id,
        type: 'application_status',
        title: 'Application Status Updated',
        message: `Your application for "${application.project.title}" has been ${status}.`,
        relatedId: application.project._id
      }).save();

      const io = req.app.get('io');
      if (io) {
        io.to(application.student._id.toString()).emit('receive_notification', notification);
      }
    }

    res.json({ success: true, message: `Application marked as ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const bulkUpdateApplicationStatus = async (req, res) => {
  try {
    const { applicationIds = [], status } = req.body;
    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({ message: "No applications selected" });
    }

    const applications = await Application.find({ _id: { $in: applicationIds } }).populate('project');
    const unauthorized = applications.some((application) => application.project.professor.toString() !== req.user.id);
    if (unauthorized) return res.status(403).json({ message: "Unauthorized bulk action" });

    await Application.updateMany({ _id: { $in: applicationIds } }, { status });
    res.json({ success: true, message: `${applications.length} applications marked as ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// FIXED EXPORTS
module.exports = { 
  applyToProject, 
  getMyApplications, 
  getProjectApplications, 
  updateApplicationStatus,
  bulkUpdateApplicationStatus
};
