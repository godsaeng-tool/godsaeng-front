//pages\Summary\SummaryLoadingPage.jsx
import React from 'react';
import { Spinner, ProgressBar, Alert } from 'react-bootstrap';

const SummaryLoadingPage = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '80vh' }}>
      <Spinner animation="border" role="status" variant="warning" style={{ width: '4rem', height: '4rem' }} />
      <p className="mt-3 mb-1 fs-5 fw-semibold text-center">AI가 강의를 요약 중입니다...</p>
      <ProgressBar
        animated
        now={100}
        variant="warning"
        style={{ width: '60%', marginTop: '10px' }}
      />
      <Alert variant="light" className="mt-4 text-center w-50">
        잠시만 기다려주세요! 요약이 완료되면 자동으로 결과 페이지로 이동합니다.
      </Alert>
    </div>
  );
};

export default SummaryLoadingPage;
