// backend/controllers/applicationController.js
const Application = require('../models/Application');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification'); // ADDED THIS
const { getMatchScore } = require('../utils/aiMatcher');

const applyToProject = async (req, res) => {
  try {
    const { projectId, coverLetter, additionalLinks } = req.body;
    const studentId = req.user.id;

    // For file upload (multer will add req.file)
    const resumeUrl = req.file ? `/uploads/resumes/${req.file.filename}` : null;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

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



    res.status(201).json({ message: "Application submitted successfully!" });

  } catch (err) {
    console.error("Apply Error:", err);
    res.status(500).json({ message: "Failed to submit application" });
  }



// Inside applyToProject, after await newApplication.save():
await new Notification({
  user: project.professor, // Receiver
  sender: req.user.id,     // Student who applied
  type: 'application_received',
  title: 'New Project Application',
  message: `${req.user.name} has applied for your project: "${project.title}"`,
  relatedId: project._id
}).save();
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
      .sort({ appliedAt: -1 });

    // NEW: Calculate match score for each application
    const scoredApplications = applications.map(app => {
      const studentSkills = app.studentSnapshot?.skills || app.student?.skills || [];
      const score = getMatchScore(studentSkills, project.requiredSkills || []);
      return { ...app._doc, matchScore: score };
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

    const application = await Application.findById(applicationId)
      .populate('project')
      .populate('student');

    if (!application) return res.status(404).json({ message: "Application not found" });

    application.status = status;
    await application.save();

    const project = await Project.findById(application.project._id);

    // Sync with Project array: Move to team if accepted, remove if rejected
    if (status === 'Accepted') {
      if (!project.teamMembers.includes(application.student._id)) {
        project.teamMembers.push(application.student._id);
      }
      project.applicants = project.applicants.filter(id => id.toString() !== application.student._id.toString());
    } else if (status === 'Rejected') {
      project.applicants = project.applicants.filter(id => id.toString() !== application.student._id.toString());
      project.teamMembers = project.teamMembers.filter(id => id.toString() !== application.student._id.toString()); // Remove if they were previously accepted
    }
    
    await project.save();

    // Send Notification
    await new Notification({
      user: application.student._id,
      type: 'application_status',
      title: 'Application Status Updated',
      message: `Your application for "${application.project.title}" has been ${status}.`,
      relatedId: application.project._id
    }).save();

    res.json({ success: true, message: `Application marked as ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// FIXED EXPORTS
module.exports = { 
  applyToProject, 
  getMyApplications, 
  getProjectApplications, 
  updateApplicationStatus 
};