const Application = require('../models/Application');
const Project = require('../models/Project');
const User = require('../models/User');
const { matchingEngine, clearCacheForProject } = require('../utils/aiMatcher');
const { notifyMany } = require('../shared/services/notificationService');

// 1. PROFESSOR: Create a new project
// Create Project (Improved)
exports.createProject = async (req, res) => {
  try {
    const { title, description, requiredSkills, researchField, duration, isPaid, mode, deadline, applicantLimit, visibility } = req.body;

    const newProject = new Project({
      title,
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map(s => s.trim()),
      researchField: researchField || [],
      duration,
      isPaid: isPaid || false,
      mode: mode || 'Remote',
      deadline,
      applicantLimit: Number(applicantLimit || 0),
      visibility: visibility || 'Public',
      professor: req.user.id,
      status: 'Open'
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// 2. STUDENT: Get Top 8 AI Recommended Projects
// backend/controllers/projectController.js

// Recommend Projects for Student (Already exists, but improved)
exports.getRecommendedProjects = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const openProjects = await Project.find({ status: 'Open', visibility: { $ne: 'Hidden' } })
    .populate('professor', 'name university avatar');

    const scoredProjects = openProjects.map(project => {
      const match = matchingEngine.getStudentProjectMatchScore(student, project);
      return { 
        ...project.toObject(), 
        matchScore: match.matchScore,
        matchedDetails: match.matchedDetails,
        professorName: project.professor?.name,
        professorUniversity: project.professor?.university,
        professorAvatar: project.professor?.avatar
      };
    });
    // Sort by match score (highest first) and return top 8
    scoredProjects.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json(scoredProjects.slice(0, 8));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// Recommend Professors for Student
exports.getRecommendedProfessors = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const professors = await User.find({ 
      role: 'Professor' 
    }).select('name email avatar designation department university bio researchInterests skills');

    const scoredProfessors = professors.map(prof => {
      const match = matchingEngine.compareProfiles(student, prof);
      return { 
        ...prof.toObject(), 
        ...match
      };
    });

    scoredProfessors.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json(scoredProfessors.slice(0, 6)); // Top 6 professors
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. STUDENT: Apply to a project
exports.applyForProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const studentId = req.user.id;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.status !== 'Open') return res.status(400).json({ message: "This project is closed for new applications." });
    if (project.applicantLimit > 0 && project.applicants.length >= project.applicantLimit) {
      return res.status(400).json({ message: "This project has reached its applicant limit." });
    }

    if (project.applicants.includes(studentId)) {
      return res.status(400).json({ message: "Already applied" });
    }

    project.applicants.push(studentId);
    await project.save();
    res.status(200).json({ message: "Successfully applied!", project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. PROFESSOR: Approve Student
exports.approveStudent = async (req, res) => {
  try {
    const { projectId, studentId } = req.body; 

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.professor.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only approve students for your own projects." });
    }

    project.applicants = project.applicants.filter(id => id.toString() !== studentId);
    if (!project.teamMembers.includes(studentId)) {
      project.teamMembers.push(studentId);
    }
// FIX: Update the Application status document as well
await Application.findOneAndUpdate(
  { project: projectId, student: studentId },
  { status: 'Accepted' }
);

await project.save();
res.status(200).json({ message: "Student approved!", project });
} catch (error) {
res.status(500).json({ error: error.message });
}
};

// Get a specific project with all details
exports.getProjectDetails = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('professor', 'name avatar university department designation')
      .populate('applicants', 'name avatar university skills researchInterests')
      .populate('teamMembers', 'name avatar university skills researchInterests');
    if (!project) return res.status(404).json({ message: "Project not found" });

    const applications = await Application.find({ project: project._id }).select('status createdAt appliedAt');
    const applicationStats = applications.reduce((stats, application) => {
      stats.total += 1;
      stats[application.status] = (stats[application.status] || 0) + 1;
      return stats;
    }, { total: 0, Applied: 0, Shortlisted: 0, Accepted: 0, Rejected: 0, Withdrawn: 0 });

    res.status(200).json({
      ...project.toObject(),
      applicationStats,
      recentActivity: applications.slice(-5).reverse()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// PROFESSOR: Reject a student application
exports.rejectStudent = async (req, res) => {
  try {
    const { projectId, studentId } = req.body; 
    const project = await Project.findById(projectId);
    
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.professor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
// Update the specific application document as well
await Application.findOneAndUpdate(
  { project: projectId, student: studentId },
  { status: 'Rejected' }
);
    // Remove them from the applicants list without adding to the team
    project.applicants = project.applicants.filter(id => id.toString() !== studentId);
    await project.save();
    
    res.status(200).json({ message: "Student application declined." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// STUDENT: Get status of all their applications
exports.getMyApplications = async (req, res) => {
  try {
    const studentId = req.user.id;
    // Find projects where the student is pending
    const pending = await Project.find({ applicants: studentId }).select('title');
    // Find projects where the student was accepted
    const accepted = await Project.find({ team: studentId }).select('title');

    res.status(200).json({ pending, accepted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// PROFESSOR: Get all projects created by this professor
exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ professor: req.user.id })
      .sort({ createdAt: -1 })
      .populate('applicants', 'name email university skills avatar');

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Edit Project
exports.updateProject = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.applicantLimit !== undefined) updates.applicantLimit = Number(updates.applicantLimit || 0);

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, professor: req.user.id },
      updates,
      { new: true }
    );

    if (!project) return res.status(404).json({ message: "Project not found or unauthorized" });

    res.json({ message: "Project updated successfully", project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      professor: req.user.id
    });

    if (!project) return res.status(404).json({ message: "Project not found or unauthorized" });

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// backend/controllers/projectController.js

exports.closeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.professor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const previousStatus = project.status;
    const newStatus = project.status === 'Open' ? 'Closed' : 'Open';

    project.status = newStatus;
    await project.save();

    if (previousStatus !== newStatus) {
      const applications = await Application.find({ project: project._id, status: { $ne: 'Withdrawn' } }).select('student');
      await notifyMany(req, applications.map((application) => ({
        user: application.student,
        sender: req.user.id,
        type: 'project_status',
        title: `Project ${newStatus}`,
        message: `"${project.title}" is now ${newStatus.toLowerCase()}.`,
        relatedId: project._id
      })));
    }

    res.json({ 
      message: `Project marked as ${newStatus}`, 
      project 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
