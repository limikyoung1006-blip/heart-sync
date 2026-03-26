import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, 
  Sparkles, 
  BookOpen, 
  MessageCircle, 
  Heart, 
  Send, 
  Smile,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../supabase';

const extractYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const WorshipView = ({ userRole, coupleCode }) => {
  const [praiseUrl, setPraiseUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [allPrayers, setAllPrayers] = useState([]);

  useEffect(() => {
    fetchPrayers();
    // In a real app, subscribe to realtime here if needed
  }, [coupleCode]);

  const fetchPrayers = async () => {
    const { data } = await supabase
      .from('prayers')
      .select('*')
      .eq('couple_id', coupleCode)
      .order('created_at', { ascending: false });
    
    if (data) {
      setAllPrayers(data.map(p => ({
        ...p,
        type: p.user_role === userRole ? 'mine' : 'partner',
        date: new Date(p.created_at).toLocaleDateString('ko-KR')
      })));
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    
    // Simulated AI result
    setCurrentSession({
      word: { ref: "에베소서 5:22-25", text: "아내들이여 자기 남편에게 복종하기를 주께 하듯 하라... 남편들아 아내 사랑하기를 그리스도께서 교회를 사랑하시고 그 교회를 위하여 자신을 주심 같이 하라" },
      interpretation: "결혼은 단순한 약속이 아닌 거룩한 언약입니다. 서로의 부족함을 정죄하기보다, 주님이 나를 통해 채우라고 하시는 사명으로 바라볼 때 진정한 기쁨이 차오릅니다.",
      questions: ["최근 배우자에게 가장 고마웠던 순간은 언제인가요?", "말씀 속에서 우리 가정이 회복해야 할 영역은 어디인가요?"]
    });
    setIsGenerating(false);
  };

  const handleRecord = async () => {
    if (!topic.trim()) return;
    const { error } = await supabase.from('prayers').insert({
      couple_id: coupleCode,
      user_role: userRole,
      text: topic.trim(),
      created_at: new Date().toISOString()
    });
    
    if (!error) {
      setTopic("");
      fetchPrayers();
    }
  };

  const youtubeId = useMemo(() => extractYoutubeId(praiseUrl), [praiseUrl]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="worship-container flex flex-col gap-6 p-5 pb-20 overflow-y-auto h-full">
      {/* 1. Praise (Premium Glass Cinema Style) */}
      <div className="worship-section-card bg-white/70 backdrop-blur-xl border border-white/50 rounded-[40px] shadow-sm overflow-hidden p-6">
        <div className="worship-label-row flex items-center gap-3 mb-4">
          <div className="worship-icon-circle bg-[#FF4D6D] w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg shadow-[#FF4D6D20]"><Music size={18} /></div>
          <span className="worship-label-text font-black text-[10px] tracking-[4px] uppercase text-[#CD7386]">PREMIUM PRAISE STUDIO</span>
        </div>

        {/* Floating Glass Cinema Player */}
        <div className="relative mb-6">
          <div className="relative w-full pb-[56.25%] bg-black rounded-[32px] overflow-hidden shadow-2xl shadow-black/30 border border-white/10 isolation-auto">
            {youtubeId ? (
              <iframe 
                className="absolute inset-0 w-full h-full border-none"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&modestbranding=1&rel=0`} 
                title="Praise Player" 
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1e293b] to-black">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center"
                >
                  <Music size={40} color="white" />
                </motion.div>
                <p className="text-white/40 text-xs font-black mt-4">찬양 링크를 기다리고 있습니다</p>
              </div>
            )}
          </div>
          {youtubeId && <div className="absolute -inset-10 bg-[#FF4D6D] opacity-20 blur-[80px] -z-10" />}
        </div>

        <div className="bg-[#F8FAFB] p-4 rounded-2xl flex items-center gap-3 border border-[#E2E8F0]">
          <div className="text-[#F5D060]"><Sparkles size={18} /></div>
          <input 
            type="text" 
            placeholder="함께 듣고 싶은 찬양 URL" 
            value={praiseUrl}
            onChange={(e) => setPraiseUrl(e.target.value)}
            className="bg-transparent flex-1 text-sm font-bold outline-none text-[#2D1F08]"
          />
        </div>
      </div>

      {/* 2. Header Section */}
      <div className="worship-section-card bg-gradient-to-br from-[#FDFCF0] to-[#F5F3E6] rounded-[40px] p-8 text-center shadow-sm">
        <h2 className="text-2xl font-black text-[#2D1F08] mb-2">가정 예배 가이드</h2>
        <p className="text-sm font-bold text-[#8B7355] mb-6">오늘 우리 가정에 주시는 하나님의 메시지</p>
        
        <button onClick={handleGenerate} disabled={isGenerating} className="mx-auto w-full max-w-[240px] p-4 bg-[#2D1F08] text-white rounded-full flex items-center justify-center gap-3 font-black shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95">
          {isGenerating ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
          <span>{currentSession ? "예배 본문 새로고침" : "오늘의 예배 시작하기"}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {currentSession && !isGenerating && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
            <div className="bg-white p-7 rounded-[40px] shadow-sm border border-[#F1F5F9]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-[#F5D060]/20 rounded-full flex items-center justify-center text-[#F5D060]"><BookOpen size={18} /></div>
                <span className="font-black text-xs text-[#8B7355]">WORD 오늘의 말씀</span>
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase text-[#B08D3E] tracking-widest">{currentSession.word.ref}</span>
                <p className="text-lg font-black leading-relaxed text-[#2D1F08] break-keep">{currentSession.word.text}</p>
              </div>
            </div>

            <div className="bg-white p-7 rounded-[40px] shadow-sm border border-[#F1F5F9]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 bg-[#8A60FF]/10 rounded-full flex items-center justify-center text-[#8A60FF]"><Sparkles size={18} /></div>
                  <span className="font-black text-xs text-[#8A60FF]">MEDITATION 말씀 해석</span>
                </div>
                <p className="text-[15px] font-bold text-[#475569] leading-relaxed break-keep">{currentSession.interpretation}</p>
            </div>

            <div className="bg-white p-7 rounded-[40px] shadow-sm border border-[#F1F5F9]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 bg-[#4BD991]/10 rounded-full flex items-center justify-center text-[#4BD991]"><MessageCircle size={18} /></div>
                  <span className="font-black text-xs text-[#2A9D8F]">SHARING 나눔 질문</span>
                </div>
                <div className="space-y-3">
                  {currentSession.questions.map((q, i) => (
                    <div key={i} className="p-4 bg-[#F8FAFB] rounded-2xl text-sm font-bold text-[#475569] border border-[#E2E8F0]">
                       Q{i+1}. {q}
                    </div>
                  ))}
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white p-7 rounded-[40px] shadow-sm border border-[#F1F5F9]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-[#FF9966]/10 rounded-full flex items-center justify-center text-[#FF9966]"><Heart size={18} /></div>
          <span className="font-black text-xs text-[#AF6B48]">PRAYER 기도의 정원</span>
        </div>
        
        <div className="space-y-4 mb-10">
           <textarea 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="함께 나눈 기도제목을 기록하세요..." 
            className="w-full min-h-[100px] p-5 bg-[#FDFCF0] rounded-3xl text-sm font-bold border-none focus:ring-2 ring-[#F5D060]/50 outline-none resize-none"
           />
           <button onClick={handleRecord} className="w-full p-4 bg-[#2D1F08] text-white rounded-full font-black flex items-center justify-center gap-3 text-sm">
             <Send size={16} /> 기도제목 기록하기
           </button>
        </div>

        <div className="space-y-4">
           {allPrayers.length === 0 ? (
             <div className="text-center py-20 bg-[#FDFCF0]/50 rounded-[32px] border-2 border-dashed border-[#E2E8F0]">
               <Smile size={48} className="mx-auto text-[#D4AF37]/30 mb-4" />
               <p className="text-sm font-bold text-[#8B7355]/60">첫 마음을 담은 기도를 남겨보세요.</p>
             </div>
           ) : (
             allPrayers.slice(0, 5).map((p) => (
               <motion.div key={p.id} className={`p-4 rounded-3xl border-l-[6px] ${p.type === 'mine' ? 'bg-white border-[#F5D060]' : 'bg-[#8A60FF]/5 border-[#8A60FF]'} shadow-sm`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#B08D3E]">{p.type === 'mine' ? '나의 기도' : '배우자의 기도'}</span>
                    <span className="text-[10px] text-gray-400 font-bold">{p.date}</span>
                  </div>
                  <p className="text-[14px] font-bold text-[#2D1F08] leading-normal">{p.text}</p>
               </motion.div>
             ))
           )}
        </div>
      </div>
    </motion.div>
  );
};

export default WorshipView;
