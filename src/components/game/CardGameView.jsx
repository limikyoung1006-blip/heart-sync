import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { supabase } from '../../supabase';
import { CARD_DATA } from '../../data/dialogueCards';

const CardGameView = ({ onBack, coupleCode, userRole }) => {
  const [category, setCategory] = useState('일상');
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showTurnWarning, setShowTurnWarning] = useState(false);

  const [turnOwner, setTurnOwner] = useState(null);
  const [sessionCardCount, setSessionCardCount] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [history, setHistory] = useState([]);
  const isMounted = useRef(false);

  // Initialize and check for existing state
  useEffect(() => {
    isMounted.current = true;
    const loadState = async () => {
      try {
        if (!coupleCode) {
          // Fallback if no coupleCode
          if (CARD_DATA.length > 0 && !currentQuestion) {
            setCurrentQuestion(CARD_DATA.find(i => i.category === '일상') || CARD_DATA[0]);
          }
          return;
        }
        
        const { data, error } = await supabase.from('card_game_state').select('*').eq('couple_id', coupleCode).single();
        
        if (!isMounted.current) return;

        if (data) {
          setCategory(data.category || '일상');
          setIsFlipped(data.is_flipped || false);
          setTurnOwner(data.turn_owner || null);
          const q = CARD_DATA.find(item => String(item.id) === String(data.current_question_id));
          if (q) setCurrentQuestion(q);
        } else {
          // Initial setup if no data in DB
          const initial = CARD_DATA.find(i => i.category === '일상') || CARD_DATA[0];
          if (initial) setCurrentQuestion(initial);
        }
      } catch (err) {
        console.error("Error loading card state:", err);
      }
    };
    
    loadState();
    return () => { isMounted.current = false; };
  }, [coupleCode]);

  // Handle Turn and Drawing
  const drawNewCard = (targetCat = null) => {
    if (turnOwner && turnOwner !== userRole) {
      setShowTurnWarning(true);
      setTimeout(() => setShowTurnWarning(false), 2000);
      return;
    }
    const activeCat = targetCat || category;
    const pool = CARD_DATA.filter(q => q.category === activeCat);
    const available = pool.filter(q => !history.includes(q.id));
    const finalPool = (available.length > 0 ? available : pool);
    const nextQ = finalPool[Math.floor(Math.random() * finalPool.length)] || pool[0];
    
    if (!nextQ) return;

    setHistory(prev => [...prev, nextQ.id].slice(-20));
    setCurrentQuestion(nextQ);
    setIsFlipped(false);
    setTurnOwner(userRole);
    setSessionCardCount(prev => prev + 1);
    
    if (sessionCardCount + 1 >= 10) setShowFinishModal(true);
    
    // Remote update
    if (coupleCode) {
      supabase.from('card_game_state').upsert({
        couple_id: coupleCode, 
        category: activeCat, 
        is_flipped: false, 
        turn_owner: userRole, 
        current_question_id: nextQ.id, 
        updated_at: new Date().toISOString()
      }, { onConflict: 'couple_id' }).then(() => {});
    }
  };

  const toggleFlip = () => {
    if (turnOwner && turnOwner !== userRole) {
      setShowTurnWarning(true);
      setTimeout(() => setShowTurnWarning(false), 2000);
      return;
    }
    const nextFlip = !isFlipped;
    setIsFlipped(nextFlip);
    if (coupleCode) {
      supabase.from('card_game_state').update({ is_flipped: nextFlip, turn_owner: userRole }).eq('couple_id', coupleCode).then(() => {});
    }
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
        overflowY: 'auto'
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

      <div style={{ marginBottom: '25px', textAlign: 'center', position: 'relative' }}>
        {showTurnWarning && (
          <div style={{ 
            position: 'absolute', 
            top: '-50px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            background: 'rgba(45, 31, 8, 0.95)', 
            color: 'white', 
            padding: '10px 20px', 
            borderRadius: '15px', 
            fontSize: '13px', 
            fontWeight: 800, 
            whiteSpace: 'nowrap',
            zIndex: 100,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            animation: 'fadeInOut 2s ease-in-out'
          }}>
             ⚠️ {turnOwner === 'husband' ? '남편' : '아내'}님이 답변 중입니다...
          </div>
        )}
        <p style={{ letterSpacing: '4px', color: '#8B6500', fontWeight: 900, fontSize: '11px', opacity: 0.7, marginBottom: '5px' }}>CHOOSE A CARD TOGETHER</p>
        <div style={{ display: 'inline-block', background: 'rgba(212, 175, 55, 0.15)', padding: '6px 16px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
          <span style={{ fontSize: '12px', color: '#8B6500', fontWeight: 900 }}>현재 답변 턴: {turnOwner ? (turnOwner === 'husband' ? '남편 👨' : '아내 👩') : '자유 선택 🔄'}</span>
        </div>
      </div>

      <div className="card-container" style={{ 
        perspective: '1200px', 
        marginBottom: '30px', 
        width: '100%', 
        maxWidth: '320px',
        height: '420px',
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div 
          className={`talking-card ${isFlipped ? 'flipped' : ''}`} 
          onClick={toggleFlip}
        >
          {/* Card Front */}
          <div className="card-face card-front" style={{ border: '3px solid rgba(212, 175, 55, 0.4)' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)', zIndex: 1 }} />
            
            <span className="brand-text" style={{ 
              position: 'relative',
              zIndex: 2,
              fontSize: '26px', 
              letterSpacing: '8px',
              fontWeight: 900,
              marginTop: '150px'
            }}>QUESTION CARD</span>
            
            <div style={{ position: 'relative', zIndex: 2, marginTop: '25px', width: '60px', height: '2px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
          </div>

          {/* Card Back */}
          <div className="card-face card-back" style={{ border: '3px solid #8A60FF', background: 'white' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #FF4D6D, #FF8fa3)', 
              color: 'white', 
              padding: '6px 20px', 
              borderRadius: '100px', 
              fontSize: '13px', 
              fontWeight: 900,
              boxShadow: '0 4px 10px rgba(255, 77, 109, 0.3)',
              marginBottom: '20px'
            }}>#{category}</div>
            
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <h2 style={{ 
                fontSize: '21px', 
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
              border: '1px solid rgba(138, 96, 255, 0.1)',
              marginTop: '20px'
            }}>
              <span style={{ fontSize: '13px', color: '#8A60FF', fontWeight: 900, display: 'block' }}>
                서로의 눈을 즐겁게 바라보며 💬<br/>
                <small style={{ opacity: 0.7, fontSize: '10px', fontWeight: 700 }}>대화를 마친 후 다음 카드를 뽑으세요</small>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <p style={{ fontSize: '13px', color: '#2D1F08', fontWeight: 800 }}>대화가 끝났나요? 새로운 질문을 확인하세요</p>
      </div>

      <button 
        disabled={turnOwner && turnOwner !== userRole} 
        onClick={() => drawNewCard()} 
        style={{ 
          width: '100%', 
          maxWidth: '280px', 
          padding: '18px', 
          borderRadius: '22px', 
          border: 'none', 
          background: turnOwner && turnOwner !== userRole ? '#E5E7EB' : '#2D1F08', 
          color: turnOwner && turnOwner !== userRole ? '#9CA3AF' : 'white', 
          fontWeight: 900, 
          fontSize: '16px',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
        }}
      >
        {turnOwner && turnOwner !== userRole ? '배우자의 답변 차례입니다' : '새로운 질문 뽑기'}
      </button>

      <p style={{ marginTop: '20px', fontSize: '11px', color: '#8B7355', fontWeight: 700, paddingBottom: turnOwner === null ? '150px' : '20px' }}>* 아래로 스크롤하여 더 많은 메뉴를 확인하세요</p>
    </div>
  );
};

export default React.memo(CardGameView);
