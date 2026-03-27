import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// UI scrolling clearance and safety guards applied - 2026-03-27
import { 
  Heart, 
  ChevronDown, 
  ChevronLeft, 
  Bell, 
  User, 
  Lock,
  MessageCircle,
  Calendar,
  Info,
  Sparkles,
  ArrowRight,
  BookOpen,
  X,
  Zap
} from 'lucide-react';
import { CARD_DATA } from '../../data/dialogueCards';
import HattiCharacter from '../ui/HattiCharacter';
import SecretAnswerInteraction from '../game/SecretAnswerInteraction';

const HATTI_TODOS = [
  { id: 1, action: "말하기", text: "배우자에게 '오늘 하루도 정말 고생 많았어'라고 눈을 맞추며 말해주세요." },
  { id: 2, action: "행동", text: "오늘 저녁 설거지나 청소 중 하나를 배우자 몰래 미리 끝내두세요." },
  { id: 3, action: "스킨십", text: "배우자가 퇴근하고 돌아오면 5초간 따뜻하게 안아주세요." },
  { id: 4, action: "선물", text: "퇴근길에 배우자가 좋아하는 편의점 간식을 하나 사서 건네보세요." },
  { id: 5, action: "경청", text: "오늘 배우자의 이야기를 10분 동안 조언 없이 온전히 들어주세요." }
];

const HomeView = ({ 
  user, userRole, coupleCode, 
  mySignal, setMySignal, 
  spouseSignal, partnerPrayers, 
  onIntimacyClick, onNav, 
  schedules, husbandInfo, wifeInfo, 
  onUpdateMemo, activeTab, 
  spouseSecretAnswer, setSpouseSecretAnswer, 
  mySecretAnswer, setMySecretAnswer, 
  isMySecretAnswered, setIsMySecretAnswered, 
  isRevealed, setIsRevealed, 
  notifPermission, mainChannel,
  supabase
}) => {
  const myInfo = (userRole?.toLowerCase() === 'husband' ? husbandInfo : wifeInfo) || {};
  const spouseInfo = (userRole?.toLowerCase() === 'husband' ? wifeInfo : husbandInfo) || {};

  const [showGuide, setShowGuide] = useState(false);
  const [memoInput, setMemoInput] = useState(myInfo?.todayMemo || "");
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [isPrayerExpanded, setIsPrayerExpanded] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showNotifBanner, setShowNotifBanner] = useState(true);

  useEffect(() => {
    // 알림 권한이 'default'일 때(물어보지 않은 상태) 진입 시 모달 띄우기
    if (notifPermission === 'default') {
      const timer = setTimeout(() => setShowNotifModal(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [notifPermission]);

  useEffect(() => {
    if (myInfo?.todayMemo) setMemoInput(myInfo.todayMemo);
  }, [myInfo]);
  
  // Pick a daily todo based on the date
  const dailyTodo = useMemo(() => {
    try {
      if (!HATTI_TODOS || HATTI_TODOS.length === 0) return null;
      const today = new Date();
      const seed = today.getFullYear() + (today.getMonth() + 1) * 100 + today.getDate();
      return HATTI_TODOS[seed % HATTI_TODOS.length];
    } catch (e) { return null; }
  }, []);

  const todaySchedules = useMemo(() => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      return (schedules || []).filter(s => s && s.date === todayStr);
    } catch (e) { return []; }
  }, [schedules]);
  
  const [isAdviceOpen, setIsAdviceOpen] = useState(false);

  const todaySecretQuestion = useMemo(() => {
    try {
      const now = new Date();
      const seed = (now.getFullYear() * 10000) + ((now.getMonth() + 1) * 100) + now.getDate();
      const secretQs = (CARD_DATA || []).filter(q => q && q.category === '시크릿');
      if (!secretQs || secretQs.length === 0) return "서로에게 궁금한 비밀을 물어보세요.";
      return secretQs[seed % secretQs.length].question;
    } catch (e) { return "소중한 대화를 시작해보세요."; }
  }, []);

  const handleRequestNotif = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        setShowNotifModal(false);
        if (permission === 'granted') {
          window.location.reload();
        }
      });
    } else {
      setShowNotifModal(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex flex-col w-full pb-32"
      style={{ willChange: 'opacity', paddingBottom: '140px', overflowY: 'visible' }}
    >
      {/* 🔔 Notification Request Modal */}
      <AnimatePresence>
        {showNotifModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: 'white', borderRadius: '32px', width: '100%', maxWidth: '340px', padding: '40px 25px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}
            >
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(138, 96, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Bell size={40} color="#8A60FF" />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#2D1F08', marginBottom: '12px' }}>알림을 켜주시겠어요?</h3>
              <p style={{ fontSize: '15px', color: '#8B7355', fontWeight: 600, lineHeight: 1.6, wordBreak: 'keep-all', marginBottom: '30px' }}>
                배우자가 보내는 소중한 마음 신호와<br/>
                오늘의 대화 질문을 놓치지 않도록 도와드릴게요! 💌
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                <button 
                  onClick={handleRequestNotif}
                  style={{ width: '100%', padding: '18px', borderRadius: '20px', background: '#8A60FF', color: 'white', fontWeight: 900, fontSize: '16px', border: 'none' }}
                >
                  지금 알림 받기
                </button>
                <button 
                  onClick={() => setShowNotifModal(false)}
                  style={{ width: '100%', padding: '15px', borderRadius: '20px', background: 'none', color: '#B08D3E', fontWeight: 800, fontSize: '14px', border: 'none' }}
                >
                  나중에 할게요
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="brand-section" style={{ paddingTop: '25px', alignItems: 'flex-start', paddingLeft: '30px', gap: '2px' }}>
        <img 
          src="/logo_main.png" 
          alt="Heart Logo" 
          className="brand-logo" 
          style={{ width: '180px', height: 'auto', marginTop: '-25px', marginBottom: '-25px', marginLeft: '-25px', display: 'block', transform: 'scale(1.1)' }}
          onError={(e) => { e.target.style.display = 'none'; }} 
        />
        <p style={{ fontSize: '13px', color: '#B08D3E', fontWeight: 900, letterSpacing: '2px', marginBottom: '0px' }}>부부의 마음을 이어주는</p>
        <h1 className="brand-text" style={{ fontSize: '32px', letterSpacing: '6px', marginTop: '2px' }}>HEART SYNC</h1>
        <p className="brand-sub">MORE DEEP, MORE CLOSE</p>
      </header>


      {/* 🔔 Notification Prompt Banner */}
      {notifPermission !== 'granted' && showNotifBanner && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            margin: '0 20px 20px', padding: '15px 20px', 
            background: 'linear-gradient(135deg, #2D1F08, #4D3A1A)', 
            borderRadius: '18px', display: 'flex', alignItems: 'center', 
            justifyContent: 'space-between', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            position: 'relative'
          }}
        >
          <button 
            onClick={(e) => { e.stopPropagation(); setShowNotifBanner(false); }}
            style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#D4AF37', border: '2px solid #2D1F08', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
          >
            <X size={14} color="white" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={18} color="#D4AF37" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: 900, color: 'white' }}>알림이 꺼져있어요</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>중요한 소식을 놓치지 않으려면 알림을 켜주세요.</span>
            </div>
          </div>
          <button 
            onClick={() => {
              if ("Notification" in window) {
                Notification.requestPermission().then(permission => {
                   window.location.reload(); // Re-trigger App level setup
                });
              }
            }}
            style={{ padding: '8px 14px', borderRadius: '10px', background: '#D4AF37', color: 'white', border: 'none', fontSize: '12px', fontWeight: 900 }}
          >
            켜기
          </button>
        </motion.div>
      )}

      {/* Signal Status Section */}
      <div className="flex flex-col gap-4 mb-4" style={{ marginTop: '0px' }}>
        {/* 1. 배우자의 신호 (Monitoring Zone) */}
        <div 
          onClick={() => setIsAdviceOpen(!isAdviceOpen)}
          style={{ 
            padding: '20px', 
            background: 'rgba(255, 255, 255, 0.4)', 
            borderRadius: '22px',
            border: '2px solid #D4AF37',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 15px 40px rgba(184, 134, 11, 0.15), inset 0 0 10px rgba(255, 255, 255, 0.5)'
          }}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div style={{ padding: '10px', background: 'rgba(138, 96, 255, 0.1)', borderRadius: '14px' }}>
                <Heart size={22} color="#8A60FF" fill={spouseSignal !== 'none' ? "#8A60FF" : "none"} />
              </div>
              <div className="flex flex-col">
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#8A60FF', letterSpacing: '1px', marginBottom: '2px' }}>배우자의 신호</span>
                <span style={{ fontSize: '17px', fontWeight: 900, color: '#2D1F08', whiteSpace: 'nowrap' }}>
                  {spouseSignal === 'red' ? '휴식이 필요해요' : spouseSignal === 'amber' ? '대화가 필요해요' : '기분 최고예요!'}
                </span>
                {spouseInfo?.moodSignal && (
                   <span style={{ fontSize: '12px', color: '#B08D3E', fontWeight: 700, marginTop: '4px' }}>
                     💌 {spouseInfo.moodSignal}
                   </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`dot dot-${spouseSignal}`} style={{ 
                width: '18px', height: '18px', 
                backgroundColor: spouseSignal === 'red' ? '#FF4D6D' : spouseSignal === 'amber' ? '#FFD166' : '#06D6A0',
                boxShadow: `0 0 10px ${spouseSignal === 'red' ? '#FF4D6D' : spouseSignal === 'amber' ? '#FFD166' : '#06D6A0'}`
              }} />
              <div style={{ transform: isAdviceOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s', display: 'flex' }}>
                <ChevronDown size={22} color="#8A60FF" />
              </div>
            </div>
          </div>

          {/* 💡 Hatti's Advice Bubble (Inside Partner Section) */}
          <AnimatePresence>
            {isAdviceOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  marginTop: '5px',
                  background: 'white',
                  padding: '18px',
                  borderRadius: '18px',
                  border: '1px solid #8A60FF',
                  boxShadow: '0 4px 15px rgba(138, 96, 255, 0.1)'
                }}>
                  <div className="flex items-center gap-3 mb-2">
                    {activeTab !== 'counseling' && (
                       <HattiCharacter size={40} state="floating" />
                    )}
                     <span style={{ fontSize: '13px', fontWeight: 900, color: '#8A60FF' }}>하티의 대응 가이드</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#2D1F08', lineHeight: 1.6, wordBreak: 'keep-all', paddingLeft: '45px' }}>
                    {spouseSignal === 'red' && "배우자분이 지금 많이 지쳐 계신 것 같아요. 오늘은 집안일을 조금 나눠서 하거나, 따뜻한 물로 족욕을 도와주며 정적을 지켜주는 건 어떨까요?"}
                    {spouseSignal === 'amber' && "지금 배우자분은 당신과의 깊은 소통을 원하고 있어요. 스마트폰을 잠시 내려놓고 눈을 맞추며 오늘 하루는 어땠는지 먼저 물어봐 주세요."}
                    {spouseSignal === 'green' && "상대방의 기분이 아주 좋습니다! 지금이 바로 평소 하고 싶었던 부탁이나 밝은 미래 계획을 이야기하기 가장 좋은 타이밍이에요."}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. 나의 신호 (Interactive Zone) */}
        <div style={{ 
          padding: '20px', 
          background: 'rgba(255, 255, 255, 0.65)', 
          borderRadius: '22px',
          border: '2px solid #D4AF37',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 15px 40px rgba(184, 134, 11, 0.15), inset 0 0 10px rgba(255, 255, 255, 0.5)'
        }}>
          <div className="flex flex-col gap-5 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div style={{ padding: '8px', background: 'rgba(245, 208, 96, 0.1)', borderRadius: '12px' }}>
                  <User size={20} color="#D4AF37" />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#B08D3E', letterSpacing: '1px' }}>나의 신호 보내기</span>
              </div>
              <div className={`dot dot-${mySignal}`} style={{ width: '12px', height: '12px', opacity: 0.8 }} />
            </div>

            <div className="traffic-light-grid" style={{ justifyContent: 'space-around', padding: '5px 0' }}>
              <div className="flex flex-col items-center gap-3">
                <div className={`light-btn red ${mySignal === 'red' ? 'active' : ''}`} onClick={() => setMySignal('red')} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: mySignal === 'red' ? '#FF4D6D' : '#8B7355' }}>휴식 필요</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className={`light-btn amber ${mySignal === 'amber' ? 'active' : ''}`} onClick={() => setMySignal('amber')} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: mySignal === 'amber' ? '#D4AF37' : '#8B7355' }}>대화 필요</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className={`light-btn green ${mySignal === 'green' ? 'active' : ''}`} onClick={() => setMySignal('green')} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: mySignal === 'green' ? '#22C55E' : '#8B7355' }}>안정/최상</span>
              </div>
            </div>

            {/* My Status Description Box */}
            <div style={{ 
              background: 'rgba(255,255,255,0.6)', 
              padding: '14px 18px', 
              borderRadius: '16px',
              border: '1px solid rgba(245, 208, 96, 0.2)',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '13px', color: '#4D3A1A', fontWeight: 700, lineHeight: 1.5 }}>
                {mySignal === 'red' && "🔴 지쳐있어요. 조용한 지지와 휴식이 힘이 됩니다."}
                {mySignal === 'amber' && "🟡 대화하고 싶어요. 당신의 따뜻한 공감이 필요해요."}
                {mySignal === 'green' && "🟢 기분이 아주 좋아요! 즐겁게 소통할 준비가 되었어요."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🚦 Central Secret Question Box (3D Deep Gold Style) */}
      <div className="card-stack" style={{ margin: '20px 0 35px' }}>
        <div className="card-layer card-layer-1" />
        <div className="card-layer card-layer-2" />
        
        <div className="glass-card-wrap">
          <div className="glass-card">
            <AnimatePresence mode="wait">
              {!isRevealed ? (
                <motion.div 
                   key="locked"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                  style={{ paddingTop: '30px', cursor: 'pointer' }} 
                  onClick={() => {
                    setIsRevealed(true);
                    // 🔔 Use Master Channel for reliability
                    if (mainChannel) {
                      mainChannel.send({
                        type: 'broadcast',
                        event: 'secret-revealed',
                        payload: { sender: userRole, ts: Date.now() }
                      });
                    }
                  }}
                >
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 900, 
                    color: '#8B6500', 
                    letterSpacing: '2.5px',
                    marginBottom: '8px',
                    textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                  }}>SECRET CARD</span>
                  
                  <h2 className="card-question" style={{ 
                    fontSize: '22px', 
                    textAlign: 'center', 
                    padding: '0 10px', 
                    color: '#2D1F08',
                    fontWeight: 900,
                    letterSpacing: '-0.5px',
                    textShadow: '0 1px 1px rgba(255,255,255,0.5)'
                  }}>
                    비밀 질문 도착!
                  </h2>
                  
                  <div className="secret-lock-icon" style={{ 
                    marginTop: '12px',
                    background: 'rgba(255,255,255,0.8)',
                    padding: '10px',
                    borderRadius: '50%',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                  }}>
                    <Lock size={22} color="#D4AF37" strokeWidth={2.5} />
                  </div>
                  
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#6F4E00', 
                    fontWeight: 900, 
                    marginTop: '15px',
                    background: 'rgba(255,255,255,0.95)',
                    padding: '8px 20px',
                    borderRadius: '100px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(139, 101, 0, 0.1)'
                  }}>질문을 확인하려면 터치하세요</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="revealed"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <div style={{ marginBottom: '5px', opacity: 0.6 }}>
                    <Sparkles size={16} color="#D4AF37" />
                  </div>
                  
                  <SecretAnswerInteraction 
                    userRole={userRole}
                    coupleCode={coupleCode}
                    questionText={todaySecretQuestion}
                    supabase={supabase}
                    mainChannel={mainChannel}
                    spouseAnswer={spouseSecretAnswer}
                    setSpouseAnswer={setSpouseSecretAnswer}
                    myAnswer={mySecretAnswer}
                    setMyAnswer={setMySecretAnswer}
                    answered={isMySecretAnswered}
                    setAnswered={setIsMySecretAnswered}
                  />
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsRevealed(false);
                    }}
                    style={{
                      marginTop: '30px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(139, 101, 0, 0.2)',
                      padding: '8px 18px',
                      borderRadius: '100px',
                      color: '#6F4E00',
                      fontSize: '13px',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                  >
                    <ChevronLeft size={14} strokeWidth={3} /> 카드 뒤집기
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 💝 Hatti's One-Day Suggestion (Premium Glass Gold Style) */}
      {dailyTodo && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            margin: '40px 0',
            padding: '24px',
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '26px',
            border: '2px solid rgba(212, 175, 55, 0.25)',
            boxShadow: '0 15px 35px rgba(212, 175, 55, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
             <Sparkles size={100} color="#D4AF37" />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '18px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #D4AF37, #B08D3E)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(212, 175, 55, 0.3)' }}>
              {dailyTodo.action === '말하기' && <MessageCircle size={22} color="white" />}
              {dailyTodo.action === '행동' && <Zap size={22} color="white" />}
              {dailyTodo.action === '스킨십' && <Heart size={22} color="white" fill="white" />}
              {dailyTodo.action === '선물' && <Sparkles size={22} color="white" />}
              {dailyTodo.action === '경청' && <BookOpen size={22} color="white" />}
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#B08D3E', letterSpacing: '2px', textTransform: 'uppercase' }}>Hatti's One-Day</span>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08' }}>오늘의 {dailyTodo.action} 제안</h3>
            </div>
          </div>

          <div style={{ background: 'white', padding: '18px', borderRadius: '18px', border: '1px solid rgba(212, 175, 55, 0.15)', position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '15px', color: '#4D3A1A', fontWeight: 700, lineHeight: 1.6, wordBreak: 'keep-all' }}>
              “{dailyTodo.text}”
            </p>
          </div>

          {activeTab !== 'counseling' && (
            <div style={{ position: 'absolute', bottom: '-5px', right: '15px', opacity: 0.8 }}>
               <HattiCharacter size={55} state="floating" />
            </div>
          )}
        </motion.div>
      )}

      {/* 3. 오늘 서로에게 남기는 메모 (꼭 기억해줘요) */}
      <div style={{ 
        padding: '22px', 
        background: 'linear-gradient(135deg, #FFF8E1 0%, #FFFDE7 100%)', 
        borderRadius: '24px',
        border: '1.5px solid #FBC02D',
        boxShadow: '0 8px 25px rgba(251, 192, 45, 0.12)',
        marginBottom: '20px'
      }}>
         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <div style={{ padding: '6px', background: '#FBC02D20', borderRadius: '8px' }}>
                 <Info size={16} color="#FBC02D" />
               </div>
               <span style={{ fontSize: '12px', fontWeight: 900, color: '#D4AF37' }}>오늘 꼭 기억해줘요 (한줄 메모)</span>
            </div>
            {!isEditingMemo && (
              <button 
                onClick={() => setIsEditingMemo(true)}
                style={{ background: 'none', border: 'none', color: '#D4AF37', fontSize: '11px', fontWeight: 800, textDecoration: 'underline' }}
              >
                메모 수정
              </button>
            )}
         </div>

         <div style={{ background: 'white', padding: '15px', borderRadius: '15px', border: '1px solid rgba(251, 192, 45, 0.15)' }}>
            {!isEditingMemo ? (
               <p style={{ fontSize: '15px', color: '#4D3A1A', fontWeight: 700, lineHeight: 1.5 }}>
                 {myInfo?.todayMemo || (userRole === 'husband' ? "아내에게 남길 메모를 입력해보세요." : "남편에게 남길 메모를 입력해보세요.")}
               </p>
            ) : (
               <div style={{ display: 'flex', gap: '8px' }}>
                 <input 
                   autoFocus
                   value={memoInput}
                   onChange={(e) => setMemoInput(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && onUpdateMemo(undefined, { todayMemo: memoInput }).then(() => setIsEditingMemo(false))}
                   placeholder="예: 오늘 저녁 8시에 치킨 시켜요!"
                   style={{ flex: 1, border: 'none', background: '#F9FAFB', padding: '10px 15px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, outline: 'none' }}
                 />
                 <button 
                   onClick={() => onUpdateMemo(undefined, { todayMemo: memoInput }).then(() => setIsEditingMemo(false))}
                   style={{ padding: '10px 15px', background: '#2D1F08', color: 'white', borderRadius: '10px', border: 'none', fontSize: '12px', fontWeight: 800 }}
                 >
                   저장
                 </button>
               </div>
            )}
         </div>

         <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(251, 192, 45, 0.1)' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#B08D3E', display: 'block', marginBottom: '8px' }}>배우자의 한줄 메모</span>
            <div style={{ background: 'rgba(251, 192, 45, 0.05)', padding: '12px 15px', borderRadius: '12px' }}>
               <p style={{ fontSize: '14px', color: '#2D1F08', fontWeight: 600 }}>
                 {spouseInfo?.todayMemo || "아직 작성된 메모가 없습니다."}
               </p>
            </div>
         </div>
      </div>
      
      {/* Intimacy Hub Quick Access (Hub of Hubs) */}
      <div 
        onClick={onIntimacyClick}
        style={{ 
          padding: '24px', 
          background: 'linear-gradient(135deg, #1E293B, #334155)', 
          borderRadius: '26px',
          boxShadow: '0 15px 35px rgba(30, 41, 59, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '15px',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
          <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.1)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle size={28} color="#D4AF37" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#D4AF37', fontSize: '11px', fontWeight: 900, letterSpacing: '1px', marginBottom: '3px' }}>둘만의 대화 공간</span>
            <span style={{ color: 'white', fontSize: '18px', fontWeight: 900 }}>소통의 화원 입장하기</span>
          </div>
        </div>
        <ChevronLeft size={24} color="#D4AF37" style={{ transform: 'rotate(180deg)', opacity: 0.6 }} />
      </div>

      {/* 🌲 New: Small Forest / Heart Prayer Quick Access */}
      {/* 🌲 Interactive Prayer Sharing Accordion */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #FF9966, #FF5E62)', 
          borderRadius: '26px',
          boxShadow: '0 15px 35px rgba(255, 94, 98, 0.25)',
          marginBottom: '20px',
          overflow: 'hidden',
          transition: '0.3s'
        }}
      >
        <div 
          onClick={() => setIsPrayerExpanded(!isPrayerExpanded)}
          style={{ 
            padding: '24px', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
            <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={28} color="white" fill="white" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontWeight: 900, letterSpacing: '1px', marginBottom: '3px' }}>배우자에게 당신의</span>
              <span style={{ color: 'white', fontSize: '18px', fontWeight: 900 }}>기도나눔</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {partnerPrayers && partnerPrayers.length > 0 && !isPrayerExpanded && (
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={12} color="white" />
                <span style={{ color: 'white', fontSize: '11px', fontWeight: 800 }}>기도 확인</span>
              </div>
            )}
            <motion.div animate={{ rotate: isPrayerExpanded ? 90 : 180 }}>
              <ChevronLeft size={24} color="white" style={{ opacity: 0.6 }} />
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {isPrayerExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '0 24px 24px 24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.15)', padding: '20px', borderRadius: '20px', marginBottom: '15px' }}>
                  {partnerPrayers && partnerPrayers.length > 0 ? (
                    <>
                      <p style={{ color: 'white', fontSize: '15px', fontWeight: 700, lineHeight: 1.6, marginBottom: '10px' }}>
                        "{partnerPrayers[0].text}"
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 700 }}>{partnerPrayers[0].date}</span>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: 'white', fontSize: '14px', fontWeight: 700, textAlign: 'center' }}>
                      아직 배우자가 남긴 기도가 없습니다.
                    </p>
                  )}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onNav('heartPrayer'); }}
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    background: 'white', 
                    color: '#FF5E62', 
                    borderRadius: '16px', 
                    border: 'none', 
                    fontWeight: 900, 
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  나도 기도 남기러 가기 <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ✝️ Family Worship Quick Access */}
      <div 
        onClick={() => onNav('worship')}
        style={{ 
          padding: '24px', 
          background: 'linear-gradient(135deg, #FDFCF0, #F5F3E6)', 
          borderRadius: '26px',
          boxShadow: '0 10px 30px rgba(212, 175, 55, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          border: '1.5px solid rgba(212, 175, 55, 0.2)',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
          <div style={{ width: '56px', height: '56px', background: 'white', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <BookOpen size={28} color="#D4AF37" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#8B7355', fontSize: '11px', fontWeight: 900, letterSpacing: '1px', marginBottom: '3px' }}>오늘 우리 가정에 주시는</span>
            <span style={{ color: '#2D1F08', fontSize: '18px', fontWeight: 900 }}>가정예배 시작하기</span>
          </div>
        </div>
        <div style={{ background: '#D4AF37', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)' }}>
          <ArrowRight size={18} color="white" />
        </div>
      </div>

      {/* Anniversary & Schedule Quick Preview */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
        <div 
           onClick={() => onNav('settings')}
           style={{ flex: 1, padding: '20px', background: 'white', borderRadius: '24px', boxShadow: '0 8px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(245, 208, 96, 0.1)', padding: '6px', borderRadius: '8px' }}>
              <Calendar size={16} color="#D4AF37" />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#B08D3E' }}>D-DAY</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#2D1F08' }}>
            D+{Math.floor((new Date() - new Date(myInfo?.marriageDate || '2020-05-23')) / 86400000)}
          </div>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>우리가 사랑한 시간</span>
        </div>

        <div 
          onClick={() => onNav('calendar')}
          style={{ flex: 1.2, padding: '20px', background: 'white', borderRadius: '24px', boxShadow: '0 8px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', cursor: 'pointer' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '6px', borderRadius: '8px' }}>
                 <Calendar size={16} color="#3B82F6" />
               </div>
               <span style={{ fontSize: '13px', fontWeight: 900, color: '#1E3A8A' }}>오늘의 일정</span>
            </div>
            <ChevronLeft size={16} color="#9CA3AF" style={{ transform: 'rotate(180deg)' }} />
          </div>

          {todaySchedules.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {todaySchedules.slice(0, 2).map((s, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                  <div style={{ width: '4px', height: '16px', background: '#3B82F6', borderRadius: '4px' }} />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#374151' }}>{s.title}</span>
                  <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600 }}>{s.time || '종일'}</span>
                </div>
              ))}
              {todaySchedules.length > 2 && (
                <span style={{ fontSize: '12px', color: '#3B82F6', fontWeight: 800, paddingLeft: '16px' }}>+ {todaySchedules.length - 2}개의 가려진 일정</span>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <p style={{ fontSize: '14px', color: '#9CA3AF', fontWeight: 600 }}>오늘 등록된 부부의 일정이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(HomeView);
