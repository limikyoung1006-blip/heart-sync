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
  <div onClick={onClick} className={`nav-item ${active ? 'active' : ''} flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95`}>
    <div className={`nav-icon-wrapper p-2 rounded-2xl ${active ? 'bg-[#D4AF37]/10' : ''}`}>
      {React.cloneElement(icon, { size: 22, color: active ? "#D4AF37" : "#8B7355", fill: active ? "#D4AF37" : "none" })}
    </div>
    <span className={`text-[10px] font-black ${active ? 'text-[#D4AF37]' : 'text-[#8B7355] opacity-60'}`}>{label}</span>
  </div>
));

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
  const [isSetupDone, setIsSetupDone] = useState(() => localStorage.getItem('isSetupDone') === 'true');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'husband');
  const [coupleCode, setCoupleCode] = useState(() => localStorage.getItem('coupleCode') || 'HS-7289');
  
  const [husbandInfo, setHusbandInfo] = useState(() => JSON.parse(localStorage.getItem('husbandInfo') || '{"nickname":"김남편", "mbti":"ISTJ", "blood":"A", "marriageDate":"2020-05-23"}'));
  const [wifeInfo, setWifeInfo] = useState(() => JSON.parse(localStorage.getItem('wifeInfo') || '{"nickname":"박아내", "mbti":"ENFP", "blood":"B", "marriageDate":"2020-05-23"}'));
  const [schedules, setSchedules] = useState(() => JSON.parse(localStorage.getItem('coupleSchedules') || '[]'));
  const [notifications, setNotifications] = useState(() => { try { const saved = localStorage.getItem('notifications'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; } });
  const [syncStatus, setSyncStatus] = useState('WAITING');
  const [mainChannel, setMainChannel] = useState(null);

  const [mySignal, setMySignal] = useState('green');
  const [spouseSignal, setSpouseSignal] = useState('green');
  const [partnerPrayers, setPartnerPrayers] = useState([]);
  const [spouseSecretAnswer, setSpouseSecretAnswer] = useState(() => localStorage.getItem('spouseSecretAnswer'));
  const [mySecretAnswer, setMySecretAnswer] = useState(() => localStorage.getItem('mySecretAnswer') || "");
  const [isMySecretAnswered, setIsMySecretAnswered] = useState(() => localStorage.getItem('isMySecretAnswered') === 'true');
  const [isSecretRevealed, setIsSecretRevealed] = useState(() => localStorage.getItem('isSecretRevealed') === 'true');

  const [dialogueTab, setDialogueTab] = useState('choice');
  const [dialogueGuideId, setDialogueGuideId] = useState(null);
  const [counselingMode, setCounselingMode] = useState('chat');
  const [showNotificationList, setShowNotificationList] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showGuidePage, setShowGuidePage] = useState(false);
  
  const activeTabRef = useRef(activeTab);
  const lastNavIdRef = useRef(localStorage.getItem('lastProcessedNavId'));

  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('husbandInfo', JSON.stringify(husbandInfo));
    localStorage.setItem('wifeInfo', JSON.stringify(wifeInfo));
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('isSetupDone', isSetupDone);
    localStorage.setItem('coupleSchedules', JSON.stringify(schedules));
    localStorage.setItem('notifications', JSON.stringify(notifications));
    localStorage.setItem('mySecretAnswer', mySecretAnswer);
    localStorage.setItem('isMySecretAnswered', isMySecretAnswered);
    localStorage.setItem('spouseSecretAnswer', spouseSecretAnswer || "");
    localStorage.setItem('isSecretRevealed', isSecretRevealed);
  }, [husbandInfo, wifeInfo, userRole, isSetupDone, schedules, notifications, mySecretAnswer, isMySecretAnswered, spouseSecretAnswer, isSecretRevealed]);

  const sendNativeNotification = (title, body, tab = null) => {
    const newNotif = { id: Date.now(), title, body, tab, time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), read: false };
    setNotifications(prev => [newNotif, ...prev.slice(0, 49)]);
    if (Notification.permission === "granted") {
      new Notification(title, { body }).onclick = () => { if (tab) setActiveTab(tab); window.focus(); };
    }
  };

  const updateProfileInfo = async (text, extraInfo = {}) => {
    if (!user?.id) return;
    const info = { ...(userRole === 'husband' ? husbandInfo : wifeInfo), ...extraInfo };
    if (text !== undefined) info.todayMemo = text;
    if (userRole === 'husband') setHusbandInfo(info); else setWifeInfo(info);
    if (mainChannel) mainChannel.send({ type: 'broadcast', event: 'memo-updated', payload: { sender: userRole, text, extraInfo } });
    await supabase.from('profiles').upsert({ id: user.id, couple_id: coupleCode.toLowerCase(), user_role: userRole, info, updated_at: new Date().toISOString() });
  };

  const handleOnboardingFinish = async (info) => {
    const finalCode = (info.coupleCode || coupleCode).toLowerCase().trim();
    setCoupleCode(finalCode);
    const updated = { ...(userRole === 'husband' ? husbandInfo : wifeInfo), ...info, coupleCode: finalCode };
    if (userRole === 'husband') setHusbandInfo(updated); else setWifeInfo(updated);
    await supabase.from('profiles').upsert({ id: user.id, couple_id: finalCode, user_role: userRole, info: updated, updated_at: new Date().toISOString() });
    setIsSetupDone(true);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setUser(session?.user ?? null); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); setUser(session?.user ?? null); });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const final_code = coupleCode.toLowerCase();
    const channel = supabase.channel(`couple-${final_code}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, payload => {
        if (!payload.new || payload.new.couple_id?.toLowerCase() !== final_code) return;
        const { user_role: role, info } = payload.new;
        if (role === 'husband') setHusbandInfo(info || {}); else setWifeInfo(info || {});
        if (info?.signal && role !== userRole) setSpouseSignal(info.signal);
      })
      .on('broadcast', { event: 'nav-trigger' }, ({ payload }) => {
        if (payload.sender !== userRole && payload.navId !== lastNavIdRef.current) { lastNavIdRef.current = payload.navId; setActiveTab(payload.tab); }
      })
      .subscribe(status => { if (status === 'SUBSCRIBED') { setSyncStatus('SUBSCRIBED'); setMainChannel(channel); } });
    return () => supabase.removeChannel(channel);
  }, [user, coupleCode, userRole]);

  return (
    <div className="h-full flex flex-col relative w-full bg-[#FDFCF0] font-sans">
      <AnimatePresence>
        {loading && <motion.div exit={{ opacity: 0 }} className="fixed inset-0 flex items-center justify-center bg-white z-[99999]"><RefreshCw size={40} className="animate-spin" color="#D4AF37" /></motion.div>}
      </AnimatePresence>

      {!loading && !session && (
        <AuthView userRole={userRole} setUserRole={setUserRole} onFinish={handleOnboardingFinish} />
      )}

      {!loading && session && isSetupDone && (
        <>
          <div className="top-bar flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-[100] border-b border-[#D4AF37]/10" style={{ display: (activeTab === 'heartPrayer') ? 'none' : 'flex' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center"><User size={20} color="#D4AF37" /></div>
              <div className="flex flex-col">
                <span className="text-[14px] font-black text-[#2D1F08]">{userRole === 'husband' ? husbandInfo.nickname : wifeInfo.nickname}님</span>
                <span className="text-[10px] font-bold text-[#4BD991]">● 실시간 연결 중</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowNotificationList(true)} className="w-10 h-10 rounded-full flex items-center justify-center relative active:scale-90 transition-transform"><Bell size={22} color="#D4AF37" />{notifications.some(n => !n.read) && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />}</button>
              <button onClick={() => setActiveTab('settings')} className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"><Settings size={22} color="#D4AF37" /></button>
            </div>
          </div>

          <main className="flex-1 relative overflow-hidden">
            {/* 🏠 Zero-Unmount HomeView (Always active but hidden) */}
            <div style={{ position: 'absolute', inset: 0, display: activeTab === 'home' ? 'block' : 'none' }}>
              <HomeView user={user} userRole={userRole} coupleCode={coupleCode} mainChannel={mainChannel} mySignal={mySignal} setMySignal={setMySignal} spouseSignal={spouseSignal} partnerPrayers={partnerPrayers} onNav={setActiveTab} schedules={schedules} husbandInfo={husbandInfo} wifeInfo={wifeInfo} onUpdateMemo={updateProfileInfo} activeTab={activeTab} spouseSecretAnswer={spouseSecretAnswer} setSpouseSecretAnswer={setSpouseSecretAnswer} mySecretAnswer={mySecretAnswer} setMySecretAnswer={setMySecretAnswer} isMySecretAnswered={isMySecretAnswered} setIsMySecretAnswered={setIsMySecretAnswered} isRevealed={isSecretRevealed} setIsRevealed={setIsSecretRevealed} supabase={supabase} updateProfileInfo={updateProfileInfo} />
            </div>

            <AnimatePresence mode="wait">
              {activeTab !== 'home' && (
                <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="absolute inset-0 z-10 bg-[#FDFCF0]">
                  {activeTab === 'calendar' && <CalendarView schedules={schedules} onAddSchedule={s => setSchedules([...schedules, s])} onDeleteSchedule={id => setSchedules(schedules.filter(s => s.id !== id))} onBack={() => setActiveTab('home')} />}
                  {activeTab === 'cardGame' && <CardGameView coupleCode={coupleCode} userRole={userRole} onBack={() => setActiveTab('home')} />}
                  {activeTab === 'profile' && <ProfileView user={user} userRole={userRole} husbandInfo={husbandInfo} wifeInfo={wifeInfo} onUpdateProfile={updateProfileInfo} />}
                  {activeTab === 'settings' && <SettingsView user={user} userRole={userRole} husbandInfo={husbandInfo} wifeInfo={wifeInfo} onBack={() => setActiveTab('home')} />}
                  {activeTab === 'counseling' && <ChatView onBack={() => setActiveTab('home')} />}
                  {activeTab === 'worship' && <WorshipView onBack={() => setActiveTab('home')} />}
                  {(activeTab === 'intimacyHub' || activeTab === 'heartPrayer') && <IntimacyHubView userRole={userRole} coupleCode={coupleCode} onBack={() => setActiveTab('home')} />}
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-[#D4AF37]/10 px-6 py-4 flex justify-between items-center z-[1000] rounded-t-[32px] shadow-[0_-10px_40px_rgba(212,175,55,0.08)]">
            <NavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home />} label="홈" />
            <NavItem active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<Calendar />} label="일정" />
            <NavItem active={activeTab === 'cardGame'} onClick={() => setActiveTab('cardGame')} icon={<MessageSquare />} label="대화카드" />
            <NavItem active={activeTab === 'status'} onClick={() => setActiveTab('intimacyHub')} icon={<Sparkles />} label="마음정원" />
            <NavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User />} label="내 정보" />
          </nav>
        </>
      )}
    </div>
  );
};

export default App;
