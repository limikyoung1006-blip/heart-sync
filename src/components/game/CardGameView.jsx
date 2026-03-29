import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { supabase } from '../../supabase';
import { CARD_DATA } from '../../data/dialogueCards';

const CardGameView = ({ onBack, coupleCode, userRole, husbandInfo, wifeInfo }) => {
  const [category, setCategory] = useState('일상');
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showTurnWarning, setShowTurnWarning] = useState(false);

  const [turnOwner, setTurnOwner] = useState(null);
  const [sessionCardCount, setSessionCardCount] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [history, setHistory] = useState([]);
  const isMounted = useRef(false);

  const isMyTurn = !turnOwner || turnOwner === userRole;
  const partnerNickname = userRole === 'husband' ? (wifeInfo?.nickname || '아내') : (husbandInfo?.nickname || '남편');
  const partnerNameOnly = userRole === 'husband' ? '아내가' : '남편이';

  // Initialize and check for existing state + Real-time Sync
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

    // Real-time subscription
    let subscription;
    if (coupleCode) {
      subscription = supabase
        .channel(`card_game_${coupleCode}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'card_game_state', 
          filter: `couple_id=eq.${coupleCode}` 
        }, payload => {
          const updated = payload.new;
          if (updated && isMounted.current) {
            setCategory(updated.category);
            setIsFlipped(updated.is_flipped);
            setTurnOwner(updated.turn_owner);
            const q = CARD_DATA.find(item => String(item.id) === String(updated.current_question_id));
            if (q) setCurrentQuestion(q);
          }
        })
        .subscribe();
    }

    return () => { 
      isMounted.current = false; 
      if (subscription) subscription.unsubscribe();
    };
  }, [coupleCode]);

  // Handle Turn and Drawing
  const drawNewCard = (targetCat = null) => {
    if (!isMyTurn) {
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
    if (!isMyTurn) {
      setShowTurnWarning(true);
      setTimeout(() => setShowTurnWarning(false), 2000);
      return;
    }
    const nextFlip = !isFlipped;
    setIsFlipped(nextFlip);
    if (coupleCode) {
      supabase.from('card_game_state').update({ 
        is_flipped: nextFlip, 
        turn_owner: userRole,
        updated_at: new Date().toISOString()
      }).eq('couple_id', coupleCode).then(() => {});
    }
  };

  const passTurn = async () => {
    if (turnOwner !== userRole) return;
    
    const nextTurnOwner = userRole === 'husband' ? 'wife' : 'husband';
    setIsFlipped(false);
    setTurnOwner(nextTurnOwner);
    
    if (coupleCode) {
      await supabase.from('card_game_state').update({ 
        turn_owner: nextTurnOwner,
        is_flipped: false,
        updated_at: new Date().toISOString()
      }).eq('couple_id', coupleCode);
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
      <style>{`
        .game-btn-press {
          transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease;
        }
        .game-btn-press:active {
          transform: scale(0.95);
          opacity: 0.85;
        }
      `}</style>
      
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

      <div style={{ 
        width: '100%', 
        padding: '14px', 
        borderRadius: '20px', 
        background: isMyTurn ? 'rgba(212, 175, 55, 0.12)' : 'rgba(138, 96, 255, 0.08)', 
        marginBottom: '20px', 
        textAlign: 'center', 
        position: 'relative',
        border: '1px solid rgba(212, 175, 55, 0.2)'
      }}>
        <span style={{ fontSize: '14px', fontWeight: 900, color: isMyTurn ? '#8B6500' : '#8A60FF' }}>
          {isMyTurn 
            ? "✨ 당신의 턴입니다! 마음을 나눠주세요" 
            : `⏳ ${partnerNameOnly} 답변 중입니다...`}
        </span>
      </div>

      <p style={{ letterSpacing: '4px', color: '#8B6500', fontWeight: 900, fontSize: '11px', opacity: 0.7, marginBottom: '25px', textAlign: 'center' }}>CHOOSE A CARD TOGETHER</p>

      <div className="card-container" style={{ 
        perspective: '1200px', 
        marginBottom: '30px', 
        width: '320px', 
        height: '440px',
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div 
          className={`talking-card ${isFlipped ? 'flipped' : ''}`} 
          onClick={toggleFlip}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Card Front */}
          <div className="card-face card-front" style={{ 
            border: '3px solid rgba(212, 175, 55, 0.4)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            visibility: isFlipped ? 'hidden' : 'visible',
            overflow: 'hidden'
          }}>
            {!isFlipped && (
              <>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)', zIndex: 1 }} />
                
                <span className="brand-text" style={{ 
                  position: 'relative',
                  zIndex: 2,
                  fontSize: '28px', 
                  letterSpacing: '8px',
                  fontWeight: 900,
                  marginTop: '150px'
                }}>QUESTION CARD</span>
                
                <div style={{ position: 'relative', zIndex: 2, marginTop: '25px', width: '60px', height: '2px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
                
                <div style={{ position: 'relative', zIndex: 2, marginTop: '100px' }}>
                   <span style={{ background: '#D4AF37', color: 'white', padding: '8px 20px', borderRadius: '100px', fontSize: '14px', fontWeight: 900, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>답변완료/턴</span>
                </div>
              </>
            )}
          </div>

          {/* Card Back */}
          <div className="card-face card-back" style={{ 
            border: '3px solid #8A60FF', 
            background: 'white',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            overflow: 'hidden'
          }}>
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
              marginTop: '10px'
            }}>
              <span style={{ fontSize: '13px', color: '#8A60FF', fontWeight: 900, display: 'block' }}>
                서로의 눈을 즐겁게 바라보며 💬<br/>
                <small style={{ opacity: 0.7, fontSize: '10px', fontWeight: 700 }}>대화를 마친 후 완료 버튼을 누르세요</small>
              </span>
            </div>

            {isMyTurn && (
              <button 
                className="game-btn-press"
                onClick={(e) => { e.stopPropagation(); passTurn(); }} 
                style={{ 
                  marginTop: '15px',
                  width: 'fit-content',
                  padding: '8px 20px',
                  borderRadius: '100px',
                  background: '#8A60FF',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '14px',
                  border: 'none',
                  boxShadow: '0 5px 15px rgba(138, 96, 255, 0.2)'
                }}
              >
                답변완료/턴
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', height: '20px', marginBottom: '15px' }}>
        {isMyTurn && <p style={{ fontSize: '13px', color: '#2D1F08', fontWeight: 800 }}>새 주제를 고르거나 질문을 바꾸세요</p>}
      </div>

      <button 
        disabled={!isMyTurn} 
        onClick={() => drawNewCard()} 
        className="game-btn-press"
        style={{ 
          width: '100%', 
          maxWidth: '280px', 
          padding: '18px', 
          borderRadius: '22px', 
          border: 'none', 
          background: isMyTurn ? '#2D1F08' : '#E5E7EB', 
          color: isMyTurn ? 'white' : '#9CA3AF', 
          fontWeight: 900, 
          fontSize: '16px',
          boxShadow: isMyTurn ? '0 10px 20px rgba(0,0,0,0.1)' : 'none'
        }}
      >
        {isMyTurn ? '새로운 질문 뽑기' : '배우자의 답변 차례입니다'}
      </button>

    </div>
  );
};

export default React.memo(CardGameView);
