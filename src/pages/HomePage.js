import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { isAuthenticated } from '../utils/tokenUtils';

const HomePage = () => {
  return (
    <Container>
      <Row className="my-5 text-center">
        <Col>
          <h1>갓생 학습 플랫폼에 오신 것을 환영합니다</h1>
          <p className="lead mt-3">
            동영상 강의를 업로드하고 AI와 함께 효율적으로 학습하세요
          </p>
        </Col>
      </Row>

      <Row className="my-5">
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>YouTube 강의 학습</Card.Title>
              <Card.Text>
                YouTube 동영상 URL을 입력하여 AI 기반 학습 자료를 생성하세요.
              </Card.Text>
            </Card.Body>
            <Card.Footer>
              {isAuthenticated() ? (
                <Button as={Link} to="/create-lecture" variant="primary">시작하기</Button>
              ) : (
                <Button as={Link} to="/login" variant="primary">로그인하기</Button>
              )}
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>파일 업로드</Card.Title>
              <Card.Text>
                직접 동영상 파일을 업로드하여 AI 학습 도우미를 활용하세요.
              </Card.Text>
            </Card.Body>
            <Card.Footer>
              {isAuthenticated() ? (
                <Button as={Link} to="/create-lecture" variant="primary">시작하기</Button>
              ) : (
                <Button as={Link} to="/login" variant="primary">로그인하기</Button>
              )}
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>AI 학습 도우미</Card.Title>
              <Card.Text>
                강의 내용에 대해 질문하고 AI 도우미와 대화하며 학습하세요.
              </Card.Text>
            </Card.Body>
            <Card.Footer>
              {isAuthenticated() ? (
                <Button as={Link} to="/lectures" variant="primary">내 강의 보기</Button>
              ) : (
                <Button as={Link} to="/signup" variant="primary">회원가입하기</Button>
              )}
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      
      <Row className="my-5">
        <Col className="text-center">
          <h2>갓생 학습의 특징</h2>
          <p className="lead">효율적인 학습을 위한 AI 기반 서비스</p>
        </Col>
      </Row>
      
      <Row className="mb-5">
        <Col md={6} className="mb-4">
          <h4>📝 자동 요약 및 스크립트</h4>
          <p>강의 내용을 자동으로 요약하고 전체 스크립트를 제공합니다.</p>
        </Col>
        <Col md={6} className="mb-4">
          <h4>❓ 예상 질문 생성</h4>
          <p>강의 내용을 바탕으로 예상 질문을 생성하여 학습을 돕습니다.</p>
        </Col>
        <Col md={6} className="mb-4">
          <h4>💬 AI 채팅 도우미</h4>
          <p>강의 내용에 대해 질문하고 답변을 받을 수 있는 AI 채팅 기능을 제공합니다.</p>
        </Col>
        <Col md={6} className="mb-4">
          <h4>📚 학습 계획 제안</h4>
          <p>강의 내용을 바탕으로 효율적인 학습 계획을 제안합니다.</p>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage; 