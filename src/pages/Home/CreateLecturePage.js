import React, { useState } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CreateLectureForm from '../components/lectures/CreateLectureForm';
import UploadLectureForm from '../components/lectures/UploadLectureForm';

const CreateLecturePage = () => {
  const [key, setKey] = useState('youtube');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSuccess = (lectureId) => {
    navigate(`/lectures/${lectureId}`);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  return (
    <Container>
      <Row className="justify-content-center my-5">
        <Col md={8}>
          <Card>
            <Card.Header as="h4" className="text-center">새 강의 만들기</Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Tabs
                id="create-lecture-tabs"
                activeKey={key}
                onSelect={(k) => setKey(k)}
                className="mb-4"
              >
                <Tab eventKey="youtube" title="YouTube 강의">
                  <CreateLectureForm 
                    onSuccess={handleSuccess} 
                    onError={handleError} 
                  />
                </Tab>
                <Tab eventKey="upload" title="파일 업로드">
                  <UploadLectureForm 
                    onSuccess={handleSuccess} 
                    onError={handleError} 
                  />
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateLecturePage; 