import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Heart, Sparkles, Image as ImageIcon, ArrowRight } from 'lucide-react';

const DialogueChoiceView = ({ onSelect, onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      style={{ 
        padding: '25px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '30px', 
        minHeight: '100vh', 
        background: '#FDFCF0',
        paddingBottom: '120px' 
      }}
    >
       <header style={{ marginBottom: '10px' }}>
         <button onClick={onBack} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
           <ChevronLeft size={24} color="#8A60FF" />
           <span style={{ fontWeight: 900, color: '#8A60FF' }}>돌아가기</span>
         </button>
       </header>

       <div className="choice-header text-center" style={{ marginBottom: '10px' }}>
         <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#2D1F08', marginBottom: '10px', letterSpacing: '-1px' }}>오늘의 동기화 대화</h1>
         <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
            <div style={{ height: '4px', width: '30px', background: '#D4AF37', borderRadius: '100px' }} />
            <div style={{ height: '4px', width: '10px', background: '#AB47BC', borderRadius: '100px' }} />
         </div>
       </div>

       <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
         {/* Choice 1: Question Cards */}
         <button 
           onClick={() => onSelect('cardGame')}
           style={{ 
             background: 'white', padding: '35px 25px', borderRadius: '35px', 
             display: 'flex', alignItems: 'center', gap: '20px', border: '3px solid #FFFDE7', 
             boxShadow: '0 20px 40px rgba(0,0,0,0.06)', textAlign: 'left', width: '100%',
             position: 'relative', overflow: 'hidden'
           }}
         >
           <div style={{ 
             width: '75px', height: '75px', borderRadius: '25px', 
             background: 'linear-gradient(135deg, #FFFDE7, #FFF9C4)', 
             display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
             boxShadow: '0 8px 15px rgba(212, 175, 55, 0.1)'
           }}>
             <Heart size={35} color="#D4AF37" fill="#D4AF37" />
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
             <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#2D1F08' }}>언어의 창 : 질문 카드</h3>
             <p style={{ fontSize: '13.5px', color: '#8B7355', fontWeight: 600, lineHeight: 1.4 }}>150개 이상의 질문으로<br/>서로의 생각을 깊게 발견해요</p>
           </div>
           <ArrowRight size={20} color="#D4AF37" style={{ opacity: 0.5 }} />
         </button>

         {/* Choice 2: Image Game */}
         <button 
           onClick={() => onSelect('imageGame')}
           style={{ 
             background: 'white', padding: '35px 25px', borderRadius: '35px', 
             display: 'flex', alignItems: 'center', gap: '20px', border: '3px solid #F3E5F5', 
             boxShadow: '0 20px 40px rgba(0,0,0,0.06)', textAlign: 'left', width: '100%',
             position: 'relative', overflow: 'hidden'
           }}
         >
           <div style={{ 
             width: '75px', height: '75px', borderRadius: '25px', 
             background: 'linear-gradient(135deg, #F3E5F5, #E1BEE7)', 
             display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
             boxShadow: '0 8px 15px rgba(171, 71, 188, 0.1)'
           }}>
             <ImageIcon size={35} color="#AB47BC" />
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
             <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#2D1F08' }}>마음의 창 : IMAGE SYNC</h3>
             <p style={{ fontSize: '13.5px', color: '#8B7355', fontWeight: 600, lineHeight: 1.4 }}>이미지를 통해 감성이 이어지는<br/>특별한 마음 동기화</p>
             <div style={{ position: 'absolute', top: '15px', right: '15px', background: '#AB47BC', color: 'white', padding: '3px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: 900, boxShadow: '0 4px 10px rgba(171, 71, 188, 0.3)' }}>NEW</div>
           </div>
           <ArrowRight size={20} color="#AB47BC" style={{ opacity: 0.5 }} />
         </button>
       </div>

       <div style={{ marginTop: 'auto', padding: '25px', background: 'rgba(138, 96, 255, 0.05)', borderRadius: '25px', border: '1px dashed rgba(138, 96, 255, 0.2)', textAlign: 'center' }}>
         <p style={{ fontSize: '13px', color: '#8A60FF', fontWeight: 800, lineHeight: 1.6 }}>
           💡 "솔직한 마음은 관계를 더 단단하게 합니다."<br/>
           오늘 배우자와 나누고 싶은 대화의 방식은 무엇인가요?
         </p>
       </div>
    </motion.div>
  );
};

export default DialogueChoiceView;
