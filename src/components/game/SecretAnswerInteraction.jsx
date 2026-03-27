import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Send, 
  ChevronRight, 
  Heart, 
  Sparkles, 
  Lock 
} from 'lucide-react';
import HattiCharacter from '../ui/HattiCharacter';

const SecretAnswerInteraction = ({ 
  userRole, 
  coupleCode, 
  questionText, 
  supabase, 
  mainChannel, 
  spouseAnswer, 
  setSpouseAnswer, 
  myAnswer, 
  setMyAnswer, 
  answered, 
  setAnswered,
  onClose 
}) => {
  const [localInput, setLocalInput] = useState('');
  
  const handleSend = async () => {
    if (!localInput.trim()) return;
    
    // Save to local state
    setMyAnswer(localInput);
    setAnswered(true);
    
    // Log to localStorage for persistence
    localStorage.setItem('mySecretAnswer', localInput);
    localStorage.setItem('isMySecretAnswered', 'true');
    
    // Broadcast via Supabase channel if available
    if (mainChannel) {
      mainChannel.send({
        type: 'broadcast',
        event: 'secret-answered',
        payload: { 
          sender: userRole, 
          text: localInput, 
          ts: Date.now() 
        }
      });
    }

    // Sync to Database
    try {
      if (supabase && coupleCode) {
        const { data: profile } = await supabase.auth.getSession();
        if (profile?.session?.user?.id) {
           await supabase.from('profiles').upsert({
             id: profile.session.user.id,
             couple_id: coupleCode.toLowerCase().trim(),
             user_role: userRole,
             info: {
               lastSecretAnswer: localInput,
               lastSecretAnswerDate: new Date().toISOString().split('T')[0]
             }
           });
        }
      }
    } catch (e) {
      console.error("DB Sync error:", e);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-0 z-[7000] bg-white flex flex-col p-6"
    >
      <header className="flex justify-between items-center mb-8">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-[#8A60FF] tracking-widest uppercase mb-1">Secret Card Interaction</span>
          <h2 className="text-xl font-black text-[#2D1F08]">오늘의 시크릿 답변</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <X size={24} color="#2D1F08" />
          </button>
        )}
      </header>

      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pb-10">
        <div className="bg-[#FDFCF0] p-8 rounded-[40px] border-2 border-[#D4AF3730] relative overflow-hidden">
           <div className="absolute top-[-20px] left-[-20px] opacity-10 rotate-12">
              <Sparkles size={120} color="#D4AF37" />
           </div>
           <p className="text-lg font-black text-[#2D1F08] leading-relaxed relative z-10 break-keep">
             "{questionText || "서로에게 궁금한 비밀을 물어보세요."}"
           </p>
        </div>

        <div className="space-y-6">
           {/* My Answer Section */}
           <div className="bg-white p-6 rounded-[32px] border-2 border-[#F5E6CC] shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 bg-[#F5D060] rounded-full flex items-center justify-center text-white"><Heart size={16} /></div>
                 <span className="text-sm font-black text-[#2D1F08]">나의 답변</span>
              </div>
              <p className="text-[15px] font-bold text-[#8B7355] leading-relaxed italic">
                 {myAnswer ? `"${myAnswer}"` : "아직 답변을 입력하지 않았어요."}
              </p>
           </div>

           {/* Spouse Answer Section (Locked Logic) */}
           <div className={`p-8 rounded-[32px] border-2 transition-all ${myAnswer ? 'bg-white border-[#8A60FF30]' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 bg-[#8A60FF] rounded-full flex items-center justify-center text-white"><Lock size={16} /></div>
                 <span className="text-sm font-black text-[#2D1F08]">배우자의 답변</span>
              </div>
              
              {!myAnswer ? (
                <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
                   <Lock size={32} color="#94A3B8" />
                   <p className="text-xs font-black text-[#94A3B8] leading-relaxed">나의 답변을 먼저 완료해야<br/>배우자의 답변도 열어볼 수 있어요!</p>
                </div>
              ) : spouseAnswer ? (
                <p className="text-[15px] font-bold text-[#4D3A1A] leading-relaxed animate-in fade-in slide-in-from-bottom-2">
                   "{spouseAnswer}"
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
                   <HattiCharacter state="thinking" size={80} />
                   <p className="text-sm font-black text-[#8A60FF] bg-[#8A60FF10] px-4 py-2 rounded-full">
                     하티가 배우자의 답변을 기다리고 있어요...
                   </p>
                </div>
              )}
           </div>
        </div>
      </div>

      {!myAnswer && (
        <div className="p-4 bg-[#F8FAFB] rounded-[32px] flex items-center gap-3 border border-[#E2E8F0] shadow-xl">
           <input 
            autoFocus
            type="text" 
            placeholder="답변을 입력하고 카드를 뒤집으세요!" 
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            className="bg-transparent flex-1 p-2 text-sm font-black outline-none text-[#2D1F08]"
           />
           <button 
            disabled={!localInput.trim()}
            onClick={handleSend}
            className={`p-4 rounded-2xl transition-all shadow-lg ${localInput.trim() ? 'bg-[#2D1F08] text-white scale-105 active:scale-95' : 'bg-gray-200 text-gray-400'}`}
           >
             <Send size={18} />
           </button>
        </div>
      )}
    </motion.div>
  );
};

export default SecretAnswerInteraction;
