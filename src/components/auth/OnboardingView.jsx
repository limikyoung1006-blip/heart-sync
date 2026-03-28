import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ArrowRight, 
  Share2, 
  RefreshCw, 
  CheckCircle2, 
  Bell, 
  Fingerprint, 
  Sparkles 
} from 'lucide-react';
import { supabase } from '../../supabase';

const OnboardingView = ({ user, userRole, setUserRole, onFinish }) => {
  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState(() => user?.user_metadata?.full_name || user?.user_metadata?.name || "");
  const [blood, setBlood] = useState("A");
  const [mDate, setMDate] = useState("2020-05-23");
  const [insightResult, setInsightResult] = useState("");
  const [insightAnswers, setInsightAnswers] = useState({ e: null, s: null, t: null, j: null });
  const [coupleCode, setCoupleCode] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [deepAnalysis, setDeepAnalysis] = useState(null);
  const [deepStep, setDeepStep] = useState(0);
  const [deepSelections, setDeepSelections] = useState({});

  const insightQuestions = [
    { key: 'e', title: '에너지 충전 방식', q: '지친 하루의 끝, 당신의 충전법은?', a1: 'E (밖에서 활기차게)', a2: 'I (혼자 조용히)' },
    { key: 's', title: '인식의 차이', q: '문제를 바라볼 때 당신의 시선은?', a1: 'S (현재의 구체적 사실)', a2: 'N (미래와 가능성)' },
    { key: 't', title: '판단의 기준', q: '배우자와의 갈등 상황, 당신의 우선순위는?', a1: 'T (공정함과 해결책)', a2: 'F (따뜻한 공감과 감정)' },
    { key: 'j', title: '생활의 스타일', q: '이번 주 주말 여행, 당신의 스타일은?', a1: 'J (미리 짜둔 시간표대로)', a2: 'P (그때그때 기분 따라)' },
  ];

  const deepAnalysisQuestions = [
    { key: 'q1', q: '배우자와 갈등이 생겼을 때, 당신은 주로 어떻게 반응하나요?', options: ['문제를 즉시 해결하려 한다', '혼자 생각할 시간을 가진다', '감정을 표현하며 대화를 시도한다', '상황을 피하고 싶어 한다'] },
    { key: 'q2', q: '배우자에게 사랑을 표현하는 가장 자연스러운 방법은?', options: ['선물이나 작은 이벤트를 준비한다', '말로 애정을 표현한다', '함께 시간을 보내며 활동한다', '필요할 때 도움을 준다'] },
    { key: 'q3', q: '배우자와의 관계에서 가장 중요하다고 생각하는 것은?', options: ['신뢰와 정직', '서로의 성장과 발전', '안정감과 편안함', '열정과 설렘'] },
    { key: 'q4', q: '스트레스를 받을 때 배우자에게 기대하는 역할은?', options: ['해결책을 제시해주는 것', '조용히 옆에 있어주는 것', '내 이야기를 들어주는 것', '기분 전환을 도와주는 것'] },
    { key: 'q5', q: '배우자와의 데이트를 계획할 때, 당신의 주된 고려사항은?', options: ['새로운 경험과 모험', '편안하고 익숙한 장소', '배우자의 취향과 선호', '나의 취향과 선호'] },
    { key: 'q6', q: '배우자의 어떤 점이 당신을 가장 행복하게 하나요?', options: ['유머 감각과 긍정적인 태도', '따뜻하고 배려심 깊은 마음', '지적이고 현명한 모습', '활동적이고 에너지가 넘치는 모습'] },
    { key: 'q7', q: '배우자와의 미래를 상상할 때, 가장 먼저 떠오르는 이미지는?', options: ['함께 새로운 목표를 달성하는 모습', '평화롭고 안정적인 일상', '서로에게 깊이 공감하며 위로하는 모습', '늘 즐겁고 활기찬 시간'] },
  ];

  const calculateInsight = () => {
    const res = (insightAnswers.e || 'I') + (insightAnswers.s || 'S') + (insightAnswers.t || 'F') + (insightAnswers.j || 'P');
    setInsightResult(res);
    setStep(4);
  };

  const submitDeepAnalysis = async () => {
    // Simulate AI analysis
    const analysisResult = {
      title: "🧭 공감과 신뢰의 관계 수호자",
      summary: "당신은 배우자와의 관계에서 깊은 공감과 안정감을 중요하게 생각하며, 갈등 상황에서는 대화를 통해 해결하려는 경향이 강합니다. 배우자의 감정을 이해하고 지지하는 데 능숙하며, 함께하는 시간을 통해 사랑을 확인하는 것을 선호합니다. 때로는 자신의 감정을 솔직하게 표현하는 데 어려움을 겪을 수 있으나, 배우자와의 신뢰를 바탕으로 점차 개선될 것입니다.",
      raw: deepSelections
    };
    setDeepAnalysis(analysisResult);
    setStep(9); // Go to notification prompt (new step)
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        width: '100%', 
        backgroundColor: 'white', 
        padding: '60px 30px 40px',
        position: 'fixed',
        inset: 0,
        zIndex: 5000,
        overflowY: 'auto'
      }}
    >
      {step > 1 && step < 4 && (
        <button 
          onClick={() => setStep(step - 1)}
          style={{ position: 'absolute', top: '15px', left: '15px', display: 'flex', alignItems: 'center', gap: '5px', padding: '10px', background: 'none', border: 'none', color: '#8B7355', fontWeight: 700, fontSize: '14px', zIndex: 10 }}
        >
          <ChevronLeft size={20} /> 뒤로
        </button>
      )}
      {step >= 7 && step <= 8 && (
        <button 
          onClick={() => setStep(step - 1)}
          style={{ position: 'absolute', top: '15px', left: '15px', display: 'flex', alignItems: 'center', gap: '5px', padding: '10px', background: 'none', border: 'none', color: '#8B7355', fontWeight: 700, fontSize: '14px', zIndex: 10 }}
        >
          <ChevronLeft size={20} /> 뒤로
        </button>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
            <div style={{ marginBottom: '40px', textAlign: 'left', paddingLeft: '10px' }}>
              <img 
                src="/logo_main.png" 
                alt="Heart Logo" 
                style={{ width: '180px', height: 'auto', marginTop: '-25px', marginBottom: '-25px', marginLeft: '-25px', transform: 'scale(1.1)' }}
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
              <p style={{ fontSize: '13px', color: '#B08D3E', fontWeight: 900, letterSpacing: '2px', marginBottom: '4px' }}>부부의 마음을 이어드립니다</p>
              <h1 className="brand-text" style={{ fontSize: '32px', letterSpacing: '6px', color: '#D4AF37', fontWeight: 900, marginBottom: '2px' }}>HEART SYNC</h1>
              <p style={{ fontSize: '11px', color: '#D4AF37', fontWeight: 800, letterSpacing: '3px', marginBottom: '30px', opacity: 0.8 }}>MORE DEEP, MORE CLOSE</p>
              
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#2D1F08', marginBottom: '12px', lineHeight: 1.4, wordBreak: 'keep-all' }}>
                Heart Sync에 오신 여러분을<br/>
                환영합니다.
              </h2>
              <p style={{ color: '#8B7355', fontSize: '15px', fontWeight: 600 }}>당신의 정보를 입력해주세요</p>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
              <button 
                onClick={() => { setUserRole('husband'); setStep(2); }} 
                style={{ flex: 1, padding: '30px 15px', borderRadius: '30px', background: '#FDFCF0', border: '2px solid #F5D060', fontSize: '18px', fontWeight: 900, color: '#2D1F08', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}
              >
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', background: 'white' }}>
                  <img src="/husband.png" alt="Husband" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                남편입니다
              </button>
              <button 
                onClick={() => { setUserRole('wife'); setStep(2); }} 
                style={{ flex: 1, padding: '30px 15px', borderRadius: '30px', background: '#FDFCF0', border: '2px solid #F5D060', fontSize: '18px', fontWeight: 900, color: '#2D1F08', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}
              >
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', background: 'white' }}>
                  <img src="/wife.png" alt="Wife" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                아내입니다
              </button>
            </div>

            {/* 🔗 Quick Link for Existing Users */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#8B7355', fontWeight: 600, marginBottom: '10px' }}>이미 연결된 배우자가 있으신가요?</p>
              <button 
                onClick={() => setStep(6)}
                style={{ background: 'none', border: 'none', color: '#8A60FF', fontWeight: 900, fontSize: '15px', borderBottom: '1.5px solid #8A60FF', paddingBottom: '2px' }}
              >
                기존 연결 코드 입력하기
              </button>
            </div>
          </motion.div>
        )}

        {step === 9 && (
          <motion.div key="step9" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
              <Bell size={48} color="#D4AF37" />
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#2D1F08', marginBottom: '15px' }}>알림을 켜고<br/>마음을 연결하세요!</h2>
            <p style={{ fontSize: '16px', color: '#8B7355', fontWeight: 600, lineHeight: 1.6, marginBottom: '40px', wordBreak: 'keep-all' }}>
              배우자의 신호를 실시간으로 확인하고,<br/>
              함께하는 대화카드를 놓치지 않으려면<br/>
              푸쉬 알림 허용이 필요해요. 💌
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
              <button 
                onClick={() => {
                  if ("Notification" in window) {
                    Notification.requestPermission().then(permission => {
                      if (permission === 'granted') {
                        // Registration happens in App level useEffect
                      }
                      setStep(8); // Go to the result/finish view
                    });
                  } else {
                    setStep(8);
                  }
                }}
                style={{ width: '100%', padding: '20px', borderRadius: '25px', background: '#D4AF37', color: 'white', fontWeight: 900, fontSize: '17px', border: 'none', boxShadow: '0 10px 20px rgba(212, 175, 55, 0.2)' }}
              >
                알림 허용하고 시작하기
              </button>
              <button 
                onClick={() => setStep(8)}
                style={{ background: 'none', border: 'none', color: '#B08D3E', fontWeight: 700, fontSize: '14px' }}
              >
                나중에 설정할게요
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex flex-col h-full justify-center">
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#2D1F08', marginBottom: '10px' }}>당신의 정보를 입력해주세요</h2>
            <p style={{ color: '#8B7355', fontSize: '14px', marginBottom: '40px', fontWeight: 600 }}>부부신호등이 두 분의 성향에 맞춰 안내해 드릴게요.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#B08D3E', display: 'block', marginBottom: '8px' }}>앱에서 불릴 이름/애칭</label>
                <input 
                  autoFocus
                  value={nickname} 
                  onChange={(e) => setNickname(e.target.value)} 
                  placeholder="예: 사랑꾼 남편" 
                  style={{ width: '100%', padding: '16px 22px', borderRadius: '18px', border: '1.5px solid #EEE', background: '#F9FAFB', fontSize: '16px', color: '#2D1F08', fontWeight: 700 }} 
                />
              </div>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#B08D3E', display: 'block', marginBottom: '8px' }}>결혼기념일 선택</label>
                  <input 
                    type="date" 
                    value={mDate} 
                    onChange={(e) => setMDate(e.target.value)}
                    style={{ width: '100%', padding: '16px 18px', borderRadius: '18px', border: '1.5px solid #EEE', background: '#F9FAFB', fontSize: '15px', color: '#2D1F08', fontWeight: 800, appearance: 'none' }}
                  />
                </div>
                <div style={{ width: '100px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#B08D3E', display: 'block', marginBottom: '8px' }}>혈액형</label>
                  <select 
                    value={blood} 
                    onChange={(e) => setBlood(e.target.value)} 
                    style={{ width: '100%', padding: '16px 12px', borderRadius: '18px', border: '1.5px solid #EEE', background: '#F9FAFB', fontSize: '15px', fontWeight: 800, appearance: 'none' }}
                  >
                    <option value="A">A형</option>
                    <option value="B">B형</option>
                    <option value="O">O형</option>
                    <option value="AB">AB형</option>
                  </select>
                </div>
              </div>
            </div>
            <button 
              onClick={() => nickname && setStep(3)}
              style={{ marginTop: '20px', padding: '18px', borderRadius: '20px', background: '#2D1F08', color: 'white', fontWeight: 900, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              다음으로 <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex flex-col h-full py-10">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
               <Fingerprint size={24} color="#8A60FF" />
               <span style={{ fontSize: '12px', fontWeight: 900, color: '#8A60FF' }}>하티 인사이트 (성격 진단)</span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#2D1F08', marginBottom: '15px', lineHeight: 1.4 }}>나의 관계 기질은 어떤가요?</h2>
            <p style={{ color: '#8B7355', fontSize: '14px', marginBottom: '30px', fontWeight: 600 }}>4개의 질문으로 배우자와의 소통 방식을 확인해보세요.</p>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {insightQuestions.map((iq) => (
                <div key={iq.key}>
                  <p style={{ fontSize: '14px', fontWeight: 900, color: '#2D1F08', marginBottom: '12px' }}>{iq.title}: {iq.q}</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => setInsightAnswers(prev => ({ ...prev, [iq.key]: iq.a1.charAt(0) }))}
                      style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1.5px solid #EEE', background: insightAnswers[iq.key] === iq.a1.charAt(0) ? '#8A60FF' : 'white', color: insightAnswers[iq.key] === iq.a1.charAt(0) ? 'white' : '#717171', fontSize: '13px', fontWeight: 800, transition: '0.2s' }}
                    >
                      {iq.a1}
                    </button>
                    <button 
                      onClick={() => setInsightAnswers(prev => ({ ...prev, [iq.key]: iq.a2.charAt(0) }))}
                      style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1.5px solid #EEE', background: insightAnswers[iq.key] === iq.a2.charAt(0) ? '#8A60FF' : 'white', color: insightAnswers[iq.key] === iq.a2.charAt(0) ? 'white' : '#717171', fontSize: '13px', fontWeight: 800, transition: '0.2s' }}
                    >
                      {iq.a2}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => Object.values(insightAnswers).every(v => v !== null) && calculateInsight()}
              style={{ marginTop: '30px', padding: '18px', borderRadius: '20px', background: '#8A60FF', color: 'white', fontWeight: 900, fontSize: '16px', boxShadow: '0 8px 20px rgba(138, 96, 255, 0.3)' }}
            >
              성격 진단 완료하기
            </button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col h-full justify-center items-center text-center">
            <div style={{ width: '100px', height: '100px', background: '#F5D060', borderRadius: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px', boxShadow: '0 10px 25px rgba(245, 208, 96, 0.2)' }}>
              <span style={{ fontSize: '40px' }}>💝</span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#2D1F08', marginBottom: '10px' }}>준비가 끝났습니다!</h2>
            <p style={{ color: '#8B7355', fontSize: '15px', fontWeight: 700, marginBottom: '30px' }}>당신의 기질은 <span style={{ color: '#8A60FF' }}>{insightResult}</span>입니다.<br/>이제 배우자와 연결을 시작할까요?</p>
            
            {/* 🧠 New Deep Analysis Prompt in Onboarding */}
            {!deepAnalysis && (
              <div style={{ background: 'rgba(138, 96, 255, 0.05)', padding: '24px', borderRadius: '24px', border: '1.5px dashed #8A60FF', marginBottom: '25px', width: '100%' }}>
                <p style={{ fontSize: '14px', fontWeight: 900, color: '#6A4DCE', marginBottom: '8px' }}>🤖 하티가 당신을 더 잘 이해하고 싶대요!</p>
                <p style={{ fontSize: '12px', color: '#8B7355', fontWeight: 600, marginBottom: '15px', lineHeight: 1.5 }}>7개의 전문 질문에 답하면, AI 하티가 더욱 정교한 부부 맞춤형 조언을 제공합니다.</p>
                <button 
                  onClick={() => setStep(7)} 
                  style={{ width: '100%', background: '#8A60FF', color: 'white', padding: '12px', borderRadius: '15px', border: 'none', fontWeight: 900, fontSize: '14px' }}
                >
                  3분 전문 성향 진단 시작 (추천)
                </button>
              </div>
            )}

            {deepAnalysis && (
              <div style={{ background: 'rgba(34, 197, 94, 0.05)', padding: '20px', borderRadius: '24px', border: '1px solid #22C55E', marginBottom: '25px', width: '100%', display: 'center', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={20} color="#22C55E" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>심층 분석이 완료되었습니다!</span>
              </div>
            )}
            
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
                <button 
                  onClick={async () => {
                    const randomNum = Math.floor(1000 + Math.random() * 9000);
                    const newCode = `hs-${randomNum}`; // Internal: lowercase
                    setCoupleCode(newCode); // UI will show uppercase via display logic if needed
                    
                    try {
                      setIsConnecting(true);
                      const { error } = await supabase.from('profiles').upsert({
                        id: user.id,
                        couple_id: newCode,
                        user_role: userRole,
                        info: { nickname, marriageDate: mDate || new Date().toISOString().split('T')[0], mbti: insightResult, blood, deepAnalysis },
                        updated_at: new Date().toISOString()
                      }, { onConflict: 'id' });
                      
                      if (error) throw error;
                      setStep(5);
                    } catch (err) {
                      console.error("Early upsert failed:", err);
                      alert("코드 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
                    } finally {
                      setIsConnecting(false);
                    }
                  }}
                  disabled={isConnecting}
                  style={{ width: '100%', padding: '18px', borderRadius: '20px', background: '#2D1F08', color: 'white', fontWeight: 900, fontSize: '16px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', opacity: isConnecting ? 0.7 : 1 }}
                >
                  {isConnecting ? "생성 중..." : "새로운 초대 코드 만들기"}
                </button>
                <button 
                  onClick={() => setStep(6)}
                  style={{ width: '100%', padding: '18px', borderRadius: '20px', background: '#FDFCF0', border: '2.5px solid #F5D060', color: '#2D1F08', fontWeight: 900, fontSize: '16px' }}
                >
                  초대 코드 입력하기
                </button>
              </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step5" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col h-full justify-center items-center text-center">
             <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#2D1F08', marginBottom: '15px' }}>초대 코드가 생성되었습니다</h2>
             <div style={{ width: '100%', padding: '30px', background: '#F9FAFB', borderRadius: '24px', border: '2px dashed #D4AF37', marginBottom: '15px' }}>
                <span style={{ fontSize: '12px', fontWeight: 900, color: '#B08D3E', display: 'block', marginBottom: '10px' }}>우리만의 소중한 연결 코드</span>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#2D1F08', letterSpacing: '8px' }}>{coupleCode?.toUpperCase()}</div>
             </div>
             <p style={{ color: '#8B7355', fontSize: '14px', marginBottom: '30px', fontWeight: 600, lineHeight: 1.6 }}>이 코드를 복사해서 배우자에게 보내주세요.<br/>배우자와 연결이 확인되면 자동으로 시작됩니다.</p>
             
             <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(coupleCode);
                    alert("코드가 복사되었습니다!");
                  }}
                  style={{ width: '100%', padding: '15px', borderRadius: '15px', background: '#FDFCF0', border: '1.5px solid #F5D060', color: '#2D1F08', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Share2 size={18} /> 초대 코드 복사하기
                </button>

                 <button 
                  onClick={async () => {
                    const normalized = coupleCode.trim().toLowerCase();
                    setIsConnecting(true);
                    
                    try {
                      // Check if spouse has connected (created a profile)
                      const { data, error } = await supabase.from('profiles').select('*').eq('couple_id', normalized);
                      
                      if (error) throw error;

                      if (data && data.length > 1) {
                        setIsConnected(true);
                        setTimeout(() => {
                          onFinish({ nickname, marriageDate: mDate, mbti: insightResult, blood, coupleCode: normalized, deepAnalysis });
                        }, 500);
                      } else {
                        alert("아직 배우자가 연결되지 않았습니다. 코드를 공유했는지 확인해주세요!");
                      }
                    } catch (err) {
                      console.error("Connection check failed:", err);
                      alert("연결 확인 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.");
                    } finally {
                      setIsConnecting(false);
                    }
                  }}
                  disabled={isConnecting || isConnected}
                  style={{ width: '100%', padding: '18px', borderRadius: '20px', background: isConnected ? '#22C55E' : '#2D1F08', color: 'white', fontWeight: 900, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                  {isConnecting ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><RefreshCw size={20} /></motion.div>
                      배우자 연결 확인 중...
                    </>
                  ) : isConnected ? (
                    <>
                      <CheckCircle2 size={20} /> 연결 완료!
                    </>
                  ) : (
                    "배우자 연결 확인 및 시작"
                  )}
                </button>
             </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div key="step6" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col h-full justify-center">
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#2D1F08', marginBottom: '15px' }}>초대 코드를 입력해주세요</h2>
            <p style={{ color: '#8B7355', fontSize: '14px', marginBottom: '25px', fontWeight: 600 }}>배우자에게 받은 HS-로 시작하는 코드를 입력하세요.</p>
            <input 
              placeholder="예: HS-1234" 
              value={coupleCode?.toUpperCase()}
              onChange={(e) => setCoupleCode(e.target.value.toLowerCase())}
              style={{ width: '100%', padding: '20px', borderRadius: '20px', border: '2px solid #F5D060', fontSize: '20px', fontWeight: 900, textAlign: 'center', letterSpacing: '4px', marginBottom: '25px' }} 
            />
            {coupleCode && coupleCode.startsWith('hs-') && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginBottom: '25px' }}>
                <div className="flex items-center justify-center gap-2" style={{ color: '#8A60FF', fontWeight: 900 }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <RefreshCw size={18} />
                  </motion.div>
                  서버와 동기화 중...
                </div>
              </motion.div>
            )}
             <button 
              onClick={async () => {
                const normalized = coupleCode.trim().toLowerCase();
                if (!normalized || !normalized.startsWith('hs-')) return;
                
                setIsConnecting(true);
                try {
                  // Try to find existing couple in Supabase
                  const { data, error } = await supabase.from('profiles').select('*').eq('couple_id', normalized);
                  
                  if (error) throw error;
                  
                  if (data && data.length > 0) {
                    const spouse = data.find(p => p.id !== user.id);
                    const spouseName = spouse?.info?.nickname || (spouse?.user_role === 'husband' ? '남편' : '아내') || '배우자';
                    
                    alert(`🎉 ${spouseName}님을 찾았습니다! 성공적으로 연결되었습니다.`);
                    
                    setIsConnected(true);
                    setTimeout(() => {
                      onFinish({ nickname, marriageDate: mDate, mbti: insightResult, blood, coupleCode: normalized, deepAnalysis });
                    }, 800);
                  } else {
                    alert("코드를 찾을 수 없습니다.\n입력한 코드: " + normalized.toUpperCase() + "\n배우자에게 코드를 다시 확인해달라고 하세요!");
                  }
                } catch (err) {
                  console.error("Join check fail:", err);
                  alert("연결 중 오류가 발생했습니다. 잠시 후 상단 '새로고침'을 해보세요.");
                } finally {
                  setIsConnecting(false);
                }
              }}
              disabled={!coupleCode || !coupleCode.startsWith('HS-') || isConnecting || isConnected}
              style={{ width: '100%', padding: '18px', borderRadius: '20px', background: isConnected ? '#22C55E' : (coupleCode && coupleCode.startsWith('HS-') ? '#2D1F08' : '#CCC'), color: 'white', fontWeight: 900, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              {isConnecting ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><RefreshCw size={20} /></motion.div>
                  보안 연결 확인 중...
                </>
              ) : isConnected ? (
                <>
                  <CheckCircle2 size={20} /> 동기화 완료!
                </>
              ) : (
                "동기화 및 시작하기"
              )}
            </button>
            <button 
              onClick={() => setStep(4)}
              style={{ marginTop: '15px', background: 'none', border: 'none', color: '#9CA3AF', fontSize: '13px', fontWeight: 600, textDecoration: 'underline' }}
            >
              처음으로 돌아가기
            </button>
          </motion.div>
        )}

        {/* 🧠 Deep Analysis Sync Steps */}
        {step === 7 && (
          <motion.div key="step7" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col h-full py-5">
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <Sparkles size={20} color="#8A60FF" />
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B' }}>하티 전문 성향 진단</h2>
             </div>
             <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '10px', marginBottom: '20px' }}>
                <div style={{ width: `${((deepStep + 1)/deepAnalysisQuestions.length)*100}%`, height: '100%', background: '#8A60FF', transition: '0.3s' }} />
             </div>
             <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', marginBottom: '24px', lineHeight: 1.5 }}>
                {deepAnalysisQuestions[deepStep].q}
             </h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
                {deepAnalysisQuestions[deepStep].options.map((opt, i) => (
                   <button 
                     key={i}
                     onClick={() => {
                        const newSels = { ...deepSelections, [deepAnalysisQuestions[deepStep].key]: opt };
                        setDeepSelections(newSels);
                        if (deepStep < deepAnalysisQuestions.length - 1) setDeepStep(deepStep + 1);
                        else submitDeepAnalysis();
                     }}
                     style={{ width: '100%', padding: '20px', borderRadius: '18px', background: 'white', border: '1.5px solid #F1F5F9', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#475569', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}
                   >
                     {opt}
                   </button>
                ))}
             </div>
          </motion.div>
        )}

        {step === 8 && deepAnalysis && (
          <motion.div key="step8" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col h-full justify-center">
             <div style={{ background: 'white', padding: '30px 20px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '2px solid #8A60FF', marginBottom: '30px' }}>
                <p style={{ fontSize: '12px', fontWeight: 900, color: '#8A60FF' }}>진단 완료!</p>
                <h1 style={{ fontSize: '19px', fontWeight: 900, color: '#1E293B', marginBottom: '15px' }}>{deepAnalysis.title}</h1>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>{deepAnalysis.summary}</p>
             </div>
             <button 
                onClick={() => setStep(4)}
                style={{ width: '100%', padding: '18px', borderRadius: '18px', background: '#1E293B', color: 'white', fontWeight: 900, fontSize: '16px' }}
              >
                 분석 데이터 저장 및 계속하기
              </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OnboardingView;
