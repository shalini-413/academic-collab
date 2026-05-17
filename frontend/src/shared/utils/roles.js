export const ROLES = {
  STUDENT: 'Student',
  PROFESSOR: 'Professor',
  ADMIN: 'Admin'
};

export const roleHomePath = (role) => {
  if (role === ROLES.PROFESSOR) return '/professor-dashboard';
  if (role === ROLES.ADMIN) return '/admin/register';
  return '/student-dashboard';
};

export const unauthorizedRedirectPath = (user) => {
  if (!user) return '/login';
  return roleHomePath(user.role);
};

