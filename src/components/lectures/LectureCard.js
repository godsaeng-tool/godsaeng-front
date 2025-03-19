import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const LectureCard = ({ lecture }) => {
  // 강의 상태에 따른 배지 색상 설정
  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge bg="success">완료</Badge>;
      case 'PROCESSING':
        return <Badge bg="warning">처리 중</Badge>;
      case 'FAILED':
        return <Badge bg="danger">실패</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // 강의 소스 타입에 따른 아이콘 설정
  const getSourceIcon = (sourceType) => {
    switch (sourceType) {
      case 'YOUTUBE':
        return '📺';
      case 'UPLOAD':
        return '📁';
      default:
        return '📝';
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="h-100">
      <Card.Body>
        <div className="d-flex justify-content-between mb-2">
          <div>{getSourceIcon(lecture.sourceType)}</div>
          <div>{getStatusBadge(lecture.status)}</div>
        </div>
        <Card.Title>{lecture.title}</Card.Title>
        <Card.Text>
          {lecture.description ? (
            lecture.description.length > 100 
              ? `${lecture.description.substring(0, 100)}...` 
              : lecture.description
          ) : (
            <span className="text-muted">설명 없음</span>
          )}
        </Card.Text>
      </Card.Body>
      <Card.Footer>
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            {formatDate(lecture.createdAt)}
          </small>
          <Button 
            as={Link} 
            to={`/lectures/${lecture.id}`} 
            variant="outline-primary"
            size="sm"
            disabled={lecture.status !== 'COMPLETED'}
          >
            {lecture.status === 'COMPLETED' ? '학습하기' : '준비 중'}
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
};

LectureCard.propTypes = {
  lecture: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    sourceType: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string
  }).isRequired
};

export default LectureCard; 