import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, RefreshCw, Sparkles, Lock, Zap } from 'lucide-react';
import { supabase } from '../../supabase';
import { CARD_DATA } from '../../data/dialogueCards';

const CardGameView = ({ onBack, coupleCode, userRole, husbandInfo, wifeInfo, mainChannel }) => {
  const [category, setCategory] = useState('일상');
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showTurnWarning, setShowTurnWarning] = useState(false);

  const [turnOwner, setTurnOwner] = useState(null);
  const [sessionCardCount, setSessionCardCount] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [history, setHistory] = useState([]);
  const isMounted = useRef(false);

  // 리얼타임 브로드캐스트 리스너 추가 (App.jsx에서 dispatch한 이벤트 수신)
  useEffect(() => {
    const handleRemoteUpdate = (e) => {
      const payload = e.detail;
      if (payload.sender === userRole) return; // 내 방송은 무시

      if (payload.type === 'draw') {
        setCategory(payload.category);
        const q = CARD_DATA.find(item => String(item.id) === String(payload.questionId));
        if (q) {
          setCurrentQuestion(q);
          setHistory(prev => [...new Set([...prev, q.id])].slice(-40));
        }
        setIsFlipped(payload.isFlipped || false);
        setTurnOwner(payload.sender);
      } else if (payload.type === 'flip') {
        setIsFlipped(payload.isFlipped);
        if (payload.questionId) {
          const q = CARD_DATA.find(item => String(item.id) === String(payload.questionId));
          if (q) setCurrentQuestion(q);
        }
      } else if (payload.type === 'turn-passed') {
        setTurnOwner(payload.nextTurnOwner);
        const q = CARD_DATA.find(item => String(item.id) === String(payload.questionId));
        if (q) {
          setCurrentQuestion(q);
          setHistory(prev => [...new Set([...prev, q.id])].slice(-40));
          setIsFlipped(false);
        }
      }
    };

    window.addEventListener('card-game-update', handleRemoteUpdate);
    return () => window.removeEventListener('card-game-update', handleRemoteUpdate);
  }, [userRole]);

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

    setHistory(prev => [...new Set([...prev, nextQ.id])].slice(-40));
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

      // 📡 방송으로 즉시 알림
      if (mainChannel) {
        mainChannel.send({
          type: 'broadcast',
          event: 'game-update',
          payload: { 
            sender: userRole, 
            type: 'draw', 
            category: activeCat, 
            questionId: nextQ.id,
            isFlipped: false 
          }
        });
      }
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

      // 📡 방송으로 즉시 알림
      if (mainChannel) {
        mainChannel.send({
          type: 'broadcast',
          event: 'game-update',
          payload: { 
            sender: userRole, 
            type: 'flip', 
            isFlipped: nextFlip,
            questionId: currentQuestion?.id
          }
        });
      }
    }
  };

  const passTurn = async () => {
    // BUG FIX: Allow passing if turnOwner matches current user OR if no owner set yet
    if (turnOwner && turnOwner !== userRole) return;
    
    const nextTurnOwner = userRole === 'husband' ? 'wife' : 'husband';
    setIsFlipped(false);
    setTurnOwner(nextTurnOwner);
    
    // Auto-draw for partner immediately to ensure sync when they "open"
    const activeCat = category;
    const pool = CARD_DATA.filter(q => q.category === activeCat);
    const available = pool.filter(q => !history.includes(q.id));
    const finalPool = (available.length > 0 ? available : pool);
    const nextQForSpouse = finalPool[Math.floor(Math.random() * finalPool.length)] || pool[0];

    if (coupleCode) {
      await supabase.from('card_game_state').update({ 
        turn_owner: nextTurnOwner,
        is_flipped: false,
        current_question_id: nextQForSpouse.id,
        updated_at: new Date().toISOString()
      }).eq('couple_id', coupleCode);

      // Broadcast the update so the partner's UI refreshes instantly
      if (mainChannel) {
        mainChannel.send({
          type: 'broadcast',
          event: 'game-update', // App.jsx에서 game-update를 수신해서 card-game-update 이벤트를 발송함
          payload: { 
            sender: userRole, 
            type: 'turn-passed', 
            nextTurnOwner,
            questionId: nextQForSpouse.id 
          }
        });
      }
    }
  };

  return (
    <div 
      className="game-view-wrapper" 
      style={{ 
        width: '100%', 
        minHeight: '101%', /* Force scroll activation */
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '0 20px', 
        paddingTop: '10px',
        backgroundColor: 'transparent',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y'
      }}
    >
      <style>{`
        .game-btn-press {
          transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.1s ease;
        }
        .game-btn-press:active { transform: scale(0.95); opacity: 0.85; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .sparkling-gold {
          background: linear-gradient(95deg, 
            #BF953F 0%, 
            #FCF6BA 25%, 
            #B38728 50%, 
            #FBF5B7 75%, 
            #AA771C 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine-gold 4s linear infinite;
          background-size: 200% auto;
        }
        
        @keyframes shine-gold {
          to { background-position: 200% center; }
        }
      `}</style>
      
      {showFinishModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', border: '5px solid #D4AF37', borderRadius: '40px', width: '100%', maxWidth: '340px', padding: '40px 25px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
            <Sparkles size={60} color="#D4AF37" style={{ marginBottom: '20px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#2D1F08', marginBottom: '12px' }}>오늘의 대화를 마칠까요?</h3>
            <p style={{ fontSize: '16px', color: '#8B7355', fontWeight: 600, lineHeight: 1.6, marginBottom: '25px', wordBreak: 'keep-all' }}>열 개의 대화 카드를 모두 확인했습니다. ✨</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <button onClick={onBack} style={{ width: '100%', padding: '18px', borderRadius: '22px', background: '#2D1F08', color: 'white', fontWeight: 900, fontSize: '16px', border: 'none' }}>대화 선택으로 돌아가기</button>
              <button onClick={() => { setShowFinishModal(false); setSessionCardCount(11); }} style={{ width: '100%', padding: '14px', background: 'none', color: '#B08D3E', fontWeight: 800, fontSize: '14px', border: 'none' }}>조금 더 할게요</button>
            </div>
          </div>
        </div>
      )}

      {showTurnWarning && (
        <div style={{ position: 'fixed', top: '100px', zIndex: 999, background: 'rgba(239, 68, 68, 0.95)', color: 'white', padding: '12px 25px', borderRadius: '100px', fontSize: '14px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
          <Lock size={16} /> 배우자가 답변 중일 때는 조작할 수 없어요!
        </div>
      )}

      <div className="w-full flex justify-start mb-4">
        <button onClick={onBack} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ChevronLeft size={22} color="#8A60FF" strokeWidth={3} />
          <span style={{ fontSize: '15px', fontWeight: 900, color: '#8A60FF' }}>돌아가기</span>
        </button>
      </div>

      <div style={{ width: '100%', marginBottom: '25px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '5px' }}>
          {['일상', '상상', '추억', '관계', '신앙', '시크릿'].map(cat => (
            <button 
              key={cat} 
              onClick={() => { if(!isMyTurn) return; setCategory(cat); drawNewCard(cat); }}
              className="game-btn-press"
              style={{ 
                padding: '12px 10px', 
                borderRadius: '16px', 
                border: category === cat ? 'none' : '1.5px solid rgba(138, 96, 255, 0.2)', 
                background: category === cat ? '#8A60FF' : 'white', 
                color: category === cat ? 'white' : '#8A60FF', 
                fontWeight: 900, 
                fontSize: '13px', 
                textAlign: 'center',
                opacity: isMyTurn ? 1 : 0.6 
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center" style={{ marginBottom: '20px' }}>
        <p style={{ letterSpacing: '5px', color: '#8B6500', fontWeight: '900', fontSize: '13px', opacity: 0.8, marginBottom: '5px' }}>SELECT YOUR TOPIC</p>
        <p style={{ fontSize: '11px', color: '#8B7355', fontWeight: 700, letterSpacing: '-0.2px' }}>질문 주제를 먼저 고르세요</p>
        
        <div style={{ marginTop: '10px', fontSize: '12px', color: turnOwner ? (turnOwner === 'husband' ? '#8B6500' : '#8A60FF') : '#8B7355', fontWeight: 900, background: 'rgba(255,255,255,0.6)', padding: '6px 16px', borderRadius: '100px', border: '1.5px solid rgba(212, 175, 55, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!isMyTurn ? <Zap size={16} className="animate-pulse" /> : <Sparkles size={16} />}
            {isMyTurn ? "당신의 차례입니다 ✨" : `${partnerNameOnly} 답변 중입니다...`}
        </div>
      </div>

      <div className="card-container" style={{ 
        perspective: '1500px', marginBottom: '40px', width: '300px', height: '420px', 
        display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative',
        userSelect: 'none',
        touchAction: 'pan-y'
      }}>
        <div 
          className={`talking-card ${isFlipped ? 'flipped' : ''}`} 
          onClick={toggleFlip}
          style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          {/* Card Front */}
          <div className="card-face card-front" style={{ 
            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', borderRadius: '35px', border: '2px solid #F5D060', backgroundImage: "url('/card_bg.png')", backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', visibility: isFlipped ? 'hidden' : 'visible', zIndex: isFlipped ? 1 : 2, boxShadow: '0 15px 40px rgba(0,0,0,0.3)', overflow: 'hidden' 
          }}>
            <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.6)', padding: '20px 30px', borderRadius: '25px', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="sparkling-gold" style={{ fontSize: '24px', letterSpacing: '3px', fontWeight: 900, marginBottom: '10px' }}>QUESTION CARD</p>
              <p style={{ fontSize: '14px', color: 'white', opacity: 0.9, fontWeight: 700 }}>클릭해서 확인</p>
            </div>
          </div>

          {/* Card Back */}
          <div className="card-face card-back" style={{ 
            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', backgroundColor: 'white', backgroundImage: `linear-gradient(45deg, rgba(0,0,0,0.02) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.02) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.02) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.02) 75%)`, backgroundSize: '20px 20px', borderRadius: '32px', border: '2px solid #F5D060', transform: 'rotateY(180deg)', padding: '40px 24px', visibility: isFlipped ? 'visible' : 'hidden', zIndex: isFlipped ? 2 : 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' 
          }}>
            <span style={{ background: '#FF4D6D', color: 'white', fontWeight: 900, padding: '8px 20px', borderRadius: '100px', fontSize: '13px', boxShadow: '0 4px 10px rgba(255, 77, 109, 0.2)' }}>{category}</span>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <h2 style={{ fontSize: currentQuestion?.question?.length > 40 ? '18px' : '22px', color: '#1a1a1a', lineHeight: 1.6, wordBreak: 'keep-all', fontWeight: 800 }}>{currentQuestion?.question || "새로운 카드를 뽑아주세요!"}</h2>
            </div>
            {isMyTurn && (
              <button className="game-btn-press" onClick={(e) => { e.stopPropagation(); passTurn(); }} style={{ background: '#2D1F08', borderRadius: '100px', height: '52px', padding: '0 28px', color: 'white', fontWeight: 900, fontSize: '15px', border: 'none', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
                답변 완료 & 턴 넘기기 <RefreshCw size={18} color="#F5D060" />
              </button>
            )}
          </div>
        </div>
      </div>

      <button disabled={!isMyTurn} onClick={() => drawNewCard()} className="game-btn-press" style={{ width: '100%', maxWidth: '300px', padding: '18px', borderRadius: '16px', background: isMyTurn ? '#2D1F08' : '#E5E7EB', color: isMyTurn ? 'white' : '#9CA3AF', fontWeight: 900, fontSize: '16px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', border: 'none' }}>
        다른 카드 뽑기
      </button>

        {!isMyTurn && (
          <div style={{ background: 'rgba(0,0,0,0.05)', padding: '20px 40px', borderRadius: '100px', color: '#8B7355', fontWeight: 800, fontSize: '16px', border: '1.5px dashed rgba(138, 96, 255, 0.2)', textAlign: 'center', width: '100%', maxWidth: '300px', marginTop: '20px' }}>
            상대방의 답변을 기다리는 중
          </div>
        )}

      <p style={{ marginTop: '30px', fontSize: '11px', color: '#B08D3E', fontWeight: 800, opacity: 0.6 }}>* 화면을 위아래로 스크롤할 수 있습니다.</p>
      {/* Spacer for bottom navigation clearance */}
      <div style={{ height: '300px', width: '100%', flexShrink: 0 }} />
    </div>
  );
};

export default React.memo(CardGameView);
