import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  BookOpen, 
  Zap, 
  Lock, 
  Heart, 
  Smile, 
  Bell, 
  Settings 
} from 'lucide-react';
import HattiCharacter from '../ui/HattiCharacter';
import { CARD_DATA } from '../game/CardGameView';

const SignalOptV2 = ({ title, desc }) => (
  <div style={{ 
    padding: '22px 20px', 
    background: 'white', 
    borderRadius: '24px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '4px',
    border: '1.5px solid rgba(212, 175, 55, 0.15)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
  }}>
    <span style={{ fontSize: '15.5px', fontWeight: 900, color: '#2D1F08' }}>{title}</span>
    <span style={{ fontSize: '12px', color: '#8B7355', fontWeight: 700, opacity: 0.8 }}>{desc}</span>
  </div>
);

const IntimacyModal = ({ user, show, onClose, subPage, setSubPage, bgImage, onBgUpload, partnerLabel, userRole, coupleCode, supabase, mainChannel, isFullPage, onNav, embedded = false, setHusbandInfo, setWifeInfo, husbandInfo, wifeInfo, myInfo, onUpdateProfile, setShowNotificationList }) => {
  const [currentSecretIdx, setCurrentSecretIdx] = useState(0);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]); 
  const [myAnswerInput, setMyAnswerInput] = useState('');
  const [spouseStatus, setSpouseStatus] = useState('none'); 
  const [isTopicFinished, setIsTopicFinished] = useState(false);
  const [randomMoods, setRandomMoods] = useState([]); 
  const chatEndRef = useRef(null);
  const lastGardenNavIdRef = useRef(null); 

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
    { title: "🤫 오늘은 둘만의 비밀 대이트?", desc: "아이들/일은 잠시 잊고 연애 초기로 돌아가 볼까요?" },
  ], []);

  useEffect(() => {
    if (show) {
      const shuffled = [...moodPool].sort(() => 0.5 - Math.random());
      setRandomMoods(shuffled.slice(0, 5));
    }
  }, [show, moodPool]);
  
  const secretQuestions = useMemo(() => 
    (CARD_DATA || []).filter(q => q.category === '시크릿'), []
  );

  useEffect(() => {
    if (!show) return;
    
    const syncLatest = async () => {
        const { data } = await supabase.from('profiles').select('info, id').eq('couple_id', coupleCode);
        if (data) {
          const partner = data.find(p => p.id !== user.id);
          if (partner?.info?.gardenNavId && partner.info.gardenNavId !== lastGardenNavIdRef.current) {
            lastGardenNavIdRef.current = partner.info.gardenNavId;
            const msg = { 
              id: partner.info.gardenNavId, 
              text: partner.info.gardenMsg, 
              sender: 'partner', 
              type: partner.info.gardenMsgType || 'chat', 
              time: partner.info.gardenTime || '방금 전' 
            };
            setMessages(prev => {
              if (prev.some(m => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        }
    };
    syncLatest();

    const handleIncoming = (e) => {
      const payload = e.detail;
      if (payload.sender !== userRole) {
          const partnerMsg = { 
            id: Date.now(), 
            text: payload.text, 
            sender: 'partner', 
            type: payload.msgType || 'chat', 
            time: payload.time 
          };
          setMessages(prev => [...prev, partnerMsg]);
          setSpouseStatus('done');
      }
    };

    const handleReset = () => {
      setMessages([]);
      setIsTopicFinished(false);
    };

    window.addEventListener('garden-incoming-msg', handleIncoming);
    window.addEventListener('garden-chat-reset', handleReset);
    return () => {
      window.removeEventListener('garden-incoming-msg', handleIncoming);
      window.removeEventListener('garden-chat-reset', handleReset);
    };
  }, [show, userRole, coupleCode, supabase, user.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    const gardenNavId = Date.now();
    const newMsg = { id: gardenNavId, text: q, sender: 'me', type: 'question', time: getTime() };
    setMessages([newMsg]);
    setSpouseStatus('typing');
    
    if (mainChannel) {
      mainChannel.send({
        type: 'broadcast',
        event: 'garden-chat-sent',
        payload: { text: q, sender: userRole, time: getTime(), msgType: 'question', gardenNavId }
      });
    }

    if (onUpdateProfile) {
       onUpdateProfile(undefined, { gardenMsg: q, gardenMsgType: 'question', gardenNavId, gardenTime: getTime() });
    }
    
    setTimeout(() => setSpouseStatus('done'), 2000);
  };

  const handleSendChat = () => {
    if (!inputText.trim()) return;
    const gardenNavId = Date.now();
    const userMsg = { id: gardenNavId, text: inputText, sender: 'me', type: 'chat', time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    
    if (mainChannel) {
      mainChannel.send({ 
        type: 'broadcast', 
        event: 'garden-chat-sent', 
        payload: { text: inputText, sender: userRole, time: getTime(), msgType: 'chat', gardenNavId } 
      });
    }
    
    if (onUpdateProfile) {
       onUpdateProfile(undefined, { gardenMsg: inputText, gardenMsgType: 'chat', gardenNavId, gardenTime: getTime() });
    }

    setInputText('');
    setSpouseStatus('done');
  };

  const handleAnswerSubmit = () => {
    if (!myAnswerInput.trim()) return;
    const gardenNavId = Date.now();
    const answerMsg = { id: gardenNavId, text: myAnswerInput, sender: 'me', type: 'answer', time: getTime() };
    setMessages(prev => [...prev, answerMsg]);
    
    if (mainChannel) {
      mainChannel.send({
        type: 'broadcast',
        event: 'garden-chat-sent',
        payload: { text: myAnswerInput, sender: userRole, time: getTime(), msgType: 'answer', gardenNavId }
      });
    }

    if (onUpdateProfile) {
       onUpdateProfile(undefined, { gardenMsg: myAnswerInput, gardenMsgType: 'answer', gardenNavId, gardenTime: getTime() });
    }

    setMyAnswerInput('');
    setIsTopicFinished(true);
  };

  const handleResetChat = async () => {
    if (!window.confirm("대화 내용을 초기화하고 새로운 대화를 시작하시겠습니까?")) return;
    
    if (mainChannel) {
      mainChannel.send({ type: 'broadcast', event: 'garden-chat-reset' });
    }

    if (onUpdateProfile) {
      await onUpdateProfile(undefined, { gardenMsg: null, gardenMsgType: null, gardenNavId: null, gardenAnswer: null });
    }
    
    setMessages([]);
    setIsTopicFinished(false);
  };

  const currentBg = bgImage || '/garden_bg_premium.png';

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className={isFullPage ? "" : "intimacy-modal-overlay"} 
      onClick={(!isFullPage && !embedded) ? onClose : undefined}
      style={{ 
        position: embedded ? 'relative' : 'absolute', 
        top: 0, left: 0, right: 0, 
        bottom: embedded ? 'auto' : 0, 
        minHeight: embedded ? '600px' : 'auto',
        zIndex: 2000, 
        background: `url(${currentBg}) center center no-repeat`, 
        backgroundSize: 'cover', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        padding: '0', 
        overflow: 'hidden'
      }}
    >
      {!embedded && (
        <div style={{ position: 'absolute', top: '70px', right: '45px', display: 'flex', gap: '18px', zIndex: 2010 }}>
          <Bell 
            size={22} color="rgba(45, 31, 8, 0.4)" style={{ cursor: 'pointer' }}
            onClick={() => setShowNotificationList(true)} 
          />
          <Settings 
            size={22} color="rgba(45, 31, 8, 0.4)" style={{ cursor: 'pointer' }}
            onClick={() => onNav('settings')} 
          />
        </div>
      )}
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          width: '100%',
          flex: embedded ? 'none' : 1,
          height: embedded ? 'auto' : '100%',
          background: subPage === 'secrets' ? '#B2C7DA' : 'rgba(253, 252, 240, 0.96)',
          backdropFilter: 'blur(30px) saturate(180%)', 
          display: 'flex', 
          flexDirection: 'column', 
          position: 'relative', 
          overflow: embedded ? 'visible' : 'hidden',
          border: (subPage === 'secrets' || embedded) ? 'none' : '1.5px solid rgba(212, 175, 55, 0.25)',
          boxShadow: embedded ? 'none' : '0 30px 60px rgba(0,0,0,0.25)'
        }}
      >
        {subPage === 'main' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: embedded ? 'auto' : '100%', padding: embedded ? '20px 24px' : '80px 24px', overflowY: embedded ? 'visible' : 'auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <h2 style={{ 
                background: 'linear-gradient(105deg, #7D5A00 0%, #C8970A 30%, #F5D060 50%, #D4960A 70%, #7D5A00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '32px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.5px' 
              }}>소통의 화원</h2>
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
            
            {!embedded && (
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
            )}
          </div>
        )}

        {subPage === 'secrets' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(178, 199, 218, 0.95)', borderBottom: '1px solid rgba(0,0,0,0.05)', backdropFilter: 'blur(20px)', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div onClick={() => setSubPage('main')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ChevronLeft size={24} color="#2D1F08" /></div>
                <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <Heart size={20} color="#F5D060" fill="#F5D060" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '16px', fontWeight: 900, color: '#2D1F08' }}>소통의 화원</span>
                  <span style={{ fontSize: '10px', color: '#546E7A', fontWeight: 700 }}>{partnerLabel}님과 연결됨</span>
                </div>
              </div>
              <button onClick={handleResetChat} style={{ background: 'none', border: 'none', color: '#2D1F08', opacity: 0.5 }}><RefreshCw size={18} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px 180px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
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

            <div style={{ padding: '12px 16px 110px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(0,0,0,0.05)', flexShrink: 0 }}>
              {messages.length === 0 ? (
                <>
                  <div style={{ background: '#F8F9FA', padding: '12px 16px', borderRadius: '20px', border: '1px solid #E9ECEF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 900, color: '#2D1F08', opacity: 0.6 }}>내 마음을 전하는 시크릿 질문</span>
                      <button onClick={nextSecret} style={{ background: 'none', border: 'none', color: '#0288D1', fontSize: '11px', fontWeight: 800 }}>새로고침</button>
                    </div>
                    <p onClick={handleSendPrompt} style={{ fontSize: '14px', fontWeight: 800, color: '#2D1F08', cursor: 'pointer', lineHeight: 1.4 }}>"{secretQuestions[currentSecretIdx]?.question || '준비된 질문이 없습니다.'}"</p>
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
                     onClick={async () => { 
                       if (mainChannel) {
                         mainChannel.send({
                           type: 'broadcast',
                           event: 'card-game-call',
                           payload: { sender: userRole, type: 'mood-signal', title: mood.title }
                         });
                       }
                       if (onUpdateProfile) {
                         await onUpdateProfile(undefined, { moodSignal: mood.title });
                       }
                       alert(`'${mood.title}' 신호를 보냈습니다!`); 
                       setSubPage('main'); 
                     }}
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

export default IntimacyModal;
