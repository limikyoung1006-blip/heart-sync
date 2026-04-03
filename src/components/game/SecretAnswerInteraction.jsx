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
    <div className="w-full flex flex-col gap-5 py-2">
      <div className="flex flex-col gap-4">
        {/* Question Area */}
        <div style={{ 
          background: 'rgba(212, 175, 55, 0.08)', 
          padding: '28px 24px', 
          borderRadius: '30px', 
          border: '1.5px solid rgba(212, 175, 55, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'inset 0 2px 10px rgba(212, 175, 55, 0.05)'
        }}>
           <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.15 }}>
              <Sparkles size={65} color="#D4AF37" />
           </div>
           <p style={{ fontSize: '16px', fontWeight: 900, color: '#2D1F08', lineHeight: 1.6, textAlign: 'center', wordBreak: 'keep-all', position: 'relative', zIndex: 1 }}>
             "{questionText || "서로에게 궁금한 비밀을 물어보세요."}"
           </p>
        </div>

        <div className="flex flex-col gap-4">
           {/* My Answer Section */}
           <div style={{ 
             background: 'white', 
             padding: '20px', 
             borderRadius: '24px', 
             border: '1px solid #F5E6CC', 
             boxShadow: '0 8px 15px rgba(187, 134, 0, 0.04)',
             display: 'flex',
             flexDirection: 'column',
             gap: '12px'
           }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <div style={{ width: '24px', height: '24px', background: '#F5D060', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 2px 5px rgba(245, 208, 96, 0.3)' }}><Heart size={14} fill="white" /></div>
                 <span style={{ fontSize: '13px', fontWeight: 900, color: '#5D4037' }}>나의 답변</span>
              </div>
              <div style={{ paddingLeft: '4px' }}>
                <p style={{ fontSize: '15px', fontWeight: 700, color: myAnswer ? '#2D1F08' : '#718096', lineHeight: 1.6 }}>
                   {myAnswer ? myAnswer : "아직 답변을 입력하지 않았어요."}
                </p>
              </div>
           </div>

            {/* Spouse Answer Section */}
            <div style={{ 
              padding: '20px', 
              borderRadius: '24px', 
              border: '1.5px solid',
              borderColor: myAnswer ? 'rgba(138, 96, 255, 0.4)' : 'rgba(148, 163, 184, 0.3)',
              background: myAnswer ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.8)', // Improved contrast
              transition: 'all 0.4s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.05)'
            }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', background: myAnswer ? '#8A60FF' : '#64748B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: myAnswer ? '0 2px 5px rgba(138, 96, 255, 0.3)' : 'none' }}>
                    {myAnswer ? <Heart size={14} fill="white" /> : <Lock size={12} />}
                  </div>
                  <span style={{ fontSize: '13.5px', fontWeight: 900, color: myAnswer ? '#6D28D9' : '#475569' }}>배우자의 답변</span>
               </div>
               
               <div style={{ paddingLeft: '4px' }}>
                 {!myAnswer ? (
                   <div style={{ padding: '8px 0', textAlign: 'center' }}>
                      <p style={{ fontSize: '13px', fontWeight: 800, color: '#475569', letterSpacing: '-0.3px' }}>내 답변을 완료해야 볼 수 있어요!</p>
                   </div>
                 ) : spouseAnswer ? (
                   <p style={{ fontSize: '16px', fontWeight: 800, color: '#2D1F08', lineHeight: 1.6 }}>
                      "{spouseAnswer}"
                   </p>
                 ) : (
                   <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <HattiCharacter state="thinking" size={40} />
                      <p style={{ fontSize: '13px', fontWeight: 900, color: '#7C3AED', animation: 'pulse 2s infinite' }}>하티가 배우자의 답변을 기다려요...</p>
                   </div>
                 )}
               </div>
            </div>
        </div>
      </div>

      {!myAnswer && (
        <div style={{ 
          marginTop: '15px',
          padding: '8px', 
          background: 'white', 
          borderRadius: '22px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          border: '2px solid #D4AF37',
          boxShadow: '0 10px 25px rgba(212, 175, 55, 0.2)'
        }}>
           <input 
            autoFocus
            type="text" 
            placeholder="마음의 답변을 적어주세요..." 
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            style={{ 
              flex: 1, 
              border: 'none', 
              background: 'transparent', 
              padding: '12px 15px', 
              fontSize: '15px', 
              fontWeight: 800, 
              outline: 'none',
              color: '#1A1104'
            }}
           />
           <button 
            disabled={!localInput.trim()}
            onClick={handleSend}
            style={{ 
              width: '48px', height: '48px', borderRadius: '16px', 
              background: localInput.trim() ? '#2D1F08' : '#F1F5F9', 
              color: localInput.trim() ? 'white' : '#94A3B8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', transition: 'all 0.3s ease',
              boxShadow: localInput.trim() ? '0 5px 12px rgba(45, 31, 8, 0.25)' : 'none'
            }}
           >
             <Send size={20} />
           </button>
        </div>
      )}
    </div>
  );
};

export default SecretAnswerInteraction;
