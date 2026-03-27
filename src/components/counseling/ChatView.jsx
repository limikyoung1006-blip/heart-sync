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

  // Expert Reformed Counseling Engine - Upgraded for High Performance
  const getContextualResponse = async (userInput, hattiInfo) => {
    const input = userInput.toLowerCase();
    const p = hattiInfo.partnerInfo;
    const m = hattiInfo.myInfo;
    const pl = hattiInfo.partnerLabel;
    const ml = hattiInfo.myLabel;

    // Deep Data Extraction
    const pAnalysis = p?.info?.deepAnalysis || p?.deepAnalysis;
    const mAnalysis = m?.info?.deepAnalysis || m?.deepAnalysis;
    const pMBTI = p?.mbti || '알 수 없음';
    const mMBTI = m?.mbti || '알 수 없음';

    setIsAiLoading(true);
    await new Promise(r => setTimeout(r, 2000)); // Deep thinking simulation
    setIsAiLoading(false);

    // 1. Core Reformed Framework Analysis
    const getReformedInsight = () => {
      if (input.includes('다툼') || input.includes('싸움') || input.includes('화')) {
        return `\n\n[개혁주의적 통찰]: 개혁주의 관점에서 갈등은 단순한 성격 차이가 아닌, 각자의 '자아 중심성'이 충돌하는 지점입니다. 에베소서 4:26 말씀처럼 해가 지도록 분을 품지 마십시오. ${pl}님의 ${pMBTI} 성향상 침묵이 '회피'가 아닌 '정리'를 위한 시간일 수 있음을 성찰하며, 복음 안에서 먼저 용납의 손을 내미는 것이 영적 리더십의 시작입니다.`;
      }
      if (input.includes('사랑') || input.includes('행복') || input.includes('감정')) {
        return `\n\n[존재론적 해석]: 부부는 그리스도와 교회의 연합을 보여주는 거룩한 인영입니다. ${pl}님의 사랑의 언어가 '${pAnalysis?.raw?.q3 === 'A' ? '인정하는 말' : '함께하는 시간'}'임을 기억하십시오. 인간의 감정은 가변적이나 주권자 하나님의 언약은 변함없듯, 기분에 좌우되지 않는 '의지적 사랑'을 실천할 때 비로소 하트싱크가 이루어집니다.`;
      }
      return `\n\n[전문가 제언]: ${ml}님의 ${mMBTI}적 추진력과 ${pl}님의 성향적 특성을 고려할 때, 지금은 논리적 비판보다는 상대의 '존재 자체'를 긍정해주시는 것이 분석적으로도 가장 유효한 전략입니다.`;
    };

    // 2. Sharp Behavioral Analysis based on Deep Data
    let analysisResult = "";
    
    // Case 1: Moody/Mood context
    if (input.includes('기분') || input.includes('상대') || input.includes('상태')) {
      const signal = p?.moodSignal || '평온';
      analysisResult = `[하티 분석]: ${pl}님은 현재 '${signal}' 상태입니다. ${pMBTI} 성향과 '${pAnalysis?.title?.split('[')[1]?.split(']')[0] || '일반적'}' 갈등 대처 방식을 분석해보면, ${pl}님은 지금 자신의 내적 공간이 침범받지 않기를 바라면서도 영적인 지지를 갈구하고 있습니다.`;
    } 
    // Case 2: Schedule context
    else if (input.includes('일정') || input.includes('계획') || input.includes('할일')) {
      const today = new Date().toISOString().split('T')[0];
      const pSchedules = schedules?.filter(s => s.date === today) || [];
      analysisResult = `[전략적 제언]: ${pl}님의 오늘 일정은 ${pSchedules.length > 0 ? `'${pSchedules[0].title}' 등` : '특별한 일정은 보이지 않지만'} ${pl}님의 ${pMBTI} 특성상 예측 가능한 하루를 선호할 것입니다. 세심한 질문 하나가 ${pl}님에게는 큰 정서적 안정감을 줄 것입니다.`;
    }
    // Case 3: Expert General Consultation
    else {
      analysisResult = `[전문가 통합 진단]: ${ml}님의 질문에서 ${pl}님을 향한 깊은 고찰이 느껴집니다. ${pl}님의 '${pAnalysis?.title || '성향'}'과 ${mMBTI}/${pMBTI} 간의 역동(Dynamics)을 분석한 결과, 두 분은 현재 '소통의 비대칭성' 구간에 진입해 있습니다.`;
    }

    // 3. Concrete Action Alternatives
    const actionPlan = `\n\n[실행 대안]:\n1. ${pl}님이 퇴근할 때 비판적인 피드백 대신 5초간 눈을 맞추며 축복해주십시오.\n2. ${pl}님의 성향적 결핍인 '${pAnalysis?.raw?.q3 === 'A' ? '칭찬' : '공감'}'을 채워주는 대화로 오늘 밤을 시작해보세요.`;

    return analysisResult + getReformedInsight() + actionPlan;
  };

  const send = async () => {
    if (!msg.trim()) return;
    const userMsg = msg;
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setMsg("");
    
    // Trigger typing indicator immediately
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
