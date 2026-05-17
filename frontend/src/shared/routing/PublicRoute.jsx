import { Navigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../hooks/useAuth';
import { roleHomePath } from '../utils/roles';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen label="Loading" />;
  if (user) return <Navigate to={roleHomePath(user.role)} replace />;

  return children;
};

export default PublicRoute;

