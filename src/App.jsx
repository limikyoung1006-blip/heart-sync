import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabase';
import HomeView from './components/home/HomeView';
import DialogueChoiceView from './components/dialogue/DialogueChoiceView';
import CardGameView from './components/game/CardGameView';
import ImageCardGameView from './components/game/ImageCardGameView';
import GameGuideView from './components/dialogue/GameGuideView';
import AppHeader from './components/layout/AppHeader';

function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [husbandInfo, setHusbandInfo] = useState(null);
  const [wifeInfo, setWifeInfo] = useState(null);
  const [coupleCode, setCoupleCode] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [mySignal, setMySignal] = useState('none');
  const [spouseSignal, setSpouseSignal] = useState('none');

  // 🛡️ Navigation History Logic - No Animation engine for pure performance
  useEffect(() => {
    // 1. Initial State Setup
    if (!window.history.state) {
      window.history.replaceState({ activeTab: 'home' }, '');
    }

    const handlePopState = (event) => {
      if (event.state && event.state.activeTab) {
        // 🔒 SAFETY DELAY: Wait 150ms before swapping massive components.
        // This prevents the browser from freezing during hardware back action.
        setTimeout(() => {
          setActiveTab(event.state.activeTab);
          window.scrollTo(0, 0);
        }, 150); 
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const changeTab = useCallback((newTab) => {
    if (activeTab === newTab) return;
    
    // We use pushState to sync browser back button with App internal tab
    window.history.pushState({ activeTab: newTab }, '');
    setActiveTab(newTab);
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Auth & Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  // Fetch Family Data
  useEffect(() => {
    if (!session?.user) return;
    
    const fetchData = async () => {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (!profile) return;
      
      const role = profile.role;
      const cCode = profile.couple_code;
      setUserRole(role);
      setCoupleCode(cCode);

      const { data: coupleMatches } = await supabase.from('profiles').select('*').eq('couple_code', cCode);
      if (coupleMatches) {
        const husband = coupleMatches.find(p => p.role === 'husband');
        const wife = coupleMatches.find(p => p.role === 'wife');
        setHusbandInfo(husband);
        setWifeInfo(wife);
        
        // Signal Sync
        if (role === 'husband') {
          setMySignal(husband?.moodSignal || 'none');
          setSpouseSignal(wife?.moodSignal || 'none');
        } else {
          setMySignal(wife?.moodSignal || 'none');
          setSpouseSignal(husband?.moodSignal || 'none');
        }
      }
    };
    fetchData();
  }, [session]);

  // Use the mandatory guide step before entering game
  const handleSelectGame = (gameId) => {
    // Navigate from DialogueChoice -> GameGuide
    changeTab(`guide_${gameId}`);
  };

  const handleStartGame = (gameId) => {
    // Navigate from GameGuide -> GAME
    changeTab(gameId);
  };

  return (
    <div id="app-root-container" style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* HEADER: Only show on home and major list pages */}
      {(activeTab === 'home' || activeTab === 'community') && (
        <AppHeader activeTab={activeTab} changeTab={changeTab} user={session?.user} />
      )}

      {/* 🚀 Main Scrollable View Area - High Stability Implementation */}
      <main 
        id="main-scroller"
        style={{ 
          flex: 1, 
          width: '100%', 
          maxWidth: '500px', 
          margin: '0 auto', 
          overflowX: 'hidden', 
          overflowY: 'auto', // 🔓 Ensure main container scrolls naturally
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '120px'
        }}
      >
        {activeTab === 'home' && (
          <HomeView 
             userRole={userRole} coupleCode={coupleCode} 
             husbandInfo={husbandInfo} wifeInfo={wifeInfo}
             mySignal={mySignal} setMySignal={setMySignal}
             spouseSignal={spouseSignal}
             onNav={changeTab}
             onIntimacyClick={() => changeTab('dialogueChoice')}
             supabase={supabase}
          />
        )}

        {/* 🚦 Navigation Flow: Choice -> Guide -> Game */}
        {activeTab === 'dialogueChoice' && (
          <DialogueChoiceView onSelect={handleSelectGame} onBack={() => changeTab('home')} />
        )}

        {activeTab.startsWith('guide_') && (
          <GameGuideView 
             gameId={activeTab.replace('guide_', '')} 
             onStart={() => handleStartGame(activeTab.replace('guide_', ''))} 
             onBack={() => changeTab('dialogueChoice')} 
          />
        )}

        {activeTab === 'cardGame' && (
          <CardGameView coupleCode={coupleCode} userRole={userRole} onBack={() => changeTab('dialogueChoice')} />
        )}

        {activeTab === 'imageSync' && (
          <ImageCardGameView coupleCode={coupleCode} userRole={userRole} onBack={() => changeTab('dialogueChoice')} />
        )}
      </main>
    </div>
  );
}

export default App;
