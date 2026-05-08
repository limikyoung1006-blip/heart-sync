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
import WorshipView from './components/worship/WorshipView';
import HeartPrayerView from './components/intimacy/HeartPrayerView';
import IntimacyHubView from './components/intimacy/IntimacyHubView';
import OnboardingView from './components/auth/OnboardingView';
import AuthView from './components/auth/AuthView';
import SettingsView from './components/settings/SettingsView';
import IntimacyModal from './components/intimacy/IntimacyModal';
import SolutionView from './components/counseling/SolutionView';
import CalendarView from './components/calendar/CalendarView';
import AppGuideView from './components/ui/AppGuideView';
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
    textAlign: 'left',
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
    border: '1px solid rgba(0,0,0,0.03)',
    cursor: 'pointer'
  }}>
    <strong style={{ color: '#800F2F', fontSize: '15px', fontWeight: 800, textAlign: 'left' }}>{title}</strong>
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

// [Modularization Final Cleanup Done]

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
  const [coupleCode, setCoupleCode] = useState(() => localStorage.getItem('coupleCode') || null);
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
      const direct = localStorage.getItem('mySignal');
      if (direct) return direct;
      
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
  const mySignalRef = useRef(mySignal);
  const myMemoRef = useRef("");

  useEffect(() => {
    mySignalRef.current = mySignal;
  }, [mySignal]);

  useEffect(() => {
    const role = userRole || localStorage.getItem('userRole') || 'husband';
    const info = role === 'husband' ? husbandInfo : wifeInfo;
    myMemoRef.current = info?.todayMemo || "";
  }, [husbandInfo, wifeInfo, userRole]);

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
    
    // Use the robust update instead of a shallow upsert, passing the code explicitly to avoid state race condition
    await updateProfileInfo(undefined, info, finalCode);

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
    await updateProfileInfo(undefined, { coupleSchedules: newSchedules });
  };

  const deleteSchedule = async (id) => {
    const newSchedules = schedules.filter(s => s.id !== id);
    setSchedules(newSchedules);
    await updateProfileInfo(undefined, { coupleSchedules: newSchedules });
  };

  const updateProfileInfo = async (text, extraInfo = {}, overrideCode = null) => {
    if (!user?.id) { console.warn("Update attempt without valid session - skipping sync."); return; }
    
    try {
      // 🕵️ Get latest data from DB to merge with local state
      const { data: latestProfile, error: fetchError } = await supabase.from('profiles').select('info, couple_id').eq('id', user.id).single();
      if (fetchError) console.warn("Could not fetch latest profile for merge:", fetchError);
      
      const currentRemoteInfo = latestProfile?.info || {};
      const localBaseInfo = userRole === 'husband' ? husbandInfo : wifeInfo;
      
      // 🚀 ATOMIC MERGE STRATEGY:
      // 1. Start with CURRENT local state (most up-to-date user intent)
      // 2. Merge latest remote data (pick up updates from partner like prayers/schedules)
      // 3. Apply the NEW changes (extraInfo)
      // 4. Specifically ensure 'signal' and 'todayMemo' use the latest available source
      const updatedInfo = { 
        ...localBaseInfo,
        ...currentRemoteInfo, 
        ...extraInfo 
      };
      
      // Handle persistent fields that might be updated via Refs or explicit args
      if (extraInfo.signal !== undefined) {
        updatedInfo.signal = extraInfo.signal;
      } else if (mySignalRef.current) {
        updatedInfo.signal = mySignalRef.current;
      }

      if (text !== undefined) {
        updatedInfo.todayMemo = text;
      } else if (extraInfo.todayMemo !== undefined) {
        updatedInfo.todayMemo = extraInfo.todayMemo;
      } else if (myMemoRef.current) {
        // Fallback to ref only if not explicitly cleared
        updatedInfo.todayMemo = myMemoRef.current;
      }

      // Update local state immediately for snappy UI
      if (userRole === 'husband') setHusbandInfo(updatedInfo); 
      else setWifeInfo(updatedInfo);
      
      if (mainChannel) {
        mainChannel.send({ 
          type: 'broadcast', 
          event: 'memo-updated', 
          payload: { sender: userRole, text: updatedInfo.todayMemo, extraInfo } 
        });
      }
      
      const targetCode = (overrideCode || coupleCode || latestProfile?.couple_id || "").toLowerCase().trim();
      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: user.id,
        couple_id: targetCode,
        user_role: userRole,
        info: updatedInfo,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

      if (upsertError) throw upsertError;

      // 📬 [Push Notification] Trigger for Signal Change or Garden Update
      if (extraInfo.signal && extraInfo.signal !== (mySignalRef.current || mySignal)) {
        try {
          supabase.functions.invoke('send-push', {
            body: {
              type: 'SIGNAL',
              record: { info: { signal: extraInfo.signal }, couple_id: targetCode, user_role: userRole },
              sender_role: userRole,
              couple_id: targetCode
            }
          });
        } catch (pushErr) { console.warn("Signal Push trigger failed:", pushErr); }
      } else if (extraInfo.gardenMsg) {
        try {
          supabase.functions.invoke('send-push', {
            body: {
              type: 'GARDEN',
              custom_body: extraInfo.gardenMsg,
              sender_role: userRole,
              couple_id: targetCode
            }
          });
        } catch (pushErr) { console.warn("Garden Push trigger failed:", pushErr); }
      }
      
      return updatedInfo;
    } catch (err) {
      console.error("Profile sync error details:", err);
      return null;
    }
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

        // 🛡️ Only load signal from DB if we don't already have one in localStorage to avoid hydration clobbering
        const cachedLocalSignal = localStorage.getItem('mySignal');
        if (myProfile.info?.signal && !cachedLocalSignal) {
          setMySignal(myProfile.info.signal);
        }

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
        } else if (info?.signal && role === userRole) {
          // 🛡️ Local Authority: We do NOT update our own signal from the DB. 
          // Our local 'mySignal' state is the master source of truth.
          // This prevents clobbering by stale updates from other devices/syncs.
          console.log("Self-signal event received - ignoring to prevent clobbering.");
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
        
        // 🗝️ Sync Secret Revealed state from DB
        if (info?.isSecretRevealed !== undefined && role !== userRole) {
          setIsSecretRevealed(info.isSecretRevealed);
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
          const memoText = payload.text || payload.extraInfo?.todayMemo;
          if (isHusband) {
            setHusbandInfo(prev => ({ ...prev, ...payload.extraInfo, todayMemo: memoText }));
          } else {
            setWifeInfo(prev => ({ ...prev, ...payload.extraInfo, todayMemo: memoText }));
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
          setIsSecretRevealed(true);
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
          console.error("Supabase Realtime Channel Error/Closed:", status);
          setSyncStatus('ERROR');
          setMainChannel(null);
          // 🛡️ CRITICAL: Removed automatic window.location.reload() to prevent infinite loops.
          // In unstable network conditions, a reload-loop renders the app unusable.
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
    
    // 🛡️ Pre-emptive local cache update
    const roleKey = userRole === 'husband' ? 'husbandInfo' : 'wifeInfo';
    const currentLocal = JSON.parse(localStorage.getItem(roleKey) || '{}');
    localStorage.setItem(roleKey, JSON.stringify({ ...currentLocal, signal: newSignal }));

    // 📡 빠른 브로드캐스트 알림 발신
    if (mainChannel) {
      mainChannel.send({
        type: 'broadcast',
        event: 'signal-changed',
        payload: { sender: userRole, signal: newSignal }
      });
    }

    try {
      // 🚀 Using the robust fetch-and-merge update method
      await updateProfileInfo(undefined, { signal: newSignal });
    } catch (err) {
      console.error("Signal Sync Error:", err);
    } finally {
      // 🛡️ Lock for 3 seconds to ensure DB roundtrip and Realtime echo are absorbed
      setTimeout(() => { signalLockRef.current = null; }, 3000);
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
                onUpdateProfile={updateProfileInfo}
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
              <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#2D1F08', marginBottom: '12px', textAlign: 'left' }}>
                {dialogueConfirmRole === 'initiator' ? '대화카드를 시작할까요?' : '대화카드 초대 도착!'}
              </h3>
              <p style={{ fontSize: '15px', color: '#8B7355', fontWeight: 700, lineHeight: 1.6, marginBottom: '30px', wordBreak: 'keep-all', textAlign: 'left' }}>
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




