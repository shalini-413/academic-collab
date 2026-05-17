import { Navigate, useLocation } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../hooks/useAuth';
import { unauthorizedRedirectPath } from '../utils/roles';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen label="Checking access" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={unauthorizedRedirectPath(user)} replace />;
  }

  return children;
};

export default ProtectedRoute;

