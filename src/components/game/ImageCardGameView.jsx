import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { supabase } from '../../supabase';
import { IMAGE_CARD_DATA } from '../../data/imageCards';

const ImageCardGameView = ({ onBack, coupleCode, userRole, husbandInfo, wifeInfo }) => {
  const [gameMode, setGameMode] = useState('classic'); 
  const [isFlipped, setIsFlipped] = useState(false);
  const [showTurnWarning, setShowTurnWarning] = useState(false);
  
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    const pool = IMAGE_CARD_DATA || [];
    if (pool.length === 0) return { id: 0, image: '', question: '데이터를 불러오는 중...' };
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  });

  const [turnOwner, setTurnOwner] = useState(null);
  const [mainQuestion, setMainQuestion] = useState("");
  const [imagePool, setImagePool] = useState([]);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState([]); 
  const [isSharing, setIsSharing] = useState(false); 
  const [sharedCards, setSharedCards] = useState([]); 
  const [sessionCardCount, setSessionCardCount] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [history, setHistory] = useState([]);
  
  const isMounted = useRef(false);
  const isMyTurn = !turnOwner || turnOwner === userRole;
  const partnerNameOnly = userRole === 'husband' ? '아내가' : '남편이';

  // Multi-device Sync logic
  useEffect(() => {
    isMounted.current = true;
    if (!coupleCode) return;

    const loadState = async () => {
      const { data } = await supabase.from('image_game_state').select('*').eq('couple_id', coupleCode).single();
      if (isMounted.current && data) {
        setGameMode(data.game_mode || 'classic');
        setIsFlipped(data.is_flipped || false);
        setTurnOwner(data.turn_owner || null);
        const q = IMAGE_CARD_DATA.find(item => String(item.id) === String(data.current_question_id));
        if (q) setCurrentQuestion(q);
        if (data.shared_cards) {
           setSharedCards(data.shared_cards);
           setIsSharing(true);
        }
      }
    };

    loadState();

    const subscription = supabase
      .channel(`image_game_${coupleCode}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'image_game_state', filter: `couple_id=eq.${coupleCode}` }, 
        payload => {
          const updated = payload.new;
          if (updated && isMounted.current) {
            setGameMode(updated.game_mode);
            setIsFlipped(updated.is_flipped);
            setTurnOwner(updated.turn_owner);
            if (updated.shared_cards) {
              setSharedCards(updated.shared_cards);
              setIsSharing(true);
            } else {
              setIsSharing(false);
            }
            const q = IMAGE_CARD_DATA.find(item => String(item.id) === String(updated.current_question_id));
            if (q) setCurrentQuestion(q);
          }
        })
      .subscribe();

    return () => { 
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, [coupleCode]);

  const drawNewCard = useCallback(() => {
    if (isImageLoading) return;
    if (turnOwner && turnOwner !== userRole) {
      setShowTurnWarning(true);
      setTimeout(() => setShowTurnWarning(false), 2000);
      return;
    }
    const pool = IMAGE_CARD_DATA || [];
    if (pool.length === 0) return;

    const available = pool.filter(q => !history.includes(q.id));
    const selection = available.length > 0 ? available : pool;
    const nextQ = selection[Math.floor(Math.random() * selection.length)];
    
    if (nextQ) {
      setIsFlipped(false);
      setIsImageLoading(true);
      setTurnOwner(userRole); 
      setHistory(prev => [...prev, nextQ.id].slice(-30));
      setCurrentQuestion(nextQ);
      setSessionCardCount(prev => prev + 1);
      if (sessionCardCount + 1 >= 10) setShowFinishModal(true);

      if (coupleCode) {
        supabase.from('image_game_state').upsert({
          couple_id: coupleCode,
          game_mode: 'classic',
          is_flipped: false,
          turn_owner: userRole,
          current_question_id: nextQ.id,
          shared_cards: null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'couple_id' }).then(() => {});
      }
    }
  }, [history, sessionCardCount, userRole, isImageLoading, coupleCode, turnOwner]);

  const initPick2Mode = useCallback(() => {
    const dataPool = IMAGE_CARD_DATA || [];
    if (dataPool.length < 10) return;

    const shuffled = [...dataPool].sort(() => Math.random() - 0.5);
    const pool = shuffled.slice(0, 10);
    const qPool = ["부부 생활을 잘 나타내는 이미지는?", "우리의 미래 소망 모습은?", "오늘 내 마음 상태는?"];
    setMainQuestion(qPool[Math.floor(Math.random() * qPool.length)]);
    setImagePool(pool); 
    setSelectedIndices([]); 
    setIsSharing(false); 
    setTurnOwner(userRole);
  }, [userRole]);

  const passTurn = async () => {
    if (turnOwner !== userRole) return;
    const nextTurnOwner = userRole === 'husband' ? 'wife' : 'husband';
    setIsFlipped(false);
    setTurnOwner(nextTurnOwner);
    
    if (coupleCode) {
      await supabase.from('image_game_state').update({ 
        turn_owner: nextTurnOwner,
        is_flipped: false,
        updated_at: new Date().toISOString()
      }).eq('couple_id', coupleCode);
    }
  };

  return (
    <div 
      className="image-sync-view" 
      style={{ 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '20px', 
        paddingBottom: '160px',
        minHeight: '100%',
        overflowY: 'visible',
        background: 'transparent'
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
      `}</style>

      {showFinishModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '35px', width: '100%', maxWidth: '340px', padding: '40px 25px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Sparkles size={45} color="#AB47BC" style={{ marginBottom: '20px' }} />
            <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#2D1F08', marginBottom: '10px' }}>열 번째 하트싱크 완료!</h3>
            <p style={{ fontSize: '15px', color: '#8B7355', fontWeight: 600, lineHeight: 1.6, marginBottom: '25px', wordBreak: 'keep-all' }}>오늘의 감성 연결이 서로를 더 깊게 이해하는 시간이 되셨나요? ✨</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <button onClick={onBack} style={{ width: '100%', padding: '18px', borderRadius: '22px', background: '#AB47BC', color: 'white', fontWeight: 900, border: 'none' }}>대화 선택으로 돌아가기</button>
              <button onClick={() => { setShowFinishModal(false); setSessionCardCount(11); }} style={{ width: '100%', padding: '12px', background: 'none', color: '#9C27B0', fontWeight: 800, border: 'none' }}>조금 더 할게요</button>
            </div>
          </div>
        </div>
      )}

      <header style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <ChevronLeft size={24} color="#AB47BC" strokeWidth={3} />
          <span style={{ fontWeight: 900, color: '#AB47BC', fontSize: '14px' }}>돌아가기</span>
        </button>
        <div style={{ display: 'flex', background: '#F3E5F5', borderRadius: '15px', padding: '3px' }}>
          {['classic', 'pick2'].map((m, i) => (
            <button key={m} onClick={() => { setGameMode(m); if(m === 'pick2' && imagePool.length === 0) initPick2Mode(); }} style={{ padding: '8px 18px', borderRadius: '12px', border: 'none', fontSize: '12px', fontWeight: 900, background: gameMode === m ? 'white' : 'transparent', color: gameMode === m ? '#AB47BC' : '#9c27b0' }}>방식 {i+1}</button>
          ))}
        </div>
      </header>
      
      <div style={{ width: '100%', padding: '14px', borderRadius: '20px', background: isMyTurn ? 'rgba(171, 71, 188, 0.08)' : '#F3E5F5', marginBottom: '20px', textAlign: 'center', position: 'relative' }}>
        <span style={{ fontSize: '13px', fontWeight: 900, color: isMyTurn ? '#AB47BC' : '#9C27B0' }}>
          {isMyTurn ? "✨ 당신의 턴입니다! 마음을 나눠주세요" : `⏳ ${partnerNameOnly} 답변 중입니다...`}
        </span>
      </div>

      {gameMode === 'classic' ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="card-container" style={{ 
            perspective: '1200px', 
            marginBottom: '30px', 
            width: '100%', 
            maxWidth: '300px',
            height: '420px',
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div 
              className={`talking-card ${isFlipped ? 'flipped' : ''}`} 
              onClick={() => { if (!isMyTurn) return; setIsFlipped(!isFlipped); setTurnOwner(userRole); if(coupleCode) supabase.from('image_game_state').update({ is_flipped: !isFlipped, turn_owner: userRole }).eq('couple_id', coupleCode).then(()=>{}); }}
            >
              <div className="card-face card-front" style={{ border: '3px solid #AB47BC', background: '#2D1F08' }}>
                <p style={{ fontSize: '12px', fontWeight: 900, color: '#AB47BC', letterSpacing: '6px', marginBottom: '20px' }}>IMAGE CARD</p>
                <Sparkles size={50} color="#AB47BC" />
                <div style={{ marginTop: '25px', width: '50px', height: '2px', background: '#AB47BC', opacity: 0.4 }} />
                <div style={{ marginTop: '60px' }}>
                   <span style={{ background: '#AB47BC', color: 'white', padding: '6px 15px', borderRadius: '100px', fontSize: '12px', fontWeight: 900 }}>답변완료/턴</span>
                </div>
              </div>

              <div className="card-face card-back" style={{ border: '3px solid #AB47BC', background: 'white', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '100%', height: '65%', position: 'relative', background: '#F9F5FF' }}>
                  {isImageLoading && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles className="animate-pulse" color="#AB47BC" size={32} /></div>}
                  <img 
                    src={currentQuestion?.image} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isImageLoading ? 0 : 1, transition: 'opacity 0.3s' }} 
                    onLoad={() => setIsImageLoading(false)} 
                    alt="game card"
                  />
                </div>
                <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'white' }}>
                  <p style={{ fontSize: '14px', fontWeight: 900, color: '#2D1F08', lineHeight: 1.4, wordBreak: 'keep-all', marginBottom: '10px' }}>{currentQuestion?.question}</p>
                  {isMyTurn && (
                    <button 
                      className="game-btn-press"
                      onClick={(e) => { e.stopPropagation(); passTurn(); }}
                      style={{ padding: '6px 18px', borderRadius: '100px', background: '#AB47BC', color: 'white', fontSize: '12px', fontWeight: 900, border: 'none' }}
                    >
                      답변완료/턴
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <button 
            disabled={!isMyTurn || isImageLoading} 
            onClick={() => drawNewCard()} 
            className="game-btn-press"
            style={{ 
              width: '100%', 
              maxWidth: '280px', 
              padding: '18px', 
              borderRadius: '22px', 
              background: (isMyTurn && !isImageLoading) ? '#AB47BC' : '#E5E7EB', 
              color: (isMyTurn && !isImageLoading) ? 'white' : '#9CA3AF', 
              fontWeight: 900, 
              border: 'none',
              boxShadow: isMyTurn ? '0 10px 20px rgba(171, 71, 188, 0.2)' : 'none' 
            }}
          >
            {isMyTurn ? "다른 이미지 뽑기" : "배우자의 답변 차례입니다"}
          </button>
        </div>
      ) : (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
           {!isSharing ? (
             <>
               <div style={{ background: '#F9F5FF', padding: '18px', borderRadius: '22px', marginBottom: '15px', textAlign: 'center', border: '1px solid rgba(171, 71, 188, 0.1)' }}>
                 <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#2D1F08', marginBottom: '5px' }}>"{mainQuestion}"</h3>
                 <p style={{ fontSize: '12px', color: '#8E24AA', fontWeight: 800 }}>어울리는 사진 2장을 선택해 주세요.</p>
               </div>
               
               <div style={{ 
                 display: 'grid', 
                 gridTemplateColumns: 'repeat(2, 1fr)', 
                 gap: '12px', 
                 marginBottom: '20px',
                 maxHeight: '400px',
                 overflowY: 'auto',
                 padding: '5px'
               }}>
                 {imagePool.map((card, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => { if(!isMyTurn) return; setSelectedIndices(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : (prev.length < 2 ? [...prev, idx] : [prev[1], idx])); }} 
                      style={{ 
                        position: 'relative', 
                        height: '130px', 
                        borderRadius: '16px', 
                        overflow: 'hidden', 
                        cursor: 'pointer',
                        border: selectedIndices.includes(idx) ? '4px solid #AB47BC' : '2px solid transparent',
                        boxShadow: selectedIndices.includes(idx) ? '0 4px 15px rgba(171, 71, 188, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)'
                      }}
                    >
                      <img src={card.image} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: selectedIndices.includes(idx) ? 0.6 : 1 }} loading="lazy" />
                      {selectedIndices.includes(idx) && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(171, 71, 188, 0.2)' }}>
                          <div style={{ background: '#AB47BC', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px', border: '2px solid white' }}>
                            {selectedIndices.indexOf(idx) + 1}
                          </div>
                        </div>
                      )}
                    </div>
                 ))}
               </div>
               
                <div style={{ display: 'flex', gap: '10px', width: '100%', marginBottom: '20px' }}>
                  <button onClick={() => initPick2Mode()} disabled={!isMyTurn} className="game-btn-press" style={{ flex: 1, padding: '16px', borderRadius: '18px', background: 'white', border: '2px solid #AB47BC', color: '#AB47BC', fontWeight: 900, fontSize: '14px' }}>다시 뽑기</button>
                  <button 
                    onClick={() => { setSharedCards(selectedIndices.map(i => imagePool[i])); setIsSharing(true); setSessionCardCount(prev => prev + 1); if (sessionCardCount+1 >= 10) setShowFinishModal(true); }} 
                    disabled={!isMyTurn || selectedIndices.length < 2} 
                    className="game-btn-press"
                    style={{ 
                      flex: 2, 
                      padding: '16px', 
                      borderRadius: '18px', 
                      background: '#AB47BC', 
                      color: 'white', 
                      fontWeight: 900, 
                      fontSize: '15px',
                      opacity: selectedIndices.length === 2 ? 1 : 0.4,
                      boxShadow: selectedIndices.length === 2 ? '0 8px 20px rgba(171, 71, 188, 0.3)' : 'none'
                    }}
                  >
                    이미지 보여주기
                  </button>
                </div>
             </>
           ) : (
             <div style={{ textAlign: 'center', paddingBottom: '30px' }}>
               <div style={{ background: '#FDFCF0', padding: '30px 20px', borderRadius: '30px', border: '2px solid #F3E5F5', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                 <p style={{ fontSize: '13px', color: '#888', fontWeight: 700, marginBottom: '10px' }}>질문</p>
                 <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08', marginBottom: '20px' }}>"{mainQuestion}"</h3>
                 <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '25px 0' }}>
                   {sharedCards.map((card, idx) => (
                     <div key={idx} style={{ width: '130px', height: '170px', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', border: '3px solid white' }}>
                       <img src={card.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     </div>
                   ))}
                 </div>
                 <p style={{ fontSize: '15px', fontWeight: 800, color: '#AB47BC', marginTop: '15px' }}>이미지를 선택한 이유를 설명해 보세요. 😊</p>
               </div>
               <button 
                 onClick={() => { setIsSharing(false); initPick2Mode(); }} 
                 disabled={!isMyTurn} 
                 className="game-btn-press"
                 style={{ marginTop: '25px', width: '100%', maxWidth: '280px', padding: '18px', borderRadius: '22px', background: '#2D1F08', color: 'white', fontWeight: 900, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}
               >
                 새 대화 시작하기
               </button>
             </div>
           )}
        </div>
      )}
      <p style={{ marginTop: '20px', fontSize: '11px', color: '#999', fontWeight: 700, opacity: 0.6 }}>* 화면을 위아래로 스크롤할 수 있습니다.</p>
    </div>
  );
};

export default React.memo(ImageCardGameView);
