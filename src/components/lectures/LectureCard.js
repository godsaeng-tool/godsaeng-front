// import React, { useState } from 'react';
// import { Card, Badge, Button, Modal } from 'react-bootstrap';
// import { Link } from 'react-router-dom';
// import PropTypes from 'prop-types';
// import { deleteLecture } from '../../api/lectureApi';

// const LectureCard = ({ lecture, onDelete }) => {
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [deleting, setDeleting] = useState(false);

//   // 강의 상태에 따른 배지 색상 설정
//   const getStatusBadge = (status) => {
//     switch (status) {
//       case 'COMPLETED':
//         return <Badge bg="success">완료</Badge>;
//       case 'PROCESSING':
//         return <Badge bg="warning">처리 중</Badge>;
//       case 'FAILED':
//         return <Badge bg="danger">실패</Badge>;
//       default:
//         return <Badge bg="secondary">{status}</Badge>;
//     }
//   };

//   // 강의 소스 타입에 따른 아이콘 설정
//   const getSourceIcon = (sourceType) => {
//     switch (sourceType) {
//       case 'YOUTUBE':
//         return '📺';
//       case 'UPLOAD':
//         return '📁';
//       default:
//         return '📝';
//     }
//   };

//   // 날짜 포맷팅
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('ko-KR', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   // 삭제 관련 함수 추가
//   const handleShowDeleteModal = (e) => {
//     e.stopPropagation();
//     e.preventDefault();
//     setShowDeleteModal(true);
//   };

//   const handleCloseDeleteModal = () => {
//     setShowDeleteModal(false);
//   };

//   const handleDeleteLecture = async () => {
//     try {
//       setDeleting(true);
//       await deleteLecture(lecture.id);
//       handleCloseDeleteModal();
//       if (onDelete) {
//         onDelete(lecture.id);
//       }
//     } catch (error) {
//       console.error('강의 삭제 실패:', error);
//       alert('강의 삭제에 실패했습니다.');
//     } finally {
//       setDeleting(false);
//     }
//   };

//   return (
//     <>
//       <Card className="h-100">
//         <Card.Body>
//           <div className="d-flex justify-content-between mb-2">
//             <div>{getSourceIcon(lecture.sourceType)}</div>
//             <div>{getStatusBadge(lecture.status)}</div>
//           </div>
//           <Card.Title>{lecture.title}</Card.Title>
//           <Card.Text>
//             {lecture.description ? (
//               lecture.description.length > 100 
//                 ? `${lecture.description.substring(0, 100)}...` 
//                 : lecture.description
//             ) : (
//               <span className="text-muted">설명 없음</span>
//             )}
//           </Card.Text>
//         </Card.Body>
//         <Card.Footer>
//           <div className="d-flex justify-content-between align-items-center">
//             <small className="text-muted">
//               {formatDate(lecture.createdAt)}
//             </small>
//             <div>
//               <Button 
//                 variant="outline-danger"
//                 size="sm"
//                 className="me-2"
//                 onClick={handleShowDeleteModal}
//               >
//                 삭제
//               </Button>
//               <Button 
//                 as={Link} 
//                 to={`/lectures/${lecture.id}`} 
//                 variant="outline-primary"
//                 size="sm"
//                 disabled={lecture.status !== 'COMPLETED'}
//               >
//                 {lecture.status === 'COMPLETED' ? '학습하기' : '준비 중'}
//               </Button>
//             </div>
//           </div>
//         </Card.Footer>
//       </Card>

//       {/* 삭제 확인 모달 */}
//       <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
//         <Modal.Header closeButton>
//           <Modal.Title>강의 삭제</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p>정말로 "{lecture.title}" 강의를 삭제하시겠습니까?</p>
//           <p className="text-danger">이 작업은 되돌릴 수 없으며, 모든 채팅 기록도 함께 삭제됩니다.</p>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseDeleteModal}>
//             취소
//           </Button>
//           <Button 
//             variant="danger" 
//             onClick={handleDeleteLecture}
//             disabled={deleting}
//           >
//             {deleting ? '삭제 중...' : '삭제'}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </>
//   );
// };

// LectureCard.propTypes = {
//   lecture: PropTypes.shape({
//     id: PropTypes.number.isRequired,
//     title: PropTypes.string.isRequired,
//     description: PropTypes.string,
//     sourceType: PropTypes.string.isRequired,
//     status: PropTypes.string.isRequired,
//     createdAt: PropTypes.string.isRequired,
//     updatedAt: PropTypes.string
//   }).isRequired,
//   onDelete: PropTypes.func
// };

// export default LectureCard; 