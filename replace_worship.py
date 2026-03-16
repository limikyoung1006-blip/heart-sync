
import sys
import os

def replace_worship_view(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    start_line = -1
    end_line = -1
    for i, line in enumerate(lines):
        if 'const WorshipView = (props) => {' in line or 'const WorshipView = () => {' in line:
            start_line = i
        if start_line != -1 and '};' in line and i > start_line:
            # Check if this is the end of WorshipView
            if i + 1 < len(lines) and '/* 📊 Report' in lines[i+1]:
                end_line = i
                break
            elif i + 1 == len(lines): # End of file
                end_line = i
                break

    if start_line != -1 and end_line != -1:
        new_worship_view = """const WorshipView = (props) => {
  const [topic, setTopic] = useState("");
  const [myPrayers, setMyPrayers] = useState(() => JSON.parse(localStorage.getItem('myPrayers') || '[]'));
  const [partnerPrayers, setPartnerPrayers] = useState([]);

  useEffect(() => {
    localStorage.setItem('myPrayers', JSON.stringify(myPrayers));
    const sync = () => {
      const partnerData = JSON.parse(localStorage.getItem('partnerPrayers') || '[]');
      setPartnerPrayers(partnerData);
    };
    const interval = setInterval(sync, 2000);
    return () => clearInterval(interval);
  }, [myPrayers]);

  const handleRecord = () => {
    if (!topic) return;
    const newPrayer = { id: Date.now(), text: topic, date: new Date().toLocaleDateString() };
    setMyPrayers([newPrayer, ...myPrayers]);
    setTopic("");
  };

  const allPrayers = useMemo(() => {
    const combined = [
      ...myPrayers.map(p => ({ ...p, type: 'mine' })),
      ...partnerPrayers.map(p => ({ ...p, type: 'spouse' }))
    ];
    return combined.sort((a, b) => b.id - a.id);
  }, [myPrayers, partnerPrayers]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="report-page">
      <div className="report-card" style={{ padding: '24px', borderRadius: '32px' }}>
        <div className="report-card-title" style={{ marginBottom: '25px' }}>
          <div className="report-icon-bg" style={{ background: 'linear-gradient(135deg, #FF9966, #FF5E62)' }}>
            <BookOpen size={20} color="white" />
          </div>
          <span className="report-card-label" style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.5px' }}>기도의 동역자</span>
        </div>
        
        <div className="worship-quote-box">
          <p className="worship-quote-text">
            "말로 다 하지 못하는 속마음을 주님 앞에서,<br/>
            그리고 가장 사랑하는 나의 배우자 앞에<br/>
            <span style={{ color: '#8A60FF', fontWeight: 800 }}>진솔하게</span> 기록해 보세요."
          </p>
        </div>

        <div className="prayer-input-container">
           <textarea 
            className="prayer-textarea-v2" 
            placeholder="함께 나누고 싶은 새로운 기도제목을 적어주세요..." 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
           />
           <button className="premium-action-btn" onClick={handleRecord} style={{ height: '56px', borderRadius: '18px' }}>
             <Send size={18} /> <span style={{ marginLeft: '10px', fontWeight: 900, fontSize: '16px' }}>기도제목 기록하기</span>
           </button>
        </div>

        <div className="prayer-wall" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
           <div className="flex items-center gap-2 mb-3" style={{ paddingLeft: '4px' }}>
             <Heart size={16} color="#FF4D6D" fill="#FF4D6D" />
             <span style={{ fontSize: '16px', fontWeight: 900, color: '#2D1F08' }}>서로의 기도 기록</span>
           </div>

           {allPrayers.length === 0 ? (
             <div className="text-center py-14" style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '28px', border: '1px dashed rgba(0,0,0,0.1)' }}>
               <Smile size={54} color="#D4AF37" style={{ opacity: 0.4, margin: '0 auto 15px' }} />
               <p style={{ fontSize: '15px', color: '#5D4037', fontWeight: 700 }}>아직 기록된 기도가 없어요.</p>
               <p style={{ fontSize: '13px', color: '#8B6500', opacity: 0.8, marginTop: '6px' }}>첫 마음을 담은 기도를 남겨보세요.</p>
             </div>
           ) : (
             allPrayers.slice(0, 15).map((p) => (
                <motion.div 
                 key={p.id}
                 initial={{ opacity: 0, y: 15 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="prayer-card-v2"
                 style={{ borderLeft: p.type === 'mine' ? '6px solid #F5D060' : '6px solid #8A60FF' }}
                >
                  <div className="prayer-card-header">
                    <div className="prayer-card-role-tag">
                      <div className="prayer-card-role-dot" style={{ background: p.type === 'mine' ? '#F5D060' : '#8A60FF' }} />
                      <span className="prayer-card-role-text">{p.type === 'mine' ? '나의 기도' : '배우자의 기도'}</span>
                    </div>
                    <span className="prayer-card-date">{p.date}</span>
                  </div>
                  <p className="prayer-card-text">{p.text}</p>
                </motion.div>
             ))
           )}
        </div>
      </div>
    </motion.div>
  );
};"""
        lines[start_line:end_line+1] = [new_worship_view + "\\n"]
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print("Success")
    else:
        print(f"Could not find WorshipView component ({start_line}, {end_line})")

if __name__ == "__main__":
    replace_worship_view(sys.argv[1])
