import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { 
  Heart, MessageSquare, BookOpen, Settings, Bell, Home, Sparkles, ShieldCheck, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import All Page Components (Full Original Path Calibration)
import HomeView from './components/home/HomeView';
import CardGameView from './components/game/CardGameView';
import ImageCardGameView from './components/game/ImageCardGameView';
import SettingsView from './components/settings/SettingsView';
import IntimacyHubView from './components/intimacy/IntimacyHubView';
import AdminView from './components/admin/AdminView';
import AppGuideView from './components/ui/AppGuideView';
import ChatView from './components/counseling/ChatView'; // 👈 AI 하티 진짜 상담 화면

const NavItem = ({ active, onClick, icon, label }) => (
  <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
    <div className="nav-icon-wrapper">
       {React.cloneElement(icon, { size: 22 })}
    </div>
    <span>{label}</span>
  </div>
);

const App = () => {
  const [view, setView] = useState('home');
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [husbandInfo, setHusbandInfo] = useState({});
  const [wifeInfo, setWifeInfo] = useState({});
  const [coupleCode, setCoupleCode] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserProfile(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
         setUser(session.user);
         loadUserProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (currentUser) => {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
    if (profile) {
      setUserRole(profile.user_role);
      setCoupleCode(profile.couple_id);
      setIsAdmin(profile.is_admin || false);
      syncCoupleData(profile.couple_id);
    }
  };

  const syncCoupleData = async (code) => {
    if (!code) return;
    const { data: profiles } = await supabase.from('profiles').select('*').eq('couple_id', code);
    if (!profiles) return;
    profiles.forEach(p => {
      if (p.user_role === 'husband') setHusbandInfo(p.info || {});
      else if (p.user_role === 'wife') setWifeInfo(p.info || {});
    });
  };

  const handleNav = (tab) => {
    // [STABILITY ENGINE]: 0.15s safety delay to prevent mobile rendering deadlock
    setTimeout(() => {
      setActiveTab(tab);
      if (scrollRef.current) {
        scrollRef.current.scrollTo(0, 0);
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 150);
  };

  return (
    <div id="root" ref={scrollRef} style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#FDFCF0', position: 'relative' }}>
      <AnimatePresence mode="wait">
        <main key={activeTab} style={{ paddingBottom: '100px' }}>
          {activeTab === 'home' && (
            <HomeView 
              user={user} userRole={userRole} 
              husbandInfo={husbandInfo} wifeInfo={wifeInfo}
              onNav={handleNav}
            />
          )}
          {activeTab === 'cardGame' && <CardGameView onBack={() => handleNav('home')} />}
          
          {/* 👈 이미지 대화용 전용 탭/뷰 연결 (사라졌던 기능의 부활!) */}
          {activeTab === 'imageCardGame' && <ImageCardGameView onBack={() => handleNav('home')} />}
          
          {/* 👈 AI 하티 전용 탭 (ChatView 연결로 상담 기능 부활!) */}
          {activeTab === 'counseling' && <ChatView onBack={() => handleNav('home')} />}
          
          {activeTab === 'heartPrayer' && <IntimacyHubView onBack={() => handleNav('home')} />}
          {activeTab === 'settings' && (
             <SettingsView userRole={userRole} husbandInfo={husbandInfo} wifeInfo={wifeInfo} onNav={handleNav} />
          )}
          {activeTab === 'admin' && <AdminView onBack={() => handleNav('home')} />}
          {activeTab === 'guide' && <AppGuideView onBack={() => handleNav('home')} />}
        </main>
      </AnimatePresence>

      <nav className="bottom-nav">
        <NavItem active={activeTab === 'home'} onClick={() => handleNav('home')} icon={<Home />} label="홈" />
        <NavItem active={activeTab === 'cardGame'} onClick={() => handleNav('cardGame')} icon={<MessageSquare />} label="대화카드" />
        <NavItem active={activeTab === 'counseling'} onClick={() => handleNav('counseling')} icon={<Sparkles />} label="AI하티" />
        <NavItem active={activeTab === 'heartPrayer'} onClick={() => handleNav('heartPrayer')} icon={<Heart />} label="작은숲" />
        <NavItem active={activeTab === 'settings'} onClick={() => handleNav('settings')} icon={<Settings />} label="설정" />
      </nav>
      {isAdmin && (
        <button onClick={() => handleNav('admin')} style={{ position: 'fixed', bottom: '180px', right: '20px', width: '45px', height: '45px', borderRadius: '50%', background: 'white', color: '#D4AF37', border: '1px solid #F5D060', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', zIndex: 8000 }}>
           <ShieldCheck size={22} />
        </button>
      )}
      <button onClick={() => handleNav('guide')} style={{ position: 'fixed', bottom: '110px', right: '20px', width: '45px', height: '45px', borderRadius: '50%', background: 'white', color: '#8B7355', border: '1px solid #EEE', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', zIndex: 8000 }}>
        <Info size={22} />
      </button>
    </div>
  );
};

export default App;
