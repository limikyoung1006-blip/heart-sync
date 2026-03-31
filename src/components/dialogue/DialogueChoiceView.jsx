import React from 'react';
import { ChevronLeft, Heart, Image as ImageIcon } from 'lucide-react';

const DialogueChoiceView = ({ onSelect, onBack }) => {
  const appTheme = {
    primary: '#8A60FF',
    secondary: '#D4AF37',
    text: '#2D1F08',
    subText: '#8B7355',
    background: '#FDFCF0'
  };

  return (
    <div 
      style={{ 
        padding: '25px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '25px', 
        minHeight: '100%', 
        background: appTheme.background,
        paddingBottom: '120px',
        touchAction: 'pan-y'
      }}
    >
       <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
         <button onClick={onBack} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
           <ChevronLeft size={24} color={appTheme.primary} />
           <span style={{ fontWeight: 900, color: appTheme.primary }}>홈으로</span>
         </button>
       </header>

       <div className="choice-header text-center" style={{ marginBottom: '5px' }}>
         <h2 style={{ fontSize: '12px', fontWeight: 900, color: appTheme.primary, letterSpacing: '2px', marginBottom: '8px' }}>LOVE SYNC PROJECT</h2>
         <h1 style={{ fontSize: '28px', fontWeight: 900, color: appTheme.text, marginBottom: '8px', letterSpacing: '-1px' }}>오늘의 동기화 대화</h1>
         <p style={{ fontSize: '14.5px', color: appTheme.subText, fontWeight: 700 }}>대화의 깊이에 따라 선택해 보세요</p>
         <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
            <div style={{ height: '4px', width: '30px', background: '#D4AF37', borderRadius: '100px' }} />
            <div style={{ height: '4px', width: '10px', background: '#AB47BC', borderRadius: '100px' }} />
         </div>
       </div>

       <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Choice 1: Question Cards */}
          <button 
            onClick={() => onSelect('cardGame')}
            style={{ 
              background: 'white', padding: '28px 22px', borderRadius: '35px', 
              display: 'flex', alignItems: 'center', gap: '20px', 
              border: '1.5px solid rgba(212, 175, 55, 0.25)', 
              textAlign: 'left', width: '100%',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 8px 25px rgba(212, 175, 55, 0.04)',
              cursor: 'pointer'
            }}
          >
            <div style={{ 
              width: '65px', height: '65px', borderRadius: '22px', 
              background: '#FFF9C4', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Heart size={32} color="#D4AF37" fill="#D4AF37" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: appTheme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>언어의 창 : 질문 카드</h3>
              <p style={{ fontSize: '13.5px', color: appTheme.subText, fontWeight: 600, lineHeight: 1.5, wordBreak: 'keep-all' }}>150개 이상의 질문으로<br/>서로의 생각을 깊게 발견해요</p>
            </div>
          </button>

          {/* Choice 2: Image Game */}
          <button 
            onClick={() => onSelect('imageSync')}
            style={{ 
              background: 'white', padding: '28px 22px', borderRadius: '35px', 
              display: 'flex', alignItems: 'center', gap: '20px', 
              border: '1.5px solid rgba(171, 71, 188, 0.25)', 
              textAlign: 'left', width: '100%',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 8px 25px rgba(171, 71, 188, 0.04)',
              cursor: 'pointer'
            }}
          >
            <div style={{ 
              width: '65px', height: '65px', borderRadius: '22px', 
              background: '#E1BEE7', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <ImageIcon size={32} color="#AB47BC" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: appTheme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>마음의 창 : IMAGE SYNC</h3>
              <p style={{ fontSize: '13.5px', color: appTheme.subText, fontWeight: 600, lineHeight: 1.5, wordBreak: 'keep-all' }}>이미지를 통해 감성이 이어지는<br/>특별한 마음 동기화</p>
              <div style={{ display: 'inline-block', width: 'fit-content', background: '#AB47BC', color: 'white', padding: '2px 10px', borderRadius: '100px', fontSize: '9px', fontWeight: 900, marginTop: '5px' }}>NEW IMAGE SYNC</div>
            </div>
          </button>
        </div>

        <div style={{ 
          marginTop: 'auto', 
          padding: '25px 20px', 
          background: 'rgba(138, 96, 255, 0.04)', 
          borderRadius: '25px', 
          border: '1.5px dashed rgba(138, 96, 255, 0.2)', 
          textAlign: 'center' 
        }}>
          <p style={{ fontSize: '13.5px', color: appTheme.primary, fontWeight: 800, lineHeight: 1.7, letterSpacing: '-0.3px' }}>
            💡 "솔직한 마음은 관계를 더 단단하게 합니다."<br/>
            <span style={{ color: '#6B46C1' }}>오늘 배우자와 나누고 싶은 대화의 방식은 무엇인가요?</span>
          </p>
        </div>
    </div>
  );
};

export default DialogueChoiceView;
