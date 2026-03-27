import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Send, 
  Settings,
  Sparkles,
  Info
} from 'lucide-react';
import HattiCharacter from '../ui/HattiCharacter';

const ChatView = ({ userRole, setUserRole, husbandInfo, setHusbandInfo, wifeInfo, setWifeInfo, onBack, adminStats, schedules }) => {
  const [msg, setMsg] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef(null);

  const hatti = {
    myLabel: userRole?.toLowerCase() === 'husband' ? '남편' : '아내',
    partnerLabel: userRole?.toLowerCase() === 'husband' ? '아내' : '남편',
    partnerInfo: (userRole?.toLowerCase() === 'husband' ? wifeInfo : husbandInfo) || {},
    myInfo: (userRole?.toLowerCase() === 'husband' ? husbandInfo : wifeInfo) || {}
  };

  const [chat, setChat] = useState([
    { role: 'hatti', text: `안녕하세요! 부부의 마음을 이어주는 '하티'입니다. 오늘은 ${hatti.partnerLabel}분에 대해 무엇이 궁금하신가요?` }
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, isAiLoading]);

  // Keyword-based response logic
  const getContextualResponse = async (userInput, hattiInfo) => {
    const input = userInput.toLowerCase();
    const p = hattiInfo.partnerInfo;
    const pl = hattiInfo.partnerLabel;

    // Use Serverless API for Real AI (In this case simulated for robustness)
    if (true) {
      try {
        setIsAiLoading(true);
        // Replace with actual fetch if backend is ready
        // const response = await fetch("/api/chat", { ... });
        // const result = await response.json();
        
        await new Promise(r => setTimeout(r, 1500)); // Simulate thinking
        
        if (input.includes('기분') || input.includes('상태')) {
          const signal = p?.moodSignal || '평온한 상태';
          return `${pl}분은 현재 '${signal}'라고 하시네요. 이럴 때는 따뜻한 차 한 잔을 건네보시는 건 어떨까요?`;
        }
        if (input.includes('일정') || input.includes('스케줄')) {
          return `오늘 ${pl}분의 주요 일정으로는 '치과 검진'이 등록되어 있어요. 이따가 치료는 잘 받았는지 물어봐 주시면 좋을 것 같아요!`;
        }
        if (input.includes('고마워') || input.includes('안녕')) {
           return `저도 두 분의 관계를 도울 수 있어 기뻐요! 언제든 ${pl}분에 대해 궁금한 점이 생기면 저 하티에게 물어봐 주세요. 😊`;
        }

        return `${pl}분에 대해 더 깊이 이해하고 싶으시군요! 두 분의 최근 대화 빈도와 성향을 분석해볼 때, 지금은 조언보다는 '공감'이 가장 필요한 타이밍으로 보여요. ${pl}분의 마음을 한 번 더 토닥여주세요.`;
      } catch (err) {
        return "죄송해요, 하티 엔진에 일시적인 연결 오류가 발생했어요. 잠시 후 다시 물어봐 주시겠어요?";
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  const send = async () => {
    if (!msg.trim()) return;
    const userMsg = msg;
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setMsg("");
    
    const hattiResponse = await getContextualResponse(userMsg, hatti);
    setChat(prev => [...prev, { role: 'hatti', text: hattiResponse }]);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full w-full">
      <header style={{ 
        padding: '20px 24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(138, 96, 255, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#2D1F08' }}><ChevronLeft size={24} /></button>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08' }}>AI 카운실러 하티</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 800 }}>실시간 분석 엔진 가동 중</span>
            </div>
          </div>
        </div>
        <div style={{ width: '40px' }} />
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '25px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
           <span style={{ fontSize: '11px', fontWeight: 900, color: '#94A3B8', background: '#F1F5F9', padding: '4px 12px', borderRadius: '100px' }}>오늘</span>
        </div>

        {chat.map((c, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: c.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: '12px' }}>
            {c.role === 'hatti' && (
               <HattiCharacter size={42} state="floating" />
            )}
            <div style={{ 
              maxWidth: '85%', 
              padding: '12px 18px', 
              borderRadius: c.role === 'user' ? '24px 24px 4px 24px' : '24px 24px 24px 4px', 
              background: c.role === 'user' ? '#8A60FF' : 'white', 
              color: c.role === 'user' ? 'white' : '#2D1F08', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)', 
              border: c.role === 'hatti' ? '1px solid #eee' : 'none', 
              wordBreak: 'keep-all', 
              zIndex: 5, 
              position: 'relative' 
            }}>
              {c.text}
            </div>
          </div>
        ))}
        
        {isAiLoading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', paddingLeft: '45px' }}>
             <div style={{ position: 'absolute', left: '-5px', top: '-5px' }}><HattiCharacter state="thinking" size={50} /></div>
             <div style={{ background: 'white', padding: '12px 18px', borderRadius: '24px', border: '1px solid #eee' }}>...하티가 답변을 준비중이에요...</div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div style={{ padding: '20px', background: 'white', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && send()}
            placeholder={`${hatti.partnerLabel}에 대해 하티에게 물어보세요...`}
            style={{
              flex: 1, padding: '15px 20px', borderRadius: '18px',
              border: '2px solid rgba(138, 96, 255, 0.1)',
              background: '#F8FAFB', fontSize: '15px', outline: 'none', color: '#2D1F08',
              fontWeight: 600
            }}
          />
          <button onClick={send} style={{
            width: '54px', height: '54px', borderRadius: '16px', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #8A60FF, #AC8AFF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(138, 96, 255, 0.4)'
          }}>
            <Send size={22} color="white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatView;
