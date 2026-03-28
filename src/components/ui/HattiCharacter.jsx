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
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      position: 'relative', 
      ...style 
    }}>
      <motion.div 
        animate={{ 
          y: state === 'floating' ? [0, -15, 0] : 0, 
        }}
        transition={{ 
          duration: 3.5, 
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
          zIndex: 100
        }}
      >
        <img 
          src="/hatti_3d_v2.png" 
          alt="Hatti" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain', 
            zIndex: 5,
            position: 'relative',
            pointerEvents: 'none'
          }}
        />
        
        {/* 🔮 Lightweight Aura (No Blur for performance) */}
        <div 
          style={{ 
            position: 'absolute', 
            inset: '-20%', 
            background: 'radial-gradient(circle, rgba(138, 96, 255, 0.15) 0%, transparent 70%)', 
            zIndex: 1,
            borderRadius: '50%'
          }} 
        />
        
        {/* 🌑 Fixed Shadow */}
        <div 
          style={{ 
            position: 'absolute', 
            bottom: '-15%', 
            left: '20%', 
            right: '20%', 
            height: '8px', 
            background: 'rgba(0,0,0,0.15)', 
            borderRadius: '50%',
            zIndex: 0
          }} 
        />
      </motion.div>
    </div>
  );
};

export default HattiCharacter;
