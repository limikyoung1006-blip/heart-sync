import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Home, BookOpen, Settings,
  Coffee, MessageCircle, MessageSquare,
  Sparkles, Bell, Menu, ChevronLeft, ChevronDown,
  Send, Lock, Zap, Smile, Moon, Wine,
  BarChart3, User, RefreshCw,
  Music, Play, SkipBack, SkipForward,
  Calendar, CheckCircle2, ListTodo, Plus, Trash2,
  AlertCircle, Smartphone, Users, Palette, Info, ArrowRight,
  ClipboardList, Fingerprint, Share2
} from 'lucide-react';
import questions from '../questions.json';
import { supabase } from './supabase';

// Initial configuration removed - now managed via state and onboarding
const NavItem = ({ active, onClick, icon, label }) => (
  <div onClick={onClick} className={`nav-item ${active ? 'active' : ''}`}>
    <div className="nav-icon-wrapper">
      {icon}
    </div>
    <span>{label}</span>
  </div>
);

const MenuBtn = ({ icon, title, desc, onClick }) => (
  <button className="menu-btn" onClick={onClick}>
    <span className="menu-icon">{icon}</span>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
       <span>{title}</span>
       <small>{desc}</small>
    </div>
  </button>
);

const SignalOpt = ({ title, desc }) => (
  <button className="signal-opt">
    <strong>{title}</strong>
    <span>{desc}</span>
  </button>
);

const SignalOptV2 = ({ title, desc }) => (
  <button style={{
    background: 'rgba(255,255,255,0.9)',
    padding: '16px',
    borderRadius: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
    border: '1px solid rgba(0,0,0,0.03)',
    cursor: 'pointer'
  }}>
    <strong style={{ color: '#800F2F', fontSize: '15px', fontWeight: 800 }}>{title}</strong>
    <span style={{ color: '#A4133C', fontSize: '12px', fontWeight: 600, opacity: 0.7 }}>{desc}</span>
  </button>
);

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

const SecretAnswerInteraction = ({ userRole, coupleCode, questionText }) => {
  const [myAnswer, setMyAnswer] = useState("");
  const [spouseAnswer, setSpouseAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  
  useEffect(() => {
    // 1. Initial Fetch
    const fetchAnswers = async () => {
      const { data } = await supabase
        .from('secret_answers')
        .select('*')
        .eq('couple_id', coupleCode)
        .eq('question_text', questionText);
      
      if (data) {
        const myRow = data.find(r => r.user_role === userRole);
        const spouseRow = data.find(r => r.user_role !== userRole);
        if (myRow) {
          setMyAnswer(myRow.answer);
          setAnswered(true);
        }
        if (spouseRow) setSpouseAnswer(spouseRow.answer);
      }
    };
    fetchAnswers();

    // 2. Real-time Subscription
    const channel = supabase
      .channel('realtime-secret-answers')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'secret_answers',
        filter: `couple_id=eq.${coupleCode}`
      }, payload => {
        if (payload.new.question_text === questionText) {
          if (payload.new.user_role === userRole) {
            setMyAnswer(payload.new.answer);
            setAnswered(true);
          } else {
            setSpouseAnswer(payload.new.answer);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole, coupleCode, questionText]);

  const handleSend = async () => {
    if (!myAnswer) return;
    await supabase.from('secret_answers').insert({
      couple_id: coupleCode,
      question_text: questionText,
      user_role: userRole,
      answer: myAnswer,
      created_at: new Date().toISOString()
    });
    setAnswered(true);
  };

  // 배우자 답변 대기 중인 경우
  if (answered && !spouseAnswer) {
    return (
      <div className="flex flex-col gap-4 w-full" style={{ marginTop: '15px' }}>
        <div className="prayer-bubble" style={{ background: 'rgba(255,255,255,0.95)', padding: '15px', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '14px', color: '#800F2F', fontWeight: 900, marginBottom: '6px', textAlign: 'left' }}>나의 답변</p>
          <p style={{ fontSize: '16px', color: '#2D1F08', textAlign: 'left', fontWeight: 500 }}>{myAnswer}</p>
        </div>
        <div className="flex flex-col items-center gap-3" style={{ 
          marginTop: '15px', 
          padding: '24px 20px', 
          background: 'rgba(255, 255, 255, 0.75)', 
          backdropFilter: 'blur(10px)',
          borderRadius: '24px', 
          border: '1.5px dashed #D4AF37',
          boxShadow: '0 4px 20px rgba(212, 175, 55, 0.15)'
        }}>
          <RefreshCw className="animate-spin" size={28} color="#D4AF37" />
          <p style={{ 
            fontSize: '15px', 
            color: '#2D1F08', 
            fontWeight: 900,
            textShadow: '0 1px 2px rgba(255,255,255,0.8)'
          }}>배우자의 답변을 기다리고 있어요...</p>
        </div>
      </div>
    );
  }

  // 둘 다 답변한 경우 (최종 공개)
  if (answered && spouseAnswer) {
    return (
      <div className="flex flex-col gap-4 w-full" style={{ marginTop: '10px' }}>
        <div className="prayer-bubble" style={{ background: 'rgba(255,255,255,0.98)', padding: '18px', borderRadius: '24px', border: '1px solid rgba(245, 208, 96, 0.3)', boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}>
          <p style={{ fontSize: '14px', color: '#8B6500', fontWeight: 900, marginBottom: '8px', textAlign: 'left' }}>나의 답변</p>
          <p style={{ fontSize: '17px', color: '#2D1F08', textAlign: 'left', fontWeight: 500 }}>{myAnswer}</p>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="prayer-bubble" 
          style={{ 
            background: 'rgba(255, 255, 255, 0.98)', 
            padding: '20px', 
            borderRadius: '24px', 
            border: '2px solid #FF4D6D',
            boxShadow: '0 10px 30px rgba(255, 77, 109, 0.2)'
          }}
        >
          <p style={{ fontSize: '14px', color: '#FF4D6D', fontWeight: 900, marginBottom: '8px', textAlign: 'left' }}>배우자의 답변</p>
          <p style={{ fontSize: '18px', color: '#2D1F08', textAlign: 'left', fontWeight: 700, lineHeight: 1.6, wordBreak: 'keep-all' }}>
            "{spouseAnswer}"
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full" style={{ marginTop: '10px' }}>
      <div style={{ position: 'relative', width: '100%' }}>
        <input 
          className="counseling-input" 
          style={{ width: '100%', paddingRight: '45px', fontSize: '14px', background: 'rgba(255,255,255,0.9)' }}
          placeholder="비밀 답변을 적어주세요..."
          value={myAnswer}
          onChange={(e) => setMyAnswer(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="counseling-send-btn" onClick={handleSend} style={{ width: '34px', height: '34px', right: '8px' }}>
          <Send size={16} />
        </button>
      </div>
       <p style={{ 
        fontSize: '11px', 
        color: '#4D3A1A', 
        marginTop: '2px', 
        fontWeight: 800,
        textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff' 
      }}>
        배우자가 답변을 해야 내용을 볼 수 있습니다
      </p>
    </div>
  );
};

/* 🏠 Home View Component */
// AI Hatti's Daily Instructions
const HATTI_TODOS = [
  { id: 1, action: "말하기", text: "배우자에게 '오늘 하루도 정말 고생 많았어'라고 눈을 맞추며 말해주세요." },
  { id: 2, action: "행동", text: "오늘 저녁 설거지나 청소 중 하나를 배우자 몰래 미리 끝내두세요." },
  { id: 3, action: "스킨십", text: "배우자가 퇴근하고 돌아오면 5초간 따뜻하게 안아주세요." },
  { id: 4, action: "선물", text: "퇴근길에 배우자가 좋아하는 편의점 간식을 하나 사서 건네보세요." },
  { id: 5, action: "경청", text: "오늘 배우자의 이야기를 10분 동안 조언 없이 온전히 들어주세요." },
  { id: 6, action: "행동", text: "배우자가 좋아하는 따뜻한 차나 커피를 직접 타서 건네주세요." },
  { id: 7, action: "말하기", text: "배우자의 장점을 하나 찾아서 구체적으로 칭찬해주는 메시지를 보내보세요." },
  { id: 8, action: "휴식", text: "오늘은 배우자가 온전히 쉴 수 있도록 육아나 집안일을 도맡아 해주세요." }
];

const HomeView = ({ userRole, coupleCode, mySignal, setMySignal, spouseSignal, partnerPrayers, onIntimacyClick, onNav, schedules }) => {
  const [showGuide, setShowGuide] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  
  // Pick a daily todo based on the date
  const dailyTodo = useMemo(() => {
    const today = new Date();
    const seed = today.getFullYear() + today.getMonth() + today.getDate();
    return HATTI_TODOS[seed % HATTI_TODOS.length];
  }, []);

  const todaySchedules = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return schedules.filter(s => s.date === todayStr);
  }, [schedules]);
  const [isAdviceOpen, setIsAdviceOpen] = useState(false);

  const todaySecretQuestion = useMemo(() => {
    // 날짜 기반 시드 생성 (매일 같은 질문)
    const dateStr = new Date().toISOString().slice(0, 10);
    const secretQs = (questions || []).filter(q => q.category === '시크릿');
    if (secretQs.length === 0) return "서로에게 궁금한 비밀을 물어보세요.";
    const seed = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return secretQs[seed % secretQs.length].question;
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col w-full">
      <header className="brand-section" style={{ paddingTop: '20px', alignItems: 'flex-start', paddingLeft: '30px' }}>
        <img 
          src="/logo_main.png" 
          alt="Heart Logo" 
          className="brand-logo" 
          style={{ width: '180px', height: 'auto', marginTop: '-20px', marginBottom: '-65px', marginLeft: '-20px', display: 'block', transform: 'scale(1.1)' }}
          onError={(e) => { e.target.style.display = 'none'; }} 
        />
        <p style={{ fontSize: '13px', color: '#B08D3E', fontWeight: 900, letterSpacing: '2px', marginBottom: '4px' }}>부부의 마음을 이어주는</p>
        <h1 className="brand-text" style={{ fontSize: '32px', letterSpacing: '6px' }}>HEART SYNC</h1>
        <p className="brand-sub">MORE DEEP, MORE CLOSE</p>
      </header>


      {/* Signal Status Section */}
      <div className="flex flex-col gap-4 mb-4" style={{ marginTop: '25px' }}>
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
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`dot dot-${spouseSignal}`} style={{ width: '18px', height: '18px', boxShadow: `0 0 10px var(--signal-${spouseSignal})` }} />
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
                  <div className="flex items-center gap-2 mb-2">
                     <Sparkles size={16} color="#8A60FF" />
                     <span style={{ fontSize: '12px', fontWeight: 800, color: '#8A60FF' }}>하티의 대응 가이드</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#2D1F08', lineHeight: 1.6, wordBreak: 'keep-all' }}>
                    {spouseSignal === 'red' && "배우자분이 지금 많이 지쳐 계신 것 같아요. 오늘은 집안일을 조금 나눠서 하거나, 따뜻한 물로 족욕을 도와주며 정적을 지켜주는 건 어떨까요?"}
                    {spouseSignal === 'amber' && "지금 배우자분은 당신과의 깊은 소통을 원하고 있어요. 스마트폰을 잠시 내려놓고 눈을 맞추며 오늘 하루는 어땠인지 먼저 물어봐 주세요."}
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
          <div className="glass-card" onClick={() => !isRevealed && setIsRevealed(true)}>
            
            <AnimatePresence mode="wait">
              {!isRevealed ? (
                <motion.div 
                   key="locked"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                  style={{ paddingTop: '30px' }} // 위쪽으로 배치하여 배경 그림 보호
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
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(10px)',
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
                  className="w-full flex flex-col items-center"
                >
                  <h2 className="card-question" style={{ 
                    fontSize: '19px', 
                    marginBottom: '20px', 
                    marginTop: '10px',
                    textAlign: 'center',
                    wordBreak: 'keep-all',
                    lineHeight: 1.5,
                    padding: '0 15px'
                  }}>
                    {todaySecretQuestion}
                  </h2>
                  
                  <SecretAnswerInteraction 
                    userRole={userRole}
                    coupleCode={coupleCode}
                    questionText={todaySecretQuestion}
                  />
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsRevealed(false);
                    }}
                    style={{
                      marginTop: '30px',
                      background: 'rgba(255, 255, 255, 0.65)',
                      backdropFilter: 'blur(8px)',
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

      {/* 🙏 Spouse's Prayer Summary Section (Synced with WorshipView) */}
      <div className="prayer-summary-card" style={{ marginBottom: '25px' }}>
        <div className="prayer-header" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #FF4D6D, #FF8A9D)', 
            padding: '4px', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(255, 77, 109, 0.3)'
          }}>
            <Heart size={14} color="white" fill="white" /> 
          </div>
          <span style={{ fontSize: '14px', fontWeight: 900, color: '#5D4037', marginLeft: '10px', letterSpacing: '-0.3px' }}>배우자의 최신 기도</span>
        </div>
        <div 
          className="prayer-bubble-home" 
          onClick={() => onNav('worship')}
          style={{ 
            background: 'linear-gradient(135deg, rgba(255, 252, 240, 0.7), rgba(255, 241, 190, 0.4))', 
            backdropFilter: 'blur(12px)',
            padding: '20px', 
            borderRadius: '24px', 
            border: '1.5px solid rgba(212, 175, 55, 0.4)',
            boxShadow: '0 10px 30px rgba(212, 175, 55, 0.15), inset 0 0 15px rgba(255, 255, 255, 0.5)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle gold shimmer line */}
          <div style={{
            position: 'absolute',
            top: 0, left: '-100%',
            width: '50%', height: '100%',
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)',
            transform: 'skewX(-25deg)',
            animation: 'gold-shimmer-sweep 8s infinite'
          }} />

          {partnerPrayers.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p style={{ fontSize: '15px', color: '#2D1F08', fontWeight: 600, lineHeight: 1.6, wordBreak: 'keep-all' }}>
                 "{partnerPrayers[0].text}"
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                 <span style={{ fontSize: '11px', color: '#B08D3E', fontWeight: 800 }}>전체 내용 확인하기</span>
                 <ChevronLeft size={12} color="#B08D3E" style={{ transform: 'rotate(180deg)' }} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p style={{ fontSize: '13px', color: '#7D5A00', fontStyle: 'italic', marginBottom: '4px', lineHeight: 1.6 }}>
                "마음에 담긴 기도제목을 <br/>사랑하는 사람과 나눠봅시다."
              </p>
              <div style={{ height: '1px', background: 'linear-gradient(to right, rgba(212, 175, 55, 0.3), transparent)', margin: '4px 0' }} />
              <p style={{ fontSize: '12px', color: '#B08D3E', fontWeight: 800 }}>
                 아직 등록된 기도가 없어요. 먼저 남겨보실래요?
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. 오늘 배우자를 위해 할 일 (AI Hatti's Instructions) */}
      <div style={{ 
        marginBottom: '20px',
        background: '#FFFBEB',
        borderRadius: '24px',
        padding: '24px',
        border: '1.5px solid #FEF3C7',
        boxShadow: '0 4px 20px rgba(251, 191, 36, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ background: '#FDE68A', padding: '6px', borderRadius: '10px' }}>
            <ListTodo size={16} color="#B45309" />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 900, color: '#92400E' }}>오늘 배우자를 위해 할 일</span>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
          <div style={{ 
            background: 'white', 
            minWidth: '60px', 
            height: '60px', 
            borderRadius: '16px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
          }}>
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#B45309', marginBottom: '2px' }}>CATEGORY</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#1F2937' }}>{dailyTodo.action}</span>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '15px', color: '#4B5563', fontWeight: 700, lineHeight: 1.6, marginBottom: '8px' }}>
              {dailyTodo.text}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} color="#10B981" />
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#059669' }}>AI 하티의 추천 미션</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. 오늘의 일정 (Calendar Summary) */}
      <div 
        onClick={() => onNav('calendar')}
        style={{ 
          marginBottom: '30px',
          background: 'white',
          borderRadius: '24px',
          padding: '24px',
          border: '1.5px solid #E5E7EB',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#DBEAFE', padding: '6px', borderRadius: '10px' }}>
              <Calendar size={16} color="#1D4ED8" />
            </div>
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#1E3A8A' }}>오늘의 일정</span>
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
    </motion.div>
  );
};



/* 💬 Chat View (AI Personalized Hatti Counseling) */
const ChatView = ({ userRole, husbandInfo, wifeInfo, onBack }) => {
  const [msg, setMsg] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const chatEndRef = React.useRef(null);

  // 상담가 하티 설정 (단일 페르소나)
  const hatti = useMemo(() => {
    const partnerInfo = userRole === 'husband' ? wifeInfo : husbandInfo;
    const partnerLabel = userRole === 'husband' ? '아내' : '남편';
    
    return {
      name: 'AI 하티',
      subtitle: '개혁주의 부부상담가',
      avatar: '/counselor_f.png', // 하티 캐릭터 이미지
      intro: `반갑습니다. 하나님의 언약 안에 있는 가정을 지키는 개혁주의 상담가 AI하티입니다. ${partnerLabel}분의 ${partnerInfo.mbti} 성향과 성경적 원리를 바탕으로, 두 분이 주님 안에서 한 몸 된 기쁨을 누리도록 따뜻한 위로와 솔루션을 드릴게요.`,
      partnerInfo,
      partnerLabel,
      color: '#8A60FF',
      borderColor: 'rgba(138, 96, 255, 0.25)'
    };
  }, [userRole, husbandInfo, wifeInfo]);

  const [chat, setChat] = useState([{ role: 'hatti', text: hatti.intro }]);

  // 역할 전환 시 대화 초기화 (동작 확인용)
  useEffect(() => {
    setChat([{ role: 'hatti', text: hatti.intro }]);
  }, [userRole, hatti.intro]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const send = () => {
    if (!msg.trim()) return;
    const newChat = [...chat, { role: 'user', text: msg }];
    setChat(newChat);
    setMsg("");

    setTimeout(() => {
      const p = hatti.partnerInfo;
      const pl = hatti.partnerLabel;
      let response = "";

      // 개혁주의 신앙 기반 따뜻한 맞춤 응답
      if (userRole === 'husband') {
        const responses = [
          `아내분의 ${p.mbti} 기질은 주님이 가정이라는 정원을 가꾸기 위해 주신 특별한 생동감입니다. 남편된 형제님이 그리스도께서 교회를 사랑하시듯 그 다름을 '언약적 사랑'으로 품으실 때, 그 안에서 꽃피는 주님의 은혜를 보게 되실 거예요. 많이 수고하셨습니다.`,
          `${p.mbti} 기질을 가진 아내분께는 형제님의 따뜻한 공감이 곧 하나님의 위로로 전달됩니다. 오늘 "당신 마음을 내가 알아"라는 한마디로 아내분의 마음을 보듬어 주세요. 주님께서 형제님을 용납하신 것처럼 말이죠.`,
          `아내분의 ${p.blood}형다운 세심함은 가정을 지키는 파수꾼과 같아요. 때론 그 예민함이 형제님을 지치게 할 수도 있지만, 그것이 가정을 향한 사랑의 표현임을 기억하며 성경적인 온유함으로 반응해 보세요. 형제님 안에 계신 성령께서 능력을 주실 겁니다.`
        ];
        response = responses[Math.floor(Math.random() * responses.length)];
      } else {
        const responses = [
          `남편분의 ${p.mbti} 기질은 하나님의 주권을 인정하며 묵묵히 가정의 문지기 역할을 수행하는 방식일 수 있어요. 가끔 표현이 서투를지라도, 주님이 남편분께 맡기신 권위와 책임을 존중하며 기도로 돕는 배필이 되어주세요. 주님의 평강이 자매님께 함께하길 기도합니다.`,
          `${p.mbti} 성향의 남편분은 결과보다 자매님의 신뢰 어린 격려 한마디에 큰 용기를 얻는 '청지기'입니다. "당신이 있어서 우리 가정이 든든해"라는 진심 어린 위로가 남편분을 더 성숙한 그리스도인으로 성장하게 할 거예요.`,
          `남편분의 ${p.blood}형다운 과묵함 이면에는 가족을 지키려는 깊은 고민이 담겨 있을 겁니다. 자매님의 따뜻한 미소와 인내가 그 고민의 짐을 덜어주는 보석 같은 은혜가 될 거예요. 오늘 먼저 손을 잡아주며 주님의 사랑을 전해보세요.`
        ];
        response = responses[Math.floor(Math.random() * responses.length)];
      }

      setChat([...newChat, { role: 'hatti', text: response }]);
    }, 1200);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full w-full" style={{ gap: '15px' }}>
      
      {/* ⬅️ Dedicated Top Back Button */}
      <div style={{ display: 'flex', padding: '0 5px' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0' }}>
          <ChevronLeft size={20} color="#8A60FF" strokeWidth={3} />
          <span style={{ fontSize: '14px', fontWeight: 900, color: '#8A60FF' }}>홈으로</span>
        </button>
      </div>

      {/* 🏛️ 하티 프로필 상단 (역할 선택 제거) */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        border: `1.5px solid ${hatti.borderColor}`,
        borderRadius: '24px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
      }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: `2.5px solid ${hatti.color}`, flexShrink: 0 }}>
          <img src={hatti.avatar} alt="Hatti" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=Hatti`; }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <p style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08', margin: 0 }}>{hatti.name}</p>
             <span style={{ fontSize: '11px', background: hatti.color, color: 'white', padding: '2px 8px', borderRadius: '100px', fontWeight: 700 }}>{hatti.subtitle}</span>
          </div>
          <p style={{ fontSize: '11px', color: '#886B5A', fontWeight: 600, margin: '4px 0 0' }}>
            대상: <span style={{ color: hatti.color }}>{userRole === 'husband' ? '남편' : '아내'}</span> | 
            배우자 정보: {hatti.partnerInfo.mbti} ({hatti.partnerInfo.blood}형)
          </p>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}>
           <Settings size={20} color={hatti.color} />
        </button>
      </div>

      {/* ⚙ Settings Panel (내부 설정 전용) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px', background: 'rgba(255,255,255,0.6)', borderRadius: '22px', border: '1px solid white' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <p style={{ fontSize: '11px', fontWeight: 900, color: '#2D1F08', margin: 0 }}>나의 신분 설정 (데모용)</p>
                <select value={userRole} onChange={e => setUserRole(e.target.value)} className="mini-input" style={{ appearance: 'none', padding: '8px' }}>
                  <option value="husband">👨 남편으로 상담</option>
                  <option value="wife">👩 아내로 상담</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <p style={{ fontSize: '11px', fontWeight: 900, color: '#2D1F08', margin: 0 }}>배우자 MBTI</p>
                <input 
                  className="mini-input" 
                  value={userRole === 'husband' ? wifeInfo.mbti : husbandInfo.mbti} 
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    if (userRole === 'husband') setWifeInfo({ ...wifeInfo, mbti: val });
                    else setHusbandInfo({ ...husbandInfo, mbti: val });
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💬 Chat Window */}
      <div className="chat-window" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 4px' }}>
        {chat.map((c, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: c.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: '10px' }}>
            {c.role === 'hatti' && (
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', border: `1.5px solid ${hatti.color}`, flexShrink: 0, marginTop: '4px' }}>
                <img src={hatti.avatar} alt="Hatti" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=Hatti`; }} />
              </div>
            )}
            <div style={{
              maxWidth: '75%',
              padding: '14px 18px',
              borderRadius: c.role === 'user' ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
              background: c.role === 'user' ? 'linear-gradient(135deg, #8A60FF, #AC8AFF)' : 'white',
              color: c.role === 'user' ? 'white' : '#2D1F08',
              fontSize: '15px',
              lineHeight: 1.6,
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              border: c.role === 'hatti' ? `1px solid ${hatti.borderColor}` : 'none',
              wordBreak: 'keep-all',
              fontWeight: 500
            }}>
              {c.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* ✍️ Input Area */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '5px 0' }}>
        <input
          value={msg}
          onChange={e => setMsg(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && send()}
          placeholder={`${hatti.partnerLabel}에 대해 하티에게 물어보세요...`}
          style={{
            flex: 1, padding: '15px 20px', borderRadius: '18px',
            border: '2px solid rgba(138, 96, 255, 0.1)',
            background: 'white', fontSize: '15px', outline: 'none', color: '#2D1F08'
          }}
        />
        <button onClick={send} style={{
          width: '54px', height: '54px', borderRadius: '16px', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #8A60FF, #AC8AFF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(138, 96, 255, 0.4)'
        }}>
          <Send size={22} color="white" />
        </button>
      </div>
    </motion.div>
  );
};

/* 🙏 Spouse's Prayer View (Mutual Shared Wall) */
const WORSHIP_SESSIONS = [
  {
    id: 1,
    title: "언약 계승: 믿음의 가정을 세우시는 하나님",
    praise: {
      title: "오 신실하신 주",
      lyrics: "오 신실하신 주 내 아버지여 늘 변치 않으시는 주님이여\n자비와 긍휼이 무궁하시니 어제나 오늘이나 영원토록"
    },
    word: {
      ref: "신명기 6:5-7",
      text: "너는 마음을 다하고 뜻을 다하고 힘을 다하여 네 하나님 여호와를 사랑하라 오늘 내가 네게 명하는 이 말씀을 너는 마음에 새기고 네 자녀에게 부지런히 가르치며 집에 앉았을 때에든지 길을 갈 때에든지 누워 있을 때에든지 일어날 때에든지 이 말씀을 강론할 것이며"
    },
    interpretation: "개혁주의 신앙에서 가정이란 단순한 혈연 공동체를 넘어 '언약의 통로'입니다. 하나님께서는 부모의 경건한 신앙이 자녀와 배우자에게 자연스럽게 흘러가기를 원하십니다. 우리의 모든 일상—앉을 때나 길을 갈 때—이 곧 예배의 자리가 되어야 합니다.",
    questions: [
      "오늘 우리 가정이 하나님의 통치를 인정하며 산 순간은 언제였나요?",
      "일상의 대화 속에 하나님의 말씀을 더 자연스럽게 녹여내기 위해 오늘 우리가 실천할 수 있는 한 가지는 무엇일까요?"
    ]
  },
  {
    id: 2,
    title: "그리스도의 통치와 부부의 언약적 연합",
    praise: {
      title: "그 사랑 (마커스)",
      lyrics: "아버지 사랑 내가 노래해 아버지 은혜 내가 노래해\n그 사랑 변함없으신 거짓 없으신 성실하신 그 사랑"
    },
    word: {
      ref: "에베소서 5:31-32",
      text: "그러므로 사람이 부모를 떠나 그의 아내와 합하여 그 둘이 한 육체가 될지니 이 비밀이 크도다 나는 그리스도와 교회에 대하여 말하노라"
    },
    interpretation: "부부의 결혼 관계는 그리스도와 교회의 연합을 보여주는 가장 거룩한 '상징'입니다. 배우자를 대하는 나의 모습이 곧 주님을 대하는 나의 영성을 반영합니다. 서로의 부족함은 정죄의 대상이 아니라, 하나님의 주권 아래 연합될 때 온전해지는 은혜의 영역입니다.",
    questions: [
      "배우자의 연약함을 보았을 때, 내 힘이 아닌 '그리스도의 사랑'을 의지했던 경험이 있나요?",
      "우리 부부가 그리스도의 통치를 받기 위해 오늘 밤 함께 내려놓아야 할 욕심이나 자존심은 무엇인가요?"
    ]
  }
];

const WorshipView = ({ userRole, coupleCode }) => {
  const [currentSession, setCurrentSession] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [praiseUrl, setPraiseUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [myPrayers, setMyPrayers] = useState(() => JSON.parse(localStorage.getItem('myPrayers') || '[]'));
  const [partnerPrayers, setPartnerPrayers] = useState([]);

  useEffect(() => {
    // 1. Initial Fetch
    const fetchPrayers = async () => {
      const { data } = await supabase
        .from('prayers')
        .select('*')
        .eq('couple_id', coupleCode)
        .order('created_at', { ascending: false });
      
      if (data) {
        setMyPrayers(data.filter(p => p.user_role === userRole));
        setPartnerPrayers(data.filter(p => p.user_role !== userRole));
      }
    };
    fetchPrayers();

    // 2. Real-time Subscription
    const channel = supabase
      .channel('realtime-prayers')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'prayers',
        filter: `couple_id=eq.${coupleCode}` 
      }, payload => {
        if (payload.new.user_role === userRole) {
          setMyPrayers(prev => [payload.new, ...prev]);
        } else {
          setPartnerPrayers(prev => [payload.new, ...prev]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole, coupleCode]);

  const extractYoutubeId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url?.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const randomSession = WORSHIP_SESSIONS[Math.floor(Math.random() * WORSHIP_SESSIONS.length)];
      setCurrentSession(randomSession);
      setIsGenerating(false);
    }, 1500);
  };

  const handleRecord = async () => {
    if (!topic) return;
    const { data, error } = await supabase.from('prayers').insert({
      couple_id: coupleCode,
      user_role: userRole,
      text: topic,
      created_at: new Date().toISOString()
    }).select();
    
    if (!error && data) {
      setTopic("");
    }
  };

  const allPrayers = useMemo(() => {
    const combined = [
      ...myPrayers.map(p => ({ ...p, type: 'mine' })),
      ...partnerPrayers.map(p => ({ ...p, type: 'spouse' }))
    ];
    return combined.sort((a, b) => b.id - a.id);
  }, [myPrayers, partnerPrayers]);

  const youtubeId = useMemo(() => extractYoutubeId(praiseUrl), [praiseUrl]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="worship-container">
      {/* 1. Praise (Premium Glass Cinema Style) */}
      <div className="worship-section-card" style={{ padding: '0', overflow: 'hidden', background: 'transparent', border: 'none', boxShadow: 'none' }}>
        <div style={{ padding: '30px 24px 20px' }}>
          <div className="worship-label-row">
            <div className="worship-icon-circle" style={{ background: '#FF4D6D', boxShadow: '0 4px 12px rgba(255, 77, 109, 0.3)' }}><Music size={16} /></div>
            <span className="worship-label-text" style={{ letterSpacing: '2px' }}>PREMIUM PRAISE STUDIO</span>
          </div>
        </div>

        {/* Floating Glass Cinema Player */}
        <div style={{ position: 'relative', padding: '0 20px 30px' }}>
          <div style={{ 
            position: 'relative',
            width: '100%', 
            paddingBottom: '56.25%', /* 16:9 Aspect Ratio */
            background: '#000', 
            borderRadius: '32px', 
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255,255,255,0.12)',
            /* Fix for corner artifacts with backdrop-filter */
            WebkitMaskImage: '-webkit-radial-gradient(white, black)',
            isolation: 'isolate'
          }}>
            {youtubeId ? (
              <iframe 
                style={{ position: 'absolute', top: '-1px', left: '-1px', width: 'calc(100% + 2px)', height: 'calc(100% + 2px)', border: 'none' }}
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`} 
                title="Praise Player" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            ) : (
              <div style={{ 
                position: 'absolute', inset: 0, 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #1e293b 0%, #000000 100%)'
              }}>
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Music size={40} color="white" />
                </motion.div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 700, marginTop: '15px' }}>찬양 링크를 기다리고 있습니다</p>
              </div>
            )}
          </div>

          {/* Decorative Glow */}
          <div style={{ 
            position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
            width: '80%', height: '60%', background: youtubeId ? 'rgba(255, 77, 109, 0.4)' : 'transparent',
            filter: 'blur(60px)', zIndex: -1, transition: '0.5s'
          }} />
        </div>

        <div style={{ padding: '0 20px 40px' }}>
          <div style={{ 
            background: 'white', padding: '15px 20px', borderRadius: '24px', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '12px',
            border: '1.5px solid #F5E6CC'
          }}>
            <div style={{ color: '#F5D060' }}><Sparkles size={18} /></div>
            <input 
              className="praise-input"
              type="text" 
              placeholder="함께 듣고 싶은 찬양 주소를 공유해주세요." 
              value={praiseUrl}
              onChange={(e) => setPraiseUrl(e.target.value)}
              style={{ border: 'none', background: 'none', flex: 1, fontSize: '13px', fontWeight: 700, outline: 'none', color: '#2D1F08', padding: '0' }}
            />
          </div>
        </div>
      </div>

      {/* 2. Header Section (Moved down) */}
      <div className="worship-section-card" style={{ background: 'linear-gradient(135deg, #FDFCF0 0%, #F5F3E6 100%)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#2D1F08', marginBottom: '8px' }}>가정 예배 가이드</h2>
        <p style={{ fontSize: '14px', color: '#8B7355', fontWeight: 700, marginBottom: '20px' }}>오늘 우리 가정에 주시는 하나님의 메시지</p>
        
        <button className="generate-btn" onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}
          <span>{currentSession ? "예배 본문 새로고침" : "오늘의 예배 시작하기"}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >

          {currentSession && !isGenerating && (
            <>
              {/* 2. Today's Word */}
              <div className="worship-section-card">
                <div className="worship-label-row">
                  <div className="worship-icon-circle" style={{ background: '#F5D060' }}><BookOpen size={16} /></div>
                  <span className="worship-label-text">WORD 오늘의 말씀</span>
                </div>
                <div className="worship-content-box">
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#B08D3E' }}>{currentSession.word.ref}</span>
                  <p className="scripture-text">{currentSession.word.text}</p>
                </div>
              </div>

              {/* 3. Interpretation */}
              <div className="worship-section-card">
                <div className="worship-label-row">
                  <div className="worship-icon-circle" style={{ background: '#8A60FF' }}><Sparkles size={16} /></div>
                  <span className="worship-label-text">MEDITATION 말씀 해석</span>
                </div>
                <div className="worship-content-box">
                  <p style={{ fontSize: '15px', color: '#2D1F08', fontWeight: 600, lineHeight: 1.6 }}>{currentSession.interpretation}</p>
                </div>
              </div>

              {/* 4. Sharing */}
              <div className="worship-section-card">
                <div className="worship-label-row">
                  <div className="worship-icon-circle" style={{ background: '#4BD991' }}><MessageCircle size={16} /></div>
                  <span className="worship-label-text">SHARING 나눔 질문</span>
                </div>
                <div className="sharing-list">
                  {currentSession.questions.map((q, i) => (
                    <div key={i} className="sharing-item">Q{i+1}. {q}</div>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 5. Prayer Wall (Always visible, part of the flow) */}
      <div className="worship-section-card">
        <div className="worship-label-row">
          <div className="worship-icon-circle" style={{ background: '#FF9966' }}><Heart size={16} /></div>
          <span className="worship-label-text">PRAYER 기도의 정원</span>
        </div>
        
        <div className="prayer-input-container">
           <textarea 
            className="prayer-textarea-v2" 
            placeholder="예배를 마치며 함께 나눈 기도제목을 기록하세요..." 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={{ minHeight: '80px', marginBottom: '10px' }}
           />
           <button className="generate-btn" onClick={handleRecord} style={{ background: '#2D1F08' }}>
             <Send size={18} /> <span style={{ marginLeft: '10px', fontWeight: 900 }}>기도제목 기록하기</span>
           </button>
        </div>

        {/* Shared Prayer Wall */}
        <div className="prayer-wall" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
           <div className="flex items-center gap-2 mb-3" style={{ paddingLeft: '4px' }}>
             <Heart size={16} color="#FF4D6D" fill="#FF4D6D" />
             <span style={{ fontSize: '16px', fontWeight: 900, color: '#2D1F08' }}>서로의 기도 기록</span>
           </div>

           {allPrayers.length === 0 ? (
             <div className="text-center py-14" style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '28px', border: '1px dashed rgba(0,0,0,0.1)' }}>
               <Smile size={54} color="#D4AF37" style={{ opacity: 0.4, margin: '0 auto 15px' }} />
               <p style={{ fontSize: '15px', color: '#5D4037', fontWeight: 700 }}>아직 기록된 기도가 없어요.</p>
               <p style={{ fontSize: '13px', color: '#8B6500', opacity: 0.8, marginTop: '6px' }}>첫 마음을 담은 기도를 남겨보세요.</p>
             </div>
           ) : (
             allPrayers.slice(0, 20).map((p) => (
               <motion.div 
                key={p.id}
                initial={{ opacity: 0, x: p.type === 'mine' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="prayer-card-v2"
                style={{ 
                  background: p.type === 'mine' ? 'rgba(255,255,255,0.9)' : 'rgba(138, 96, 255, 0.1)',
                  borderLeft: p.type === 'mine' ? '4px solid #F5D060' : '4px solid #8A60FF',
                  padding: '12px 15px'
                }}
               >
                 <div className="flex justify-between items-center mb-2">
                   <span style={{ fontSize: '11px', fontWeight: 900, color: p.type === 'mine' ? '#8B6500' : '#8A60FF' }}>
                     {p.type === 'mine' ? '나의 기도' : '배우자의 기도'}
                   </span>
                   <span style={{ fontSize: '10px', opacity: 0.5 }}>{p.date}</span>
                 </div>
                 <p style={{ fontSize: '14px', color: '#2D1F08', lineHeight: 1.5 }}>{p.text}</p>
               </motion.div>
             ))
           )}
        </div>
      </div>
    </motion.div>
  );
};


/* 📘 Heart Sync App Guide & Tips */
const AppGuideView = ({ onBack }) => {
  const features = [
    {
      title: "🚦 부부 신호등 (Mood Signal)",
      icon: "❤️",
      desc: "말하지 않아도 서로의 기분 상태를 실시간 확인하고 배려할 수 있습니다. 배우자가 지쳐있을 땐 하티가 특별한 대응 가이드를 드려요.",
      tip: "출근 후 혹은 퇴근 전, 나의 현재 신호를 먼저 보내보세요. 배우자가 미리 준비할 수 있는 힘이 됩니다."
    },
    {
      title: "🃏 오늘의 시크릿 카드",
      icon: "🤫",
      desc: "매일 한 번, 부부의 신비로운 질문이 도착합니다. 서로의 답변을 확인하기 위해 카드를 뒤집는 설렘을 느껴보세요.",
      tip: "함께 침대에 누웠을 때나 차 안에서 조용히 카드를 열어보고 대화를 나눠보세요."
    },
    {
      title: "🃏 5가지 테마 대화 카드",
      icon: "🎭",
      desc: "일상부터 상상, 추억, 관계, 신앙까지! 평소에 차마 묻지 못했던 깊은 질문들을 밸런스 게임처럼 즐길 수 있습니다.",
      tip: "외식이나 데이트 나갈 때 대화 카드를 켜보세요. 스마트폰만 보던 시간이 풍성한 대화의 시간으로 바뀝니다."
    },
    {
      title: "🤖 AI 하티 상담 & 리포트",
      icon: "✨",
      desc: "부부의 MBTI와 대화 패턴을 분석하는 똑똑한 AI '하티'가 관계의 거울이 되어드립니다. 월간 리포트로 성장하는 모습을 확인하세요.",
      tip: "배우자의 말이 이해되지 않을 때 하티에게 물어보세요. 심리학적 관점에서 배우자의 마음을 해석해 줍니다."
    },
    {
      title: "🙏 프리미엄 가정 예배",
      icon: "🕯️",
      desc: "바쁜 한 주, 부부가 함께 하나님 앞에 서는 시간입니다. 엄선된 말씀과 찬양 링크, 그리고 영적 소통을 돕는 나눔 질문을 제공합니다.",
      tip: "설정에서 예배 알림 시간을 정해두세요. 일주일에 한 번이라도 부부가 손잡고 기도하는 루틴을 만들어 보세요."
    },
    {
      title: "🌹 비밀의 화원 (Intimacy)",
      icon: "🔓",
      desc: "누구에게도 말하지 못한 둘만의 은밀하고 깊은 소통 공간입니다. 더 깊은 정서적, 육체적 친밀감을 위한 특별한 시스템입니다.",
      tip: "화원의 배경을 우리 부부만의 사진으로 커스텀해 보세요. 더 따뜻한 둘만의 아지트가 됩니다."
    }
  ];

  const utilizationPlans = [
    { step: "Morning 루틴", act: "부부 신호등 확인 및 나의 신호 발송" },
    { step: "Evening 루틴", act: "오늘의 시크릿 카드 1개 완성하기" },
    { step: "Weekend 루틴", act: "가정 예배 1회 & 대화 카드 5장 이상 나누기" },
    { step: "Monthly 루틴", act: "월간 리포트 분석 및 '하티의 미션' 3개 실천" }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 flex flex-col gap-6" style={{ background: '#FDFCF0', minHeight: '100%' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px 0' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={28} color="#2D1F08" /></button>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#2D1F08' }}>Heart Sync 가이드</h2>
          <span style={{ fontSize: '13px', color: '#B08D3E', fontWeight: 800 }}>APP FEATURES & USER GUIDE</span>
        </div>
      </header>

      <section>
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08', marginBottom: '15px', borderLeft: '4px solid #D4AF37', paddingLeft: '12px' }}>부부신호등의 핵심 기능</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: 'white', padding: '20px', borderRadius: '24px', border: '1px solid #F5D06030', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '22px' }}>{f.icon}</span>
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#2D1F08' }}>{f.title}</span>
              </div>
              <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.6, marginBottom: '12px', wordBreak: 'keep-all' }}>{f.desc}</p>
              <div style={{ background: '#FFFBEB', padding: '12px', borderRadius: '14px', display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '14px' }}>💡</span>
                <p style={{ fontSize: '12px', fontWeight: 800, color: '#92400E', lineHeight: 1.5 }}>{f.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08', marginBottom: '15px', borderLeft: '4px solid #D4AF37', paddingLeft: '12px' }}>현명한 앱 활용 방안</h3>
        <div style={{ background: '#2D1F08', padding: '25px', borderRadius: '32px', color: 'white' }}>
          <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '20px', lineHeight: 1.5 }}>관계를 성장시키기 위해 하티가 추천하는 부부 생활 패턴입니다.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {utilizationPlans.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#F5D060' }}>{i+1}</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 900, color: '#F5D060' }}>{p.step}</span>
                  <span style={{ fontSize: '15px', fontWeight: 600 }}>{p.act}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
        <p style={{ fontSize: '12px', fontWeight: 700 }}>© 2026 Heart Sync. All rights reserved.</p>
      </div>
    </motion.div>
  );
};

/* 📊 Solution (AI Records) */
const SolutionView = ({ onBack }) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="report-page" style={{ paddingBottom: '100px' }}>
    <div className="flex items-center gap-3 mb-6 p-4">
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
        <ChevronLeft size={24} color="#2D1F08" />
      </button>
      <span style={{ fontSize: '20px', fontWeight: 900, color: '#2D1F08' }}>뒤로가기</span>
    </div>
    {/* 📈 이번 달 대화 횟수 현황 */}
    <div className="report-card" style={{ padding: '25px', marginBottom: '15px' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="report-icon-bg" style={{ background: 'linear-gradient(135deg, #FF9A8B, #FF6A88)' }}>
          <BarChart3 size={20} color="white" />
        </div>
        <span className="report-card-label" style={{ fontSize: '18px', fontWeight: 900 }}>이번 달 대화 기록</span>
      </div>
      
      <div className="flex flex-col items-center justify-center py-4 relative">
        <svg className="gauge-svg" viewBox="0 0 160 160" style={{ width: '150px', height: '150px' }}>
          <circle className="gauge-circle-bg" cx="80" cy="80" r="70" stroke="rgba(0,0,0,0.05)" strokeWidth="12" fill="none" />
          <circle className="gauge-circle-fill" cx="80" cy="80" r="70" 
            stroke="url(#gauge-grad)" strokeWidth="12" strokeLinecap="round" fill="none"
            style={{ strokeDasharray: `370, 440`, transform: 'rotate(-90deg)', transformOrigin: 'center' }} 
          />
          <defs>
            <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF9A8B" />
              <stop offset="100%" stopColor="#FF6A88" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute flex flex-col items-center">
          <span style={{ fontSize: '38px', fontWeight: 900, color: '#FF4D6D' }}>42</span>
          <span style={{ fontSize: '14px', fontWeight: 700, opacity: 0.4 }}>회</span>
        </div>
      </div>
      <p className="text-center" style={{ fontSize: '13px', fontWeight: 800, color: 'rgba(0,0,0,0.5)', marginTop: '15px' }}>
         목표 50회 중 84% 달성! 🎉
      </p>
    </div>

    {/* 📊 대화 테마 분석 (직관적 분포 그래프) */}
    <div className="report-card" style={{ padding: '25px', marginBottom: '15px' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="report-icon-bg" style={{ background: 'linear-gradient(135deg, #8A60FF, #AC8AFF)' }}>
          <Zap size={20} color="white" />
        </div>
        <span className="report-card-label" style={{ fontSize: '18px', fontWeight: 900 }}>대화 테마 테마 분석</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
        {[
          { label: '일상 소통', value: 45, color: '#FF8A9D' },
          { label: '신앙 고백', value: 30, color: '#8A60FF' },
          { label: '기대와 서운함', value: 15, color: '#F5D060' },
          { label: '추억과 미래', value: 10, color: '#5B7FFF' }
        ].map((item, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#2D1F08' }}>{item.label}</span>
              <span style={{ fontSize: '12px', fontWeight: 900, color: item.color }}>{item.value}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }} transition={{ duration: 1, delay: idx * 0.1 }}
                style={{ height: '100%', background: item.color, borderRadius: '100px' }} />
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '12px', color: '#8B7355', marginTop: '15px', lineHeight: 1.5 }}>
        * 한 달간의 대화 카테고리 분포입니다. <strong>신앙 고백</strong> 테마가 지난달보다 12% 증가하며 영적 친밀도가 높아지고 있어요!
      </p>
    </div>

    {/* ✝️ 부부를 위한 하티의 제안 (풍성한 상담 리포트) */}
    <div className="hatti-insight-box" style={{ background: 'rgba(255,255,255,0.7)', border: '1.5px solid #D4AF37', borderRadius: '32px', padding: '25px' }}>
       <div className="insight-header" style={{ marginBottom: '20px' }}>
         <div className="insight-avatar" style={{ border: '2px solid #D4AF37' }}>
           <img src="/counselor_f.png" alt="Hatti" onError={(e) => { e.target.src="https://api.dicebear.com/7.x/bottts/svg?seed=hatti"; }} />
         </div>
         <div className="flex flex-col">
           <span className="insight-title" style={{ fontSize: '18px', color: '#2D1F08', fontWeight: 900 }}>부부를 위한 하티의 제안</span>
           <span style={{ fontSize: '11px', color: '#B08D3E', fontWeight: 800, letterSpacing: '1px' }}>SPIRITUAL COUNSELING REPORT</span>
         </div>
       </div>

       <div className="expert-content" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Section 1: 분석 */}
          <section>
            <h4 style={{ fontSize: '15px', color: '#8A60FF', fontWeight: 900, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} /> 영적 친밀도 분석
            </h4>
            <p style={{ fontSize: '14px', lineHeight:1.7, color: '#4D3A1A', textAlign: 'justify' }}>
              이번 달 두 분은 42회의 깊은 대화를 통해 <strong>'하나님 앞에서의 정직함'</strong>을 실천하셨습니다. 특히 배우자의 기도로 표현하지 못한 속마음을 나누는 비중이 높아진 것은, 부부라는 언약적 관계 안에서 안전감을 충분히 누리고 있다는 증거입니다. 서로의 MBTI 기질 차이를 '불편함'이 아닌 '보완적 은혜'로 인식하기 시작한 점이 고무적입니다.
            </p>
          </section>

          {/* Section 2: 신앙적 원리 */}
          <section style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '15px', color: '#D4AF37', fontWeight: 900, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={14} /> 언약적 사랑의 원리
            </h4>
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#4D3A1A', fontStyle: 'italic', marginBottom: '10px' }}>
              "아내들이여 자기 남편에게 복종하기를 주께 하듯 하라... 남편들아 아내 사랑하기를 그리스도께서 교회를 사랑하시고 그 교회를 위하여 자신을 주심 같이 하라" (엡 5:22, 25)
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#4D3A1A' }}>
              개혁주의 관점에서 결혼은 단순한 계약이 아닌 <strong>거룩한 언약(Covenant)</strong>입니다. 상대의 부족함은 내가 정죄할 대상이 아니라, 주님이 나를 통해 채우라고 하시는 사명의 영역임을 기억하십시오. 이번 대화 패턴에서 나타난 사소한 갈등들은 두 분을 하나의 성전으로 빚어가시는 하나님의 손길입니다.
            </p>
          </section>

          {/* Section 3: 이번 주의 실천 과제 */}
          <section style={{ background: 'rgba(138, 96, 255, 0.05)', borderRadius: '20px', padding: '18px' }}>
            <h4 style={{ fontSize: '15px', color: '#8A60FF', fontWeight: 900, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} /> 이번 주 실천 방안 (Weekly Mission)
            </h4>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ fontSize: '13px', color: '#2D1F08', fontWeight: 600 }}>1. 배우자의 장점 세 가지를 적어 침대 맡에 두기</li>
              <li style={{ fontSize: '13px', color: '#2D1F08', fontWeight: 600 }}>2. 하루 5분, 서로의 손을 잡고 중보 기도하기</li>
              <li style={{ fontSize: '13px', color: '#2D1F08', fontWeight: 600 }}>3. 비판적인 단어 대신 "나는 ~라고 느껴서 도움이 필요해"라는 'I Message' 시도하기</li>
            </ul>
          </section>
       </div>
    </div>
  </motion.div>
);

/* 🌸 Intimacy Modal (Secret Garden) */
const IntimacyModal = ({ show, onClose, subPage, setSubPage, bgImage, onBgUpload, partnerLabel, isFullPage, onNav }) => {
  const [currentSecretIdx, setCurrentSecretIdx] = useState(0);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]); 
  const [myAnswerInput, setMyAnswerInput] = useState('');
  const [spouseStatus, setSpouseStatus] = useState('none'); 
  const [isTopicFinished, setIsTopicFinished] = useState(false);
  const [randomMoods, setRandomMoods] = useState([]); 
  const chatEndRef = useRef(null);

  const moodPool = useMemo(() => [
    { title: "🍷 로맨틱한 대화가 필요해요", desc: "와인 한 잔과 함께 깊은 이야기를 나누고 싶은 밤" },
    { title: "🚿 우리의 온도를 높이고 싶어요", desc: "오늘 밤, 당신과 아주 뜨겁게 하나가 되고 싶어요" },
    { title: "😴 오늘은 푹 쉬고 싶어요", desc: "부드러운 포옹만으로 충분한, 편안한 휴식이 필요해요" },
    { title: "💝 당신의 사랑이 고픈 날이에요", desc: "평소보다 더 많은 칭찬과 스킨십으로 우리를 채워줘요" },
    { title: "🎬 영화 한 편 보며 붙어 있을까요?", desc: "아무 생각 없이 좋아하는 영화 보며 쉬고 싶어요" },
    { title: "☕ 따뜻한 차 한 잔 어때요?", desc: "오늘 하루 있었던 일들을 차분히 들려주고 싶어요" },
    { title: "👫 손 잡고 산책하고 싶어요", desc: "신선한 공기 마시며 동네 한 바퀴 천천히 돌아요" },
    { title: "🍕 맛있는 거 먹으러 가요!", desc: "우리가 좋아하는 맛집 가서 기분 전환하고 싶어요" },
    { title: "🙏 같이 조용히 기도하고 싶어요", desc: "주님 안에서 한마음으로 평안을 구하고 싶은 날" },
    { title: "🤫 오늘은 둘만의 비밀 데이트?", desc: "아이들/일은 잠시 잊고 연애 초기로 돌아가 볼까요?" },
  ], []);

  useEffect(() => {
    if (show) {
      const shuffled = [...moodPool].sort(() => 0.5 - Math.random());
      setRandomMoods(shuffled.slice(0, 5));
    }
  }, [show, moodPool]);
  
  const secretQuestions = useMemo(() => 
    (questions || []).filter(q => q.category === '시크릿'), []
  );

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, spouseStatus]);

  if (!show) return null;

  const getTime = () => {
    const now = new Date();
    return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const nextSecret = (e) => {
    if (e) e.stopPropagation();
    setMessages([]);
    setInputText('');
    setMyAnswerInput('');
    setSpouseStatus('none');
    setIsTopicFinished(false);
    setCurrentSecretIdx((prev) => (prev + 1) % secretQuestions.length);
  };

  const handleSendPrompt = () => {
    const q = secretQuestions[currentSecretIdx]?.question;
    const newMsg = { id: Date.now(), text: q, sender: 'me', type: 'question', time: getTime() };
    setMessages([newMsg]);
    setSpouseStatus('typing');
    setTimeout(() => setSpouseStatus('done'), 2000);
  };

  const handleSendChat = () => {
    if (!inputText.trim()) return;
    const userMsg = { id: Date.now(), text: inputText, sender: 'me', type: 'chat', time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    
    setTimeout(() => {
      setSpouseStatus('typing');
      setTimeout(() => {
        const partnerMsg = { 
          id: Date.now() + 1, 
          text: "정말 좋은 생각이에요. 우리 더 많은 이야기를 나눠봐요. 😊", 
          sender: 'partner', 
          type: 'chat', 
          time: getTime() 
        };
        setMessages(prev => [...prev, partnerMsg]);
        setSpouseStatus('done');
      }, 2500);
    }, 1000);
  };

  const handleAnswerSubmit = () => {
    if (!myAnswerInput.trim()) return;
    const answerMsg = { id: Date.now(), text: myAnswerInput, sender: 'me', type: 'answer', time: getTime() };
    setMessages(prev => [...prev, answerMsg]);
    setMyAnswerInput('');
    setIsTopicFinished(true);
  };

  const currentBg = bgImage || '/garden_bg_premium.png';

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className={isFullPage ? "" : "intimacy-modal-overlay"} 
      onClick={!isFullPage ? onClose : undefined}
      style={{ 
        position: 'absolute', 
        top: '-72px', /* 상단 바 영역까지 배경으로 채움 */
        left: '-22px', 
        right: '-22px', 
        bottom: '-120px', /* 네비게이션 영역까지 확장 */
        zIndex: 2000, 
        background: `url(${currentBg})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        padding: '80px 22px 140px', /* 패딩 조정 */
        overflowY: 'auto'
      }}
    >
      {/* 🔔 상단 아이콘 (모달 안에서 다시 표시) */}
      <div style={{ position: 'absolute', top: '70px', right: '45px', display: 'flex', gap: '18px', zIndex: 2010 }}>
        <Bell size={22} color="rgba(45, 31, 8, 0.4)" />
        <Settings size={22} color="rgba(45, 31, 8, 0.4)" />
      </div>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          width: '100%',
          maxWidth: '360px',
          marginTop: '20px', /* 간격 조정 */
          height: subPage === 'main' ? 'auto' : '100%',
          background: subPage === 'secrets' ? '#B2C7DA' : 'rgba(253, 252, 240, 0.96)',
          backdropFilter: 'blur(30px) saturate(180%)', 
          display: 'flex', 
          flexDirection: 'column', 
          position: 'relative', 
          borderRadius: '46px',
          overflow: 'hidden',
          border: subPage === 'secrets' ? 'none' : '1.5px solid rgba(212, 175, 55, 0.25)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
          marginBottom: '20px' /* 아래쪽 잘림 방지 */
        }}
      >
        {subPage === 'main' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '50px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <h2 style={{ 
                background: 'linear-gradient(105deg, #7D5A00 0%, #C8970A 30%, #F5D060 50%, #D4960A 70%, #7D5A00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '32px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.5px' 
              }}>비밀의 화원</h2>
              <p style={{ color: '#8B7355', fontSize: '15px', fontWeight: 700, opacity: 0.8 }}>두 분만의 가장 깊고 은밀한 소통 공간</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button 
                onClick={() => setSubPage('secrets')}
                style={{ 
                  background: 'rgba(255,255,255,0.7)', padding: '24px', borderRadius: '30px', 
                  display: 'flex', alignItems: 'center', gap: '16px', border: '1.5px solid white', 
                  boxShadow: '0 8px 30px rgba(0,0,0,0.05)', textAlign: 'left', width: '100%'
                }}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#FDFCF0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', flexShrink: 0 }}>🤫</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08' }}>시크릿 깊은 대화</span>
                  <span style={{ fontSize: '13px', color: '#8B7355', fontWeight: 600, wordBreak: 'keep-all' }}>평소 하기 어려웠던 속마음 질문 나누기</span>
                </div>
              </button>

              <button 
                onClick={() => setSubPage('signal')}
                style={{ 
                  background: 'rgba(255,255,255,0.7)', padding: '24px', borderRadius: '30px', 
                  display: 'flex', alignItems: 'center', gap: '16px', border: '1.5px solid white', 
                  boxShadow: '0 8px 30px rgba(0,0,0,0.05)', textAlign: 'left', width: '100%'
                }}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#FFF5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', flexShrink: 0 }}>🍷</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08' }}>무드 시그널 보내기</span>
                  <span style={{ fontSize: '13px', color: '#8B7355', fontWeight: 600, wordBreak: 'keep-all' }}>말없이 전하는 배우자를 향한 특별한 신호</span>
                </div>
              </button>
            </div>
            
            <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={isFullPage ? () => onNav('home') : onClose} 
                style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', background: 'white', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '14px', fontWeight: 900, border: '4px solid transparent',
                  backgroundImage: 'linear-gradient(white, white), linear-gradient(105deg, #7D5A00 0%, #C8970A 30%, #F5D060 50%, #D4960A 70%, #7D5A00 100%)',
                  backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box',
                  boxShadow: '0 15px 35px rgba(245, 208, 96, 0.25)', color: '#8B6500'
                }}
              >
                <span style={{ background: 'linear-gradient(105deg, #7D5A00, #C8970A, #8B6500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>화원</span>
                <span style={{ background: 'linear-gradient(105deg, #7D5A00, #C8970A, #8B6500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>나가기</span>
              </button>
            </div>
          </div>
        )}

        {subPage === 'secrets' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(178, 199, 218, 0.95)', borderBottom: '1px solid rgba(0,0,0,0.05)', backdropFilter: 'blur(20px)', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div onClick={() => setSubPage('main')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ChevronLeft size={24} color="#2D1F08" /></div>
                <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <Heart size={20} color="#F5D060" fill="#F5D060" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '16px', fontWeight: 900, color: '#2D1F08' }}>비밀의 화원 대화</span>
                  <span style={{ fontSize: '10px', color: '#546E7A', fontWeight: 700 }}>{partnerLabel}님과 연결됨</span>
                </div>
              </div>
              <button onClick={() => setMessages([])} style={{ background: 'none', border: 'none', color: '#2D1F08', opacity: 0.5 }}><RefreshCw size={18} /></button>
            </div>

            {/* Chat Area */}
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px 14px 140px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ textAlign: 'center', margin: '10px 0' }}>
                <span style={{ padding: '5px 14px', borderRadius: '15px', background: 'rgba(0,0,0,0.08)', fontSize: '10px', color: 'white', fontWeight: 800 }}>오직 두 분만을 위한 보안 대화방입니다</span>
              </div>

              {messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start' }}>
                  {msg.sender === 'me' ? (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '10px', color: '#FBC02D', fontWeight: 900 }}>1</span>
                        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)' }}>{msg.time}</span>
                      </div>
                      <div style={{ padding: '10px 14px', borderRadius: '16px 2px 16px 16px', background: '#FEE500', color: '#2D1F08', maxWidth: '240px', fontSize: '14px', fontWeight: 600, lineHeight: 1.4, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{msg.text}</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Smile size={24} color="#F5D060" /></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#37474F' }}>{partnerLabel}</span>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                          <div style={{ padding: '10px 14px', borderRadius: '2px 16px 16px 16px', background: 'white', color: '#2D1F08', fontSize: '14px', fontWeight: 600, lineHeight: 1.4, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{msg.text}</div>
                          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)' }}>{msg.time}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {spouseStatus === 'done' && messages.some(m => m.type === 'question') && !messages.some(m => m.type === 'answer' && m.sender === 'me') && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Smile size={24} color="#F5D060" /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#37474F' }}>{partnerLabel}</span>
                    <div style={{ padding: '10px 14px', borderRadius: '2px 16px 16px 16px', background: 'white', color: '#2C3E50', fontSize: '13px', fontStyle: 'italic', fontWeight: 500 }}>"질문이 정말 좋네요. 평소에 당신의 이 마음을 잘 알아주지 못해 미안해요. 늘 고마워요."</div>
                  </div>
                </div>
              )}

              {spouseStatus === 'typing' && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Smile size={24} color="#F5D060" /></div>
                  <div style={{ padding: '10px 16px', borderRadius: '2px 14px 14px 14px', background: 'white', display: 'flex', gap: '4px' }}>
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2 }} style={{ width: '4px', height: '4px', background: '#94A3B8', borderRadius: '50%' }} />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} style={{ width: '4px', height: '4px', background: '#94A3B8', borderRadius: '50%' }} />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} style={{ width: '4px', height: '4px', background: '#94A3B8', borderRadius: '50%' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 16px 30px', background: 'white', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 }}>
              {messages.length === 0 ? (
                <>
                  <div style={{ background: '#F8F9FA', padding: '12px 16px', borderRadius: '20px', border: '1px solid #E9ECEF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 900, color: '#2D1F08', opacity: 0.6 }}>내 마음을 전하는 시크릿 질문</span>
                      <button onClick={nextSecret} style={{ background: 'none', border: 'none', color: '#0288D1', fontSize: '11px', fontWeight: 800 }}>새로고침</button>
                    </div>
                    <p onClick={handleSendPrompt} style={{ fontSize: '14px', fontWeight: 800, color: '#2D1F08', cursor: 'pointer', lineHeight: 1.4 }}>"{secretQuestions[currentSecretIdx]?.question}"</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, background: '#F2F2F2', borderRadius: '20px', padding: '10px 16px' }}>
                      <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendChat()} placeholder="메시지를 입력하세요" style={{ width: '100%', border: 'none', background: 'none', outline: 'none', fontSize: '14px', fontWeight: 600 }} />
                    </div>
                    <button onClick={handleSendChat} style={{ color: inputText.trim() ? '#FEE500' : '#E0E0E0', background: 'none', border: 'none' }}><Send size={24} fill={inputText.trim() ? "#FEE500" : "none"} /></button>
                  </div>
                </>
              ) : !isTopicFinished && messages.some(m => m.type === 'question') ? (
                  <div style={{ background: 'white', padding: '15px', borderRadius: '20px', boxShadow: '0 -5px 15px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 900, color: '#FBC02D', marginBottom: '10px', display: 'block' }}>나의 진솔한 답변</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <textarea value={myAnswerInput} onChange={(e) => setMyAnswerInput(e.target.value)} placeholder="마음을 전해보세요..." style={{ flex: 1, border: 'none', background: '#F7F7F7', borderRadius: '12px', padding: '12px', fontSize: '14px', minHeight: '60px', resize: 'none' }} />
                      <button onClick={handleAnswerSubmit} style={{ width: '60px', borderRadius: '12px', background: '#FEE500', color: '#2D1F08', border: 'none', fontWeight: 900, fontSize: '13px' }}>보내기</button>
                    </div>
                  </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, background: '#F2F2F2', borderRadius: '20px', padding: '10px 16px' }}>
                      <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendChat()} placeholder="답장을 보내세요" style={{ width: '100%', border: 'none', background: 'none', outline: 'none', fontSize: '14px', fontWeight: 600 }} />
                    </div>
                    <button onClick={handleSendChat} style={{ color: inputText.trim() ? '#FEE500' : '#E0E0E0', background: 'none', border: 'none' }}><Send size={24} fill={inputText.trim() ? "#FEE500" : "none"} /></button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={nextSecret} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.05)', border: 'none', fontSize: '12px', fontWeight: 800, color: '#455A64' }}>다른 질문</button>
                    <button onClick={() => setSubPage('main')} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.05)', border: 'none', fontSize: '12px', fontWeight: 800, color: '#455A64' }}>대화 마침</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {subPage === 'signal' && (
          <div className="flex flex-col h-full bg-[#FCFBF4]/95 overflow-hidden">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '60px 24px 20px', background: 'white', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <div onClick={() => setSubPage('main')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ChevronLeft size={24} color="#8B6500" />
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#8B6500' }}>뒤로가기</span>
              </div>
            </div>

            <div style={{ padding: '30px 24px', flexGrow: 1, overflowY: 'auto' }}>
              <div className="text-center mb-10">
                <h3 style={{ color: '#2D1F08', fontSize: '26px', fontWeight: 900, marginBottom: '10px', letterSpacing: '-0.5px' }}>지금 내 기분은 어떤가요?</h3>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ height: '3px', width: '40px', background: '#F5D060', borderRadius: '10px' }} />
                </div>
              </div>

              <div className="signal-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '40px' }}>
                 {randomMoods.map((mood, idx) => (
                   <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.08 }}
                     onClick={() => { alert(`'${mood.title}' 신호를 보냈습니다!`); setSubPage('main'); }}
                     style={{ cursor: 'pointer' }}
                   >
                     <SignalOptV2 title={mood.title} desc={mood.desc} />
                   </motion.div>
                 ))}
              </div>

              <div style={{ textAlign: 'center', padding: '20px', background: '#FDFCF0', borderRadius: '24px', border: '1px dashed #D4AF37' }}>
                <p style={{ fontSize: '12px', color: '#8B7355', fontWeight: 700, lineHeight: 1.6 }}>
                  💡 선택하신 무드 시그널은 배우자의 홈 화면에<br/>
                  실시간으로 전달되어 서로를 배려할 수 있게 돕습니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};





/* 🃏 Card Game View (Separated Page) */
const CardGameView = ({ onBack }) => {
  const [category, setCategory] = useState('일상');
  const [isFlipped, setIsFlipped] = useState(false);
  const filteredQuestions = useMemo(() => questions.filter(q => q.category === category), [category]);
  const [currentQuestion, setCurrentQuestion] = useState(filteredQuestions[0]);

  const [isWaiting, setIsWaiting] = useState(false);

  const drawNewCard = () => {
    setIsFlipped(false);
    setIsWaiting(false);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * filteredQuestions.length);
      setCurrentQuestion(filteredQuestions[idx]);
    }, 300);
  };

  const handOverTurn = () => {
    setIsWaiting(true);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full items-center p-4">
      <div className="w-full flex items-center justify-start mb-2">
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0' }}>
          <ChevronLeft size={20} color="#8A60FF" strokeWidth={3} />
          <span style={{ fontSize: '14px', fontWeight: 900, color: '#8A60FF' }}>홈으로</span>
        </button>
      </div>

      <div className="category-row" style={{ overflowX: 'auto', paddingBottom: '10px' }}>
          {['일상', '상상', '추억', '관계', '신앙'].map(cat => (
            <div key={cat} className={`category-chip ${category === cat ? 'active' : ''}`} onClick={() => { setCategory(cat); setIsFlipped(false); }}>
              {cat}
            </div>
          ))}
      </div>
      <div className="flex flex-col items-center" style={{ marginTop: '5px', marginBottom: '15px' }}>
        <p className="card-subtitle" style={{ 
          letterSpacing: '5px', 
          color: '#8B6500', 
          fontWeight: '900', 
          fontSize: '13px',
          opacity: 0.8,
          marginBottom: '5px'
        }}>SELECT YOUR TOPIC</p>
        <p style={{ 
          fontSize: '11px', 
          color: '#8B7355', 
          fontWeight: 700, 
          letterSpacing: '-0.2px' 
        }}>질문 주제를 먼저 고르세요</p>
      </div>

      <div className="card-deck">
        <div className="card-float-anim">
          <div className={`talking-card ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
          <div className="card-face card-front" style={{ background: "url('/card_bg.png') no-repeat center center", backgroundSize: 'cover', borderRadius: '32px', overflow: 'hidden' }}>
            <div className="card-pattern-box" style={{ 
              justifyContent: 'flex-end', 
              padding: '0 15px 30px', 
              background: 'rgba(0,0,0,0.02)' 
            }}>
              {/* 타이틀을 카드 최하단으로 배치하여 배경 그림을 보호 */}
              <div className="flex flex-col items-center">
                <div style={{ 
                  background: 'rgba(0,0,0,0.6)', 
                  backdropFilter: 'blur(12px)', 
                  padding: '12px 28px', 
                  borderRadius: '100px',
                  border: '1.5px solid rgba(255,215,0,0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '2px',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.5)',
                  width: 'fit-content',
                  minWidth: '220px'
                }}>
                  <p className="brand-text" style={{ 
                    fontSize: '20px', 
                    letterSpacing: '3px', 
                    color: '#FFD700', 
                    margin: 0,
                    textShadow: '0 0 10px rgba(255,215,0,0.5)',
                    whiteSpace: 'nowrap'
                  }}>QUESTION CARD</p>
                  <p style={{ 
                    fontSize: '11px', 
                    color: '#FFF3A3', 
                    fontWeight: 900, 
                    margin: 0,
                    letterSpacing: '1.5px',
                    opacity: 0.9,
                    whiteSpace: 'nowrap'
                  }}>질문카드 | 클릭해서 확인</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card-face card-back" style={{ background: "url('/card_bg.png') no-repeat center center", backgroundSize: 'cover', borderRadius: '32px', overflow: 'hidden' }}>
            <div className="card-pattern-box" style={{ background: 'rgba(255,255,255,0.6)', margin: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
              {!isWaiting ? (
                <>
                  <span className="compat-badge" style={{ marginBottom: '12px', background: '#FF4D6D', color: 'white' }}>{currentQuestion?.category}</span>
                  <h2 className="card-question" style={{ 
                    fontSize: '22px', 
                    padding: '0 15px', 
                    color: '#2D1F08', 
                    textShadow: 'none', 
                    lineHeight: 1.6,
                    textAlign: 'center',
                    wordBreak: 'keep-all',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>{currentQuestion?.question}</h2>
                  <button 
                    className="send-to-spouse-btn" 
                    style={{ 
                      marginTop: '40px', 
                      background: '#2D1F08', 
                      borderRadius: '100px', 
                      height: '62px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      padding: '0 30px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                      width: '100%',
                      maxWidth: '300px',
                      border: '2px solid #F5D060',
                      lineHeight: 1
                    }}
                    onClick={handOverTurn}
                  >
                    <span style={{ 
                      color: 'white', 
                      fontWeight: 900, 
                      fontSize: '16px', 
                      whiteSpace: 'nowrap', 
                      letterSpacing: '-0.3px',
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}>답변 완료 & 턴 넘기기</span>
                    <div style={{ display: 'flex', alignItems: 'center', transform: 'rotate(180deg)' }}>
                      <ChevronLeft size={20} color="#F5D060" style={{ flexShrink: 0, strokeWidth: 3 }} />
                    </div>
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 px-4" style={{ height: '100%', minHeight: '300px' }}>
                  <p style={{ 
                    fontSize: '19px', 
                    color: '#8B6500', 
                    fontWeight: 900, 
                    textAlign: 'center', 
                    wordBreak: 'keep-all', 
                    lineHeight: 1.4,
                    padding: '0 10px',
                    marginTop: '20px'
                  }}>배우자의 화면과 연결 중...</p>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#2D1F08', 
                    opacity: 0.8, 
                    fontWeight: 800, 
                    textAlign: 'center', 
                    wordBreak: 'keep-all', 
                    lineHeight: 1.6, 
                    padding: '0 15px',
                    marginBottom: '20px'
                  }}>배우자가 질문을 확인하고 있습니다. 질문에 대해 서로 얼굴을 마주 보며 충분히 이야기를 나눠보세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

      <button className="draw-btn" onClick={drawNewCard} style={{ marginTop: '40px' }}>다른 카드 뽑기</button>
    </motion.div>
  );
};

/* ⚙️ Settings View (Extended) */
const SettingsView = ({ userRole, husbandInfo, setHusbandInfo, wifeInfo, setWifeInfo, onReportClick, onGuideClick }) => {
  const [notifSignal, setNotifSignal] = useState(true);
  const [notifCard, setNotifCard] = useState(true);
  const [notifWorship, setNotifWorship] = useState(true);
  const [notifHatti, setNotifHatti] = useState(false);
  
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showWorshipSet, setShowWorshipSet] = useState(false);
  const [showAnnivSet, setShowAnnivSet] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showConnectSet, setShowConnectSet] = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);
  const [showDataSecurity, setShowDataSecurity] = useState(false);

  // Worship States
  const [worshipDays, setWorshipDays] = useState(() => JSON.parse(localStorage.getItem('worshipDays') || '["일", "수"]'));
  const [worshipTime, setWorshipTime] = useState(() => localStorage.getItem('worshipTime') || '21:00');

  // Anniversary States
  const [anniversaries, setAnniversaries] = useState(() => JSON.parse(localStorage.getItem('anniversaries') || '[]'));
  const [newAnnivTitle, setNewAnnivTitle] = useState("");
  const [newAnnivDate, setNewAnnivDate] = useState("");


  const myInfo = userRole === 'husband' ? husbandInfo : wifeInfo;
  const setMyInfo = userRole === 'husband' ? setHusbandInfo : setWifeInfo;

  useEffect(() => {
    localStorage.setItem('worshipDays', JSON.stringify(worshipDays));
    localStorage.setItem('worshipTime', worshipTime);
    localStorage.setItem('anniversaries', JSON.stringify(anniversaries));
  }, [worshipDays, worshipTime, anniversaries]);

  // 결혼기념일 기반 D-Day 계산 (공용 날짜 사용으로 동기화 보장)
  const sharedMarriageDate = husbandInfo.marriageDate || wifeInfo.marriageDate || '2020-05-23';
  const weddingDate = useMemo(() => new Date(sharedMarriageDate), [sharedMarriageDate]);
  const today = new Date();
  const dDay = useMemo(() => {
    const diffTime = Math.abs(today - weddingDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [weddingDate, today]);

  const updateProfile = (field, value) => {
    setMyInfo(prev => ({ ...prev, [field]: value }));
    // 결혼기념일은 부부 공통 정보이므로 양쪽 모두 업데이트하여 싱크 맞춤
    if (field === 'marriageDate') {
      if (userRole === 'husband') setWifeInfo(prev => ({ ...prev, marriageDate: value }));
      else setHusbandInfo(prev => ({ ...prev, marriageDate: value }));
    }
  };

  const addAnniversary = () => {
    if (!newAnnivTitle.trim() || !newAnnivDate) {
      alert("기념일 이름과 날짜를 모두 정확히 입력해주세요.");
      return;
    }
    const newEntry = { id: Date.now(), title: newAnnivTitle, date: newAnnivDate };
    setAnniversaries(prev => [...prev, newEntry]);
    setNewAnnivTitle("");
    setNewAnnivDate("");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="settings-page" style={{ padding: '20px 0 100px' }}>
      {/* 💑 Couple Profile Card */}
      <div className="settings-profile-card" style={{ 
        background: 'rgba(255, 255, 255, 0.7)', 
        backdropFilter: 'blur(20px)',
        borderRadius: '35px',
        padding: '30px',
        margin: '0 20px 25px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 15px 35px rgba(0,0,0,0.05)',
        border: '1px solid rgba(255,255,255,0.4)',
        position: 'relative'
      }}>
        <button 
          onClick={() => setShowProfileEdit(true)}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: '1px solid #EEE', borderRadius: '12px', padding: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        >
          <User size={16} color="#8B7355" />
        </button>

        <div style={{ 
          width: '90px', height: '90px', borderRadius: '50%', 
          background: 'linear-gradient(135deg, #FF9A8B, #FF6A88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '15px', overflow: 'hidden', border: '3px solid white',
          boxShadow: '0 8px 15px rgba(255, 106, 136, 0.3)'
        }}>
          <img 
            src={userRole === 'husband' ? "/husband.png" : "/wife.png"} 
            alt="Profile"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            onError={(e) => { e.target.src = userRole === 'husband' ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Husband" : "https://api.dicebear.com/7.x/avataaars/svg?seed=Wife"; }}
          />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#2D1F08', marginBottom: '8px' }}>
          {husbandInfo.nickname} ❤️ {wifeInfo.nickname}
        </h2>
        <p style={{ fontSize: '14px', color: '#8B7355', fontWeight: 700, marginBottom: '5px' }}>결혼기념일 {husbandInfo.marriageDate}</p>
        <div style={{ fontSize: '32px', fontWeight: 900, color: '#FF7E5F', letterSpacing: '2px' }}>D+{dDay}</div>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <div style={{ background: '#FDFCF0', padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 900, color: '#B08D3E', border: '1px solid #F5D060' }}>{husbandInfo.mbti}</div>
          <div style={{ background: '#FDFCF0', padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 900, color: '#B08D3E', border: '1px solid #F5D060' }}>{wifeInfo.mbti}</div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div 
          onClick={() => setShowProfileEdit(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', borderRadius: '32px', padding: '30px', width: '100%', maxWidth: '340px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08', marginBottom: '20px', textAlign: 'center' }}>내 정보 수정</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#8B7355', display: 'block', marginBottom: '6px' }}>애칭</label>
                <input value={myInfo.nickname} onChange={(e) => updateProfile('nickname', e.target.value)} style={{ width: '100%', padding: '12px 18px', borderRadius: '14px', background: '#F9FAFB', border: '1px solid #EEE' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#8B7355', display: 'block', marginBottom: '6px' }}>성격 유형 (하티 인사이트)</label>
                <input value={myInfo.mbti} onChange={(e) => updateProfile('mbti', e.target.value)} style={{ width: '100%', padding: '12px 18px', borderRadius: '14px', background: '#F9FAFB', border: '1px solid #EEE' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#8B7355', display: 'block', marginBottom: '6px' }}>혈액형</label>
                <input value={myInfo.blood} onChange={(e) => updateProfile('blood', e.target.value)} style={{ width: '100%', padding: '12px 18px', borderRadius: '14px', background: '#F9FAFB', border: '1px solid #EEE' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#8B7355', display: 'block', marginBottom: '6px' }}>결혼기념일</label>
                <input type="date" value={myInfo.marriageDate} onChange={(e) => updateProfile('marriageDate', e.target.value)} style={{ width: '100%', padding: '12px 18px', borderRadius: '14px', background: '#F9FAFB', border: '1px solid #EEE' }} />
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowProfileEdit(false)} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#2D1F08', color: 'white', fontWeight: 900, marginTop: '10px', border: 'none', cursor: 'pointer' }}>저장 완료</motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 🔗 Connection Section */}
      <div className="settings-section">
        <h3 className="settings-section-title">연결 및 통합</h3>
        <SettingsItem icon={<Users size={18} />} label="배우자 연결 관리 (코드 공유)" onClick={() => setShowConnectSet(true)} />
        <SettingsItem icon={<Smartphone size={18} />} label="기기 알림 통합 설정" />
      </div>

      {/* 🔔 Notifications Section */}
      <div className="settings-section">
        <h3 className="settings-section-title">알림 설정</h3>
        <SettingsToggle icon="🚦" label="감정신호 실방 알림" active={notifSignal} onToggle={() => setNotifSignal(!notifSignal)} />
        <SettingsToggle icon="💬" label="대화 카드 도착 알림" active={notifCard} onToggle={() => setNotifCard(!notifCard)} />
        <SettingsToggle icon="🙏" label="가정예배 시간 알림" active={notifWorship} onToggle={() => setNotifWorship(!notifWorship)} />
        <SettingsToggle icon="💖" label="하티 데일리 원포인트" active={notifHatti} onToggle={() => setNotifHatti(!notifHatti)} />
      </div>

      {/* 🎨 Customization Section */}
      <div className="settings-section">
        <h3 className="settings-section-title">개인화</h3>
        <SettingsItem icon={<Calendar size={18} />} label="가정예배 주기 설정" onClick={() => setShowWorshipSet(true)} />
        <SettingsItem icon={<Heart size={18} />} label="우리만의 기념일 추가" onClick={() => setShowAnnivSet(true)} />
      </div>

      {/* 🏛️ Data & Legal */}
      <div className="settings-section">
        <h3 className="settings-section-title">시스템</h3>
        <SettingsItem icon={<BarChart3 size={18} />} label="월간 관계 리포트 보기" onClick={onReportClick} />
        <SettingsItem icon={<Share2 size={18} />} label="우리 기록 백업하기 (PDF)" onClick={() => setShowExport(true)} />
        <SettingsItem icon={<Info size={18} />} label="하트싱크 사용 가이드 (기능 설명)" onClick={onGuideClick} />
        <SettingsItem icon={<Lock size={18} />} label="데이터 보안 설정" onClick={() => setShowDataSecurity(true)} />
      </div>

      <div style={{ padding: '0 20px', marginTop: '10px' }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if(window.confirm("모든 데이터가 초기화되고 로그아웃됩니다. 계속하시겠습니까?")) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          style={{ width: '100%', padding: '16px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', fontWeight: 800, border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer' }}
        >
          데이터 초기화 및 로그아웃
        </motion.button>
      </div>

      {/* --- Addition Modals --- */}
      {/* 1. Worship Settings Modal */}
      {showWorshipSet && (
        <div 
          onClick={() => setShowWorshipSet(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', borderRadius: '32px', padding: '30px', width: '100%', maxWidth: '340px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08', marginBottom: '20px', textAlign: 'center' }}>가정예배 주기 설정</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#8B7355', display: 'block', marginBottom: '10px' }}>예배 요일 선택</label>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between' }}>
                  {['일','월','화','수','목','금','토'].map(d => (
                    <button 
                      key={d} 
                      onClick={() => worshipDays.includes(d) ? setWorshipDays(worshipDays.filter(x => x !== d)) : setWorshipDays([...worshipDays, d])}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', background: worshipDays.includes(d) ? '#2D1F08' : '#F3F4F6', color: worshipDays.includes(d) ? 'white' : '#4B5563', fontSize: '12px', fontWeight: 900, border: 'none', cursor: 'pointer' }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#8B7355', display: 'block', marginBottom: '6px' }}>예배 시간</label>
                <input type="time" value={worshipTime} onChange={(e) => setWorshipTime(e.target.value)} style={{ width: '100%', padding: '12px 18px', borderRadius: '14px', background: '#F9FAFB', border: '1px solid #EEE' }} />
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowWorshipSet(false)} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#2D1F08', color: 'white', fontWeight: 900, border: 'none', cursor: 'pointer' }}>설정 저장</motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 2. Anniversary Manager Modal */}
      {showAnnivSet && (
        <div 
          onClick={() => setShowAnnivSet(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', borderRadius: '32px', padding: '30px', width: '100%', maxWidth: '340px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08', marginBottom: '20px', textAlign: 'center' }}>기념일 관리</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ padding: '20px', background: '#FDFCF0', borderRadius: '20px', border: '1px dashed #F5D060' }}>
                 <input placeholder="기념일 이름 (예: 첫 만남)" value={newAnnivTitle} onChange={(e) => setNewAnnivTitle(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #EEE', marginBottom: '10px', fontSize: '13px' }} />
                 <input type="date" value={newAnnivDate} onChange={(e) => setNewAnnivDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #EEE', marginBottom: '12px', fontSize: '13px' }} />
                 <motion.button whileTap={{ scale: 0.95 }} onClick={addAnniversary} style={{ width: '100%', padding: '10px', borderRadius: '12px', background: '#F5D060', color: 'white', fontWeight: 900, fontSize: '13px', border: 'none', cursor: 'pointer' }}>추가하기</motion.button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {anniversaries.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F9FAFB', borderRadius: '14px', border: '1px solid #EEE' }}>
                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontSize: '14px', fontWeight: 700, color: '#2D1F08' }}>{a.title}</span>
                       <span style={{ fontSize: '11px', color: '#8B7355', fontWeight: 600 }}>{a.date}</span>
                     </div>
                     <button 
                       onClick={() => setAnniversaries(prev => prev.filter(x => x.id !== a.id))} 
                       style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}
                     >
                       <Trash2 size={16} />
                     </button>
                  </div>
                ))}
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAnnivSet(false)} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1.5px solid #EEE', color: '#2D1F08', fontWeight: 900, marginTop: '10px', background: 'white', cursor: 'pointer' }}>닫기</motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 3. Export Modal */}
      {showExport && (
        <div 
          onClick={() => setShowExport(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', borderRadius: '32px', padding: '30px', width: '100%', maxWidth: '340px', textAlign: 'center' }}>
            <div style={{ width: '70px', height: '70px', background: '#EEF2FF', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Share2 size={30} color="#4F46E5" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08', marginBottom: '12px' }}>우리 부부 역사책 생성</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, marginBottom: '25px', wordBreak: 'keep-all' }}>
              지금까지 나눈 기록들을 PDF 파일로 예쁘게 정리해 드릴까요?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
               <motion.button whileTap={{ scale: 0.95 }} onClick={() => { alert('PDF 생성이 시작되었습니다. 잠시만 기다려주세요!'); setShowExport(false); }} style={{ width: '100%', padding: '18px', borderRadius: '18px', background: '#4F46E5', color: 'white', fontWeight: 900, border: 'none', cursor: 'pointer' }}>PDF로 저장하기</motion.button>
               <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowExport(false)} style={{ width: '100%', padding: '16px', borderRadius: '18px', background: '#F3F4F6', color: '#4B5563', fontWeight: 800, border: 'none', cursor: 'pointer' }}>취소</motion.button>
            </div>
          </motion.div>
        </div>
      )}


      {/* 5. Connection Info Modal */}
      {showConnectSet && (
        <div 
          onClick={() => setShowConnectSet(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', borderRadius: '32px', padding: '30px', width: '100%', maxWidth: '340px', textAlign: 'center' }}>
             <div style={{ width: '70px', height: '70px', background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Users size={32} color="#15803D" />
             </div>
             <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08', marginBottom: '8px' }}>배우자와 연결된 상태입니다</h3>
             <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '25px' }}>현재 안정적으로 데이터를 공유하고 있어요.</p>
             <div style={{ padding: '20px', background: '#F9FAFB', borderRadius: '20px', border: '1.5px dashed #CCC', marginBottom: '25px' }}>
                <span style={{ fontSize: '11px', color: '#8B7355', fontWeight: 800, display: 'block', marginBottom: '5px' }}>우리 부부의 연결 코드</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#2D1F08', letterSpacing: '4px' }}>HS-7289</span>
             </div>
             <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowConnectSet(false)} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#2D1F08', color: 'white', fontWeight: 900, border: 'none', cursor: 'pointer' }}>확인</motion.button>
          </motion.div>
        </div>
      )}
      {/* 6. App Info Modal */}
      {showAppInfo && (
        <div 
          onClick={() => setShowAppInfo(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', borderRadius: '32px', padding: '30px', width: '100%', maxWidth: '340px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '60px', height: '60px', background: '#F3F4F6', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                <Info size={30} color="#2D1F08" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08' }}>Heart Sync</h3>
              <p style={{ fontSize: '12px', color: '#8B7355', fontWeight: 600 }}>Version 2.1.0 (Stable)</p>
            </div>
            <div style={{ background: '#F9FAFB', padding: '15px', borderRadius: '18px', fontSize: '13px', color: '#4B5563', lineHeight: 1.6, marginBottom: '20px' }}>
              부부신호등은 부부의 영적, 정서적 교감을 돕기 위해 제작되었습니다. 모든 기록은 암호화되어 안전하게 보관됩니다.
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAppInfo(false)} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#2D1F08', color: 'white', fontWeight: 900, border: 'none', cursor: 'pointer' }}>확인</motion.button>
          </motion.div>
        </div>
      )}

      {/* 7. Data Security Modal */}
      {showDataSecurity && (
        <div 
          onClick={() => setShowDataSecurity(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', borderRadius: '32px', padding: '30px', width: '100%', maxWidth: '340px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '60px', height: '60px', background: '#F0F9FF', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                <Lock size={30} color="#0369A1" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08' }}>보안 및 개인정보</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                 <span style={{ fontSize: '14px', fontWeight: 800, color: '#2D1F08' }}>기기 로컬 암호 잠금</span>
                 <div style={{ width: '40px', height: '22px', background: '#E5E7EB', borderRadius: '100px', cursor: 'pointer' }} />
               </div>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                 <span style={{ fontSize: '14px', fontWeight: 800, color: '#2D1F08' }}>종단간 암호화 적용</span>
                 <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 900 }}>적용됨</span>
               </div>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowDataSecurity(false)} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#2D1F08', color: 'white', fontWeight: 900, border: 'none', cursor: 'pointer' }}>저장 및 닫기</motion.button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};



/* 🚀 Onboarding View (First Time Experience) */
const OnboardingView = ({ userRole, setUserRole, onFinish }) => {
  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState("");
  const [blood, setBlood] = useState("A");
  const [mDate, setMDate] = useState("2020-05-23");
  const [insightResult, setInsightResult] = useState("");
  const [insightAnswers, setInsightAnswers] = useState({ e: null, s: null, t: null, j: null });

  const insightQuestions = [
    { key: 'e', title: '에너지 충전 방식', q: '지친 하루의 끝, 당신의 충전법은?', a1: 'E (밖에서 활기차게)', a2: 'I (혼자 조용히)' },
    { key: 's', title: '인식의 차이', q: '문제를 바라볼 때 당신의 시선은?', a1: 'S (현재의 구체적 사실)', a2: 'N (미래와 가능성)' },
    { key: 't', title: '판단의 기준', q: '배우자와의 갈등 상황, 당신의 우선순위는?', a1: 'T (공정함과 해결책)', a2: 'F (따뜻한 공감과 감정)' },
    { key: 'j', title: '생활의 스타일', q: '이번 주 주말 여행, 당신의 스타일은?', a1: 'J (미리 짜둔 시간표대로)', a2: 'P (그때그때 기분 따라)' },
  ];

  const calculateInsight = () => {
    const res = (insightAnswers.e || 'I') + (insightAnswers.s || 'S') + (insightAnswers.t || 'F') + (insightAnswers.j || 'P');
    setInsightResult(res);
    setStep(4);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        width: '100%', 
        backgroundColor: 'white', 
        padding: '60px 30px 40px',
        position: 'fixed',
        inset: 0,
        zIndex: 5000,
        overflowY: 'auto'
      }}
    >
      {step > 1 && step < 4 && (
        <button 
          onClick={() => setStep(step - 1)}
          style={{ position: 'absolute', top: '15px', left: '15px', display: 'flex', alignItems: 'center', gap: '5px', padding: '10px', background: 'none', border: 'none', color: '#8B7355', fontWeight: 700, fontSize: '14px', zIndex: 10 }}
        >
          <ChevronLeft size={20} /> 뒤로
        </button>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
            <div style={{ marginBottom: '40px', textAlign: 'left', paddingLeft: '10px' }}>
              <img 
                src="/logo_main.png" 
                alt="Heart Logo" 
                style={{ width: '180px', height: 'auto', marginTop: '-20px', marginBottom: '-55px', marginLeft: '-25px', transform: 'scale(1.1)' }}
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
              <p style={{ fontSize: '13px', color: '#B08D3E', fontWeight: 900, letterSpacing: '2px', marginBottom: '4px' }}>부부의 마음을 이어드립니다</p>
              <h1 className="brand-text" style={{ fontSize: '32px', letterSpacing: '6px', color: '#D4AF37', fontWeight: 900, marginBottom: '2px' }}>HEART SYNC</h1>
              <p style={{ fontSize: '11px', color: '#D4AF37', fontWeight: 800, letterSpacing: '3px', marginBottom: '30px', opacity: 0.8 }}>MORE DEEP, MORE CLOSE</p>
              
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#2D1F08', marginBottom: '12px', lineHeight: 1.4, wordBreak: 'keep-all' }}>
                Heart Sync에 오신 여러분을<br/>
                환영합니다.
              </h2>
              <p style={{ color: '#8B7355', fontSize: '15px', fontWeight: 600 }}>당신의 정보를 입력해주세요</p>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => { setUserRole('husband'); setStep(2); }} 
                style={{ flex: 1, padding: '30px 15px', borderRadius: '30px', background: '#FDFCF0', border: '2px solid #F5D060', fontSize: '18px', fontWeight: 900, color: '#2D1F08', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}
              >
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', background: 'white' }}>
                  <img src="/husband.png" alt="Husband" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                남편입니다
              </button>
              <button 
                onClick={() => { setUserRole('wife'); setStep(2); }} 
                style={{ flex: 1, padding: '30px 15px', borderRadius: '30px', background: '#FDFCF0', border: '2px solid #F5D060', fontSize: '18px', fontWeight: 900, color: '#2D1F08', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}
              >
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', background: 'white' }}>
                  <img src="/wife.png" alt="Wife" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                아내입니다
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex flex-col h-full justify-center">
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#2D1F08', marginBottom: '10px' }}>당신의 정보를 입력해주세요</h2>
            <p style={{ color: '#8B7355', fontSize: '14px', marginBottom: '40px', fontWeight: 600 }}>부부신호등이 두 분의 성향에 맞춰 안내해 드릴게요.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#B08D3E', display: 'block', marginBottom: '8px' }}>앱에서 불릴 이름/애칭</label>
                <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="예: 사랑꾼 남편" style={{ width: '100%', padding: '16px 22px', borderRadius: '18px', border: '1.5px solid #EEE', background: '#F9FAFB', fontSize: '16px' }} />
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#B08D3E', display: 'block', marginBottom: '8px' }}>결혼기념일</label>
                  <input type="date" value={mDate} onChange={(e) => setMDate(e.target.value)} style={{ width: '100%', padding: '16px 22px', borderRadius: '18px', border: '1.5px solid #EEE', background: '#F9FAFB', fontSize: '16px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#B08D3E', display: 'block', marginBottom: '8px' }}>혈액형</label>
                  <select value={blood} onChange={(e) => setBlood(e.target.value)} style={{ width: '100%', padding: '16px 15px', borderRadius: '18px', border: '1.5px solid #EEE', background: '#F9FAFB', fontSize: '16px', appearance: 'none' }}>
                    <option value="A">A형</option>
                    <option value="B">B형</option>
                    <option value="O">O형</option>
                    <option value="AB">AB형</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={() => nickname && setStep(3)}
                style={{ marginTop: '20px', padding: '18px', borderRadius: '20px', background: '#2D1F08', color: 'white', fontWeight: 900, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                다음으로 <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex flex-col h-full py-10">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
               <Fingerprint size={24} color="#8A60FF" />
               <span style={{ fontSize: '12px', fontWeight: 900, color: '#8A60FF' }}>하티 인사이트 (성격 진단)</span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#2D1F08', marginBottom: '15px', lineHeight: 1.4 }}>나의 관계 기질은 어떤가요?</h2>
            <p style={{ color: '#8B7355', fontSize: '14px', marginBottom: '30px', fontWeight: 600 }}>4개의 질문으로 배우자와의 소통 방식을 확인해보세요.</p>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {insightQuestions.map((iq) => (
                <div key={iq.key}>
                  <p style={{ fontSize: '14px', fontWeight: 900, color: '#2D1F08', marginBottom: '12px' }}>{iq.title}: {iq.q}</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => setInsightAnswers(prev => ({ ...prev, [iq.key]: iq.a1.charAt(0) }))}
                      style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1.5px solid #EEE', background: insightAnswers[iq.key] === iq.a1.charAt(0) ? '#8A60FF' : 'white', color: insightAnswers[iq.key] === iq.a1.charAt(0) ? 'white' : '#717171', fontSize: '13px', fontWeight: 800, transition: '0.2s' }}
                    >
                      {iq.a1}
                    </button>
                    <button 
                      onClick={() => setInsightAnswers(prev => ({ ...prev, [iq.key]: iq.a2.charAt(0) }))}
                      style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1.5px solid #EEE', background: insightAnswers[iq.key] === iq.a2.charAt(0) ? '#8A60FF' : 'white', color: insightAnswers[iq.key] === iq.a2.charAt(0) ? 'white' : '#717171', fontSize: '13px', fontWeight: 800, transition: '0.2s' }}
                    >
                      {iq.a2}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => Object.values(insightAnswers).every(v => v !== null) && calculateInsight()}
              style={{ marginTop: '30px', padding: '18px', borderRadius: '20px', background: '#8A60FF', color: 'white', fontWeight: 900, fontSize: '16px', boxShadow: '0 8px 20px rgba(138, 96, 255, 0.3)' }}
            >
              성격 진단 완료하기
            </button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col h-full justify-center items-center text-center">
            <div style={{ width: '100px', height: '100px', background: '#F5D060', borderRadius: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px', boxShadow: '0 10px 25px rgba(245, 208, 96, 0.2)' }}>
              <span style={{ fontSize: '40px' }}>💝</span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#2D1F08', marginBottom: '10px' }}>준비가 끝났습니다!</h2>
            <p style={{ color: '#8B7355', fontSize: '15px', fontWeight: 700, marginBottom: '30px' }}>당신의 기질은 <span style={{ color: '#8A60FF' }}>{insightResult}</span>입니다.<br/>이제 배우자와 연결을 시작할까요?</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
              <button 
                onClick={() => {
                  const newCode = 'HS-' + Math.floor(1000 + Math.random() * 9000);
                  setCoupleCode(newCode);
                  setStep(5); // Show created code
                }}
                style={{ width: '100%', padding: '18px', borderRadius: '20px', background: '#2D1F08', color: 'white', fontWeight: 900, fontSize: '16px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
              >
                새로운 초대 코드 만들기
              </button>
              <button 
                onClick={() => setStep(6)}
                style={{ width: '100%', padding: '18px', borderRadius: '20px', background: '#FDFCF0', border: '2.5px solid #F5D060', color: '#2D1F08', fontWeight: 900, fontSize: '16px' }}
              >
                초대 코드 입력하기
              </button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step5" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col h-full justify-center items-center text-center">
             <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#2D1F08', marginBottom: '15px' }}>배우자에게 코드를 공유하세요</h2>
             <div style={{ width: '100%', padding: '30px', background: '#F9FAFB', borderRadius: '24px', border: '2px dashed #D4AF37', marginBottom: '30px' }}>
                <span style={{ fontSize: '12px', fontWeight: 900, color: '#B08D3E', display: 'block', marginBottom: '10px' }}>우리만의 소중한 연결 코드</span>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#2D1F08', letterSpacing: '8px' }}>{coupleCode}</div>
             </div>
             <p style={{ color: '#8B7355', fontSize: '14px', marginBottom: '30px', fontWeight: 600, lineHeight: 1.6 }}>배우자가 앱을 설치하고<br/>이 코드를 입력하면 실시간 연결이 완료됩니다.</p>
             <button 
              onClick={() => onFinish({ nickname, mDate, mbti: insightResult, blood, coupleCode })}
              style={{ width: '100%', padding: '18px', borderRadius: '20px', background: '#2D1F08', color: 'white', fontWeight: 900, fontSize: '16px' }}
            >
              연결 대기하며 시작하기
            </button>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div key="step6" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col h-full justify-center">
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#2D1F08', marginBottom: '15px' }}>초대 코드를 입력해주세요</h2>
            <input 
              placeholder="예: HS-1234" 
              onChange={(e) => setCoupleCode(e.target.value.toUpperCase())}
              style={{ width: '100%', padding: '20px', borderRadius: '20px', border: '2px solid #F5D060', fontSize: '20px', fontWeight: 900, textAlign: 'center', letterSpacing: '4px', marginBottom: '25px' }} 
            />
            {coupleCode && coupleCode.startsWith('HS-') && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginBottom: '25px' }}>
                <div className="flex items-center justify-center gap-2" style={{ color: '#8A60FF', fontWeight: 900 }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <RefreshCw size={18} />
                  </motion.div>
                  하트싱크 연결 중...
                </div>
              </motion.div>
            )}
            <button 
              onClick={() => coupleCode && onFinish({ nickname, mDate, mbti: insightResult, blood, coupleCode })}
              disabled={!coupleCode || !coupleCode.startsWith('HS-')}
              style={{ width: '100%', padding: '18px', borderRadius: '20px', background: coupleCode && coupleCode.startsWith('HS-') ? '#2D1F08' : '#CCC', color: 'white', fontWeight: 900, fontSize: '16px' }}
            >
              연결 완료하기
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};



const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  // App Global States
  const [isSetupDone, setIsSetupDone] = useState(() => localStorage.getItem('isSetupDone') === 'true');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'husband');
  const [coupleCode, setCoupleCode] = useState(() => localStorage.getItem('coupleCode') || 'HS-7289');
  const [husbandInfo, setHusbandInfo] = useState(() => JSON.parse(localStorage.getItem('husbandInfo') || '{"nickname":"김남편", "mbti":"ISTJ", "blood":"A", "marriageDate":"2020-05-23"}'));
  const [wifeInfo, setWifeInfo] = useState(() => JSON.parse(localStorage.getItem('wifeInfo') || '{"nickname":"박아내", "mbti":"ENFP", "blood":"B", "marriageDate":"2020-05-23"}'));
  const appTheme = { id: 'warm', primary: '#D4AF37', bg: '#FDFCF0' };
  
  const partnerLabel = userRole === 'husband' ? '아내' : '남편';
  const [intimacyBg, setIntimacyBg] = useState(localStorage.getItem('intimacyBg') || null);
  const [intimacySubPage, setIntimacySubPage] = useState('main');
  const [counselingMode, setCounselingMode] = useState('chat'); // 'chat' or 'solution'
  const [showReport, setShowReport] = useState(false);
  const [showGuidePage, setShowGuidePage] = useState(false);
  
  const [mySignal, setMySignal] = useState('green');
  const [spouseSignal, setSpouseSignal] = useState('green');
  const [schedules, setSchedules] = useState(() => JSON.parse(localStorage.getItem('coupleSchedules') || '[]'));
  const [partnerPrayers, setPartnerPrayers] = useState([]);
  
  // Persistence
  useEffect(() => {
    localStorage.setItem('husbandInfo', JSON.stringify(husbandInfo));
    localStorage.setItem('wifeInfo', JSON.stringify(wifeInfo));
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('isSetupDone', isSetupDone);
    localStorage.setItem('coupleSchedules', JSON.stringify(schedules));
  }, [husbandInfo, wifeInfo, userRole, isSetupDone, schedules]);

  const handleOnboardingFinish = (info) => {
    if (userRole === 'husband') setHusbandInfo(prev => ({ ...prev, ...info }));
    else setWifeInfo(prev => ({ ...prev, ...info }));
    setIsSetupDone(true);
  };

  const addSchedule = (s) => setSchedules([...schedules, s]);
  const deleteSchedule = (id) => setSchedules(schedules.filter(s => s.id !== id));
  
  // Supabase Real-time Sync
  useEffect(() => {
    // 1. Initial Data Fetch
    const fetchInitialData = async () => {
      // Fetch Signals
      const { data: signalData } = await supabase
        .from('signals')
        .select('*')
        .eq('couple_id', coupleCode);
      
      if (signalData) {
        const mySignalRow = signalData.find(s => s.user_role === userRole);
        const spouseSignalRow = signalData.find(s => s.user_role !== userRole);
        if (mySignalRow) setMySignal(mySignalRow.signal);
        if (spouseSignalRow) setSpouseSignal(spouseSignalRow.signal);
      }

      // Fetch Prayers
      const { data: prayerData } = await supabase
        .from('prayers')
        .select('*')
        .eq('couple_id', coupleCode)
        .order('created_at', { ascending: false });
      
      if (prayerData) {
        setPartnerPrayers(prayerData.filter(p => p.user_role !== userRole));
      }
    };

    fetchInitialData();

    // 2. Real-time Subscription
    const channel = supabase
      .channel('realtime-couple-data')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'signals',
        filter: `couple_id=eq.${coupleCode}` 
      }, payload => {
        const { user_role: role, signal } = payload.new;
        if (role !== userRole) setSpouseSignal(signal);
        else setMySignal(signal);
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'prayers',
        filter: `couple_id=eq.${coupleCode}`
      }, payload => {
        if (payload.new.user_role !== userRole) {
          setPartnerPrayers(prev => [payload.new, ...prev]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole]);

  // Update My Signal to Supabase
  const handleSetMySignal = async (newSignal) => {
    setMySignal(newSignal);
    await supabase.from('signals').upsert({
      couple_id: coupleCode,
      user_role: userRole,
      signal: newSignal,
      updated_at: new Date().toISOString()
    }, { onConflict: 'couple_id,user_role' });
  };

  return (
    <div className="h-full flex flex-col relative w-full" style={{ '--gold': appTheme.primary, '--gold-glow': `${appTheme.primary}40` }}>
      {!isSetupDone && (
        <OnboardingView 
          userRole={userRole} 
          setUserRole={setUserRole} 
          onFinish={handleOnboardingFinish} 
        />
      )}

      {isSetupDone && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '100%', pointerEvents: 'none', zIndex: -1, background: `radial-gradient(circle at 50% -20%, ${appTheme.primary}15, transparent)` }} />
      )}
      
      {isSetupDone && (
        <>
          <div className="app-bg" style={{ 
            backgroundColor: appTheme.bg,
            backgroundImage: `
              radial-gradient(circle at 10% 10%, ${appTheme.primary}15, transparent 40%),
              radial-gradient(circle at 90% 90%, ${appTheme.primary}20, transparent 40%),
              url('/bg.png')
            `,
            backgroundBlendMode: 'overlay',
            opacity: 1,
            zIndex: -1
          }} />
          
          {/* Top Bar */}
          <div className="top-bar" style={{ 
            visibility: activeTab === 'intimacy' ? 'hidden' : 'visible',
            borderBottom: `1px solid ${appTheme.primary}20`,
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ width: '24px' }} />
            <div className="top-bar-icons">
              <Bell size={22} color={appTheme.primary} style={{ opacity: 0.7 }} />
              <button 
                onClick={() => setActiveTab('settings')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                <Settings size={22} color={appTheme.primary} style={{ opacity: 0.7 }} />
              </button>
            </div>
          </div>

          <main className="main-content">
            <AnimatePresence mode="wait">
              {activeTab === 'home' && (
                <HomeView 
                  key="home"
                  userRole={userRole}
                  coupleCode={coupleCode}
                  mySignal={mySignal} 
                  setMySignal={handleSetMySignal}
                  spouseSignal={spouseSignal}
                  partnerPrayers={partnerPrayers}
                  onIntimacyClick={() => setActiveTab('intimacy')}
                  onNav={(tab) => setActiveTab(tab)}
                  schedules={schedules}
                />
              )}
              {activeTab === 'calendar' && (
                <CalendarView 
                  key="calendar" 
                  schedules={schedules} 
                  onAddSchedule={addSchedule} 
                  onDeleteSchedule={deleteSchedule} 
                  onBack={() => setActiveTab('home')} 
                />
              )}
              {activeTab === 'cardGame' && (
                <CardGameView key="cardGame" onBack={() => setActiveTab('home')} />
              )}
              {activeTab === 'counseling' && (
                 <div className={`flex flex-col pt-4 ${counselingMode === 'chat' ? 'h-full' : ''}`}>
                   {/* 💊 AI Hatti Sub-Navigation (Chat vs Solution) */}
                   <div className="flex justify-center mb-4">
                     <div style={{ 
                       display: 'flex', 
                       background: 'rgba(0,0,0,0.05)', 
                       borderRadius: '100px', 
                       padding: '4px',
                       border: '1px solid rgba(0,0,0,0.03)'
                     }}>
                       <button 
                         onClick={() => setCounselingMode('chat')}
                         style={{ 
                           padding: '8px 20px', 
                           borderRadius: '100px', 
                           fontSize: '13px', 
                           fontWeight: 900,
                           background: counselingMode === 'chat' ? 'white' : 'transparent',
                           color: counselingMode === 'chat' ? '#8A60FF' : '#8B7355',
                           boxShadow: counselingMode === 'chat' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                           transition: '0.3s'
                         }}
                       >
                         AI 고민상담
                       </button>
                       <button 
                         onClick={() => setCounselingMode('solution')}
                         style={{ 
                           padding: '8px 20px', 
                           borderRadius: '100px', 
                           fontSize: '13px', 
                           fontWeight: 900,
                           background: counselingMode === 'solution' ? 'white' : 'transparent',
                           color: counselingMode === 'solution' ? '#8A60FF' : '#8B7355',
                           boxShadow: counselingMode === 'solution' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                           transition: '0.3s'
                         }}
                       >
                         매월 관계 솔루션
                       </button>
                     </div>
                   </div>
                   {counselingMode === 'chat' ? (
                     <ChatView key="chat" userRole={userRole} husbandInfo={husbandInfo} wifeInfo={wifeInfo} onBack={() => setActiveTab('home')} />
                   ) : (
                     <SolutionView key="solution" onBack={() => setCounselingMode('chat')} />
                   )}
                 </div>
              )}
              {activeTab === 'worship' && (
                <WorshipView key="worship" userRole={userRole} coupleCode={coupleCode} />
              )}
              {activeTab === 'settings' && (
                <SettingsView 
                  key="settings" 
                  userRole={userRole}
                  husbandInfo={husbandInfo}
                  setHusbandInfo={setHusbandInfo}
                  wifeInfo={wifeInfo}
                  setWifeInfo={setWifeInfo}
                  onReportClick={() => setShowReport(true)} 
                  onGuideClick={() => setShowGuidePage(true)}
                />
              )}
              {activeTab === 'intimacy' && (
                <IntimacyModal 
                  key="intimacy"
                  show={true} 
                  onClose={() => setActiveTab('home')}
                  onNav={setActiveTab}
                  subPage={intimacySubPage}
                  setSubPage={setIntimacySubPage}
                  bgImage={intimacyBg}
                  onBgUpload={setIntimacyBg}
                  partnerLabel={partnerLabel}
                  isFullPage={true}
                />
              )}
            </AnimatePresence>
          </main>

          {/* Luxury Bottom Nav - 5 Tabs Redesigned */}
          <nav className="bottom-nav">
            <NavItem 
              active={activeTab === 'cardGame'} 
              onClick={() => setActiveTab('cardGame')} 
              icon={<MessageSquare size={22} fill={activeTab === 'cardGame' ? appTheme.primary : "none"} color={activeTab === 'cardGame' ? appTheme.primary : undefined} />} 
              label="대화카드" 
            />
            <NavItem 
              active={activeTab === 'counseling'} 
              onClick={() => setActiveTab('counseling')} 
              icon={<Sparkles size={22} fill={activeTab === 'counseling' ? appTheme.primary : "none"} color={activeTab === 'counseling' ? appTheme.primary : undefined} />} 
              label="AI상담/솔루션" 
            />
            <NavItem 
              active={activeTab === 'home'} 
              onClick={() => setActiveTab('home')} 
              icon={<Home size={22} fill={activeTab === 'home' ? appTheme.primary : "none"} color={activeTab === 'home' ? appTheme.primary : undefined} />} 
              label="홈" 
            />
            <NavItem 
              active={activeTab === 'worship'} 
              onClick={() => setActiveTab('worship')} 
              icon={<BookOpen size={22} fill={activeTab === 'worship' ? appTheme.primary : "none"} color={activeTab === 'worship' ? appTheme.primary : undefined} />} 
              label="가정예배" 
            />
            <NavItem 
              active={activeTab === 'intimacy'} 
              onClick={() => setActiveTab('intimacy')} 
              icon={<Heart size={22} fill={activeTab === 'intimacy' ? appTheme.primary : "none"} color={activeTab === 'intimacy' ? appTheme.primary : undefined} />} 
              label="비밀화원" 
            />
          </nav>
        </>
      )}

      {/* 📊 Full Screen Relationship Report Overlay */}
      <AnimatePresence>
        {showReport && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ 
              position: 'fixed', 
              inset: 0, 
              zIndex: 9999, 
              background: '#FDFCF0', 
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div style={{ minHeight: '100%', paddingBottom: '50px' }}>
              <SolutionView onBack={() => setShowReport(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📘 Full Screen App Guide Overlay */}
      <AnimatePresence>
        {showGuidePage && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ 
              position: 'fixed', 
              inset: 0, 
              zIndex: 9999, 
              background: '#FDFCF0', 
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <AppGuideView onBack={() => setShowGuidePage(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;



