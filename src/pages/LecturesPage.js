import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Pagination, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getLectures } from '../api/lectureApi';
import Loading from '../components/common/Loading';
import LectureCard from '../components/lectures/LectureCard';

const LecturesPage = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [processingLectures, setProcessingLectures] = useState([]);

  // 강의 목록 가져오기
  const fetchLectures = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getLectures(page);
      setLectures(response.content);
      setTotalPages(response.totalPages);
      
      // 처리 중인 강의 필터링
      const processing = response.content.filter(
        lecture => lecture.status === 'PROCESSING'
      );
      setProcessingLectures(processing);
    } catch (err) {
      console.error('강의 목록 로딩 실패:', err);
      setError('강의 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  // 초기 로딩
  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  // 처리 중인 강의가 있으면 폴링 시작
  useEffect(() => {
    let pollingInterval;
    
    if (processingLectures.length > 0) {
      pollingInterval = setInterval(() => {
        fetchLectures();
      }, 10000); // 10초마다 폴링
    }
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [processingLectures.length, fetchLectures]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // 강의 삭제 후 처리
  const handleLectureDeleted = (deletedLectureId) => {
    // 목록에서 삭제된 강의 제거
    setLectures(prevLectures => 
      prevLectures.filter(lecture => lecture.id !== deletedLectureId)
    );
    
    // 처리 중인 강의 목록에서도 제거
    setProcessingLectures(prevLectures => 
      prevLectures.filter(lecture => lecture.id !== deletedLectureId)
    );
    
    // 성공 메시지 표시
    alert('강의가 성공적으로 삭제되었습니다.');
  };

  if (loading && lectures.length === 0) {
    return <Loading message="강의 목록을 불러오는 중..." />;
  }

  return (
    <Container>
      <Row className="mb-4 align-items-center">
        <Col>
          <h1>내 강의 목록</h1>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/create-lecture" variant="primary">
            새 강의 만들기
          </Button>
        </Col>
      </Row>

      {processingLectures.length > 0 && (
        <Alert variant="info" className="mb-4">
          <Alert.Heading>강의 처리 중</Alert.Heading>
          <p>
            {processingLectures.length}개의 강의가 현재 처리 중입니다. 
            처리가 완료되면 자동으로 업데이트됩니다.
          </p>
          <hr />
          <p className="mb-0">
            처리 중인 강의: {processingLectures.map(l => l.title).join(', ')}
          </p>
        </Alert>
      )}

      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}

      {lectures.length === 0 ? (
        <Row>
          <Col>
            <div className="text-center my-5">
              <h4>아직 강의가 없습니다.</h4>
              <p>새 강의를 만들어 AI 학습을 시작해보세요!</p>
              <Button as={Link} to="/create-lecture" variant="primary">
                강의 만들기
              </Button>
            </div>
          </Col>
        </Row>
      ) : (
        <>
          <Row>
            {lectures.map((lecture) => (
              <Col key={lecture.id} md={4} className="mb-4">
                <LectureCard 
                  lecture={lecture} 
                  onDelete={handleLectureDeleted}
                />
              </Col>
            ))}
          </Row>

          {totalPages > 1 && (
            <Row className="mt-4">
              <Col className="d-flex justify-content-center">
                <Pagination>
                  <Pagination.First
                    onClick={() => handlePageChange(0)}
                    disabled={page === 0}
                  />
                  <Pagination.Prev
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                  />

                  {[...Array(totalPages).keys()].map((pageNum) => (
                    <Pagination.Item
                      key={pageNum}
                      active={pageNum === page}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum + 1}
                    </Pagination.Item>
                  ))}

                  <Pagination.Next
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages - 1}
                  />
                  <Pagination.Last
                    onClick={() => handlePageChange(totalPages - 1)}
                    disabled={page === totalPages - 1}
                  />
                </Pagination>
              </Col>
            </Row>
          )}
        </>
      )}
    </Container>
  );
};

export default LecturesPage; 