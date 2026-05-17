import { Navigate } from 'react-router-dom';
import ProfessorProfile from '../../professor/features/profile/ProfessorProfile';
import StudentProfile from '../../student/features/profile/StudentProfile';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/roles';

const ProfilePage = () => {
  const { user } = useAuth();

  if (user?.role === ROLES.STUDENT) return <StudentProfile />;
  if (user?.role === ROLES.PROFESSOR) return <ProfessorProfile />;

  return <Navigate to="/login" replace />;
};

export default ProfilePage;

