import React from 'react';
import PropTypes from 'prop-types';

const ChatMessage = ({ message }) => {
  const { content, isUser, timestamp } = message;
  
  // 타임스탬프 포맷팅
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className={`chat-message mb-3 ${isUser ? 'text-end' : ''}`}>
      <div 
        className={`d-inline-block p-3 rounded ${
          isUser 
            ? 'bg-primary text-white' 
            : 'bg-light border'
        }`}
        style={{ 
          maxWidth: '80%',
          textAlign: 'left'
        }}
      >
        <div style={{ whiteSpace: 'pre-line' }}>{content}</div>
        <div 
          className={`mt-1 ${isUser ? 'text-white-50' : 'text-muted'}`}
          style={{ fontSize: '0.75rem' }}
        >
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    content: PropTypes.string.isRequired,
    isUser: PropTypes.bool.isRequired,
    timestamp: PropTypes.string
  }).isRequired
};

export default ChatMessage; 