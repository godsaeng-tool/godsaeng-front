import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loading = ({ message = '로딩 중...' }) => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center my-5">
      <Spinner animation="border" role="status" variant="primary" />
      <span className="mt-2">{message}</span>
    </div>
  );
};

export default Loading; 