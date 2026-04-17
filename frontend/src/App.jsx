// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard';
import Profile from './pages/Profile';
import ProjectsFeed from './pages/ProjectsFeed';
import RecommendedProfessors from './pages/RecommendedProfessors';
import MyApplications from './pages/MyApplications';
import Messages from './pages/Messages';
import PrivacySettings from './pages/PrivacySettings';
import StudentProjectView from './pages/StudentProjectView';
import ProjectDetails from './pages/ProjectDetails';
import SavedProjects from './pages/SavedProjects';
import ProjectApplications from './pages/ProjectApplications';
import Notifications from './pages/Notifications';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ==================== STUDENT ROUTES ==================== */}
          <Route path="/student-dashboard" element={<ProtectedRoute allowedRoles={['Student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/projects-feed" element={<ProtectedRoute allowedRoles={['Student']}><ProjectsFeed /></ProtectedRoute>} />
          <Route path="/recommended-professors" element={<ProtectedRoute allowedRoles={['Student']}><RecommendedProfessors /></ProtectedRoute>} />
          <Route path="/my-applications" element={<ProtectedRoute allowedRoles={['Student']}><MyApplications /></ProtectedRoute>} />
          <Route path="/project-view/:id" element={<ProtectedRoute allowedRoles={['Student']}><StudentProjectView /></ProtectedRoute>} />
          <Route path="/saved-projects" element={<ProtectedRoute allowedRoles={['Student']}><SavedProjects /></ProtectedRoute>} />

          {/* ==================== PROFESSOR ROUTES ==================== */}
          <Route path="/professor-dashboard" element={<ProtectedRoute allowedRoles={['Professor']}><ProfessorDashboard /></ProtectedRoute>} />
          <Route path="/my-projects" element={<ProtectedRoute allowedRoles={['Professor']}><ProfessorDashboard /></ProtectedRoute>} />   {/* ← Fixed */}
          <Route path="/project/:id" element={<ProtectedRoute allowedRoles={['Professor']}><ProjectDetails /></ProtectedRoute>} />

          {/* ==================== COMMON ROUTES (Both Roles) ==================== */}
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['Student', 'Professor']}><Profile /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute allowedRoles={['Student', 'Professor']}><Messages /></ProtectedRoute>} />
          <Route path="/privacy-settings" element={<ProtectedRoute allowedRoles={['Student', 'Professor']}><PrivacySettings /></ProtectedRoute>} />
          <Route path="/project/:id/applications" element={<ProtectedRoute><ProjectApplications /></ProtectedRoute>} />
          <Route 
  path="/notifications" 
  element={
    <ProtectedRoute>
      <Notifications />
    </ProtectedRoute>
  } 
/>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;