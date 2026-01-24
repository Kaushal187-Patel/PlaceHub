import api from './api';

const sendMessage = async (message) => {
  try {
    const response = await api.post('/chatbot/message', { message });
    return response.data;
  } catch (error) {
    console.error('Chatbot service error:', error);
    throw new Error(error.response?.data?.message || 'Failed to send message');
  }
};

const clearSession = async () => {
  try {
    const response = await api.post('/chatbot/clear-session');
    return response.data;
  } catch (error) {
    console.error('Clear session error:', error);
    throw new Error(error.response?.data?.message || 'Failed to clear session');
  }
};

const chatbotService = {
  sendMessage,
  clearSession
};

export default chatbotService;