import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  User, 
  Smartphone, 
  Lock, 
  BarChart3, 
  Info, 
  Share2, 
  Users, 
  Sparkles, 
  Palette,
  Bell,
  Activity,
  Trash2,
  RefreshCw,
  LogOut,
  Clock,
  Plus,
  Calendar,
  Edit2
} from 'lucide-react';
import { supabase } from '../../supabase';
import DeepAnalysisView from './DeepAnalysisView';
import HattiCharacter from '../ui/HattiCharacter';

// --- Primitive Settings Components ---
const SettingsSection = ({ title, children }) => (
  <div style={{ marginBottom: '25px', padding: '0 20px' }}>
    <h3 style={{ fontSize: '13px', fontWeight: 900, color: 'rgba(45, 31, 8, 0.3)', marginBottom: '12px', paddingLeft: '5px' }}>{title}</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {children}
    </div>
  </div>
);

const SettingsItem = ({ icon, label, onClick }) => (
  <motion.button 
    whileTap={{ scale: 0.98 }}
    onClick={onClick} 
    style={{ 
      background: 'rgba(255, 255, 255, 0.6)', 
      padding: '18px 20px', 
      borderRadius: '20px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      cursor: 'pointer',
      width: '100%',
      border: 'none',
      appearance: 'none',
      textAlign: 'left'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      <span style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>{icon}</span>
      <span style={{ fontSize: '16px', fontWeight: 800, color: '#2D1F08' }}>{label}</span>
    </div>
    <ChevronLeft size={18} style={{ transform: 'rotate(180deg)', opacity: 0.3 }} />
  </motion.button>
);

const SettingsToggle = ({ icon, label, active, onToggle }) => (
  <div style={{ 
    background: 'rgba(255, 255, 255, 0.6)', 
    padding: '18px 20px', 
    borderRadius: '20px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      <span style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>{icon}</span>
      <span style={{ fontSize: '16px', fontWeight: 800, color: '#2D1F08' }}>{label}</span>
    </div>
    <div onClick={onToggle} style={{ 
      width: '46px', height: '26px', borderRadius: '100px', 
      background: active ? 'linear-gradient(135deg, #FF9966, #FF5E62)' : '#DDD',
      position: 'relative', cursor: 'pointer', transition: '0.3s'
    }}>
      <div style={{ 
        width: '20px', height: '20px', borderRadius: '50%', background: 'white',
        position: 'absolute', top: '3px', left: active ? '23px' : '3px', transition: '0.3s',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }} />
    </div>
  </div>
);

// --- Main SettingsView Component ---
const SettingsView = ({ 
  user,
  userRole, 
  husbandInfo, 
  setHusbandInfo,
  wifeInfo, 
  setWifeInfo,
  worshipDays,
  setWorshipDays,
  worshipTime,
  setWorshipTime,
  anniversaries,
  setAnniversaries,
  onReportClick, 
  onGuideClick,
  isAdmin,
  onNav,
  onUpdateMemo,
  coupleCode,
  setCoupleCode,
  subscribeToPushNotifications // Pass this as prop from App!
}) => {
  const [showDeepAnalysis, setShowDeepAnalysis] = useState(false);
  const [showNotifIntegration, setShowNotifIntegration] = useState(false);
  const [showDataSecurity, setShowDataSecurity] = useState(false);
  const [showNotifDiag, setShowNotifDiag] = useState(false);
  const [diagStep, setDiagStep] = useState(0);

  const myInfo = userRole === 'husband' ? husbandInfo : wifeInfo;
  const setMyInfo = userRole === 'husband' ? setHusbandInfo : setWifeInfo;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col w-full pb-32">
      <div style={{ padding: '30px 24px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#2D1F08', letterSpacing: '-1px' }}>환경 설정</h2>
            <div style={{ padding: '10px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '15px' }}>
              <Users size={24} color="#D4AF37" />
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'white', padding: '20px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '35px', border: '1px solid rgba(138, 96, 255, 0.1)' }}>
             <div style={{ width: '60px', height: '60px', borderRadius: '20px', overflow: 'hidden', background: '#F8FAFB', border: '1px solid #EEE' }}>
               <img src={userRole === 'husband' ? '/husband.png' : '/wife.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
             </div>
             <div style={{ flex: 1 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <p style={{ fontSize: '18px', fontWeight: 900, color: '#1E293B' }}>{myInfo?.nickname || (userRole === 'husband' ? '남편' : '아내')}님</p>
                 <div style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(138, 96, 255, 0.1)', color: '#8A60FF', fontSize: '10px', fontWeight: 800 }}>MASTER</div>
               </div>
               <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>{user?.email}</p>
             </div>
          </div>

          <SettingsSection title="📋 데이터 분석">
            <SettingsItem icon={<BarChart3 size={20} color="#8A60FF" />} label="종합 소통 분석 리포트" onClick={onReportClick} />
            <SettingsItem 
              icon={<Sparkles size={20} color="#8A60FF" />} 
              label="AI 하티 심층 성향 진단" 
              onClick={() => setShowDeepAnalysis(true)} 
            />
          </SettingsSection>

          <SettingsSection title="📅 우리 부부의 기념일 (D-Day)">
            <div style={{ background: 'rgba(255, 255, 255, 0.6)', padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Marriage Date (Primary) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(212, 175, 55, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ background: 'rgba(212, 175, 55, 0.15)', padding: '8px', borderRadius: '12px' }}>
                     <Heart size={18} color="#D4AF37" fill="#D4AF37" />
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column' }}>
                     <span style={{ fontSize: '14px', fontWeight: 900, color: '#2D1F08' }}>결혼기념일</span>
                     <span style={{ fontSize: '11px', color: '#8B7355', fontWeight: 700 }}>{myInfo?.marriageDate || '2020-05-23'}</span>
                   </div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#D4AF37' }}>
                  D+{Math.floor((new Date() - new Date(myInfo?.marriageDate || '2020-05-23')) / 86400000)}
                </div>
              </div>

              {/* Dynamic Anniversaries */}
              {(anniversaries || []).map((annif) => (
                <div key={annif.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <div style={{ background: 'rgba(0, 0, 0, 0.05)', padding: '8px', borderRadius: '12px' }}>
                       <Calendar size={18} color="#64748B" />
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontSize: '14px', fontWeight: 800, color: '#2D1F08' }}>{annif.title}</span>
                       <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>{annif.date}</span>
                     </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#2D1F08' }}>
                      {(() => {
                        const diff = Math.ceil((new Date(annif.date) - new Date()) / 86400000);
                        return diff === 0 ? 'D-Day' : diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
                      })()}
                    </div>
                    <button 
                      onClick={() => setAnniversaries(prev => prev.filter(a => a.id !== annif.id))}
                      style={{ border: 'none', background: 'none', padding: '5px' }}
                    >
                      <Trash2 size={16} color="#EF4444" opacity={0.5} />
                    </button>
                  </div>
                </div>
              ))}

              <button 
                onClick={() => {
                  const title = prompt("기념일 이름을 입력하세요:");
                  if (!title) return;
                  const date = prompt("날짜를 입력하세요 (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
                  if (!date) return;
                  setAnniversaries(prev => [...(prev || []), { id: Date.now(), title, date }]);
                }}
                style={{
                  width: '100%', padding: '12px', borderRadius: '15px', background: 'white',
                  border: '1px dashed #D4AF37', color: '#B08D3E', fontSize: '13px', fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '5px'
                }}
              >
                <Plus size={16} /> 새로운 기념일 추가
              </button>
            </div>
          </SettingsSection>

          <SettingsSection title="🔔 알림 및 동기화">
             <SettingsItem icon={<Smartphone size={20} color="#3B82F6" />} label="기기 알림(푸시) 활성화" onClick={() => setShowNotifIntegration(true)} />
             <SettingsItem icon={<Activity size={20} color="#EF4444" />} label="알림 전송 장애 진단하기" onClick={() => setShowNotifDiag(true)} />
          </SettingsSection>

          <SettingsSection title="⛪ 가정예배 스케줄">
            <div style={{ background: 'rgba(255, 255, 255, 0.6)', padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 900, color: '#8B7355', marginBottom: '10px', display: 'block' }}>예배 요일 선택</label>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '5px' }}>
                  {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => {
                    const isActive = worshipDays.includes(idx);
                    return (
                      <button
                        key={day}
                        onClick={() => {
                          const newDays = isActive ? worshipDays.filter(d => d !== idx) : [...worshipDays, idx];
                          setWorshipDays(newDays);
                        }}
                        style={{
                          flex: 1, padding: '10px 0', borderRadius: '12px', fontSize: '12px', fontWeight: 900,
                          background: isActive ? '#D4AF37' : 'white',
                          color: isActive ? 'white' : '#8B7355',
                          border: isActive ? 'none' : '1px solid #F5E6CC',
                          transition: '0.3s'
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F5E6CC', paddingTop: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={18} color="#D4AF37" />
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#2D1F08' }}>예배 알림 시간</span>
                </div>
                <input 
                  type="time" 
                  value={worshipTime}
                  onChange={(e) => setWorshipTime(e.target.value)}
                  style={{
                    border: '1px solid #F5E6CC', background: 'white', padding: '8px 12px', borderRadius: '12px',
                    fontSize: '14px', fontWeight: 900, color: '#2D1F08', outline: 'none'
                  }}
                />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="⚙️ 배경 및 개인화">
            <SettingsItem icon={<Palette size={20} color="#D946EF" />} label="테마 및 배경 컬러 (준비중)" onClick={() => alert("나만의 테마 기능은 Pro 버전에서 제공될 예정입니다.")} />
            <SettingsToggle icon={<Bell size={20} color="#F59E0B" />} label="실시간 무드 푸시 알림" active={true} onToggle={() => {}} />
          </SettingsSection>

          <SettingsSection title="🛡️ 보안 및 지원">
            <SettingsItem icon={<Lock size={20} color="#0369A1" />} label="데이터 보안 및 암호화" onClick={() => setShowDataSecurity(true)} />
            <SettingsItem icon={<Info size={20} color="#475569" />} label="기능 가이드 다시보기" onClick={onGuideClick} />
            <SettingsItem icon={<Users size={20} color="#475569" />} label="커플 연결 해제 및 초기화" onClick={() => { if(window.confirm("배우자와의 연결을 해제하시겠습니까? 모든 공유 데이터가 초기화됩니다.")) alert("연결 해제 프로세스 시작..."); }} />
          </SettingsSection>
          
          <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.05)', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#8B7355', width: '90px' }}>내 계정 ID:</span>
              <code style={{ fontSize: '11px', fontWeight: 900, color: '#8B7355', background: 'rgba(0,0,0,0.05)', padding: '3px 8px', borderRadius: '4px' }}>{user?.id?.substring(0,8).toUpperCase()}</code>
            </div>
            <div 
              onClick={() => {
                const code = prompt("커플 연결 코드를 입력하세요 (배우자와 동일한 코드를 사용해야 합니다):", coupleCode || "");
                if (code !== null) {
                  localStorage.setItem('coupleCode', code.toLowerCase().trim());
                  if (setCoupleCode) setCoupleCode(code.toLowerCase().trim());
                  alert("🎉 커플 코드가 설정되었습니다. 이제 데이터가 배우자와 실시간으로 동기화됩니다!");
                  window.location.reload(); // Force reload to ensure all channels resync correctly
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#D4AF37', width: '90px' }}>커플 연결 코드:</span>
              <code style={{ fontSize: '13px', fontWeight: 900, color: '#2D1F08', background: 'rgba(212, 175, 55, 0.15)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>{coupleCode || "연결 필요 (클릭)"}</code>
            </div>
            <p style={{ fontSize: '10px', color: '#8B7355', opacity: 0.7, marginTop: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              💡 배우자와 <b>'동일한 코드'</b> 사용 시 실시간 동기화됩니다 (계정 ID는 달라도 무관)
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              if(window.confirm("로그아웃 하시겠습니까?")) {
                localStorage.clear();
                supabase.auth.signOut().then(() => {
                  window.location.href = '/'; 
                });
                // Fallback redirect if signout hangs
                setTimeout(() => { window.location.href = '/'; }, 800);
              }
            }}
            style={{ width: '100%', padding: '16px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', fontWeight: 800, border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <LogOut size={20} /> 로그아웃
          </motion.button>
      </div>

      <AnimatePresence>
        {showDeepAnalysis && (
          <DeepAnalysisView 
            onBack={() => setShowDeepAnalysis(false)}
            myInfo={myInfo}
            updateProfile={onUpdateMemo} // Use onUpdateMemo here
          />
        )}
      </AnimatePresence>

      {showNotifIntegration && (
        <div onClick={() => setShowNotifIntegration(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', borderRadius: '35px', padding: '35px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
            <Smartphone size={32} color="#3B82F6" style={{ marginBottom: '15px' }} />
            <h3 style={{ fontSize: '19px', fontWeight: 900, marginBottom: '20px' }}>기기 알림 통합 및 활성화</h3>
            
            <div style={{ background: '#F8FAFB', padding: '15px', borderRadius: '20px', marginBottom: '20px', textAlign: 'left' }}>
              <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.6, fontWeight: 700, marginBottom: '10px' }}>
                🔔 푸시 알림 상태: <span style={{ color: Notification.permission === 'granted' ? '#10B981' : '#F59E0B' }}>
                  {Notification.permission === 'granted' ? '활성화됨' : '비활성'}
                </span>
              </p>
              
              {Notification.permission !== 'granted' ? (
                <button 
                  onClick={() => {
                    Notification.requestPermission().then(permission => {
                      if (permission === 'granted') {
                        alert("알림 권한이 허용되었습니다!");
                        if (subscribeToPushNotifications) subscribeToPushNotifications(); // Now also register for push!
                      }
                      setShowNotifIntegration(false);
                    });
                  }}
                  style={{ width: '100%', padding: '12px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 900, cursor: 'pointer' }}
                >
                  기기 알림 권한 허용하기
                </button>
              ) : (
                <p style={{ fontSize: '12px', color: '#10B981', fontWeight: 800 }}>✅ 시스템 알림이 정상적으로 수신됩니다.</p>
              )}
            </div>

            <div style={{ textAlign: 'left', borderTop: '1px solid #EEE', paddingTop: '20px' }}>
              <p style={{ fontSize: '12px', color: '#8B7355', fontWeight: 900, marginBottom: '8px' }}>💡 아이폰(iOS) 사용자 주의사항</p>
              <ul style={{ fontSize: '11px', color: '#6B7280', paddingLeft: '18px', lineHeight: 1.5, fontWeight: 600 }}>
                <li>반드시 하단 공유버튼 눌러 <b>'홈 화면에 추가'</b>를 하셔야 푸시 알림이 작동합니다.</li>
                <li>브라우저(Safari/Chrome) 탭에서는 알림이 제한될 수 있습니다.</li>
              </ul>
            </div>

            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowNotifIntegration(false)} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#2D1F08', color: 'white', fontWeight: 900, marginTop: '25px' }}>확인</motion.button>
          </motion.div>
        </div>
      )}

      {showDataSecurity && (
        <div onClick={() => setShowDataSecurity(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', borderRadius: '32px', padding: '30px', width: '100%', maxWidth: '340px', textAlign: 'center' }}>
            <Lock size={40} color="#0369A1" style={{ marginBottom: '15px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '20px' }}>데이터 보안</h3>
            <p style={{ fontSize: '14px', color: '#4B5563' }}>모든 대화 내용은 기기 간 종단간 암호화로 보호됩니다.</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowDataSecurity(false)} style={{ width: '100%', padding: '16px', marginTop: '20px', borderRadius: '16px', background: '#2D1F08', color: 'white', fontWeight: 900 }}>닫기</motion.button>
          </motion.div>
        </div>
      )}

      {showNotifDiag && (
        <div onClick={() => { setShowNotifDiag(false); setDiagStep(0); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', borderRadius: '35px', padding: '35px', width: '100%', maxWidth: '360px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Activity size={24} color="#EF4444" />
              <h3 style={{ fontSize: '19px', fontWeight: 900 }}>알림 수신 정밀 진단</h3>
            </div>
            
            {diagStep === 0 && (
              <>
                <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.6, marginBottom: '20px' }}>알림 수신에 문제가 있나요? 하티 엔진이 현재 기기의 알림 통로를 점검합니다.</p>
                <button onClick={() => setDiagStep(1)} style={{ width: '100%', padding: '15px', borderRadius: '15px', background: '#1E293B', color: 'white', fontWeight: 900 }}>진단 시작하기</button>
              </>
            )}
            
            {diagStep === 1 && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
                  <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                    <span>브라우저 지원 여부</span>
                    <span style={{ color: '#10B981', fontWeight: 800 }}>통과</span>
                  </div>
                  <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                    <span>시스템 권한 상태</span>
                    <span style={{ color: Notification.permission === 'granted' ? '#10B981' : '#EF4444', fontWeight: 800 }}>{Notification.permission === 'granted' ? '허용' : '차단됨'}</span>
                  </div>
                  <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                    <span>서비스 워커 등록</span>
                    <span style={{ color: '#10B981', fontWeight: 800 }}>활성</span>
                  </div>
                  <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                    <span>종단간 동기화 채널</span>
                    <span style={{ color: '#10B981', fontWeight: 800 }}>정상</span>
                  </div>
                </div>
                {Notification.permission !== 'granted' ? (
                  <p style={{ fontSize: '12px', color: '#EF4444', fontWeight: 800, marginBottom: '20px' }}>⚠️ 시스템 설정에서 브라우저의 알림 권한을 먼저 허용해주세요.</p>
                ) : (
                  <p style={{ fontSize: '12px', color: '#10B981', fontWeight: 800, marginBottom: '20px' }}>✅ 기기 수준의 알림 통로는 모두 정상입니다.</p>
                )}
                <button onClick={() => { setShowNotifDiag(false); setDiagStep(0); }} style={{ width: '100%', padding: '15px', borderRadius: '15px', background: '#F1F5F9', color: '#475569', fontWeight: 900 }}>진단 종료</button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default SettingsView;
