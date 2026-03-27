import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Game UI scroll padding and sync fix applied - 2026-03-27
import { ChevronLeft, Sparkles, RefreshCw } from 'lucide-react';
import { IMAGE_CARD_DATA } from '../../data/imageCards';

const ImageCardGameView = ({ onBack, coupleCode, userRole, mainChannel, husbandInfo, wifeInfo }) => {
  const [gameMode, setGameMode] = useState('classic'); 
  const [category, setCategory] = useState('전체');
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    // Pick a random initial card to avoid duplicates on every fresh mount
    const randomIndex = Math.floor(Math.random() * IMAGE_CARD_DATA.length);
    return IMAGE_CARD_DATA[randomIndex];
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

  // History logic - Larger threshold to prevent early repeats
  const [history, setHistory] = useState([]);
  
  const isMyTurn = turnOwner === userRole || !turnOwner;
  const partnerNickname = userRole === 'husband' ? (wifeInfo?.nickname || '아내') : (husbandInfo?.nickname || '남편');

  const broadcastRef = useRef(null);

  // Preload logic
  useEffect(() => {
    IMAGE_CARD_DATA.slice(0, 5).forEach(item => {
      const img = new Image();
      img.src = item.image;
    });
  }, []);

  useEffect(() => {
    if (!mainChannel) return;
    broadcastRef.current = mainChannel;
    
    const sub = mainChannel.on('broadcast', { event: 'image-game-update' }, ({ payload }) => {
      if (payload.sender === userRole) return;
      
      if (payload.gameMode) setGameMode(payload.gameMode);
      if (payload.isFlipped !== undefined) setIsFlipped(payload.isFlipped);
      if (payload.turnOwner !== undefined) setTurnOwner(payload.turnOwner);
      if (payload.isSharing !== undefined) setIsSharing(payload.isSharing);
      if (payload.sharedCards) setSharedCards(payload.sharedCards);
      if (payload.mainQuestion) setMainQuestion(payload.mainQuestion);
      if (payload.imagePool) setImagePool(payload.imagePool);
      
      if (payload.questionId) {
        const q = IMAGE_CARD_DATA.find(item => String(item.id) === String(payload.questionId));
        if (q) {
           setIsImageLoading(true);
           setCurrentQuestion(q);
        }
      }
    });

    return () => mainChannel.off('broadcast', { event: 'image-game-update' });
  }, [mainChannel, userRole]);

  const sendBroadcast = useCallback((updates) => {
    if (broadcastRef.current) {
      broadcastRef.current.send({
        type: 'broadcast',
        event: 'image-game-update',
        payload: { ...updates, sender: userRole, ts: Date.now() }
      });
    }
  }, [userRole]);

  const drawNewCard = useCallback(() => {
    if (isImageLoading) return;
    
    const pool = IMAGE_CARD_DATA;
    const available = pool.filter(q => !history.includes(q.id));
    let finalPool = available.length > 0 ? available : pool;

    const nextQ = finalPool[Math.floor(Math.random() * finalPool.length)];

    if (nextQ) {
      setIsFlipped(false);
      
      if (currentQuestion && nextQ.id === currentQuestion.id) {
        setIsImageLoading(false);
      } else {
        setIsImageLoading(true);
      }

      setTurnOwner(userRole); 
      setHistory(prev => [...prev, nextQ.id].slice(-30)); // Keep history of recent 30 cards
      setCurrentQuestion(nextQ);
      
      sendBroadcast({ 
        questionId: nextQ.id,
        sender: userRole, 
        isFlipped: false, 
        turnOwner: userRole, 
        category: '전체'
      });
      
      const nextCount = sessionCardCount + 1;
      setSessionCardCount(nextCount);
      if (nextCount === 10) setShowFinishModal(true);
    }
  }, [history, sessionCardCount, userRole, sendBroadcast, isImageLoading, currentQuestion]);

  const initPick2Mode = useCallback(() => {
    const shuffled = [...IMAGE_CARD_DATA].sort(() => Math.random() - 0.5);
    const pool = shuffled.slice(0, 10);
    const qPool = [
      "최근 당신의 부부 생활을 가장 잘 나타내는 이미지는?",
      "우리의 미래가 어떤 모습이길 소망하시나요?",
      "오늘 당신의 마음 상태를 두 장의 카드로 표현한다면?",
      "주님이 우리 가정을 어떻게 보고 계실까요?",
      "우리가 서로에게 어떤 축복의 존재가 되고 싶나요?",
      "요즘 당신이 가정에서 가장 위로를 받는 지점은?"
    ];
    const q = qPool[Math.floor(Math.random() * qPool.length)];

    setImagePool(pool);
    setMainQuestion(q);
    setSelectedIndices([]);
    setIsSharing(false);
    setTurnOwner(userRole);

    sendBroadcast({
      gameMode: 'pick2',
      mainQuestion: q,
      imagePool: pool,
      isSharing: false,
      turnOwner: userRole
    });
  }, [userRole, sendBroadcast]);

  const selectImage = (idx) => {
    if (isSharing || !isMyTurn) return;
    setSelectedIndices(prev => {
      if (prev.includes(idx)) return prev.filter(i => i !== idx);
      if (prev.length < 2) return [...prev, idx];
      return [prev[1], idx];
    });
  };

  const sharePick2 = () => {
    if (selectedIndices.length !== 2) return alert("이미지 2장을 선택해 주세요!");
    const cards = selectedIndices.map(i => imagePool[i]);
    setSharedCards(cards);
    setIsSharing(true);
    sendBroadcast({ isSharing: true, sharedCards: cards, turnOwner: userRole });

    const nextCount = sessionCardCount + 1;
    setSessionCardCount(nextCount);
    if (nextCount === 10) setShowFinishModal(true);
  };

  const resetPick2 = () => {
    if (!isMyTurn && isSharing) { setTurnOwner(userRole); initPick2Mode(); return; }
    if (!isMyTurn) return alert("상대방의 턴입니다!");
    initPick2Mode();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="flex flex-col items-center p-4 bg-white" 
      style={{ minHeight: '100%', paddingBottom: '200px' }} // Increased padding for button access
    >
      <AnimatePresence>
        {showFinishModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              style={{ background: 'white', borderRadius: '35px', width: '100%', maxWidth: '340px', padding: '45px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}
            >
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(171, 71, 188, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
                <Sparkles size={45} color="#AB47BC" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#2D1F08', marginBottom: '15px' }}>열 번째 하트싱크 완료!</h3>
              <p style={{ fontSize: '15.5px', color: '#8B7355', fontWeight: 600, lineHeight: 1.6, wordBreak: 'keep-all', marginBottom: '35px' }}>
                오늘 이미지를 통해 나눈 감성이<br/>
                서로를 더 깊게 이어주었나요? ✨<br/>
                이제 대화를 마무리하고 함께<br/>
                달콤한 휴식을 취해볼까요?
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                <button 
                  onClick={onBack}
                  style={{ width: '100%', padding: '20px', borderRadius: '22px', background: '#AB47BC', color: 'white', fontWeight: 900, fontSize: '17px', border: 'none' }}
                >
                  오늘의 대화 마무리하기
                </button>
                <button 
                  onClick={() => {
                    setShowFinishModal(false);
                    setSessionCardCount(11);
                  }}
                  style={{ width: '100%', padding: '15px', borderRadius: '20px', background: 'none', color: '#9C27B0', fontWeight: 800, fontSize: '14px', border: 'none' }}
                >
                  조금 더 대화할래요
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <ChevronLeft size={24} color="#AB47BC" strokeWidth={3} />
          <span style={{ fontWeight: 900, color: '#AB47BC', fontSize: '14px' }}>홈으로</span>
        </button>
        <div style={{ display: 'flex', background: '#F3E5F5', borderRadius: '15px', padding: '3px', border: '1px solid rgba(171, 71, 188, 0.1)' }}>
          {['classic', 'pick2'].map((m, i) => (
            <button 
              key={m}
              onClick={() => { setGameMode(m); if(m === 'pick2' && imagePool.length === 0) initPick2Mode(); sendBroadcast({ gameMode: m }); }}
              style={{ 
                padding: '8px 18px', borderRadius: '12px', border: 'none', fontSize: '13px', fontWeight: 900,
                background: gameMode === m ? 'white' : 'transparent',
                color: gameMode === m ? '#AB47BC' : '#9c27b0',
                boxShadow: gameMode === m ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              방식 {i+1}
            </button>
          ))}
        </div>
      </header>
      
      <div style={{ width: '100%', padding: '14px', borderRadius: '20px', background: isMyTurn ? 'rgba(171, 71, 188, 0.08)' : '#F3E5F5', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: isMyTurn ? '1.5px solid rgba(171, 71, 188, 0.3)' : '1px solid #EEE', transition: 'all 0.3s' }}>
        {isMyTurn ? <Sparkles size={18} color="#AB47BC" className="animate-pulse" /> : <RefreshCw size={16} color="#9C27B0" className="animate-spin-slow" />}
        <span style={{ fontSize: '13.5px', fontWeight: 900, color: isMyTurn ? '#AB47BC' : '#9C27B0' }}>{isMyTurn ? "당신의 턴입니다. 마음을 나눠주세요!" : `${partnerNickname}님이 준비 중입니다...`}</span>
      </div>

      {gameMode === 'classic' ? (
        <>
          <div style={{ width: '100%', textAlign: 'center', marginBottom: '30px', padding: '16px', background: 'rgba(171, 71, 188, 0.05)', borderRadius: '25px', border: '1px solid rgba(171, 71, 188, 0.1)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)' }}>
             <p style={{ margin: 0, fontSize: '15px', color: '#AB47BC', fontWeight: 900, letterSpacing: '-0.5px' }}>하트싱크 - 이미지 대화</p>
             <p style={{ margin: 0, fontSize: '11px', color: '#AB47BC', opacity: 0.6, fontWeight: 700, marginTop: '4px' }}>그림을 통해 서로의 진심을 나눠보세요</p>
          </div>

          <div style={{ perspective: '1500px', width: '310px', height: '440px', marginBottom: '30px' }}>
            <motion.div
               animate={{ rotateY: isFlipped ? 180 : 0 }} 
               transition={{ type: 'spring', damping: 20, stiffness: 100 }}
               onClick={() => { if (!isMyTurn) return; setIsFlipped(!isFlipped); setTurnOwner(userRole); sendBroadcast({ isFlipped: !isFlipped, turnOwner: userRole }); }}
               style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', cursor: 'pointer' }}
            >
              {/* Back side of card */}
              <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', background: 'linear-gradient(135deg, #2D1F08, #000000)', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}>
                <p style={{ fontSize: '12px', fontWeight: 800, color: '#D4AF37', marginBottom: '10px', letterSpacing: '4px', opacity: 0.8 }}>HEART SYNC</p>
                <div style={{ width: '60px', height: '1px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', marginBottom: '15px' }} />
                <Sparkles size={40} color="#D4AF37" />
              </div>

              {/* Front side of card */}
              <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'white', borderRadius: '32px', border: '2px solid #AB47BC', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 15px 35px rgba(171, 71, 188, 0.15)' }}>
                <div style={{ width: '100%', height: '65%', position: 'relative', background: '#F9F5FF' }}>
                  {isImageLoading && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, background: '#F9F5FF' }}>
                      <RefreshCw className="animate-spin" color="#AB47BC" size={32} />
                    </div>
                  )}
                  <img 
                    key={`${currentQuestion?.id}-${sessionCardCount}`}
                    src={currentQuestion?.image} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onLoad={() => setIsImageLoading(false)}
                    onError={e => { e.target.src="https://via.placeholder.com/310x440?text=Image+Load+Error"; setIsImageLoading(false); }}
                    loading="eager"
                    decoding="async"
                  />
                  <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', color: 'white', padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 900 }}>{currentQuestion?.category}</div>
                </div>
                <div style={{ padding: '25px 20px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <p style={{ fontSize: '16.5px', fontWeight: 900, color: '#2D1F08', lineHeight: 1.6, wordBreak: 'keep-all' }}>{currentQuestion?.question}</p>
                </div>
              </div>
            </motion.div>
          </div>

          <button 
            disabled={!isMyTurn || isImageLoading}
            onClick={() => drawNewCard()}
            style={{ 
              width: '100%', 
              maxWidth: '310px', 
              padding: '20px', 
              borderRadius: '22px', 
              background: (isMyTurn && !isImageLoading) ? '#AB47BC' : '#CCC', 
              color: 'white', 
              fontWeight: 900, 
              border: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '12px', 
              transition: 'all 0.3s', 
              boxShadow: (isMyTurn && !isImageLoading) ? '0 10px 25px rgba(171, 71, 188, 0.3)' : 'none',
              opacity: isImageLoading ? 0.7 : 1
            }}
          >
            <RefreshCw size={20} className={isImageLoading ? 'animate-spin' : ''} /> 
            {isImageLoading ? '질문 생성 중...' : '다른 이미지 뽑기'}
          </button>
        </>
      ) : (
        <div style={{ width: '100%', maxWidth: '360px' }}>
           {!isSharing ? (
             <>
               <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ background: '#F9F5FF', padding: '28px', borderRadius: '28px', marginBottom: '25px', textAlign: 'center', border: '1.5px solid rgba(171, 71, 188, 0.1)' }}>
                 <p style={{ fontSize: '13px', color: '#AB47BC', fontWeight: 900, marginBottom: '12px', letterSpacing: '1px' }}>SYNC QUESTION</p>
                 <h3 style={{ fontSize: '19px', fontWeight: 900, color: '#2D1F08', lineHeight: 1.5 }}>"{mainQuestion}"</h3>
                 <p style={{ fontSize: '12.5px', color: '#9c27b0', marginTop: '15px', fontWeight: 700, opacity: 0.8 }}>질문에 어울리는 이미지 2장을 선택하세요.</p>
               </motion.div>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '30px' }}>
                 {imagePool.map((card, idx) => (
                    <ImageThumb key={idx} card={card} isSelected={selectedIndices.includes(idx)} order={selectedIndices.indexOf(idx) + 1} onClick={() => selectImage(idx)} />
                 ))}
               </div>
                <div style={{ position: 'fixed', bottom: '110px', left: '20px', right: '20px', display: 'flex', gap: '12px', zIndex: 100, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(15px)', padding: '15px', borderRadius: '30px', boxShadow: '0 15px 40px rgba(0,0,0,0.1)', border: '1px solid rgba(171, 71, 188, 0.1)' }}>
                  <button onClick={resetPick2} disabled={!isMyTurn} style={{ flex: 1, padding: '18px', borderRadius: '20px', background: 'white', border: '2px solid #AB47BC', color: '#AB47BC', fontWeight: 900, fontSize: '15px' }}>다시 뽑기</button>
                  <button onClick={sharePick2} disabled={!isMyTurn || selectedIndices.length < 2} style={{ flex: 2, padding: '18px', borderRadius: '20px', background: '#AB47BC', color: 'white', fontWeight: 900, fontSize: '15px', opacity: selectedIndices.length === 2 ? 1 : 0.5, boxShadow: '0 8px 20px rgba(171, 71, 188, 0.3)' }}>상대방에게 보여주기</button>
                </div>
             </>
           ) : (
             <div className="text-center">
               <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#FDFCF0', padding: '35px 25px', borderRadius: '35px', boxShadow: '0 25px 60px rgba(0,0,0,0.12)', border: '2px solid #F9F5FF' }}>
                 <p style={{ fontSize: '13px', color: '#AB47BC', fontWeight: 900, marginBottom: '20px', letterSpacing: '2px' }}>SYCHRONIZED MIND</p>
                 <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08', marginBottom: '30px', lineHeight: 1.5 }}>{mainQuestion}</h3>
                 <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '35px' }}>
                   {sharedCards.map((card, idx) => (
                     <motion.div key={idx} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }} style={{ width: '140px', borderRadius: '22px', overflow: 'hidden', boxShadow: '0 12px 25px rgba(0,0,0,0.15)', border: '1.5px solid white' }}>
                       <img src={card.image} style={{ width: '100%', height: '180px', objectFit: 'cover' }} loading="eager" />
                       <div style={{ padding: '10px', background: 'white', fontSize: '11px', fontWeight: 900, color: '#AB47BC', textAlign: 'center' }}>#{card.category}</div>
                     </motion.div>
                   ))}
                 </div>
                 <div style={{ padding: '22px', background: 'rgba(171, 71, 188, 0.05)', borderRadius: '22px', border: '1.5px dashed rgba(171, 71, 188, 0.3)' }}>
                   <p style={{ fontSize: '14px', color: '#2D1F08', fontWeight: 800, lineHeight: 1.6, wordBreak: 'keep-all' }}>{turnOwner === userRole ? "이미지를 선택한 이유를 설명해 주세요. 🙂" : "배우자의 설명을 들으며 공감해 보세요. 💬"}</p>
                 </div>
               </motion.div>
               <button onClick={resetPick2} disabled={!isMyTurn} style={{ marginTop: '35px', width: '100%', padding: '20px', borderRadius: '22px', background: '#AB47BC', color: 'white', fontWeight: 900, border: 'none', boxShadow: '0 10px 25px rgba(171, 71, 188, 0.25)' }}>새로운 이미지 대화 시작하기</button>
             </div>
           )}
        </div>
      )}
    </motion.div>
  );
};

const ImageThumb = React.memo(({ card, isSelected, order, onClick }) => (
  <motion.div 
    whileTap={{ scale: 0.96 }}
    onClick={onClick} 
    style={{ position: 'relative', height: '160px', borderRadius: '22px', overflow: 'hidden', border: isSelected ? '4px solid #AB47BC' : '2px solid #F0F0F0', cursor: 'pointer', transition: 'all 0.2s', boxShadow: isSelected ? '0 8px 20px rgba(171, 71, 188, 0.3)' : '0 4px 12px rgba(0,0,0,0.05)' }}
  >
    <img src={card.image} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isSelected ? 0.9 : 1 }} loading="lazy" />
    {isSelected && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'absolute', inset: 0, background: 'rgba(171, 71, 188, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#AB47BC', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>{order}</div>
      </motion.div>
    )}
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', fontSize: '10px', fontWeight: 900, color: '#AB47BC', textAlign: 'center' }}>#{card.category}</div>
  </motion.div>
));

export default React.memo(ImageCardGameView);
