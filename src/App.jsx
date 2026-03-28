import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { 
  Heart, MessageSquare, BookOpen, Settings, Bell, Home, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import Page Components (Restoring Modular Integrity)
import HomeView from './components/home/HomeView';
import CardGameView from './components/game/CardGameView';
import ImageCardGameView from './components/game/ImageCardGameView';
import SettingsView from './components/settings/SettingsView';
import IntimacyHubView from './components/intimacy/IntimacyHubView';

/* 🌊 100% Original Design Components */
const NavItem = ({ active, onClick, icon, label }) => (
  <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
    <div className="nav-icon-wrapper">
      {React.cloneElement(icon, { 
        size: 22, 
        strokeWidth: active ? 2.5 : 2,
        fill: active ? "rgba(255,255,255,0.2)" : "none"
      })}
    </div>
    <span>{label}</span>
  </div>
);

const SplashView = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);
  return (
    <motion.div exit={{ opacity: 0 }} style={{ height: '100dvh', background: '#FDFCF0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
       <img src="/logo_main.png" alt="Logo" style={{ width: '120px' }} />
       <h1 style={{ marginTop: '20px', letterSpacing: '8px', color: '#D4AF37', fontWeight: 900 }}>HEART SYNC</h1>
    </motion.div>
  );
};

const App = () => {
  const [view, setView] = useState('splash'); 
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [husbandInfo, setHusbandInfo] = useState({});
  const [wifeInfo, setWifeInfo] = useState({});
  const [coupleCode, setCoupleCode] = useState(null);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadUserProfile(session.user);
      else setView('splash');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadUserProfile(session.user);
      else setView('splash');
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (currentUser) => {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
    if (profile) {
      setUserRole(profile.user_role);
      setCoupleCode(profile.couple_id);
      syncCoupleData(profile.couple_id);
      setView('home');
    } else {
      setView('auth');
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
    setActiveTab(tab);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  if (view === 'splash') return <SplashView onFinish={() => setView('home')} />;

  return (
    <div 
      id="root"
      ref={scrollRef}
      style={{ 
        width: '100vw', height: '100dvh', overflowY: 'auto', 
        backgroundColor: '#FDFCF0', position: 'relative' 
      }}
    >
      <AnimatePresence mode="wait">
        <main style={{ paddingBottom: '100px' }}>
          {activeTab === 'home' && (
            <HomeView 
              key="home" 
              user={user} userRole={userRole} 
              husbandInfo={husbandInfo} wifeInfo={wifeInfo}
              onNav={handleNav}
            />
          )}

          {activeTab === 'cardGame' && (
             <CardGameView key="game" onBack={() => handleNav('home')} />
          )}

          {activeTab === 'counseling' && (
             <ImageCardGameView key="image" onBack={() => handleNav('home')} />
          )}

          {activeTab === 'heartPrayer' && (
             <IntimacyHubView key="intimacy" onBack={() => handleNav('home')} />
          )}

          {activeTab === 'settings' && (
             <SettingsView 
               key="settings" 
               userRole={userRole} 
               husbandInfo={husbandInfo} wifeInfo={wifeInfo}
               onNav={handleNav} 
             />
          )}
        </main>
      </AnimatePresence>

      {/* 💎 100% RESTORED Bottom Nav Bar - Exactly matching index.css */}
      <nav className="bottom-nav">
        <NavItem active={activeTab === 'home'} onClick={() => handleNav('home')} icon={<Home />} label="홈" />
        <NavItem active={activeTab === 'cardGame'} onClick={() => handleNav('cardGame')} icon={<MessageSquare />} label="대화카드" />
        <NavItem active={activeTab === 'counseling'} onClick={() => handleNav('counseling')} icon={<Sparkles />} label="이미지대화" />
        <NavItem active={activeTab === 'worship'} onClick={() => handleNav('worship')} icon={<BookOpen />} label="가정예배" />
        <NavItem active={activeTab === 'heartPrayer'} onClick={() => handleNav('heartPrayer')} icon={<Heart />} label="작은숲" />
      </nav>
    </div>
  );
};

export default App;
