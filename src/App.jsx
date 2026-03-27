import React, { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// UI stability and scroll fix applied - 2026-03-27
import { 
  Heart, Calendar, Settings, Bell, User, MessageCircle, MessageSquare,
  Sparkles, RefreshCw, Home, Users, Info, HelpCircle, 
  ChevronRight, ArrowLeft, BookOpen, Clock, Activity, PenTool, Layout,
  BarChart3, ArrowRight, ChevronLeft, ChevronDown, Plus, Trash2, Edit2,
  Camera, Upload, CheckCircle2, ListTodo, AlertCircle, Palette, ClipboardList,
  Fingerprint, Flame, Clipboard, Book, Zap, Send, Music, Smile, ShieldCheck,
  StickyNote, X, Image as ImageIcon, Lock
} from 'lucide-react';
import { supabase } from './supabase';

// Eagerly Loaded Components for instant navigation
import HomeView from './components/home/HomeView';
import CardGameView from './components/game/CardGameView';
import { CARD_DATA } from './data/dialogueCards';
import ImageCardGameView from './components/game/ImageCardGameView';
import DialogueChoiceView from './components/dialogue/DialogueChoiceView';
import GameGuideView from './components/dialogue/GameGuideView';
import SettingsView from './components/settings/SettingsView';
import AuthView from './components/auth/AuthView';
import OnboardingView from './components/auth/OnboardingView';
import AdminView from './components/admin/AdminView';
import ChatView from './components/counseling/ChatView';
import HattiCharacter from './components/ui/HattiCharacter';
import IntimacyHubView from './components/intimacy/IntimacyHubView';
import HeartPrayerView from './components/intimacy/HeartPrayerView';
import IntimacyModal from './components/intimacy/IntimacyModal';
import WorshipView from './components/worship/WorshipView';
import SolutionView from './components/counseling/SolutionView';
import AppGuideView from './components/ui/AppGuideView';
import DeepAnalysisView from './components/settings/DeepAnalysisView';
import SecretAnswerInteraction from './components/game/SecretAnswerInteraction';
import ProfileView from './components/profile/ProfileView';
import CalendarView from './components/calendar/CalendarView';

// App constants
const APP_DEBUG = true;

const HATTI_TODOS = [
  { id: 1, action: "말하기", text: "배우자에게 '오늘 하루도 정말 고생 많았어'라고 눈을 맞추며 말해주세요." },
  { id: 2, action: "행동", text: "오늘 저녁 설거지나 청소 중 하나를 배우자 몰래 미리 끝내두세요." },
  { id: 3, action: "스킨십", text: "배우자가 퇴근하고 돌아오면 5초간 따뜻하게 안아주세요." },
  { id: 4, action: "선물", text: "퇴근길에 배우자가 좋아하는 편의점 간식을 하나 사서 건네보세요." },
  { id: 5, action: "경청", text: "오늘 배우자의 이야기를 10분 동안 조언 없이 온전히 들어주세요." }
];

const NavItem = React.memo(({ active, onClick, icon, label }) => (
  <div onClick={onClick} className={`nav-item ${active ? 'active' : ''}`}>
    <div className="nav-icon-wrapper">
      {icon}
    </div>
    <span>{label}</span>
  </div>
));

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
  const [spouseSecretAnswer, setSpouseSecretAnswer] = useState(() => localStorage.getItem('spouseSecretAnswer')); 
  const [mySecretAnswer, setMySecretAnswer] = useState(() => localStorage.getItem('mySecretAnswer') || ""); 
  const [isMySecretAnswered, setIsMySecretAnswered] = useState(() => localStorage.getItem('isMySecretAnswered') === 'true'); 
  const [isSecretRevealed, setIsSecretRevealed] = useState(() => localStorage.getItem('isSecretRevealed') === 'true'); 
  const [isSetupDone, setIsSetupDone] = useState(() => localStorage.getItem('isSetupDone') === 'true');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'husband');
  const [coupleCode, setCoupleCode] = useState(() => localStorage.getItem('coupleCode') || 'HS-7289');
  const [husbandInfo, setHusbandInfo] = useState(() => JSON.parse(localStorage.getItem('husbandInfo') || '{"nickname":"김남편", "mbti":"ISTJ", "blood":"A", "marriageDate":"2020-05-23"}'));
  const [wifeInfo, setWifeInfo] = useState(() => JSON.parse(localStorage.getItem('wifeInfo') || '{"nickname":"박아내", "mbti":"ENFP", "blood":"B", "marriageDate":"2020-05-23"}'));
  const appTheme = { id: 'warm', primary: '#D4AF37', bg: '#FDFCF0' };
  const [mainChannel, setMainChannel] = useState(null); 
  const activeTabRef = React.useRef(activeTab);
  const lastNavIdRef = React.useRef(localStorage.getItem('lastProcessedNavId')); 
  const [notifPermission, setNotifPermission] = useState(typeof window !== 'undefined' ? Notification.permission : 'default');
  const [notifications, setNotifications] = useState(() => { try { const saved = localStorage.getItem('notifications'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; } });
  const [showNotificationList, setShowNotificationList] = useState(false);

  // 🔔 Native Push Notification Helper
  const sendNativeNotification = (title, body, tab = null, eventName = null) => {
    const newNotif = { 
      id: Date.now(), title: title || 'Heart Sync', body: body || '마음 신호가 도착했습니다.', tab, eventName,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), read: false
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev.slice(0, 49)];
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
    if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
    if (!("Notification" in window)) return;
    const options = { body: body || '마음 신호가 도착했습니다.', icon: '/logo_main.png', badge: '/logo_main.png', tag: tab || 'general', data: { tab, eventName }, vibrate: [200, 100, 200], requireInteraction: true };
    if (Notification.permission === "granted") {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => reg.showNotification(title || 'Heart Sync', options));
      } else {
        const n = new Notification(title || 'Heart Sync', options);
        n.onclick = () => { window.focus(); if (tab) setActiveTab(tab); n.close(); };
      }
    }
  };

  const subscribeToPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        const publicVapidKey = 'BFfU6e9j-eH8O0n6e_z8_vS_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_w';
        subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicVapidKey) });
      }
      if (subscription && user) await updateProfileInfo(undefined, { pushSubscription: subscription });
    } catch (error) { console.warn('Push subscription failed:', error); }
  };

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  }

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") { setNotifPermission("granted"); subscribeToPushNotifications(); }
      else if (Notification.permission !== "denied") Notification.requestPermission().then(permission => { setNotifPermission(permission); if (permission === 'granted') subscribeToPushNotifications(); });
    }
  }, [user]);

  useEffect(() => {
    activeTabRef.current = activeTab;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) { setActiveTab(tabParam); window.history.replaceState({}, document.title, window.location.pathname); }
  }, [activeTab]);

  useEffect(() => {
    const lastDate = localStorage.getItem('secretLastDate');
    const today = new Date().toDateString();
    if (lastDate && lastDate !== today) {
       localStorage.removeItem('mySecretAnswer'); localStorage.removeItem('isMySecretAnswered');
       localStorage.removeItem('spouseSecretAnswer'); localStorage.removeItem('isSecretRevealed');
       setMySecretAnswer(""); setIsMySecretAnswered(false); setSpouseSecretAnswer(null); setIsSecretRevealed(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!currentSession && localStorage.getItem('isAdmin') === 'true') {
        const dummyAdmin = { id: 'admin-id', email: 'admin@heartsync.com', user_metadata: { full_name: '백동희', role: 'admin' } };
        setSession({ user: dummyAdmin }); setUser(dummyAdmin);
      } else { setSession(currentSession); setUser(currentSession?.user ?? null); }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && localStorage.getItem('isAdmin') === 'true') return;
      setSession(session); const currentUser = session?.user ?? null; setUser(currentUser);
      const fullName = currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || '';
      if (fullName === '백동희') { setIsAdmin(true); localStorage.setItem('isAdmin', 'true'); }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  
  useEffect(() => {
    if (session?.user?.email === 'beak0403@gmail.com') { setIsAdmin(true); localStorage.setItem('isAdmin', 'true'); }
    else if (session) { setIsAdmin(false); localStorage.setItem('isAdmin', 'false'); }
  }, [session]);

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
    fetchAdminStats(); const interval = setInterval(fetchAdminStats, 60000); return () => clearInterval(interval);
  }, [isAdmin]);

  const partnerLabel = userRole === 'husband' ? '아내' : '남편';
  const [intimacyBg, setIntimacyBg] = useState(localStorage.getItem('intimacyBg') || null);
  const [intimacySubPage, setIntimacySubPage] = useState('main');
  const [counselingMode, setCounselingMode] = useState('chat');
  const [showReport, setShowReport] = useState(false);
  const [showGuidePage, setShowGuidePage] = useState(false);
  
  const [mySignal, setMySignal] = useState(() => {
    const role = localStorage.getItem('userRole') || 'husband';
    const info = JSON.parse(localStorage.getItem(role === 'husband' ? 'husbandInfo' : 'wifeInfo') || '{}');
    return info.signal || 'green';
  });
  const [spouseSignal, setSpouseSignal] = useState(() => {
    const role = localStorage.getItem('userRole') || 'husband';
    const partnerRole = role === 'husband' ? 'wife' : 'husband';
    const info = JSON.parse(localStorage.getItem(partnerRole === 'husband' ? 'husbandInfo' : 'wifeInfo') || '{}');
    return info.signal || 'green';
  });
  const [schedules, setSchedules] = useState(() => JSON.parse(localStorage.getItem('coupleSchedules') || '[]'));
  const [partnerPrayers, setPartnerPrayers] = useState([]);
  const [incomingCardCall, setIncomingCardCall] = useState(null);
  const [dialogueTab, setDialogueTab] = useState('choice'); 
  const [dialogueGuideId, setDialogueGuideId] = useState(null); 

  const [worshipDays, setWorshipDays] = useState(() => JSON.parse(localStorage.getItem('worshipDays') || '["일", "수"]'));
  const [worshipTime, setWorshipTime] = useState(() => localStorage.getItem('worshipTime') || '21:00');
  const [anniversaries, setAnniversaries] = useState(() => { try { const saved = localStorage.getItem('anniversaries'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; } });
  const signalLockRef = useRef(null);
  const lastSpouseSignalRef = useRef(null);

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
    if (finalCode) { setCoupleCode(finalCode); localStorage.setItem('coupleCode', finalCode); }
    const updatedInfo = { ...(userRole === 'husband' ? husbandInfo : wifeInfo), ...info, coupleCode: finalCode };
    if (userRole === 'husband') setHusbandInfo(updatedInfo); else setWifeInfo(updatedInfo);
    await supabase.from('profiles').upsert({ id: user.id, couple_id: finalCode, user_role: userRole, info: updatedInfo, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    setIsSetupDone(true); localStorage.setItem('isSetupDone', 'true');
  };

  const fetchGlobalPrayers = async () => {
    if (!coupleCode) return;
    const { data } = await supabase.from('prayers').select('*').eq('couple_id', coupleCode).order('created_at', { ascending: false });
    if (data) {
      const partnerRole = userRole === 'husband' ? 'wife' : 'husband';
      setPartnerPrayers(data.filter(p => p.user_role === partnerRole).map(p => ({ ...p, type: 'partner', date: new Date(p.created_at).toLocaleDateString('ko-KR') })));
    }
  };

  useEffect(() => { if (isSetupDone && coupleCode) fetchGlobalPrayers(); }, [isSetupDone, coupleCode, userRole]);

  const addSchedule = async (s) => {
    const newSchedules = [...schedules, s]; setSchedules(newSchedules);
    await supabase.from('profiles').upsert({ id: user.id, couple_id: coupleCode, user_role: userRole, info: { ...(userRole === 'husband' ? husbandInfo : wifeInfo), coupleSchedules: newSchedules }, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  };

  const deleteSchedule = async (id) => {
    const newSchedules = schedules.filter(s => s.id !== id); setSchedules(newSchedules);
    await supabase.from('profiles').upsert({ id: user.id, couple_id: coupleCode, user_role: userRole, info: { ...(userRole === 'husband' ? husbandInfo : wifeInfo), coupleSchedules: newSchedules }, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  };
  
  const updateProfileInfo = async (text, extraInfo = {}) => {
    if (!user?.id) return;
    const updatedInfo = { ...(userRole === 'husband' ? husbandInfo : wifeInfo), ...extraInfo };
    if (text !== undefined) updatedInfo.todayMemo = text;
    if (mainChannel) mainChannel.send({ type: 'broadcast', event: 'memo-updated', payload: { sender: userRole, text, extraInfo } });
    if (userRole === 'husband') setHusbandInfo(updatedInfo); else setWifeInfo(updatedInfo);
    await supabase.from('profiles').upsert({ id: user.id, couple_id: coupleCode.toLowerCase().trim(), user_role: userRole, info: updatedInfo, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  };

  useEffect(() => {
    const final_code = (coupleCode || "").toLowerCase().trim();
    if (!final_code) return;
    const channel = supabase.channel(`couple-${final_code}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, payload => {
        if (!payload.new || payload.new.couple_id?.toLowerCase() !== final_code) return;
        const { user_role: role, info } = payload.new;
        if (role === 'husband') setHusbandInfo(info || {}); else if (role === 'wife') setWifeInfo(info || {});
        if (info?.signal && role !== userRole) {
           if (info.signal !== lastSpouseSignalRef.current) {
              lastSpouseSignalRef.current = info.signal;
              sendNativeNotification(`${role === 'husband' ? '남편' : '아내'}님의 마음 신호 🚦`, `제 마음은 ${info.signal === 'green' ? '초록색' : info.signal === 'amber' ? '노란색' : '빨간색'}이에요.`, 'home');
           }
           setSpouseSignal(info.signal);
        }
      })
      .on('broadcast', { event: 'nav-trigger' }, ({ payload }) => {
        if (payload.sender !== userRole && payload.tab && payload.navId !== lastNavIdRef.current) {
          lastNavIdRef.current = payload.navId; setActiveTab(payload.tab);
        }
      })
      .on('broadcast', { event: 'garden-chat-sent' }, ({ payload }) => {
        if (payload.sender !== userRole) {
          sendNativeNotification(`${payload.sender === 'husband' ? '남편' : '아내'}님의 메시지 🌿`, payload.text?.substring(0, 50), 'heartPrayer');
        }
      })
      .on('broadcast', { event: 'card-game-call' }, ({ payload }) => {
        if (payload.sender !== userRole) sendNativeNotification(`${payload.sender === 'husband' ? '남편' : '아내'}님의 대화 요청 🃏`, '함께 대화하고 싶어해요!', 'cardGame');
      })
      .on('broadcast', { event: 'secret-answer-update' }, ({ payload }) => {
        if (payload.user_role !== userRole) { setSpouseSecretAnswer(payload.answer); sendNativeNotification(`비밀 답변 도착! 🎁`, `배우자가 답변을 남겼습니다.`, 'home'); }
      })
      .subscribe((status) => { if (status === 'SUBSCRIBED') { setSyncStatus('SUBSCRIBED'); setMainChannel(channel); } });
    return () => supabase.removeChannel(channel);
  }, [userRole, coupleCode, isSetupDone]);

  const handleSetMySignal = async (newSignal) => {
    if (mySignal === newSignal) return;
    signalLockRef.current = newSignal; setMySignal(newSignal); 
    if (mainChannel) mainChannel.send({ type: 'broadcast', event: 'signal-changed', payload: { sender: userRole, signal: newSignal } });
    await updateProfileInfo(undefined, { signal: newSignal });
    setTimeout(() => { signalLockRef.current = null; }, 1200);
  };

  const handleSharedNavigate = (tabName) => {
    setActiveTab(tabName);
    const navId = Math.random().toString(36).substring(7); 
    lastNavIdRef.current = navId; localStorage.setItem('lastProcessedNavId', navId);
    if (mainChannel) mainChannel.send({ type: 'broadcast', event: 'nav-trigger', payload: { sender: userRole, tab: tabName, navId } });
  };

  return (
    <div className="h-full flex flex-col relative w-full" style={{ '--gold': appTheme.primary, '--gold-glow': `${appTheme.primary}40`, background: appTheme.bg }}>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-[99999]">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <RefreshCw size={40} color="#D4AF37" />
          </motion.div>
        </div>
      )}

      {!loading && !session && !isAdmin && (
        <AuthView onLogoClick={() => { setLogoClickCount(c => c + 1); if (logoClickCount >= 4) { setShowAdminLogin(true); setLogoClickCount(0); } }} showAdminLogin={showAdminLogin} setShowAdminLogin={setShowAdminLogin} setUser={setUser} setSession={setSession} setIsAdmin={setIsAdmin} user={user} userRole={userRole} setUserRole={setUserRole} onFinish={handleOnboardingFinish} />
      )}

      {!loading && (session || isAdmin) && !isSetupDone && (
        <OnboardingView user={user} userRole={userRole} setUserRole={setUserRole} onFinish={handleOnboardingFinish} />
      )}

      {!loading && (session || isAdmin) && isSetupDone && (
        <>
          <div className="top-bar" style={{ display: activeTab === 'intimacy' || activeTab === 'heartPrayer' ? 'none' : 'flex' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center"><User size={16} color="#D4AF37" /></div>
              <span className="text-[13px] font-black text-[#D4AF37]">{isAdmin ? '관리자님' : (userRole === 'husband' ? husbandInfo.nickname : wifeInfo.nickname)}님</span>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: syncStatus === 'SUBSCRIBED' ? '#4BD991' : '#FFBE61' }} />
            </div>
            <div className="top-bar-icons">
              <button className="icon-btn-top" onClick={() => setShowNotificationList(true)}>
                <Bell size={22} color="#D4AF37" />
                {notifications.some(n => !n.read) && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />}
              </button>
              <button className="icon-btn-top" onClick={() => setActiveTab('settings')}><Settings size={22} color="#D4AF37" /></button>
            </div>
          </div>

          <main className="main-content" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* 🏠 Zero-Unmount HomeView */}
            <div style={{ position: 'absolute', inset: 0, display: activeTab === 'home' ? 'block' : 'none', zIndex: activeTab === 'home' ? 5 : 0 }}>
              <HomeView user={user} userRole={userRole} coupleCode={coupleCode} mainChannel={mainChannel} mySignal={mySignal} setMySignal={handleSetMySignal} spouseSignal={spouseSignal} partnerPrayers={partnerPrayers} onIntimacyClick={() => setActiveTab('intimacyHub')} onNav={setActiveTab} schedules={schedules} husbandInfo={husbandInfo} wifeInfo={wifeInfo} onUpdateMemo={updateProfileInfo} activeTab={activeTab} spouseSecretAnswer={spouseSecretAnswer} setSpouseSecretAnswer={setSpouseSecretAnswer} mySecretAnswer={mySecretAnswer} setMySecretAnswer={setMySecretAnswer} isMySecretAnswered={isMySecretAnswered} setIsMySecretAnswered={setIsMySecretAnswered} isRevealed={isSecretRevealed} setIsRevealed={setIsSecretRevealed} supabase={supabase} updateProfileInfo={updateProfileInfo} notifPermission={notifPermission} />
            </div>

            <AnimatePresence mode="wait">
              {activeTab !== 'home' && (
                <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} className="absolute inset-0 z-10 bg-[#FDFCF0]">
                  {activeTab === 'calendar' && <CalendarView schedules={schedules} onAddSchedule={addSchedule} onDeleteSchedule={deleteSchedule} onBack={() => setActiveTab('home')} />}
                  {activeTab === 'cardGame' && (
                    <div className="h-full">
                      {dialogueGuideId ? <GameGuideView gameId={dialogueGuideId} onStart={() => { setDialogueTab(dialogueGuideId); setDialogueGuideId(null); }} onBack={() => setDialogueGuideId(null)} /> : 
                       dialogueTab === 'choice' ? <DialogueChoiceView onSelect={setDialogueGuideId} onBack={() => setActiveTab('home')} /> : 
                       dialogueTab === 'cardGame' ? <CardGameView coupleCode={coupleCode} userRole={userRole} mainChannel={mainChannel} onBack={() => setDialogueTab('choice')} husbandInfo={husbandInfo} wifeInfo={wifeInfo} onUpdateMemo={updateProfileInfo} /> : 
                       <ImageCardGameView onBack={() => setDialogueTab('choice')} coupleCode={coupleCode} userRole={userRole} mainChannel={mainChannel} husbandInfo={husbandInfo} wifeInfo={wifeInfo} />}
                    </div>
                  )}
                  {activeTab === 'counseling' && (
                    <div className="h-full pt-4 flex flex-col">
                      <div className="flex justify-center mb-4"><div className="bg-black/5 rounded-full p-1 border border-black/5 flex">
                        <button onClick={() => setCounselingMode('chat')} className={`px-5 py-2 rounded-full text-[13px] font-black ${counselingMode === 'chat' ? 'bg-white text-violet-500' : 'text-[#8B7355]'}`}>AI 상담</button>
                        <button onClick={() => setCounselingMode('solution')} className={`px-5 py-2 rounded-full text-[13px] font-black ${counselingMode === 'solution' ? 'bg-white text-violet-500' : 'text-[#8B7355]'}`}>솔루션</button>
                      </div></div>
                      {counselingMode === 'chat' ? <ChatView userRole={userRole} setUserRole={setUserRole} husbandInfo={husbandInfo} wifeInfo={wifeInfo} adminStats={adminStats} schedules={schedules} onBack={() => setActiveTab('home')} /> : <SolutionView userRole={userRole} husbandInfo={husbandInfo} wifeInfo={wifeInfo} schedules={schedules} adminStats={adminStats} coupleStats={coupleStats} onBack={() => setCounselingMode('chat')} />}
                    </div>
                  )}
                  {(activeTab === 'intimacyHub' || activeTab === 'heartPrayer') && <IntimacyHubView user={user} supabase={supabase} mainChannel={mainChannel} userRole={userRole} coupleCode={coupleCode} onBack={() => setActiveTab('home')} partnerPrayers={partnerPrayers} setPartnerPrayers={setPartnerPrayers} bgImage={intimacyBg} onBgUpload={setIntimacyBg} partnerLabel={partnerLabel} husbandInfo={husbandInfo} wifeInfo={wifeInfo} setHusbandInfo={setHusbandInfo} setWifeInfo={setWifeInfo} updateProfileInfo={updateProfileInfo} initialTab={activeTab === 'heartPrayer' ? 'prayer' : 'garden'} />}
                  {activeTab === 'worship' && <WorshipView userRole={userRole} coupleCode={coupleCode} />}
                  {activeTab === 'settings' && <SettingsView user={user} userRole={userRole} coupleCode={coupleCode} husbandInfo={husbandInfo} setHusbandInfo={setHusbandInfo} wifeInfo={wifeInfo} setWifeInfo={setWifeInfo} worshipDays={worshipDays} setWorshipDays={setWorshipDays} worshipTime={worshipTime} setWorshipTime={setWorshipTime} anniversaries={anniversaries} setAnniversaries={setAnniversaries} onReportClick={() => setShowReport(true)} onGuideClick={() => setShowGuidePage(true)} isAdmin={isAdmin} onNav={setActiveTab} onUpdateMemo={updateProfileInfo} subscribeToPushNotifications={subscribeToPushNotifications} />}
                  {activeTab === 'profile' && <ProfileView user={user} userRole={userRole} coupleCode={coupleCode} setHusbandInfo={setHusbandInfo} setWifeInfo={setWifeInfo} husbandInfo={husbandInfo} wifeInfo={wifeInfo} onUpdateProfile={updateProfileInfo} myInfo={userRole === 'husband' ? husbandInfo : wifeInfo} isFullPage={true} />}
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <nav className="bottom-nav">
            <NavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={22} fill={activeTab === 'home' ? "#D4AF37" : "none"} color="#D4AF37" />} label="홈" />
            <NavItem active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<Calendar size={22} fill={activeTab === 'calendar' ? "#D4AF37" : "none"} color="#D4AF37" />} label="오늘일정" />
            <NavItem active={activeTab === 'cardGame'} onClick={() => handleSharedNavigate('cardGame')} icon={<MessageSquare size={22} fill={activeTab === 'cardGame' ? "#D4AF37" : "none"} color="#D4AF37" />} label="대화카드" />
            <NavItem active={activeTab === 'counseling'} onClick={() => setActiveTab('counseling')} icon={<Sparkles size={22} fill={activeTab === 'counseling' ? "#D4AF37" : "none"} color="#D4AF37" />} label="AI하티" />
            <NavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={22} fill={activeTab === 'profile' ? "#D4AF37" : "none"} color="#D4AF37" />} label="내 정보" />
          </nav>

          <AnimatePresence>{showReport && <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-[10000] bg-[#FDFCF0] overflow-y-auto"><SolutionView userRole={userRole} husbandInfo={husbandInfo} wifeInfo={wifeInfo} schedules={schedules} adminStats={adminStats} coupleStats={coupleStats} onBack={() => setShowReport(false)} /></motion.div>}</AnimatePresence>
          <AnimatePresence>{showNotificationList && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNotificationList(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10001] flex items-center justify-center p-5"><motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()} className="w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl"><div className="p-5 border-b border-gray-100 flex justify-between items-center"><span className="text-lg font-black">최근 알림</span><button onClick={() => setNotifications([])} className="text-xs font-black text-[#8B7355]">전체 삭제</button></div><div className="max-h-[400px] overflow-y-auto p-3">{notifications.length === 0 ? <div className="py-10 text-center text-[#8B7355]/60">알림이 없습니다.</div> : notifications.map((n, i) => <div key={i} className="p-4 rounded-2xl mb-2 bg-[#FDFCF0] border border-[#D4AF37]/10"><p className="text-sm font-black text-[#2D1F08] mb-1">{n.title}</p><p className="text-xs text-[#8B7355] font-semibold">{n.body}</p><span className="text-[10px] text-gray-300 mt-2 block">{n.time}</span></div>)}</div></motion.div></motion.div>}</AnimatePresence>
        </>
      )}
    </div>
  );
};
export default React.memo(App);
