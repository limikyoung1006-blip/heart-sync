import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronRight, ChevronLeft, RefreshCw, Layout, Grid, Lock, Sparkles, Zap, MessageCircle } from 'lucide-react';
import { supabase } from '../../supabase';
import { IMAGE_CARD_DATA } from '../../data/imageCards';

const PIC2_THEMES = [
  { q: "요즘 당신의 마음 상태를 가장 잘 표현하는 사진은 무엇인가요?", pool: [10, 11, 13, 14, 19, 23, 26, 27, 42, 51] },
  { q: "우리 부부의 미래에 꼭 함께하고 싶은 이미지는?", pool: [6, 16, 17, 18, 20, 21, 24, 25, 29, 44] },
  { q: "말로는 다 하기 힘든 요즘 나의 속마음이 담긴 사진은?", pool: [1, 7, 8, 12, 15, 22, 28, 30, 31, 34] },
  { q: "서로에게 더 전달하고 싶은 따뜻한 정서가 느껴지는 이미지는?", pool: [2, 3, 5, 9, 32, 33, 35, 37, 39, 40] },
  { q: "우리 관계의 회복과 기쁨을 위해 꼭 필요한 느낌의 사진은?", pool: [4, 36, 18, 22, 41, 43, 49, 50, 52, 53] }
];

const ImageCardGameView = ({ onBack, coupleCode, userRole, mainChannel, husbandInfo, wifeInfo }) => {
  const [mode, setMode] = useState(null); // 'classic' or 'pick2'
  const [currentCard, setCurrentCard] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [pickedCards, setPickedCards] = useState([]);
  const [turnOwner, setTurnOwner] = useState(null);
  const [showTurnWarning, setShowTurnWarning] = useState(false);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  
  const isMounted = useRef(false);
  const partnerLabel = userRole === 'husband' ? '아내' : '남편';
  const isMyTurn = !turnOwner || turnOwner === userRole;

  // 리얼타임 브로드캐스트 리스너 추가
  useEffect(() => {
    const handleRemoteUpdate = (e) => {
      const payload = e.detail;
      if (payload.sender === userRole) return; // 내 방송 무시

      if (payload.mode !== undefined) setMode(payload.mode);
      if (payload.is_flipped !== undefined) setIsFlipped(payload.is_flipped);
      if (payload.turn_owner !== undefined) setTurnOwner(payload.turn_owner);
      if (payload.current_card_id !== undefined) {
        setCurrentThemeIndex(payload.current_card_id);
        const card = IMAGE_CARD_DATA.find(c => String(c.id) === String(payload.current_card_id));
        if (card) setCurrentCard(card);
      }
      if (payload.picked_card_ids !== undefined) {
          const picked = (payload.picked_card_ids || []).map(id => IMAGE_CARD_DATA.find(c => String(c.id) === String(id))).filter(Boolean);
          setPickedCards(picked);
      }
    };

    window.addEventListener('card-game-update', handleRemoteUpdate);
    return () => window.removeEventListener('card-game-update', handleRemoteUpdate);
  }, [userRole]);

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
        setCurrentThemeIndex(data.current_card_id || 0);
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
          setCurrentThemeIndex(updated.current_card_id || 0);
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

    // 📡 빠른 브로드캐스트 전송 (App.jsx의 game-update 리스너가 card-game-update 이벤트를 발생시킴)
    if (mainChannel) {
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
    const themeIdx = Math.floor(Math.random() * PIC2_THEMES.length);
    setMode('pick2');
    setPickedCards([]);
    setCurrentThemeIndex(themeIdx);
    setTurnOwner(userRole);
    updateRemoteState({ mode: 'pick2', picked_card_ids: [], turn_owner: userRole, current_card_id: themeIdx, is_flipped: false });
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
    updateRemoteState({ 
      is_flipped: nextFlip, 
      current_card_id: currentCard?.id 
    });
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
    // Keep pickedCards to show the partner
    updateRemoteState({ 
      turn_owner: nextTurnOwner, 
      picked_card_ids: pickedCards.map(c => c.id),
      current_card_id: currentThemeIndex
    });
  };

  return (
    <div 
      className="image-game-view-wrapper" 
      style={{ 
        width: '100%', 
        minHeight: '101%', /* Force scroll activation */
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '0 20px', 
        position: 'relative',
        backgroundColor: 'transparent',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y'
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
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08', marginBottom: '4px' }}>방식 2: 사진 고르고 설명하기</h3>
              <p style={{ fontSize: '13px', color: '#8B7355', fontWeight: 600 }}>10장의 사진 중 2장을 골라 파트너에게 설명합니다</p>
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

          <div style={{ perspective: '1500px', width: '300px', height: '420px', marginBottom: '30px', position: 'relative', touchAction: 'pan-y' }}>
            <div 
              style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)', transform: isFlipped ? 'rotateY(180deg)' : 'none', cursor: isMyTurn ? 'pointer' : 'default' }}
              onClick={toggleFlip}
            >
              <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: '35px', backgroundImage: 'url("/card_bg.png")', backgroundSize: 'cover', border: '2px solid #F5D060', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 15px 40px rgba(0,0,0,0.2)' }}>
                {!isMyTurn && !isFlipped && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: '35px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                    <Lock size={40} color="white" />
                    <span style={{ color: 'white', fontWeight: 900, marginTop: '10px' }}>{partnerLabel} 답변 중</span>
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
                  <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(212, 175, 55, 0.95)', color: 'white', padding: '8px 20px', borderRadius: '100px', fontSize: '11px', fontWeight: 900, zIndex: 20, whiteSpace: 'nowrap', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
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
             <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#8A60FF', marginBottom: '8px', wordBreak: 'keep-all' }}>"{PIC2_THEMES[currentThemeIndex]?.q}"</h3>
             <p style={{ fontSize: '13px', color: '#2D1F08', fontWeight: 800 }}>
               {isMyTurn ? `${pickedCards.length}/2개 선택` : `${partnerLabel}님이 고민하며 선택 중...`}
             </p>
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
            {/* Show Results if Turn Passed and 2 Selected */}
            {!isMyTurn && pickedCards.length === 2 ? (
              <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                <div style={{ background: '#F3E8FF', padding: '15px 25px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '10px', animation: 'bounce 2s infinite' }}>
                   <MessageCircle size={18} color="#8A60FF" />
                   <span style={{ fontSize: '14px', fontWeight: 900, color: '#8A60FF' }}>{partnerLabel}님이 선택한 사진 2장입니다! 이유를 들어보세요 ✨</span>
                </div>
                
                <div style={{ display: 'flex', gap: '15px', width: '100%', justifyContent: 'center' }}>
                  {pickedCards.map((card, idx) => (
                    <div key={card.id} style={{ flex: 1, maxWidth: '180px', background: 'white', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(138, 96, 255, 0.2)', border: '4px solid #8A60FF' }}>
                      <img src={card.image} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                      <div style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 900, color: '#8A60FF' }}>PICK {idx + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'rgba(255,255,255,0.7)', padding: '20px', borderRadius: '20px', border: '1.5px dashed #8A60FF', width: '100%', textAlign: 'center' }}>
                   <p style={{ fontSize: '14px', fontWeight: 700, color: '#2D1F08' }}>"{partnerLabel}님, 이 사진 2장을 고른 이유가 궁금해요. 서로 깊은 이야기를 나누어 보세요."</p>
                </div>
                
                <button 
                  className="image-card-press" 
                  onClick={() => {
                    const nextTurnOwner = userRole === 'husband' ? 'wife' : 'husband';
                    setTurnOwner(nextTurnOwner);
                    setPickedCards([]);
                    updateRemoteState({ turn_owner: nextTurnOwner, picked_card_ids: [] });
                  }}
                  style={{ padding: '18px', width: '100%', maxWidth: '300px', borderRadius: '20px', background: '#8A60FF', color: 'white', fontWeight: 900, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                  제 차례로 가져오기 (새 질문) <ChevronRight size={20} />
                </button>
              </div>
            ) : (
              <>
                {!isMyTurn && (
                  <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(138, 96, 255, 0.05)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '100px', pointerEvents: 'auto' }}>
                    <div style={{ position: 'sticky', top: '100px', background: 'white', padding: '30px', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', border: '2px solid #8A60FF', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                       <Lock size={40} color="#8A60FF" style={{ marginBottom: '15px' }} />
                       <p style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08' }}>{partnerLabel}님이 선택 중입니다</p>
                       <p style={{ fontSize: '14px', color: '#8B7355', fontWeight: 700, marginTop: '5px' }}>잠시만 기다려주세요</p>
                    </div>
                  </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', padding: '0 10px', marginBottom: '30px' }}>
                  {PIC2_THEMES[currentThemeIndex]?.pool.map(id => {
                    const card = IMAGE_CARD_DATA.find(c => c.id === id);
                    if (!card) return null;
                    const isPicked = pickedCards.find(c => c.id === card.id);
                    return (
                      <div 
                        key={card.id} 
                        onClick={() => handlePickCard(card)}
                        style={{ position: 'relative', borderRadius: '22px', overflow: 'hidden', aspectRatio: '1/1', cursor: 'pointer', border: isPicked ? '4px solid #8A60FF' : '2px solid transparent', transition: 'all 0.3s ease', transform: isPicked ? 'scale(1.02)' : 'scale(1)' }}
                      >
                        <img src={card.image} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isPicked ? 0.6 : 1 }} />
                        {isPicked && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(138, 96, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <div style={{ width: '40px', height: '40px', background: '#8A60FF', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>{pickedCards.indexOf(isPicked) + 1}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                  {isMyTurn && pickedCards.length === 2 && (
                    <button 
                      className="image-card-press" 
                      onClick={passTurnPick2}
                      style={{ padding: '18px', borderRadius: '20px', background: '#8A60FF', color: 'white', fontWeight: 900, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                      선택 완료 & 상대방에게 보여주기 <RefreshCw size={18} />
                    </button>
                  )}
                  <button onClick={resetGame} style={{ padding: '12px', background: 'none', border: 'none', color: '#8B7355', fontWeight: 800, fontSize: '14px' }}>모드 선택으로 돌아가기</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {mode && (
        <p style={{ marginTop: '30px', fontSize: '11px', color: '#B08D3E', fontWeight: 800, opacity: 0.6 }}>* 화면을 위아래로 스크롤할 수 있습니다.</p>
      )}
      {/* Spacer for bottom navigation clearance */}
      <div style={{ height: '300px', width: '100%', flexShrink: 0 }} />
    </div>
  );
};

export default React.memo(ImageCardGameView);
