import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, Sparkles, Lock, Timer } from 'lucide-react';
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
  const partnerNameOnly = userRole === 'husband' ? '아내가' : '남편이';

  // Initialize and check for existing state + Real-time Sync
  useEffect(() => {
    isMounted.current = true;
    const loadState = async () => {
      try {
        if (!coupleCode) {
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
          const initial = CARD_DATA.find(i => i.category === '일상') || CARD_DATA[0];
          if (initial) setCurrentQuestion(initial);
        }
      } catch (err) {
        console.error("Error loading card state:", err);
      }
    };
    
    loadState();

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
        padding: '10px', 
        paddingBottom: '160px',
        minHeight: '100%', 
        overflowY: 'visible',
        backgroundColor: 'transparent'
      }}
    >
      <style>{`
        .game-btn-press {
          transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.1s ease;
        }
        .game-btn-press:active {
          transform: scale(0.95);
          opacity: 0.85;
        }
        .turn-banner-anim {
          animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      
      {showFinishModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', border: '5px solid #D4AF37', borderRadius: '40px', width: '100%', maxWidth: '340px', padding: '40px 25px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
            <Sparkles size={60} color="#D4AF37" style={{ marginBottom: '20px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#2D1F08', marginBottom: '12px' }}>열 번째 대화 완료!</h3>
            <p style={{ fontSize: '16px', color: '#8B7355', fontWeight: 600, lineHeight: 1.6, marginBottom: '25px', wordBreak: 'keep-all' }}>오늘의 깊은 대화가 부부 사이를 더 단단하게 만들었을 거예요. ✨</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <button onClick={onBack} style={{ width: '100%', padding: '18px', borderRadius: '22px', background: '#2D1F08', color: 'white', fontWeight: 900, fontSize: '16px', border: 'none', boxShadow: '0 8px 15px rgba(0,0,0,0.1)' }}>대화 선택으로 돌아가기</button>
              <button onClick={() => { setShowFinishModal(false); setSessionCardCount(11); }} style={{ width: '100%', padding: '14px', background: 'none', color: '#B08D3E', fontWeight: 800, fontSize: '14px', border: 'none' }}>조금 더 할게요</button>
            </div>
          </div>
        </div>
      )}

      {showTurnWarning && (
        <div style={{ position: 'fixed', top: '100px', zIndex: 999, background: 'rgba(239, 68, 68, 0.95)', color: 'white', padding: '12px 25px', borderRadius: '100px', fontSize: '14px', fontWeight: 900, boxShadow: '0 10px 25px rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '8px' }} className="turn-banner-anim">
          <Lock size={16} /> 배우자가 답변 중일 때는 조작할 수 없어요!
        </div>
      )}

      <div className="w-full flex justify-start mb-4">
        <button onClick={onBack} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <ChevronLeft size={22} color="#8A60FF" strokeWidth={3} />
          <span style={{ fontSize: '15px', fontWeight: 900, color: '#8A60FF' }}>돌아가기</span>
        </button>
      </div>

      <div style={{ width: '100%', overflowX: 'auto', marginBottom: '25px', pb: '5px', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'flex', gap: '10px', padding: '5px' }}>
          {['일상', '상상', '추억', '관계', '신앙', '시크릿'].map(cat => (
            <button 
              key={cat} 
              onClick={() => { if(!isMyTurn) return; setCategory(cat); drawNewCard(cat); }}
              className="game-btn-press"
              style={{ 
                padding: '10px 22px', 
                borderRadius: '100px', 
                border: category === cat ? 'none' : '1.5px solid rgba(212, 175, 55, 0.3)', 
                background: category === cat ? 'linear-gradient(135deg, #D4AF37, #B08D3E)' : 'white', 
                color: category === cat ? 'white' : '#8B7355', 
                fontWeight: 900, 
                fontSize: '13px', 
                whiteSpace: 'nowrap',
                boxShadow: category === cat ? '0 5px 12px rgba(212, 175, 55, 0.25)' : 'none',
                opacity: isMyTurn ? 1 : 0.6
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ 
        width: '100%', 
        padding: '16px', 
        borderRadius: '24px', 
        background: isMyTurn ? 'linear-gradient(135deg, #FFF9EB, #FFF3E0)' : 'linear-gradient(135deg, #F3F0FF, #EBE5FF)', 
        marginBottom: '25px', 
        textAlign: 'center', 
        border: isMyTurn ? '2px solid rgba(212, 175, 55, 0.3)' : '2px solid rgba(138, 96, 255, 0.2)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.04)'
      }}>
        <div className="flex items-center justify-center gap-3">
          {isMyTurn ? <Sparkles size={20} color="#D4AF37" /> : <Timer size={20} color="#8A60FF" className="animate-spin-slow" />}
          <span style={{ fontSize: '16px', fontWeight: 900, color: isMyTurn ? '#8B6500' : '#8A60FF', letterSpacing: '-0.5px' }}>
            {isMyTurn 
              ? "당신의 차례입니다! 질문에 답해주세요 ✨" 
              : `${partnerNameOnly} 답변 중입니다...`}
          </span>
        </div>
      </div>

      <div className="card-container" style={{ 
        perspective: '1500px', 
        marginBottom: '40px', 
        width: '100%', 
        maxWidth: '320px', 
        height: '460px',
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}>
        <div 
          className={`talking-card ${isFlipped ? 'flipped' : ''}`} 
          onClick={toggleFlip}
          style={{ width: '100%', height: '100%', cursor: isMyTurn ? 'pointer' : 'default' }}
        >
          {/* Card Front */}
          <div className="card-face card-front" style={{ 
            border: `4px solid ${isMyTurn ? '#D4AF37' : '#E5E7EB'}`,
            background: isMyTurn ? '#2D1F08' : '#4B3A1A',
            transition: 'all 0.3s ease'
          }}>
            {!isMyTurn && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                <Lock size={40} color="white" opacity={0.8} />
                <span style={{ color: 'white', fontWeight: 900, fontSize: '15px' }}>{partnerNameOnly} 대화 중..</span>
              </div>
            )}
            
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <p style={{ fontSize: '12px', fontWeight: 900, color: '#D4AF37', letterSpacing: '8px', marginBottom: '30px', opacity: 0.6 }}>HEART SYNC</p>
               <div style={{ padding: '25px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '50%', marginBottom: '30px' }}>
                 <Sparkles size={60} color="#D4AF37" />
               </div>
               <h2 style={{ fontSize: '28px', color: 'white', fontWeight: 900, letterSpacing: '4px', textAlign: 'center' }}>오늘의 질문</h2>
               <div style={{ marginTop: '25px', width: '50px', height: '2px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
               <p style={{ marginTop: '80px', color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 800 }}>TAP TO OPEN</p>
            </div>
          </div>

          {/* Card Back */}
          <div className="card-face card-back" style={{ 
            border: '4px solid #8A60FF', 
            background: 'white',
            transform: 'rotateY(180deg)',
            padding: '20px'
          }}>
            <div style={{ 
              background: '#8A60FF', 
              color: 'white', 
              padding: '8px 20px', 
              borderRadius: '100px', 
              fontSize: '14px', 
              fontWeight: 900,
              boxShadow: '0 5px 15px rgba(138, 96, 255, 0.3)',
              marginBottom: '30px'
            }}>#{category}</div>
            
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 10px' }}>
              <h2 style={{ 
                fontSize: '22px', 
                fontWeight: 900, 
                color: '#2D1F08', 
                lineHeight: 1.7, 
                wordBreak: 'keep-all',
                fontFamily: "'Noto Serif KR', serif"
              }}>
                {currentQuestion?.question || "새로운 카드를 뽑아주세요!"}
              </h2>
            </div>

            <div style={{ width: '100%', background: '#F9F5FF', padding: '18px', borderRadius: '24px', border: '1px solid rgba(138, 96, 255, 0.1)', marginTop: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '14px', color: '#8A60FF', fontWeight: 800, lineHeight: 1.5 }}>
                충분히 대화를 나누셨나요? 😊<br/>
                <small style={{ opacity: 0.6, fontSize: '11px', fontWeight: 700 }}>대화를 마친 후 완료 버튼을 눌러 턴을 넘기세요</small>
              </span>
            </div>

            {isMyTurn && (
              <button 
                className="game-btn-press"
                onClick={(e) => { e.stopPropagation(); passTurn(); }} 
                style={{ 
                  marginTop: '15px',
                  width: '100%',
                  padding: '16px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #8A60FF, #6A38EB)',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '16px',
                  border: 'none',
                  boxShadow: '0 8px 20px rgba(138, 96, 255, 0.3)'
                }}
              >
                답변완료 / 턴 넘기기
              </button>
            )}
          </div>
        </div>
      </div>

      <button 
        disabled={!isMyTurn} 
        onClick={() => drawNewCard()} 
        className="game-btn-press"
        style={{ 
          width: '100%', 
          maxWidth: '300px', 
          padding: '20px', 
          borderRadius: '24px', 
          border: 'none', 
          background: isMyTurn ? '#2D1F08' : '#E5E7EB', 
          color: isMyTurn ? 'white' : '#9CA3AF', 
          fontWeight: 900, 
          fontSize: '17px',
          boxShadow: isMyTurn ? '0 12px 25px rgba(0,0,0,0.15)' : 'none',
          opacity: isMyTurn ? 1 : 0.6
        }}
      >
        {isMyTurn ? '새로운 질문 뽑기' : `${partnerNameOnly} 답변 중입니다`}
      </button>

      <p style={{ marginTop: '30px', fontSize: '12px', color: '#B08D3E', fontWeight: 800, opacity: 0.6 }}>* 화면을 위아래로 스크롤할 수 있습니다.</p>
    </div>
  );
};

export default React.memo(CardGameView);
