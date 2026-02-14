import api from './api';

/**
 * Get or create a conversation for an application (recruiter messaging candidate).
 * @param {string} applicationId - Application UUID
 * @returns {Promise<{ id, recruiter, candidate, application }>}
 */
const getOrCreateConversation = async (applicationId) => {
  const response = await api.post('/messages/conversation', { applicationId });
  if (response.data?.status !== 'success') throw new Error(response.data?.message || 'Failed to get conversation');
  return response.data.data;
};

/**
 * List conversations for the current user.
 * @returns {Promise<Array>}
 */
const getConversations = async () => {
  const response = await api.get('/messages/conversations');
  if (response.data?.status !== 'success') throw new Error(response.data?.message || 'Failed to fetch conversations');
  return response.data.data || [];
};

/**
 * Get one conversation with its messages.
 * @param {string} conversationId - Conversation UUID
 * @returns {Promise<{ id, messages, recruiter, candidate, application }>}
 */
const getConversationWithMessages = async (conversationId) => {
  const response = await api.get(`/messages/conversations/${conversationId}`);
  if (response.data?.status !== 'success') throw new Error(response.data?.message || 'Failed to fetch conversation');
  return response.data.data;
};

/**
 * Send a message in a conversation.
 * @param {string} conversationId - Conversation UUID
 * @param {string} body - Message text
 * @returns {Promise<object>} Created message
 */
const sendMessage = async (conversationId, body) => {
  const response = await api.post(`/messages/conversations/${conversationId}/messages`, { body });
  if (response.data?.status !== 'success') throw new Error(response.data?.message || 'Failed to send message');
  return response.data.data;
};

const messageService = {
  getOrCreateConversation,
  getConversations,
  getConversationWithMessages,
  sendMessage
};

export default messageService;
