import React, { useState, useEffect, useCallback } from "react";
import {
  Container, Row, Col, Card, Nav, Tab, Alert, Button, Spinner, Modal,
} from "react-bootstrap";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getLectureDetail, deleteLecture } from "../../api/lectureApi";
import { FaCrown } from "react-icons/fa";
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
  const { isSidebarCollapsed, isGodMode, toggleGodMode } = useAppState();
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

  if (!lecture)
    return (
      <Container className={`center-container ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <Alert variant="warning">
          강의를 찾을 수 없습니다.
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
        <div className="processing-container">
          <Spinner animation="border" role="status" variant="primary" className="mb-3" />
          <h4>강의 처리 중...</h4>
          <p className="mb-4">
            강의 내용을 분석하고 AI 학습 자료를 생성하는 중입니다.
            이 과정은 몇 분 정도 소요될 수 있습니다.
          </p>
          <p><strong>강의 제목:</strong> {lecture.title}</p>
          {lecture.description && <p><strong>설명:</strong> {lecture.description}</p>}
          <div className="mt-4">
            <Button onClick={fetchLectureDetail} className="custom-refresh-btn me-2">
              새로고침
            </Button>
            <Button as={Link} to="/" variant="outline-secondary">홈으로 가기</Button>
          </div>
        </div>
      </Container>
    );

    const getYoutubeEmbedUrl = (url) => {
      if (!url) return null;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11
        ? `https://www.youtube.com/embed/${match[2]}`
        : null;
    };

    const embedUrl = lecture.sourceType === "YOUTUBE"
    ? getYoutubeEmbedUrl(lecture.videoUrl)
    : null;

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
            <h2 className="lecture-title">{lecture.title}</h2>
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
      </Container>
    );
  };
  
  export default LectureDetailPage;
