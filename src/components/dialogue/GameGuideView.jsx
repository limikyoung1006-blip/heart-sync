import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Sparkles, BookOpen, Infinity, Camera, Zap, Heart, ArrowRight } from 'lucide-react';

const GameGuideView = ({ gameId, onStart, onBack }) => {
  // Support both ID strings to ensure correct content matches
  const isImageGame = gameId === 'imageSync' || gameId === 'imageGame';
  
  return (
    <div 
      style={{ 
        padding: '20px', 
        minHeight: '100%', 
        background: '#FDFCF0', 
        display: 'flex', 
        flexDirection: 'column',
        paddingBottom: '160px' 
      }}
    >
      <header style={{ marginBottom: '30px', paddingTop: '10px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '10px 0' }}>
          <ChevronLeft size={24} color={isImageGame ? "#AB47BC" : "#D4AF37"} />
          <span style={{ fontWeight: 900, color: isImageGame ? "#AB47BC" : "#D4AF37" }}>돌아가기</span>
        </button>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ 
          width: '90px', height: '90px', borderRadius: '35px', 
          background: isImageGame ? '#E1BEE7' : '#FFF9C4',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px'
        }}>
          {isImageGame ? <Sparkles size={45} color="#AB47BC" /> : <BookOpen size={45} color="#D4AF37" />}
        </div>

        <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#2D1F08', marginBottom: '12px' }}>
          {isImageGame ? "마음의 창: IMAGE SYNC" : "언어의 창: 질문 카드"}
        </h2>
        <p style={{ fontSize: '15.5px', color: '#8B7355', fontWeight: 600, lineHeight: 1.6, marginBottom: '35px', wordBreak: 'keep-all', padding: '0 10px' }}>
          {isImageGame 
            ? "글보다 더 깊은 울림을 주는 이미지를 통해\n배우자의 숨겨진 마음과 감각을 연결해보세요."
            : "150개 이상의 질문 카드를 통해\n평소 나누지 못했던 깊은 속마음을 발견해보세요."}
        </p>

        <div style={{ width: '100%', background: 'white', borderRadius: '30px', padding: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.03)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 900, color: '#2D1F08', opacity: 0.5, letterSpacing: '1px' }}>GUIDE & RULES</h3>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: isImageGame ? '#F3E5F5' : '#FFFDE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {isImageGame ? <Infinity size={22} color="#AB47BC" /> : <Zap size={22} color="#D4AF37" />}
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 900, color: '#2D1F08', marginBottom: '2px' }}>{isImageGame ? "두 가지 플레이 모드" : "5가지 대화 카테고리"}</h4>
              <p style={{ fontSize: '13px', color: '#8B7355', fontWeight: 600, lineHeight: 1.5 }}>
                {isImageGame 
                  ? "무작위 이미지를 확인하거나, 10장의 이미지 중\n현재 내 기분을 나타내는 2장을 골라보세요."
                  : "일상, 상상, 관계, 추억, 그리고 신앙.\n원하는 주제를 골라 깊은 대화를 시작하세요."}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: isImageGame ? '#F3E5F5' : '#FFFDE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {isImageGame ? <Camera size={22} color="#AB47BC" /> : <Heart size={22} color="#D4AF37" />}
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 900, color: '#2D1F08', marginBottom: '2px' }}>{isImageGame ? "실시간 동기화" : "대화의 완성 (10카드)"}</h4>
              <p style={{ fontSize: '13px', color: '#8B7355', fontWeight: 600, lineHeight: 1.5 }}>
                {isImageGame
                  ? "상대방이 고른 이미지가 내 화면에도 실시간으로\n나타납니다. 서로의 감각에 완전히 집중해 보세요."
                  : "질문을 뽑고 충분히 대화한 뒤 턴을 넘기세요.\n10장의 카드를 다 나누면 특별한 안내가 제공됩니다."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <button 
          onClick={onStart}
          style={{ 
            width: '100%', padding: '20px', borderRadius: '25px', 
            background: isImageGame ? '#AB47BC' : '#D4AF37', 
            color: 'white', fontWeight: 900, fontSize: '17px', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
          }}
        >
          대화 시작하기 <ArrowRight size={22} />
        </button>
      </div>
    </div>
  );
};

export default GameGuideView;
