import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';


import Login from './pages/Login';
import Register from './pages/Register';
import ProjectsFeed from './pages/ProjectsFeed';
import StudentDashboard from './pages/StudentDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard';
import Profile from './pages/Profile';
import SearchProfessors from './pages/SearchProfessors';
import ProjectDetails from './pages/ProjectDetails';
import WorkspacePage from './pages/WorkspacePage';
import StudentProjectView from './pages/StudentProjectView';
import SavedProjects from './pages/SavedProjects';
import MyApplications from './pages/MyApplications';
import Messages from './pages/Messages';
import RecommendedProfessors from './pages/RecommendedProfessors';
import PrivacySettings from './pages/PrivacySettings';
import ProtectedRoute from './components/ProtectedRoute';




function App() {
  return (
    <div className="min-h-screen">
      <AuthProvider>
        <Router>
          <Navbar />
          <Toaster position="top-center" />
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/profile" element={<ProtectedRoute allowedRoles={['Student', 'Professor']}><Profile /></ProtectedRoute>} />
            <Route path="/student-dashboard" element={<ProtectedRoute allowedRoles={['Student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/project-view/:id" element={<ProtectedRoute allowedRoles={['Student']}><StudentProjectView /></ProtectedRoute>} />
            <Route path="/workspace/:projectId" element={<ProtectedRoute allowedRoles={['Student', 'Professor']}><WorkspacePage /></ProtectedRoute>} />
            <Route path="/professor-dashboard" element={<ProtectedRoute allowedRoles={['Professor']}><ProfessorDashboard /></ProtectedRoute>} />
            <Route path="/project/:id" element={<ProtectedRoute allowedRoles={['Professor']}><ProjectDetails /></ProtectedRoute>} />
            <Route path="/search-professors" element={<ProtectedRoute allowedRoles={['Student']}><SearchProfessors /></ProtectedRoute>} />
            <Route path="/saved-projects" element={<ProtectedRoute allowedRoles={['Student']}><SavedProjects /></ProtectedRoute>} />
            <Route path="/projects-feed" element={<ProtectedRoute allowedRoles={['Student']}><ProjectsFeed /></ProtectedRoute>} />
            <Route path="/saved-projects" element={<ProtectedRoute allowedRoles={['Student']}><SavedProjects /></ProtectedRoute>} />
            <Route path="/my-applications" element={<ProtectedRoute allowedRoles={['Student']}><MyApplications /></ProtectedRoute>} />
            <Route 
  path="/messages" 
  element={
    <ProtectedRoute allowedRoles={['Student', 'Professor']}>
      <Messages />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/recommended-professors" 
  element={
    <ProtectedRoute allowedRoles={['Student']}>
      <RecommendedProfessors />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/privacy-settings" 
  element={
    <ProtectedRoute allowedRoles={['Student']}>
      <PrivacySettings />
    </ProtectedRoute>
  } 
/>
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;