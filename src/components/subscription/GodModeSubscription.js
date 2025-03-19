import React, { useState } from 'react';
import { FaCrown } from 'react-icons/fa';
import { updateGodMode } from '../../api/authApi';
import { useAppState } from '../../context/AppStateProvider';
import '../../styles/subscription/GodModeSubscription.css';

const GodModeSubscription = () => {
  const { isGodMode, setIsGodMode } = useAppState();
  const [loading, setLoading] = useState(false);

  const toggleGodMode = async () => {
    setLoading(true);
    try {
      const newGodModeStatus = !isGodMode;
      await updateGodMode(newGodModeStatus);
      setIsGodMode(newGodModeStatus);
      
      if (newGodModeStatus) {
        alert('갓생모드가 활성화되었습니다! 더 많은 기능을 이용해보세요.');
      } else {
        alert('갓생모드가 비활성화되었습니다.');
      }
    } catch (error) {
      console.error('갓생모드 변경 실패:', error);
      alert('갓생모드 변경에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="god-mode-container" onClick={toggleGodMode}>
      <FaCrown className={`crown-icon ${isGodMode ? 'active' : ''}`} />
      <span className="god-mode-text">
        {loading ? '처리 중...' : isGodMode ? '갓생모드 활성화됨' : '갓생모드 구독'}
      </span>
    </div>
  );
};

export default GodModeSubscription; 