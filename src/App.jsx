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

  useEffect(() => {
    localStorage.setItem('husbandInfo', JSON.stringify(husbandInfo));
    localStorage.setItem('wifeInfo', JSON.stringify(wifeInfo));
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('isSetupDone', isSetupDone);
    localStorage.setItem('coupleSchedules', JSON.stringify(schedules));
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [husbandInfo, wifeInfo, userRole, isSetupDone, schedules, notifications]);

  useEffect(() => {
    if ("Notification" in window) setNotifPermission(Notification.permission);
  }, []);

  const sendNativeNotification = (title, body, tab = null) => {
    const newNotif = { id: Date.now(), title, body, tab, time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), read: false };
    setNotifications(prev => [newNotif, ...prev.slice(0, 49)]);
    if (Notification.permission === "granted") {
      new Notification(title, { body }).onclick = () => { if (tab) setActiveTab(tab); window.focus(); };
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

  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const next = prev + 1;
      if (next >= 10) setShowAdminLogin(true);
      return next;
    });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: curSess } }) => { setSession(curSess); setUser(curSess?.user ?? null); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, curSess) => { setSession(curSess); setUser(curSess?.user ?? null); });
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
      .on('broadcast', { event: 'card-game-call' }, ({ payload }) => {
        if (payload.sender !== userRole) sendNativeNotification(`대화 초대 💌`, `${payload.sender === 'husband' ? '남편' : '아내'}님이 대화를 기다리고 있어요!`, 'cardGame');
      })
      .subscribe((status) => { if (status === 'SUBSCRIBED') { setSyncStatus('SUBSCRIBED'); setMainChannel(channel); } });
    return () => supabase.removeChannel(channel);
  }, [user, coupleCode, userRole]);

  return (
    <div className="h-full flex flex-col relative w-full" style={{ '--gold': appTheme.primary, '--gold-glow': `${appTheme.primary}40`, background: appTheme.bg }}>
      {loading && <div className="fixed inset-0 flex items-center justify-center bg-white z-[99999] font-black"><RefreshCw size={40} className="animate-spin" color="#D4AF37" /></div>}
      
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
            <AnimatePresence mode="wait">
              {activeTab === 'home' && (
                <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ width: '100%', height: '100%' }}>
                  <HomeView 
                    user={user} userRole={userRole} coupleCode={coupleCode} mainChannel={mainChannel} 
                    mySignal={mySignal} setMySignal={setMySignal} spouseSignal={spouseSignal} partnerPrayers={partnerPrayers} 
                    onNav={setActiveTab} onIntimacyClick={() => setActiveTab('intimacyHub')}
                    schedules={schedules} husbandInfo={husbandInfo} wifeInfo={wifeInfo} onUpdateMemo={updateProfileInfo} activeTab={activeTab} 
                    spouseSecretAnswer={spouseSecretAnswer} setSpouseSecretAnswer={setSpouseSecretAnswer} 
                    mySecretAnswer={mySecretAnswer} setMySecretAnswer={setMySecretAnswer} 
                    isMySecretAnswered={isMySecretAnswered} setIsMySecretAnswered={setIsMySecretAnswered} 
                    isRevealed={isSecretRevealed} setIsRevealed={setIsSecretRevealed} 
                    notifPermission={notifPermission} supabase={supabase} updateProfileInfo={updateProfileInfo} 
                  />
                </motion.div>
              )}
              {activeTab === 'cardGame' && (
                <motion.div key="cardGame" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', height: '100%' }}>
                   <div style={{ padding: '0px', height: '100%', overflowY: 'auto' }}>
                      {dialogueTab === 'choice' && <DialogueChoiceView onSelect={setDialogueTab} onShowGuide={(id) => { setDialogueGuideId(id); setDialogueTab('guide'); }} onBack={() => setActiveTab('home')} />}
                      {dialogueTab === 'imageGame' && <ImageCardGameView coupleCode={coupleCode} userRole={userRole} mainChannel={mainChannel} husbandInfo={husbandInfo} wifeInfo={wifeInfo} onBack={() => setDialogueTab('choice')} />}
                      {dialogueTab === 'cardGame' && <CardGameView coupleCode={coupleCode} userRole={userRole} mainChannel={mainChannel} husbandInfo={husbandInfo} wifeInfo={wifeInfo} onUpdateMemo={updateProfileInfo} onBack={() => setDialogueTab('choice')} />}
                      {dialogueTab === 'guide' && <GameGuideView guideId={dialogueGuideId} onBack={() => setDialogueTab('choice')} />}
                   </div>
                </motion.div>
              )}
              {activeTab === 'counseling' && (
                <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
              {activeTab === 'profile' && <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ProfileView user={user} userRole={userRole} husbandInfo={husbandInfo} wifeInfo={wifeInfo} onUpdateProfile={updateProfileInfo} isFullPage={true} /></motion.div>}
              {activeTab === 'settings' && <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SettingsView user={user} userRole={userRole} husbandInfo={husbandInfo} wifeInfo={wifeInfo} onBack={() => setActiveTab('home')} onReportClick={() => setActiveTab('report')} /></motion.div>}
              {activeTab === 'report' && <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SolutionView onBack={() => setActiveTab('settings')} userRole={userRole} husbandInfo={husbandInfo} wifeInfo={wifeInfo} schedules={schedules} coupleStats={coupleStats} adminStats={adminStats} /></motion.div>}
              {(activeTab === 'intimacyHub' || activeTab === 'heartPrayer') && (
                <motion.div key="intimacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
              {activeTab === 'calendar' && <motion.div key="cal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><CalendarView schedules={schedules} onAddSchedule={s => setSchedules([...schedules, s])} onDeleteSchedule={id => setSchedules(schedules.filter(s => s.id !== id))} onBack={() => setActiveTab('home')} /></motion.div>}
            </AnimatePresence>
          </main>

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
