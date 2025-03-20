import React, { useState, useEffect, useCallback } from "react";
import {
  Container, Row, Col, Card, Nav, Tab, Alert, Button, Spinner, Modal, Dropdown,
} from "react-bootstrap";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getLectureDetail, deleteLecture } from "../../api/lectureApi";
import { FaCrown, FaUser } from "react-icons/fa";
import { useAppState } from "../../context/AppStateProvider";
import Loading from "../../components/common/Loading";
import ChatInterface from "../../components/chat/ChatInterface";
import "../../styles/Summary/LectureDetailPage.css";

const LectureDetailPage = () => {
  const { lectureId } = useParams();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  // 사이드바 상태와 갓생모드 관련 상태/함수 가져오기
  const { 
    isSidebarCollapsed, 
    isGodMode, 
    toggleGodMode, 
    isAuthenticated,
    userName,
    handleLogout
  } = useAppState();
  const [subscribing, setSubscribing] = useState(false);

  const fetchLectureDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLectureDetail(lectureId);
      setLecture(data);
      setIsProcessing(data.status === "PROCESSING");
    } catch (err) {
      console.error("강의 상세 정보 로딩 실패:", err);
      setError("강의 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [lectureId]);

  useEffect(() => {
    fetchLectureDetail();
  }, [fetchLectureDetail]);

  useEffect(() => {
    let pollingInterval;
    if (isProcessing) {
      pollingInterval = setInterval(fetchLectureDetail, 5000);
    }
    return () => clearInterval(pollingInterval);
  }, [isProcessing, fetchLectureDetail]);

  // 갓생모드 구독 처리 함수
  const handleSubscribeGodMode = async () => {
    setSubscribing(true);
    try {
      await toggleGodMode();
      // 구독 성공 후 페이지 새로고침하여 상태 갱신
      window.location.reload();
    } catch (error) {
      console.error("갓생모드 구독 실패:", error);
    } finally {
      setSubscribing(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleDeleteLecture = async () => {
    setDeleting(true);
    try {
      await deleteLecture(lectureId);
      navigate('/');
    } catch (error) {
      console.error('강의 삭제 실패:', error);
      alert('강의 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading && !lecture)
    return <Loading message="강의 정보를 불러오는 중..." />;

  if (error)
    return (
      <Container className={`center-container ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <Alert variant="danger">
          {error}
          <div className="mt-3">
            <Button as={Link} to="/" variant="outline-primary">
              홈으로 가기
            </Button>
          </div>
        </Alert>
      </Container>
    );

  if (isProcessing)
    return (
      <Container className={`center-container ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div className="text-center">
          <Spinner animation="border" role="status" />
          <h4 className="mt-3">강의 처리 중...</h4>
          <p className="text-muted">
            강의 내용을 분석하고 있습니다. 잠시만 기다려주세요.
          </p>
          <Button as={Link} to="/" variant="outline-primary" className="mt-3">
            홈으로 가기
          </Button>
        </div>
      </Container>
    );

  // 유튜브 URL에서 임베드 URL 생성
  let embedUrl = null;
  if (lecture.youtubeUrl) {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = lecture.youtubeUrl.match(youtubeRegex);
    if (match && match[1]) {
      embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  // 갓생모드 구독 안내 컴포넌트
  const GodModePrompt = () => (
    <div className="god-mode-prompt">
      <div className="text-center my-4 py-4">
        <FaCrown className="crown-icon mb-3" style={{ fontSize: '3rem', color: '#FFC330' }} />
        <h4>갓생모드 전용 기능입니다</h4>
        <p className="mb-4">
          학습 계획 기능은 갓생모드 구독자만 이용할 수 있습니다.
          더 효율적인 학습을 위해 갓생모드를 구독해보세요!
        </p>
        <Button 
          variant="warning" 
          className="god-mode-subscribe-btn"
          onClick={handleSubscribeGodMode}
          disabled={subscribing}
        >
          <FaCrown className="me-2" /> 
          {subscribing ? '구독 처리 중...' : '갓생모드 구독하기'}
        </Button>
      </div>
    </div>
  );

  return (
    <Container className={`my-4 lecture-detail-container ${isSidebarCollapsed ? "collapsed" : ""}`}>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="lecture-title">{lecture.title}</h2>
            
            {/* 유저 아이콘 및 드롭다운 메뉴 */}
            {isAuthenticated && (
              <Dropdown align="end" className="user-dropdown">
                <Dropdown.Toggle variant="link" id="user-dropdown" className="user-icon-button">
                  <FaUser className="user-icon" />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item disabled>{userName}님</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>로그아웃</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
          {lecture.description && <p className="text-muted">{lecture.description}</p>}
        </Col>
      </Row>

      {embedUrl && (
        <Row className="mb-4">
          <Col>
            <div className="ratio ratio-16x9">
              <iframe src={embedUrl} title={lecture.title} allowFullScreen />
            </div>
          </Col>
        </Row>
      )}

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <Nav variant="tabs" defaultActiveKey="summary" onSelect={setActiveTab} className="custom-nav-tabs">
                <Nav.Item><Nav.Link eventKey="summary">요약</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="transcript">전체 스크립트</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="questions">예상 질문</Nav.Link></Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="studyplan">
                    학습 계획
                    {!isGodMode && <FaCrown className="ms-1" style={{ fontSize: '0.8rem', color: '#FFC330' }} />}
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body className="lecture-card-body">
              <Tab.Content>
                <Tab.Pane eventKey="summary" active={activeTab === "summary"}>
                  <h4>강의 요약</h4>
                  <div className="lecture-tab-content">
                    {lecture.summary || "요약 정보가 없습니다."}
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="transcript" active={activeTab === "transcript"}>
                  <h4>전체 스크립트</h4>
                  <div className="lecture-tab-content">
                    {lecture.transcript || "스크립트 정보가 없습니다."}
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="questions" active={activeTab === "questions"}>
                  <h4>예상 질문</h4>
                  <div className="lecture-tab-content">
                    {lecture.expectedQuestions || "예상 질문 정보가 없습니다."}
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="studyplan" active={activeTab === "studyplan"}>
                  <h4>학습 계획</h4>
                  {isGodMode ? (
                    <div className="lecture-tab-content">
                      {lecture.studyPlan || "학습 계획 정보가 없습니다."}
                    </div>
                  ) : (
                    <GodModePrompt />
                  )}
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <ChatInterface lectureId={lectureId} />
        </Col>
      </Row>

      {/* 삭제 확인 모달 */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>강의 삭제</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>정말로 "{lecture?.title}" 강의를 삭제하시겠습니까?</p>
          <p className="text-danger">이 작업은 되돌릴 수 없으며, 모든 채팅 기록도 함께 삭제됩니다.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            취소
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteLecture}
            disabled={deleting}
          >
            {deleting ? '삭제 중...' : '삭제'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LectureDetailPage;
