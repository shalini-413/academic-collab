// frontend/src/shared/routing/navigationConfig.js
import { ROLES } from '../utils/roles';

export const primaryNavByRole = {
  [ROLES.STUDENT]: [
    { to: '/student-dashboard', label: 'Dashboard' },
    { to: '/projects-feed', label: 'Projects' },
    { to: '/recommended-professors', label: 'Search Faculty' }
  ],
  [ROLES.PROFESSOR]: [
    { to: '/professor-dashboard', label: 'Dashboard' },
    { to: '/browse-students', label: 'Browse Students' }
  ]
};

export const accountNavByRole = {
  [ROLES.STUDENT]: [
    { to: '/profile', label: 'Profile' },
    { to: '/my-applications', label: 'Applications' },
    { to: '/saved-projects', label: 'Saved Projects' },
    { to: '/messages', label: 'Messages' }
  ],
  [ROLES.PROFESSOR]: [
    { to: '/profile', label: 'Profile' },
    { to: '/professor-dashboard', label: 'Project Management' },
    { to: '/browse-students', label: 'Browse Students' }
  ]
};