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
    <div className="w-full flex flex-col gap-4 py-2">
      <div className="flex flex-col gap-4">
        {/* Question Area */}
        <div style={{ 
          background: 'rgba(212, 175, 55, 0.05)', 
          padding: '24px 20px', 
          borderRadius: '24px', 
          border: '1px solid rgba(212, 175, 55, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
           <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
              <Sparkles size={60} color="#D4AF37" />
           </div>
           <p style={{ fontSize: '15.5px', fontWeight: 900, color: '#2D1F08', lineHeight: 1.6, textAlign: 'center', wordBreak: 'keep-all', position: 'relative', zIndex: 1 }}>
             "{questionText || "서로에게 궁금한 비밀을 물어보세요."}"
           </p>
        </div>

        <div className="flex flex-col gap-3">
           {/* My Answer Section */}
           <div style={{ background: 'white', padding: '15px 18px', borderRadius: '20px', border: '1px solid #F5E6CC', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                 <div style={{ width: '22px', height: '22px', background: '#F5D060', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Heart size={12} fill="white" /></div>
                 <span style={{ fontSize: '12px', fontWeight: 900, color: '#8B7355' }}>나의 답변</span>
              </div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#2D1F08', lineHeight: 1.5 }}>
                 {myAnswer ? myAnswer : "아직 답변을 입력하지 않았어요."}
              </p>
           </div>

           {/* Spouse Answer Section */}
           <div style={{ 
             padding: '15px 18px', 
             borderRadius: '20px', 
             border: '1px solid',
             borderColor: myAnswer ? 'rgba(138, 96, 255, 0.2)' : '#EEE',
             background: myAnswer ? 'rgba(138, 96, 255, 0.03)' : 'rgba(0,0,0,0.02)',
             transition: '0.3s'
           }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                 <div style={{ width: '22px', height: '22px', background: myAnswer ? '#8A60FF' : '#94A3B8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                   {myAnswer ? <Heart size={12} fill="white" /> : <Lock size={12} />}
                 </div>
                 <span style={{ fontSize: '12px', fontWeight: 900, color: myAnswer ? '#8A60FF' : '#94A3B8' }}>배우자의 답변</span>
              </div>
              
              {!myAnswer ? (
                <div style={{ padding: '10px 0', textAlign: 'center' }}>
                   <p style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8' }}>내 답변을 완료해야 볼 수 있어요!</p>
                </div>
              ) : spouseAnswer ? (
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#4D3A1A', lineHeight: 1.5 }}>
                   "{spouseAnswer}"
                </p>
              ) : (
                <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                   <HattiCharacter state="thinking" size={35} />
                   <p style={{ fontSize: '11px', fontWeight: 900, color: '#8A60FF' }}>하티가 배우자의 답변을 기다려요...</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {!myAnswer && (
        <div style={{ 
          marginTop: '10px',
          padding: '6px', 
          background: 'white', 
          borderRadius: '18px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          border: '2px solid #D4AF37',
          boxShadow: '0 8px 20px rgba(212, 175, 55, 0.15)'
        }}>
           <input 
            autoFocus
            type="text" 
            placeholder="마음의 답변을 적어주세요..." 
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            style={{ flex: 1, border: 'none', background: 'transparent', padding: '10px 12px', fontSize: '14px', fontWeight: 800, outline: 'none' }}
           />
           <button 
            disabled={!localInput.trim()}
            onClick={handleSend}
            style={{ 
              width: '44px', height: '44px', borderRadius: '14px', 
              background: localInput.trim() ? '#2D1F08' : '#EEE', 
              color: localInput.trim() ? 'white' : '#AAA',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', transition: '0.3s'
            }}
           >
             <Send size={18} />
           </button>
        </div>
      )}
    </div>
  );
};

export default SecretAnswerInteraction;
