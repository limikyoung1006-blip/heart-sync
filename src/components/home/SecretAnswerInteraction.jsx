import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Send } from 'lucide-react';

const SecretAnswerInteraction = ({ 
  userRole, coupleCode, questionText, supabase, 
  spouseAnswer, setSpouseAnswer, 
  myAnswer, setMyAnswer, 
  answered, setAnswered,
  mainChannel
}) => {
  useEffect(() => {
    // 1. 초기 데이터 가져오기
    const fetchAnswers = async () => {
      const normalizedQ = (questionText || "").trim();
      const { data } = await supabase
        .from('secret_answers')
        .select('*')
        .eq('couple_id', coupleCode)
        .eq('question_text', normalizedQ);
      
      if (data) {
        const myRow = data.find(r => r.user_role === userRole);
        const spouseRow = data.find(r => r.user_role !== userRole);
        if (myRow) {
          setMyAnswer(myRow.answer);
          setAnswered(true);
        }
        if (spouseRow) setSpouseAnswer(spouseRow.answer);
      }
    };

    fetchAnswers();
  }, [userRole, coupleCode, questionText, supabase]);

  const [isSyncing, setIsSyncing] = useState(false);
  const handleManualRefresh = async () => {
    setIsSyncing(true);
    const normalizedQ = (questionText || "").trim();
    const { data } = await supabase
      .from('secret_answers')
      .select('*')
      .eq('couple_id', coupleCode)
      .eq('question_text', normalizedQ);
    
    if (data) {
      const spouseRow = data.find(r => r.user_role !== userRole);
      if (spouseRow) {
        setSpouseAnswer(spouseRow.answer);
      } else {
        alert("배우자가 아직 답변을 작성하지 않았습니다.");
      }
    }
    setTimeout(() => setIsSyncing(false), 500);
  };

  const handleSend = async () => {
    if (!myAnswer) return;
    try {
      const normalizedQ = (questionText || "").trim();
      const answerData = {
        couple_id: coupleCode,
        question_text: normalizedQ,
        user_role: userRole,
        answer: myAnswer,
        created_at: new Date().toISOString()
      };
      
      await supabase.from('secret_answers').upsert(answerData, { onConflict: 'couple_id,question_text,user_role' });
      
      // 🚀 Global Channel Broadcast (Use existing mainChannel for reliability)
      if (mainChannel) {
        mainChannel.send({
          type: 'broadcast',
          event: 'secret-answer-update',
          payload: answerData
        });
      }

      setAnswered(true);
    } catch (err) {
      console.error("Secret answer send error:", err);
      alert("전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  // 배우자 답변 대기 중인 경우
  if (answered && !spouseAnswer) {
    return (
      <div className="flex flex-col gap-4 w-full" style={{ marginTop: '15px' }}>
        <div className="prayer-bubble" style={{ background: 'rgba(255,255,255,0.95)', padding: '15px', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', position: 'relative' }}>
          <p style={{ fontSize: '14px', color: '#800F2F', fontWeight: 900, marginBottom: '6px', textAlign: 'left' }}>나의 답변</p>
          <p style={{ fontSize: '16px', color: '#2D1F08', textAlign: 'left', fontWeight: 500 }}>{myAnswer}</p>
          <button 
            onClick={() => setAnswered(false)}
            style={{ position: 'absolute', top: '12px', right: '15px', background: 'none', border: 'none', color: '#9CA3AF', fontSize: '11px', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
          >
            수정하기
          </button>
        </div>
        <div className="flex flex-col items-center gap-3" style={{ 
          marginTop: '15px', 
          padding: '24px 20px', 
          background: 'rgba(255, 255, 255, 0.75)', 
          backdropFilter: 'blur(10px)',
          borderRadius: '24px', 
          border: '1.5px dashed #D4AF37',
          boxShadow: '0 4px 20px rgba(212, 175, 55, 0.15)',
          position: 'relative'
        }}>
          <RefreshCw className="animate-spin" size={28} color="#D4AF37" />
          <p style={{ 
            fontSize: '15px', 
            color: '#2D1F08', 
            fontWeight: 900,
            textShadow: '0 1px 2px rgba(255,255,255,0.8)'
          }}>배우자의 답변을 기다리고 있어요...</p>
          
          <button 
            onClick={handleManualRefresh}
            disabled={isSyncing}
            style={{
              marginTop: '10px',
              background: isSyncing ? '#EEE' : '#D4AF3720',
              border: '1px solid #D4AF3740',
              color: isSyncing ? '#999' : '#B08D3E',
              padding: '8px 15px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: isSyncing ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} /> 
            {isSyncing ? "확인 중..." : "답변 확인 새로고침"}
          </button>
        </div>
      </div>
    );
  }

  // 둘 다 답변한 경우 (최종 공개)
  if (answered && spouseAnswer) {
    return (
      <div className="flex flex-col gap-4 w-full" style={{ marginTop: '10px' }}>
        <div className="prayer-bubble" style={{ background: 'rgba(255,255,255,0.98)', padding: '18px', borderRadius: '24px', border: '1px solid rgba(245, 208, 96, 0.3)', boxShadow: '0 8px 25px rgba(0,0,0,0.08)', position: 'relative' }}>
          <p style={{ fontSize: '14px', color: '#8B6500', fontWeight: 900, marginBottom: '8px', textAlign: 'left' }}>나의 답변</p>
          <p style={{ fontSize: '17px', color: '#2D1F08', textAlign: 'left', fontWeight: 500 }}>{myAnswer}</p>
          <button 
            onClick={() => setAnswered(false)}
            style={{ position: 'absolute', top: '15px', right: '18px', background: 'none', border: 'none', color: '#B08D3E', fontSize: '11px', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
          >
            수정
          </button>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="prayer-bubble" 
          style={{ 
            background: 'rgba(255, 255, 255, 0.98)', 
            padding: '20px', 
            borderRadius: '24px', 
            border: '2px solid #FF4D6D',
            boxShadow: '0 10px 30px rgba(255, 77, 109, 0.2)'
          }}
        >
          <p style={{ fontSize: '14px', color: '#FF4D6D', fontWeight: 900, marginBottom: '8px', textAlign: 'left' }}>배우자의 답변</p>
          <p style={{ fontSize: '18px', color: '#2D1F08', textAlign: 'left', fontWeight: 700, lineHeight: 1.6, wordBreak: 'keep-all' }}>
            "{spouseAnswer}"
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full" style={{ marginTop: '10px' }}>
      <div style={{ position: 'relative', width: '100%' }}>
        <input 
          className="counseling-input" 
          style={{ width: '100%', paddingRight: '45px', fontSize: '14px', background: 'rgba(255,255,255,0.9)' }}
          placeholder="비밀 답변을 적어주세요..."
          value={myAnswer}
          onChange={(e) => setMyAnswer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="counseling-send-btn" onClick={handleSend} style={{ width: '34px', height: '34px', right: '8px' }}>
          <Send size={16} />
        </button>
      </div>
       <p style={{ 
        fontSize: '11px', 
        color: '#4D3A1A', 
        marginTop: '2px', 
        fontWeight: 800,
        textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff' 
      }}>
        배우자가 답변을 해야 내용을 볼 수 있습니다
      </p>
    </div>
  );
};

export default SecretAnswerInteraction;
