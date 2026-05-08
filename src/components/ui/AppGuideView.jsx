import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Sparkles, Heart, Lock, MessageCircle, BarChart3, Info } from 'lucide-react';

const AppGuideView = ({ onBack }) => {
  const features = [
    {
      title: "부부 신호등",
      subtitle: "Mood Signal",
      icon: <Heart size={24} className="text-rose-500" fill="currentColor" />,
      color: "from-rose-50 to-rose-100/50",
      accent: "rose",
      desc: "말하지 않아도 서로의 기분 상태를 실시간으로 확인하세요. 배우자가 지쳐있을 땐 하티가 특별한 대응 가이드를 드립니다.",
      tip: "퇴근 전 나의 신호를 먼저 보내보세요. 배우자가 마음의 준비를 할 수 있는 큰 힘이 됩니다."
    },
    {
      title: "오늘의 시크릿 카드",
      subtitle: "Daily Secret",
      icon: <Lock size={24} className="text-amber-500" />,
      color: "from-amber-50 to-amber-100/50",
      accent: "amber",
      desc: "매일 도착하는 신비로운 질문에 답해보세요. 서로의 답변을 확인하기 위해 카드를 뒤집는 설렘이 일상의 활력이 됩니다.",
      tip: "하루 일과를 마친 밤, 침대에서 함께 카드를 열어보고 조용히 대화를 나눠보세요."
    },
    {
      title: "테마 대화 카드",
      subtitle: "Dialogue Cards",
      icon: <MessageCircle size={24} className="text-indigo-500" />,
      color: "from-indigo-50 to-indigo-100/50",
      accent: "indigo",
      desc: "추억, 관계, 신앙 등 5가지 테마의 질문들! 평소 꺼내기 힘들었던 깊은 이야기들을 게임처럼 자연스럽게 즐길 수 있습니다.",
      tip: "외식이나 데이트 중 대화 카드를 켜보세요. 스마트폰만 보던 시간이 풍성한 교제로 바뀝니다."
    },
    {
      title: "속마음 기도",
      subtitle: "Prayer Wall",
      icon: <Sparkles size={24} className="text-purple-500" />,
      color: "from-purple-50 to-purple-100/50",
      accent: "purple",
      desc: "말로 하기 쑥스러운 고민이나 기도제목을 남겨보세요. 배우자가 읽고 함께 기도해줄 수 있는 우리 부부만의 거룩한 공간입니다.",
      tip: "배우자에게 보내는 짧은 응원을 기도로 남겨두세요. 나중에 열어본 배우자에게 큰 위로가 됩니다."
    },
    {
      title: "종합 분석 리포트",
      subtitle: "AI Report",
      icon: <BarChart3 size={24} className="text-emerald-500" />,
      color: "from-emerald-50 to-emerald-100/50",
      accent: "emerald",
      desc: "한 달간의 상호작용을 AI 하티가 분석해 드립니다. 우리 부부만의 소통 강점과 보완점을 전문가의 시선으로 확인하세요.",
      tip: "매월 말 리포트를 함께 읽으며 한 달을 돌아보는 '리포트 데이트' 시간을 가져보세요."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="guide-page h-full bg-[#FAFAFA] overflow-y-auto"
    >
      <div className="max-w-md mx-auto min-h-full flex flex-col p-6 pb-32">
        <header className="flex items-center gap-4 mb-10 pt-4">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={onBack} 
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100"
          >
            <ChevronLeft size={20} color="#2D1F08" />
          </motion.button>
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-[#2D1F08] tracking-tight">이용 가이드</h2>
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px] bg-[#D4AF37]"></span>
              <span className="text-[10px] font-black text-[#B08D3E] tracking-[0.2em] uppercase">Heart Sync Guide</span>
            </div>
          </div>
        </header>

        <div className="space-y-8">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div className={`bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 overflow-hidden`}>
                {/* Decorative Background */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${f.color} rounded-bl-full opacity-50 -mr-8 -mt-8`} />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{f.subtitle}</span>
                      <h3 className="text-xl font-black text-[#2D1F08]">{f.title}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center border border-gray-50">
                      {f.icon}
                    </div>
                  </div>

                  <p className="text-[15px] font-bold text-[#5D4037] leading-relaxed mb-8 break-keep opacity-90">
                    {f.desc}
                  </p>

                  <div className="bg-[#FDFCF0] p-5 rounded-3xl border border-[#F5E6CC]/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Info size={14} className="text-[#B08D3E]" />
                      <span className="text-xs font-black text-[#B08D3E]">활용 꿀팁</span>
                    </div>
                    <p className="text-xs font-bold text-[#8B7355] leading-relaxed break-keep">
                      {f.tip}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <footer className="mt-20 text-center opacity-30">
          <div className="flex flex-col items-center gap-2">
            <img src="/logo_main.png" alt="Logo" className="w-24 grayscale" />
            <p className="text-[10px] font-black tracking-widest">© 2024 HEART SYNC. ALL RIGHTS RESERVED.</p>
          </div>
        </footer>
      </div>
    </motion.div>
  );
};

export default AppGuideView;
