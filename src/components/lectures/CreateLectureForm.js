import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { createYoutubeLecture } from '../../api/lectureApi';

const CreateLectureForm = ({ onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    sourceType: 'YOUTUBE'
  });
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateYoutubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (!validateYoutubeUrl(formData.videoUrl)) {
      onError('유효한 YouTube URL을 입력해주세요.');
      return;
    }
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await createYoutubeLecture(formData);
      onSuccess(response.id);
      alert('강의가 성공적으로 생성되었습니다. 처리가 완료될 때까지 기다려주세요.');
    } catch (err) {
      console.error('강의 생성 실패:', err);
      onError(err.response?.data?.error || '강의 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="title">
        <Form.Label>강의 제목</Form.Label>
        <Form.Control
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="강의 제목을 입력하세요"
          required
        />
        <Form.Control.Feedback type="invalid">
          강의 제목을 입력해주세요.
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="description">
        <Form.Label>강의 설명 (선택사항)</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="강의에 대한 설명을 입력하세요"
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="videoUrl">
        <Form.Label>YouTube URL</Form.Label>
        <Form.Control
          type="url"
          name="videoUrl"
          value={formData.videoUrl}
          onChange={handleChange}
          placeholder="https://www.youtube.com/watch?v=..."
          required
        />
        <Form.Text className="text-muted">
          YouTube 동영상 URL을 입력하세요. (예: https://www.youtube.com/watch?v=abcdefghijk)
        </Form.Text>
        <Form.Control.Feedback type="invalid">
          유효한 YouTube URL을 입력해주세요.
        </Form.Control.Feedback>
      </Form.Group>

      <div className="d-grid gap-2 mt-4">
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? '강의 생성 중...' : '강의 생성하기'}
        </Button>
      </div>
    </Form>
  );
};

CreateLectureForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
};

export default CreateLectureForm; 