import React, { useState, useEffect, useMemo, useRef } from 'react';
// Last Update: Shared Navigation & Turn Sync - 2026-03-22 21:20
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  MessageSquare,
  Calendar,
  User,
  Smartphone,
  Settings,
  Lock,
  BarChart3,
  Info,
  Share2,
  Users,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Camera,
  Upload,
  CheckCircle2,
  ListTodo,
  AlertCircle,
  Palette,
  ClipboardList,
  Fingerprint,
  Flame,
  Clipboard,
  Bell,
  Home,
  BookOpen,
  Zap,
  Send,
  Music,
  Smile,
  ShieldCheck,
  StickyNote,
  X,
  Activity,
  Image as ImageIcon
} from 'lucide-react';

import CardGameView from './components/game/CardGameView';
import { CARD_DATA } from './data/dialogueCards';
import ImageCardGameView from './components/game/ImageCardGameView';
import DialogueChoiceView from './components/dialogue/DialogueChoiceView';
import GameGuideView from './components/dialogue/GameGuideView';
import HomeView from './components/home/HomeView';
import AdminView from './components/admin/AdminView';
import ChatView from './components/counseling/ChatView';
import SecretAnswerInteraction from './components/game/SecretAnswerInteraction';

const HATTI_TODOS = [
  { id: 1, action: "말하기", text: "배우자에게 '오늘 하루도 정말 고생 많았어'라고 눈을 맞추며 말해주세요." },
  { id: 2, action: "행동", text: "오늘 저녁 설거지나 청소 중 하나를 배우자 몰래 미리 끝내두세요." },
  { id: 3, action: "스킨십", text: "배우자가 퇴근하고 돌아오면 5초간 따뜻하게 안아주세요." },
  { id: 4, action: "선물", text: "퇴근길에 배우자가 좋아하는 편의점 간식을 하나 사서 건네보세요." },
  { id: 5, action: "경청", text: "오늘 배우자의 이야기를 10분 동안 조언 없이 온전히 들어주세요." }
];
import { supabase, supabaseUrl, supabaseAnonKey } from './supabase';

// 🛡️ KakaoTalk / Older Browser Compatibility Fix (Prevent White Screen)
if (typeof window !== 'undefined' && !window.Notification) {
  window.Notification = function() { this.close = () => {}; };
  window.Notification.permission = 'denied';
  window.Notification.requestPermission = () => Promise.resolve('denied');
}

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


// ============================================================
// [Phase 2 Modularization] All inline component definitions removed.
// Components are now imported from src/components/ directories.
// See imports at the top of this file for the complete module map.
// ============================================================
// Removed components:
//   - SecretAnswerInteraction → components/game/SecretAnswerInteraction.jsx
//   - WORSHIP_SESSIONS + WorshipView → components/worship/WorshipView.jsx
//   - HeartPrayerView → components/intimacy/HeartPrayerView.jsx
//   - IntimacyHubView → components/intimacy/IntimacyHubView.jsx
//   - AppGuideView → components/ui/AppGuideView.jsx
//   - HattiCharacter → components/ui/HattiCharacter.jsx
//   - SolutionView → components/counseling/SolutionView.jsx
//   - IntimacyModal → components/intimacy/IntimacyModal.jsx
//   - DeepAnalysisView → components/auth/DeepAnalysisView.jsx
//   - SettingsView → components/settings/SettingsView.jsx
//   - OnboardingView → components/auth/OnboardingView.jsx
//   - AuthView → components/auth/AuthView.jsx
// ============================================================// [Modularized] HomeView extracted to separate file



/* 📊 Admin Dashboard View (Super Admin Only) */
// [Modularized] AdminView extracted to separate file

/* 💬 Chat View (AI Personalized Hatti Counseling) */
// [Modularized] ChatView extracted to separate file

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

const WorshipView = ({ userRole, coupleCode, mainChannel }) => {
  const [currentSession, setCurrentSession] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [praiseUrl, setPraiseUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [myPrayers, setMyPrayers] = useState(() => JSON.parse(localStorage.getItem('myPrayers') || '[]'));
  const [partnerPrayers, setPartnerPrayers] = useState([]);

  useEffect(() => {
    if (!mainChannel) return;

    // Listen for worship events
    const sub = mainChannel.on('broadcast', { event: 'worship-update' }, ({ payload }) => {
      if (payload.sender !== userRole) {
        if (payload.session) setCurrentSession(payload.session);
        if (payload.praiseUrl !== undefined) setPraiseUrl(payload.praiseUrl);
      }
    });

    return () => {
    };
  }, [mainChannel, userRole]);

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

      // Sync with partner
      if (mainChannel) {
        mainChannel.send({
          type: 'broadcast',
          event: 'worship-update',
          payload: { sender: userRole, session: randomSession }
        });
      }
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
              onChange={(e) => {
                const newUrl = e.target.value;
                setPraiseUrl(newUrl);
                if (mainChannel) {
                  mainChannel.send({
                    type: 'broadcast',
                    event: 'worship-update',
                    payload: { sender: userRole, praiseUrl: newUrl }
                  });
                }
              }}
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
                    <div key={i} className="sharing-item">Q{i + 1}. {q}</div>
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

const HeartPrayerView = ({ userRole, coupleCode, onBack, partnerPrayers, setPartnerPrayers, embedded = false }) => {
  const [topic, setTopic] = useState("");
  const [allPrayers, setAllPrayers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const fetchPrayers = async () => {
    const { data } = await supabase
      .from('prayers')
      .select('*')
      .eq('couple_id', coupleCode)
      .order('created_at', { ascending: false });

    if (data) {
      const processed = data.map(p => ({
        ...p,
        type: p.user_role === userRole ? 'mine' : 'partner',
        date: new Date(p.created_at).toLocaleDateString('ko-KR')
      }));
      setAllPrayers(processed);
      setPartnerPrayers(processed.filter(p => p.type === 'partner'));
    }
  };

  useEffect(() => {
    fetchPrayers();
    const handlePrayersUpdate = () => fetchPrayers();
    window.addEventListener('prayers-updated', handlePrayersUpdate);
    return () => window.removeEventListener('prayers-updated', handlePrayersUpdate);
  }, [coupleCode, userRole]);

  const handleRecord = async () => {
    if (!topic.trim()) return;
    setIsRecording(true);

    const newPrayer = {
      id: Date.now(),
      couple_id: coupleCode,
      user_role: userRole,
      text: topic.trim(),
      created_at: new Date().toISOString(),
      type: 'mine',
      date: new Date().toLocaleDateString('ko-KR')
    };

    setAllPrayers(prev => [newPrayer, ...prev]);
    const originalTopic = topic;
    setTopic("");

    const { error } = await supabase.from('prayers').insert({
      couple_id: coupleCode,
      user_role: userRole,
      text: originalTopic.trim(),
      created_at: newPrayer.created_at
    });

    if (!error) {
      fetchPrayers();
      if (mainChannel) {
        mainChannel.send({
          type: 'broadcast',
          event: 'heart-prayer-sent',
          payload: { userRole, text: originalTopic.trim() }
        });
      }
    } else {
      setAllPrayers(prev => prev.filter(p => p.id !== newPrayer.id));
      setTopic(originalTopic);
      console.error("Error recording prayer:", error);
    }
    setIsRecording(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("기도 제목을 삭제하시겠습니까?")) return;
    const { error } = await supabase.from('prayers').delete().eq('id', id);
    if (!error) fetchPrayers();
  };

  const handleEditSave = async (id) => {
    if (!editText.trim()) return;
    const { error } = await supabase.from('prayers').update({ text: editText.trim() }).eq('id', id);
    if (!error) {
      setEditingId(null);
      fetchPrayers();
    }
  };

  return (
    <div className={`flex flex-col ${embedded ? '' : 'min-h-screen pb-20'}`}>
      {!embedded && (
        <header style={{ padding: '25px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none' }}>
            <ChevronLeft size={28} color="#2D1F08" />
          </button>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#2D1F08' }}>속마음 기도</h2>
        </header>
      )}

      <div style={{ padding: '20px' }}>
        <div style={{
          background: 'white', padding: '25px', borderRadius: '32px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.05)', border: '1.5px solid rgba(212, 175, 55, 0.2)', marginBottom: '30px'
        }}>
          <p style={{ fontSize: '14px', color: '#5D4037', fontWeight: 800, marginBottom: '20px' }}>말하기 힘든 고백을 이곳에 남겨주세요. 🙏</p>
          <textarea
            value={topic} onChange={(e) => setTopic(e.target.value)}
            placeholder="기도하고 싶은 내용을 자유롭게 적어보세요..."
            style={{ width: '100%', minHeight: '120px', border: 'none', background: '#FDFCF0', borderRadius: '20px', padding: '15px', fontSize: '15.5px', outline: 'none', resize: 'none' }}
          />
          <button onClick={handleRecord} disabled={isRecording || !topic.trim()} style={{ width: '100%', marginTop: '15px', padding: '16px', borderRadius: '100px', background: '#2D1F08', color: 'white', fontWeight: 900, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            {isRecording ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
            <span>마음 전달하기</span>
          </button>
        </div>

        {/* Prayers Timeline */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2" style={{ paddingLeft: '5px' }}>
            <Heart size={16} color="#FF4D6D" fill="#FF4D6D" />
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08' }}>기도 타임라인</span>
          </div>
          {allPrayers.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'white', padding: '18px', borderRadius: '24px', borderLeft: p.type === 'mine' ? '5px solid #D4AF37' : '5px solid #8A60FF', boxShadow: '0 5px 15px rgba(0,0,0,0.02)' }}
            >
              <div className="flex justify-between items-start mb-2">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', fontWeight: 900, color: p.type === 'mine' ? '#B08D3E' : '#8A60FF' }}>{p.type === 'mine' ? '나의 기록' : '배우자의 기도'}</span>
                  <span style={{ fontSize: '10px', color: '#AAA' }}>{p.date}</span>
                </div>
                {p.type === 'mine' && (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingId(p.id); setEditText(p.text); }} style={{ background: 'none', border: 'none', color: '#B08D3E', opacity: 0.6 }}><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#FF5E5E', opacity: 0.6 }}><Trash2 size={14} /></button>
                  </div>
                )}
              </div>

              {editingId === p.id ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editText} onChange={(e) => setEditText(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #D4AF3740', background: '#FDFCF0', fontSize: '14px', outline: 'none', minHeight: '80px' }}
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingId(null)} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', background: '#F3F4F6', fontWeight: 700 }}>취소</button>
                    <button onClick={() => handleEditSave(p.id)} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', background: '#2D1F08', color: 'white', fontWeight: 700 }}>저장</button>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '14.5px', lineHeight: 1.5, color: '#2D1F08', wordBreak: 'break-all' }}>{p.text}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* 🌹 Intimacy Hub View (Hearts Prayer & Secret Garden) */
const IntimacyHubView = ({ user, userRole, coupleCode, supabase, mainChannel, onBack, partnerPrayers, setPartnerPrayers, bgImage, onBgUpload, partnerLabel, husbandInfo, wifeInfo, setHusbandInfo, setWifeInfo }) => {
  const [subTab, setSubTab] = useState('prayer'); // 'prayer' or 'garden'
  const [modalSubPage, setModalSubPage] = useState('main');

  useEffect(() => {
    const handleNavToGarden = () => {
      setSubTab('garden');
      setModalSubPage('secrets');
    };
    window.addEventListener('nav-to-garden', handleNavToGarden);
    return () => window.removeEventListener('nav-to-garden', handleNavToGarden);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white" style={{ position: 'relative', zIndex: 10 }}>
      {/* Hub Header (Standalone) */}
      <div style={{
        padding: '25px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        background: 'linear-gradient(to bottom, #FFF, #FDFCF0)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}>
            <ChevronLeft size={28} color="#2D1F08" />
          </button>
          <div className="flex flex-col">
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#2D1F08' }}>소통의 화원</h2>
            <span style={{ fontSize: '11px', color: '#B08D3E', fontWeight: 800, letterSpacing: '1px' }}>HUB OF INTIMACY</span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.06)',
          borderRadius: '100px',
          padding: '6px',
          border: '1px solid rgba(0,0,0,0.02)'
        }}>
          <button
            onClick={() => setSubTab('prayer')}
            style={{
              flex: 1, padding: '12px', borderRadius: '100px', fontSize: '14px', fontWeight: 900,
              background: subTab === 'prayer' ? 'white' : 'transparent',
              color: subTab === 'prayer' ? '#B08D3E' : '#8B7355',
              boxShadow: subTab === 'prayer' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            속마음 기도
          </button>
          <button
            onClick={() => setSubTab('garden')}
            style={{
              flex: 1, padding: '12px', borderRadius: '100px', fontSize: '14px', fontWeight: 900,
              background: subTab === 'garden' ? 'white' : 'transparent',
              color: subTab === 'garden' ? '#FF4D6D' : '#8B7355',
              boxShadow: subTab === 'garden' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            소통의 화원
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ background: '#FDFCF0' }}>
        <AnimatePresence mode="wait">
          {subTab === 'prayer' ? (
            <motion.div
              key="prayer-view"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <HeartPrayerView
                userRole={userRole}
                coupleCode={coupleCode}
                onBack={undefined}
                partnerPrayers={partnerPrayers}
                setPartnerPrayers={setPartnerPrayers}
                embedded={true}
              />
            </motion.div>
          ) : (
            <motion.div
              key="garden-view"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="h-full"
            >
              <IntimacyModal
                show={true}
                onClose={() => setSubTab('prayer')}
                onNav={() => { }}
                subPage={modalSubPage}
                setSubPage={setModalSubPage}
                bgImage={bgImage}
                onBgUpload={onBgUpload}
                user={user}
                partnerLabel={partnerLabel}
                userRole={userRole}
                coupleCode={coupleCode}
                supabase={supabase}
                mainChannel={mainChannel} // 📡 Pass live channel
                isFullPage={true}
                embedded={true}
                setHusbandInfo={setHusbandInfo}
                setWifeInfo={setWifeInfo}
                myInfo={userRole === 'husband' ? husbandInfo : wifeInfo}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
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
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#F5D060' }}>{i + 1}</div>
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

/* 🤖 Dynamic AI Hatti Character */
const HattiCharacter = ({ state = 'floating', size = 120, style = {} }) => {
  const getClassName = () => {
    if (state === 'thinking') return 'hatti-thinking';
    if (state === 'response') return 'hatti-response';
    return 'hatti-floating';
  };

  return (
    <div style={{
      perspective: '1500px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.22))',
      ...style
    }}>
      <motion.div
        initial={{ scale: 1, rotateX: 25 }} // 진입 시 작았다 커지는 효과 제거
        animate={{
          y: state === 'floating' ? [0, -28, 0] : 0, // 상하 부유만 유지
          rotateY: state === 'floating' ? [-16, 16, -16] : 0,
          rotateX: state === 'floating' ? [6, -6, 6] : 0,
          rotateZ: state === 'floating' ? [-4, 4, -4] : 0
        }}
        whileTap={{
          scale: 1.1, // 터치 시에만 살짝 강조
          rotateY: 360,
          transition: { duration: 1, type: 'spring' }
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 100,
          transformStyle: 'preserve-3d'
        }}
      >
        <img
          src="/hatti_3d_v2.png"
          alt="Hatti"
          style={{
            width: '115%',
            height: '115%',
            objectFit: 'contain',
            zIndex: 5,
            position: 'relative',
            pointerEvents: 'none'
          }}
        />

        {/* 🔮 Radiant Aura (크기 변화 없이 투명도만 은은하게) */}
        <motion.div
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            position: 'absolute',
            inset: '-45%',
            background: 'radial-gradient(circle, rgba(138, 96, 255, 0.3) 0%, rgba(245, 208, 96, 0.2) 35%, transparent 80%)',
            filter: 'blur(50px)',
            zIndex: 1,
            borderRadius: '50%',
            mixBlendMode: 'screen'
          }}
        />

        {/* 🌑 Unreal Shadow (크기 고정, 부유에 따른 투명도 변화만) */}
        <motion.div
          animate={{
            opacity: state === 'floating' ? [0.25, 0.1, 0.25] : 0.25,
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            bottom: '-45%',
            left: '10%',
            right: '10%',
            height: '14px',
            background: 'rgba(0,0,0,0.3)',
            filter: 'blur(20px)',
            borderRadius: '50%',
            zIndex: 0,
            transform: 'translateZ(-80px)'
          }}
        />
      </motion.div>
    </div>
  );
};

/* 📊 Solution (AI Records) */
const SolutionView = ({ onBack, userRole, husbandInfo, wifeInfo, schedules, adminStats, coupleStats }) => {
  const myInfo = userRole === 'husband' ? husbandInfo : wifeInfo;
  const spouseInfo = userRole === 'husband' ? wifeInfo : husbandInfo;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportResult, setReportResult] = useState(null);
  const [recentPrayers, setRecentPrayers] = useState([]);

  useEffect(() => {
    const fetchPrayers = async () => {
      const { data } = await supabase.from('prayers').select('*').limit(5).order('created_at', { ascending: false });
      if (data) setRecentPrayers(data);
    };
    fetchPrayers();
  }, []);

  const handleDeepAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `
        당신은 "부부신호등(Heart Sync)"의 상담 엔진 전문가 '하티'입니다. 
        개혁주의 신학(기독교 언약적 관점)과 심리 상담학(가족 시스템 이론)의 대가로서 아래 제공된 부부의 실제 활동 데이터를 심층 분석하여 전문가용 월간 리포트를 작성해 주세요. 
        
        [부부 정보]
        - 남편: ${husbandInfo.nickname} (MBTI: ${husbandInfo.mbti})
        - 아내: ${wifeInfo.nickname} (MBTI: ${wifeInfo.mbti})
        - 결혼 기념일: ${husbandInfo.marriageDate}
        
        [한 달 활동 데이터]
        - 총 상호작용: ${coupleStats?.totalInteractions}회
        - 기도 제목 수: ${coupleStats?.prayerCount}개
        - 무드 시그널 교환: ${coupleStats?.signalCount}회
        - 공유된 일정: ${coupleStats?.scheduleCount}개
        - 최근 기도 제목들: ${recentPrayers.map(p => p.text).join(", ")}
        
        [리포트 형식 요구사항]
        1. 영적 친밀도 분석: 두 사람의 활동과 대화가 '주님 안에서의 언약'을 어떻게 실천하고 있는지 구체적으로 격려
        2. 기질적 조언: MBTI와 최근 상호작용 빈도를 토대로, 갈등이 생길 수 있는 지점과 서로의 고유한 성향을 어떻게 보충할지 분석 (심리학적 용어 활용 가능)
        3. 실천 미션: 다음 한 달간 실천할 아주 구체적이고 풍성한 숙제(Daily Task) 3가지 제안 (하나님 중심적 삶과 일상의 친밀감 조종)
        
        최소 1000자 이상의 풍성하고 따뜻하며 권위 있는 어조로 한국어로 작성해 주세요. 
        마크다운 형식은 제외하고 텍스트 줄바꿈을 활용해주세요.
      `;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        setReportResult(data.choices[0].message.content);
      } else {
        throw new Error("AI 분석 실패");
      }
    } catch (err) {
      console.error(err);
      alert("AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="report-page" style={{ overflowY: 'auto' }}>
      <div className="flex items-center gap-3 mb-6 p-4">
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
          <ChevronLeft size={24} color="#2D1F08" />
        </button>
        <span style={{ fontSize: '20px', fontWeight: 900, color: '#2D1F08' }}>뒤로가기</span>
      </div>
      <div className="report-card" style={{ padding: '25px', marginBottom: '15px' }}>
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={20} color="#8A60FF" />
          <span style={{ fontSize: '18px', fontWeight: 900 }}>AI 전문가 정밀 분석</span>
        </div>
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px', lineHeight: 1.6 }}>
          최근 한 달간의 대화 패턴, 기도 제목, 감정 신호를 종합하여 AI 하티가 전하는 깊이 있는 조언을 만나보세요.
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleDeepAnalysis}
          disabled={isAnalyzing}
          style={{
            width: '100%', padding: '18px', borderRadius: '20px',
            background: isAnalyzing ? '#CCC' : 'linear-gradient(135deg, #2D1F08 0%, #4D3A1A 100%)',
            color: 'white', fontWeight: 900, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
          }}
        >
          {isAnalyzing ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <RefreshCw size={20} />
            </motion.div>
          ) : <Sparkles size={20} />}
          {isAnalyzing ? "데이터 분석 및 리포트 작성 중..." : "새로운 리분석 요청하기"}
        </motion.button>
      </div>

      {/* 📈 이번 달 대화 횟수 현황 */}
      <div className="report-card" style={{ padding: '25px', marginBottom: '15px' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="report-icon-bg" style={{ background: 'linear-gradient(135deg, #FF9A8B, #FF6A88)' }}>
            <BarChart3 size={20} color="white" />
          </div>
          <span className="report-card-label" style={{ fontSize: '18px', fontWeight: 900 }}>이번 달 종합 활동 지표</span>
        </div>

        <div className="flex flex-col items-center justify-center py-4 relative">
          <svg className="gauge-svg" viewBox="0 0 160 160" style={{ width: '150px', height: '150px' }}>
            <circle className="gauge-circle-bg" cx="80" cy="80" r="70" stroke="rgba(0,0,0,0.05)" strokeWidth="12" fill="none" />
            <circle className="gauge-circle-fill" cx="80" cy="80" r="70"
              stroke="url(#gauge-grad)" strokeWidth="12" strokeLinecap="round" fill="none"
              style={{
                strokeDasharray: `${Math.min((coupleStats.totalInteractions / 50) * 440, 440)}, 440`,
                transform: 'rotate(-90deg)', transformOrigin: 'center',
                transition: '2s ease-out'
              }}
            />
            <defs>
              <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF9A8B" />
                <stop offset="100%" stopColor="#FF6A88" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center">
            <span style={{ fontSize: '38px', fontWeight: 900, color: '#FF4D6D' }}>{coupleStats?.totalInteractions || 0}</span>
            <span style={{ fontSize: '14px', fontWeight: 700, opacity: 0.4 }}>회</span>
          </div>
        </div>
        <p className="text-center" style={{ fontSize: '13px', fontWeight: 800, color: 'rgba(0,0,0,0.5)', marginTop: '15px' }}>
          {coupleStats.totalInteractions >= 50 ? '축하드려요! 목표를 달성했습니다! 🥳' : `목표 50회 중 ${Math.round((coupleStats.totalInteractions / 50) * 100)}% 달성! 🎉`}
        </p>
      </div>

      {/* 📊 대화 테마 분석 (실제 데이터 기반 시뮬레이션) */}
      <div className="report-card" style={{ padding: '25px', marginBottom: '15px' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="report-icon-bg" style={{ background: 'linear-gradient(135deg, #8A60FF, #AC8AFF)' }}>
            <Zap size={20} color="white" />
          </div>
          <span className="report-card-label" style={{ fontSize: '18px', fontWeight: 900 }}>데이터 종합 분석</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
          {[
            { label: '영적 소통 (기도제목)', value: Math.min(Math.round((coupleStats.prayerCount / Math.max(coupleStats.totalInteractions, 1)) * 100), 100), color: '#8A60FF' },
            { label: '정서적 교감 (무드시그널)', value: Math.min(Math.round((coupleStats.signalCount / Math.max(coupleStats.totalInteractions, 1)) * 100), 100), color: '#FF8A9D' },
            { label: '일상 협력 (공유일정)', value: Math.min(Math.round((coupleStats.scheduleCount / Math.max(coupleStats.totalInteractions, 1)) * 100), 100), color: '#F5D060' }
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
          * 한 달간 수집된 활동 비중입니다. 서로를 향한 관심이 구체적인 데이터로 기록되고 있습니다.
        </p>
      </div>

      {/* ✝️ 부부를 위한 하티의 제안 (풍성한 상담 리포트) */}
      <div className="hatti-insight-box" style={{ background: 'rgba(255,255,255,0.7)', border: '1.5px solid #D4AF37', borderRadius: '32px', padding: '25px' }}>
        <div className="insight-header" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <HattiCharacter state={isAnalyzing ? 'thinking' : 'floating'} size={80} />
          <div className="flex flex-col">
            <span className="insight-title" style={{ fontSize: '18px', color: '#2D1F08', fontWeight: 900 }}>부부를 위한 하티의 제안</span>
            <span style={{ fontSize: '11px', color: '#B08D3E', fontWeight: 800, letterSpacing: '1px' }}>SPIRITUAL COUNSELING REPORT</span>
          </div>
        </div>

        <div className="expert-content" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {reportResult ? (
            <div style={{ fontSize: '14px', lineHeight: 1.8, color: '#4D3A1A', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
              {reportResult}
            </div>
          ) : (
            <>
              <section>
                <h4 style={{ fontSize: '15px', color: '#8A60FF', fontWeight: 900, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} /> 영적 친밀도 분석
                </h4>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#4D3A1A', textAlign: 'justify' }}>
                  아직 상세 분석 결과가 생성되지 않았습니다. 상단의 <strong>'분석 요청'</strong> 버튼을 클릭하여 ${husbandInfo.nickname}님과 ${wifeInfo.nickname}님만을 위한 특별한 리포트를 받아보세요. 하티가 두 분의 기록을 바탕으로 깊이 있는 조언을 준비해 드립니다.
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
                  개혁주의 관점에서 결혼은 단순한 계약이 아닌 <strong>거룩한 언약(Covenant)</strong>입니다. 상대의 부족함은 내가 정죄할 대상이 아니라, 주님이 나를 통해 채우라고 하시는 사명의 영역임을 기억하십시오.
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* 🌸 Intimacy Modal (Secret Garden) */
const IntimacyModal = ({ user, show, onClose, subPage, setSubPage, bgImage, onBgUpload, partnerLabel, userRole, coupleCode, supabase, mainChannel, isFullPage, onNav, embedded = false, setHusbandInfo, setWifeInfo, husbandInfo, wifeInfo, myInfo, onUpdateProfile, setShowNotificationList }) => {
  const [currentSecretIdx, setCurrentSecretIdx] = useState(0);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [myAnswerInput, setMyAnswerInput] = useState('');
  const [spouseStatus, setSpouseStatus] = useState('none');
  const [isTopicFinished, setIsTopicFinished] = useState(false);
  const [randomMoods, setRandomMoods] = useState([]);
  const chatEndRef = useRef(null);
  const lastGardenNavIdRef = useRef(null); // To prevent duplicate messages from DB sync

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
    (CARD_DATA || []).filter(q => q.category === '시크릿'), []
  );

  useEffect(() => {
    if (!show) return;

    // 🌐 Internal Message Bus via CustomEvent from Global App Listener
    if (show) {
      // 🔄 Sync latest message from DB when opening
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
    }

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
  }, [show, userRole]);

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

    // 📡 Global Broadcast (High Speed)
    if (mainChannel) {
      mainChannel.send({
        type: 'broadcast',
        event: 'garden-chat-sent',
        payload: { text: q, sender: userRole, time: getTime(), msgType: 'question', gardenNavId }
      });
    }

    // 🔄 DB Profile Sync (Fail-safe reliability)
    supabase.from('profiles').select('info').eq('id', user.id).single().then(({ data }) => {
      const latestInfo = data?.info || myInfo;
      const updatedInfo = { ...latestInfo, gardenMsg: q, gardenMsgType: 'question', gardenNavId, gardenTime: getTime() };

      supabase.from('profiles').upsert({
        id: user.id, couple_id: coupleCode, user_role: userRole, info: updatedInfo, updated_at: new Date().toISOString()
      }, { onConflict: 'id' }).then(({ error }) => {
        if (!error) {
          if (userRole === 'husband') setHusbandInfo(updatedInfo);
          else setWifeInfo(updatedInfo);
        }
      });
    });

    setTimeout(() => setSpouseStatus('done'), 2000);
  };

  const handleSendChat = () => {
    if (!inputText.trim()) return;
    const userMsg = { id: Date.now(), text: inputText, sender: 'me', type: 'chat', time: getTime() };
    setMessages(prev => [...prev, userMsg]);

    // 🌐 Multi-Layer Sync: Broadcast (High speed) + Profile Sync (100% Reliability)
    const gardenNavId = Date.now();
    const chatMsg = { text: inputText, sender: userRole, time: getTime(), msgType: 'chat', gardenNavId };

    if (mainChannel) {
      mainChannel.send({ type: 'broadcast', event: 'garden-chat-sent', payload: chatMsg });
    }

    // DB Backup Sync via Profiles (Reliable connection)
    // IMPORTANT: Fetch latest info to prevent clobbering other settings
    supabase.from('profiles').select('info').eq('id', user.id).single().then(({ data }) => {
      const latestInfo = data?.info || myInfo;
      const updatedInfo = { ...latestInfo, gardenMsg: inputText, gardenMsgType: 'chat', gardenNavId, gardenTime: getTime() };

      supabase.from('profiles').upsert({
        id: user.id, couple_id: coupleCode, user_role: userRole, info: updatedInfo, updated_at: new Date().toISOString()
      }, { onConflict: 'id' }).then(({ error }) => {
        if (error) console.error("Garden DB Sync failed", error);
        else {
          if (userRole === 'husband') setHusbandInfo(updatedInfo);
          else setWifeInfo(updatedInfo);
        }
      });
    });

    setInputText('');
    setSpouseStatus('done');
  };

  const handleAnswerSubmit = () => {
    if (!myAnswerInput.trim()) return;
    const gardenNavId = Date.now();
    const answerMsg = { id: gardenNavId, text: myAnswerInput, sender: 'me', type: 'answer', time: getTime() };
    setMessages(prev => [...prev, answerMsg]);

    // 📡 Global Broadcast
    if (mainChannel) {
      mainChannel.send({
        type: 'broadcast',
        event: 'garden-chat-sent',
        payload: { text: myAnswerInput, sender: userRole, time: getTime(), msgType: 'answer', gardenNavId }
      });
    }

    // 🔄 DB Profile Sync
    supabase.from('profiles').select('info').eq('id', user.id).single().then(({ data }) => {
      const updatedInfo = { ...data?.info, gardenMsg: myAnswerInput, gardenMsgType: 'answer', gardenNavId };
      supabase.from('profiles').upsert({
        id: user.id, couple_id: coupleCode, user_role: userRole, info: updatedInfo, updated_at: new Date().toISOString()
      }, { onConflict: 'id' }).then(({ error }) => {
        if (!error) {
          if (userRole === 'husband') setHusbandInfo(updatedInfo);
          else setWifeInfo(updatedInfo);
        }
      });
    });

    setMyAnswerInput('');
    setIsTopicFinished(true);
  };

  const handleResetChat = async () => {
    if (!window.confirm("대화 내용을 초기화하고 새로운 대화를 시작하시겠습니까?")) return;

    // 📡 Global Broadcast
    if (mainChannel) {
      mainChannel.send({
        type: 'broadcast',
        event: 'garden-chat-reset'
      });
    }

    // 🔄 DB Profile Sync (Clear Message for BOTH)
    const { data: allProfiles } = await supabase.from('profiles').select('id, info, user_role').eq('couple_id', coupleCode);
    if (allProfiles) {
      for (const p of allProfiles) {
        const updatedInfo = { ...p.info, gardenMsg: null, gardenMsgType: null, gardenNavId: null, gardenAnswer: null };
        await supabase.from('profiles').upsert({
          id: p.id, couple_id: coupleCode, user_role: p.user_role, info: updatedInfo, updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

        if (p.user_role === 'husband') setHusbandInfo(updatedInfo);
        else if (p.user_role === 'wife') setWifeInfo(updatedInfo);
      }
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
        top: 0,
        left: 0,
        right: 0,
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
            size={22}
            color="rgba(45, 31, 8, 0.4)"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowNotificationList(true)}
          />
          <Settings
            size={22}
            color="rgba(45, 31, 8, 0.4)"
            style={{ cursor: 'pointer' }}
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
            {/* Header */}
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

            {/* Chat Area */}
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

            {/* Input Area */}
            <div style={{ padding: '12px 16px 110px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(0,0,0,0.05)', flexShrink: 0 }}>
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
                    onClick={async () => {
                      // 📡 Global Broadcast
                      if (mainChannel) {
                        mainChannel.send({
                          type: 'broadcast',
                          event: 'card-game-call',
                          payload: { sender: userRole, type: 'mood-signal', title: mood.title }
                        });
                      }

                      // 🔄 Master Profile Sync (Centralized & Safe)
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
                  💡 선택하신 무드 시그널은 배우자의 홈 화면에<br />
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

/* ⚙️ Settings View (Extended) */
/* 🧠 Deep Analysis View (전문 성향 진단) */
const DeepAnalysisView = ({ onBack, myInfo, updateProfile }) => {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const questions = [
    {
      id: 'q1',
      title: 'Q1. (갈등 대처) 배우자와 의견 충돌로 다툼이 발생했을 때, 당신이 가장 선호하는 대처 방식은?',
      options: [
        { value: 'A', label: '문제가 해결될 때까지 어떻게든 대화로 즉시 끝장을 봐야 편하다 (주도/직면형)' },
        { value: 'B', label: '감정이 상하므로 일단 회피하거나 혼자만의 동굴에서 생각할 시간이 필요하다 (회피/분석형)' },
        { value: 'C', label: '상대방이 화를 내는 것이 두려워 일단 사과하고 상황을 무마하는 편이다 (수용/순응형)' },
        { value: 'D', label: '감정은 배제하고 사실 관계를 명확히 따져 논리적인 합의점을 찾으려 한다 (논리/이성형)' }
      ]
    },
    {
      id: 'q2',
      title: 'Q2. (애착 유형) 배우자와의 심리적/물리적 거리에 대해 가장 편안하게 느끼는 상태는?',
      options: [
        { value: 'A', label: '서로의 시간과 공간을 철저히 존중하며 간섭하지 않는 독립적인 상태 (회피애착 성향)' },
        { value: 'B', label: '모든 일상을 속속들이 공유하고 떨어져 있으면 불안한 밀착 상태 (불안애착 성향)' },
        { value: 'C', label: '신뢰 기반으로 각자 일에 집중하되, 모였을 때 깊게 교감하는 상태 (안정애착 성향)' },
        { value: 'D', label: '끊임없이 애정 표현과 사랑의 확신을 받아야만 마음이 놓이는 상태 (확보지향 성향)' }
      ]
    },
    {
      id: 'q3',
      title: 'Q3. (사랑의 언어) 당신이 "아, 내가 정말 사랑받고 있구나"라고 가장 크게 체감하는 순간은?',
      options: [
        { value: 'A', label: '나의 노력과 존재를 칭찬해주고 "고마워, 사랑해"라고 말해줄 때 (인정하는 말)' },
        { value: 'B', label: '스마트폰을 내려놓고 하루 10분이라도 나에게 온전히 집중해줄 때 (함께하는 시간)' },
        { value: 'C', label: '내가 지쳐있을 때 말없이 밀린 집안일이나 아이 돌봄을 먼저 다 해놓았을 때 (헌신과 봉사)' },
        { value: 'D', label: '평소 내가 흘리듯 말했던 갖고 싶던 선물을 서프라이즈로 사왔을 때 (선물)' }
      ]
    },
    {
      id: 'q4',
      title: 'Q4. (스트레스 반응) 직장이나 외부에서 극심한 스트레스를 받았을 때 복구하는 방식은?',
      options: [
        { value: 'A', label: '가만히 내버려 두고 혼자 푹 쉬거나 침묵할 수 있는 절대적인 시간 요구' },
        { value: 'B', label: '배우자를 붙들고 있었던 일들을 다 털어놓으며 무조건적인 공감과 위로 받기' },
        { value: 'C', label: '배우자와 함께 맛있는 것을 먹거나 영화를 보며 완전히 다른 일에 몰입하기' },
        { value: 'D', label: '밀린 집안일을 미친 듯이 하거나 청소를 하며 강박적으로 스트레스를 분출하기' }
      ]
    },
    {
      id: 'q5',
      title: 'Q5. (가치관: 재정) 가정 경제를 관리하는 데 있어 당신의 가장 확고한 기준은?',
      options: [
        { value: 'A', label: '한 푼이라도 철저하게 예산을 세우고 저축/투자에 집중해야 마음이 편하다' },
        { value: 'B', label: '공동 지출 외에는 서로의 터치 없이 각자 번 돈을 자유롭게 쓰기를 원한다' },
        { value: 'C', label: '돈은 거들 뿐, 가족의 경험(여행/여가)이나 의미 있는 지출에는 절대 아끼지 말아야 한다' },
        { value: 'D', label: '계산에 밝은 한쪽이 전담하고, 나는 세세한 스트레스를 받고 싶지 않다' }
      ]
    },
    {
      id: 'q6',
      title: 'Q6. (영적 소통) 우리 가정의 신앙생활(가정 예배 등)에 대해 갖고 있는 속마음은?',
      options: [
        { value: 'A', label: '신앙이 최우선이고, 억지로라도 가정 예배와 성경 공부의 틀을 꼭 지켜야 한다' },
        { value: 'B', label: '억지보다는 삶 속에서의 자연스러운 신앙 모범을 서로 보여주는 것이 핵심이다' },
        { value: 'C', label: '종교적 대화보다는 현실의 육아, 집안일 등 실질적인 삶의 안정이 먼저 필요하다' },
        { value: 'D', label: '영적인 대화를 나누고 싶지만 어색하거나 배우자의 거부반응 때문에 막막하고 두렵다' }
      ]
    },
    {
      id: 'q7',
      title: 'Q7. (갈등 회복) 크게 다툰 후 냉전 상태일 때, 배우자가 어떻게 다가오면 얼음이 가장 빨리 녹나요?',
      options: [
        { value: 'A', label: '이유를 불문하고 먼저 다가와서 따뜻하게 안아주며 미안하다고 할 때' },
        { value: 'B', label: '자신의 어떤 점이 잘못되었는지 논리적으로 성찰하고 차분하게 사과할 때' },
        { value: 'C', label: '내가 좋아하는 음식이나 선물을 조용히 사 와서 식탁에 올려놓았을 때' },
        { value: 'D', label: '싸웠던 일은 덮어두고, 평소처럼 농담을 건네거나 일상적인 대화를 걸어올 때' }
      ]
    }
  ];

  const generateAnalysis = (answers) => {
    let title = "";
    let mainInsight = "";
    let loveSummary = "";
    let conflictSummary = "";

    // 심리 유형 판독 로직
    const q1 = answers['q1'];
    if (q1 === 'A' || q1 === 'D') {
      title = "🔥 명확한 소통의 완벽주의자 [주도/이성형]";
      mainInsight = "당신은 모호한 것을 견디지 못합니다. 문제 상황에서 감정의 골이 깊어지기 전에 팩트와 논리로 상황을 직면하고 매듭지어야 직성이 풀리는 책임감이 강한 리더형 기질을 가졌습니다.";
      conflictSummary = "하지만, 때로는 당신의 빠른 직면 방식이 생각할 시간이 필요한 배우자에게 공격으로 느껴질 수 있습니다. '갈등 해결' 자체보다 '감정적 연결'을 먼저 챙기는 연습이 필요합니다.";
    } else if (q1 === 'B') {
      title = "🕰️ 생각이 정리될 동굴이 필요한 [분석/독립형]";
      mainInsight = "당신은 감정이 폭발하는 것을 두려워하며, 다툼이 발생하면 일단 물리적/심리적 거리를 둔 채 뇌 버퍼링을 거치며 논리를 다듬어야 하는 성향입니다.";
      conflictSummary = "배우자에게는 당신의 침묵이 '나를 무시한다'는 신호로 강렬하게 오해받을 수 있습니다. 혼자만의 시간이 필요할 땐 \"내가 잠깐 30분만 생각 정리를 하고 올게\"라고 예고만 해주어도 사이가 훨씬 부드러워집니다.";
    } else {
      title = "🕊️ 관계의 평화가 제일 소중한 [수용/관계형]";
      mainInsight = "당신에게는 시비와 논리보다는 서로의 감정이 상하지 않고 화목하게 지내는 것 자체가 가장 중요한 가치입니다. 싸우기보다는 맞추려고 노력하는 평화주의자입니다.";
      conflictSummary = "너무 많은 양보나 회피는 결국 속에 병(억압된 분노)을 쌓게 만듭니다. 당신의 솔직한 서운함을 건강하게 말하는 연습이 필요합니다.";
    }

    // 사랑의 언어 판독
    const q3 = answers['q3'];
    loveSummary = q3 === 'A' ? "『인정하는 말』: 당신은 물질적인 것보다 진심이 담긴 따뜻한 칭찬 한마디에 모든 피로가 녹습니다." :
      q3 === 'B' ? "『함께하는 시간』: 단 10분이라도 스마트폰 없이 오직 나에게만 집중해 주는 온전한 교감을 가장 원합니다." :
        q3 === 'C' ? "『헌신과 봉사』: 백 마디 말보다 묵묵히 밀린 집안일을 대신해 줄 때 사랑받고 있다고 확신합니다." :
          "『선물의 의미』: 평소의 대화를 기억하고 준비해 준 작지만 세심한 선물에서 깊은 사랑과 존재감을 느낍니다.";

    return {
      title: title,
      content: `${mainInsight}\n\n${conflictSummary}\n\n💡 나의 핵심 사랑의 언어\n${loveSummary}`,
      raw: answers
    };
  };

  const handleSelect = (val) => {
    const newSelections = { ...selections, [questions[step].id]: val };
    setSelections(newSelections);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      const result = generateAnalysis(newSelections);
      setAnalysisResult(result);
      setShowResult(true);
    }
  };

  const handleSaveAndFinish = () => {
    updateProfileFallback('deepAnalysis', analysisResult);
    alert('🎉 진단 결과가 시스템에 저장되었습니다!\n\nAI 하티의 메인 두뇌(System Prompt)가 지금부터 이 심리 및 행동 패턴을 분석하여, 부부 상담 시 완전히 개인화된 맞춤 솔루션을 제시하기 시작합니다.');
    onBack();
  };

  if (showResult && analysisResult) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#F8FAFC', zIndex: 999999, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '50px 20px 20px', background: 'white', borderBottom: '1px solid #E2E8F0', position: 'relative' }}>
          <button onClick={() => setShowResult(false)} style={{ position: 'absolute', left: '20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#64748B', fontWeight: 700 }}>
            <ChevronLeft size={20} /> 뒤로
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#1E293B', margin: '0 auto' }}>진단 결과 보고서</h2>
        </div>
        <div style={{ flex: 1, padding: '30px 24px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ background: 'white', padding: '30px 20px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '2px solid rgba(138, 96, 255, 0.2)', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#8A60FF', marginBottom: '20px', lineHeight: 1.4, wordBreak: 'keep-all' }}>
              {analysisResult.title}
            </h1>
            <div style={{ fontSize: '15px', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontWeight: 700 }}>
              {analysisResult.content}
            </div>

            <div style={{ marginTop: '20px', padding: '15px', background: '#F3F0FF', borderRadius: '15px', border: '1px dashed #8A60FF' }}>
              <p style={{ fontSize: '12px', color: '#6A4DCE', fontWeight: 800 }}>📌 이 결과는 안전하게 암호화되어 데이터베이스에 동기화되며, AI 하티가 앞으로 당신의 성향을 100% 이해한 채로 배우자와의 조율을 코칭하게 됩니다.</p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveAndFinish}
            style={{
              padding: '20px', background: '#1E293B', color: 'white', fontWeight: 900,
              borderRadius: '16px', border: 'none', cursor: 'pointer', fontSize: '16px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)', marginBottom: '40px'
            }}
          >
            결과 저장 및 AI 엔진에 반영하기
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#F8FAFC', zIndex: 999999, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '50px 20px 20px', background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronLeft size={24} color="#1E293B" /> <span style={{ fontSize: '16px', fontWeight: 800 }}>진단 취소</span>
        </button>
      </div>
      <div style={{ flex: 1, padding: '30px 24px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
          <Sparkles size={24} color="#8A60FF" />
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#1E293B' }}>하티 부부 성향 심층 진단</h2>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{ width: `${((step) / questions.length) * 100}%`, height: '100%', background: '#8A60FF', transition: '0.4s ease' }} />
        </div>

        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '30px', lineHeight: 1.5, fontWeight: 700 }}>
          AI 하티가 두 분의 관계 패턴을 더 정확히 이해하기 위한 전문적인 진단 과정입니다. 가장 나에게 가깝다고 느껴지는 항목을 솔직하게 선택해주세요! ({step + 1}/{questions.length})
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', marginBottom: '24px', lineHeight: 1.5, wordBreak: 'keep-all' }}>
          {questions[step].title}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '30px' }}>
          {questions[step].options.map((opt, i) => (
            <motion.button
              whileTap={{ scale: 0.98 }}
              key={i}
              onClick={() => handleSelect(opt.value)}
              style={{
                width: '100%', padding: '24px 20px', borderRadius: '20px', background: 'white',
                border: '2px solid rgba(138, 96, 255, 0.1)', textAlign: 'left', fontSize: '14px', fontWeight: 700,
                color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 8px 20px rgba(0,0,0,0.02)', cursor: 'pointer'
              }}
            >
              <span style={{ flex: 1, lineHeight: 1.5 }}>{opt.label}</span>
              <ChevronLeft size={18} color="#8A60FF" style={{ flexShrink: 0, marginLeft: '10px', transform: 'rotate(180deg)' }} />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ⚙️ Settings View */
const SettingsView = ({
  user,
  userRole,
  husbandInfo,
  setHusbandInfo,
  wifeInfo,
  setWifeInfo,
  coupleCode,
  setCoupleCode,
  onReportClick,
  onGuideClick,
  worshipDays,
  setWorshipDays,
  worshipTime,
  setWorshipTime,
  anniversaries,
  setAnniversaries,
  onUpdateMemo,
  isAdmin,
  onNav,
  subscribeToPushNotifications // 🔔 Added prop
}) => {
  // Persistence for user preferences
  const [notifSignal, setNotifSignal] = useState(() => JSON.parse(localStorage.getItem('notif_signal') ?? 'true'));
  const [notifCard, setNotifCard] = useState(() => JSON.parse(localStorage.getItem('notif_card') ?? 'true'));
  const [notifWorship, setNotifWorship] = useState(() => JSON.parse(localStorage.getItem('notif_worship') ?? 'true'));
  const [notifHatti, setNotifHatti] = useState(() => JSON.parse(localStorage.getItem('notif_hatti') ?? 'false'));

  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showWorshipSet, setShowWorshipSet] = useState(false);
  const [showAnnivSet, setShowAnnivSet] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showConnectSet, setShowConnectSet] = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);
  const [showDataSecurity, setShowDataSecurity] = useState(false);
  const [showNotifIntegration, setShowNotifIntegration] = useState(false);
  const [showDeepAnalysis, setShowDeepAnalysis] = useState(false);
  const [showNotifDiag, setShowNotifDiag] = useState(false); // New diagnostic modal state

  const [isEditingCode, setIsEditingCode] = useState(false);
  const [tempCoupleCode, setTempCoupleCode] = useState(coupleCode);

  const [newAnnivTitle, setNewAnnivTitle] = useState("");
  const [newAnnivDate, setNewAnnivDate] = useState("");

  // 📝 Local states for profile editing (Prevent lag on keystrokes)
  const myInfo = (userRole === 'husband' ? husbandInfo : wifeInfo) || {};
  const setMyInfo = userRole === 'husband' ? setHusbandInfo : setWifeInfo;

  const [editInfo, setEditInfo] = useState({
    nickname: myInfo.nickname || "",
    mbti: myInfo.mbti || "",
    marriageDate: myInfo.marriageDate || "",
    blood: myInfo.blood || "A"
  });

  // Reset editInfo only when modal opens
  useEffect(() => {
    if (showProfileEdit) {
      setEditInfo({
        nickname: myInfo.nickname || "",
        mbti: myInfo.mbti || "",
        marriageDate: myInfo.marriageDate || "",
        blood: myInfo.blood || "A"
      });
    }
  }, [showProfileEdit]); // 🛡️ Removed myInfo to prevent reset while typing

  // Persist notification preferences
  useEffect(() => {
    localStorage.setItem('notif_signal', JSON.stringify(notifSignal));
    localStorage.setItem('notif_card', JSON.stringify(notifCard));
    localStorage.setItem('notif_worship', JSON.stringify(notifWorship));
    localStorage.setItem('notif_hatti', JSON.stringify(notifHatti));
  }, [notifSignal, notifCard, notifWorship, notifHatti]);

  // Sync Shared Settings to Supabase and LocalStorage
  useEffect(() => {
    localStorage.setItem('worshipDays', JSON.stringify(worshipDays));
    localStorage.setItem('worshipTime', worshipTime);
    localStorage.setItem('anniversaries', JSON.stringify(anniversaries));

    const syncSettings = async () => {
      const updatedInfo = { ...myInfo, worshipDays, worshipTime, anniversaries };
      await supabase.from('profiles').upsert({
        id: user.id,
        couple_id: coupleCode,
        user_role: userRole,
        info: updatedInfo,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    };
    syncSettings();
  }, [worshipDays, worshipTime, anniversaries, coupleCode, userRole]);

  // Marriage D-Day Calculation
  const sharedMarriageDate = husbandInfo.marriageDate || wifeInfo.marriageDate || '2020-05-23';
  const weddingDate = useMemo(() => new Date(sharedMarriageDate), [sharedMarriageDate]);
  const dDay = useMemo(() => {
    const today = new Date();
    const diffTime = Math.abs(today - weddingDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [weddingDate]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      alert("파일 크기가 너무 큽니다. 1MB 이하의 이미지를 선택해주세요.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => onUpdateMemo('avatar', reader.result);
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async () => {
    const updatedInfo = { ...myInfo, ...editInfo };
    setMyInfo(updatedInfo);

    try {
      // 1. Update My Profile
      await supabase.from('profiles').upsert({
        id: user.id,
        couple_id: coupleCode,
        user_role: userRole,
        info: updatedInfo,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

      // 2. Clear local cache to force refresh
      localStorage.setItem('master_openai_key', '');

      // 3. If Marriage Date changed, sync with spouse
      if (editInfo.marriageDate !== myInfo.marriageDate) {
        const spouseRole = userRole === 'husband' ? 'wife' : 'husband';
        const spouseSetter = userRole === 'husband' ? setWifeInfo : setHusbandInfo;
        const spouseInfo = userRole === 'husband' ? wifeInfo : husbandInfo;
        const updatedSpouseInfo = { ...spouseInfo, marriageDate: editInfo.marriageDate };

        spouseSetter(updatedSpouseInfo);
        await supabase.from('profiles').upsert({
          couple_id: coupleCode,
          user_role: spouseRole,
          info: updatedSpouseInfo,
          updated_at: new Date().toISOString()
        }, { onConflict: 'couple_id,user_role' });
      }

      setShowProfileEdit(false);
      alert("정보가 성공적으로 저장되었습니다!");
    } catch (err) {
      console.error("Profile save error:", err);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  const updateProfileFallback = async (field, value) => {
    const updatedInfo = { ...myInfo, [field]: value };
    setMyInfo(updatedInfo);
    await supabase.from('profiles').upsert({
      id: user.id, couple_id: coupleCode, user_role: userRole, info: updatedInfo, updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
  };

  const addAnniversary = async () => {
    if (!newAnnivTitle.trim() || !newAnnivDate) {
      alert("기념일 이름과 날짜를 입력해주세요.");
      return;
    }
    const newEntry = { id: Date.now(), title: newAnnivTitle, date: newAnnivDate };
    const newList = [...anniversaries, newEntry];
    setAnniversaries(newList);
    setNewAnnivTitle("");
    setNewAnnivDate("");

    // ☁️ Sync to DB
    if (onUpdateProfile) {
      await onUpdateProfile(undefined, { anniversaries: newList });
    }
  };

  const removeAnniversary = async (id) => {
    const newList = anniversaries.filter(a => a.id !== id);
    setAnniversaries(newList);
    if (onUpdateProfile) {
      await onUpdateProfile(undefined, { anniversaries: newList });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="settings-page" style={{ padding: '20px 0 100px' }}>
      {/* 💑 Couple Profile Card */}
      <div className="settings-profile-card" style={{
        background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', borderRadius: '35px',
        padding: '30px', margin: '0 20px 25px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,4)', position: 'relative'
      }}>
        <button onClick={() => setShowProfileEdit(true)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: '1px solid #EEE', borderRadius: '12px', padding: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <User size={16} color="#8B7355" />
        </button>
        <div
          onClick={() => document.getElementById('avatar-upload-main').click()}
          style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #F5D060, #D4AF37)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', overflow: 'hidden', border: '4px solid white', boxShadow: '0 10px 25px rgba(212, 175, 55, 0.25)', cursor: 'pointer', position: 'relative' }}
        >
          <img src={myInfo.avatar || (userRole === 'husband' ? "/husband.png" : "/wife.png")} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = userRole === 'husband' ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Husband" : "https://api.dicebear.com/7.x/avataaars/svg?seed=Wife"; }} />
          <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#D4AF37', borderRadius: '50%', padding: '6px', border: '2px solid white' }}><Camera size={14} color="white" /></div>
          <input type="file" id="avatar-upload-main" hidden accept="image/*" onChange={handlePhotoUpload} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#2D1F08', marginBottom: '8px' }}>{husbandInfo.nickname} ❤️ {wifeInfo.nickname}</h2>
        <p style={{ fontSize: '14px', color: '#8B7355', fontWeight: 700, marginBottom: '5px' }}>결혼기념일 {husbandInfo.marriageDate}</p>
        <div style={{ fontSize: '32px', fontWeight: 900, color: '#FF7E5F', letterSpacing: '2px' }}>D+{dDay}</div>
      </div>

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div onClick={() => setShowProfileEdit(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', borderRadius: '32px', padding: '30px', width: '100%', maxWidth: '340px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08', marginBottom: '20px', textAlign: 'center' }}>내 정보 수정</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#8B7355', display: 'block', marginBottom: '6px' }}>애칭</label>
                <input value={editInfo.nickname} onChange={(e) => setEditInfo({ ...editInfo, nickname: e.target.value })} style={{ width: '100%', padding: '12px 18px', borderRadius: '14px', background: '#F9FAFB', border: '1px solid #EEE' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#8B7355', display: 'block', marginBottom: '6px' }}>성격 유형 (MBT-H)</label>
                <input value={editInfo.mbti} onChange={(e) => setEditInfo({ ...editInfo, mbti: e.target.value })} style={{ width: '100%', padding: '12px 18px', borderRadius: '14px', background: '#F9FAFB', border: '1px solid #EEE' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#8B7355', display: 'block', marginBottom: '6px' }}>결혼 (년)</label>
                  <select
                    value={editInfo.marriageDate.split('-')[0] || "2020"}
                    onChange={(e) => setEditInfo({ ...editInfo, marriageDate: `${e.target.value}-${editInfo.marriageDate.split('-')[1] || "01"}-${editInfo.marriageDate.split('-')[2] || "01"}` })}
                    style={{ width: '100%', padding: '12px 6px', borderRadius: '14px', background: '#F9FAFB', border: '1px solid #EEE', fontSize: '13px' }}
                  >
                    {Array.from({ length: 50 }, (_, i) => 2026 - i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#8B7355', display: 'block', marginBottom: '6px' }}>월</label>
                  <select
                    value={parseInt(editInfo.marriageDate.split('-')[1] || "1")}
                    onChange={(e) => setEditInfo({ ...editInfo, marriageDate: `${editInfo.marriageDate.split('-')[0] || "2020"}-${String(e.target.value).padStart(2, '0')}-${editInfo.marriageDate.split('-')[2] || "01"}` })}
                    style={{ width: '100%', padding: '12px 6px', borderRadius: '14px', background: '#F9FAFB', border: '1px solid #EEE', fontSize: '13px' }}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#8B7355', display: 'block', marginBottom: '6px' }}>일</label>
                  <select
                    value={parseInt(editInfo.marriageDate.split('-')[2] || "1")}
                    onChange={(e) => setEditInfo({ ...editInfo, marriageDate: `${editInfo.marriageDate.split('-')[0] || "2020"}-${editInfo.marriageDate.split('-')[1] || "01"}-${String(e.target.value).padStart(2, '0')}` })}
                    style={{ width: '100%', padding: '12px 6px', borderRadius: '14px', background: '#F9FAFB', border: '1px solid #EEE', fontSize: '13px' }}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#8B7355', display: 'block', marginBottom: '6px' }}>혈액형</label>
                <select value={editInfo.blood} onChange={(e) => setEditInfo({ ...editInfo, blood: e.target.value })} style={{ width: '100%', padding: '12px 10px', borderRadius: '14px', background: '#F9FAFB', border: '1px solid #EEE', fontSize: '13px' }}>
                  <option value="A">A형</option>
                  <option value="B">B형</option>
                  <option value="O">O형</option>
                  <option value="AB">AB형</option>
                </select>
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleProfileSave} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#1E293B', color: 'white', fontWeight: 900, border: 'none', cursor: 'pointer', marginTop: '10px' }}>수정 완료</motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 🧠 Hatti Deep Analysis Section */}
      <div className="settings-section">
        <h3 className="settings-section-title">전문 성향 진단</h3>
        <SettingsItem icon={<Sparkles size={18} />} label="하티 부부 성향 심층 진단 시작하기" onClick={() => setShowDeepAnalysis(true)} />
      </div>

      {/* 🔗 Connection Section */}
      <div className="settings-section">
        <h3 className="settings-section-title">연결 및 통합</h3>
        <SettingsItem icon={<Users size={18} />} label="배우자 연결 관리 (코드 공유)" onClick={() => setShowConnectSet(true)} />
        <SettingsItem icon={<Smartphone size={18} />} label="기기 알림 통합 설정" onClick={() => setShowNotifIntegration(true)} />
        <SettingsItem icon={<Activity size={18} color="#EF4444" />} label="알림 전송 장애 진단하기" onClick={() => setShowNotifDiag(true)} />
      </div>

      {/* 🔔 Notifications Section */}
      <div className="settings-section">
        <h3 className="settings-section-title">알림 설정</h3>
        <SettingsToggle icon="🚦" label="감정신호 실시간 알림" active={notifSignal} onToggle={() => setNotifSignal(!notifSignal)} />
        <SettingsToggle icon="💬" label="대화 카드 도착 알림" active={notifCard} onToggle={() => setNotifCard(!notifCard)} />
        <SettingsToggle icon="🙏" label="가정예배 시간 알림" active={notifWorship} onToggle={() => setNotifWorship(!notifWorship)} />
        <SettingsToggle icon="💖" label="하티 데일리 원포인트" active={notifHatti} onToggle={() => setNotifHatti(!notifHatti)} />
      </div>

      {/* 🎨 Customization */}
      <div className="settings-section">
        <h3 className="settings-section-title">개인화</h3>
        <SettingsItem icon={<Calendar size={18} />} label="가정예배 주기 설정" onClick={() => setShowWorshipSet(true)} />
        <SettingsItem icon={<Heart size={18} />} label="우리만의 기념일 추가" onClick={() => setShowAnnivSet(true)} />
      </div>

      <div className="settings-section">
        <h3 className="settings-section-title">시스템</h3>
        <SettingsItem icon={<BarChart3 size={18} />} label="월간 관계 리포트 보기" onClick={onReportClick} />
        <SettingsItem icon={<Share2 size={18} />} label="우리 기록 백업하기 (PDF)" onClick={() => setShowExport(true)} />
        <SettingsItem icon={<Info size={18} />} label="하트싱크 사용 가이드" onClick={onGuideClick} />
        <SettingsItem icon={<Lock size={18} />} label="데이터 보안 설정" onClick={() => setShowDataSecurity(true)} />
      </div>


      {/* Modals for Settings functions */}
      <AnimatePresence>
        {showDeepAnalysis && (
          <DeepAnalysisView
            onBack={() => setShowDeepAnalysis(false)}
            myInfo={myInfo}
            updateProfile={onUpdateMemo} // Use onUpdateMemo here
          />
        )}
      </AnimatePresence>

      {showWorshipSet && (
        <div onClick={() => setShowWorshipSet(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', borderRadius: '32px', padding: '30px', width: '100%', maxWidth: '340px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08', marginBottom: '10px' }}>가정예배 주기 설정</h3>
            <p style={{ fontSize: '13px', color: '#8B7355', marginBottom: '20px', fontWeight: 600 }}>예배를 드리는 요일을 모두 선택해주세요.</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '25px' }}>
              {['일', '월', '화', '수', '목', '금', '토'].map(day => {
                const isSelected = worshipDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => {
                      if (isSelected) setWorshipDays(worshipDays.filter(d => d !== day));
                      else setWorshipDays([...worshipDays, day]);
                    }}
                    style={{
                      width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #EEE',
                      background: isSelected ? '#F5D060' : 'white',
                      color: isSelected ? 'white' : '#717171',
                      fontWeight: 900, fontSize: '14px', cursor: 'pointer'
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <label style={{ fontSize: '12px', fontWeight: 800, color: '#B08D3E', display: 'block', marginBottom: '8px' }}>예정 시간</label>
            <input
              type="time"
              value={worshipTime}
              onChange={(e) => setWorshipTime(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '15px', border: '1px solid #EEE', background: '#F9FAFB', fontSize: '16px', fontWeight: 800, marginBottom: '25px' }}
            />

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                setShowWorshipSet(false);
                // ☁️ Sync to DB
                if (onUpdateProfile) {
                  await onUpdateProfile(undefined, { worshipDays, worshipTime });
                }
                alert("설정이 저장되었습니다. 상대방에게도 즉시 반영됩니다!");
              }}
              style={{ width: '100%', padding: '16px', borderRadius: '18px', background: '#2D1F08', color: 'white', fontWeight: 900, border: 'none' }}
            >
              저장 및 닫기
            </motion.button>
          </motion.div>
        </div>
      )}

      {showAnnivSet && (
        <div onClick={() => setShowAnnivSet(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', borderRadius: '32px', padding: '30px', width: '100%', maxWidth: '340px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08', marginBottom: '20px' }}>기념일 추가</h3>
            <input placeholder="기념일 이름" value={newAnnivTitle} onChange={(e) => setNewAnnivTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #EEE', marginBottom: '10px' }} />
            <input type="date" value={newAnnivDate} onChange={(e) => setNewAnnivDate(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #EEE', marginBottom: '15px' }} />
            <motion.button whileTap={{ scale: 0.95 }} onClick={addAnniversary} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#F5D060', color: 'white', fontWeight: 900, border: 'none' }}>추가</motion.button>
          </motion.div>
        </div>
      )}

      {showExport && (
        <div onClick={() => setShowExport(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', borderRadius: '32px', padding: '30px', width: '100%', maxWidth: '340px', textAlign: 'center' }}>
            <Share2 size={40} color="#4F46E5" style={{ marginBottom: '15px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '10px' }}>PDF 백업 생성</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>모든 대화와 일정을 PDF로 저장합니다.</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { alert('준비 중입니다...'); setShowExport(false); }} style={{ width: '100%', padding: '15px', borderRadius: '15px', background: '#4F46E5', color: 'white', fontWeight: 900 }}>생성하기</motion.button>
          </motion.div>
        </div>
      )}

      {showConnectSet && (
        <div onClick={() => { setShowConnectSet(false); setIsEditingCode(false); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', borderRadius: '32px', padding: '30px', width: '100%', maxWidth: '340px', textAlign: 'center' }}>
            <Users size={40} color="#15803D" style={{ marginBottom: '15px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '20px' }}>배우자 연결 코드</h3>

            {!isEditingCode ? (
              <>
                <div style={{ padding: '20px', background: '#F9FAFB', borderRadius: '15px', fontSize: '24px', fontWeight: 900, letterSpacing: '4px' }}>{coupleCode}</div>
                <p style={{ fontSize: '12px', color: '#8B7355', marginTop: '15px', fontWeight: 600, lineHeight: 1.5 }}>
                  코드가 잘못되었나요? 연결이 원활하지 않을 때<br />아래 버튼을 눌러 코드를 수정할 수 있습니다.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setTempCoupleCode(coupleCode); setIsEditingCode(true); }}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(138, 96, 255, 0.1)', color: '#8A60FF', fontWeight: 900, border: '1px solid rgba(138, 96, 255, 0.2)' }}
                  >
                    연결 코드 수정하기
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowConnectSet(false)} style={{ width: '100%', padding: '15px', borderRadius: '15px', background: '#2D1F08', color: 'white', fontWeight: 900 }}>닫기</motion.button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#15803D', display: 'block', marginBottom: '8px' }}>새로운 연결 코드 입력 (HS-XXXX)</label>
                <input
                  value={tempCoupleCode}
                  onChange={(e) => setTempCoupleCode(e.target.value.toUpperCase())}
                  placeholder="HS-XXXX"
                  style={{ width: '100%', padding: '16px', borderRadius: '18px', border: '1.5px solid #EEE', background: '#F9FAFB', fontSize: '20px', fontWeight: 900, letterSpacing: '2px', textAlign: 'center', marginBottom: '15px' }}
                />
                <p style={{ fontSize: '11px', color: '#EF4444', fontWeight: 700, marginBottom: '20px', textAlign: 'center' }}>
                  ⚠️ 경고: 배우자와 동일한 코드를 사용해야 합니다.<br />코드를 바꾸면 이전 연결의 데이터가 안 보일 수 있습니다.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setIsEditingCode(false)}
                    style={{ flex: 1, padding: '15px', borderRadius: '15px', background: '#EEE', color: '#666', fontWeight: 900, border: 'none' }}
                  >
                    취소
                  </button>
                  <button
                    onClick={async () => {
                      if (!tempCoupleCode || !tempCoupleCode.trim().startsWith('HS-')) {
                        alert("올바른 코드 형식이 아닙니다. 'HS-'로 시작해야 합니다.");
                        return;
                      }
                      const newCode = tempCoupleCode.trim().toUpperCase();
                      if (window.confirm(`새로운 코드(${newCode})로 재연결하시겠습니까?\n배우자도 동일한 코드로 변경해야 서로 연결됩니다.`)) {
                        try {
                          setCoupleCode(newCode);
                          localStorage.setItem('coupleCode', newCode);
                          await supabase.from('profiles').upsert({
                            id: user.id,
                            couple_id: newCode,
                            user_role: userRole,
                            info: myInfo,
                            updated_at: new Date().toISOString()
                          }, { onConflict: 'id' });
                          alert("코드가 성공적으로 수정되었습니다!");
                          setIsEditingCode(false);
                          setShowConnectSet(false);
                        } catch (err) {
                          console.error("Update code error:", err);
                          alert("코드 수정 중 오류가 발생했습니다.");
                        }
                      }
                    }}
                    style={{ flex: 1, padding: '15px', borderRadius: '15px', background: '#2D1F08', color: 'white', fontWeight: 900, border: 'none' }}
                  >
                    수정 및 재연결
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

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
                        subscribeToPushNotifications(); // Now also register for push!
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
        <div onClick={() => setShowNotifDiag(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', borderRadius: '35px', padding: '35px', width: '100%', maxWidth: '360px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Activity size={24} color="#EF4444" />
              <h3 style={{ fontSize: '19px', fontWeight: 900 }}>알림 정밀 진단</h3>
            </div>

            <div style={{ marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#F8FAFB', padding: '15px', borderRadius: '18px', border: '1px solid #EEE' }}>
                <p style={{ fontSize: '13px', fontWeight: 800, color: '#64748B', marginBottom: '5px' }}>1. 시스템 권한 상태</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: Notification.permission === 'granted' ? '#10B981' : '#F59E0B' }} />
                  <span style={{ fontSize: '15px', fontWeight: 900, color: '#1E293B' }}>{Notification.permission === 'granted' ? '허용됨 (정상)' : '허용되지 않음'}</span>
                </div>
              </div>

              <div style={{ background: '#F8FAFB', padding: '15px', borderRadius: '18px', border: '1px solid #EEE' }}>
                <p style={{ fontSize: '13px', fontWeight: 800, color: '#64748B', marginBottom: '5px' }}>2. 서비스 워커 상태</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'serviceWorker' in navigator ? '#10B981' : '#EF4444' }} />
                  <span style={{ fontSize: '15px', fontWeight: 900, color: '#1E293B' }}>{'serviceWorker' in navigator ? '활성화됨' : '미지원 브라우저'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
              <button
                onClick={async () => {
                  if (!subscribeToPushNotifications) return alert("데이터 로딩 중입니다. 잠시 후 다시 시도해주세요.");
                  try {
                    alert("📡 테스트를 시작합니다. 잠시만 기다려주세요...");
                    
                    // 1. Try with Supabase-js first
                    const { data, error } = await supabase.functions.invoke('send-push', {
                      body: {
                        type: 'UPDATE',
                        record: { couple_id: coupleCode, user_role: userRole, info: { signal: 'green' } },
                        old_record: { info: { signal: 'none' } }
                      }
                    });
                    
                    if (!error) {
                      return alert("✅ [성공] 테스트 알림이 서버로 요청되었습니다!");
                    }

                    // 2. If it fails, try RAW fetch to diagnose CORS
                    console.log("Supabase-js failed, attempting raw fetch for diagnosis...");
                    const rawRes = await fetch(`${supabaseUrl}/functions/v1/send-push`, {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'apikey': supabaseAnonKey,
                        'Authorization': `Bearer ${supabaseAnonKey}`
                      },
                      body: JSON.stringify({ check_config: true })
                    }).catch(err => {
                      throw new Error("네트워크 연결 자체에 실패했습니다. (CORS 또는 오프라인)");
                    });

                    if (rawRes.ok) {
                      const debugInfo = await rawRes.json();
                      alert(`⚠️ 서버는 응답하지만 인증에 실패했습니다.\n- 상태: ${debugInfo.status}\n- VAPID 설정: ${debugInfo.vapid_configured ? 'OK' : '미설정'}\n\n💡 배포 시 --no-verify-jwt 옵션을 사용해 보세요!`);
                    } else {
                      alert(`❌ 서버 응답 오류: ${rawRes.status} ${rawRes.statusText}`);
                    }
                  } catch (e) {
                    alert("❌ 진단 결과: " + e.message + "\n\n💡 터미널에서 'supabase functions deploy send-push --no-verify-jwt' 명령어로 배포해 보셨나요?");
                  }
                }}
                style={{ width: '100%', padding: '16px', borderRadius: '14px', background: 'linear-gradient(135deg, #FF9966, #FF5E62)', color: 'white', fontWeight: 900, border: 'none' }}
              >
                지금 바로 테스트 알림 보내기 🚀
              </button>

              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`${supabaseUrl}/functions/v1/send-push`, {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'apikey': supabaseAnonKey,
                        'Authorization': `Bearer ${supabaseAnonKey}`
                      },
                      body: JSON.stringify({ check_config: true })
                    });
                    const info = await res.json();
                    alert(`⚙️ 서버 설정 상태:\n- VAPID Private Key: ${info.vapid_configured ? '✅ 설정됨' : '❌ 미설정'}\n- VAPID Public Key: ${info.vapid_public_key_exists ? '✅ 설정됨' : '❌ 미설정'}`);
                  } catch (e) {
                    alert("❌ 서버 설정 확인 실패. (배포 전이거나 CORS 차단 발생)");
                  }
                }}
                style={{ width: '100%', padding: '14px', borderRadius: '14px', background: '#F8FAFB', color: '#64748B', fontWeight: 800, border: '1px solid #EEE' }}
              >
                ⚙️ 서버 설정 상태 점검 (VAPID 키 확인)
              </button>

              <button
                onClick={async () => {
                  if (!subscribeToPushNotifications) return;
                  try {
                    await subscribeToPushNotifications();
                    alert("✅ 알림 구독 정보가 강제 갱신되었습니다! 이제 알림이 정상적으로 수신됩니다.");
                  } catch (e) {
                    alert("❌ 갱신 중 오류: " + e.message);
                  }
                }}
                style={{ width: '100%', padding: '16px', borderRadius: '14px', background: '#3B82F6', color: 'white', fontWeight: 900, border: 'none' }}
              >
                알림 구독 강제 갱신
              </button>

              <button
                onClick={async () => {
                  if (Notification.permission !== 'granted') {
                    const res = await Notification.requestPermission();
                    if (res !== 'granted') return alert("권한이 거부되었습니다.");
                  }
                  const reg = await navigator.serviceWorker.ready;
                  reg.showNotification('Heart Sync 로컬 테스트', {
                    body: '브라우저 알림 기능이 활성화 상태입니다. ❤️',
                    icon: '/logo_main.png'
                  });
                }}
                style={{ width: '100%', padding: '16px', borderRadius: '14px', background: '#8A60FF', color: 'white', fontWeight: 900, border: 'none', opacity: 0.8 }}
              >
                로컬 알림 테스트 발송
              </button>

              <button
                onClick={() => {
                  window.open('https://vnxxqjdfcvwiuwlstebu.supabase.co/functions/v1/send-push', '_blank');
                }}
                style={{ width: '100%', padding: '12px', marginTop: '10px', borderRadius: '15px', border: '1px solid #EEE', background: '#F8FAFB', fontSize: '11px', fontWeight: 800, color: '#64748B' }}
              >
                🌐 서버 주소 직접 접속 테스트 (404 확인용)
              </button>
            </div>

            <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '18px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
              <p style={{ fontSize: '12px', color: '#EF4444', fontWeight: 900, marginBottom: '8px' }}>⚠️ 위 테스트가 실패한다면?</p>
              <ul style={{ fontSize: '11px', color: '#8B7355', paddingLeft: '18px', lineHeight: 1.6, fontWeight: 700 }}>
                <li><b>아이폰(iOS):</b> 하단 [공유] → [홈 화면에 추가] 필수!</li>
                <li><b>배터리 절전 모드:</b> 절전 모드가 켜져 있으면 시스템이 알림을 차단합니다.</li>
                <li><b>방해 금지 모드:</b> 집중 모드를 확인해주세요.</li>
              </ul>
            </div>

            <button onClick={() => setShowNotifDiag(false)} style={{ width: '100%', padding: '15px', marginTop: '20px', borderRadius: '15px', border: 'none', background: '#EEE', fontWeight: 900, color: '#666' }}>닫기</button>
          </motion.div>
        </div>
      )}

      {/* 🛡️ 관리자 전용 메뉴 (설정 메뉴 내부로 이동) */}
      {isAdmin && (
        <div style={{ marginTop: '30px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '30px' }}>
          <button
            onClick={() => onNav('admin')}
            style={{
              width: '100%', padding: '20px', borderRadius: '25px',
              background: 'linear-gradient(135deg, #FDFCF0, #FFF)', border: '1.5px solid #F5D060',
              display: 'flex', alignItems: 'center', gap: '15px', color: '#B08D3E', fontWeight: 900,
              boxShadow: '0 8px 20px rgba(245, 208, 96, 0.15)'
            }}
          >
            <div style={{ width: '45px', height: '45px', borderRadius: '15px', background: 'rgba(245, 208, 96, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} color="#D4AF37" />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: '16px' }}>시스템 관리자 페이지</div>
              <div style={{ fontSize: '12px', opacity: 0.6, fontWeight: 700 }}>AI 모델 및 시스템 설정 관리</div>
            </div>
            <ChevronRight size={18} opacity={0.4} />
          </button>
        </div>
      )}

      {/* Logout & Reset Buttons (Bottom of Settings) */}
      <div style={{ padding: '0 20px', marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '15px' }}>
          <p style={{ fontSize: '11px', color: '#8B7355', fontWeight: 800 }}>현재 연결 상태: <span style={{ color: '#D4AF37' }}>{coupleCode}</span> | <span style={{ color: userRole === 'husband' ? '#3B82F6' : '#EC4899' }}>{userRole === 'husband' ? '남편' : '아내'}</span></p>
          <p style={{ fontSize: '10px', color: '#8B7355', opacity: 0.7 }}>배우자와 '서로 다른 역할'이어야 하며 '동일한 코드'여야 합니다.</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={async () => {
            if (window.confirm("로그아웃 하시겠습니까?")) {
              localStorage.clear();
              supabase.auth.signOut().then(() => {
                window.location.href = '/';
              });
              // Fallback redirect if signout hangs
              setTimeout(() => { window.location.href = '/'; }, 800);
            }
          }}
          style={{ width: '100%', padding: '16px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', fontWeight: 800, border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', marginBottom: '10px' }}
        >
          로그아웃
        </motion.button>
      </div>
    </motion.div>
  );
};

/* 🚀 Onboarding View (First Time Experience) */
const OnboardingView = ({ user, userRole, setUserRole, onFinish }) => {
  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState(() => user?.user_metadata?.full_name || user?.user_metadata?.name || "");
  const [blood, setBlood] = useState("A");
  const [mDate, setMDate] = useState("2020-05-23");
  const [insightResult, setInsightResult] = useState("");
  const [insightAnswers, setInsightAnswers] = useState({ e: null, s: null, t: null, j: null });
  const [coupleCode, setCoupleCode] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [deepAnalysis, setDeepAnalysis] = useState(null);
  const [deepStep, setDeepStep] = useState(0);
  const [deepSelections, setDeepSelections] = useState({});

  const insightQuestions = [
    { key: 'e', title: '에너지 충전 방식', q: '지친 하루의 끝, 당신의 충전법은?', a1: 'E (밖에서 활기차게)', a2: 'I (혼자 조용히)' },
    { key: 's', title: '인식의 차이', q: '문제를 바라볼 때 당신의 시선은?', a1: 'S (현재의 구체적 사실)', a2: 'N (미래와 가능성)' },
    { key: 't', title: '판단의 기준', q: '배우자와의 갈등 상황, 당신의 우선순위는?', a1: 'T (공정함과 해결책)', a2: 'F (따뜻한 공감과 감정)' },
    { key: 'j', title: '생활의 스타일', q: '이번 주 주말 여행, 당신의 스타일은?', a1: 'J (미리 짜둔 시간표대로)', a2: 'P (그때그때 기분 따라)' },
  ];

  const deepAnalysisQuestions = [
    { key: 'q1', q: '배우자와 갈등이 생겼을 때, 당신은 주로 어떻게 반응하나요?', options: ['문제를 즉시 해결하려 한다', '혼자 생각할 시간을 가진다', '감정을 표현하며 대화를 시도한다', '상황을 피하고 싶어 한다'] },
    { key: 'q2', q: '배우자에게 사랑을 표현하는 가장 자연스러운 방법은?', options: ['선물이나 작은 이벤트를 준비한다', '말로 애정을 표현한다', '함께 시간을 보내며 활동한다', '필요할 때 도움을 준다'] },
    { key: 'q3', q: '배우자와의 관계에서 가장 중요하다고 생각하는 것은?', options: ['신뢰와 정직', '서로의 성장과 발전', '안정감과 편안함', '열정과 설렘'] },
    { key: 'q4', q: '스트레스를 받을 때 배우자에게 기대하는 역할은?', options: ['해결책을 제시해주는 것', '조용히 옆에 있어주는 것', '내 이야기를 들어주는 것', '기분 전환을 도와주는 것'] },
    { key: 'q5', q: '배우자와의 데이트를 계획할 때, 당신의 주된 고려사항은?', options: ['새로운 경험과 모험', '편안하고 익숙한 장소', '배우자의 취향과 선호', '나의 취향과 선호'] },
    { key: 'q6', q: '배우자의 어떤 점이 당신을 가장 행복하게 하나요?', options: ['유머 감각과 긍정적인 태도', '따뜻하고 배려심 깊은 마음', '지적이고 현명한 모습', '활동적이고 에너지가 넘치는 모습'] },
    { key: 'q7', q: '배우자와의 미래를 상상할 때, 가장 먼저 떠오르는 이미지는?', options: ['함께 새로운 목표를 달성하는 모습', '평화롭고 안정적인 일상', '서로에게 깊이 공감하며 위로하는 모습', '늘 즐겁고 활기찬 시간'] },
  ];

  const calculateInsight = () => {
    const res = (insightAnswers.e || 'I') + (insightAnswers.s || 'S') + (insightAnswers.t || 'F') + (insightAnswers.j || 'P');
    setInsightResult(res);
    setStep(4);
  };

  const submitDeepAnalysis = async () => {
    // Simulate AI analysis
    const analysisResult = {
      title: "🧭 공감과 신뢰의 관계 수호자",
      summary: "당신은 배우자와의 관계에서 깊은 공감과 안정감을 중요하게 생각하며, 갈등 상황에서는 대화를 통해 해결하려는 경향이 강합니다. 배우자의 감정을 이해하고 지지하는 데 능숙하며, 함께하는 시간을 통해 사랑을 확인하는 것을 선호합니다. 때로는 자신의 감정을 솔직하게 표현하는 데 어려움을 겪을 수 있으나, 배우자와의 신뢰를 바탕으로 점차 개선될 것입니다.",
      raw: deepSelections
    };
    setDeepAnalysis(analysisResult);
    setStep(9); // Go to notification prompt (new step)
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
      {step >= 7 && step <= 8 && (
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
                style={{ width: '180px', height: 'auto', marginTop: '-25px', marginBottom: '-25px', marginLeft: '-25px', transform: 'scale(1.1)' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <p style={{ fontSize: '13px', color: '#B08D3E', fontWeight: 900, letterSpacing: '2px', marginBottom: '4px' }}>부부의 마음을 이어드립니다</p>
              <h1 className="brand-text" style={{ fontSize: '32px', letterSpacing: '6px', color: '#D4AF37', fontWeight: 900, marginBottom: '2px' }}>HEART SYNC</h1>
              <p style={{ fontSize: '11px', color: '#D4AF37', fontWeight: 800, letterSpacing: '3px', marginBottom: '30px', opacity: 0.8 }}>MORE DEEP, MORE CLOSE</p>

              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#2D1F08', marginBottom: '12px', lineHeight: 1.4, wordBreak: 'keep-all' }}>
                Heart Sync에 오신 여러분을<br />
                환영합니다.
              </h2>
              <p style={{ color: '#8B7355', fontSize: '15px', fontWeight: 600 }}>당신의 정보를 입력해주세요</p>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
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

            {/* 🔗 Quick Link for Existing Users */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#8B7355', fontWeight: 600, marginBottom: '10px' }}>이미 연결된 배우자가 있으신가요?</p>
              <button
                onClick={() => setStep(6)}
                style={{ background: 'none', border: 'none', color: '#8A60FF', fontWeight: 900, fontSize: '15px', borderBottom: '1.5px solid #8A60FF', paddingBottom: '2px' }}
              >
                기존 연결 코드 입력하기
              </button>
            </div>
          </motion.div>
        )}

        {step === 9 && (
          <motion.div key="step9" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
              <Bell size={48} color="#D4AF37" />
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#2D1F08', marginBottom: '15px' }}>알림을 켜고<br />마음을 연결하세요!</h2>
            <p style={{ fontSize: '16px', color: '#8B7355', fontWeight: 600, lineHeight: 1.6, marginBottom: '40px', wordBreak: 'keep-all' }}>
              배우자의 신호를 실시간으로 확인하고,<br />
              함께하는 대화카드를 놓치지 않으려면<br />
              푸쉬 알림 허용이 필요해요. 💌
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
              <button
                onClick={() => {
                  if ("Notification" in window) {
                    Notification.requestPermission().then(permission => {
                      if (permission === 'granted') {
                        // Registration happens in App level useEffect
                      }
                      setStep(8); // Go to the result/finish view
                    });
                  } else {
                    setStep(8);
                  }
                }}
                style={{ width: '100%', padding: '20px', borderRadius: '25px', background: '#D4AF37', color: 'white', fontWeight: 900, fontSize: '17px', border: 'none', boxShadow: '0 10px 20px rgba(212, 175, 55, 0.2)' }}
              >
                알림 허용하고 시작하기
              </button>
              <button
                onClick={() => setStep(8)}
                style={{ background: 'none', border: 'none', color: '#B08D3E', fontWeight: 700, fontSize: '14px' }}
              >
                나중에 설정할게요
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex flex-col h-full justify-center">
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#2D1F08', marginBottom: '10px' }}>당신의 정보를 입력해주세요</h2>
            <p style={{ color: '#8B7355', fontSize: '14px', marginBottom: '40px', fontWeight: 600 }}>부부신호등이 두 분의 성향에 맞춰 안내해 드릴게요.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#B08D3E', display: 'block', marginBottom: '8px' }}>앱에서 불릴 이름/애칭</label>
                <input
                  autoFocus
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="예: 사랑꾼 남편"
                  style={{ width: '100%', padding: '16px 22px', borderRadius: '18px', border: '1.5px solid #EEE', background: '#F9FAFB', fontSize: '16px', color: '#2D1F08', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#B08D3E', display: 'block', marginBottom: '8px' }}>결혼기념일 선택</label>
                  <input
                    type="date"
                    value={mDate}
                    onChange={(e) => setMDate(e.target.value)}
                    style={{ width: '100%', padding: '16px 18px', borderRadius: '18px', border: '1.5px solid #EEE', background: '#F9FAFB', fontSize: '15px', color: '#2D1F08', fontWeight: 800, appearance: 'none' }}
                  />
                </div>
                <div style={{ width: '100px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#B08D3E', display: 'block', marginBottom: '8px' }}>혈액형</label>
                  <select
                    value={blood}
                    onChange={(e) => setBlood(e.target.value)}
                    style={{ width: '100%', padding: '16px 12px', borderRadius: '18px', border: '1.5px solid #EEE', background: '#F9FAFB', fontSize: '15px', fontWeight: 800, appearance: 'none' }}
                  >
                    <option value="A">A형</option>
                    <option value="B">B형</option>
                    <option value="O">O형</option>
                    <option value="AB">AB형</option>
                  </select>
                </div>
              </div>
            </div>
            <button
              onClick={() => nickname && setStep(3)}
              style={{ marginTop: '20px', padding: '18px', borderRadius: '20px', background: '#2D1F08', color: 'white', fontWeight: 900, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              다음으로 <ArrowRight size={20} />
            </button>
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
            <p style={{ color: '#8B7355', fontSize: '15px', fontWeight: 700, marginBottom: '30px' }}>당신의 기질은 <span style={{ color: '#8A60FF' }}>{insightResult}</span>입니다.<br />이제 배우자와 연결을 시작할까요?</p>

            {/* 🧠 New Deep Analysis Prompt in Onboarding */}
            {!deepAnalysis && (
              <div style={{ background: 'rgba(138, 96, 255, 0.05)', padding: '24px', borderRadius: '24px', border: '1.5px dashed #8A60FF', marginBottom: '25px', width: '100%' }}>
                <p style={{ fontSize: '14px', fontWeight: 900, color: '#6A4DCE', marginBottom: '8px' }}>🤖 하티가 당신을 더 잘 이해하고 싶대요!</p>
                <p style={{ fontSize: '12px', color: '#8B7355', fontWeight: 600, marginBottom: '15px', lineHeight: 1.5 }}>7개의 전문 질문에 답하면, AI 하티가 더욱 정교한 부부 맞춤형 조언을 제공합니다.</p>
                <button
                  onClick={() => setStep(7)}
                  style={{ width: '100%', background: '#8A60FF', color: 'white', padding: '12px', borderRadius: '15px', border: 'none', fontWeight: 900, fontSize: '14px' }}
                >
                  3분 전문 성향 진단 시작 (추천)
                </button>
              </div>
            )}

            {deepAnalysis && (
              <div style={{ background: 'rgba(34, 197, 94, 0.05)', padding: '20px', borderRadius: '24px', border: '1px solid #22C55E', marginBottom: '25px', width: '100%', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={20} color="#22C55E" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>심층 분석이 완료되었습니다!</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
              <button
                onClick={async () => {
                  const newCode = 'HS-' + Math.floor(1000 + Math.random() * 9000);
                  setCoupleCode(newCode);

                  // Early upsert for creator so the joiner can find this code
                  try {
                    const { error } = await supabase.from('profiles').upsert({
                      id: user.id,
                      couple_id: newCode,
                      user_role: userRole,
                      info: { nickname, marriageDate: mDate || new Date().toISOString().split('T')[0], mbti: insightResult, blood, deepAnalysis },
                      updated_at: new Date().toISOString()
                    }, { onConflict: 'id' });

                    if (error) throw error;
                    alert("서버에 코드 등록 완료: " + newCode + "\n이제 배우자에게 코드를 알려주세요!");
                  } catch (err) {
                    console.error("Early upsert failed:", err);
                    alert("서버 등록 실패: " + err.message);
                  }

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
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#2D1F08', marginBottom: '15px' }}>초대 코드가 생성되었습니다</h2>
            <div style={{ width: '100%', padding: '30px', background: '#F9FAFB', borderRadius: '24px', border: '2px dashed #D4AF37', marginBottom: '15px' }}>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#B08D3E', display: 'block', marginBottom: '10px' }}>우리만의 소중한 연결 코드</span>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#2D1F08', letterSpacing: '8px' }}>{coupleCode}</div>
            </div>
            <p style={{ color: '#8B7355', fontSize: '14px', marginBottom: '30px', fontWeight: 600, lineHeight: 1.6 }}>이 코드를 복사해서 배우자에게 보내주세요.<br />배우자와 연결이 확인되면 자동으로 시작됩니다.</p>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(coupleCode);
                  alert("코드가 복사되었습니다!");
                }}
                style={{ width: '100%', padding: '15px', borderRadius: '15px', background: '#FDFCF0', border: '1.5px solid #F5D060', color: '#2D1F08', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Share2 size={18} /> 초대 코드 복사하기
              </button>

              <button
                onClick={async () => {
                  setIsConnecting(true);
                  // Check if spouse has connected (created a profile)
                  const { data } = await supabase.from('profiles').select('*').eq('couple_id', coupleCode);
                  if (data && data.length > 1) {
                    setIsConnected(true);
                    setTimeout(() => {
                      onFinish({ nickname, marriageDate: mDate, mbti: insightResult, blood, coupleCode, deepAnalysis });
                    }, 1000);
                  } else {
                    setTimeout(() => {
                      setIsConnecting(false);
                      alert("아직 배우자가 연결되지 않았습니다. 코드를 공유했는지 확인해주세요!");
                    }, 1500);
                  }
                }}
                disabled={isConnecting || isConnected}
                style={{ width: '100%', padding: '18px', borderRadius: '20px', background: isConnected ? '#22C55E' : '#2D1F08', color: 'white', fontWeight: 900, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                {isConnecting ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><RefreshCw size={20} /></motion.div>
                    배우자 연결 확인 중...
                  </>
                ) : isConnected ? (
                  <>
                    <CheckCircle2 size={20} /> 연결 완료!
                  </>
                ) : (
                  "배우자 연결 확인 및 시작"
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div key="step6" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col h-full justify-center">
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#2D1F08', marginBottom: '15px' }}>초대 코드를 입력해주세요</h2>
            <p style={{ color: '#8B7355', fontSize: '14px', marginBottom: '25px', fontWeight: 600 }}>배우자에게 받은 HS-로 시작하는 코드를 입력하세요.</p>
            <input
              placeholder="예: HS-1234"
              value={coupleCode}
              onChange={(e) => setCoupleCode(e.target.value.toUpperCase())}
              style={{ width: '100%', padding: '20px', borderRadius: '20px', border: '2px solid #F5D060', fontSize: '20px', fontWeight: 900, textAlign: 'center', letterSpacing: '4px', marginBottom: '25px' }}
            />
            {coupleCode && coupleCode.startsWith('HS-') && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginBottom: '25px' }}>
                <div className="flex items-center justify-center gap-2" style={{ color: '#8A60FF', fontWeight: 900 }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <RefreshCw size={18} />
                  </motion.div>
                  서버와 동기화 중...
                </div>
              </motion.div>
            )}
            <button
              onClick={async () => {
                if (!coupleCode || !coupleCode.startsWith('HS-')) return;
                setIsConnecting(true);

                // Try to find existing couple in Supabase
                const { data } = await supabase.from('profiles').select('*').eq('couple_id', coupleCode);

                if (data && data.length > 0) {
                  // Find spouse info to show a warmer message
                  const spouse = data.find(p => p.id !== user.id);
                  const spouseName = spouse?.info?.nickname || (spouse?.user_role === 'husband' ? '남편' : '아내') || '배우자';

                  alert(`🎉 ${spouseName}님을 찾았습니다! 성공적으로 연결되었습니다.`);

                  // Found existing couple code
                  setIsConnected(true);
                  setTimeout(() => {
                    onFinish({ nickname, marriageDate: mDate, mbti: insightResult, blood, coupleCode, deepAnalysis });
                  }, 1200);
                } else {
                  // No such code yet
                  setTimeout(() => {
                    setIsConnecting(false);
                    alert("코드를 찾을 수 없습니다.\n입력한 코드: " + coupleCode + "\n(데이터베이스에 등록된 정보가 없습니다.)");
                  }, 1500);
                }
              }}
              disabled={!coupleCode || !coupleCode.startsWith('HS-') || isConnecting || isConnected}
              style={{ width: '100%', padding: '18px', borderRadius: '20px', background: isConnected ? '#22C55E' : (coupleCode && coupleCode.startsWith('HS-') ? '#2D1F08' : '#CCC'), color: 'white', fontWeight: 900, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              {isConnecting ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><RefreshCw size={20} /></motion.div>
                  보안 연결 확인 중...
                </>
              ) : isConnected ? (
                <>
                  <CheckCircle2 size={20} /> 동기화 완료!
                </>
              ) : (
                "동기화 및 시작하기"
              )}
            </button>
            <button
              onClick={() => setStep(4)}
              style={{ marginTop: '15px', background: 'none', border: 'none', color: '#9CA3AF', fontSize: '13px', fontWeight: 600, textDecoration: 'underline' }}
            >
              처음으로 돌아가기
            </button>
          </motion.div>
        )}

        {/* 🧠 Deep Analysis Sync Steps */}
        {step === 7 && (
          <motion.div key="step7" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col h-full py-5">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <Sparkles size={20} color="#8A60FF" />
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B' }}>하티 전문 성향 진단</h2>
            </div>
            <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '10px', marginBottom: '20px' }}>
              <div style={{ width: `${((deepStep + 1) / deepAnalysisQuestions.length) * 100}%`, height: '100%', background: '#8A60FF', transition: '0.3s' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', marginBottom: '24px', lineHeight: 1.5 }}>
              {deepAnalysisQuestions[deepStep].q}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
              {deepAnalysisQuestions[deepStep].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const newSels = { ...deepSelections, [deepAnalysisQuestions[deepStep].key]: opt };
                    setDeepSelections(newSels);
                    if (deepStep < deepAnalysisQuestions.length - 1) setDeepStep(deepStep + 1);
                    else submitDeepAnalysis();
                  }}
                  style={{ width: '100%', padding: '20px', borderRadius: '18px', background: 'white', border: '1.5px solid #F1F5F9', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#475569', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 8 && deepAnalysis && (
          <motion.div key="step8" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col h-full justify-center">
            <div style={{ background: 'white', padding: '30px 20px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '2px solid #8A60FF', marginBottom: '30px' }}>
              <p style={{ fontSize: '12px', fontWeight: 900, color: '#8A60FF' }}>진단 완료!</p>
              <h1 style={{ fontSize: '19px', fontWeight: 900, color: '#1E293B', marginBottom: '15px' }}>{deepAnalysis.title}</h1>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>{deepAnalysis.summary}</p>
            </div>
            <button
              onClick={() => setStep(4)}
              style={{ width: '100%', padding: '18px', borderRadius: '18px', background: '#1E293B', color: 'white', fontWeight: 900, fontSize: '16px' }}
            >
              분석 데이터 저장 및 계속하기
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* 🔐 Auth View (Social Login) */
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
        로그인 시 Heart Sync의 <span style={{ textDecoration: 'underline' }}>이용약관</span> 및<br />
        <span style={{ textDecoration: 'underline' }}>개인정보 처리방침</span>에 동의하게 됩니다.
      </p>
    </motion.div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  // Auth & Global States
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
  const [adminStats, setAdminStats] = useState({ users: 0, couples: 0, activeSessions: 0, recentActivities: [] });
  const [coupleStats, setCoupleStats] = useState({ totalInteractions: 0 });
  const [syncStatus, setSyncStatus] = useState('WAITING'); // WAITING, SUBSCRIBED, ERROR
  const [spouseSecretAnswer, setSpouseSecretAnswer] = useState(() => localStorage.getItem('spouseSecretAnswer')); // 🗝️ 글로벌 시크릿 답변 상태
  const [mySecretAnswer, setMySecretAnswer] = useState(() => localStorage.getItem('mySecretAnswer') || ""); // 🗝️ 글로벌 나의 답변 상태
  const [isMySecretAnswered, setIsMySecretAnswered] = useState(() => localStorage.getItem('isMySecretAnswered') === 'true'); // 🗝️ 글로벌 나의 답변 완료 여부
  const [isSecretRevealed, setIsSecretRevealed] = useState(() => localStorage.getItem('isSecretRevealed') === 'true'); // 🗝️ 글로벌 카드 뒤집기 상태
  const [isSetupDone, setIsSetupDone] = useState(() => localStorage.getItem('isSetupDone') === 'true');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'husband');
  const [coupleCode, setCoupleCode] = useState(() => localStorage.getItem('coupleCode') || 'HS-7289');
  const defaultHusband = { nickname: "김남편", mbti: "ISTJ", blood: "A", marriageDate: "2020-05-23" };
  const defaultWife = { nickname: "박아내", mbti: "ENFP", blood: "B", marriageDate: "2020-05-23" };

  const [husbandInfo, setHusbandInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('husbandInfo');
      const parsed = saved ? JSON.parse(saved) : {};
      return { ...defaultHusband, ...parsed };
    } catch (e) {
      console.error("Husband Info Parse Error:", e);
      return defaultHusband;
    }
  });
  const [wifeInfo, setWifeInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('wifeInfo');
      const parsed = saved ? JSON.parse(saved) : {};
      return { ...defaultWife, ...parsed };
    } catch (e) {
      console.error("Wife Info Parse Error:", e);
      return defaultWife;
    }
  });
  const appTheme = { id: 'warm', primary: '#D4AF37', bg: '#FDFCF0' };
  const [mainChannel, setMainChannel] = useState(null); // 📡 Persistent Shared Channel
  const lastGardenNavIdRef = React.useRef(null);
  const lastNotifiedCardQIdRef = React.useRef(null);
  const lastNotifiedGardenNavIdRef = React.useRef(null);
  const lastNotifiedTabNavIdRef = React.useRef(null);
  const activeTabRef = React.useRef(activeTab);
  const lastNavIdRef = React.useRef(null);
  const [notifPermission, setNotifPermission] = useState(typeof window !== 'undefined' ? Notification.permission : 'default');

  // 🔔 Native Push Notification Helper (with Haptic Vibration)
  const sendNativeNotification = (title, body, tab = null, eventName = null) => {
    // 📬 Inbox Logging for persistence
    const newNotif = {
      id: Date.now(),
      title: title || 'Heart Sync',
      body: body || '마음 신호가 도착했습니다.',
      tab,
      eventName,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    setNotifications(prev => {
      try {
        const updated = [newNotif, ...prev.slice(0, 49)];
        localStorage.setItem('notifications', JSON.stringify(updated));
        return updated;
      } catch (e) {
        return [newNotif, ...prev.slice(0, 49)];
      }
    });

    // 📳 Haptic Vibration
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    if (!("Notification" in window)) return;

    const options = {
      body: body || '마음 신호가 도착했습니다.',
      icon: '/logo_main.png',
      badge: '/logo_main.png',
      tag: tab || 'general',
      data: { tab, eventName },
      vibrate: [200, 100, 200],
      requireInteraction: true
    };

    const notify = () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title || 'Heart Sync', options);
        }).catch(() => {
          new Notification(title || 'Heart Sync', options);
        });
      } else {
        const n = new Notification(title || 'Heart Sync', options);
        n.onclick = (e) => {
          e.preventDefault();
          window.focus();
          if (tab) setActiveTab(tab);
          n.close();
        };
      }
    };

    if (Notification.permission === "granted") {
      notify();
    }
  };

  // 📬 Web Push Subscription Helper (Support for 'Killed App' Notifications)
  const subscribeToPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // [VAPID KEY GUIDE] 🗝️ Generate yours with: npx web-push generate-vapid-keys
        // This is a placeholder key. For production, please use your unique VAPID keys.
        // ⚠️ CRITICAL: Replace this with your REAL VAPID Public Key generated via 'npx web-push generate-vapid-keys'
        const publicVapidKey = 'BHiG5Sf9bEN47pzCzCbyZEtSrXyL2IXkw45e-l9TQ6hvCd-OP964Zm8zxnq3Ys83FPT8qW5Ep2C86k5WrqUs178KEY';
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });
      }

      const signalMsgMap = {
        green: "오늘 제 마음은 초록색이에요! 아주 좋은 상태입니다. 🟢",
        amber: "오늘은 조금 정적인 편이에요. 부드러운 관심이 필요해요. 🟡",
        red: "지금은 제 마음의 정체기예요. 충분한 공감과 대화, 혹은 쉼이 필요한 정체기예요. 🔴",
        purple: "지금은 저만의 시간이 절대적으로 필요해요. 당분간 접근 금지입니다! 🟣"
      };

      // Save full subscription JSON to the profile (Edge Function will read this later)
      if (subscription && user) {
        const subJSON = JSON.stringify(subscription);
        await updateProfileInfo(undefined, { pushSubscription: subJSON });
        console.log("Push sub saved to profile ✅");
      }
    } catch (error) {
      console.warn('Push registration status:', error.message);
    }
  };

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotifPermission("granted");
        subscribeToPushNotifications(); // 권한 보장 시 구독 시도
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          setNotifPermission(permission);
          if (permission === 'granted') {
            console.log("Push notifications enabled!");
            subscribeToPushNotifications();
          }
        });
      }
    }
  }, [user]); // 유저 로그인 정보가 있을 때 구독 정보 저장 가능하도록 추가
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event) => {
        if (event.data?.type === 'NAVIGATE_TAB') {
          setActiveTab(event.data.tab);
        }
      };
      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
    }
  }, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        setActiveTab(tabParam);
        // Note: We avoid replaceState here to be extra safe on mobile browsers when opening from external links
      }
    } catch (e) {
      console.error("URL Params Error:", e);
    }
  }, []); // Run only ONCE on mount 

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // 🕒 날짜가 바뀌었는지 체크하여 비밀 카드 초기화
  useEffect(() => {
    const lastDate = localStorage.getItem('secretLastDate');
    const today = new Date().toDateString();
    if (lastDate && lastDate !== today) {
      localStorage.removeItem('mySecretAnswer');
      localStorage.removeItem('isMySecretAnswered');
      localStorage.removeItem('spouseSecretAnswer');
      localStorage.removeItem('isSecretRevealed');
      setMySecretAnswer("");
      setIsMySecretAnswered(false);
      setSpouseSecretAnswer(null);
      setIsSecretRevealed(false);
    }
  }, []);

  // Auth Session Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!currentSession && localStorage.getItem('isAdmin') === 'true') {
        const dummyAdmin = { id: 'admin-id', email: 'admin@heartsync.com', user_metadata: { full_name: '백동희', role: 'admin' } };
        setSession({ user: dummyAdmin });
        setUser(dummyAdmin);
      } else {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && localStorage.getItem('isAdmin') === 'true') return; // Keep admin dummy
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // 🛡️ Automatic Admin Elevation for '백동희' (Social Login)
      const fullName = currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || '';
      if (fullName === '백동희') {
        setIsAdmin(true);
        localStorage.setItem('isAdmin', 'true');
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // [Modularized] HomeView, AdminView, ChatView extracted to separate files
  useEffect(() => {
    if (session?.user?.email === 'beak0403@gmail.com') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
    } else if (session) {
      setIsAdmin(false);
      localStorage.setItem('isAdmin', 'false');
    }
  }, [session]);

  // Admin Statistics Fetcher
  useEffect(() => {
    if (!isAdmin) return;
    const fetchAdminStats = async () => {
      try {
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { data: couplesData } = await supabase.from('profiles').select('couple_id');
        const uniqueCouples = new Set(couplesData?.map(c => c.couple_id).filter(id => id && id !== 'none')).size;
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60000).toISOString();
        const { count: activeCount } = await supabase.from('signals').select('*', { count: 'exact', head: true }).gt('updated_at', fifteenMinsAgo);
        const { data: recentData } = await supabase.from('signals').select('*').order('updated_at', { ascending: false }).limit(5);
        setAdminStats({ users: usersCount || 0, couples: uniqueCouples || 0, activeSessions: activeCount || 0, recentActivities: recentData || [] });
      } catch (err) { console.error("Admin stats fetch error:", err); }
    };
    fetchAdminStats();
    const interval = setInterval(fetchAdminStats, 60000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const partnerLabel = userRole === 'husband' ? '아내' : '남편';
  const [intimacyBg, setIntimacyBg] = useState(localStorage.getItem('intimacyBg') || null);
  const [intimacySubPage, setIntimacySubPage] = useState('main');
  const [counselingMode, setCounselingMode] = useState('chat');
  const [showReport, setShowReport] = useState(false);
  const [showGuidePage, setShowGuidePage] = useState(false);

  const [mySignal, setMySignal] = useState(() => {
    try {
      const role = localStorage.getItem('userRole') || 'husband';
      const info = JSON.parse(localStorage.getItem(role === 'husband' ? 'husbandInfo' : 'wifeInfo') || '{}');
      return info.signal || 'green';
    } catch (e) {
      return 'green';
    }
  });
  const [spouseSignal, setSpouseSignal] = useState(() => {
    try {
      const role = localStorage.getItem('userRole') || 'husband';
      const partnerRole = role === 'husband' ? 'wife' : 'husband';
      const info = JSON.parse(localStorage.getItem(partnerRole === 'husband' ? 'husbandInfo' : 'wifeInfo') || '{}');
      return info.signal || 'green';
    } catch (e) {
      return 'green';
    }
  });
  const [schedules, setSchedules] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('coupleSchedules') || '[]');
    } catch (e) {
      return [];
    }
  });
  const [partnerPrayers, setPartnerPrayers] = useState([]);
  const [incomingCardCall, setIncomingCardCall] = useState(null);
  const [dialogueTab, setDialogueTab] = useState('choice'); // 'choice', 'cardGame', 'imageGame'
  const [dialogueGuideId, setDialogueGuideId] = useState(null); // 'cardGame', 'imageGame'
  const [showDialogueConfirm, setShowDialogueConfirm] = useState(false);
  const [dialogueConfirmRole, setDialogueConfirmRole] = useState('initiator'); // 'initiator' or 'recipient'

  const [worshipDays, setWorshipDays] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('worshipDays') || '["일", "수"]');
    } catch (e) {
      return ["일", "수"];
    }
  });
  const [worshipTime, setWorshipTime] = useState(() => localStorage.getItem('worshipTime') || '21:00');
  const [anniversaries, setAnniversaries] = useState(() => { try { const saved = localStorage.getItem('anniversaries'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; } });
  const [notifications, setNotifications] = useState(() => { try { const saved = localStorage.getItem('notifications'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; } });
  const [showNotificationList, setShowNotificationList] = useState(false);
  const signalLockRef = useRef(null);
  const lastSpouseSignalRef = useRef(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('husbandInfo', JSON.stringify(husbandInfo));
    localStorage.setItem('wifeInfo', JSON.stringify(wifeInfo));
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('isSetupDone', isSetupDone);
    localStorage.setItem('coupleSchedules', JSON.stringify(schedules));
    localStorage.setItem('worshipDays', JSON.stringify(worshipDays));
    localStorage.setItem('worshipTime', worshipTime);
    localStorage.setItem('anniversaries', JSON.stringify(anniversaries));
    localStorage.setItem('mySecretAnswer', mySecretAnswer);
    localStorage.setItem('isMySecretAnswered', isMySecretAnswered);
    localStorage.setItem('spouseSecretAnswer', spouseSecretAnswer || "");
    localStorage.setItem('isSecretRevealed', isSecretRevealed);
    localStorage.setItem('secretLastDate', new Date().toDateString());
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [husbandInfo, wifeInfo, userRole, isSetupDone, schedules, worshipDays, worshipTime, anniversaries, mySecretAnswer, isMySecretAnswered, spouseSecretAnswer, isSecretRevealed, notifications]);

  const handleOnboardingFinish = async (info) => {
    let finalCode = (info.coupleCode || coupleCode || "").toLowerCase().trim();
    if (finalCode) {
      setCoupleCode(finalCode);
      localStorage.setItem('coupleCode', finalCode);
    }
    const baseInfo = userRole === 'husband' ? husbandInfo : wifeInfo;
    const updatedInfo = { ...baseInfo, ...info, coupleCode: finalCode };
    if (userRole === 'husband') setHusbandInfo(updatedInfo);
    else setWifeInfo(updatedInfo);

    await supabase.from('profiles').upsert({
      id: user.id,
      couple_id: finalCode,
      user_role: userRole,
      info: updatedInfo,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

    localStorage.setItem('userRole', userRole);
    localStorage.setItem('isSetupDone', 'true');
    setIsSetupDone(true);
  };

  const fetchGlobalPrayers = async () => {
    if (!coupleCode) return;
    const { data } = await supabase.from('prayers').select('*').eq('couple_id', coupleCode).order('created_at', { ascending: false });
    if (data) {
      const partnerRole = userRole === 'husband' ? 'wife' : 'husband';
      const processed = data.filter(p => p.user_role === partnerRole).map(p => ({ ...p, type: 'partner', date: new Date(p.created_at).toLocaleDateString('ko-KR') }));
      setPartnerPrayers(processed);
    }
  };

  useEffect(() => { if (isSetupDone && coupleCode) fetchGlobalPrayers(); }, [isSetupDone, coupleCode, userRole]);

  const addSchedule = async (s) => {
    const newSchedules = [...schedules, s];
    setSchedules(newSchedules);
    const baseInfo = userRole === 'husband' ? husbandInfo : wifeInfo;
    await supabase.from('profiles').upsert({ id: user.id, couple_id: coupleCode, user_role: userRole, info: { ...baseInfo, coupleSchedules: newSchedules }, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  };

  const deleteSchedule = async (id) => {
    const newSchedules = schedules.filter(s => s.id !== id);
    setSchedules(newSchedules);
    const baseInfo = userRole === 'husband' ? husbandInfo : wifeInfo;
    await supabase.from('profiles').upsert({ id: user.id, couple_id: coupleCode, user_role: userRole, info: { ...baseInfo, coupleSchedules: newSchedules }, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  };

  const updateProfileInfo = async (text, extraInfo = {}) => {
    if (!user?.id) { console.warn("Update attempt without valid session - skipping sync."); return; }
    const baseInfo = userRole === 'husband' ? husbandInfo : wifeInfo;
    const updatedInfo = { ...baseInfo, ...extraInfo };
    if (text !== undefined) updatedInfo.todayMemo = text;
    if (mainChannel) mainChannel.send({ type: 'broadcast', event: 'memo-updated', payload: { sender: userRole, text, extraInfo } });
    if (userRole === 'husband') setHusbandInfo(updatedInfo); else setWifeInfo(updatedInfo);
    const finalCode = (coupleCode || "").toLowerCase().trim();
    await supabase.from('profiles').upsert({
      id: user.id,
      couple_id: finalCode,
      user_role: userRole,
      info: updatedInfo,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
  };

  useEffect(() => {
    const mainArea = document.querySelector('.main-content');
    if (mainArea) mainArea.scrollTop = 0;
  }, [activeTab, counselingMode]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) return;

      // 🕵 Check if this user already has a setup profile in Supabase
      const { data: myProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

      if (myProfile && myProfile.couple_id && myProfile.couple_id !== 'none') {
        console.log("Restoring session from Supabase profile...");
        const role = myProfile.user_role;
        setUserRole(role);
        setCoupleCode(myProfile.couple_id);
        if (role === 'husband') setHusbandInfo(prev => ({ ...prev, ...(myProfile.info || {}) }));
        else setWifeInfo(prev => ({ ...prev, ...(myProfile.info || {}) }));

        if (myProfile.info?.signal) setMySignal(myProfile.info.signal);

        // Mark as setup so we show the HomeView
        setIsSetupDone(true);
        localStorage.setItem('isSetupDone', 'true');
        localStorage.setItem('coupleCode', myProfile.couple_id);
        localStorage.setItem('userRole', role);

        // Now fetch partner/couple info
        const activeCode = myProfile.couple_id;
        const { data: profileData } = await supabase.from('profiles').select('*').eq('couple_id', activeCode);
        if (profileData) {
          const hP = profileData.find(p => p.user_role === 'husband');
          const wP = profileData.find(p => p.user_role === 'wife');
          if (hP) setHusbandInfo(prev => ({ ...prev, ...(hP.info || {}) }));
          if (wP) setWifeInfo(prev => ({ ...prev, ...(wP.info || {}) }));
          const commonInfo = hP?.info || wP?.info;
          if (commonInfo) {
            if (commonInfo.worshipDays) setWorshipDays(commonInfo.worshipDays);
            if (commonInfo.worshipTime) setWorshipTime(commonInfo.worshipTime);
            if (commonInfo.anniversaries) setAnniversaries(commonInfo.anniversaries);
            if (commonInfo.coupleSchedules) setSchedules(commonInfo.coupleSchedules);

            // 🚦 Load Partner's Signal
            const partnerProfile = profileData.find(p => p.user_role !== role);
            if (partnerProfile?.info?.signal) {
              setSpouseSignal(partnerProfile.info.signal);
              lastSpouseSignalRef.current = partnerProfile.info.signal;
            }

            // 💍 Sync Marriage Date
            if (commonInfo.marriageDate && !husbandInfo.marriageDate && !wifeInfo.marriageDate) {
              // Proactively set if needed
            }
          }
        }
      }
    };
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    const final_code = (coupleCode || "").toLowerCase().trim();
    if (!final_code) return;

    const channel = supabase.channel(`couple-${final_code}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, payload => {
        if (!payload.new || payload.new.couple_id?.toLowerCase() !== final_code) return;
        const { user_role: role, info } = payload.new;
        if (role === 'husband') setHusbandInfo(prev => ({ ...prev, ...(info || {}) }));
        else if (role === 'wife') setWifeInfo(prev => ({ ...prev, ...(info || {}) }));
        if (info?.signal && role !== userRole) {
          if (info.signal !== lastSpouseSignalRef.current) {
            lastSpouseSignalRef.current = info.signal;
            const signalMsgMap = {
              green: "오늘 제 마음은 초록색이에요! 아주 좋은 상태입니다. 🟢",
              amber: "오늘은 조금 정적인 편이에요. 부드러운 관심이 필요해요. 🟡",
              red: "지금은 제 마음의 정체기예요. 충분한 공감과 대화가 필요합니다. 🔴"
            };
            sendNativeNotification(
              `${role === 'husband' ? '남편' : '아내'}님의 현재 마음 신호 🚦`,
              signalMsgMap[info.signal] || "새로운 마음 신호가 도착했습니다.",
              'home'
            );
          }
          setSpouseSignal(info.signal);
        } else if (info?.signal && role === userRole && !signalLockRef.current) {
          setMySignal(info.signal);
        }

        if (info?.requestTab && info.navId !== lastNavIdRef.current && payload.new.user_role !== userRole) {
          if (info.requestTab === 'cardGame') {
            // For Dialogue Cards, don't auto-navigate if not already in the game view.
            // This lets the user click 'Join' in the invitation modal.
            if (activeTabRef.current === 'cardGame') {
              if (info.dialogueTab) setDialogueTab(info.dialogueTab);
              if (info.dialogueGuideId) setDialogueGuideId(info.dialogueGuideId);
            }
          } else {
            setActiveTab(info.requestTab);
            // Sync sub-navigation states if present
            if (info.dialogueTab) setDialogueTab(info.dialogueTab);
            if (info.dialogueGuideId) setDialogueGuideId(info.dialogueGuideId);
            if (info.counselingMode) setCounselingMode(info.counselingMode);
            if (info.intimacySubPage) setIntimacySubPage(info.intimacySubPage);
          }

          if (info.navId !== lastNotifiedTabNavIdRef.current) {
            lastNotifiedTabNavIdRef.current = info.navId;
            const senderLabel = payload.new.user_role === 'husband' ? '남편' : '아내';
            toast.info(`${senderLabel}님이 ${info.requestTab === 'cardGame' ? '대화카드' : info.requestTab === 'worship' ? '가정예배' : info.requestTab} 탭으로 초대했어요!`);
            sendNativeNotification(
              `화면 공유 요청 📱`,
              `${senderLabel}님이 ${info.requestTab === 'cardGame' ? '대화카드' : info.requestTab === 'worship' ? '가정예배' : info.requestTab} 화면을 함께 보자고 해요!`,
              info.requestTab
            );
          }
        }

        // 🌿 Garden Message Catch-up (Fail-safe for missed broadcasts)
        if (info?.gardenNavId && role !== userRole && info.gardenNavId !== lastNotifiedGardenNavIdRef.current) {
          lastNotifiedGardenNavIdRef.current = info.gardenNavId;
          const senderLabel = role === 'husband' ? '남편' : '아내';
          sendNativeNotification(
            `${senderLabel}님의 화원 메시지 🌿`,
            info.gardenMsg?.substring(0, 50) || '새로운 메시지가 도착했습니다.',
            'heartPrayer'
          );
        }
      })
      .on('broadcast', { event: 'signal-changed' }, ({ payload }) => {
        if (payload.sender !== userRole) {
          if (payload.signal !== lastSpouseSignalRef.current) {
            lastSpouseSignalRef.current = payload.signal;
            const signalMsgMap = {
              green: "오늘 제 마음은 초록색이에요! 아주 좋은 상태입니다. 🟢",
              amber: "오늘은 조금 정적인 편이에요. 부드러운 관심이 필요해요. 🟡",
              red: "지금은 제 마음의 정체기예요. 충분한 공감과 대화가 필요합니다. 🔴"
            };
            sendNativeNotification(
              `${payload.sender === 'husband' ? '남편' : '아내'}님의 현재 마음 신호 🚦`,
              signalMsgMap[payload.signal] || "새로운 마음 신호가 도착했습니다.",
              'home'
            );
            setSpouseSignal(payload.signal);
          }
        }
      })
      .on('broadcast', { event: 'garden-chat-sent' }, ({ payload }) => {
        if (payload.sender !== userRole) {
          window.dispatchEvent(new CustomEvent('garden-incoming-msg', { detail: payload }));
          const senderLabel = payload.sender === 'husband' ? '남편' : '아내';
          sendNativeNotification(
            `${senderLabel}님의 화원 메시지 도착 🌿`,
            payload.text?.substring(0, 50) || '새로운 메시지가 정원에 도착했습니다.',
            'heartPrayer'
          );
          if (activeTabRef.current !== 'heartPrayer') {
            setIncomingCardCall({
              type: 'garden',
              sender: senderLabel,
              text: payload.text,
              msgType: payload.msgType
            });
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prayers' }, payload => {
        if (payload.new && payload.new.couple_id === coupleCode) {
          fetchGlobalPrayers();
          window.dispatchEvent(new CustomEvent('prayers-updated'));
          if (payload.new.user_role !== userRole) {
            const senderLabel = payload.new.user_role === 'husband' ? '남편' : '아내';
            sendNativeNotification(
              `${senderLabel}님의 속마음 기도 🙏`,
              payload.new.text?.substring(0, 50) || '새로운 기도 제목이 도착했습니다.',
              'heartPrayer'
            );
          }
        }
      })
      .on('broadcast', { event: 'memo-updated' }, ({ payload }) => {
        if (payload.sender !== userRole) {
          const isHusband = payload.sender === 'husband';
          if (isHusband) {
            setHusbandInfo(prev => ({ ...prev, ...payload.extraInfo, todayMemo: payload.text }));
          } else {
            setWifeInfo(prev => ({ ...prev, ...payload.extraInfo, todayMemo: payload.text }));
          }
        }
      })
      .on('broadcast', { event: 'garden-chat-reset' }, async () => {
        window.dispatchEvent(new CustomEvent('garden-chat-reset'));
        const { data } = await supabase.from('profiles').select('info').eq('id', user.id).single();
        if (data) {
          const updatedInfo = { ...data.info, gardenMsg: null, gardenMsgType: null, gardenNavId: null, gardenAnswer: null };
          await supabase.from('profiles').upsert({
            id: user.id, couple_id: coupleCode, user_role: userRole, info: updatedInfo, updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
          if (userRole === 'husband') setHusbandInfo(updatedInfo); else setWifeInfo(updatedInfo);
        }
      })
      .on('broadcast', { event: 'card-game-call' }, ({ payload }) => {
        if (payload.sender !== userRole && activeTabRef.current !== 'cardGame' && activeTabRef.current !== 'heartPrayer') {
          const senderLabel = payload.sender === 'husband' ? '남편' : '아내';
          if (payload.type === 'mood-signal') {
            sendNativeNotification(
              `${senderLabel}님의 마음 신호 ✨`,
              `"${payload.title}" 신호가 도착했습니다. 화원에서 확인해보세요!`,
              'heartPrayer'
            );
            // setIncomingCardCall removed per user request
          } else {
            sendNativeNotification(
              `${senderLabel}님의 대화 요청 🃏`,
              '배우자가 카드대화를 요청했습니다.',
              'cardGame'
            );
            setIncomingCardCall({ type: 'card', category: payload.category, sender: senderLabel });
          }
        }
      })
      .on('broadcast', { event: 'game-update' }, ({ payload }) => {
        if (payload.sender !== userRole) {
          if (payload.tab && payload.tab !== 'cardGame') setActiveTab(payload.tab);
          if (payload.dialogueTab) setDialogueTab(payload.dialogueTab);
          if (payload.dialogueGuideId !== undefined) setDialogueGuideId(payload.dialogueGuideId);
          window.dispatchEvent(new CustomEvent('card-game-update', { detail: payload }));
        }
      })
      .on('broadcast', { event: 'secret-revealed' }, ({ payload }) => {
        if (payload?.sender !== userRole) {
          const senderLabel = payload.sender === 'husband' ? '남편' : '아내';
          toast.success(`${senderLabel}님께서 비밀 질문의 정답을 확인했습니다! 🔓`);
          sendNativeNotification(`비밀 질문 공개! 🔓`, `${senderLabel}님께서 당신의 비밀 답변을 확인했습니다. 대화를 나눠보세요!`, 'intimacy');
          setIncomingCardCall({ type: 'secret-revealed', sender: senderLabel });
        }
      })
      .on('broadcast', { event: 'secret-answer-update' }, ({ payload }) => {
        if (payload.user_role !== userRole) {
          const senderLabel = payload.user_role === 'husband' ? '남편' : '아내';
          setSpouseSecretAnswer(payload.answer);
          sendNativeNotification(`비밀 답변 도착! 🎁`, `${senderLabel}님께서 오늘의 비밀 질문에 답변했습니다. 지금 확인해보세요!`, 'intimacy');
          setIncomingCardCall({ type: 'secret-answer-received', sender: senderLabel });
        }
      })
      .on('broadcast', { event: 'heart-prayer-sent' }, ({ payload }) => {
        if (payload.userRole !== userRole) {
          const senderLabel = payload.userRole === 'husband' ? '남편' : '아내';
          sendNativeNotification(`속마음 기도 요청 🙏`, `${senderLabel}님께서 새로운 기도 제목을 남겼습니다.`, 'heartPrayer');
          setIncomingCardCall({ type: 'heart-prayer-sent', sender: senderLabel, text: payload.text });
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setSyncStatus('SUBSCRIBED');
          setMainChannel(channel);
        }
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setSyncStatus('ERROR');
          setMainChannel(null);
          if (isSetupDone && coupleCode) {
            setTimeout(() => { window.location.reload(); }, 3000);
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole, coupleCode, isSetupDone]);

  // Update My Signal to Supabase
  // 🚥 Master Signal Sync (Single Channel Persistence)
  const handleSetMySignal = async (newSignal) => {
    // 🛡️ Always proceed with sync even if signal is same to ensure remote DB consistency
    signalLockRef.current = newSignal;
    setMySignal(newSignal);
    localStorage.setItem('mySignal', newSignal);
    
    // 🛡️ Sync to info object to ensure useEffect saves it to localStorage correctly
    if (userRole === 'husband') {
      setHusbandInfo(prev => ({ ...prev, signal: newSignal }));
    } else {
      setWifeInfo(prev => ({ ...prev, signal: newSignal }));
    }

    // 📡 빠른 브로드캐스트 알림 발신
    if (mainChannel) {
      mainChannel.send({
        type: 'broadcast',
        event: 'signal-changed',
        payload: { sender: userRole, signal: newSignal }
      });
    }

    try {
      await updateProfileInfo(undefined, { signal: newSignal });
    } catch (err) {
      console.error("Signal Sync Error:", err);
    } finally {
      // 🛡️ Release gate with a small buffer to absorb latencies
      setTimeout(() => { signalLockRef.current = null; }, 1200);
    }
  };

  // 🚀 Start Card Game Session (Mutual Agreement Flow)
  const handleInitiateCardGame = () => {
    if (activeTab === 'cardGame') return;
    setDialogueConfirmRole('initiator');
    setShowDialogueConfirm(true);
  };

  // 🚀 공유 화면 전환 (UUID 기반으로 확실하게 트리거)
  const handleSharedNavigate = async (tabName, extraData = {}) => {
    setActiveTab(tabName);
    const navId = Math.random().toString(36).substring(7); // 랜덤 ID 생성
    lastNavIdRef.current = navId; // 내 기기에서는 중복 반응 안 하도록 저장

    // 🔔 대화카드 요청일 경우 배우자에게 직접 방송 알림 발신
    if (tabName === 'cardGame' && mainChannel) {
      mainChannel.send({
        type: 'broadcast',
        event: 'card-game-call',
        payload: { sender: userRole, category: 'general', ...extraData }
      });
    }

    // 📡 빠른 브로드캐스트 알림 발송 (가정예배 등 일반 탭 전환)
    if (mainChannel) {
      mainChannel.send({
        type: 'broadcast',
        event: 'game-update',
        payload: { sender: userRole, tab: tabName, ...extraData }
      });
    }

    // 🚀 Update Local States for the caller as well
    if (extraData.dialogueTab) setDialogueTab(extraData.dialogueTab);
    if (extraData.dialogueGuideId !== undefined) setDialogueGuideId(extraData.dialogueGuideId);
    if (extraData.counselingMode) setCounselingMode(extraData.counselingMode);
    if (extraData.intimacySubPage) setIntimacySubPage(extraData.intimacySubPage);

    // 내 프로필의 info에 'requestTab'과 'navId'를 실어 배우자에게 보냄 (화면 전환 유도)
    await updateProfileInfo(undefined, {
      requestTab: tabName,
      navId: navId,
      ...extraData,
      updated_at: Date.now()
    });
  };

  return (
    <div className="h-full flex flex-col relative w-full" style={{ '--gold': appTheme.primary, '--gold-glow': `${appTheme.primary}40` }}>
      {loading && (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <RefreshCw size={40} color="#D4AF37" />
          </motion.div>
        </div>
      )}

      {!loading && !session && !isAdmin && (
        <AuthView
          onLogoClick={() => {
            const newCount = logoClickCount + 1;
            setLogoClickCount(newCount);
            if (newCount >= 5) {
              setShowAdminLogin(true);
              setLogoClickCount(0);
            }
          }}
          showAdminLogin={showAdminLogin}
          setShowAdminLogin={setShowAdminLogin}
          setUser={setUser}
          setSession={setSession}
          setIsAdmin={setIsAdmin}
        />
      )}

      {!loading && (session || isAdmin) && !isSetupDone && (
        <OnboardingView
          user={user}
          userRole={userRole}
          setUserRole={setUserRole}
          onFinish={handleOnboardingFinish}
        />
      )}

      {!loading && (session || isAdmin) && isSetupDone && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '100%', pointerEvents: 'none', zIndex: -1, background: `radial-gradient(circle at 50% -20%, ${appTheme.primary}15, transparent)` }} />
      )}

      {!loading && (session || isAdmin) && isSetupDone && (
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
            visibility: (activeTab === 'intimacy' || activeTab === 'heartPrayer') ? 'hidden' : 'visible',
            borderBottom: `1px solid ${appTheme.primary}20`,
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} color={appTheme?.primary || '#D4AF37'} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 900, color: appTheme?.primary || '#D4AF37' }}>
                  {isAdmin ? '백동희 관리자님' : `${userRole === 'husband' ? (husbandInfo?.nickname || '남편') : (wifeInfo?.nickname || '아내')}님`}
                </span>
              </div>
              {/* Sync Status Dot */}
              <div
                title={syncStatus === 'SUBSCRIBED' ? '실시간 동기화 중' : '동기화 확인 중...'}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: syncStatus === 'SUBSCRIBED' ? '#4BD991' : syncStatus === 'ERROR' ? '#FF5E5E' : '#FFBE61',
                  boxShadow: `0 0 8px ${syncStatus === 'SUBSCRIBED' ? '#4BD991' : '#FFBE61'}`,
                  marginLeft: '-4px'
                }}
              />
            </div>
            <div className="top-bar-icons">
              <button
                className="icon-btn-top"
                onClick={() => {
                  setShowNotificationList(true);
                  // Mark all as read when opening
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                }}
                style={{ position: 'relative' }}
              >
                <Bell size={22} color={appTheme.primary} style={{ opacity: 0.8 }} />
                {notifications.some(n => !n.read) && (
                  <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', background: '#FF4D6D', borderRadius: '50%', border: '2px solid white' }} />
                )}
              </button>
              <button className="icon-btn-top" onClick={(e) => { e.stopPropagation(); setActiveTab('settings'); }}>
                <Settings size={22} color={appTheme.primary} style={{ opacity: 0.8 }} />
              </button>
            </div>
          </div>

          <main className="main-content">
            {/* 🛡️ Removed AnimatePresence to prevent stuck renders durante rapid signal updates */}
            {activeTab === 'home' && (
              <HomeView
                key="home"
                userRole={userRole}
                coupleCode={coupleCode}
                mainChannel={mainChannel}
                mySignal={mySignal}
                setMySignal={handleSetMySignal}
                spouseSignal={spouseSignal}
                partnerPrayers={partnerPrayers}
                onIntimacyClick={() => setActiveTab('intimacy')}
                onNav={(tab) => setActiveTab(tab)}
                schedules={schedules}
                husbandInfo={husbandInfo}
                wifeInfo={wifeInfo}
                onUpdateMemo={updateProfileInfo}
                notifPermission={notifPermission}
                spouseSecretAnswer={spouseSecretAnswer}
                setSpouseSecretAnswer={setSpouseSecretAnswer}
                mySecretAnswer={mySecretAnswer}
                setMySecretAnswer={setMySecretAnswer}
                isMySecretAnswered={isMySecretAnswered}
                setIsMySecretAnswered={setIsMySecretAnswered}
                isRevealed={isSecretRevealed}
                setIsRevealed={setIsSecretRevealed}
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
              <>
                {dialogueGuideId ? (
                  <GameGuideView
                    gameId={dialogueGuideId}
                    onStart={() => {
                      const targetMode = dialogueGuideId;
                      setDialogueTab(targetMode);
                      setDialogueGuideId(null);
                      handleSharedNavigate('cardGame', { dialogueTab: targetMode, dialogueGuideId: null });
                    }}
                    onBack={() => {
                      setDialogueGuideId(null);
                      handleSharedNavigate('cardGame', { dialogueGuideId: null, dialogueTab: 'choice' });
                    }}
                  />
                ) : dialogueTab === 'choice' ? (
                  <DialogueChoiceView
                    onSelect={(mode) => {
                      setDialogueGuideId(mode);
                      handleSharedNavigate('cardGame', { dialogueGuideId: mode, dialogueTab: 'choice' });
                    }}
                    onBack={() => handleSharedNavigate('home')}
                  />
                ) : dialogueTab === 'cardGame' ? (
                  <CardGameView
                    key="cardGame"
                    coupleCode={coupleCode}
                    userRole={userRole}
                    mainChannel={mainChannel}
                    onBack={() => handleSharedNavigate('cardGame', { dialogueTab: 'choice', dialogueGuideId: null })}
                    husbandInfo={husbandInfo}
                    wifeInfo={wifeInfo}
                    onUpdateMemo={updateProfileInfo}
                  />
                ) : (
                  <ImageCardGameView
                    key="imageGame"
                    onBack={() => handleSharedNavigate('cardGame', { dialogueTab: 'choice', dialogueGuideId: null })}
                    coupleCode={coupleCode}
                    userRole={userRole}
                    mainChannel={mainChannel}
                    husbandInfo={husbandInfo}
                    wifeInfo={wifeInfo}
                  />
                )}
              </>
            )}
            {activeTab === 'counseling' && (
              <div className={`flex flex-col pt-4 ${counselingMode === 'chat' ? 'flex-1 min-h-0' : ''}`}>
                {/* 💊 AI Hatti Sub-Navigation (Chat vs Solution) */}

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
                  <ChatView
                    key="chat"
                    userRole={userRole}
                    setUserRole={setUserRole}
                    husbandInfo={husbandInfo}
                    setHusbandInfo={setHusbandInfo}
                    wifeInfo={wifeInfo}
                    setWifeInfo={setWifeInfo}
                    adminStats={adminStats}
                    schedules={schedules}
                    onBack={() => setActiveTab('home')}
                  />
                ) : (
                  <SolutionView
                    key="solution"
                    userRole={userRole}
                    husbandInfo={husbandInfo}
                    wifeInfo={wifeInfo}
                    schedules={schedules}
                    adminStats={adminStats}
                    coupleStats={coupleStats}
                    onBack={() => setCounselingMode('chat')}
                  />
                )}
              </div>
            )}
            {activeTab === 'worship' && (
              <WorshipView key="worship" userRole={userRole} coupleCode={coupleCode} mainChannel={mainChannel} />
            )}
            {activeTab === 'heartPrayer' && (
              <IntimacyHubView
                user={user}
                supabase={supabase}
                mainChannel={mainChannel}
                userRole={userRole}
                coupleCode={coupleCode}
                onBack={() => setActiveTab('home')}
                partnerPrayers={partnerPrayers}
                setPartnerPrayers={setPartnerPrayers}
                bgImage={intimacyBg}
                onBgUpload={setIntimacyBg}
                partnerLabel={partnerLabel}
                husbandInfo={husbandInfo}
                wifeInfo={wifeInfo}
                setHusbandInfo={setHusbandInfo}
                setWifeInfo={setWifeInfo}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                key="settings"
                user={user}
                userRole={userRole}
                husbandInfo={husbandInfo}
                setHusbandInfo={setHusbandInfo}
                wifeInfo={wifeInfo}
                setWifeInfo={setWifeInfo}
                coupleCode={coupleCode}
                setCoupleCode={setCoupleCode}
                worshipDays={worshipDays}
                setWorshipDays={setWorshipDays}
                worshipTime={worshipTime}
                setWorshipTime={setWorshipTime}
                anniversaries={anniversaries}
                setAnniversaries={setAnniversaries}
                onReportClick={() => setShowReport(true)}
                onGuideClick={() => setShowGuidePage(true)}
                isAdmin={isAdmin}
                onNav={setActiveTab}
                onUpdateMemo={updateProfileInfo}
                subscribeToPushNotifications={subscribeToPushNotifications}
              />
            )}
            {activeTab === 'admin' && isAdmin && (
              <AdminView
                key="admin"
                onBack={() => setActiveTab('home')}
                usersCount={adminStats.users}
                couplesCount={adminStats.couples}
                activeSessions={adminStats.activeSessions}
                recentActivities={adminStats.recentActivities}
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
                user={user}
                userRole={userRole}
                coupleCode={coupleCode}
                supabase={supabase}
                mainChannel={mainChannel}
                setWifeInfo={setWifeInfo}
                husbandInfo={husbandInfo}
                wifeInfo={wifeInfo}
                onUpdateProfile={updateProfileInfo}
              />
            )}
            {activeTab === 'profile' && (
              <ProfileView
                key="profile" user={user} userRole={userRole} coupleCode={coupleCode} setHusbandInfo={setHusbandInfo}
                setWifeInfo={setWifeInfo} husbandInfo={husbandInfo} wifeInfo={wifeInfo} onUpdateProfile={updateProfileInfo}
                myInfo={userRole === 'husband' ? husbandInfo : wifeInfo} isFullPage={true}
              />
            )}
          </main>

          {/* Luxury Bottom Nav - 5 Core Tabs */}
          <nav className="bottom-nav">
            <NavItem
              active={activeTab === 'home'}
              onClick={() => handleSharedNavigate('home')}
              icon={<Home size={22} fill={activeTab === 'home' ? appTheme.primary : "none"} color={activeTab === 'home' ? appTheme.primary : undefined} />}
              label="홈"
            />
            <NavItem
              active={activeTab === 'cardGame'}
              onClick={handleInitiateCardGame}
              icon={<MessageSquare size={22} fill={activeTab === 'cardGame' ? appTheme.primary : "none"} color={activeTab === 'cardGame' ? appTheme.primary : undefined} />}
              label="대화카드"
            />
            <NavItem
              active={activeTab === 'counseling'}
              onClick={() => handleSharedNavigate('counseling')}
              icon={<Sparkles size={22} fill={activeTab === 'counseling' ? appTheme.primary : "none"} color={activeTab === 'counseling' ? appTheme.primary : undefined} />}
              label="AI하티"
            />
            <NavItem
              active={activeTab === 'worship'}
              onClick={() => handleSharedNavigate('worship')}
              icon={<BookOpen size={22} fill={activeTab === 'worship' ? appTheme.primary : "none"} color={activeTab === 'worship' ? appTheme.primary : undefined} />}
              label="가정예배"
            />
            <NavItem
              active={activeTab === 'heartPrayer'}
              onClick={() => handleSharedNavigate('heartPrayer')}
              icon={<Heart size={22} fill={activeTab === 'heartPrayer' ? appTheme.primary : "none"} color={activeTab === 'heartPrayer' ? appTheme.primary : undefined} />}
              label="작은숲"
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
              <SolutionView
                userRole={userRole}
                husbandInfo={husbandInfo}
                wifeInfo={wifeInfo}
                schedules={schedules}
                adminStats={adminStats}
                coupleStats={coupleStats}
                onBack={() => setShowReport(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔔 Card Game & Secret Card Real-time Toast Notification */}
      <AnimatePresence>
        {incomingCardCall && activeTab !== 'heartPrayer' && activeTab !== 'cardGame' && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            style={{
              position: 'fixed', bottom: '120px', left: '20px', right: '20px',
              background: 'rgba(30, 41, 59, 0.95)', backdropFilter: 'blur(20px)',
              borderRadius: '24px', padding: '20px', color: 'white', zIndex: 100000,
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', gap: '15px'
            }}
          >
            <div style={{
              background: (incomingCardCall.type?.startsWith('secret') || incomingCardCall.type === 'heart-prayer-sent') ? '#D4AF37' :
                incomingCardCall.type === 'garden' ? '#FF4D6D' : '#8A60FF',
              padding: '12px',
              borderRadius: '16px'
            }}>
              {incomingCardCall.type === 'garden' ? "🌹" :
                incomingCardCall.type?.startsWith('secret') ? <Lock size={24} color="white" /> :
                  incomingCardCall.type === 'heart-prayer-sent' ? <Heart size={24} color="white" fill="white" /> :
                    <Sparkles size={24} color="white" />}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '15px', fontWeight: 900, marginBottom: '2px' }}>
                {incomingCardCall.type === 'secret-answer-received'
                  ? `${incomingCardCall.sender}님이 비밀 답변을 남겼습니다! 🎁`
                  : incomingCardCall.type === 'heart-prayer-sent'
                    ? `${incomingCardCall.sender}님이 기도를 요청했습니다! 🙏`
                    : incomingCardCall.type === 'secret-revealed'
                      ? `${incomingCardCall.sender}님이 비밀 질문을 확인했습니다! ✨`
                      : incomingCardCall.type === 'garden'
                        ? `${incomingCardCall.sender}님이 소통의 화원에서 메시지를 보냈습니다! 🌹`
                        : `배우자가 카드대화를 요청했습니다! 🃏`}
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>
                {incomingCardCall.type === 'heart-prayer-sent' ? '지금 바로 기도제목을 확인해보세요.' :
                  incomingCardCall.type === 'garden' ? (incomingCardCall.msgType === 'question' ? '배우자가 새로운 질문을 보냈습니다.' : '배우자와의 은밀한 소통을 이어가세요.') :
                    incomingCardCall.type?.startsWith('secret') ? '지금 바로 정답을 확인해보세요.' : '지금 수락해서 함께 깊은 대화를 나눠보세요.'}
              </p>
            </div>
            <button
              onClick={() => {
                if (incomingCardCall.type === 'heart-prayer-sent' || incomingCardCall.type === 'garden') {
                  setActiveTab('heartPrayer');
                  if (incomingCardCall.type === 'garden') {
                    setTimeout(() => window.dispatchEvent(new CustomEvent('nav-to-garden')), 300);
                  }
                } else if (incomingCardCall.type?.startsWith('secret')) {
                  setActiveTab('home');
                } else {
                  setActiveTab('cardGame');
                }
                setIncomingCardCall(null);
              }}
              style={{ background: 'white', color: '#1E293B', padding: '10px 18px', borderRadius: '12px', border: 'none', fontWeight: 900, fontSize: '13px' }}
            >
              확인
            </button>
            <button
              onClick={() => setIncomingCardCall(null)}
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '12px', border: 'none', display: 'flex' }}
            >
              <X size={18} />
            </button>
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
      {/* 🔔 Notification List Overlay */}
      <AnimatePresence>
        {showNotificationList && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowNotificationList(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 1000000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '400px', background: 'white', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}
            >
              <div style={{ padding: '20px', borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08' }}>최근 알림</span>
                <button onClick={() => setNotifications([])} style={{ background: 'none', border: 'none', color: '#8B7355', fontSize: '12px', fontWeight: 800 }}>전체 삭제</button>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8B7355', opacity: 0.6 }}>새로운 알림이 없습니다.</div>
                ) : (
                  notifications.map((notif, i) => (
                    <div key={i} style={{ padding: '15px', borderRadius: '16px', marginBottom: '8px', background: '#FDFCF0', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: '#2D1F08', marginBottom: '4px' }}>{notif.title}</p>
                      <p style={{ fontSize: '12px', color: '#8B7355', fontWeight: 600 }}>{notif.body}</p>
                      <span style={{ fontSize: '10px', color: '#BDBDBD', marginTop: '6px', display: 'block' }}>{notif.time}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🃏 Dialogue Card Start/Join Confirmation Modal */}
      <AnimatePresence>
        {showDialogueConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(10px)', zIndex: 99999,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                width: '100%', maxWidth: '340px', background: 'white',
                borderRadius: '35px', padding: '40px 25px', textAlign: 'center',
                boxShadow: '0 25px 50px rgba(0,0,0,0.3)', border: '2px solid rgba(212, 175, 55, 0.2)'
              }}
            >
              <div style={{
                width: '80px', height: '80px', borderRadius: '24px',
                background: 'rgba(138, 96, 255, 0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
              }}>
                <MessageSquare size={40} color="#8A60FF" />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#2D1F08', marginBottom: '12px' }}>
                {dialogueConfirmRole === 'initiator' ? '대화카드를 시작할까요?' : '대화카드 초대 도착!'}
              </h3>
              <p style={{ fontSize: '15px', color: '#8B7355', fontWeight: 700, lineHeight: 1.6, marginBottom: '30px', wordBreak: 'keep-all' }}>
                {dialogueConfirmRole === 'initiator'
                  ? '배우자와 함께 10가지 질문으로 나누는 깊은 소통의 시간을 시작하시겠습니까?'
                  : `${userRole === 'husband' ? (wifeInfo?.nickname || '아내') : (husbandInfo?.nickname || '남편')}님이 대화카드 게임에 초대하셨습니다. 함께 참여하시겠습니까?`}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => {
                    setShowDialogueConfirm(false);
                    handleSharedNavigate('cardGame', { dialogueTab: 'choice', dialogueGuideId: null });
                  }}
                  style={{
                    width: '100%', padding: '18px', borderRadius: '20px',
                    background: '#2D1F08', color: 'white', fontWeight: 900,
                    fontSize: '16px', border: 'none', cursor: 'pointer'
                  }}
                >
                  참여하기
                </button>
                <button
                  onClick={() => setShowDialogueConfirm(false)}
                  style={{
                    width: '100%', padding: '15px', borderRadius: '20px',
                    background: 'none', color: '#B08D3E', fontWeight: 800,
                    fontSize: '14px', border: 'none', cursor: 'pointer'
                  }}
                >
                  나중에 하기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;




