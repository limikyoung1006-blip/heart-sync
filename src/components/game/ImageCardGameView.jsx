import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ChevronLeft, Sparkles, RefreshCw } from 'lucide-react';
import { IMAGE_CARD_DATA } from '../../data/imageCards';

const ImageCardGameView = ({ onBack, coupleCode, userRole, mainChannel, husbandInfo, wifeInfo }) => {
  const [gameMode, setGameMode] = useState('classic'); 
  const [category, setCategory] = useState('전체');
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(() => {
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
  const [history, setHistory] = useState([]);
  
  const isMyTurn = turnOwner === userRole || !turnOwner;
  const partnerNickname = userRole === 'husband' ? (wifeInfo?.nickname || '아내') : (husbandInfo?.nickname || '남편');
  const broadcastRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      setImagePool([]);
      setSharedCards([]);
      setCurrentQuestion(null);
    };
  }, []);

  useEffect(() => {
    if (!mainChannel) return;
    broadcastRef.current = mainChannel;
    const sub = mainChannel.on('broadcast', { event: 'image-game-update' }, ({ payload }) => {
      if (!isMounted.current || !broadcastRef.current || payload.sender === userRole) return;
      if (payload.gameMode) setGameMode(payload.gameMode);
      if (payload.isFlipped !== undefined) setIsFlipped(payload.isFlipped);
      if (payload.turnOwner !== undefined) setTurnOwner(payload.turnOwner);
      if (payload.isSharing !== undefined) setIsSharing(payload.isSharing);
      if (payload.sharedCards) setSharedCards(payload.sharedCards);
      if (payload.mainQuestion) setMainQuestion(payload.mainQuestion);
      if (payload.imagePool) setImagePool(payload.imagePool);
      if (payload.questionId) {
        const q = IMAGE_CARD_DATA.find(item => String(item.id) === String(payload.questionId));
        if (q) { setIsImageLoading(true); setCurrentQuestion(q); }
      }
    });
    return () => {
      broadcastRef.current = null;
      if (mainChannel) mainChannel.off('broadcast', { event: 'image-game-update' });
    };
  }, [mainChannel, userRole]);

  const sendBroadcast = useCallback((updates) => {
    if (broadcastRef.current) {
      broadcastRef.current.send({ type: 'broadcast', event: 'image-game-update', payload: { ...updates, sender: userRole, ts: Date.now() } });
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
      setIsImageLoading(currentQuestion && nextQ.id === currentQuestion.id ? false : true);
      setTurnOwner(userRole); 
      setHistory(prev => [...prev, nextQ.id].slice(-30));
      setCurrentQuestion(nextQ);
      sendBroadcast({ questionId: nextQ.id, isFlipped: false, turnOwner: userRole, category: '전체' });
      const nextCount = sessionCardCount + 1;
      setSessionCardCount(nextCount);
      if (nextCount === 10) setShowFinishModal(true);
    }
  }, [history, sessionCardCount, userRole, sendBroadcast, isImageLoading, currentQuestion]);

  const initPick2Mode = useCallback(() => {
    const shuffled = [...IMAGE_CARD_DATA].sort(() => Math.random() - 0.5);
    const pool = shuffled.slice(0, 10);
    const qPool = ["부부 생활을 잘 나타내는 이미지는?", "우리의 미래 소망 모습은?", "오늘 내 마음 상태는?", "서로에게 어떤 축복이 되고 싶나요?"];
    const q = qPool[Math.floor(Math.random() * qPool.length)];
    setImagePool(pool); setMainQuestion(q); setSelectedIndices([]); setIsSharing(false); setTurnOwner(userRole);
    sendBroadcast({ gameMode: 'pick2', mainQuestion: q, imagePool: pool, isSharing: false, turnOwner: userRole });
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
    if (selectedIndices.length !== 2) return;
    const cards = selectedIndices.map(i => imagePool[i]);
    setSharedCards(cards); setIsSharing(true);
    sendBroadcast({ isSharing: true, sharedCards: cards, turnOwner: userRole });
    const nextCount = sessionCardCount + 1;
    setSessionCardCount(nextCount);
    if (nextCount === 10) setShowFinishModal(true);
  };

  const resetPick2 = () => { if (!isMyTurn && isSharing) { setTurnOwner(userRole); initPick2Mode(); return; } if (!isMyTurn) return; initPick2Mode(); };

  return (
    <div className="flex flex-col items-center p-4 bg-white" style={{ width: '100%', minHeight: '100%', paddingBottom: '200px' }}>
      {showFinishModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '35px', width: '100%', maxWidth: '340px', padding: '45px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(171, 71, 188, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}><Sparkles size={45} color="#AB47BC" /></div>
            <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#2D1F08', marginBottom: '15px' }}>열 번째 하트싱크 완료!</h3>
            <p style={{ fontSize: '15.5px', color: '#8B7355', fontWeight: 600, lineHeight: 1.6, marginBottom: '35px' }}>오늘의 이미지가 서로를 깊게<br/>이어주었나요? ✨</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
              <button onClick={onBack} style={{ width: '100%', padding: '20px', borderRadius: '22px', background: '#AB47BC', color: 'white', fontWeight: 900, fontSize: '17px', border: 'none' }}>대화 선택으로 돌아가기</button>
              <button onClick={() => { setShowFinishModal(false); setSessionCardCount(11); }} style={{ width: '100%', padding: '15px', borderRadius: '20px', background: 'none', color: '#9C27B0', fontWeight: 800, fontSize: '14px', border: 'none' }}>대화 더 할래요</button>
            </div>
          </div>
        </div>
      )}

      <header style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><ChevronLeft size={24} color="#AB47BC" strokeWidth={3} /><span style={{ fontWeight: 900, color: '#AB47BC', fontSize: '14px' }}>돌아가기</span></button>
        <div style={{ display: 'flex', background: '#F3E5F5', borderRadius: '15px', padding: '3px', border: '1px solid rgba(171, 71, 188, 0.1)' }}>
          {['classic', 'pick2'].map((m, i) => (<button key={m} onClick={() => { setGameMode(m); if(m === 'pick2' && imagePool.length === 0) initPick2Mode(); sendBroadcast({ gameMode: m }); }} style={{ padding: '8px 18px', borderRadius: '12px', border: 'none', fontSize: '13px', fontWeight: 900, background: gameMode === m ? 'white' : 'transparent', color: gameMode === m ? '#AB47BC' : '#9c27b0' }}>방식 {i+1}</button>))}
        </div>
      </header>
      
      <div style={{ width: '100%', padding: '14px', borderRadius: '20px', background: isMyTurn ? 'rgba(171, 71, 188, 0.08)' : '#F3E5F5', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: isMyTurn ? '1.5px solid rgba(171, 71, 188, 0.3)' : '1px solid #EEE' }}>
        {isMyTurn ? <Sparkles size={18} color="#AB47BC" /> : <RefreshCw size={16} color="#9C27B0" className="animate-spin-slow" />}
        <span style={{ fontSize: '13.5px', fontWeight: 900, color: isMyTurn ? '#AB47BC' : '#9C27B0' }}>{isMyTurn ? "마음을 나눠주세요!" : "상대방이 준비 중입니다..."}</span>
      </div>

      {gameMode === 'classic' ? (
        <>
          <div style={{ width: '100%', textAlign: 'center', marginBottom: '30px', padding: '16px', background: 'rgba(171, 71, 188, 0.05)', borderRadius: '25px', border: '1px solid rgba(171, 71, 188, 0.1)' }}>
             <p style={{ margin: 0, fontSize: '15px', color: '#AB47BC', fontWeight: 900 }}>이미지 대화</p>
             <p style={{ margin: 0, fontSize: '11px', color: '#AB47BC', opacity: 0.6, fontWeight: 700, marginTop: '4px' }}>그림을 통해 서로의 진심을 나눠보세요</p>
          </div>
          <div style={{ width: '310px', height: '440px', marginBottom: '30px' }}>
            <div onClick={() => { if (!isMyTurn) return; setIsFlipped(!isFlipped); setTurnOwner(userRole); sendBroadcast({ isFlipped: !isFlipped, turnOwner: userRole }); }} style={{ width: '100%', height: '100%', position: 'relative', cursor: 'pointer' }}>
               {!isFlipped ? (
                 <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #2D1F08, #000000)', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}>
                    <p style={{ fontSize: '12px', fontWeight: 800, color: '#D4AF37', letterSpacing: '4px' }}>HEART SYNC</p>
                    <Sparkles size={40} color="#D4AF37" />
                 </div>
               ) : (
                 <div style={{ position: 'absolute', inset: 0, background: 'white', borderRadius: '32px', border: '2px solid #AB47BC', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ width: '100%', height: '65%', position: 'relative' }}>
                      {isImageLoading && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9F5FF' }}><RefreshCw className="animate-spin" color="#AB47BC" size={32} /></div>}
                      <img src={currentQuestion?.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onLoad={() => setIsImageLoading(false)} />
                    </div>
                    <div style={{ padding: '25px 20px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                      <p style={{ fontSize: '16.5px', fontWeight: 900, color: '#2D1F08', lineHeight: 1.6 }}>{currentQuestion?.question}</p>
                    </div>
                 </div>
               )}
            </div>
          </div>
          <button disabled={!isMyTurn || isImageLoading} onClick={() => drawNewCard()} style={{ width: '100%', maxWidth: '310px', padding: '20px', borderRadius: '22px', background: (isMyTurn && !isImageLoading) ? '#AB47BC' : '#CCC', color: 'white', fontWeight: 900, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <RefreshCw size={20} className={isImageLoading ? 'animate-spin' : ''} /> {isImageLoading ? '질문 생성 중...' : '다른 이미지 뽑기'}
          </button>
        </>
      ) : (
        <div style={{ width: '100%', maxWidth: '360px' }}>
           {!isSharing ? (
             <>
               <div style={{ background: '#F9F5FF', padding: '28px', borderRadius: '28px', marginBottom: '25px', textAlign: 'center' }}>
                 <p style={{ fontSize: '13px', color: '#AB47BC', fontWeight: 900, marginBottom: '12px' }}>SYNC QUESTION</p>
                 <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08' }}>"{mainQuestion}"</h3>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '30px' }}>
                 {imagePool.map((card, idx) => (
                    <div key={idx} onClick={() => selectImage(idx)} style={{ position: 'relative', height: '160px', borderRadius: '22px', overflow: 'hidden', border: selectedIndices.includes(idx) ? '4px solid #AB47BC' : '2px solid #F0F0F0' }}>
                      <img src={card.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {selectedIndices.includes(idx) && <div style={{ position: 'absolute', inset: 0, background: 'rgba(171, 71, 188, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ background: '#AB47BC', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{selectedIndices.indexOf(idx) + 1}</div></div>}
                    </div>
                 ))}
               </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={resetPick2} disabled={!isMyTurn} style={{ flex: 1, padding: '18px', borderRadius: '20px', background: 'white', border: '2px solid #AB47BC', color: '#AB47BC', fontWeight: 900 }}>다시 뽑기</button>
                  <button onClick={sharePick2} disabled={!isMyTurn || selectedIndices.length < 2} style={{ flex: 2, padding: '18px', borderRadius: '20px', background: '#AB47BC', color: 'white', fontWeight: 900, opacity: selectedIndices.length === 2 ? 1 : 0.5 }}>보여주기</button>
                </div>
             </>
           ) : (
             <div className="text-center">
               <div style={{ background: '#FDFCF0', padding: '35px 25px', borderRadius: '35px', boxShadow: '0 25px 60px rgba(0,0,0,0.1)' }}>
                 <p style={{ fontSize: '13px', color: '#AB47BC', fontWeight: 900 }}>SYCHRONIZED MIND</p>
                 <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '30px' }}>{mainQuestion}</h3>
                 <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '35px' }}>
                   {sharedCards.map((card, idx) => (
                     <div key={idx} style={{ width: '120px', borderRadius: '22px', overflow: 'hidden' }}>
                       <img src={card.image} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                     </div>
                   ))}
                 </div>
                 <p style={{ fontSize: '14px', fontWeight: 800 }}>{turnOwner === userRole ? "선택 이유를 설명해 주세요. 🙂" : "상대방의 설명을 들어보세요. 💬"}</p>
               </div>
               <button onClick={resetPick2} disabled={!isMyTurn} style={{ marginTop: '35px', width: '100%', padding: '20px', borderRadius: '22px', background: '#AB47BC', color: 'white', fontWeight: 900 }}>새 대화 시작</button>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default React.memo(ImageCardGameView);
