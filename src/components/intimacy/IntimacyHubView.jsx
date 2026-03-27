import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import HeartPrayerView from './HeartPrayerView';
import IntimacyModal from './IntimacyModal';

const IntimacyHubView = ({ user, userRole, coupleCode, supabase, mainChannel, onBack, partnerPrayers, setPartnerPrayers, bgImage, onBgUpload, partnerLabel, husbandInfo, wifeInfo, setHusbandInfo, setWifeInfo, updateProfileInfo, initialTab = 'prayer' }) => {
  const [subTab, setSubTab] = useState(initialTab); // 'prayer' or 'garden'
  const [modalSubPage, setModalSubPage] = useState('main');

  useEffect(() => {
    const handleNavToGarden = () => {
      setSubTab('garden');
      setModalSubPage('secrets');
    };
    window.addEventListener('nav-to-garden', handleNavToGarden);
    return () => window.removeEventListener('nav-to-garden', handleNavToGarden);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white" style={{ position: 'relative', zIndex: 10 }}>
      {/* Hub Header (Standalone) */}
      <div style={{
        padding: '25px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        background: 'linear-gradient(to bottom, #FFF, #FDFCF0)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        <div className="flex items-center gap-4">
           <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}>
             <ChevronLeft size={28} color="#2D1F08" />
           </button>
           <div className="flex flex-col">
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#2D1F08' }}>소통의 화원</h2>
              <span style={{ fontSize: '11px', color: '#B08D3E', fontWeight: 800, letterSpacing: '1px' }}>HUB OF INTIMACY</span>
           </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          background: 'rgba(0,0,0,0.06)', 
          borderRadius: '100px', 
          padding: '6px',
          border: '1px solid rgba(0,0,0,0.02)'
        }}>
          <button 
            onClick={() => setSubTab('prayer')}
            style={{ 
              flex: 1, padding: '12px', borderRadius: '100px', fontSize: '14px', fontWeight: 900,
              background: subTab === 'prayer' ? 'white' : 'transparent',
              color: subTab === 'prayer' ? '#B08D3E' : '#8B7355',
              boxShadow: subTab === 'prayer' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            속마음 기도
          </button>
          <button 
            onClick={() => setSubTab('garden')}
            style={{ 
              flex: 1, padding: '12px', borderRadius: '100px', fontSize: '14px', fontWeight: 900,
              background: subTab === 'garden' ? 'white' : 'transparent',
              color: subTab === 'garden' ? '#FF4D6D' : '#8B7355',
              boxShadow: subTab === 'garden' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            소통의 화원
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ background: '#FDFCF0', paddingBottom: '160px', WebkitOverflowScrolling: 'touch' }}>
        <AnimatePresence mode="wait">
          {subTab === 'prayer' ? (
            <motion.div 
              key="prayer-view"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <HeartPrayerView 
                userRole={userRole} 
                coupleCode={coupleCode} 
                onBack={undefined} 
                partnerPrayers={partnerPrayers}
                setPartnerPrayers={setPartnerPrayers}
                embedded={true}
                mainChannel={mainChannel}
              />
            </motion.div>
          ) : (
            <motion.div 
              key="garden-view"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="h-full"
            >
              <IntimacyModal 
                show={true} 
                onClose={() => setSubTab('prayer')}
                onNav={() => {}} 
                subPage={modalSubPage}
                setSubPage={setModalSubPage}
                bgImage={bgImage}
                onBgUpload={onBgUpload}
                user={user}
                partnerLabel={partnerLabel}
                userRole={userRole}
                coupleCode={coupleCode}
                supabase={supabase}
                mainChannel={mainChannel} // 📡 Pass live channel
                isFullPage={true}
                embedded={true}
                setHusbandInfo={setHusbandInfo}
                setWifeInfo={setWifeInfo}
                husbandInfo={husbandInfo}
                wifeInfo={wifeInfo}
                myInfo={userRole === 'husband' ? husbandInfo : wifeInfo}
                onUpdateProfile={updateProfileInfo}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IntimacyHubView;
