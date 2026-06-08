import api from './api';

const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data && response.data.data) {
    const user = {
      id: response.data.data.user.id,
      name: response.data.data.user.name,
      email: response.data.data.user.email,
      role: response.data.data.user.role,
      token: response.data.data.token
    };
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
  return response.data;
};

const login = async (userData) => {
  try {
    const response = await api.post('/auth/login', userData);
    if (response.data && response.data.data) {
      const user = {
        id: response.data.data.user.id,
        name: response.data.data.user.name,
        email: response.data.data.user.email,
        role: response.data.data.user.role,
        token: response.data.data.token
      };
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('user');
};

// NOTE: backend routes are /auth/forgotpassword and /auth/resetpassword/:resettoken (no hyphens).
const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgotpassword', { email });
  return response.data;
};

const resetPassword = async (token, password) => {
  const response = await api.put(`/auth/resetpassword/${token}`, { password });
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
};

export default authService;