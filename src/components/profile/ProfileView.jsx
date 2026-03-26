import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Camera,
  CheckCircle2,
  ChevronLeft,
  X,
  Smartphone,
  BookOpen,
  Sparkles,
  Calendar,
  Activity,
  LogOut,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../../supabase';

const ProfileView = ({ 
  user,
  userRole, 
  husbandInfo, 
  setHusbandInfo,
  wifeInfo, 
  setWifeInfo,
  coupleCode,
  isFullPage = true
}) => {
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  
  // 📝 Local states for profile editing (Prevent lag on keystrokes)
  const myInfo = (userRole === 'husband' ? husbandInfo : wifeInfo) || {};
  const setMyInfo = userRole === 'husband' ? setHusbandInfo : setWifeInfo;
  const spouseInfo = userRole === 'husband' ? wifeInfo : husbandInfo;
  
  const [editInfo, setEditInfo] = useState({
    nickname: myInfo.nickname || "",
    mbti: myInfo.mbti || "",
    marriageDate: myInfo.marriageDate || "2020-05-23",
    blood: myInfo.blood || "A"
  });

  // Reset editInfo only when modal opens
  useEffect(() => {
    if (showProfileEdit) {
      setEditInfo({
        nickname: myInfo.nickname || "",
        mbti: myInfo.mbti || "",
        marriageDate: myInfo.marriageDate || "2020-05-23",
        blood: myInfo.blood || "A"
      });
    }
  }, [showProfileEdit]);

  // Marriage D-Day Calculation
  const sharedMarriageDate = husbandInfo.marriageDate || wifeInfo.marriageDate || '2020-05-23';
  const weddingDate = useMemo(() => new Date(sharedMarriageDate), [sharedMarriageDate]);
  const dDay = useMemo(() => {
    const today = new Date();
    const diffTime = Math.abs(today - weddingDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [weddingDate]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      alert("파일 크기가 너무 큽니다. 1MB 이하의 이미지를 선택해주세요.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const updatedInfo = { ...myInfo, avatar: reader.result };
      setMyInfo(updatedInfo);
      
      await supabase.from('profiles').upsert({
        id: user.id,
        couple_id: coupleCode,
        user_role: userRole,
        info: updatedInfo,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async () => {
    const updatedInfo = { ...myInfo, ...editInfo };
    setMyInfo(updatedInfo);
    
    try {
      // 1. Update My Profile
      await supabase.from('profiles').upsert({
        id: user.id, 
        couple_id: coupleCode, 
        user_role: userRole, 
        info: updatedInfo, 
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

      // 2. If Marriage Date changed, sync with spouse
      if (editInfo.marriageDate !== myInfo.marriageDate) {
        const spouseRole = userRole === 'husband' ? 'wife' : 'husband';
        const spouseSetter = userRole === 'husband' ? setWifeInfo : setHusbandInfo;
        const updatedSpouseInfo = { ...spouseInfo, marriageDate: editInfo.marriageDate };
        
        spouseSetter(updatedSpouseInfo);
        await supabase.from('profiles').upsert({
          couple_id: coupleCode, 
          user_role: spouseRole, 
          info: updatedSpouseInfo, 
          updated_at: new Date().toISOString()
        }, { onConflict: 'couple_id,user_role' });
      }
      
      setShowProfileEdit(false);
      alert("정보가 성공적으로 저장되었습니다!");
    } catch (err) {
      console.error("Profile save error:", err);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: isFullPage ? 20 : 0 }} 
      animate={{ opacity: 1, y: 0 }} 
      style={{ padding: isFullPage ? '40px 20px 100px' : '0' }}
    >
      {isFullPage && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#2D1F08', letterSpacing: '-1px' }}>우리의 프로필</h2>
          <p style={{ fontSize: '14px', color: '#8B7355', fontWeight: 700 }}>부부의 소중한 기록을 관리하세요.</p>
        </div>
      )}

      {/* 💑 Couple Profile Card */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', borderRadius: '35px',
        padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.4)', position: 'relative'
      }}>
        <button onClick={() => setShowProfileEdit(true)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: '1px solid #EEE', borderRadius: '12px', padding: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
          <User size={16} color="#8B7355" />
        </button>
        <div 
          onClick={() => document.getElementById('avatar-upload-main').click()}
          style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #F5D060, #D4AF37)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', overflow: 'hidden', border: '4px solid white', boxShadow: '0 10px 25px rgba(212, 175, 55, 0.25)', cursor: 'pointer', position: 'relative' }}
        >
          <img 
            src={myInfo.avatar || (userRole === 'husband' ? "/husband.png" : "/wife.png")} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            onError={(e) => { e.target.src = userRole === 'husband' ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Husband" : "https://api.dicebear.com/7.x/avataaars/svg?seed=Wife"; }} 
          />
          <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#D4AF37', borderRadius: '50%', padding: '6px', border: '2px solid white' }}>
            <Camera size={14} color="white" />
          </div>
          <input type="file" id="avatar-upload-main" hidden accept="image/*" onChange={handlePhotoUpload} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#2D1F08', marginBottom: '8px' }}>
          {husbandInfo.nickname} ❤️ {wifeInfo.nickname}
        </h2>
        <p style={{ fontSize: '14px', color: '#8B7355', fontWeight: 700, marginBottom: '5px' }}>
          결혼기념일 {sharedMarriageDate}
        </p>
        <div style={{ fontSize: '32px', fontWeight: 900, color: '#FF7E5F', letterSpacing: '2px' }}>
          D+{dDay}
        </div>
      </div>

      {/* Info Sections */}
      <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid rgba(0,0,0,0.03)' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '15px', background: 'rgba(138, 96, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Sparkles size={20} color="#8A60FF" />
          </div>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 800, color: '#8B7355' }}>나의 MBTI</p>
            <p style={{ fontSize: '16px', fontWeight: 900, color: '#2D1F08' }}>{myInfo.mbti || "성향 파악 중"}</p>
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid rgba(0,0,0,0.03)' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '15px', background: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Calendar size={20} color="#D4AF37" />
          </div>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 800, color: '#8B7355' }}>커플 코드</p>
            <p style={{ fontSize: '16px', fontWeight: 900, color: '#2D1F08' }}>{coupleCode}</p>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {showProfileEdit && (
          <div onClick={() => setShowProfileEdit(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div 
              onClick={(e) => e.stopPropagation()} 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{ background: 'white', borderRadius: '35px', padding: '35px', width: '100%', maxWidth: '360px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#2D1F08' }}>내 정보 수정</h3>
                <button onClick={() => setShowProfileEdit(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
                  <X size={20} color="#CCC" />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#8B7355', display: 'block', marginBottom: '8px' }}>애칭</label>
                  <input value={editInfo.nickname} onChange={(e) => setEditInfo({...editInfo, nickname: e.target.value})} style={{ width: '100%', padding: '15px 18px', borderRadius: '16px', background: '#F8F9FA', border: '1px solid #EEE', fontWeight: 700, fontSize: '15px' }} />
                </div>
                
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#8B7355', display: 'block', marginBottom: '8px' }}>성격 유형 (MBTI)</label>
                  <input value={editInfo.mbti} onChange={(e) => setEditInfo({...editInfo, mbti: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '15px 18px', borderRadius: '16px', background: '#F8F9FA', border: '1px solid #EEE', fontWeight: 700, fontSize: '15px' }} placeholder="예: ISTJ" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 0.9fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#8B7355', display: 'block', marginBottom: '8px' }}>결혼 (년)</label>
                    <select 
                      value={editInfo.marriageDate.split('-')[0]} 
                      onChange={(e) => setEditInfo({...editInfo, marriageDate: `${e.target.value}-${editInfo.marriageDate.split('-')[1]}-${editInfo.marriageDate.split('-')[2]}`})}
                      style={{ width: '100%', padding: '15px 10px', borderRadius: '16px', background: '#F8F9FA', border: '1px solid #EEE', fontSize: '14px', fontWeight: 700 }}
                    >
                      {Array.from({ length: 50 }, (_, i) => 2026 - i).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#8B7355', display: 'block', marginBottom: '8px' }}>월</label>
                    <select 
                      value={parseInt(editInfo.marriageDate.split('-')[1])} 
                      onChange={(e) => setEditInfo({...editInfo, marriageDate: `${editInfo.marriageDate.split('-')[0]}-${String(e.target.value).padStart(2, '0')}-${editInfo.marriageDate.split('-')[2]}`})}
                      style={{ width: '100%', padding: '15px 10px', borderRadius: '16px', background: '#F8F9FA', border: '1px solid #EEE', fontSize: '14px', fontWeight: 700 }}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#8B7355', display: 'block', marginBottom: '8px' }}>일</label>
                    <select 
                      value={parseInt(editInfo.marriageDate.split('-')[2])} 
                      onChange={(e) => setEditInfo({...editInfo, marriageDate: `${editInfo.marriageDate.split('-')[0]}-${editInfo.marriageDate.split('-')[1]}-${String(e.target.value).padStart(2, '0')}`})}
                      style={{ width: '100%', padding: '15px 10px', borderRadius: '16px', background: '#F8F9FA', border: '1px solid #EEE', fontSize: '14px', fontWeight: 700 }}
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#8B7355', display: 'block', marginBottom: '8px' }}>혈액형</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {['A', 'B', 'O', 'AB'].map(type => (
                      <button 
                        key={type}
                        onClick={() => setEditInfo({...editInfo, blood: type})}
                        style={{ padding: '12px 0', borderRadius: '12px', border: editInfo.blood === type ? '2px solid #D4AF37' : '1px solid #EEE', background: editInfo.blood === type ? 'rgba(212, 175, 55, 0.1)' : 'white', fontWeight: 800, color: editInfo.blood === type ? '#D4AF37' : '#999', cursor: 'pointer' }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button 
                  whileTap={{ scale: 0.95 }} 
                  onClick={handleProfileSave} 
                  style={{ width: '100%', padding: '18px', borderRadius: '18px', background: 'linear-gradient(135deg, #2D1F08, #4D3A1A)', color: 'white', fontWeight: 900, border: 'none', cursor: 'pointer', marginTop: '10px', fontSize: '16px', boxShadow: '0 10px 20px rgba(45, 31, 8, 0.2)' }}
                >
                  수정 완료
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfileView;
