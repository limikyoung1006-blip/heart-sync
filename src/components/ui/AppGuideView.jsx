import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

const AppGuideView = ({ onBack }) => {
  const features = [
    {
      title: "🚦 부부 신호등 (Mood Signal)",
      icon: "❤️",
      desc: "말하지 않아도 서로의 기분 상태를 실시간 확인하고 배려할 수 있습니다. 배우자가 지쳐있을 땐 하티가 특별한 대응 가이드를 드려요.",
      tip: "출근 후 혹은 퇴근 전, 나의 현재 신호를 먼저 보내보세요. 배우자가 미리 준비할 수 있는 힘이 됩니다."
    },
    {
      title: "🃏 오늘의 시크릿 카드",
      icon: "🤫",
      desc: "매일 한 번, 부부의 신비로운 질문이 도착합니다. 서로의 답변을 확인하기 위해 카드를 뒤집는 설렘을 느껴보세요.",
      tip: "함께 침대에 누웠을 때나 차 안에서 조용히 카드를 열어보고 대화를 나눠보세요."
    },
    {
      title: "🃏 5가지 테마 대화 카드",
      icon: "🎭",
      desc: "일상부터 상상, 추억, 관계, 신앙까지! 평소에 차마 묻지 못했던 깊은 질문들을 밸런스 게임처럼 즐길 수 있습니다.",
      tip: "외식이나 데이트 나갈 때 대화 카드를 켜보세요. 스마트폰만 보던 시간이 풍성한 대화의 시간으로 바뀝니다."
    },
    {
      title: "🙏 속마음 기도 (Prayer Wall)",
      icon: "🕯️",
      desc: "말하기 쑥스러운 고민이나 기도제목을 조용히 남겨보세요. 배우자가 읽고 함께 기도해줄 수 있는 따뜻한 공간입니다.",
      tip: "지친 배우자에게 말로 하기 힘든 응원을 기도로 남겨두면, 나중에 열어본 배우자에게 큰 감동이 됩니다."
    },
    {
      title: "📊 종합 분석 리포트",
      icon: "📑",
      desc: "한 달간의 상호작용을 AI 하티가 분석하여 부부만을 위한 특별한 리포트를 작성해 드립니다. 우리 부부만의 강점과 개선점을 확인하세요.",
      tip: "매월 말 부부가 함께 리포트를 읽으며 한 달을 돌아보는 '리포트 데이트' 시간을 가져보세요."
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="guide-page h-full bg-white overflow-y-auto p-6 pb-24">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 -ml-2"><ChevronLeft size={24} color="#2D1F08" /></button>
        <div className="flex flex-col">
          <h2 className="text-xl font-black text-[#2D1F08]">이용 가이드</h2>
          <span className="text-[10px] font-black text-[#B08D3E] tracking-widest uppercase mt-1">Heart Sync Guide & Tips</span>
        </div>
      </header>

      <div className="space-y-6">
        {features.map((f, i) => (
          <div key={i} className="bg-[#FDFCF0] p-6 rounded-[32px] border border-[#F5E6CC]">
             <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="text-lg font-black text-[#2D1F08]">{f.title}</h3>
             </div>
             <p className="text-sm font-bold text-[#5D4037] leading-relaxed mb-4 break-keep">
               {f.desc}
             </p>
             <div className="bg-white/60 p-4 rounded-2xl border border-white">
                <p className="text-xs font-black text-[#B08D3E] mb-1">💡 활용 꿀팁</p>
                <p className="text-xs font-bold text-[#8B7355] leading-relaxed">{f.tip}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="mt-10 mb-6 text-center">
         <p className="text-xs font-black text-gray-300">© 2024 Heart Sync Team. All rights reserved.</p>
      </div>
    </motion.div>
  );
};

export default AppGuideView;
