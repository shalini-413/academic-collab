const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Project = require('./models/Project');

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/academic-collab');
    console.log('Connected to MongoDB. Clearing old data...');

    await User.deleteMany({});
    await Project.deleteMany({});

    // 1. Create a Professor
    const prof = await User.create({
      name: 'Dr. Alan Turing',
      email: 'alan@university.edu',
      password: 'password123', // Assuming your pre-save hook hashes this
      role: 'Professor',
      university: 'NSUT',
      department: 'Computer Science',
      bio: 'Researching advanced machine learning for network security.',
      skills: ['python', 'xgboost', 'scikit-learn', 'c++'],
      researchInterests: ['cybersecurity', 'intrusion detection', 'machine learning']
    });

    // 2. Create Projects for the Professor
    const project1 = await Project.create({
      professor: prof._id,
      title: 'DDoS Attack Detection using ML',
      description: 'Building a detection model for Slowloris and DDoS attacks.',
      requiredSkills: ['python', 'xgboost', 'network security', 'pandas'],
      researchField: ['cybersecurity'],
      status: 'Open',
      visibility: 'Public'
    });

    const project2 = await Project.create({
      professor: prof._id,
      title: 'Full Stack Department Dashboard',
      description: 'Building a MERN stack dashboard for department analytics.',
      requiredSkills: ['react', 'node.js', 'express', 'mongodb', 'tailwind'],
      researchField: ['web development'],
      status: 'Open',
      visibility: 'Public'
    });

    // 3. Create Student A (Perfect Match for Project 1 & Prof's Research)
    await User.create({
      name: 'Cyber Student',
      email: 'cyber@student.edu',
      password: 'password123',
      role: 'Student',
      university: 'NSUT',
      department: 'Computer Science',
      bio: 'Final year MCA student focused on ML-based network security.',
      skills: ['python', 'xgboost', 'kali linux', 'c++'],
      researchInterests: ['cybersecurity', 'intrusion detection']
    });

    // 4. Create Student B (Perfect Match for Project 2, Low Match for Prof's core research)
    await User.create({
      name: 'Web Dev Student',
      email: 'web@student.edu',
      password: 'password123',
      role: 'Student',
      university: 'NSUT',
      department: 'Computer Science',
      bio: 'Full stack developer building scalable web applications.',
      skills: ['react', 'node.js', 'mongodb', 'tailwind css'],
      researchInterests: ['web development', 'software engineering']
    });

    console.log('Database seeded successfully with controlled test data!');
    process.exit();
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();