// import React, { useState, useEffect, useCallback } from 'react';
// import { Container, Row, Col, Card, Nav, Tab, Alert, Button, Spinner } from 'react-bootstrap';
// import { useLocation,useParams, Link, useNavigate } from 'react-router-dom';
// import { getLectureDetail } from '../../api/lectureApi';
// import Loading from '../../components/common/Loading';
// import ChatInterface from '../../components/chat/ChatInterface';

// const SummaryPage = () => {
//   const { lectureId } = useParams();
//   const [lecture, setLecture] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [activeTab, setActiveTab] = useState('summary');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const navigate = useNavigate();

//   // 강의 상세 정보 가져오기
//   const fetchLectureDetail = useCallback(async () => {
//     try {
//       setLoading(true);
//       const data = await getLectureDetail(lectureId);
//       setLecture(data);
//       setIsProcessing(data.status === 'PROCESSING');
//     } catch (err) {
//       console.error('강의 상세 정보 로딩 실패:', err);
//       setError('강의 정보를 불러오는데 실패했습니다.');
//     } finally {
//       setLoading(false);
//     }
//   }, [lectureId]);

//   // 초기 로딩
//   useEffect(() => {
//     fetchLectureDetail();
//   }, [fetchLectureDetail]);

//   // 처리 중인 경우 폴링
//   useEffect(() => {
//     let pollingInterval;
    
//     if (isProcessing) {
//       pollingInterval = setInterval(() => {
//         fetchLectureDetail();
//       }, 5000); // 5초마다 폴링
//     }
    
//     return () => {
//       if (pollingInterval) {
//         clearInterval(pollingInterval);
//       }
//     };
//   }, [isProcessing, fetchLectureDetail]);

//   if (loading && !lecture) {
//     return <Loading message="강의 정보를 불러오는 중..." />;
//   }

//   if (error) {
//     return (
//       <Container className="my-5">
//         <Alert variant="danger">
//           {error}
//           <div className="mt-3">
//             <Button as={Link} to="/lectures" variant="outline-primary">
//               강의 목록으로 돌아가기
//             </Button>
//           </div>
//         </Alert>
//       </Container>
//     );
//   }

//   if (!lecture) {
//     return (
//       <Container className="my-5">
//         <Alert variant="warning">
//           강의를 찾을 수 없습니다.
//           <div className="mt-3">
//             <Button as={Link} to="/lectures" variant="outline-primary">
//               강의 목록으로 돌아가기
//             </Button>
//           </div>
//         </Alert>
//       </Container>
//     );
//   }

//   // 처리 중인 경우 표시
//   if (isProcessing) {
//     return (
//       <Container className="my-5">
//         <Alert variant="info">
//           <div className="text-center my-4">
//             <Spinner animation="border" role="status" variant="primary" className="mb-3" />
//             <h4>강의 처리 중...</h4>
//             <p className="mb-4">
//               강의 내용을 분석하고 AI 학습 자료를 생성하는 중입니다.
//               이 과정은 몇 분 정도 소요될 수 있습니다.
//             </p>
//             <p>
//               <strong>강의 제목:</strong> {lecture.title}
//             </p>
//             {lecture.description && (
//               <p>
//                 <strong>설명:</strong> {lecture.description}
//               </p>
//             )}
//             <div className="mt-4">
//               <Button onClick={fetchLectureDetail} variant="outline-primary" className="me-2">
//                 새로고침
//               </Button>
//               <Button as={Link} to="/lectures" variant="outline-secondary">
//                 강의 목록으로 돌아가기
//               </Button>
//             </div>
//           </div>
//         </Alert>
//       </Container>
//     );
//   }

//   // 유튜브 URL에서 비디오 ID 추출
//   const getYoutubeEmbedUrl = (url) => {
//     if (!url) return null;
    
//     const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//     const match = url.match(regExp);
    
//     return (match && match[2].length === 11)
//       ? `https://www.youtube.com/embed/${match[2]}`
//       : null;
//   };

//   const embedUrl = lecture.sourceType === 'YOUTUBE' ? getYoutubeEmbedUrl(lecture.videoUrl) : null;

//   return (
//     <Container className="my-4">
//       <Row className="mb-4">
//         <Col>
//           <h2>{lecture.title}</h2>
//           {lecture.description && <p className="text-muted">{lecture.description}</p>}
//         </Col>
//         <Col xs="auto">
//           <Button as={Link} to="/lectures" variant="outline-secondary">
//             목록으로
//           </Button>
//         </Col>
//       </Row>

//       {embedUrl && (
//         <Row className="mb-4">
//           <Col>
//             <div className="ratio ratio-16x9">
//               <iframe
//                 src={embedUrl}
//                 title={lecture.title}
//                 allowFullScreen
//               ></iframe>
//             </div>
//           </Col>
//         </Row>
//       )}

//       <Row>
//         <Col md={8}>
//           <Card className="mb-4">
//             <Card.Header>
//               <Nav variant="tabs" defaultActiveKey="summary" onSelect={setActiveTab}>
//                 <Nav.Item>
//                   <Nav.Link eventKey="summary">요약</Nav.Link>
//                 </Nav.Item>
//                 <Nav.Item>
//                   <Nav.Link eventKey="transcript">전체 스크립트</Nav.Link>
//                 </Nav.Item>
//                 <Nav.Item>
//                   <Nav.Link eventKey="questions">예상 질문</Nav.Link>
//                 </Nav.Item>
//                 <Nav.Item>
//                   <Nav.Link eventKey="studyplan">학습 계획</Nav.Link>
//                 </Nav.Item>
//               </Nav>
//             </Card.Header>
//             <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
//               <Tab.Content>
//                 <Tab.Pane eventKey="summary" active={activeTab === 'summary'}>
//                   <h4>강의 요약</h4>
//                   <div className="mt-3" style={{ whiteSpace: 'pre-line' }}>
//                     {lecture.summary || '요약 정보가 없습니다.'}
//                   </div>
//                 </Tab.Pane>
//                 <Tab.Pane eventKey="transcript" active={activeTab === 'transcript'}>
//                   <h4>전체 스크립트</h4>
//                   <div className="mt-3" style={{ whiteSpace: 'pre-line' }}>
//                     {lecture.transcript || '스크립트 정보가 없습니다.'}
//                   </div>
//                 </Tab.Pane>
//                 <Tab.Pane eventKey="questions" active={activeTab === 'questions'}>
//                   <h4>예상 질문</h4>
//                   <div className="mt-3" style={{ whiteSpace: 'pre-line' }}>
//                     {lecture.expectedQuestions || '예상 질문 정보가 없습니다.'}
//                   </div>
//                 </Tab.Pane>
//                 <Tab.Pane eventKey="studyplan" active={activeTab === 'studyplan'}>
//                   <h4>학습 계획</h4>
//                   <div className="mt-3" style={{ whiteSpace: 'pre-line' }}>
//                     {lecture.studyPlan || '학습 계획 정보가 없습니다.'}
//                   </div>
//                 </Tab.Pane>
//               </Tab.Content>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={4}>
//           <ChatInterface lectureId={lectureId} />
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default SummaryPage; 