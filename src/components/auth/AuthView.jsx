import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../supabase';

const AuthView = ({ onLogoClick, showAdminLogin, setShowAdminLogin, setUser, setSession, setIsAdmin }) => {
  const handleOAuthLogin = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          scope: 'profile_nickname profile_image',
        },
      },
    });
    if (error) alert("로그인 오류: " + error.message);
  };

  const handleAdminLogin = (e) => {
    const name = e.target.elements.name.value;
    const password = e.target.elements.password.value;
    
    // Check Super Admin bypass
    if (name === "백동희" && password === "0000") {
      setIsAdmin(true); 
      setUser({ id: 'admin-id', email: 'admin@heartsync.com', user_metadata: { full_name: '백동희', role: 'admin' } });
      setSession({ user: { id: 'admin-id', role: 'admin' } });
      localStorage.setItem('isAdmin', 'true');
      // No need to reload, the state update will trigger render
      return;
    }

    alert("일치하는 관리자 정보가 없습니다.");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', backgroundColor: 'white', padding: '60px 30px', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
    >
      <motion.img 
        whileTap={{ scale: 0.9 }}
        onClick={onLogoClick}
        src="/logo_main.png" 
        alt="Heart Sync" 
        style={{ width: '180px', marginBottom: '10px', cursor: 'pointer' }} 
      />
      <h1 className="brand-text" style={{ fontSize: '28px', color: '#D4AF37', fontWeight: 900, marginBottom: '5px' }}>HEART SYNC</h1>
      <p style={{ fontSize: '14px', color: '#8B7355', marginBottom: '50px', fontWeight: 600 }}>부부의 마음을 더 깊게, 더 가까이</p>
      
      {showAdminLogin ? (
        <motion.form 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          onSubmit={(e) => { e.preventDefault(); handleAdminLogin(e); }}
          style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          <div style={{ textAlign: 'left', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#D4AF37' }}>ADMIN PORTAL (관리자 모드)</span>
          </div>
          <input name="name" placeholder="이름" style={{ padding: '15px', borderRadius: '15px', background: '#F8FAFC', border: '1px solid #E2E8F0', outline: 'none' }} />
          <input name="phone" placeholder="전화번호" style={{ padding: '15px', borderRadius: '15px', background: '#F8FAFC', border: '1px solid #E2E8F0', outline: 'none' }} />
          <input name="password" type="password" placeholder="비밀번호" style={{ padding: '15px', borderRadius: '15px', background: '#F8FAFC', border: '1px solid #E2E8F0', outline: 'none' }} />
          <button type="submit" style={{ padding: '16px', borderRadius: '15px', background: '#1E293B', color: 'white', fontWeight: 900, border: 'none', marginTop: '10px' }}>로그인</button>
          <button type="button" onClick={() => setShowAdminLogin(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '12px', fontWeight: 800 }}>취소</button>
        </motion.form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px' }}>
          <button 
            onClick={() => handleOAuthLogin('kakao')}
            style={{ width: '100%', padding: '16px', borderRadius: '15px', background: '#FEE500', color: '#3C1E1E', fontWeight: 900, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '15px' }}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg" width="20" alt="Kakao" />
            카카오로 1초 만에 시작하기
          </button>
          <div style={{ height: '10px' }} />
        </div>
      )}
      
      <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '40px', lineHeight: 1.6 }}>
        로그인 시 Heart Sync의 <span style={{ textDecoration: 'underline' }}>이용약관</span> 및<br/>
        <span style={{ textDecoration: 'underline' }}>개인정보 처리방침</span>에 동의하게 됩니다.
      </p>
    </motion.div>
  );
};

export default AuthView;
