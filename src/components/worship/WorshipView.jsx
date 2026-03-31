import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, 
  Sparkles, 
  BookOpen, 
  MessageCircle, 
  Heart, 
  Send, 
  Smile, 
  RefreshCw 
} from 'lucide-react';
import { supabase } from '../../supabase';

const WORSHIP_SESSIONS = [
  {
    id: 1,
    title: "언약 계승: 믿음의 가정을 세우시는 하나님",
    praise: {
      title: "오 신실하신 주",
      lyrics: "오 신실하신 주 내 아버지여 늘 변치 않으시는 주님이여\n자비와 긍헐이 무궁하시니 어제나 오늘이나 영원토록"
    },
    word: {
      ref: "신명기 6:5-7",
      text: "너는 마음을 다하고 뜻을 다하고 힘을 다하여 네 하나님 여호와를 사랑하라 오늘 내가 네게 명하는 이 말씀을 너는 마음에 새기고 네 자녀에게 부지런히 가르치며 집에 앉았을 때에든지 길을 갈 때에든지 누워 있을 때에든지 일어날 때에든지 이 말씀을 강론할 것이며"
    },
    interpretation: "개혁주의 신앙에서 가정이란 단순한 혈연 공동체를 넘어 '언약의 통로'입니다. 하나님께서는 부모의 경건한 신앙이 자녀와 배우자에게 자연스럽게 흘러가기를 원하십니다.",
    questions: [
      "오늘 우리 가정이 하나님의 통치를 인정하며 산 순간은 언제였나요?",
      "일상의 대화 속에 하나님의 말씀을 더 자연스럽게 녹여내기 위해 무엇을 실천할까요?"
    ]
  },
  {
    id: 2,
    title: "그리스도의 통치와 부부의 연합",
    praise: {
      title: "그 사랑 (마커스)",
      lyrics: "아버지 사랑 내가 노래해 아버지 은혜 내가 노래해\n그 사랑 변함없으신 거짓 없으신 성실하신 그 사랑"
    },
    word: {
      ref: "에베소서 5:31-32",
      text: "그러므로 사람이 부모를 떠나 그의 아내와 합하여 그 둘이 한 육체가 될지니 이 비밀이 크도다 나는 그리스도와 교회에 대하여 말하노라"
    },
    interpretation: "부부의 결혼 관계는 그리스도와 교회의 연합을 보여주는 가장 거룩한 '상징'입니다. 배우자를 대하는 나의 모습이 곧 주님을 대하는 나의 영성을 반영합니다.",
    questions: [
      "배우자의 연약함을 보았을 때, 그리스도의 사랑을 의지했던 경험이 있나요?",
      "우리 부부가 그리스도의 통치를 받기 위해 오늘 밤 내려놓아야 할 것은 무엇인가요?"
    ]
  },
  {
    id: 3,
    title: "서로 사랑하라: 주님의 새 계명",
    praise: {
      title: "사랑은 언제나 오래 참고",
      lyrics: "사랑은 언제나 오래 참고 사랑은 언제나 온유하며\n시기하지 않으며 자랑도 아니하며 교만하지 아니하며"
    },
    word: {
      ref: "요한복음 13:34",
      text: "새 계명을 너희에게 주노니 서로 사랑하라 내가 너희를 사랑한 것 같이 너희도 서로 사랑하라"
    },
    interpretation: "우리 가정에 주시는 주님의 명령은 분명합니다. 주님이 우리를 사랑하신 그 희생과 무조건적인 사랑을 본받아 우리도 배우자를 사랑해야 합니다.",
    questions: [
      "이번 주, 배우자를 통해 주님의 사랑을 느꼈던 특별한 순간이 있나요?",
      "주님이 나를 용서하신 것처럼 배우자를 용서하고 사랑해야 할 부분은 무엇일까요?"
    ]
  },
  {
    id: 4,
    title: "평안의 매는 줄로 하나 됨을 지키라",
    praise: {
      title: "평화 평화로다",
      lyrics: "평화 평화로다 하늘 위에서 내려오네\n그 사랑의 물결이 영원토록 내 영혼을 덮으소서"
    },
    word: {
      ref: "에베소서 4:3",
      text: "평안의 매는 줄로 성령이 하나 되게 하신 것을 힘써 지키라"
    },
    interpretation: "하나됨은 우리가 만드는 것이 아니라 성령께서 이미 주신 선물입니다. 우리의 역할은 그 하나됨을 '힘써 지키는 것'입니다. 평안의 태도가 핵심입니다.",
    questions: [
      "가정의 평화를 깨뜨리는 사소한 습관이나 태도가 있다면 무엇인가요?",
      "성령께서 주신 하나됨을 지키기 위해 오늘 내가 배우자에게 건넬 따뜻한 말 한마디는?"
    ]
  },
  {
    id: 5,
    title: "감사가 넘치는 풍성한 가정",
    praise: {
      title: "날 구원하신 주 감사",
      lyrics: "날 구원하신 주 감사 모든 것 주심 감사\n지난 추억 고마워 주 내 곁에 계시네"
    },
    word: {
      ref: "골로새서 3:17",
      text: "또 무엇을 하든지 말에나 일에나 다 주 예수의 이름으로 하고 그를 힘입어 하나님 아버지께 감사하라"
    },
    interpretation: "감사는 환경의 문제가 아니라 시선의 문제입니다. 일상의 작은 일들 속에서 하나님의 손길을 발견하고 감사할 때, 우리 가정은 천국을 맛보게 됩니다.",
    questions: [
      "오늘 아주 사소하지만 배우자에게 감사했던 일 세 가지만 나눠볼까요?",
      "어려운 상황 중에도 우리가 함께 감사할 수 있는 기도의 제목은 무엇인가요?"
    ]
  }
];

const WorshipView = ({ userRole, coupleCode, onAddSchedule }) => {
  const [currentSession, setCurrentSession] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [praiseUrl, setPraiseUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [myPrayers, setMyPrayers] = useState([]);
  const [partnerPrayers, setPartnerPrayers] = useState([]);

  useEffect(() => {
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

    const channel = supabase
      .channel(`realtime-prayers-${coupleCode}`)
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
    
    if (onAddSchedule) {
      const now = new Date();
      onAddSchedule({
        id: `worship-${Date.now()}`,
        title: "🙏 가정예배 완료",
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        location: topic.substring(0, 20) + (topic.length > 20 ? "..." : ""),
        date: now.toISOString().split('T')[0],
        type: 'worship'
      });
    }

    if (!error && data) {
      setTopic("");
    }
  };

  const allPrayers = useMemo(() => {
    const combined = [
      ...myPrayers.map(p => ({ ...p, type: 'mine' })),
      ...partnerPrayers.map(p => ({ ...p, type: 'spouse' }))
    ];
    return combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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

        <div style={{ position: 'relative', padding: '0 20px 30px' }}>
          <div style={{ 
            position: 'relative',
            width: '100%', 
            paddingBottom: '56.25%', 
            background: '#000', 
            borderRadius: '32px', 
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255,255,255,0.12)',
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

              <div className="worship-section-card">
                <div className="worship-label-row">
                  <div className="worship-icon-circle" style={{ background: '#8A60FF' }}><Sparkles size={16} /></div>
                  <span className="worship-label-text">MEDITATION 말씀 해석</span>
                </div>
                <div className="worship-content-box">
                  <p style={{ fontSize: '15px', color: '#2D1F08', fontWeight: 600, lineHeight: 1.6 }}>{currentSession.interpretation}</p>
                </div>
              </div>

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
             allPrayers.map((p) => (
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
                   <span style={{ fontSize: '10px', opacity: 0.5 }}>{new Date(p.created_at).toLocaleDateString('ko-KR')}</span>
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

export default React.memo(WorshipView);
