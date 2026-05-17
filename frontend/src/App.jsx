import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppNavbar from './shared/components/AppNavbar';
import AppToaster from './shared/components/AppToaster';
import ProtectedRoute from './shared/routing/ProtectedRoute';
import PublicRoute from './shared/routing/PublicRoute';
import {
  professorRoutes,
  publicRoutes,
  sharedAuthenticatedRoutes,
  studentRoutes
} from './shared/routing/appRoutes';

function App() {
  const protectedRoutes = [
    ...studentRoutes,
    ...professorRoutes,
    ...sharedAuthenticatedRoutes
  ];

  return (
    <AuthProvider>
      <Router>
        <AppNavbar />
        <AppToaster />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          {publicRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={<PublicRoute>{route.element}</PublicRoute>} />
          ))}
          {protectedRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<ProtectedRoute allowedRoles={route.roles}>{route.element}</ProtectedRoute>}
            />
          ))}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
