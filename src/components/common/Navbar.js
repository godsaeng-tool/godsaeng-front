import React, { useState, useEffect } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, removeTokens } from '../../utils/tokenUtils';
import { getCurrentUser } from '../../api/authApi';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('사용자 정보 로딩 실패:', error);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    removeTokens();
    setUser(null);
    navigate('/login');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">갓생 학습</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">홈</Nav.Link>
            {isAuthenticated() && (
              <>
                <Nav.Link as={Link} to="/lectures">내 강의</Nav.Link>
                <Nav.Link as={Link} to="/create-lecture">강의 만들기</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {!loading && (
              isAuthenticated() ? (
                <>
                  <Nav.Item className="d-flex align-items-center text-light me-3">
                    {user?.username || '사용자'}님 환영합니다
                  </Nav.Item>
                  <Button variant="outline-light" onClick={handleLogout}>로그아웃</Button>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">로그인</Nav.Link>
                  <Nav.Link as={Link} to="/signup">회원가입</Nav.Link>
                </>
              )
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar; 