import React from "react";
import PropTypes from "prop-types";

const ChatMessage = ({ message }) => {
  const { content, isUser, timestamp, tone } = message;

  // 타임스탬프 포맷팅
  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 말투에 따른 스타일 변경 (선택적)
  const getToneStyle = () => {
    if (!tone || isUser) return {};
    
    switch(tone) {
      case 'a':
        return { borderLeft: '3px solid #FFB347' }; // 친근한 말투
      case 'b':
        return { borderLeft: '3px solid #77DD77' }; // 존댓말 말투
      case 'c':
        return { borderLeft: '3px solid #AEC6CF' }; // 전문가 말투
      default:
        return {};
    }
  };

  return (
    <div className={`chat-message mb-3 ${isUser ? "text-end" : ""}`}>
      <div
        className={`d-inline-block p-3 rounded ${
          isUser ? "" : "bg-light border"
        }`}
        style={{
          maxWidth: "80%",
          textAlign: "left",
          backgroundColor: isUser ? "#FFD878" : undefined,
          color: isUser ? "black" : undefined,
          ...(!isUser ? getToneStyle() : {})
        }}
      >
        <div style={{ whiteSpace: "pre-line" }}>{content}</div>
        <div
          className={`mt-1 ${isUser ? "text-black-50" : "text-muted"}`}
          style={{ fontSize: "0.75rem" }}
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
    timestamp: PropTypes.string,
    tone: PropTypes.string // 선택적 말투 정보
  }).isRequired,
};

export default ChatMessage;
