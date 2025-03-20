import React, { useState, useEffect, useCallback } from "react";
import jsPDF from "jspdf";
import font from "./NotoSansKR-Regular-normal.js";
import {
  Container,
  Row,
  Col,
  Card,
  Nav,
  Tab,
  Alert,
  Button,
  Spinner,
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

  const handleDownload = (type, content, format = "txt") => {
    const fileNameMap = {
      summary: "강의요약",
      transcript: "전체스크립트",
      questions: "예상질문",
      studyplan: "학습계획",
    };

    const fileName = fileNameMap[type] || "lecture_content";

    if (format === "txt") {
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    if (format === "pdf") {
      const doc = new jsPDF();

      doc.addFileToVFS("NotoSansKR-Regular-normal.ttf", font);
      doc.addFont("NotoSansKR-Regular-normal.ttf", "NotoSansKR", "normal");
      doc.setFont("NotoSansKR");
      doc.setFontSize(12);

      const lines = doc.splitTextToSize(content, 180);
      doc.text(lines, 10, 10);
      doc.save(`${fileName}.pdf`);
    }
  };

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
      <Container
        className={`center-container ${isSidebarCollapsed ? "collapsed" : ""}`}
      >
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
      <Container
        className={`center-container ${isSidebarCollapsed ? "collapsed" : ""}`}
      >
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
      <Container
        className={`center-container ${isSidebarCollapsed ? "collapsed" : ""}`}
      >
        <div className="processing-container">
          <Spinner
            animation="border"
            role="status"
            variant="primary"
            className="mb-3"
          />
          <h4>강의 처리 중...</h4>
          <p className="mb-4">
            강의 내용을 분석하고 AI 학습 자료를 생성하는 중입니다. 이 과정은 몇
            분 정도 소요될 수 있습니다.
          </p>
          <p>
            <strong>강의 제목:</strong> {lecture.title}
          </p>
          {lecture.description && (
            <p>
              <strong>설명:</strong> {lecture.description}
            </p>
          )}
          <div className="mt-4">
            <Button
              onClick={fetchLectureDetail}
              className="custom-refresh-btn me-2"
            >
              새로고침
            </Button>
            <Button as={Link} to="/" variant="outline-secondary">
              홈으로 가기
            </Button>
          </div>
        </div>
      </Container>
    );

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  const embedUrl =
    lecture.sourceType === "YOUTUBE"
      ? getYoutubeEmbedUrl(lecture.videoUrl)
      : null;

  return (
    <Container
      className={`my-4 lecture-detail-container ${
        isSidebarCollapsed ? "collapsed" : ""
      }`}
    >
      <Row className="mb-4">
        <Col>
          <h2 className="lecture-title">{lecture.title}</h2>
          {lecture.description && (
            <p className="text-muted">{lecture.description}</p>
          )}
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
              <Nav
                variant="tabs"
                defaultActiveKey="summary"
                onSelect={setActiveTab}
                className="custom-nav-tabs"
              >
                <Nav.Item>
                  <Nav.Link eventKey="summary">요약</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="transcript">전체 스크립트</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="questions">예상 질문</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="studyplan">학습 계획</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body className="lecture-card-body">
              <Tab.Content>
                {/* 요약 탭 */}
                <Tab.Pane eventKey="summary" active={activeTab === "summary"}>
                  <h4>강의 요약</h4>
                  <div className="lecture-tab-content">
                    {lecture.summary || "요약 정보가 없습니다."}
                  </div>
                  <div className="download-btn-group mt-3">
                    <Button
                      className="txt-download-btn me-2"
                      onClick={() =>
                        handleDownload("summary", lecture.summary, "txt")
                      }
                    >
                      요약 TXT 다운로드
                    </Button>
                    <Button
                      className="pdf-download-btn"
                      onClick={() =>
                        handleDownload("summary", lecture.summary, "pdf")
                      }
                    >
                      요약 PDF 다운로드
                    </Button>
                  </div>
                </Tab.Pane>

                <Tab.Pane
                  eventKey="transcript"
                  active={activeTab === "transcript"}
                >
                  <h4>전체 스크립트</h4>
                  <div className="lecture-tab-content">
                    {lecture.transcript || "스크립트 정보가 없습니다."}
                  </div>
                  <div className="download-btn-group mt-3">
                    <Button
                      className="txt-download-btn me-2"
                      onClick={() =>
                        handleDownload("transcript", lecture.transcript, "txt")
                      }
                    >
                      스크립트 TXT 다운로드
                    </Button>
                    <Button
                      className="pdf-download-btn"
                      onClick={() =>
                        handleDownload("transcript", lecture.transcript, "pdf")
                      }
                    >
                      스크립트 PDF 다운로드
                    </Button>
                  </div>
                </Tab.Pane>

                <Tab.Pane
                  eventKey="questions"
                  active={activeTab === "questions"}
                >
                  <h4>예상 질문</h4>
                  <div className="lecture-tab-content">
                    {lecture.expectedQuestions || "예상 질문 정보가 없습니다."}
                  </div>
                  <div className="download-btn-group mt-3">
                    <Button
                      className="txt-download-btn me-2"
                      onClick={() =>
                        handleDownload(
                          "questions",
                          lecture.expectedQuestions,
                          "txt"
                        )
                      }
                    >
                      예상질문 TXT 다운로드
                    </Button>
                    <Button
                      className="pdf-download-btn"
                      onClick={() =>
                        handleDownload(
                          "questions",
                          lecture.expectedQuestions,
                          "pdf"
                        )
                      }
                    >
                      예상질문 PDF 다운로드
                    </Button>
                  </div>
                </Tab.Pane>

                <Tab.Pane
                  eventKey="studyplan"
                  active={activeTab === "studyplan"}
                >
                  <h4>학습 계획</h4>
                  <div className="lecture-tab-content">
                    {lecture.studyPlan || "학습 계획 정보가 없습니다."}
                  </div>
                  <div className="download-btn-group mt-3">
                    <Button
                      className="txt-download-btn me-2"
                      onClick={() =>
                        handleDownload("studyplan", lecture.studyPlan, "txt")
                      }
                    >
                      학습계획 TXT 다운로드
                    </Button>
                    <Button
                      className="pdf-download-btn"
                      onClick={() =>
                        handleDownload("studyplan", lecture.studyPlan, "pdf")
                      }
                    >
                      학습계획 PDF 다운로드
                    </Button>
                  </div>
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
