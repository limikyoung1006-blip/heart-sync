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

const NavItem = React.memo(({ active, onClick, icon, label }) => (
  <div onClick={onClick} className={`nav-item ${active ? 'active' : ''}`}>
    <div className="nav-icon-wrapper">
      {icon}
    </div>
    <span>{label}</span>
  </div>
));

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
  const [syncStatus, setSyncStatus] = useState('WAITING');
  const [notifPermission, setNotifPermission] = useState('default');
  const [adminStats, setAdminStats] = useState({ users: 0, couples: 0, activeSessions: 0, recentActivities: [] });
  
  const [spouseSecretAnswer, setSpouseSecretAnswer] = useState(() => localStorage.getItem('spouseSecretAnswer')); 
  const [mySecretAnswer, setMySecretAnswer] = useState(() => localStorage.getItem('mySecretAnswer') || ""); 
  const [isMySecretAnswered, setIsMySecretAnswered] = useState(() => localStorage.getItem('isMySecretAnswered') === 'true'); 
  const [isSecretRevealed, setIsSecretRevealed] = useState(() => localStorage.getItem('isSecretRevealed') === 'true'); 
  const [isSetupDone, setIsSetupDone] = useState(() => localStorage.getItem('isSetupDone') === 'true');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'husband');
  const [coupleStats, setCoupleStats] = useState({ totalInteractions: 0, prayerCount: 0, signalCount: 0, scheduleCount: 0 });
  const [coupleCode, setCoupleCode] = useState(() => localStorage.getItem('coupleCode') || 'HS-7289');
  
  const [husbandInfo, setHusbandInfo] = useState(() => JSON.parse(localStorage.getItem('husbandInfo') || '{"nickname":"김남편", "mbti":"ISTJ", "blood":"A", "marriageDate":"2020-05-23"}'));
  const [wifeInfo, setWifeInfo] = useState(() => JSON.parse(localStorage.getItem('wifeInfo') || '{"nickname":"박아내", "mbti":"ENFP", "blood":"B", "marriageDate":"2020-05-23"}'));
  const [schedules, setSchedules] = useState(() => JSON.parse(localStorage.getItem('coupleSchedules') || '[]'));
  const [notifications, setNotifications] = useState(() => { try { const saved = localStorage.getItem('notifications'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; } });
  const [showNotificationList, setShowNotificationList] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  const [worshipDays, setWorshipDays] = useState(() => JSON.parse(localStorage.getItem('worshipDays') || '[1,2,3,4,5,6,0]')); 
  const [worshipTime, setWorshipTime] = useState(() => localStorage.getItem('worshipTime') || '21:00');
  const [anniversaries, setAnniversaries] = useState(() => { try { const saved = localStorage.getItem('anniversaries'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; } });
  
  const activeTabRef = useRef('home');
  useEffect(() => { activeTabRef.current = activeTab }, [activeTab]);
  const lastNavIdRef = useRef(localStorage.getItem('lastProcessedNavId'));
  const [mainChannel, setMainChannel] = useState(null);
  const appTheme = { id: 'warm', primary: '#D4AF37', bg: '#FDFCF0' };
  
  const [mySignal, setMySignal] = useState('green');
  const [spouseSignal, setSpouseSignal] = useState('green');
  const [partnerPrayers, setPartnerPrayers] = useState([]);
  const [dialogueTab, setDialogueTab] = useState('choice'); 
  const [dialogueGuideId, setDialogueGuideId] = useState(null);

  // 📱 Mobile Fix: Force scroll to top on tab change to prevent 'white screen' scroll artifacts
  useEffect(() => {
    window.scrollTo(0, 0);
    const mainArea = document.querySelector('.main-content');
    if (mainArea) mainArea.scrollTop = 0;
  }, [activeTab]);

  // Sync state with browser history for mobile back button support
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
        if (event.state.dialogueTab) setDialogueTab(event.state.dialogueTab);
      } else {
        setActiveTab('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Use a safer history push that doesn't block the UI thread during navigation transitions
  useEffect(() => {
    const pushTimer = setTimeout(() => {
      try {
        const currentState = window.history.state;
        if (!currentState || currentState.tab !== activeTab) {
          window.history.pushState({ tab: activeTab }, '', '');
        }
      } catch (e) {
        console.warn("History push failed safely:", e);
      }
    }, 100);
    return () => clearTimeout(pushTimer);
  }, [activeTab]);

  useEffect(() => {
    try {
      localStorage.setItem('husbandInfo', JSON.stringify(husbandInfo || {}));
      localStorage.setItem('wifeInfo', JSON.stringify(wifeInfo || {}));
      localStorage.setItem('userRole', userRole || 'husband');
      localStorage.setItem('isSetupDone', isSetupDone ? 'true' : 'false');
      localStorage.setItem('coupleSchedules', JSON.stringify(schedules || []));
      localStorage.setItem('notifications', JSON.stringify(notifications || []));
      localStorage.setItem('worshipDays', JSON.stringify(worshipDays || []));
      localStorage.setItem('worshipTime', worshipTime || '21:00');
      localStorage.setItem('anniversaries', JSON.stringify(anniversaries || []));
    } catch (e) {
      console.warn("State persistence safely skipped:", e);
    }
  }, [husbandInfo, wifeInfo, userRole, isSetupDone, schedules, notifications, worshipDays, worshipTime, anniversaries]);

  useEffect(() => {
    if ("Notification" in window) setNotifPermission(Notification.permission);
  }, []);

  const sendNativeNotification = (title, body, tab = null) => {
    const newNotif = { id: Date.now(), title, body, tab, time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), read: false };
    setNotifications(prev => [newNotif, ...prev.slice(0, 49)]);
    if (Notification.permission === "granted") {
      new Notification(title, { body }).onclick = () => { if (tab) setActiveTab(tab === 'cardGame' ? 'cardGameQuestion' : tab); window.focus(); };
    }
  };

  const updateProfileInfo = async (text, extraInfo = {}) => {
    if (!user?.id) return;
    const baseInfo = userRole === 'husband' ? husbandInfo : wifeInfo;
    
    // Logic to distinguish between simple memo updates and deep metadata (like analysis)
    let updatedInfo;
    if (text === 'deepAnalysis') {
       updatedInfo = { ...baseInfo, deepAnalysis: extraInfo };
    } else {
       updatedInfo = { ...baseInfo, ...extraInfo };
       if (text !== undefined) updatedInfo.todayMemo = text;
    }

    if (userRole === 'husband') {
      setHusbandInfo(prev => ({ ...prev, ...updatedInfo }));
    } else {
      setWifeInfo(prev => ({ ...prev, ...updatedInfo }));
    }
    
    if (mainChannel) {
      mainChannel.send({ 
        type: 'broadcast', 
        event: 'memo-updated', 
        payload: { sender: userRole, text: text === 'deepAnalysis' ? '심층 분석 완료' : text, extraInfo: text === 'deepAnalysis' ? { deepAnalysis: extraInfo } : extraInfo } 
      });
    }
    
    await supabase.from('profiles').upsert({ 
      id: user.id, 
      couple_id: coupleCode.toLowerCase().trim(), 
      user_role: userRole, 
      info: updatedInfo, 
      updated_at: new Date().toISOString() 
    }, { onConflict: 'id' });
  };

  // Family Worship Notification Scheduler
  useEffect(() => {
    if (!isSetupDone) return;
    const checkWorshipNotif = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (worshipDays.includes(currentDay) && currentTime === worshipTime) {
        const lastNotif = localStorage.getItem('lastWorshipNotif');
        const todayKey = `${now.toDateString()}-${currentTime}`;
        if (lastNotif !== todayKey) {
          sendNativeNotification("🙏 가정예배 시간입니다", "하나님의 은혜를 함께 나누는 복된 시간 되세요.", "worship");
          localStorage.setItem('lastWorshipNotif', todayKey);
        }
      }
    };
    const intervalId = setInterval(checkWorshipNotif, 45000); 
    return () => clearInterval(intervalId);
  }, [isSetupDone, worshipDays, worshipTime]);

  const handleOnboardingFinish = async (info) => {
    try {
      const finalCode = (info.coupleCode || coupleCode || "").toLowerCase().trim();
      if (!finalCode) {
        alert("커플 연결 코드가 필요합니다.");
        return;
      }
      setCoupleCode(finalCode);
      const currentInfo = userRole === 'husband' ? husbandInfo : wifeInfo;
      const updated = { ...currentInfo, ...info, coupleCode: finalCode };
      
      if (userRole === 'husband') setHusbandInfo(updated); 
      else setWifeInfo(updated);

      // 💾 Immediate Storage for safety
      localStorage.setItem('isSetupDone', 'true');
      localStorage.setItem('coupleCode', finalCode);

      // ☁️ Sync with Supabase (Background)
      await supabase.from('profiles').upsert({ 
        id: user.id, 
        couple_id: finalCode, 
        user_role: userRole, 
        info: updated, 
        updated_at: new Date().toISOString() 
      }, { onConflict: 'id' });

      setIsSetupDone(true);
    } catch (err) {
      console.error("Setup finish failed:", err);
      // Even if sync fails, let them in if we have local info, or alert
      setIsSetupDone(true); 
    }
  };

  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const next = prev + 1;
      if (next >= 10) setShowAdminLogin(true);
      return next;
    });
  };

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session: curSess } }) => { 
        setSession(curSess); 
        setUser(curSess?.user ?? null); 
        setLoading(false); 
      })
      .catch((err) => {
        console.error("Session check failed, proceeding to auth:", err);
        setLoading(false); // Ensure loading is released even on error
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, curSess) => { 
      setSession(curSess); 
      setUser(curSess?.user ?? null); 
    });
    return () => subscription.unsubscribe();
  }, []);

  // 📱 Mobile-Robust Sync Strategy
  useEffect(() => {
    if (!user || !coupleCode) return;
    
    // Normalize code for consistent channel binding
    const normalizedCode = coupleCode.trim().toLowerCase();
    const channelName = `couple-${normalizedCode}`;
    
    // Create channel with mobile-optimized configuration
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false, ack: true }, // Add ACKs for better reliability on mobile
        presence: { key: userRole }
      }
    });

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, payload => {
        if (!payload.new || payload.new.couple_id?.toLowerCase() !== normalizedCode) return;
        const { user_role: role, info } = payload.new;
        if (role === 'husband') setHusbandInfo(info || {}); 
        else if (role === 'wife') setWifeInfo(info || {});
        if (info?.signal && role !== userRole) setSpouseSignal(info.signal);
      })
      .on('broadcast', { event: 'nav-trigger' }, ({ payload }) => {
        if (payload.sender !== userRole && payload.navId !== lastNavIdRef.current) { 
          lastNavIdRef.current = payload.navId; 
          setActiveTab(payload.tab); 
        }
      })
      .on('broadcast', { event: 'card-game-call' }, ({ payload }) => {
        if (payload.sender !== userRole) sendNativeNotification(`대화 초대 💌`, `${payload.sender === 'husband' ? '남편' : '아내'}님이 대화를 기다리고 있어요!`, 'cardGameQuestion');
      })
      .on('broadcast', { event: 'secret-answered' }, ({ payload }) => {
        if (payload.sender !== userRole) setSpouseSecretAnswer(payload.text);
      })
      .subscribe((status) => { 
        if (status === 'SUBSCRIBED') { 
          setSyncStatus('SUBSCRIBED'); 
          setMainChannel(channel); 
          console.log(`🔗 Realtime Synced: ${normalizedCode}`);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setSyncStatus('DISCONNECTED');
          console.warn("⚠️ Realtime link unstable, attempting to recover...");
          // No hard retry here to avoid loops, useEffect dependency will naturally trigger re-sub on state changes
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, coupleCode, userRole, supabase]);

  return (
    <div className="h-full flex flex-col relative w-full" style={{ '--gold': appTheme.primary, '--gold-glow': `${appTheme.primary}40`, background: appTheme.bg }}>
      {loading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-[99999] font-black" style={{ background: '#FDFCF0' }}>
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ marginBottom: '20px' }}
          >
            <RefreshCw size={50} className="animate-spin" color="#D4AF37" />
          </motion.div>
          <p style={{ color: '#D4AF37', fontSize: '14px', letterSpacing: '2px', fontWeight: 900 }}>HEART SYNCING...</p>
        </div>
      )}
      
      {!loading && !session && !isAdmin && (
        <AuthView 
          onLogoClick={handleLogoClick}
          showAdminLogin={showAdminLogin}
          setShowAdminLogin={setShowAdminLogin}
          setUser={setUser}
          setSession={setSession}
          setIsAdmin={setIsAdmin}
          userRole={userRole} 
          setUserRole={setUserRole} 
          onFinish={handleOnboardingFinish} 
        />
      )}

      {!loading && (session || isAdmin) && !isSetupDone && (
        <OnboardingView user={user} userRole={userRole} setUserRole={setUserRole} onFinish={handleOnboardingFinish} />
      )}

      {!loading && (session || isAdmin) && isSetupDone && (
        <>
          <div className="top-bar" style={{ 
            visibility: (activeTab === 'heartPrayer') ? 'hidden' : 'visible',
            borderBottom: `1px solid ${appTheme.primary}20`,
            background: 'rgba(255, 255, 255, 0.9)', 
            backdropFilter: 'blur(20px)', zIndex: 100
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} color={appTheme.primary} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 900, color: appTheme.primary }}>
                  {(userRole === 'husband' ? husbandInfo?.nickname : wifeInfo?.nickname) || (userRole === 'husband' ? '남편' : '아내')}님
                </span>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: syncStatus === 'SUBSCRIBED' ? '#4BD991' : '#FFBE61' }} />
              </div>
            </div>
            <div className="top-bar-icons">
              <button className="icon-btn-top" onClick={() => setShowNotificationList(true)} style={{ position: 'relative' }}>
                <Bell size={22} color={appTheme.primary} />
                {notifications.some(n => !n.read) && <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, background: '#FF4D6D', borderRadius: '50%', border: '2px solid white' }} />}
              </button>
              <button className="icon-btn-top" onClick={() => setActiveTab('settings')}><Settings size={22} color={appTheme.primary} /></button>
            </div>
          </div>

          <main className="main-content" style={{ background: appTheme.bg, position: 'relative' }}>
            <Suspense fallback={
              <div className="flex items-center justify-center h-full w-full">
                <RefreshCw size={40} className="animate-spin" color="#D4AF37" />
              </div>
            }>
              <AnimatePresence mode="wait">
                {activeTab === 'home' && (
                  <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ width: '100%', height: '100%' }}>
                    <HomeView 
                      user={user} userRole={userRole} coupleCode={coupleCode} mainChannel={mainChannel} 
                      mySignal={mySignal} setMySignal={setMySignal} spouseSignal={spouseSignal} partnerPrayers={partnerPrayers} 
                      onNav={(tab) => {
                        if (tab === 'cardGame') {
                          setActiveTab('cardGameChoice');
                        } else {
                          setActiveTab(tab);
                        }
                      }} 
                      onIntimacyClick={() => setActiveTab('intimacyHub')}
                      schedules={schedules} husbandInfo={husbandInfo} wifeInfo={wifeInfo} onUpdateMemo={updateProfileInfo} activeTab={activeTab} 
                      spouseSecretAnswer={spouseSecretAnswer} setSpouseSecretAnswer={setSpouseSecretAnswer} 
                      mySecretAnswer={mySecretAnswer} setMySecretAnswer={setMySecretAnswer} 
                      isMySecretAnswered={isMySecretAnswered} setIsMySecretAnswered={setIsMySecretAnswered} 
                      isRevealed={isSecretRevealed} setIsRevealed={setIsSecretRevealed} 
                      notifPermission={notifPermission} supabase={supabase} updateProfileInfo={updateProfileInfo} 
                    />
                  </motion.div>
                )}
                {/* 🌈 Flattened Dialogue Screens */}
                {activeTab === 'cardGameChoice' && (
                  <motion.div key="choice" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <DialogueChoiceView 
                      onSelect={(id) => setActiveTab(id === 'cardGame' ? 'cardGameQuestion' : 'imageGame')} 
                      onShowGuide={(id) => { setDialogueGuideId(id); setActiveTab('cardGameGuide'); }} 
                      onBack={() => setActiveTab('home')} 
                    />
                  </motion.div>
                )}
                {activeTab === 'cardGameQuestion' && (
                  <motion.div key="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <CardGameView 
                      coupleCode={coupleCode} 
                      userRole={userRole} 
                      mainChannel={mainChannel} 
                      husbandInfo={husbandInfo} 
                      wifeInfo={wifeInfo} 
                      onUpdateMemo={updateProfileInfo} 
                      onBack={() => {
                        setDialogueGuideId('cardSync'); // Ensure it's the right guide
                        setActiveTab('cardGameGuide');
                      }} 
                    />
                  </motion.div>
                )}
                {activeTab === 'imageGame' && (
                  <motion.div key="image" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <ImageCardGameView 
                      coupleCode={coupleCode} 
                      userRole={userRole} 
                      mainChannel={mainChannel} 
                      husbandInfo={husbandInfo} 
                      wifeInfo={wifeInfo} 
                      onBack={() => {
                        setDialogueGuideId('imageSync'); // Ensure it's the right guide
                        setActiveTab('cardGameGuide');
                      }} 
                    />
                  </motion.div>
                )}
                {activeTab === 'cardGameGuide' && (
                  <motion.div key="guide" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                    <GameGuideView gameId={dialogueGuideId} onStart={() => setActiveTab(dialogueGuideId === 'imageSync' ? 'imageGame' : 'cardGameQuestion')} onBack={() => setActiveTab('cardGameChoice')} />
                  </motion.div>
                )}
                {activeTab === 'counseling' && (
                  <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <ChatView 
                      userRole={userRole} 
                      setUserRole={setUserRole}
                      husbandInfo={husbandInfo} 
                      setHusbandInfo={setHusbandInfo}
                      wifeInfo={wifeInfo} 
                      setWifeInfo={setWifeInfo}
                      schedules={schedules} 
                      adminStats={adminStats} 
                      onBack={() => setActiveTab('home')} 
                    />
                  </motion.div>
                )}
                {activeTab === 'profile' && (
                  <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <ProfileView 
                      user={user} 
                      userRole={userRole} 
                      husbandInfo={husbandInfo} 
                      setHusbandInfo={setHusbandInfo} 
                      wifeInfo={wifeInfo} 
                      setWifeInfo={setWifeInfo} 
                      coupleCode={coupleCode}
                      isFullPage={true} 
                    />
                  </motion.div>
                )}
                {activeTab === 'settings' && (
                  <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <SettingsView 
                      user={user} userRole={userRole} 
                      husbandInfo={husbandInfo} setHusbandInfo={setHusbandInfo}
                      wifeInfo={wifeInfo} setWifeInfo={setWifeInfo}
                      coupleCode={coupleCode} setCoupleCode={setCoupleCode}
                      onUpdateMemo={updateProfileInfo}
                      onBack={() => setActiveTab('home')} 
                      onNav={(tab) => setActiveTab(tab)}
                      onReportClick={() => setActiveTab('report')} 
                      onGuideClick={() => setShowGuide(true)}
                      anniversaries={anniversaries}
                      setAnniversaries={setAnniversaries}
                      worshipDays={worshipDays}
                      setWorshipDays={setWorshipDays}
                      worshipTime={worshipTime}
                      setWorshipTime={setWorshipTime}
                    />
                  </motion.div>
                )}
                {activeTab === 'report' && <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><SolutionView onBack={() => setActiveTab('settings')} userRole={userRole} husbandInfo={husbandInfo} wifeInfo={wifeInfo} schedules={schedules} coupleStats={coupleStats} adminStats={adminStats} /></motion.div>}
                {(activeTab === 'intimacyHub' || activeTab === 'heartPrayer') && (
                  <motion.div key="intimacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <IntimacyHubView 
                      user={user}
                      userRole={userRole} 
                      coupleCode={coupleCode} 
                      husbandInfo={husbandInfo} 
                      wifeInfo={wifeInfo} 
                      setHusbandInfo={setHusbandInfo}
                      setWifeInfo={setWifeInfo}
                      mainChannel={mainChannel} 
                      supabase={supabase}
                      partnerPrayers={partnerPrayers}
                      setPartnerPrayers={setPartnerPrayers}
                      updateProfileInfo={updateProfileInfo}
                      initialTab={activeTab === 'heartPrayer' ? 'prayer' : 'garden'} 
                      onBack={() => setActiveTab('home')} 
                    />
                  </motion.div>
                )}
                {activeTab === 'worship' && (
                  <motion.div key="worship" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <WorshipView 
                      userRole={userRole} 
                      coupleCode={coupleCode} 
                      onAddSchedule={(s) => setSchedules(prev => [...prev.filter(oldS => oldS.id !== s.id), s])}
                    />
                  </motion.div>
                )}
                {activeTab === 'calendar' && <motion.div key="cal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><CalendarView schedules={schedules} onAddSchedule={s => setSchedules([...schedules, s])} onDeleteSchedule={id => setSchedules(schedules.filter(s => s.id !== id))} onBack={() => setActiveTab('home')} /></motion.div>}
              </AnimatePresence>
            </Suspense>
          </main>

          <AnimatePresence>
            {showGuide && <AppGuideView onClose={() => setShowGuide(false)} />}
          </AnimatePresence>

          <nav className="bottom-nav">
            <NavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={22} fill={activeTab === 'home' ? appTheme.primary : "none"} color={appTheme.primary} />} label="홈" />
            <NavItem active={activeTab.startsWith('cardGame') || activeTab === 'imageGame'} onClick={() => setActiveTab('cardGameChoice')} icon={<MessageSquare size={22} fill={(activeTab.startsWith('cardGame') || activeTab === 'imageGame') ? appTheme.primary : "none"} color={appTheme.primary} />} label="대화카드" />
            <NavItem active={activeTab === 'counseling'} onClick={() => setActiveTab('counseling')} icon={<Sparkles size={22} fill={activeTab === 'counseling' ? appTheme.primary : "none"} color={appTheme.primary} />} label="AI하티" />
            <NavItem active={activeTab === 'worship'} onClick={() => setActiveTab('worship')} icon={<BookOpen size={22} fill={activeTab === 'worship' ? appTheme.primary : "none"} color={appTheme.primary} />} label="가정예배" />
            <NavItem active={activeTab === 'intimacyHub'} onClick={() => setActiveTab('intimacyHub')} icon={<Heart size={22} fill={activeTab === 'intimacyHub' ? appTheme.primary : "none"} color={appTheme.primary} />} label="마음정원" />
            <NavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={22} fill={activeTab === 'profile' ? appTheme.primary : "none"} color={appTheme.primary} />} label="내 정보" />
          </nav>
        </>
      )}
    </div>
  );
};

export default App;
