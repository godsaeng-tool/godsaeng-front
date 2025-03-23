import api from './index';

export const createLecture = async (lectureData) => {
  const response = await api.post('/lectures', lectureData);
  return response.data;
};

// export const createYoutubeLecture = async (lectureData) => {
//   const response = await api.post('/lectures/youtube', lectureData);
//   return response.data;
// };

export const createYoutubeLecture = async (lectureData) => {
  const token = localStorage.getItem('authToken');
  const response = await api.post('/lectures/youtube', lectureData, {
    headers: {
      'Authorization': `Bearer ${token}`, // 토큰을 헤더에 추가
    }
  });
  return response.data;
};

export const uploadLecture = async (formData, config = {}) => {
  const token = localStorage.getItem('authToken');
  const response = await api.post('/lectures/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`, // 토큰을 헤더에 추가
    },
    ...config
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

// 삭제 API 추가
export const deleteLecture = async (lectureId) => {
  const response = await api.delete(`/lectures/${lectureId}`);
  return response.data;
};

// 사용자의 최근 강의 목록 가져오기 (기존 API 활용)
export const getUserRecentLectures = async (limit = 5) => {
  // 기존 getLectures API를 활용하여 최근 강의 목록 가져오기
  const response = await getLectures(0, limit);
  
  // 응답에서 강의 목록 추출
  const lectures = response.content || [];
  
  // 최신순으로 정렬
  return lectures.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// 강의 제목 수정
export const updateLectureTitle = async (lectureId, title) => {
  const response = await api.put(`/lectures/${lectureId}/title`, { title });
  return response.data;
}; 