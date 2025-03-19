import api from './index';

export const sendQuestion = async (lectureId, question, tone = 'normal') => {
  const response = await api.post(`/chat/lectures/${lectureId}/questions`, {
    question,
    tone
  });
  return response.data;
};

export const getChatHistory = async (lectureId) => {
  const response = await api.get(`/chat/lectures/${lectureId}/history`);
  return response.data;
}; 