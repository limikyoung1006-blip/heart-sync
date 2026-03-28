import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { supabase } from '../../supabase';
import { CARD_DATA } from '../../data/dialogueCards';

const CardGameView = ({ onBack, coupleCode, userRole }) => {
  const [category, setCategory] = useState('일상');
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [turnOwner, setTurnOwner] = useState(null);
  const [sessionCardCount, setSessionCardCount] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [history, setHistory] = useState([]);

  const isMounted = useRef(true);

  // Initialize and check for existing state
  useEffect(() => {
    isMounted.current = true;
    const loadState = async () => {
      if (!coupleCode) return;
      const { data } = await supabase.from('card_game_state').select('*').eq('couple_id', coupleCode).single();
      if (isMounted.current && data) {
        setCategory(data.category || '일상');
        setIsFlipped(data.is_flipped || false);
        setTurnOwner(data.turn_owner || null);
        const q = CARD_DATA.find(item => String(item.id) === String(data.current_question_id));
        if (q) setCurrentQuestion(q);
      } else if (isMounted.current && CARD_DATA.length > 0) {
        // Initial setup
        const initial = CARD_DATA.find(i => i.category === '일상');
        if (initial) setCurrentQuestion(initial);
      }
    };
    loadState();
    return () => { isMounted.current = false; };
  }, [coupleCode]);

  // Handle Turn and Drawing
  const drawNewCard = (targetCat = null) => {
    if (turnOwner && turnOwner !== userRole) return;
    const activeCat = targetCat || category;
    const pool = CARD_DATA.filter(q => q.category === activeCat);
    const available = pool.filter(q => !history.includes(q.id));
    const finalPool = (available.length > 0 ? available : pool);
    const nextQ = finalPool[Math.floor(Math.random() * finalPool.length)];
    
    setHistory(prev => [...prev, nextQ.id].slice(-20));
    setCurrentQuestion(nextQ);
    setIsFlipped(false);
    setTurnOwner(userRole);
    setSessionCardCount(prev => prev + 1);
    
    if (sessionCardCount + 1 >= 10) setShowFinishModal(true);
    
    // Remote update
    supabase.from('card_game_state').upsert({
      couple_id: coupleCode, 
      category: activeCat, 
      is_flipped: false, 
      turn_owner: userRole, 
      current_question_id: nextQ.id, 
      updated_at: new Date().toISOString()
    }, { onConflict: 'couple_id' }).then(() => {});
  };

  const toggleFlip = () => {
    if (turnOwner && turnOwner !== userRole) {
      alert(`현재는 ${turnOwner === 'husband' ? '남편' : '아내'}님의 차례입니다.`);
      return;
    }
    const nextFlip = !isFlipped;
    setIsFlipped(nextFlip);
    supabase.from('card_game_state').update({ is_flipped: nextFlip, turn_owner: userRole }).eq('couple_id', coupleCode).then(() => {});
  };

  return (
    <div 
      className="game-view-wrapper" 
      style={{ 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '20px', 
        paddingBottom: '160px',
        minHeight: '100%', 
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {showFinishModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '35px', width: '100%', maxWidth: '340px', padding: '40px 25px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Sparkles size={45} color="#D4AF37" style={{ marginBottom: '20px' }} />
            <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#2D1F08', marginBottom: '10px' }}>열 번째 대화 완료!</h3>
            <p style={{ fontSize: '15px', color: '#8B7355', fontWeight: 600, lineHeight: 1.6, marginBottom: '25px', wordBreak: 'keep-all' }}>오늘 나눈 대화가 서로를 더 깊게 이해하는 시간이 되셨나요? ✨</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <button onClick={onBack} style={{ width: '100%', padding: '18px', borderRadius: '20px', background: '#2D1F08', color: 'white', fontWeight: 900, border: 'none' }}>대화 선택으로 돌아가기</button>
              <button onClick={() => { setShowFinishModal(false); setSessionCardCount(11); }} style={{ width: '100%', padding: '12px', background: 'none', color: '#B08D3E', fontWeight: 800, border: 'none' }}>조금 더 할게요</button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full flex justify-start mb-4">
        <button onClick={onBack} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <ChevronLeft size={20} color="#8A60FF" strokeWidth={3} />
          <span style={{ fontSize: '14px', fontWeight: 900, color: '#8A60FF' }}>돌아가기</span>
        </button>
      </div>

      <div className="w-full mb-6">
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', WebkitOverflowScrolling: 'touch' }}>
          {['일상', '상상', '추억', '관계', '신앙', '시크릿'].map(cat => (
            <button 
              key={cat} 
              onClick={() => { setCategory(cat); drawNewCard(cat); }}
              style={{ padding: '8px 18px', borderRadius: '100px', border: 'none', background: category === cat ? '#D4AF37' : 'white', color: category === cat ? 'white' : '#8B7355', fontWeight: 800, fontSize: '12px', whiteSpace: 'nowrap' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '25px', textAlign: 'center' }}>
        <p style={{ letterSpacing: '4px', color: '#8B6500', fontWeight: 900, fontSize: '11px', opacity: 0.7, marginBottom: '5px' }}>SELECT YOUR TOPIC</p>
        <div style={{ display: 'inline-block', background: 'rgba(212, 175, 55, 0.1)', padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
          <span style={{ fontSize: '10px', color: '#B08D3E', fontWeight: 900 }}>턴: {turnOwner ? (turnOwner === 'husband' ? '남편' : '아내') : '자유'}</span>
        </div>
      </div>

      <div 
        className="card-container" 
        style={{ 
          perspective: '1000px', 
          marginBottom: '35px', 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'center' 
        }}
      >
         <div 
           className={`talking-card ${isFlipped ? 'flipped' : ''}`} 
           onClick={toggleFlip}
           style={{ 
             width: '300px', 
             height: '420px', 
             cursor: 'pointer', 
             transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)', 
             transformStyle: 'preserve-3d', 
             position: 'relative' 
           }}
         >
           {/* Card Front: The Question Mark/Logo side */}
           <div style={{ 
             position: 'absolute', 
             inset: 0, 
             backfaceVisibility: 'hidden', 
             background: 'linear-gradient(145deg, #2D1F08, #1A1205)', 
             borderRadius: '35px', 
             display: 'flex', 
             flexDirection: 'column', 
             alignItems: 'center', 
             justifyContent: 'center', 
             border: '3px solid #D4AF37',
             boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 0 50px rgba(212,175,55,0.1)'
           }}>
              <div style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                background: 'rgba(212, 175, 55, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '25px',
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}>
                <Sparkles size={50} color="#D4AF37" />
              </div>
              <span style={{ 
                color: '#D4AF37', 
                fontWeight: 900, 
                fontSize: '18px', 
                letterSpacing: '5px',
                fontFamily: "'Cinzel', serif",
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>QUESTION CARD</span>
              <div style={{ marginTop: '20px', width: '40px', height: '2px', background: '#D4AF37', opacity: 0.5 }} />
           </div>

           {/* Card Back: The Question Text side */}
           <div style={{ 
             position: 'absolute', 
             inset: 0, 
             backfaceVisibility: 'hidden', 
             background: 'white', 
             borderRadius: '35px', 
             border: '3px solid #8A60FF', 
             padding: '40px 30px', 
             display: 'flex', 
             flexDirection: 'column', 
             justifyContent: 'space-between', 
             alignItems: 'center', 
             textAlign: 'center',
             transform: 'rotateY(180deg)',
             boxShadow: '0 20px 40px rgba(138, 96, 255, 0.15)'
           }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #FF4D6D, #FF8fa3)', 
                color: 'white', 
                padding: '6px 20px', 
                borderRadius: '100px', 
                fontSize: '13px', 
                fontWeight: 900,
                boxShadow: '0 4px 10px rgba(255, 77, 109, 0.3)'
              }}>#{category}</div>
              
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h2 style={{ 
                  fontSize: '22px', 
                  fontWeight: 900, 
                  color: '#2D1F08', 
                  lineHeight: 1.7, 
                  wordBreak: 'keep-all',
                  fontFamily: "'Noto Serif KR', serif"
                }}>
                  {currentQuestion?.question || "카드를 뽑아주세요!"}
                </h2>
              </div>

              <div style={{ 
                width: '100%', 
                background: '#F9F5FF', 
                padding: '15px', 
                borderRadius: '20px',
                border: '1px solid rgba(138, 96, 255, 0.1)'
              }}>
                <span style={{ fontSize: '14px', color: '#8A60FF', fontWeight: 900, display: 'block' }}>
                  서로의 눈을 즐겁게 바라보며 💬<br/>
                  <small style={{ opacity: 0.7, fontSize: '11px', fontWeight: 700 }}>대화를 마친 후 다음 카드를 뽑으세요</small>
                </span>
              </div>
           </div>
         </div>
      </div>

      <button 
        disabled={turnOwner && turnOwner !== userRole} 
        onClick={() => drawNewCard()} 
        style={{ width: '100%', maxWidth: '280px', padding: '18px', borderRadius: '22px', border: 'none', background: '#2D1F08', color: 'white', fontWeight: 900, fontSize: '16px', opacity: (turnOwner && turnOwner !== userRole) ? 0.3 : 1 }}
      >
        새로운 질문 뽑기
      </button>

      <p style={{ marginTop: '20px', fontSize: '11px', color: '#8B7355', fontWeight: 700 }}>* 아래로 스크롤하여 더 많은 메뉴를 확인하세요</p>
    </div>
  );
};

export default React.memo(CardGameView);
