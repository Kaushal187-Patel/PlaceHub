export const getRoleBasedRoute = (userRole) => {
  console.log('getRoleBasedRoute called with role:', userRole, 'type:', typeof userRole);
  
  const role = userRole?.toLowerCase?.() || userRole;
  
  switch (role) {
    case 'recruiter':
      console.log('Redirecting to recruiter dashboard');
      return '/recruiter-dashboard';
    case 'student':
      console.log('Redirecting to student dashboard');
      return '/student-dashboard';
    default:
      console.log('Unknown role, defaulting to student dashboard. Role was:', userRole);
      return '/student-dashboard';
  }
};