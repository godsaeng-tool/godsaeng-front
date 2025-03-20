import React, { useState, useEffect, useRef } from "react";
import { Button, Form } from "react-bootstrap";
import { sendMessage, getChatHistory } from "../../api/chatApi";
import ChatMessage from "./ChatMessage";
import "../../styles/Chat/ChatInterface.css";

const ChatInterface = ({ lectureId, hideHeader = false }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 채팅 기록 로드
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const history = await getChatHistory(lectureId);
        setMessages(history);
      } catch (error) {
        console.error("채팅 기록 로딩 실패:", error);
      }
    };

    if (lectureId) {
      loadChatHistory();
    }
  }, [lectureId]);

  // 메시지 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      content: newMessage,
      sender: "USER",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setLoading(true);

    try {
      const response = await sendMessage(lectureId, newMessage);
      setMessages((prev) => [...prev, {
        id: response.id || Date.now() + 1,
        content: response.content,
        sender: "AI",
        timestamp: response.timestamp || new Date().toISOString(),
      }]);
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        content: "죄송합니다, 메시지 처리 중 오류가 발생했습니다.",
        sender: "AI",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      {/* 헤더 제거 - 부모 컴포넌트에서 제공하는 Card.Header만 사용 */}
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat-message">
            <p>
              죄송하지만, 이전의 질문이나 대화 내용을 기억할 수 없습니다. 새로운
              질문이나 궁금한 점이 있다면 언제든지 말씀해 주세요!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))
        )}
        {loading && (
          <div className="ai-typing">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <Form onSubmit={handleSendMessage} className="chat-input-form">
        <Form.Control
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="질문을 입력하세요..."
          disabled={loading}
        />
        <Button 
          type="submit" 
          disabled={loading || !newMessage.trim()}
          className="send-button"
        >
          전송
        </Button>
      </Form>
    </div>
  );
};

export default ChatInterface; 