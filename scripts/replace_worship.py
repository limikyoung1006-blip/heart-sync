
import sys
import os

def replace_worship_view(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define the old return block specifically
    old_return = """  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className=\"report-page\">
      <div className=\"report-card\" style={{ padding: '24px', borderRadius: '32px' }}>
        <div className=\"report-card-title\" style={{ marginBottom: '25px' }}>
          <div className=\"report-icon-bg\" style={{ background: 'linear-gradient(135deg, #FF9966, #FF5E62)' }}>
            <BookOpen size={20} color=\"white\" />
          </div>
          <span className=\"report-card-label\" style={{ fontSize: '18px', fontWeight: 900 }}>기도의 동역자</span>
        </div>
        
        {/* INTRO QUOTE */}
        <div className=\"worship-quote-box\">
          <p className=\"worship-quote-text\">
            \"말로 다 하지 못하는 속마음을 주님 앞에서,<br/>
            그리고 가장 사랑하는 나의 배우자 앞에<br/>
            <span style={{ color: '#8A60FF', fontWeight: 800 }}>진솔하게</span> 기록해 보세요.\"
          </p>
        </div>

        {/* INPUT AREA */}
        <div className=\"prayer-input-container\">
           <textarea 
            className=\"prayer-textarea-v2\" 
            placeholder=\"함께 나누고 싶은 새로운 기도제목을 적어주세요...\" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
           />
           <button className=\"premium-action-btn\" onClick={handleRecord} style={{ height: '56px', borderRadius: '18px' }}>
             <Send size={18} /> <span style={{ marginLeft: '10px', fontWeight: 900, fontSize: '16px' }}>기도제목 기록하기</span>
           </button>
        </div>

        {/* Shared Prayer Wall */}
        <div className=\"prayer-wall\" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
           <div className=\"flex items-center gap-2 mb-3\" style={{ paddingLeft: '4px' }}>
             <Heart size={16} color=\"#FF4D6D\" fill=\"#FF4D6D\" />
             <span style={{ fontSize: '16px', fontWeight: 900, color: '#2D1F08' }}>서로의 기도 기록</span>
           </div>

           {allPrayers.length === 0 ? (
             <div className=\"text-center py-14\" style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '28px', border: '1px dashed rgba(0,0,0,0.1)' }}>
               <Smile size={54} color=\"#D4AF37\" style={{ opacity: 0.4, margin: '0 auto 15px' }} />
               <p style={{ fontSize: '15px', color: '#5D4037', fontWeight: 700 }}>아직 기록된 기도가 없어요.</p>
               <p style={{ fontSize: '13px', color: '#8B6500', opacity: 0.8, marginTop: '6px' }}>첫 마음을 담은 기도를 남겨보세요.</p>
             </div>
           ) : (
             allPrayers.slice(0, 10).map((p) => (
                <motion.div 
                 key={p.id}
                 initial={{ opacity: 0, x: p.type === 'mine' ? -10 : 10 }}
                 animate={{ opacity: 1, x: 0 }}
                 className=\"prayer-bubble-final\"
                 style={{ 
                   background: p.type === 'mine' ? 'rgba(255,255,255,0.9)' : 'rgba(138, 96, 255, 0.1)',
                   borderLeft: p.type === 'mine' ? '4px solid #F5D060' : '4px solid #8A60FF',
                   padding: '12px 15px'
                 }}
                >
                  <div className=\"flex justify-between items-center mb-2\">
                    <span style={{ fontSize: '11px', fontWeight: 900, color: p.type === 'mine' ? '#8B6500' : '#8A60FF' }}>
                      {p.type === 'mine' ? '나의 기도' : '배우자의 기도'}
                    </span>
                    <span style={{ fontSize: '10px', opacity: 0.5 }}>{p.date}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#2D1F08', lineHeight: 1.5 }}>{p.text}</p>
                </motion.div>
             ))
           )}
        </div>
      </div>
    </motion.div>"""

    new_return = """  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className=\"report-page\">
      <div className=\"report-card\" style={{ padding: '24px', borderRadius: '32px' }}>
        {/* VIEW TITLE */}
        <div className=\"report-card-title\" style={{ marginBottom: '25px' }}>
          <div className=\"report-icon-bg\" style={{ background: 'linear-gradient(135deg, #FF9966, #FF5E62)' }}>
            <BookOpen size={20} color=\"white\" />
          </div>
          <span className=\"report-card-label\" style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-1px' }}>기도의 동역자</span>
        </div>
        
        {/* INTRO QUOTE */}
        <div className=\"worship-quote-box\">
          <p className=\"worship-quote-text\">
            \"말로 다 하지 못하는 속마음을 주님 앞에서,<br/>
            그리고 가장 사랑하는 나의 배우자 앞에<br/>
            <span style={{ color: '#8A60FF', fontWeight: 800 }}>진솔하게</span> 기록해 보세요.\"
          </p>
        </div>

        {/* INPUT AREA */}
        <div className=\"prayer-input-container\">
           <textarea 
            className=\"prayer-textarea-v2\" 
            placeholder=\"함께 나누고 싶은 새로운 기도제목을 적어주세요...\" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
           />
           <button className=\"premium-action-btn\" onClick={handleRecord} style={{ height: '58px', borderRadius: '20px' }}>
             <Send size={18} /> <span style={{ marginLeft: '10px', fontWeight: 900, fontSize: '17px' }}>기도제목 기록하기</span>
           </button>
        </div>

        {/* TIMELINE WALL */}
        <div className=\"prayer-wall\" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div className=\"flex items-center gap-2 mb-2\" style={{ paddingLeft: '4px' }}>
             <Heart size={18} color=\"#FF4D6D\" fill=\"#FF4D6D\" />
             <span style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08' }}>서로의 기도 기록</span>
           </div>

           {allPrayers.length === 0 ? (
             <div className=\"text-center py-16\" style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '32px', border: '1px dashed rgba(245, 208, 96, 0.3)' }}>
               <Smile size={64} color=\"#D4AF37\" style={{ opacity: 0.5, margin: '0 auto 18px' }} />
               <p style={{ fontSize: '18px', color: '#4D3A1A', fontWeight: 900 }}>아직 기록된 기도가 없어요</p>
               <p style={{ fontSize: '14px', color: '#8B6500', opacity: 0.7, marginTop: '8px' }}>첫 마음을 담은 기도를 남겨보세요.</p>
             </div>
           ) : (
             allPrayers.slice(0, 20).map((p) => (
                <motion.div 
                 key={p.id}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className=\"prayer-card-v2\"
                 style={{ borderLeft: p.type === 'mine' ? '6px solid #F5D060' : '6px solid #8A60FF' }}
                >
                  <div className=\"prayer-card-header\">
                    <div className=\"prayer-card-role-tag\">
                      <div className=\"prayer-card-role-dot\" style={{ background: p.type === 'mine' ? '#F5D060' : '#8A60FF' }} />
                      <span className=\"prayer-card-role-text\">{p.type === 'mine' ? '나의 기도' : '배우자의 기도'}</span>
                    </div>
                    <span className=\"prayer-card-date\">{p.date}</span>
                  </div>
                  <p className=\"prayer-card-text\">{p.text}</p>
                </motion.div>
             ))
           )}
        </div>
      </div>
    </motion.div>"""

    if old_return in content:
        new_content = content.replace(old_return, new_return)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Success")
    else:
        print("Could not find the return block. Trying line-by-line fallback.")
        # Fallback to line numbers if exact block match fails
        lines = content.split('\\n')
        start = -1
        end = -1
        for i, line in enumerate(lines):
            if 'const WorshipView = (props) => {' in line:
                for j in range(i, len(lines)):
                    if 'return (' in lines[j]:
                        start = j
                        break
                if start != -1:
                    for k in range(start, len(lines)):
                        if '    </motion.div>' in lines[k] and (k+1 < len(lines) and '  );' in lines[k+1]):
                            end = k
                            break
                break
        
        if start != -1 and end != -1:
            print(f"Found return block at lines {start+1} to {end+1}")
            lines[start:end+1] = [new_return]
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write('\\n'.join(lines))
            print("Fallback Success")
        else:
            print(f"Fallback Failed: start={start}, end={end}")

if __name__ == "__main__":
    replace_worship_view(sys.argv[1])
