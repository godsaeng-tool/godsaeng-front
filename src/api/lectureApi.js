import api from './index';

export const createLecture = async (lectureData) => {
  const response = await api.post('/lectures', lectureData);
  return response.data;
};

export const createYoutubeLecture = async (lectureData) => {
  const response = await api.post('/lectures/youtube', lectureData);
  return response.data;
};

// export const createYoutubeLecture = async (lectureData) => {
//   const token = localStorage.getItem('authToken');
//   const response = await api.post('/lectures/youtube', lectureData, {
//     headers: {
//       'Authorization': `Bearer ${token}`, // 토큰을 헤더에 추가
//     }
//   });
//   return response.data;
// };

export const uploadLecture = async (formData) => {
  const response = await api.post('/lectures/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getLectures = async (page = 0, size = 10) => {
  const response = await api.get(`/lectures?page=${page}&size=${size}`);
  return response.data;
};

export const getLectureDetail = async (lectureId) => {
  const response = await api.get(`/lectures/${lectureId}`);
  return response.data;
}; 