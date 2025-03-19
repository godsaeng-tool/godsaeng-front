import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { sendQuestion, getChatHistory } from '../../api/chatApi';
import ChatMessage from './ChatMessage';

const ChatInterface = ({ lectureId }) => {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // 채팅 기록 로드
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const data = await getChatHistory(lectureId);
        if (data && data.messages) {
          // 메시지 형식 변환 - API 응답 구조에 맞게 수정
          const formattedMessages = [];
          
          data.messages.forEach(msg => {
            // 각 메시지 객체에서 질문과 답변을 분리하여 별도의 메시지로 추가
            if (msg.question) {
              formattedMessages.push({
                id: msg.questionId || `q-${Date.now()}-${Math.random()}`,
                content: msg.question,
                isUser: true,
                timestamp: msg.timestamp
              });
            }
            
            if (msg.answer) {
              formattedMessages.push({
                id: msg.answerId || `a-${Date.now()}-${Math.random()}`,
                content: msg.answer,
                isUser: false,
                timestamp: msg.timestamp
              });
            }
          });
          
          setMessages(formattedMessages);
        }
      } catch (err) {
        console.error('채팅 기록 로딩 실패:', err);
        setError('채팅 기록을 불러오는데 실패했습니다.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchChatHistory();
  }, [lectureId]);

  // 메시지가 추가될 때마다 스크롤 아래로 이동
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    setLoading(true);
    setError('');
    
    // 사용자 메시지 즉시 추가
    const userMessage = {
      id: Date.now(),
      content: question,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentQuestion = question;
    setQuestion('');
    
    try {
      const response = await sendQuestion(lectureId, currentQuestion);
      
      // AI 응답 추가
      const aiMessage = {
        id: response.answerId,
        content: response.answer,
        isUser: false,
        timestamp: response.timestamp || new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('질문 전송 실패:', err);
      setError('질문을 처리하는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-100">
      <Card.Header>
        <h5 className="mb-0">AI 학습 도우미</h5>
      </Card.Header>
      <Card.Body className="d-flex flex-column p-0">
        <div 
          className="chat-messages p-3" 
          style={{ 
            flexGrow: 1, 
            overflowY: 'auto', 
            maxHeight: '400px',
            minHeight: '400px'
          }}
        >
          {initialLoading ? (
            <div className="text-center my-3">
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              채팅 기록을 불러오는 중...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted my-3">
              강의 내용에 대해 질문해보세요!
            </div>
          ) : (
            messages.map(message => (
              <ChatMessage 
                key={message.id} 
                message={message} 
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {error && (
          <Alert variant="danger" className="m-2 mb-0 py-2">
            {error}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit} className="p-2 border-top mt-auto">
          <div className="d-flex">
            <Form.Control
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="질문을 입력하세요..."
              disabled={loading}
            />
            <Button type="submit" className="ms-2"disabled={loading || !question.trim()}
            style={{ backgroundColor: "#FFC330", borderColor: "#FFC330", color: "black", height: "50px", width: "70px", display: "flex", alignItems: "center",  justifyContent: "center", fontSize: "17px"}}>
              {loading ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>) : ("전송")}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

ChatInterface.propTypes = {
  lectureId: PropTypes.string.isRequired
};

export default ChatInterface; 