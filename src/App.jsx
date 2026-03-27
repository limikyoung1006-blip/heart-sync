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

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
  const [adminStats, setAdminStats] = useState({ users: 0, couples: 0, activeSessions: 0, recentActivities: [] });
  const [coupleStats, setCoupleStats] = useState({ totalInteractions: 0 });
  const [syncStatus, setSyncStatus] = useState('WAITING');
  
  const [spouseSecretAnswer, setSpouseSecretAnswer] = useState(() => localStorage.getItem('spouseSecretAnswer')); 
  const [mySecretAnswer, setMySecretAnswer] = useState(() => localStorage.getItem('mySecretAnswer') || ""); 
  const [isMySecretAnswered, setIsMySecretAnswered] = useState(() => localStorage.getItem('isMySecretAnswered') === 'true'); 
  const [isSecretRevealed, setIsSecretRevealed] = useState(() => localStorage.getItem('isSecretRevealed') === 'true'); 
  const [isSetupDone, setIsSetupDone] = useState(() => localStorage.getItem('isSetupDone') === 'true');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'husband');
  const [coupleCode, setCoupleCode] = useState(() => localStorage.getItem('coupleCode') || 'HS-7289');
  
  const [husbandInfo, setHusbandInfo] = useState(() => JSON.parse(localStorage.getItem('husbandInfo') || '{"nickname":"김남편", "mbti":"ISTJ", "blood":"A", "marriageDate":"2020-05-23"}'));
  const [wifeInfo, setWifeInfo] = useState(() => JSON.parse(localStorage.getItem('wifeInfo') || '{"nickname":"박아내", "mbti":"ENFP", "blood":"B", "marriageDate":"2020-05-23"}'));
  const [schedules, setSchedules] = useState(() => JSON.parse(localStorage.getItem('coupleSchedules') || '[]'));
  const [notifications, setNotifications] = useState(() => { try { const saved = localStorage.getItem('notifications'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; } });
  const [showNotificationList, setShowNotificationList] = useState(false);
  const [worshipDays, setWorshipDays] = useState(() => JSON.parse(localStorage.getItem('worshipDays') || '["일", "수"]'));
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
  const [incomingCardCall, setIncomingCardCall] = useState(null);
  const [dialogueTab, setDialogueTab] = useState('choice'); 
  const [dialogueGuideId, setDialogueGuideId] = useState(null); 
  const [counselingMode, setCounselingMode] = useState('chat');
  const [showReport, setShowReport] = useState(false);
  const [showGuidePage, setShowGuidePage] = useState(false);
  const [intimacyBg, setIntimacyBg] = useState(localStorage.getItem('intimacyBg') || null);
  const [intimacySubPage, setIntimacySubPage] = useState('main');
  const partnerLabel = userRole === 'husband' ? '아내' : '남편';

  // [DESIGN RESTORE]: All original constants and effect logic
  useEffect(() => {
    localStorage.setItem('husbandInfo', JSON.stringify(husbandInfo));
    localStorage.setItem('wifeInfo', JSON.stringify(wifeInfo));
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('isSetupDone', isSetupDone);
    localStorage.setItem('coupleSchedules', JSON.stringify(schedules));
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [husbandInfo, wifeInfo, userRole, isSetupDone, schedules, notifications]);

  const sendNativeNotification = (title, body, tab = null) => {
    const newNotif = { id: Date.now(), title, body, tab, time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), read: false };
    setNotifications(prev => [newNotif, ...prev.slice(0, 49)]);
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: '/logo_main.png' }).onclick = () => { if (tab) setActiveTab(tab); window.focus(); };
    }
  };

  const updateProfileInfo = async (text, extraInfo = {}) => {
    if (!user?.id) return;
    const baseInfo = userRole === 'husband' ? husbandInfo : wifeInfo;
    const updatedInfo = { ...baseInfo, ...extraInfo };
    if (text !== undefined) updatedInfo.todayMemo = text;
    if (userRole === 'husband') setHusbandInfo(updatedInfo); else setWifeInfo(updatedInfo);
    if (mainChannel) mainChannel.send({ type: 'broadcast', event: 'memo-updated', payload: { sender: userRole, text, extraInfo } });
    await supabase.from('profiles').upsert({ id: user.id, couple_id: coupleCode.toLowerCase().trim(), user_role: userRole, info: updatedInfo, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  };

  const handleOnboardingFinish = async (info) => {
    const finalCode = (info.coupleCode || coupleCode).toLowerCase().trim();
    setCoupleCode(finalCode);
    const updated = { ...(userRole === 'husband' ? husbandInfo : wifeInfo), ...info, coupleCode: finalCode };
    if (userRole === 'husband') setHusbandInfo(updated); else setWifeInfo(updated);
    await supabase.from('profiles').upsert({ id: user.id, couple_id: finalCode, user_role: userRole, info: updated, updated_at: new Date().toISOString() });
    setIsSetupDone(true); localStorage.setItem('isSetupDone', 'true');
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: curSess } }) => { 
      setSession(curSess); setUser(curSess?.user ?? null); setLoading(false); 
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, curSess) => { 
      setSession(curSess); setUser(curSess?.user ?? null); 
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const final_code = coupleCode.toLowerCase().trim();
    const channel = supabase.channel(`couple-${final_code}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, payload => {
        if (!payload.new || payload.new.couple_id?.toLowerCase() !== final_code) return;
        const { user_role: role, info } = payload.new;
        if (role === 'husband') setHusbandInfo(info || {}); else if (role === 'wife') setWifeInfo(info || {});
        if (info?.signal && role !== userRole) setSpouseSignal(info.signal);
      })
      .on('broadcast', { event: 'nav-trigger' }, ({ payload }) => {
        if (payload.sender !== userRole && payload.navId !== lastNavIdRef.current) { lastNavIdRef.current = payload.navId; setActiveTab(payload.tab); }
      })
      .subscribe((status) => { if (status === 'SUBSCRIBED') { setSyncStatus('SUBSCRIBED'); setMainChannel(channel); } });
    return () => supabase.removeChannel(channel);
  }, [user, coupleCode, userRole]);

  return (
    <div className="h-full flex flex-col relative w-full" style={{ '--gold': appTheme.primary, '--gold-glow': `${appTheme.primary}40`, background: appTheme.bg }}>
      {loading && <div className="fixed inset-0 flex items-center justify-center bg-white z-[99999] font-black"><RefreshCw size={40} className="animate-spin" color="#D4AF37" /></div>}
      
      {!loading && !session && !isAdmin && (
        <AuthView 
          onLogoClick={() => setLogoClickCount(c => c + 1)} 
          setUser={setUser} 
          setSession={setSession} 
          setIsAdmin={setIsAdmin} 
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
                  {userRole === 'husband' ? husbandInfo.nickname : wifeInfo.nickname}님
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
            {/* [RESTORED]: Original AnimatePresence structure for Home scroll stability */}
            <AnimatePresence mode="wait">
              {activeTab === 'home' && (
                <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ width: '100%', height: '100%' }}>
                  <HomeView user={user} userRole={userRole} coupleCode={coupleCode} mainChannel={mainChannel} mySignal={mySignal} setMySignal={setMySignal} spouseSignal={spouseSignal} partnerPrayers={partnerPrayers} onNav={setActiveTab} schedules={schedules} husbandInfo={husbandInfo} wifeInfo={wifeInfo} onUpdateMemo={updateProfileInfo} activeTab={activeTab} spouseSecretAnswer={spouseSecretAnswer} setSpouseSecretAnswer={setSpouseSecretAnswer} mySecretAnswer={mySecretAnswer} setMySecretAnswer={setMySecretAnswer} isMySecretAnswered={isMySecretAnswered} setIsMySecretAnswered={setIsMySecretAnswered} isRevealed={isSecretRevealed} setIsRevealed={setIsSecretRevealed} supabase={supabase} updateProfileInfo={updateProfileInfo} />
                </motion.div>
              )}
              {activeTab === 'calendar' && (
                <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', height: '100%' }}>
                  <CalendarView schedules={schedules} onAddSchedule={s => setSchedules([...schedules, s])} onDeleteSchedule={id => setSchedules(schedules.filter(s => s.id !== id))} onBack={() => setActiveTab('home')} />
                </motion.div>
              )}
              {activeTab === 'cardGame' && (
                <motion.div key="cardGame" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', height: '100%' }}>
                   <div style={{ padding: '0px', height: '100%', overflowY: 'auto' }}>
                     {dialogueTab === 'choice' && <DialogueChoiceView onSelect={(mode) => mode === 'image' ? setDialogueTab('image') : setDialogueTab('game')} onShowGuide={(id) => { setDialogueGuideId(id); setDialogueTab('guide'); }} onBack={() => setActiveTab('home')} />}
                     {dialogueTab === 'image' && <ImageCardGameView onBack={() => setDialogueTab('choice')} />}
                     {dialogueTab === 'game' && <CardGameView coupleCode={coupleCode} userRole={userRole} onBack={() => setDialogueTab('choice')} />}
                     {dialogueTab === 'guide' && <GameGuideView guideId={dialogueGuideId} onBack={() => setDialogueTab('choice')} />}
                   </div>
                </motion.div>
              )}
              {activeTab === 'counseling' && (
                <motion.div key="counseling" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', height: '100%' }}>
                  <ChatView onBack={() => setActiveTab('home')} />
                </motion.div>
              )}
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', height: '100%' }}>
                  <ProfileView user={user} userRole={userRole} husbandInfo={husbandInfo} wifeInfo={wifeInfo} onUpdateProfile={updateProfileInfo} isFullPage={true} />
                </motion.div>
              )}
              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', height: '100%' }}>
                   <SettingsView user={user} userRole={userRole} husbandInfo={husbandInfo} wifeInfo={wifeInfo} onBack={() => setActiveTab('home')} />
                </motion.div>
              )}
              {(activeTab === 'intimacyHub' || activeTab === 'heartPrayer') && (
                <motion.div key="intimacyHub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', height: '100%' }}>
                  <IntimacyHubView userRole={userRole} coupleCode={coupleCode} onBack={() => setActiveTab('home')} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* [RESTORED]: Original Bottom Nav without the extra 'Schedule' button */}
          <nav className="bottom-nav">
            <NavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={22} fill={activeTab === 'home' ? appTheme.primary : "none"} color={appTheme.primary} />} label="홈" />
            <NavItem active={activeTab === 'cardGame'} onClick={() => { setActiveTab('cardGame'); setDialogueTab('choice'); }} icon={<MessageSquare size={22} fill={activeTab === 'cardGame' ? appTheme.primary : "none"} color={appTheme.primary} />} label="대화카드" />
            <NavItem active={activeTab === 'counseling'} onClick={() => setActiveTab('counseling')} icon={<Sparkles size={22} fill={activeTab === 'counseling' ? appTheme.primary : "none"} color={appTheme.primary} />} label="AI하티" />
            <NavItem active={activeTab === 'intimacyHub'} onClick={() => setActiveTab('intimacyHub')} icon={<Heart size={22} fill={activeTab === 'intimacyHub' ? appTheme.primary : "none"} color={appTheme.primary} />} label="마음정원" />
            <NavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={22} fill={activeTab === 'profile' ? appTheme.primary : "none"} color={appTheme.primary} />} label="내 정보" />
          </nav>
        </>
      )}
    </div>
  );
};

export default App;
