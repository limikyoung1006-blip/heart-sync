import React from 'react';
import { motion } from 'framer-motion';

const HattiCharacter = ({ state = 'floating', size = 120, style = {} }) => {
  const getClassName = () => {
    if (state === 'thinking') return 'hatti-thinking';
    if (state === 'response') return 'hatti-response';
    return 'hatti-floating';
  };

  return (
    <div style={{ 
      perspective: '1500px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      position: 'relative', 
      filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.22))', 
      ...style 
    }}>
      <motion.div 
        initial={{ scale: 1, rotateX: 25 }} // 진입 시 작았다 커지는 효과 제거
        animate={{ 
          y: state === 'floating' ? [0, -28, 0] : 0, // 상하 부유만 유지
          rotateY: state === 'floating' ? [-16, 16, -16] : 0,
          rotateX: state === 'floating' ? [6, -6, 6] : 0,
          rotateZ: state === 'floating' ? [-4, 4, -4] : 0
        }}
        whileTap={{ 
          scale: 1.1, // 터치 시에만 살짝 강조
          rotateY: 360, 
          transition: { duration: 1, type: 'spring' } 
        }}
        transition={{ 
          duration: 4.5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        style={{ 
          width: size, 
          height: size, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          zIndex: 100,
          transformStyle: 'preserve-3d'
        }}
      >
        <img 
          src="/hatti_3d_v2.png" 
          alt="Hatti" 
          style={{ 
            width: '115%', 
            height: '115%', 
            objectFit: 'contain', 
            zIndex: 5,
            position: 'relative',
            pointerEvents: 'none'
          }}
        />
        
        {/* 🔮 Radiant Aura (크기 변화 없이 투명도만 은은하게) */}
        <motion.div 
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ 
            position: 'absolute', 
            inset: '-45%', 
            background: 'radial-gradient(circle, rgba(138, 96, 255, 0.3) 0%, rgba(245, 208, 96, 0.2) 35%, transparent 80%)', 
            filter: 'blur(50px)', 
            zIndex: 1,
            borderRadius: '50%',
            mixBlendMode: 'screen'
          }} 
        />
        
        {/* 🌑 Unreal Shadow (크기 고정, 부유에 따른 투명도 변화만) */}
        <motion.div 
          animate={{ 
            opacity: state === 'floating' ? [0.25, 0.1, 0.25] : 0.25,
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ 
            position: 'absolute', 
            bottom: '-45%', 
            left: '10%', 
            right: '10%', 
            height: '14px', 
            background: 'rgba(0,0,0,0.3)', 
            filter: 'blur(20px)',
            borderRadius: '50%',
            zIndex: 0,
            transform: 'translateZ(-80px)'
          }} 
        />
      </motion.div>
    </div>
  );
};

export default HattiCharacter;
