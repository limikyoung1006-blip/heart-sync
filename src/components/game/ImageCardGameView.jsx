import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, RefreshCw, Layout, Grid, Lock, Sparkles, Zap } from 'lucide-react';
import { supabase } from '../../supabase';
import { IMAGE_CARD_DATA } from '../../data/imageCards';

const ImageCardGameView = ({ onBack, coupleCode, userRole, mainChannel, husbandInfo, wifeInfo }) => {
  const [mode, setMode] = useState(null); // 'classic' or 'pick2'
  const [currentCard, setCurrentCard] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [pickedCards, setPickedCards] = useState([]);
  const [turnOwner, setTurnOwner] = useState(null);
  const [showTurnWarning, setShowTurnWarning] = useState(false);
  
  const isMounted = useRef(false);
  const partnerLabel = userRole === 'husband' ? '아내' : '남편';
  const isMyTurn = !turnOwner || turnOwner === userRole;

  // Load and Sync State
  useEffect(() => {
    isMounted.current = true;
    const loadState = async () => {
      if (!coupleCode) return;
      const { data } = await supabase.from('image_game_state').select('*').eq('couple_id', coupleCode).single();
      if (data && isMounted.current) {
        setMode(data.mode);
        setIsFlipped(data.is_flipped);
        setTurnOwner(data.turn_owner);
        const card = IMAGE_CARD_DATA.find(c => String(c.id) === String(data.current_card_id));
        if (card) setCurrentCard(card);
        if (data.picked_card_ids) {
          const picked = data.picked_card_ids.map(id => IMAGE_CARD_DATA.find(c => String(c.id) === String(id))).filter(Boolean);
          setPickedCards(picked);
        }
      }
    };
    loadState();

    const subscription = supabase
      .channel(`image_game_${coupleCode}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'image_game_state', 
        filter: `couple_id=eq.${coupleCode}` 
      }, payload => {
        const updated = payload.new;
        if (updated && isMounted.current) {
          setMode(updated.mode);
          setIsFlipped(updated.is_flipped);
          setTurnOwner(updated.turn_owner);
          const card = IMAGE_CARD_DATA.find(c => String(c.id) === String(updated.current_card_id));
          if (card) setCurrentCard(card);
          if (updated.picked_card_ids) {
            const picked = updated.picked_card_ids.map(id => IMAGE_CARD_DATA.find(c => String(c.id) === String(id))).filter(Boolean);
            setPickedCards(picked);
          }
        }
      })
      .subscribe();

    return () => { 
      isMounted.current = false; 
      subscription.unsubscribe();
    };
  }, [coupleCode, userRole]);

  const updateRemoteState = async (updates) => {
    if (!coupleCode) return;
    await supabase.from('image_game_state').upsert({
      couple_id: coupleCode,
      ...updates,
      updated_at: new Date().toISOString()
    }, { onConflict: 'couple_id' });

    // Optional: Broadcast for faster sync
    if (typeof mainChannel !== 'undefined' && mainChannel) {
        mainChannel.send({
          type: 'broadcast',
          event: 'game-update',
          payload: { sender: userRole, ...updates }
        });
    }
  };

  const startClassic = () => {
    const card = IMAGE_CARD_DATA[Math.floor(Math.random() * IMAGE_CARD_DATA.length)];
    setMode('classic');
    setCurrentCard(card);
    setIsFlipped(false);
    setTurnOwner(userRole);
    updateRemoteState({ mode: 'classic', current_card_id: card.id, is_flipped: false, turn_owner: userRole, picked_card_ids: null });
  };

  const startPick2 = () => {
    setMode('pick2');
    setPickedCards([]);
    setTurnOwner(userRole);
    updateRemoteState({ mode: 'pick2', picked_card_ids: [], turn_owner: userRole, current_card_id: null, is_flipped: false });
  };

  const resetGame = () => {
    setMode(null);
    setCurrentCard(null);
    setIsFlipped(false);
    setPickedCards([]);
    setTurnOwner(null);
    updateRemoteState({ mode: null, current_card_id: null, is_flipped: false, picked_card_ids: null, turn_owner: null });
  };

  const toggleFlip = () => {
    if (!isMyTurn) {
      setShowTurnWarning(true);
      setTimeout(() => setShowTurnWarning(false), 2000);
      return;
    }
    const nextFlip = !isFlipped;
    setIsFlipped(nextFlip);
    updateRemoteState({ is_flipped: nextFlip });
  };

  const passTurn = () => {
    const nextTurnOwner = userRole === 'husband' ? 'wife' : 'husband';
    setTurnOwner(nextTurnOwner);
    setIsFlipped(false);
    
    // Draw next card immediately for sync
    const nextCard = IMAGE_CARD_DATA[Math.floor(Math.random() * IMAGE_CARD_DATA.length)];
    setCurrentCard(nextCard);
    
    updateRemoteState({ 
      turn_owner: nextTurnOwner, 
      is_flipped: false,
      current_card_id: nextCard.id 
    });
  };

  const handlePickCard = (card) => {
    if (!isMyTurn) return;
    if (pickedCards.find(c => c.id === card.id)) {
      const filtered = pickedCards.filter(c => c.id !== card.id);
      setPickedCards(filtered);
      updateRemoteState({ picked_card_ids: filtered.map(c => c.id) });
    } else if (pickedCards.length < 2) {
      const next = [...pickedCards, card];
      setPickedCards(next);
      updateRemoteState({ picked_card_ids: next.map(c => c.id) });
    }
  };

  const passTurnPick2 = () => {
    const nextTurnOwner = userRole === 'husband' ? 'wife' : 'husband';
    setTurnOwner(nextTurnOwner);
    setPickedCards([]);
    updateRemoteState({ turn_owner: nextTurnOwner, picked_card_ids: [] });
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
        paddingBottom: '250px', // Extra padding for mobile scroll
        minHeight: '100%',
        overflowY: 'visible',
        backgroundColor: 'transparent',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <style>{`
        .image-card-press { transition: transform 0.1s ease, opacity 0.1s ease; cursor: pointer; }
        .image-card-press:active { transform: scale(0.96); opacity: 0.9; }
        .sparkling-text {
          background: linear-gradient(95deg, #BF953F, #FCF6BA, #B38728, #FBF5B7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% auto;
          animation: shine 4s linear infinite;
        }
        @keyframes shine { to { background-position: 200% center; } }
      `}</style>

      {/* Turn Warning Toast */}
      {showTurnWarning && (
        <div style={{ position: 'fixed', top: '100px', zIndex: 9999, background: 'rgba(239, 68, 68, 0.95)', color: 'white', padding: '12px 25px', borderRadius: '100px', fontSize: '14px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
          <Lock size={16} /> {partnerLabel} 답변 차례입니다!
        </div>
      )}

      <div className="w-full flex justify-start mb-6">
        <button onClick={onBack} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ChevronLeft size={22} color="#8A60FF" strokeWidth={3} />
          <span style={{ fontSize: '15px', fontWeight: 900, color: '#8A60FF' }}>돌아가기</span>
        </button>
      </div>

      {!mode ? (
        <div className="flex flex-col gap-6 w-full max-w-[340px] mt-10">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
             <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#2D1F08', marginBottom: '8px' }}>이미지 대화 카드</h2>
             <p style={{ fontSize: '15px', color: '#8B7355', fontWeight: 600 }}>진행 방식을 선택해 주세요</p>
          </div>
          
          <button onClick={startClassic} className="image-card-press" style={{ background: 'white', border: '2px solid #F5D060', borderRadius: '30px', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: '#FFF9E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layout size={32} color="#D4AF37" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08', marginBottom: '4px' }}>방식 1: 한 장씩 대화</h3>
              <p style={{ fontSize: '13px', color: '#8B7355', fontWeight: 600 }}>랜덤 카드를 뒤집어 깊게 대화합니다</p>
            </div>
          </button>

          <button onClick={startPick2} className="image-card-press" style={{ background: 'white', border: '2px solid #8A60FF', borderRadius: '30px', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Grid size={32} color="#8A60FF" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08', marginBottom: '4px' }}>방식 2: 질문 두 개 고르기</h3>
              <p style={{ fontSize: '13px', color: '#8B7355', fontWeight: 600 }}>여러 질문 중 마음에 드는 2개를 고릅니다</p>
            </div>
          </button>
        </div>
      ) : mode === 'classic' ? (
        <div className="flex flex-col items-center w-full max-w-[400px]">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '25px', padding: '8px 20px', background: 'rgba(255,255,255,0.7)', borderRadius: '100px', border: '1.5px solid #F5D060' }}>
            {isMyTurn ? <Sparkles size={18} color="#D4AF37" /> : <Zap size={18} className="animate-pulse" color="#8B7355" />}
            <span style={{ fontSize: '14px', fontWeight: 900, color: isMyTurn ? '#2D1F08' : '#8B7355' }}>
              {isMyTurn ? "당신의 차례입니다 ✨" : `${partnerLabel}님이 답변 중입니다...`}
            </span>
          </div>

          <div style={{ perspective: '1500px', width: '300px', height: '420px', marginBottom: '30px', position: 'relative' }}>
            <div 
              style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)', transform: isFlipped ? 'rotateY(180deg)' : 'none', cursor: isMyTurn ? 'pointer' : 'default' }}
              onClick={toggleFlip}
            >
              <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: '35px', backgroundImage: 'url("/card_bg.png")', backgroundSize: 'cover', border: '2px solid #F5D060', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 15px 40px rgba(0,0,0,0.2)' }}>
                {!isMyTurn && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: '35px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                    <Lock size={40} color="white" />
                    <span style={{ color: 'white', fontWeight: 900, marginTop: '10px' }}>{partnerLabel} 차례</span>
                  </div>
                )}
                <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.7)', padding: '20px 30px', borderRadius: '25px', backdropFilter: 'blur(10px)' }}>
                   <p className="sparkling-text" style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '2px', marginBottom: '8px' }}>IMAGE CARD</p>
                   <p style={{ color: 'white', opacity: 0.8, fontSize: '13px', fontWeight: 700 }}>클릭해서 확인</p>
                </div>
              </div>
              
              <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: '35px', transform: 'rotateY(180deg)', background: 'white', overflow: 'hidden', border: '5px solid #F5D060', boxShadow: '0 15px 40px rgba(0,0,0,0.2)' }}>
                <img src={currentCard?.image} style={{ width: '100%', height: '60%', objectFit: 'cover' }} />
                <div style={{ height: '40%', background: 'white', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#2D1F08', wordBreak: 'keep-all', lineHeight: 1.5 }}>{currentCard?.question}</h3>
                </div>
                {!isMyTurn && isFlipped && (
                  <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(212, 175, 55, 0.95)', color: 'white', padding: '8px 20px', borderRadius: '100px', fontSize: '12px', fontWeight: 900, zIndex: 20, whiteSpace: 'nowrap', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
                    {partnerLabel}님이 답변 중입니다 ✨
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '300px' }}>
            <button 
              className="image-card-press" 
              onClick={startClassic}
              disabled={!isMyTurn}
              style={{ padding: '18px', borderRadius: '20px', background: isMyTurn ? '#2D1F08' : '#E5E7EB', color: isMyTurn ? 'white' : '#9CA3AF', fontWeight: 900, border: 'none' }}
            >
              다른 카드 뽑기
            </button>
            {isMyTurn && isFlipped && (
              <button 
                className="image-card-press" 
                onClick={passTurn}
                style={{ padding: '18px', borderRadius: '20px', background: '#F5D060', color: '#2D1F08', fontWeight: 900, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                답변 완료 & 턴 넘기기 <RefreshCw size={18} />
              </button>
            )}
            <button onClick={resetGame} style={{ padding: '12px', background: 'none', border: 'none', color: '#8B7355', fontWeight: 800, fontSize: '14px' }}>모드 선택으로 돌아가기</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          <div style={{ textAlign: 'center', marginBottom: '25px', padding: '0 20px' }}>
             <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#2D1F08', marginBottom: '4px' }}>질문 {pickedCards.length}/2개 선택</h3>
             <p style={{ fontSize: '13px', color: '#8A60FF', fontWeight: 800 }}>{isMyTurn ? "마음에 드는 질문을 골라보세요" : `${partnerLabel}님이 질문을 고르는 중...`}</p>
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
            {!isMyTurn && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(138, 96, 255, 0.1)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
                <div style={{ background: 'white', padding: '30px', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', border: '2px solid #8A60FF', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                   <Lock size={40} color="#8A60FF" style={{ marginBottom: '15px' }} />
                   <p style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08' }}>{partnerLabel}님이 선택 중입니다</p>
                   <p style={{ fontSize: '14px', color: '#8B7355', fontWeight: 700, marginTop: '5px' }}>잠시만 기다려주세요</p>
                </div>
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', padding: '0 10px', marginBottom: '30px' }}>
              {IMAGE_CARD_DATA.map(card => {
                const isPicked = pickedCards.find(c => c.id === card.id);
                return (
                  <div 
                    key={card.id} 
                    onClick={() => handlePickCard(card)}
                    style={{ position: 'relative', borderRadius: '22px', overflow: 'hidden', aspectRatio: '4/5', cursor: 'pointer', border: isPicked ? '4px solid #8A60FF' : '2px solid transparent', transition: 'all 0.3s ease', transform: isPicked ? 'scale(1.02)' : 'scale(1)' }}
                  >
                    <img src={card.image} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isPicked ? 0.6 : 1 }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)', padding: '15px', display: 'flex', alignItems: 'flex-end' }}>
                      <p style={{ color: 'white', fontSize: '12px', fontWeight: 800, lineHeight: 1.4, wordBreak: 'keep-all' }}>{card.question}</p>
                    </div>
                    {isPicked && <div style={{ position: 'absolute', top: '10px', right: '10px', width: '24px', height: '24px', background: '#8A60FF', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }}>{pickedCards.indexOf(isPicked) + 1}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '300px' }}>
            {isMyTurn && pickedCards.length === 2 && (
              <button 
                className="image-card-press" 
                onClick={passTurnPick2}
                style={{ padding: '18px', borderRadius: '20px', background: '#8A60FF', color: 'white', fontWeight: 900, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                선택 완료 & 턴 넘기기 <RefreshCw size={18} />
              </button>
            )}
            <button onClick={resetGame} style={{ padding: '12px', background: 'none', border: 'none', color: '#8B7355', fontWeight: 800, fontSize: '14px' }}>모드 선택으로 돌아가기</button>
          </div>
        </div>
      )}

      {mode && (
        <p style={{ marginTop: '30px', fontSize: '11px', color: '#B08D3E', fontWeight: 800, opacity: 0.6 }}>* 화면을 위아래로 스크롤할 수 있습니다.</p>
      )}
    </div>
  );
};

export default React.memo(ImageCardGameView);
