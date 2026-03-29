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
  }, [coupleCode, userRole]);

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
        .game-btn-press:active { transform: scale(0.95); opacity: 0.85; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      
      {showFinishModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', border: '5px solid #D4AF37', borderRadius: '40px', width: '100%', maxWidth: '340px', padding: '40px 25px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
            <Sparkles size={60} color="#D4AF37" style={{ marginBottom: '20px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#2D1F08', marginBottom: '12px' }}>열 번째 대화 완료!</h3>
            <p style={{ fontSize: '16px', color: '#8B7355', fontWeight: 600, lineHeight: 1.6, marginBottom: '25px', wordBreak: 'keep-all' }}>오늘의 깊은 대화가 부부 사이를 더 단단하게 만들었을 거예요. ✨</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <button onClick={onBack} style={{ width: '100%', padding: '18px', borderRadius: '22px', background: '#2D1F08', color: 'white', fontWeight: 900, fontSize: '16px', border: 'none' }}>대화 선택으로 돌아가기</button>
              <button onClick={() => { setShowFinishModal(false); setSessionCardCount(11); }} style={{ width: '100%', padding: '14px', background: 'none', color: '#B08D3E', fontWeight: 800, fontSize: '14px', border: 'none' }}>조금 더 할게요</button>
            </div>
          </div>
        </div>
      )}

      {showTurnWarning && (
        <div style={{ position: 'fixed', top: '100px', zIndex: 999, background: 'rgba(239, 68, 68, 0.95)', color: 'white', padding: '12px 25px', borderRadius: '100px', fontSize: '14px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={16} /> 배우자가 답변 중일 때는 조작할 수 없어요!
        </div>
      )}

      <div className="w-full flex justify-start mb-4">
        <button onClick={onBack} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ChevronLeft size={22} color="#D4AF37" strokeWidth={3} />
          <span style={{ fontSize: '15px', fontWeight: 900, color: '#D4AF37' }}>돌아가기</span>
        </button>
      </div>

      <div style={{ width: '100%', overflowX: 'auto', marginBottom: '25px', paddingBottom: '5px' }}>
        <div style={{ display: 'flex', gap: '8px', padding: '5px' }}>
          {['일상', '상상', '추억', '관계', '신앙', '시크릿'].map(cat => (
            <button 
              key={cat} 
              onClick={() => { if(!isMyTurn) return; setCategory(cat); drawNewCard(cat); }}
              className="game-btn-press"
              style={{ 
                padding: '10px 22px', borderRadius: '100px', border: 'none',
                background: category === cat ? 'linear-gradient(135deg, #D4AF37, #B08D3E)' : 'white', 
                color: category === cat ? 'white' : '#8B7355', 
                fontWeight: 900, fontSize: '13px', whiteSpace: 'nowrap',
                opacity: isMyTurn ? 1 : 0.6
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ 
        width: '100%', padding: '16px', borderRadius: '24px', 
        background: isMyTurn ? 'linear-gradient(135deg, #FFF9EB, #FFF3E0)' : 'rgba(255, 255, 255, 0.6)', 
        marginBottom: '25px', textAlign: 'center', border: '2px solid #D4AF37',
        boxShadow: '0 8px 20px rgba(0,0,0,0.04)'
      }}>
        <div className="flex items-center justify-center gap-3">
          {isMyTurn ? <Sparkles size={20} color="#D4AF37" /> : <Timer size={20} color="#8A60FF" className="animate-spin-slow" />}
          <span style={{ fontSize: '16px', fontWeight: 900, color: isMyTurn ? '#8B6500' : '#8A60FF' }}>
            {isMyTurn ? "당신의 차례입니다! 질문을 확인하세요 ✨" : `${partnerNameOnly} 답변 중입니다...`}
          </span>
        </div>
      </div>

      <div className="card-container" style={{ 
        perspective: '1500px', marginBottom: '40px', width: '320px', height: '440px',
        display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative'
      }}>
        <div 
          className={`talking-card ${isFlipped ? 'flipped' : ''}`} 
          onClick={toggleFlip}
          style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          {/* Card Front */}
          <div className="card-face card-front" style={{ 
            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            border: '3px solid #D4AF37', borderRadius: '45px', 
            backgroundImage: "url('/card_bg.png')", backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            visibility: isFlipped ? 'hidden' : 'visible', zIndex: isFlipped ? 1 : 2,
            boxShadow: '0 15px 45px rgba(0,0,0,0.25)', overflow: 'hidden'
          }}>
            {/* Dark Filter for Image Background */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1 }} />
            
            {!isMyTurn && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '42px', backdropFilter: 'blur(3px)' }}>
                <Lock size={40} color="white" />
                <span style={{ color: 'white', fontWeight: 900, marginTop: '12px', fontSize: '15px' }}>{partnerNameOnly} 대화 중..</span>
              </div>
            )}
            
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', justifyContent: 'center' }}>
               <p style={{ fontSize: '12px', fontWeight: 900, color: '#F5D060', letterSpacing: '8px', marginBottom: '30px', opacity: 0.8 }}>QUESTION CARD</p>
               <div style={{ padding: '25px', background: 'rgba(245, 208, 96, 0.1)', borderRadius: '50%', marginBottom: '30px', border: '1px solid rgba(245, 208, 96, 0.2)' }}>
                 <Sparkles size={55} color="#F5D060" />
               </div>
               <span className="brand-text" style={{ 
                  fontSize: '30px', 
                  letterSpacing: '8px',
                  fontWeight: 900,
                  color: 'white',
                  textShadow: '0 4px 10px rgba(0,0,0,0.5)'
               }}>HEART SYNC</span>
               <div style={{ marginTop: '30px', width: '60px', height: '2px', background: 'linear-gradient(90deg, transparent, #F5D060, transparent)' }} />
               <div style={{ marginTop: '70px' }}>
                  <span style={{ background: '#D4AF37', color: 'white', padding: '10px 28px', borderRadius: '100px', fontSize: '14px', fontWeight: 900, boxShadow: '0 8px 20px rgba(212, 175, 55, 0.3)' }}>터치하여 확인</span>
               </div>
            </div>
          </div>

          {/* Card Back */}
          <div className="card-face card-back" style={{ 
            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            border: '3px solid #D4AF37', borderRadius: '45px', 
            backgroundColor: 'white',
            backgroundImage: `
              linear-gradient(45deg, rgba(0,0,0,0.01) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(0,0,0,0.01) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.01) 75%),
              linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.01) 75%)
            `,
            backgroundSize: '20px 20px',
            transform: 'rotateY(180deg)',
            padding: '35px',
            visibility: isFlipped ? 'visible' : 'hidden', zIndex: isFlipped ? 2 : 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            boxShadow: '0 15px 45px rgba(0,0,0,0.1)'
          }}>
            <div style={{ background: 'linear-gradient(135deg, #FF4D6D, #FF8fa3)', color: 'white', padding: '6px 20px', borderRadius: '100px', fontSize: '13px', fontWeight: 900, marginBottom: '25px', boxShadow: '0 4px 12px rgba(255, 77, 109, 0.2)' }}>#{category}</div>
            
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <h2 style={{ 
                fontSize: currentQuestion?.question?.length > 40 ? '19px' : '23px', 
                fontWeight: 900, 
                color: '#2D1F08', 
                lineHeight: 1.7, 
                wordBreak: 'keep-all',
                fontFamily: "'Noto Serif KR', serif"
              }}>
                {currentQuestion?.question || "카드를 뽑아주세요!"}
              </h2>
            </div>

            <div style={{ width: '100%', background: '#FDFCF0', padding: '18px', borderRadius: '25px', border: '1px solid #D4AF3730', marginTop: '15px', textAlign: 'center' }}>
              <span style={{ fontSize: '14px', color: '#B08D3E', fontWeight: 900 }}>
                서로의 눈을 바라보며 나눈 마음은<br/>
                <small style={{ opacity: 0.8, fontSize: '11px', fontWeight: 800 }}>대화를 마친 후 완료 버튼을 누르세요</small>
              </span>
            </div>

            {isMyTurn && (
              <button 
                className="game-btn-press"
                onClick={(e) => { e.stopPropagation(); passTurn(); }} 
                style={{ 
                  marginTop: '18px',
                  width: '100%',
                  padding: '16px',
                  borderRadius: '100px',
                  background: '#2D1F08',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '15px',
                  border: 'none',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.15)'
                }}
              >
                답변완료 / 다음 턴
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
          borderRadius: '25px', 
          border: 'none', 
          background: isMyTurn ? 'linear-gradient(135deg, #2D1F08, #4B3A1A)' : '#E5E7EB', 
          color: isMyTurn ? 'white' : '#9CA3AF', 
          fontWeight: 900, 
          fontSize: '17px',
          boxShadow: isMyTurn ? '0 12px 30px rgba(0,0,0,0.15)' : 'none',
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
