import React, { useState, useEffect } from 'react';
import { getUserProfile } from '../../api/authApi';
import { useAppState } from '../../context/AppStateProvider';
import GodModeSubscription from '../../components/subscription/GodModeSubscription';
import '../../styles/Profile/ProfilePage.css';

const ProfilePage = () => {
  const { userEmail, userName, isGodMode } = useAppState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile();
        setUserProfile(profile);
      } catch (err) {
        console.error('프로필 정보 로딩 실패:', err);
        setError('프로필 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) return <div className="profile-loading">프로필 정보를 불러오는 중...</div>;
  if (error) return <div className="profile-error">{error}</div>;

  return (
    <div className="profile-container">
      <h1>내 프로필</h1>
      
      <div className="profile-card">
        <div className="profile-header">
          <h2>{userName}</h2>
          <div className="subscription-status">
            <GodModeSubscription />
          </div>
        </div>
        
        <div className="profile-info">
          <div className="info-item">
            <span className="label">이메일</span>
            <span className="value">{userEmail}</span>
          </div>
          <div className="info-item">
            <span className="label">가입일</span>
            <span className="value">{userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : '정보 없음'}</span>
          </div>
          <div className="info-item">
            <span className="label">갓생모드</span>
            <span className="value">{isGodMode ? '활성화' : '비활성화'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 