import React, { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Calendar, Settings, Bell, User, MessageCircle, MessageSquare,
  Sparkles, RefreshCw, Home, Users, Info, HelpCircle, 
  ChevronRight, ArrowLeft, BookOpen, Clock, Activity, PenTool, Layout,
  BarChart3, ArrowRight, ChevronLeft, ChevronDown, Plus, Trash2, Edit2,
  Camera, Upload, CheckCircle2, ListTodo, AlertCircle, Palette, ClipboardList,
  Fingerprint, Flame, Clipboard, Book, Zap, Send, Music, Smile, ShieldCheck,
  StickyNote, X, Image as ImageIcon
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

// App constants
const APP_DEBUG = true;

const HATTI_TODOS = [
  { id: 1, action: "말하기", text: "배우자에게 '오늘 하루도 정말 고생 많았어'라고 눈을 맞추며 말해주세요." },
  { id: 2, action: "행동", text: "오늘 저녁 설거지나 청소 중 하나를 배우자 몰래 미리 끝내두세요." },
  { id: 3, action: "스킨십", text: "배우자가 퇴근하고 돌아오면 5초간 따뜻하게 안아주세요." },
  { id: 4, action: "선물", text: "퇴근길에 배우자가 좋아하는 편의점 간식을 하나 사서 건네보세요." },
  { id: 5, action: "경청", text: "오늘 배우자의 이야기를 10분 동안 조언 없이 온전히 들어주세요." }
];

// Initial configuration removed - now managed via state and onboarding
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
  const [spouseSecretAnswer, setSpouseSecretAnswer] = useState(() => localStorage.getItem('spouseSecretAnswer')); // 🗝️ 글로벌 시크릿 답변 상태
  const [mySecretAnswer, setMySecretAnswer] = useState(() => localStorage.getItem('mySecretAnswer') || ""); // 🗝️ 글로벌 나의 답변 상태
  const [isMySecretAnswered, setIsMySecretAnswered] = useState(() => localStorage.getItem('isMySecretAnswered') === 'true'); // 🗝️ 글로벌 나의 답변 완료 여부
  const [isSecretRevealed, setIsSecretRevealed] = useState(() => localStorage.getItem('isSecretRevealed') === 'true'); // 🗝️ 글로벌 카드 뒤집기 상태
  const [isSetupDone, setIsSetupDone] = useState(() => localStorage.getItem('isSetupDone') === 'true');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'husband');
  const [coupleCode, setCoupleCode] = useState(() => localStorage.getItem('coupleCode') || 'HS-7289');
  const [husbandInfo, setHusbandInfo] = useState(() => JSON.parse(localStorage.getItem('husbandInfo') || '{"nickname":"김남편", "mbti":"ISTJ", "blood":"A", "marriageDate":"2020-05-23"}'));
  const [wifeInfo, setWifeInfo] = useState(() => JSON.parse(localStorage.getItem('wifeInfo') || '{"nickname":"박아내", "mbti":"ENFP", "blood":"B", "marriageDate":"2020-05-23"}'));
  const appTheme = { id: 'warm', primary: '#D4AF37', bg: '#FDFCF0' };
  const [mainChannel, setMainChannel] = useState(null); // 📡 Persistent Shared Channel
  const lastGardenNavIdRef = React.useRef(null);
  const lastNotifiedCardQIdRef = React.useRef(null); 
  const lastNotifiedGardenNavIdRef = React.useRef(null);
  const lastNotifiedTabNavIdRef = React.useRef(null);
  const activeTabRef = React.useRef(activeTab);
  const lastNavIdRef = React.useRef(localStorage.getItem('lastProcessedNavId')); 
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
      const updated = [newNotif, ...prev.slice(0, 49)];
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
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

  // Helper for Web Push Registration (For Background Notifications)
  const subscribeToPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // This is a dummy key, user should replace with their own VAPID key if setting up server-side push
        const publicVapidKey = 'BFfU6e9j-eH8O0n6e_z8_vS_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_8_w';
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });
      }
      
      // Save subscription to user's profile for server-side use
      if (subscription && user) {
        await updateProfileInfo(undefined, { pushSubscription: subscription });
      }
    } catch (error) {
      console.warn('Push subscription failed:', error);
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
    activeTabRef.current = activeTab;
    
    // Check for query param tab on mount
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
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
  const [dialogueTab, setDialogueTab] = useState('choice'); // 'choice', 'cardGame', 'imageGame'
  const [dialogueGuideId, setDialogueGuideId] = useState(null); // 'cardGame', 'imageGame'

  const [worshipDays, setWorshipDays] = useState(() => JSON.parse(localStorage.getItem('worshipDays') || '["일", "수"]'));
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
        if (role === 'husband') setHusbandInfo(myProfile.info || {});
        else setWifeInfo(myProfile.info || {});
        
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
          if (hP) setHusbandInfo(hP.info || {});
          if (wP) setWifeInfo(wP.info || {});
          const commonInfo = hP?.info || wP?.info;
          if (commonInfo) {
            if (commonInfo.worshipDays) setWorshipDays(commonInfo.worshipDays);
            if (commonInfo.worshipTime) setWorshipTime(commonInfo.worshipTime);
            if (commonInfo.anniversaries) setAnniversaries(commonInfo.anniversaries);
            if (commonInfo.coupleSchedules) setSchedules(commonInfo.coupleSchedules);
            
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

    // 🧹 DB 레거시 요청 초기화 (무한루프 방지)
    const cleanupLegacyRequest = async () => {
      try {
        const { data } = await supabase.from('profiles').select('info').eq('id', user.id).single();
        if (data?.info?.requestTab || data?.info?.navId) {
          const cleanInfo = { ...data.info };
          delete cleanInfo.requestTab;
          delete cleanInfo.navId;
          await supabase.from('profiles').update({ info: cleanInfo }).eq('id', user.id);
        }
      } catch (e) {}
    };
    cleanupLegacyRequest();

    const channel = supabase.channel(`couple-${final_code}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, payload => {
        if (!payload.new || payload.new.couple_id?.toLowerCase() !== final_code) return;
        const { user_role: role, info } = payload.new;
        if (role === 'husband') setHusbandInfo(info || {}); else if (role === 'wife') setWifeInfo(info || {});
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
      })
      .on('broadcast', { event: 'nav-trigger' }, ({ payload }) => {
        if (payload.sender !== userRole && payload.tab && payload.navId !== lastNavIdRef.current) {
          lastNavIdRef.current = payload.navId;
          localStorage.setItem('lastProcessedNavId', payload.navId);
          setActiveTab(payload.tab);
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
              setIncomingCardCall({ type: 'garden', sender: senderLabel, text: payload.title, msgType: 'chat' });
           } else {
              sendNativeNotification(
                `${senderLabel}님의 대화 요청 🃏`,
                '함께 깊은 대화를 나누고 싶어해요! 카드 게임으로 오세요.',
                'cardGame'
              );
              setIncomingCardCall({ type: 'card', category: payload.category, questionId: payload.questionId, sender: senderLabel });
           }
        }
      })
      .on('broadcast', { event: 'game-update' }, ({ payload }) => {
        if (payload.sender !== userRole) {
          window.dispatchEvent(new CustomEvent('card-game-update', { detail: payload }));
        }
      })
      .on('broadcast', { event: 'secret-revealed' }, ({ payload }) => {
        if (payload?.sender !== userRole) {
           const senderLabel = payload.sender === 'husband' ? '남편' : '아내';
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
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole, coupleCode, isSetupDone]);

  // Update My Signal to Supabase
  // 🚥 Master Signal Sync (Single Channel Persistence)
  const handleSetMySignal = async (newSignal) => {
    if (mySignal === newSignal) return;
    
    // 🛡️ Lock local state to prevent real-time listener race
    signalLockRef.current = newSignal;
    setMySignal(newSignal); 
    
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

  const handleSharedNavigate = async (tabName) => {
    setActiveTab(tabName);
    const navId = Math.random().toString(36).substring(7); 
    lastNavIdRef.current = navId;
    localStorage.setItem('lastProcessedNavId', navId);
    
    // Use Real-time Broadcast for navigation (Fast & Ephemeral)
    if (mainChannel) {
      mainChannel.send({
        type: 'broadcast',
        event: 'nav-trigger',
        payload: { sender: userRole, tab: tabName, navId }
      });
      
      if (tabName === 'cardGame') {
        mainChannel.send({
          type: 'broadcast',
          event: 'card-game-call',
          payload: { sender: userRole, category: 'general' }
        });
      }
    }

    // Still update profile as a background record, but the listener now ignores it for navigation
    await updateProfileInfo(undefined, { 
      lastActiveTab: tabName,
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
          user={user}
          userRole={userRole} 
          setUserRole={setUserRole} 
          onFinish={handleOnboardingFinish} 
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
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: 1,
            zIndex: -1
          }} />
          
          {/* Top Bar */}
          <div className="top-bar" style={{ 
            visibility: (activeTab === 'intimacy' || activeTab === 'heartPrayer') ? 'hidden' : 'visible',
            borderBottom: `1px solid ${appTheme.primary}20`,
            background: 'rgba(255, 255, 255, 0.9)', 
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

          <main className="main-content" style={{ background: appTheme.bg }}>
            <AnimatePresence mode="wait">
                {activeTab === 'home' && (
                  <motion.div 
                    key="homeTab"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    style={{ width: '100%', height: '100%' }}
                  >
                  <HomeView 
                    key="home"
                    userRole={userRole}
                    coupleCode={coupleCode}
                    mainChannel={mainChannel}
                    mySignal={mySignal} 
                    setMySignal={handleSetMySignal}
                    spouseSignal={spouseSignal}
                    partnerPrayers={partnerPrayers}
                    onIntimacyClick={() => setActiveTab('intimacyHub')}
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
                    supabase={supabase}
                  />
                </motion.div>
              )}
              {activeTab === 'calendar' && (
                <motion.div 
                  key="calendarTab"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <CalendarView 
                    key="calendar" 
                    schedules={schedules} 
                    onAddSchedule={addSchedule} 
                    onDeleteSchedule={deleteSchedule} 
                    onBack={() => setActiveTab('home')} 
                  />
                </motion.div>
              )}
              {activeTab === 'cardGame' && (
                <motion.div 
                  key="cardGameTab"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ width: '100%', height: '100%' }}
                >
                  {dialogueGuideId ? (
                    <GameGuideView 
                      gameId={dialogueGuideId} 
                      onStart={() => {
                        setDialogueTab(dialogueGuideId);
                        setDialogueGuideId(null);
                      }} 
                      onBack={() => setDialogueGuideId(null)}
                    />
                  ) : dialogueTab === 'choice' ? (
                    <DialogueChoiceView 
                      onSelect={(mode) => setDialogueGuideId(mode)} 
                      onBack={() => setActiveTab('home')}
                    />
                  ) : dialogueTab === 'cardGame' ? (
                    <CardGameView 
                      key="cardGame" 
                      coupleCode={coupleCode} 
                      userRole={userRole} 
                      mainChannel={mainChannel}
                      onBack={() => setDialogueTab('choice')} 
                      husbandInfo={husbandInfo}
                      wifeInfo={wifeInfo}
                      onUpdateMemo={updateProfileInfo}
                    />
                  ) : (
                    <ImageCardGameView 
                      key="imageGame"
                      onBack={() => setDialogueTab('choice')}
                      coupleCode={coupleCode}
                      userRole={userRole}
                      mainChannel={mainChannel}
                      husbandInfo={husbandInfo}
                      wifeInfo={wifeInfo}
                    />
                  )}
                </motion.div>
              )}
              {activeTab === 'counseling' && (
                <motion.div 
                  key="counselingTab"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex flex-col pt-4 ${counselingMode === 'chat' ? 'flex-1 min-h-0' : ''}`}
                >
                  <div className="flex justify-center mb-4">
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', borderRadius: '100px', padding: '4px', border: '1px solid rgba(0,0,0,0.03)' }}>
                      <button onClick={() => setCounselingMode('chat')} style={{ padding: '8px 20px', borderRadius: '100px', fontSize: '13px', fontWeight: 900, background: counselingMode === 'chat' ? 'white' : 'transparent', color: counselingMode === 'chat' ? '#8A60FF' : '#8B7355' }}>AI 고민상담</button>
                      <button onClick={() => setCounselingMode('solution')} style={{ padding: '8px 20px', borderRadius: '100px', fontSize: '13px', fontWeight: 900, background: counselingMode === 'solution' ? 'white' : 'transparent', color: counselingMode === 'solution' ? '#8A60FF' : '#8B7355' }}>매월 관계 솔루션</button>
                    </div>
                  </div>
                  {counselingMode === 'chat' ? (
                    <ChatView key="chat" userRole={userRole} setUserRole={setUserRole} husbandInfo={husbandInfo} setHusbandInfo={setHusbandInfo} wifeInfo={wifeInfo} setWifeInfo={setWifeInfo} adminStats={adminStats} schedules={schedules} onBack={() => setActiveTab('home')} />
                  ) : (
                    <SolutionView key="solution" userRole={userRole} husbandInfo={husbandInfo} wifeInfo={wifeInfo} schedules={schedules} adminStats={adminStats} coupleStats={coupleStats} onBack={() => setCounselingMode('chat')} />
                  )}
                </motion.div>
              )}
              {(activeTab === 'intimacyHub' || activeTab === 'heartPrayer') && (
                <motion.div 
                  key="intimacyTab" 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                  transition={{ duration: 0.15 }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <IntimacyHubView user={user} supabase={supabase} mainChannel={mainChannel} userRole={userRole} coupleCode={coupleCode} onBack={() => setActiveTab('home')} partnerPrayers={partnerPrayers} setPartnerPrayers={setPartnerPrayers} bgImage={intimacyBg} onBgUpload={setIntimacyBg} partnerLabel={partnerLabel} husbandInfo={husbandInfo} wifeInfo={wifeInfo} setHusbandInfo={setHusbandInfo} setWifeInfo={setWifeInfo} updateProfileInfo={updateProfileInfo} initialTab={activeTab === 'heartPrayer' ? 'prayer' : 'garden'} />
                </motion.div>
              )}
              {activeTab === 'worship' && (
                <motion.div 
                  key="worshipTab" 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <WorshipView key="worship" userRole={userRole} coupleCode={coupleCode} />
                </motion.div>
              )}
              {activeTab === 'settings' && (
                <motion.div 
                  key="settingsTab" 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <SettingsView key="settings" user={user} userRole={userRole} coupleCode={coupleCode} husbandInfo={husbandInfo} setHusbandInfo={setHusbandInfo} wifeInfo={wifeInfo} setWifeInfo={setWifeInfo} worshipDays={worshipDays} setWorshipDays={setWorshipDays} worshipTime={worshipTime} setWorshipTime={setWorshipTime} anniversaries={anniversaries} setAnniversaries={setAnniversaries} onReportClick={() => setShowReport(true)} onGuideClick={() => setShowGuidePage(true)} isAdmin={isAdmin} onNav={setActiveTab} onUpdateMemo={updateProfileInfo} subscribeToPushNotifications={subscribeToPushNotifications} />
                </motion.div>
              )}
              {activeTab === 'admin' && isAdmin && (
                <motion.div 
                  key="adminTab" 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <AdminView key="admin" onBack={() => setActiveTab('home')} usersCount={adminStats.users} couplesCount={adminStats.couples} activeSessions={adminStats.activeSessions} recentActivities={adminStats.recentActivities} />
                </motion.div>
              )}
              {activeTab === 'intimacy' && (
                <motion.div 
                  key="intimacyModalTab" 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <IntimacyModal show={true} onClose={() => setActiveTab('home')} onNav={setActiveTab} subPage={intimacySubPage} setSubPage={setIntimacySubPage} bgImage={intimacyBg} onBgUpload={setIntimacyBg} partnerLabel={partnerLabel} user={user} userRole={userRole} coupleCode={coupleCode} supabase={supabase} mainChannel={mainChannel} setWifeInfo={setWifeInfo} husbandInfo={husbandInfo} wifeInfo={wifeInfo} onUpdateProfile={updateProfileInfo} />
                </motion.div>
              )}
              {activeTab === 'profile' && (
                <motion.div 
                  key="profileTab" 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <ProfileView key="profile" user={user} userRole={userRole} coupleCode={coupleCode} setHusbandInfo={setHusbandInfo} setWifeInfo={setWifeInfo} husbandInfo={husbandInfo} wifeInfo={wifeInfo} onUpdateProfile={updateProfileInfo} myInfo={userRole === 'husband' ? husbandInfo : wifeInfo} isFullPage={true} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Luxury Bottom Nav - 5 Core Tabs */}
          <nav className="bottom-nav">
            <NavItem 
              active={activeTab === 'home'} 
              onClick={() => setActiveTab('home')} 
              icon={<Home size={22} fill={activeTab === 'home' ? appTheme.primary : "none"} color={activeTab === 'home' ? appTheme.primary : undefined} />} 
              label="홈" 
            />
            <NavItem 
              active={activeTab === 'cardGame'} 
              onClick={() => handleSharedNavigate('cardGame')} 
              icon={<MessageSquare size={22} fill={activeTab === 'cardGame' ? appTheme.primary : "none"} color={activeTab === 'cardGame' ? appTheme.primary : undefined} />} 
              label="대화카드" 
            />
            <NavItem 
              active={activeTab === 'counseling'} 
              onClick={() => setActiveTab('counseling')} 
              icon={<Sparkles size={22} fill={activeTab === 'counseling' ? appTheme.primary : "none"} color={activeTab === 'counseling' ? appTheme.primary : undefined} />} 
              label="AI하티" 
            />
            <NavItem 
              active={activeTab === 'worship'} 
              onClick={() => setActiveTab('worship')} 
              icon={<BookOpen size={22} fill={activeTab === 'worship' ? appTheme.primary : "none"} color={activeTab === 'worship' ? appTheme.primary : undefined} />} 
              label="가정예배" 
            />
            <NavItem 
              active={activeTab === 'profile'} 
              onClick={() => setActiveTab('profile')} 
              icon={<User size={22} fill={activeTab === 'profile' ? appTheme.primary : "none"} color={activeTab === 'profile' ? appTheme.primary : undefined} />} 
              label="내 정보" 
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
                     : `${incomingCardCall.sender}님이 대화 카드를 뽑았습니다! 🃏`}
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
    </div>
  );
};

export default React.memo(App);
