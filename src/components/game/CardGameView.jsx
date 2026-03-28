import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '../../supabase';
import { CARD_DATA } from '../../data/dialogueCards';

const CardGameView = ({ onBack, coupleCode, userRole, husbandInfo, wifeInfo, onUpdateMemo, mainChannel }) => {
  const [category, setCategory] = useState('일상');
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [waiterRole, setWaiterRole] = useState(null);
  const [turnOwner, setTurnOwner] = useState(null);
  const [sessionCardCount, setSessionCardCount] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);
  
  // History logic to avoid immediate duplicates
  const [history, setHistory] = useState([]);

  const filteredQuestions = useMemo(() => CARD_DATA.filter(q => q.category === category), [category]);
  const broadcastRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // 🧹 Memory Cleanup
      setCurrentQuestion(null);
      setHistory([]);
    };
  }, []);

  useEffect(() => {
    if (!mainChannel) return;
    broadcastRef.current = mainChannel;
    
    const sub = mainChannel.on('broadcast', { event: 'game-update' }, ({ payload }) => {
      // guard against unmounted state
      if (!isMounted.current || !broadcastRef.current || payload.sender === userRole) return;
      
      if (payload.category) setCategory(payload.category);
      if (payload.isFlipped !== undefined) setIsFlipped(payload.isFlipped);
      if (payload.isWaiting !== undefined) setIsWaiting(payload.isWaiting);
      if (payload.waiterRole !== undefined) setWaiterRole(payload.waiterRole);
      if (payload.turnOwner !== undefined) setTurnOwner(payload.turnOwner);
      if (payload.questionId) {
        const q = CARD_DATA.find(item => String(item.id) === String(payload.questionId));
        if (q) setCurrentQuestion(q);
      }
    });

    return () => {
      broadcastRef.current = null;
      if (mainChannel) {
        mainChannel.off('broadcast', { event: 'game-update' });
      }
    };
  }, [mainChannel, userRole]);

  // Removded redundant postgres_changes listener - now relying on ultra-fast broadcast for real-time sync

  useEffect(() => {
    const fetchDB = async () => {
      try {
        const { data } = await supabase.from('card_game_state').select('*').eq('couple_id', coupleCode).single();
        if (isMounted.current && data) {
          setCategory(data.category || '일상');
          setIsFlipped(data.is_flipped || false);
          setIsWaiting(data.is_waiting || false);
          setWaiterRole(data.waiter_role || null);
          setTurnOwner(data.turn_owner || null);
          
          const q = CARD_DATA.find(item => String(item.id) === String(data.current_question_id));
          if (q) setCurrentQuestion(q);
        } else if (isMounted.current && CARD_DATA.length > 0) {
            const initialQ = CARD_DATA.find(i => i.category === '일상');
            if (initialQ) setCurrentQuestion(initialQ);
        }
      } catch (err) {
        console.error("Fetch DB failed:", err);
      }
    };
    fetchDB();
  }, [coupleCode]);

  const sendBroadcast = useCallback((updates) => {
    if (broadcastRef.current) {
      broadcastRef.current.send({
        type: 'broadcast',
        event: 'game-update',
        payload: { ...updates, ts: Date.now(), sender: userRole }
      });
    }
  }, [userRole]);

  const updateCardState = async (updates) => {
    if (updates.isFlipped === false && updates.questionId && broadcastRef.current) {
      broadcastRef.current.send({
        type: 'broadcast',
        event: 'card-game-call',
        payload: { category: updates.category || category, questionId: updates.questionId, sender: userRole }
      });
    }

    if (updates.category) setCategory(updates.category);
    if (updates.isFlipped !== undefined) setIsFlipped(updates.isFlipped);
    if (updates.isWaiting !== undefined) setIsWaiting(updates.isWaiting);
    if (updates.waiterRole !== undefined) setWaiterRole(updates.waiterRole);
    if (updates.turnOwner !== undefined) setTurnOwner(updates.turnOwner);
    if (updates.questionId) {
      const q = CARD_DATA.find(item => String(item.id) === String(updates.questionId));
      if (q) setCurrentQuestion(q);
    }

    sendBroadcast(updates);
    
    try {
      supabase.from('card_game_state').upsert({
        couple_id: coupleCode,
        category: updates.category || category,
        is_flipped: updates.isFlipped !== undefined ? updates.isFlipped : isFlipped,
        is_waiting: updates.isWaiting !== undefined ? updates.isWaiting : isWaiting,
        waiter_role: updates.waiterRole !== undefined ? updates.waiterRole : waiterRole,
        turn_owner: updates.turnOwner !== undefined ? updates.turnOwner : turnOwner,
        current_question_id: updates.questionId || currentQuestion?.id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'couple_id' }).then(() => {});
    } catch (e) {}
  };

  const drawNewCard = (targetCat = null) => {
    if (turnOwner && turnOwner !== userRole) return;
    const activeCat = targetCat || category;
    const pool = CARD_DATA.filter(q => q.category === activeCat);
    
    // Improved Randomization: Filter out history
    const available = pool.filter(q => !history.includes(q.id));
    const finalPool = available.length > 0 ? available : pool;

    const nextQ = finalPool[Math.floor(Math.random() * finalPool.length)];
    
    setHistory(prev => {
      const nextH = [...prev, nextQ.id];
      if (nextH.length > pool.length * 0.7) return nextH.slice(1);
      return nextH;
    });

    setCurrentQuestion(nextQ);
    setIsFlipped(false);
    setIsWaiting(false);
    setWaiterRole(null);
    setTurnOwner(userRole);
    
    updateCardState({ 
      questionId: nextQ.id, 
      category: activeCat,
      isFlipped: false, 
      isWaiting: false, 
      waiterRole: null, 
      turnOwner: userRole,
    });

    const nextCount = sessionCardCount + 1;
    setSessionCardCount(nextCount);
    if (nextCount === 10) setShowFinishModal(true);
  };

  const handOverTurn = () => {
    if (turnOwner && turnOwner !== userRole) return;
    const spouseRole = userRole === 'husband' ? 'wife' : 'husband';
    
    const pool = filteredQuestions;
    const available = pool.filter(q => !history.includes(q.id));
    const finalPool = available.length > 0 ? available : pool;
    const nextQForSpouse = finalPool[Math.floor(Math.random() * finalPool.length)];

    setHistory(prev => [...prev, nextQForSpouse.id].slice(-10));

    setIsWaiting(true);
    setWaiterRole(userRole);
    setTurnOwner(spouseRole); 
    
    updateCardState({ 
      questionId: nextQForSpouse.id,
      isFlipped: false, 
      isWaiting: false, 
      waiterRole: userRole, 
      turnOwner: spouseRole,
    });
  };

  const toggleFlip = () => {
    let currentOwner = turnOwner;
    if (!currentOwner) {
      currentOwner = userRole;
      setTurnOwner(userRole);
    }
    
    if (currentOwner !== userRole) {
      alert(`현재는 ${currentOwner === 'husband' ? '남편' : '아내'}님의 차례입니다.`);
      return;
    }
    const nextFlip = !isFlipped;
    setIsFlipped(nextFlip);
    updateCardState({ isFlipped: nextFlip, turnOwner: userRole });
  };

  const changeCategory = (cat) => {
    if (turnOwner && turnOwner !== userRole) {
      alert("배우자가 질문을 선택 중입니다.");
      return;
    }
    setCategory(cat);
    drawNewCard(cat);
  };

  const claimTurn = () => {
    if (!turnOwner) {
      setTurnOwner(userRole);
      updateCardState({ turnOwner: userRole });
    } else if (turnOwner !== userRole) {
      alert(`현재는 ${turnOwner === 'husband' ? '남편' : '아내'}님의 차례입니다.`);
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center p-4" 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{ 
        width: '100%', 
        paddingBottom: '150px', 
        paddingTop: '20px',
        willChange: 'transform, opacity', // 🚀 GPU Acceleration
        backfaceVisibility: 'hidden'
      }}
    >
      {showFinishModal && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} 
            style={{ background: 'white', borderRadius: '35px', width: '100%', maxWidth: '340px', padding: '45px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}
          >
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
              <Sparkles size={45} color="#D4AF37" />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#2D1F08', marginBottom: '15px' }}>오늘의 열 번째 대화 완료!</h3>
            <p style={{ fontSize: '15.5px', color: '#8B7355', fontWeight: 600, lineHeight: 1.6, wordBreak: 'keep-all', marginBottom: '35px' }}>
              오늘 나눈 대화가 서로를 더 깊게<br/>
              이해하는 시간이 되셨나요? ✨<br/>
              이제 대화를 마무리하고 함께<br/>
              달콤한 휴식을 취해볼까요?
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
              <button 
                onClick={onBack}
                style={{ width: '100%', padding: '20px', borderRadius: '22px', background: '#2D1F08', color: 'white', fontWeight: 900, fontSize: '17px', border: 'none' }}
              >
                대화 선택으로 돌아가기
              </button>
              <button 
                onClick={() => {
                  setShowFinishModal(false);
                  setSessionCardCount(11); 
                }}
                style={{ width: '100%', padding: '15px', borderRadius: '20px', background: 'none', color: '#B08D3E', fontWeight: 800, fontSize: '14px', border: 'none' }}
              >
                조금 더 대화할래요
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <div className="w-full flex items-center justify-start mb-2">
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0' }}>
          <ChevronLeft size={20} color="#8A60FF" strokeWidth={3} />
          <span style={{ fontSize: '14px', fontWeight: 900, color: '#8A60FF' }}>돌아가기</span>
        </button>
      </div>

      <div className="w-full flex flex-col items-center mb-6">
        <div className="category-row-container w-full relative">
          <div className="category-row">
              {['일상', '상상', '추억', '관계', '신앙', '시크릿'].map(cat => (
                <div key={cat} className={`category-chip ${category === cat ? 'active' : ''}`} onClick={() => changeCategory(cat)}>
                  {cat}
                </div>
              ))}
          </div>
          <div className="scroll-hint">옆으로 밀어보기 ➔</div>
        </div>
      </div>
      <div className="flex flex-col items-center" style={{ marginTop: '5px', marginBottom: '15px' }}>
        <p className="card-subtitle" style={{ letterSpacing: '5px', color: '#8B6500', fontWeight: '900', fontSize: '13px', opacity: 0.8, marginBottom: '5px' }}>SELECT YOUR TOPIC</p>
        
        {isWaiting && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2" style={{ marginTop: '10px', background: 'rgba(255, 77, 109, 0.15)', padding: '6px 15px', borderRadius: '20px', border: '1px solid #FF4D6D40' }}>
            <div className="animate-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF4D6D' }} />
            <span style={{ fontSize: '12px', color: '#FF4D6D', fontWeight: 900 }}>배우자가 답변 중입니다...</span>
          </motion.div>
        )}

        <div style={{ marginTop: '10px', fontSize: '10px', color: '#B08D3E', fontWeight: 800, background: 'rgba(255,255,255,0.5)', padding: '5px 12px', borderRadius: '10px', border: '1px solid #D4AF3740' }}>
          턴: {turnOwner ? (turnOwner === 'husband' ? '남편' : '아내') : '자유'}
        </div>
      </div>

      <div className="card-deck">
        <div className="card-float-anim">
          <div className={`talking-card ${isFlipped ? 'flipped' : ''}`} onClick={toggleFlip}>
            <div className="card-face card-front" style={{ background: "url('/card_bg.png') no-repeat center center", backgroundSize: 'cover', borderRadius: '32px', overflow: 'hidden' }}>
              <div className="card-pattern-box" style={{ justifyContent: 'center', background: 'rgba(0,0,0,0.02)' }}>
                <div className="flex flex-col items-center text-center">
                   <Sparkles size={40} color="#FFD700" className="mb-4" />
                   <p className="brand-text" style={{ fontSize: '20px', letterSpacing: '3px', color: '#FFD700', margin: 0 }}>QUESTION CARD</p>
                </div>
              </div>
            </div>
            <div className="card-face card-back" style={{ backgroundSize: 'cover', borderRadius: '32px', overflow: 'hidden', padding: 0 }}>
              <div className="card-pattern-box" style={{ background: 'rgba(255,255,255,0.95)', margin: '15px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', padding: '30px 20px', height: 'calc(100% - 30px)', width: 'calc(100% - 30px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flexShrink: 0, marginBottom: '10px' }}>
                  <span className="compat-badge" style={{ background: '#FF4D6D', color: 'white', fontWeight: 900, padding: '7px 18px', borderRadius: '100px', fontSize: '12px' }}>{category}</span>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '15px 0' }}>
                  <h2 className="card-question" style={{ fontSize: (currentQuestion?.question?.length || 0) > 40 ? '17px' : '20px', color: '#2D1F08', lineHeight: 1.6, textAlign: 'center', wordBreak: 'keep-all', fontWeight: 900 }}>
                    {currentQuestion?.question || "주제를 선택해주세요."}
                  </h2>
                </div>
                <div style={{ flexShrink: 0, width: '100%', display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                  {(!turnOwner || turnOwner === userRole) ? (
                    <button className="send-to-spouse-btn" 
                      style={{ background: '#2D1F08', borderRadius: '100px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '0 28px', border: 'none', cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); handOverTurn(); }}
                    >
                      <span style={{ color: 'white', fontWeight: 900, fontSize: '15px' }}>답변 완료</span>
                      <RefreshCw size={18} color="#F5D060" />
                    </button>
                  ) : (
                    <div style={{ background: 'white', padding: '15px 20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', border: '2px solid #8A60FF', width: '85%' }}>
                      <span style={{ fontSize: '14px', color: '#2D1F08', fontWeight: 900, textAlign: 'center' }}>대화를 경청 중입니다...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button className="draw-btn" disabled={turnOwner && turnOwner !== userRole} onClick={() => drawNewCard()} style={{ width: '100%', maxWidth: '300px', marginTop: '40px', opacity: (turnOwner && turnOwner !== userRole) ? 0.5 : 1 }}>다른 질문 뽑기</button>
    </motion.div>
  );
};

export default React.memo(CardGameView);
