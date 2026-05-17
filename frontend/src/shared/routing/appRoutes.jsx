import PublicProfile from '../../pages/PublicProfile';
import Login from '../../pages/Login';
import Register from '../../pages/Register';
import Messages from '../../pages/Messages';
import PrivacySettings from '../../pages/PrivacySettings';
import WorkspacePage from '../../pages/WorkspacePage';
import ProfilePage from '../pages/ProfilePage';

import StudentDashboard from '../../student/pages/StudentDashboard';
import ProjectsFeed from '../../student/pages/ProjectsFeed';
import RecommendedProfessors from '../../student/pages/RecommendedProfessors';
import MyApplications from '../../student/pages/MyApplications';
import StudentProjectView from '../../student/pages/StudentProjectView';
import SavedProjects from '../../student/pages/SavedProjects';

import ProfessorDashboard from '../../professor/pages/ProfessorDashboard';
import ProjectDetails from '../../professor/pages/ProjectDetails';
import ProjectApplications from '../../professor/pages/ProjectApplications';
import BrowseStudents from '../../professor/pages/BrowseStudents';

import { ROLES } from '../utils/roles';

export const publicRoutes = [
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> }
];

export const studentRoutes = [
  { path: '/student-dashboard', element: <StudentDashboard /> },
  { path: '/projects-feed', element: <ProjectsFeed /> },
  { path: '/recommended-professors', element: <RecommendedProfessors /> },
  { path: '/my-applications', element: <MyApplications /> },
  { path: '/project-view/:id', element: <StudentProjectView /> },
  { path: '/saved-projects', element: <SavedProjects /> }
].map((route) => ({ ...route, roles: [ROLES.STUDENT] }));

export const professorRoutes = [
  { path: '/professor-dashboard', element: <ProfessorDashboard /> },
  { path: '/my-projects', element: <ProfessorDashboard /> },
  { path: '/browse-students', element: <BrowseStudents /> },
  { path: '/project/:id', element: <ProjectDetails /> },
  { path: '/project/:id/applications', element: <ProjectApplications /> }
].map((route) => ({ ...route, roles: [ROLES.PROFESSOR] }));

export const sharedAuthenticatedRoutes = [
  { path: '/user/:id', element: <PublicProfile /> },
  { path: '/profile', element: <ProfilePage />, roles: [ROLES.STUDENT, ROLES.PROFESSOR] },
  { path: '/messages', element: <Messages />, roles: [ROLES.STUDENT, ROLES.PROFESSOR] },
  { path: '/privacy-settings', element: <PrivacySettings />, roles: [ROLES.STUDENT, ROLES.PROFESSOR] },
  { path: '/workspace/:projectId', element: <WorkspacePage />, roles: [ROLES.STUDENT, ROLES.PROFESSOR] }
];
