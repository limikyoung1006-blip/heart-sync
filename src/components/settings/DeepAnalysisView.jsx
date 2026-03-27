import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// UI Notch visibility and scroll padding applied - 2026-03-27
import { ChevronLeft, Sparkles } from 'lucide-react';

const DeepAnalysisView = ({ onBack, myInfo, updateProfile }) => {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const questions = [
    {
      id: 'q1',
      title: 'Q1. (갈등 대처) 배우자와 의견 충돌로 다툼이 발생했을 때, 당신이 가장 선호하는 대처 방식은?',
      options: [
        { value: 'A', label: '문제가 해결될 때까지 어떻게든 대화로 즉시 끝장을 봐야 편하다 (주도/직면형)' },
        { value: 'B', label: '감정이 상하므로 일단 회피하거나 혼자만의 동굴에서 생각할 시간이 필요하다 (회피/분석형)' },
        { value: 'C', label: '상대방이 화를 내는 것이 두려워 일단 사과하고 상황을 무마하는 편이다 (수용/순응형)' },
        { value: 'D', label: '감정은 배제하고 사실 관계를 명확히 따져 논리적인 합의점을 찾으려 한다 (논리/이성형)' }
      ]
    },
    {
      id: 'q2',
      title: 'Q2. (애착 유형) 배우자와의 심리적/물리적 거리에 대해 가장 편안하게 느끼는 상태는?',
      options: [
        { value: 'A', label: '서로의 시간과 공간을 철저히 존중하며 간섭하지 않는 독립적인 상태 (회피애착 성향)' },
        { value: 'B', label: '모든 일상을 속속들이 공유하고 떨어져 있으면 불안한 밀착 상태 (불안애착 성향)' },
        { value: 'C', label: '신뢰 기반으로 각자 일에 집중하되, 모였을 때 깊게 교감하는 상태 (안정애착 성향)' },
        { value: 'D', label: '끊임없이 애정 표현과 사랑의 확신을 받아야만 마음이 놓이는 상태 (확보지향 성향)' }
      ]
    },
    {
      id: 'q3',
      title: 'Q3. (사랑의 언어) 당신이 "아, 내가 정말 사랑받고 있구나"라고 가장 크게 체감하는 순간은?',
      options: [
        { value: 'A', label: '나의 노력과 존재를 칭찬해주고 "고마워, 사랑해"라고 말해줄 때 (인정하는 말)' },
        { value: 'B', label: '스마트폰을 내려놓고 하루 10분이라도 나에게 온전히 집중해줄 때 (함께하는 시간)' },
        { value: 'C', label: '내가 지쳐있을 때 말없이 밀린 집안일이나 아이 돌봄을 먼저 다 해놓았을 때 (헌신과 봉사)' },
        { value: 'D', label: '평소 내가 흘리듯 말했던 갖고 싶던 선물을 서프라이즈로 사왔을 때 (선물)' }
      ]
    },
    {
      id: 'q4',
      title: 'Q4. (스트레스 반응) 직장이나 외부에서 극심한 스트레스를 받았을 때 복구하는 방식은?',
      options: [
        { value: 'A', label: '가만히 내버려 두고 혼자 푹 쉬거나 침묵할 수 있는 절대적인 시간 요구' },
        { value: 'B', label: '배우자를 붙들고 있었던 일들을 다 털어놓으며 무조건적인 공감과 위로 받기' },
        { value: 'C', label: '배우자와 함께 맛있는 것을 먹거나 영화를 보며 완전히 다른 일에 몰입하기' },
        { value: 'D', label: '밀린 집안일을 미친 듯이 하거나 청소를 하며 강박적으로 스트레스를 분출하기' }
      ]
    },
    {
      id: 'q5',
      title: 'Q5. (가치관: 재정) 가정 경제를 관리하는 데 있어 당신의 가장 확고한 기준은?',
      options: [
        { value: 'A', label: '한 푼이라도 철저하게 예산을 세우고 저축/투자에 집중해야 마음이 편하다' },
        { value: 'B', label: '공동 지출 외에는 서로의 터치 없이 각자 번 돈을 자유롭게 쓰기를 원한다' },
        { value: 'C', label: '돈은 거들 뿐, 가족의 경험(여행/여가)이나 의미 있는 지출에는 절대 아끼지 말아야 한다' },
        { value: 'D', label: '계산에 밝은 한쪽이 전담하고, 나는 세세한 스트레스를 받고 싶지 않다' }
      ]
    },
    {
      id: 'q6',
      title: 'Q6. (영적 소통) 우리 가정의 신앙생활(가정 예배 등)에 대해 갖고 있는 속마음은?',
      options: [
        { value: 'A', label: '신앙이 최우선이고, 억지로라도 가정 예배와 성경 공부의 틀을 꼭 지켜야 한다' },
        { value: 'B', label: '억지보다는 삶 속에서의 자연스러운 신앙 모범을 서로 보여주는 것이 핵심이다' },
        { value: 'C', label: '종교적 대화보다는 현실의 육아, 집안일 등 실질적인 삶의 안정이 먼저 필요하다' },
        { value: 'D', label: '영적인 대화를 나누고 싶지만 어색하거나 배우자의 거부반응 때문에 막막하고 두렵다' }
      ]
    },
    {
      id: 'q7',
      title: 'Q7. (갈등 회복) 크게 다툰 후 냉전 상태일 때, 배우자가 어떻게 다가오면 얼음이 가장 빨리 녹나요?',
      options: [
        { value: 'A', label: '이유를 불문하고 먼저 다가와서 따뜻하게 안아주며 미안하다고 할 때' },
        { value: 'B', label: '자신의 어떤 점이 잘못되었는지 논리적으로 성찰하고 차분하게 사과할 때' },
        { value: 'C', label: '내가 좋아하는 음식이나 선물을 조용히 사 와서 식탁에 올려놓았을 때' },
        { value: 'D', label: '싸웠던 일은 덮어두고, 평소처럼 농담을 건네거나 일상적인 대화를 걸어올 때' }
      ]
    }
  ];

  const generateAnalysis = (answers) => {
    let title = "";
    let mainInsight = "";
    let loveSummary = "";
    let conflictSummary = "";
    
    // 심리 유형 판독 로직
    const q1 = answers['q1'];
    if (q1 === 'A' || q1 === 'D') {
      title = "🔥 명확한 소통의 완벽주의자 [주도/이성형]";
      mainInsight = "당신은 모호한 것을 견디지 못합니다. 문제 상황에서 감정의 골이 깊어지기 전에 팩트와 논리로 상황을 직면하고 매듭지어야 직성이 풀리는 책임감이 강한 리더형 기질을 가졌습니다.";
      conflictSummary = "하지만, 때로는 당신의 빠른 직면 방식이 생각할 시간이 필요한 배우자에게 공격으로 느껴질 수 있습니다. '갈등 해결' 자체보다 '감정적 연결'을 먼저 챙기는 연습이 필요합니다.";
    } else if (q1 === 'B') {
      title = "🕰️ 생각이 정리될 동굴이 필요한 [분석/독립형]";
      mainInsight = "당신은 감정이 폭발하는 것을 두려워하며, 다툼이 발생하면 일단 물리적/심리적 거리를 둔 채 뇌 버퍼링을 거치며 논리를 다듬어야 하는 성향입니다.";
      conflictSummary = "배우자에게는 당신의 침묵이 '나를 무시한다'는 신호로 강렬하게 오해받을 수 있습니다. 혼자만의 시간이 필요할 땐 \"내가 잠깐 30분만 생각 정리를 하고 올게\"라고 예고만 해주어도 사이가 훨씬 부드러워집니다.";
    } else {
      title = "🕊️ 관계의 평화가 제일 소중한 [수용/관계형]";
      mainInsight = "당신에게는 시비와 논리보다는 서로의 감정이 상하지 않고 화목하게 지내는 것 자체가 가장 중요한 가치입니다. 싸우기보다는 맞추려고 노력하는 평화주의자입니다.";
      conflictSummary = "너무 많은 양보나 회피는 결국 속에 병(억압된 분노)을 쌓게 만듭니다. 당신의 솔직한 서운함을 건강하게 말하는 연습이 필요합니다.";
    }

    // 사랑의 언어 판독
    const q3 = answers['q3'];
    loveSummary = q3 === 'A' ? "『인정하는 말』: 당신은 물질적인 것보다 진심이 담긴 따뜻한 칭찬 한마디에 모든 피로가 녹습니다." : 
                  q3 === 'B' ? "『함께하는 시간』: 단 10분이라도 스마트폰 없이 오직 나에게만 집중해 주는 온전한 교감을 가장 원합니다." : 
                  q3 === 'C' ? "『헌신과 봉사』: 백 마디 말보다 묵묵히 밀린 집안일을 대신해 줄 때 사랑받고 있다고 확신합니다." : 
                  "『선물의 의미』: 평소의 대화를 기억하고 준비해 준 작지만 세심한 선물에서 깊은 사랑과 존재감을 느낀다.";

    return {
      title: title,
      content: `${mainInsight}\n\n${conflictSummary}\n\n💡 나의 핵심 사랑의 언어\n${loveSummary}`,
      raw: answers
    };
  };

  const handleSelect = (val) => {
    const newSelections = { ...selections, [questions[step].id]: val };
    setSelections(newSelections);
    
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      const result = generateAnalysis(newSelections);
      setAnalysisResult(result);
      setShowResult(true);
    }
  };

  const handleSaveAndFinish = async () => {
    // Note: updateProfile is passed as a prop from SettingsView, which actually uses onUpdateMemo from App.jsx
    if (updateProfile) {
      await updateProfile('deepAnalysis', analysisResult);
    }
    onBack();
  };

  if (showResult && analysisResult) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#F8FAFC', zIndex: 999999, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '85px 20px 25px', background: 'white', borderBottom: '1px solid #E2E8F0', position: 'relative', zIndex: 1000000 }}>
          <button onClick={() => setShowResult(false)} style={{ position: 'absolute', left: '20px', bottom: '26px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#64748B', fontWeight: 900, padding: '15px', margin: '-15px' }}>
            <ChevronLeft size={24} /> 뒤로
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#1E293B', margin: '0 auto' }}>진단 결과 보고서</h2>
        </div>
        <div style={{ flex: 1, padding: '30px 24px 120px', display: 'flex', flexDirection: 'column', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ background: 'white', padding: '30px 20px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '2px solid rgba(138, 96, 255, 0.2)', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#8A60FF', marginBottom: '20px', lineHeight: 1.4, wordBreak: 'keep-all' }}>
              {analysisResult.title}
            </h1>
            <div style={{ fontSize: '15px', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontWeight: 700 }}>
              {analysisResult.content}
            </div>
            
            <div style={{ marginTop: '20px', padding: '15px', background: '#F3F0FF', borderRadius: '15px', border: '1px dashed #8A60FF' }}>
              <p style={{ fontSize: '12px', color: '#6A4DCE', fontWeight: 800 }}>📌 이 결과는 안전하게 암호화되어 데이터베이스에 동기화되며, AI 하티가 앞으로 당신의 성향을 100% 이해한 채로 배우자와의 조율을 코칭하게 됩니다.</p>
            </div>
          </div>

          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveAndFinish}
            style={{ 
              padding: '20px', background: '#1E293B', color: 'white', fontWeight: 900, 
              borderRadius: '16px', border: 'none', cursor: 'pointer', fontSize: '16px', 
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)', marginBottom: '40px' 
            }}
          >
            결과 저장 및 AI 엔진에 반영하기
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#F8FAFC', zIndex: 999999, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '85px 20px 25px', background: 'white', borderBottom: '1px solid #E2E8F0', zIndex: 1000000 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '15px', margin: '-15px' }}>
          <ChevronLeft size={28} color="#1E293B" /> <span style={{ fontSize: '18px', fontWeight: 900 }}>진단 취소</span>
        </button>
      </div>
      <div style={{ flex: 1, padding: '30px 24px 120px', display: 'flex', flexDirection: 'column', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
           <Sparkles size={24} color="#8A60FF" />
           <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#1E293B' }}>하티 부부 성향 심층 진단</h2>
        </div>
        
        <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' }}>
           <div style={{ width: `${((step)/questions.length)*100}%`, height: '100%', background: '#8A60FF', transition: '0.4s ease' }} />
        </div>

        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '30px', lineHeight: 1.5, fontWeight: 700 }}>
          AI 하티가 두 분의 관계 패턴을 더 정확히 이해하기 위한 전문적인 진단 과정입니다. 가장 나에게 가깝다고 느껴지는 항목을 솔직하게 선택해주세요! ({step + 1}/{questions.length})
        </p>
        
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', marginBottom: '24px', lineHeight: 1.5, wordBreak: 'keep-all' }}>
          {questions[step].title}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '30px' }}>
          {questions[step].options.map((opt, i) => (
            <motion.button 
              whileTap={{ scale: 0.98 }}
              key={i} 
              onClick={() => handleSelect(opt.value)}
              style={{
                width: '100%', padding: '24px 20px', borderRadius: '20px', background: 'white',
                border: '2px solid rgba(138, 96, 255, 0.1)', textAlign: 'left', fontSize: '14px', fontWeight: 700,
                color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 8px 20px rgba(0,0,0,0.02)', cursor: 'pointer'
              }}
            >
              <span style={{ flex: 1, lineHeight: 1.5 }}>{opt.label}</span>
              <ChevronLeft size={18} color="#8A60FF" style={{ flexShrink: 0, marginLeft: '10px', transform: 'rotate(180deg)' }} />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeepAnalysisView;
