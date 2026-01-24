// Centralized error handling utility
export const handleApiError = (error, context = '') => {
  console.error(`${context} Error:`, error);
  
  // Never logout on service errors
  if (error.response?.status === 401) {
    // Only logout if it's actually an auth endpoint error
    if (error.config?.url?.includes('/auth/') && !error.config?.url?.includes('/login')) {
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }
  }
  
  // Return user-friendly error message
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.status >= 500) {
    return 'Server error occurred. Please try again later.';
  }
  
  if (error.response?.status >= 400) {
    return 'Request failed. Please check your input and try again.';
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return 'Network error. Please check your connection.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export const isAuthError = (error) => {
  return error.response?.status === 401 && 
         error.config?.url?.includes('/auth/') && 
         !error.config?.url?.includes('/login');
};