import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import HattiCharacter from '../ui/HattiCharacter';

const DeepAnalysisView = ({ onBack, myInfo, updateProfile }) => {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const questions = [
    { key: 'q1', q: '최근 정서적으로 가장 깊이 연결되었다고 느낀 순간은 언제인가요?', options: ['함께 깊은 대화를 나눴을 때', '서로의 일상적인 도움을 주고받을 때', '조용히 같은 공간에 머무를 때', '함께 새로운 경험이나 취미를 즐길 때'] },
    { key: 'q2', q: '배우자에게 서운함이 생길 때, 당신의 주된 대처 방식은?', options: ['말하지 않고 스스로 감정을 추스른다', '서운한 점을 구체적으로 설명한다', '일단 화를 내거나 감정을 표출한다', '배우자가 먼저 알아주기를 기다린다'] },
    { key: 'q3', q: '부부 관계에서 당신이 생각하는 이상적인 리더십의 형태는?', options: ['한 사람이 주도하고 다른 사람이 따르는 형태', '모든 결정을 철저히 공동으로 내리는 형태', '각자의 전문 분야를 나누어 관리하는 형태', '흐르는 대로 자연스럽게 맞춰가는 형태'] },
    { key: 'q4', q: '배우자의 어떤 응원이 당신에게 가장 큰 힘이 되나요?', options: ['능력을 인정해주는 칭찬의 말', '말없이 건네는 따뜻한 신체적 스킨십', '실질적으로 문제를 함께 고민해주는 태도', '아무 질문 없이 들어주는 경청'] },
    { key: 'q5', q: '결혼 생활을 한 단어로 표현한다면 무엇에 가장 가깝나요?', options: ['거룩한 사명', '안전한 안식처', '끊임없는 성장', '함께 걷는 여행'] }
  ];

  const handleSelect = async (opt) => {
    const newSels = { ...selections, [questions[step].key]: opt };
    setSelections(newSels);
    
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setIsAnalyzing(true);
      // Simulate AI thought
      await new Promise(r => setTimeout(r, 2000));
      
      const analysisResult = {
        title: "🛡️ 신뢰와 헌신의 평화주의자",
        summary: "당신은 부부 관계의 안정성과 평화를 최우선으로 생각하며, 상대방의 필요를 먼저 살피는 배려심 깊은 태도를 지니고 있습니다. 때로는 자신의 욕구보다 상대방의 만족을 우선시하여 스스로의 감정이 소모될 수 있으니, 건강한 나 중심(I-Message) 대화를 통해 속마음을 더 자주 표현하는 것이 관계에 큰 도움이 될 것입니다.",
        advice: "오늘 저녁에는 '나는 오늘 이런 기분이었어'라고 가벼운 속마음 고백을 하나만 해보세요. 배우자는 당신의 아주 작은 진심에도 크게 기뻐할 거예요."
      };
      
      setResult(analysisResult);
      if (updateProfile) {
        await updateProfile('deepAnalysis', analysisResult);
      }
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[6000] bg-[#FDFCF0] flex flex-col p-6 overflow-y-auto">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 -ml-2"><ChevronLeft size={24} /></button>
        <h2 className="text-xl font-black text-[#2D1F08]">하티 정밀 성향 진단</h2>
      </header>

      {!result ? (
        <div className="flex-1 flex flex-col">
          {!isAnalyzing ? (
            <>
              <div className="w-full bg-gray-200 h-1 rounded-full mb-8 overflow-hidden">
                <div style={{ width: `${((step + 1)/questions.length)*100}%` }} className="h-full bg-[#8A60FF] transition-all duration-300" />
              </div>

              <div className="flex justify-center mb-6">
                 <HattiCharacter state="floating" size={100} />
              </div>

               <h3 className="text-xl font-bold text-[#2D1F08] mb-8 leading-snug break-keep">
                 {questions[step].q}
               </h3>

              <div className="flex flex-col gap-3">
                {questions[step].options.map((opt, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSelect(opt)}
                    className="p-5 text-left bg-white rounded-2xl border-2 border-transparent hover:border-[#8A60FF] active:bg-[#F9FAFB] shadow-sm transition-all text-sm font-bold text-[#475569]"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
               <HattiCharacter state="thinking" size={150} />
               <h3 className="text-xl font-black text-[#8A60FF] mt-6">하티가 당신을 분석 중입니다...</h3>
               <p className="text-sm font-bold text-[#8B7355] mt-2">잠시만 기다려주세요, 두 분만을 위한 조언을 준비하고 있어요.</p>
               <div className="mt-8 flex gap-2">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 bg-[#8A60FF] rounded-full" />
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-3 h-3 bg-[#8A60FF] rounded-full" />
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-3 h-3 bg-[#8A60FF] rounded-full" />
               </div>
            </div>
          )}
        </div>
      ) : (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col">
           <div className="bg-white p-8 rounded-[40px] shadow-xl border-2 border-[#8A60FF] mb-8">
              <span className="inline-block px-3 py-1 bg-[#8A60FF10] text-[#8A60FF] text-[10px] font-black rounded-full mb-3 uppercase tracking-widest">Analysis Result</span>
              <h1 className="text-2xl font-black text-[#1E293B] mb-6">{result.title}</h1>
              
              <div className="space-y-6">
                <section>
                  <p className="text-[#475569] leading-relaxed font-semibold">"{result.summary}"</p>
                </section>
                
                <section className="bg-[#FDFCF0] p-6 rounded-3xl border border-[#D4AF3730]">
                  <h4 className="flex items-center gap-2 text-[#D4AF37] font-black text-sm mb-3">
                    <Sparkles size={16} /> 하티의 원포인트 레슨
                  </h4>
                  <p className="text-[#5D4037] text-sm font-bold leading-relaxed">{result.advice}</p>
                </section>
              </div>
           </div>

           <button 
             onClick={onBack}
             className="w-full p-5 bg-[#1E293B] text-white font-black rounded-3xl hover:bg-black transition-colors"
           >
             정보 저장 및 결과 닫기
           </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DeepAnalysisView;
