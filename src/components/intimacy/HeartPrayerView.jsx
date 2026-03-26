import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Send, 
  Heart,
  Edit2,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../supabase';

const HeartPrayerView = ({ userRole, coupleCode, onBack, partnerPrayers, setPartnerPrayers, embedded = false, mainChannel }) => {
  const [topic, setTopic] = useState("");
  const [allPrayers, setAllPrayers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetchPrayers();
  }, [coupleCode]);

  const fetchPrayers = async () => {
    const { data, error } = await supabase
      .from('prayers')
      .select('*')
      .eq('couple_id', coupleCode)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      const formatted = data.map(p => ({
        ...p,
        type: p.user_role === userRole ? 'mine' : 'spouse',
        date: new Date(p.created_at).toLocaleDateString('ko-KR')
      }));
      setAllPrayers(formatted);
      if (setPartnerPrayers) {
        setPartnerPrayers(formatted.filter(p => p.type === 'spouse'));
      }
    }
  };

  const handleRecord = async () => {
    if (!topic.trim()) return;
    setIsRecording(true);
    
    const newPrayer = {
      id: Date.now(),
      couple_id: coupleCode,
      user_role: userRole,
      text: topic.trim(),
      created_at: new Date().toISOString(),
      type: 'mine',
      date: new Date().toLocaleDateString('ko-KR')
    };

    setAllPrayers(prev => [newPrayer, ...prev]);
    const originalTopic = topic;
    setTopic("");

    const { error } = await supabase.from('prayers').insert({
      couple_id: coupleCode,
      user_role: userRole,
      text: originalTopic.trim(),
      created_at: newPrayer.created_at
    });

    if (!error) {
      fetchPrayers();
      if (mainChannel) {
        mainChannel.send({
          type: 'broadcast',
          event: 'heart-prayer-sent',
          payload: { userRole, text: originalTopic.trim() }
        });
      }
    } else {
      setAllPrayers(prev => prev.filter(p => p.id !== newPrayer.id));
      setTopic(originalTopic);
      console.error("Error recording prayer:", error);
    }
    setIsRecording(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("기도 제목을 삭제하시겠습니까?")) return;
    const { error } = await supabase.from('prayers').delete().eq('id', id);
    if (!error) fetchPrayers();
  };

  const handleEditSave = async (id) => {
    if (!editText.trim()) return;
    const { error } = await supabase.from('prayers').update({ text: editText.trim() }).eq('id', id);
    if (!error) {
      setEditingId(null);
      fetchPrayers();
    }
  };

  return (
    <div className={`flex flex-col ${embedded ? '' : 'min-h-screen pb-20'}`}>
      {!embedded && (
        <header style={{ padding: '25px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none' }}>
            <ChevronLeft size={28} color="#2D1F08" />
          </button>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#2D1F08' }}>속마음 기도</h2>
        </header>
      )}

      <div style={{ padding: '20px' }}>
        <div style={{ 
          background: 'white', padding: '25px', borderRadius: '32px', 
          boxShadow: '0 15px 40px rgba(0,0,0,0.05)', border: '1.5px solid rgba(212, 175, 55, 0.2)', marginBottom: '30px'
        }}>
          <p style={{ fontSize: '14px', color: '#5D4037', fontWeight: 800, marginBottom: '20px' }}>말하기 힘든 고백을 이곳에 남겨주세요. 🙏</p>
          <textarea 
            value={topic} onChange={(e) => setTopic(e.target.value)}
            placeholder="기도하고 싶은 내용을 자유롭게 적어보세요..."
            style={{ width: '100%', minHeight: '120px', border: 'none', background: '#FDFCF0', borderRadius: '20px', padding: '15px', fontSize: '15.5px', outline: 'none', resize: 'none' }}
          />
          <button onClick={handleRecord} disabled={isRecording || !topic.trim()} style={{ width: '100%', marginTop: '15px', padding: '16px', borderRadius: '100px', background: '#2D1F08', color: 'white', fontWeight: 900, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            {isRecording ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
            <span>마음 전달하기</span>
          </button>
        </div>
        
        {/* Prayers Timeline */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2" style={{ paddingLeft: '5px' }}>
            <Heart size={16} color="#FF4D6D" fill="#FF4D6D" />
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08' }}>기도 타임라인</span>
          </div>
          {allPrayers.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'white', padding: '18px', borderRadius: '24px', borderLeft: p.type === 'mine' ? '5px solid #D4AF37' : '5px solid #8A60FF', boxShadow: '0 5px 15px rgba(0,0,0,0.02)' }}
            >
              <div className="flex justify-between items-start mb-2">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', fontWeight: 900, color: p.type === 'mine' ? '#B08D3E' : '#8A60FF' }}>{p.type === 'mine' ? '나의 기록' : '배우자의 기도'}</span>
                  <span style={{ fontSize: '10px', color: '#AAA' }}>{p.date}</span>
                </div>
                {p.type === 'mine' && (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingId(p.id); setEditText(p.text); }} style={{ background: 'none', border: 'none', color: '#B08D3E', opacity: 0.6 }}><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#FF5E5E', opacity: 0.6 }}><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
              
              {editingId === p.id ? (
                <div className="flex flex-col gap-2">
                  <textarea 
                    value={editText} onChange={(e) => setEditText(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #D4AF3740', background: '#FDFCF0', fontSize: '14px', outline: 'none', minHeight: '80px' }}
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingId(null)} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', background: '#F3F4F6', fontWeight: 700 }}>취소</button>
                    <button onClick={() => handleEditSave(p.id)} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', background: '#2D1F08', color: 'white', fontWeight: 700 }}>저장</button>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '14.5px', lineHeight: 1.5, color: '#2D1F08', wordBreak: 'break-all' }}>{p.text}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeartPrayerView;
