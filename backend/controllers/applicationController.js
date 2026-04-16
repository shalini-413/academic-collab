// backend/controllers/applicationController.js
const Application = require('../models/Application');
const Project = require('../models/Project');
const User = require('../models/User');

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

// Example: When professor accepts/rejects an application
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId, status } = req.body;
    const professorId = req.user.id;

    const application = await Application.findById(applicationId)
      .populate('project')
      .populate('student');

    if (!application) return res.status(404).json({ message: "Application not found" });

    application.status = status;
    await application.save();

    // === AUTOMATIC NOTIFICATION ===
    await new Notification({
      user: application.student._id,
      type: 'application_status',
      title: 'Application Status Updated',
      message: `Your application for "${application.project.title}" has been ${status}.`,
      relatedId: application.project._id
    }).save();

    res.json({ success: true, message: `Application ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { applyToProject, getMyApplications };