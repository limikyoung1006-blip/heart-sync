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
  
  // 🛡️ Safe Scroll Ref - Avoid using global 'document' during SSR/Mounting
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ activeTab: 'home' }, '');
    }

    const handlePopState = (event) => {
      if (event.state && event.state.activeTab) {
        // Small delay for smooth state transition on mobile
        setTimeout(() => {
          setActiveTab(event.state.activeTab);
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
          }
        }, 50); 
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const changeTab = useCallback((newTab) => {
    if (activeTab === newTab) return;
    window.history.pushState({ activeTab: newTab }, '');
    setActiveTab(newTab);
    
    // Safety check for cross-platform scrolling
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

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

  return (
    <div id="app-root-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {(activeTab === 'home' || activeTab === 'community') && (
        <AppHeader activeTab={activeTab} changeTab={changeTab} user={session?.user} />
      )}

      {/* 🚀 Central Master Scroller - Fixed Height Child of App Root */}
      <main 
        id="main-scroller"
        ref={scrollContainerRef}
        style={{ 
          flex: 1, 
          width: '100%', 
          maxWidth: '500px', 
          margin: '0 auto', 
          overflowX: 'hidden', 
          overflowY: 'auto', 
          WebkitOverflowScrolling: 'touch',
          background: 'transparent'
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

        {activeTab === 'dialogueChoice' && (
          <DialogueChoiceView onSelect={(gameId) => changeTab(`guide_${gameId}`)} onBack={() => changeTab('home')} />
        )}

        {activeTab.startsWith('guide_') && (
          <GameGuideView 
             gameId={activeTab.replace('guide_', '')} 
             onStart={() => changeTab(activeTab.replace('guide_', ''))} 
             onBack={() => changeTab('dialogueChoice')} 
          />
        )}

        {activeTab === 'cardGame' && (
          <CardGameView coupleCode={coupleCode} userRole={userRole} onBack={() => changeTab('dialogueChoice')} />
        )}

        {activeTab === 'imageSync' && (
          <ImageCardGameView 
            coupleCode={coupleCode} 
            userRole={userRole} 
            husbandInfo={husbandInfo} 
            wifeInfo={wifeInfo}
            onBack={() => changeTab('dialogueChoice')} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
