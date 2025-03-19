import React, { useState } from 'react';
import { Form, Button, ProgressBar } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { uploadLecture } from '../../api/lectureApi';

const UploadLectureForm = ({ onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validated, setValidated] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (!file) {
      onError('파일을 선택해주세요.');
      return;
    }
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setLoading(true);
    setUploadProgress(0);
    
    try {
      // FormData 객체 생성
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('title', formData.title);
      if (formData.description) {
        uploadFormData.append('description', formData.description);
      }
      
      // 업로드 진행 상황 추적을 위한 설정
      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };
      
      const response = await uploadLecture(uploadFormData, config);
      onSuccess(response.id);
      // 성공 메시지 추가
      alert('파일이 성공적으로 업로드되었습니다. 처리가 완료될 때까지 기다려주세요.');
    } catch (err) {
      console.error('파일 업로드 실패:', err);
      onError(err.response?.data?.error || '파일 업로드에 실패했습니다. 다시 시도해주세요.');
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

      <Form.Group className="mb-3" controlId="file">
        <Form.Label>동영상 파일</Form.Label>
        <Form.Control
          type="file"
          name="file"
          onChange={handleFileChange}
          accept="video/*"
          required
        />
        <Form.Text className="text-muted">
          지원되는 파일 형식: MP4, AVI, MOV, WMV (최대 500MB)
        </Form.Text>
        <Form.Control.Feedback type="invalid">
          동영상 파일을 선택해주세요.
        </Form.Control.Feedback>
      </Form.Group>

      {loading && uploadProgress > 0 && (
        <div className="mb-3">
          <ProgressBar 
            now={uploadProgress} 
            label={`${uploadProgress}%`} 
            variant="info" 
            animated
          />
          <small className="text-muted mt-1 d-block">
            파일 업로드 중... {uploadProgress}% 완료
          </small>
        </div>
      )}

      <div className="d-grid gap-2 mt-4">
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? '업로드 중...' : '파일 업로드하기'}
        </Button>
      </div>
    </Form>
  );
};

UploadLectureForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
};

export default UploadLectureForm; 