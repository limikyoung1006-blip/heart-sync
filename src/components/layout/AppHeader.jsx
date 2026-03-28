import React from 'react';
import { Bell, User, Heart } from 'lucide-react';

const AppHeader = ({ activeTab, changeTab, user }) => {
  return (
    <header 
      style={{ 
        width: '100%', 
        padding: '16px 20px', 
        background: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(10px)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
      }}
    >
      <div 
        onClick={() => changeTab('home')}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          cursor: 'pointer' 
        }}
      >
        <div style={{
          width: '32px',
          height: '32px',
          background: 'linear-gradient(135deg, #FF9966, #FF5E62)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(255, 94, 98, 0.3)'
        }}>
          <Heart size={18} color="white" fill="white" />
        </div>
        <span style={{ 
          fontSize: '18px', 
          fontWeight: 900, 
          color: '#2D1F08', 
          letterSpacing: '-0.5px' 
        }}>
          HEART SYNC
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button 
          onClick={() => alert('알림 준비 중입니다.')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#8B7355', 
            position: 'relative',
            padding: '4px'
          }}
        >
          <Bell size={22} />
          <div style={{ 
            position: 'absolute', 
            top: '2px', 
            right: '2px', 
            width: '8px', 
            height: '8px', 
            background: '#FF4D6D', 
            borderRadius: '50%',
            border: '2px solid white'
          }} />
        </button>
        
        <button 
          onClick={() => changeTab('settings')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#8B7355',
            padding: '4px'
          }}
        >
          <User size={22} />
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
