import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Sparkles, 
  BarChart3, 
  Zap, 
  RefreshCw, 
  BookOpen 
} from 'lucide-react';
import HattiCharacter from '../ui/HattiCharacter';
import { supabase } from '../../supabase';

const SolutionView = ({ onBack, userRole, husbandInfo, wifeInfo, schedules, adminStats, coupleStats }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportResult, setReportResult] = useState(null);
  const [recentPrayers, setRecentPrayers] = useState([]);

  useEffect(() => {
    const fetchPrayers = async () => {
      const { data } = await supabase.from('prayers').select('*').limit(5).order('created_at', { ascending: false });
      if (data) setRecentPrayers(data);
    };
    fetchPrayers();
  }, []);

  const handleDeepAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `
        당신은 "부부신호등(Heart Sync)"의 상담 엔진 전문가 '하티'입니다. 
        개혁주의 신학(기독교 언약적 관점)과 심리 상담학(가족 시스템 이론)의 대가로서 아래 제공된 부부의 실제 활동 데이터를 심층 분석하여 전문가용 월간 리포트를 작성해 주세요. 
        
        [부부 정보]
        - 남편: ${husbandInfo.nickname} (MBTI: ${husbandInfo.mbti})
        - 아내: ${wifeInfo.nickname} (MBTI: ${wifeInfo.mbti})
        - 결혼 기념일: ${husbandInfo.marriageDate}
        
        [한 달 활동 데이터]
        - 총 상호작용: ${coupleStats?.totalInteractions}회
        - 기도 제목 수: ${coupleStats?.prayerCount}개
        - 무드 시그널 교환: ${coupleStats?.signalCount}회
        - 공유된 일정: ${coupleStats?.scheduleCount}개
        - 최근 기도 제목들: ${recentPrayers.map(p => p.text).join(", ")}
        
        [리포트 형식 요구사항]
        1. 영적 친밀도 분석: 두 사람의 활동과 대화가 '주님 안에서의 언약'을 어떻게 실천하고 있는지 구체적으로 격려
        2. 기질적 조언: MBTI와 최근 상호작용 빈도를 토대로, 갈등이 생길 수 있는 지점과 서로의 고유한 성향을 어떻게 보충할지 분석 (심리학적 용어 활용 가능)
        3. 실천 미션: 다음 한 달간 실천할 아주 구체적이고 풍성한 숙제(Daily Task) 3가지 제안 (하나님 중심적 삶과 일상의 친밀감 조종)
        
        최소 1000자 이상의 풍성하고 따뜻하며 권위 있는 어조로 한국어로 작성해 주세요. 
        마크다운 형식은 제외하고 텍스트 줄바꿈을 활용해주세요.
      `;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        setReportResult(data.choices[0].message.content);
      } else {
        throw new Error("AI 분석 실패");
      }
    } catch (err) {
      console.error(err);
      alert("AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      style={{ 
        height: '100%', 
        backgroundColor: '#fdfaf5', 
        overflowY: 'auto', 
        padding: '20px', 
        paddingBottom: '100px' 
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <button onClick={onBack} style={{ padding: '8px', marginLeft: '-8px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft size={24} color="#2D1F08" />
        </button>
        <span style={{ fontSize: '20px', fontWeight: 900, color: '#2D1F08' }}>종합 분석 리포트</span>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', marginBottom: '24px', border: '1px solid #F5E6CC' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Sparkles size={20} color="#8A60FF" />
          <span style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08' }}>하티의 정밀 AI 분석</span>
        </div>
        <p style={{ fontSize: '14px', fontWeight: 700, color: '#8B7355', lineHeight: 1.6, marginBottom: '32px' }}>
          최근 한 달간의 대화 패턴, 기도 제목, 감정 신호를 종합하여 AI 하티가 전하는 깊이 있는 조언을 만나보세요.
        </p>
        <button 
          onClick={handleDeepAnalysis}
          disabled={isAnalyzing}
          style={{ 
            width: '100%', padding: '20px', borderRadius: '24px', fontWeight: 900, color: 'white', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', 
            border: 'none', cursor: isAnalyzing ? 'not-allowed' : 'pointer',
            boxShadow: '0 8px 15px rgba(45, 31, 8, 0.15)', transition: '0.3s',
            background: isAnalyzing ? '#CCC' : 'linear-gradient(135deg, #2D1F08, #4D3A1A)'
          }}
        >
          {isAnalyzing ? <RefreshCw size={20} className="refresh-spin" /> : <Sparkles size={20} />}
          {isAnalyzing ? "리포트 작성 중..." : "새로운 분석 요청하기"}
        </button>
      </div>

      {/* 종합 지표 */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', marginBottom: '24px', border: '1px solid #F5E6CC' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #FF9A8B, #FF6A88)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 20px rgba(255, 106, 136, 0.2)' }}>
            <BarChart3 size={20} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08' }}>이번 달 종합 활동 지표</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 0', position: 'relative' }}>
          <svg style={{ width: '180px', height: '180px' }} viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" stroke="rgba(0,0,0,0.03)" strokeWidth="12" fill="none" />
            <circle cx="80" cy="80" r="70" 
              stroke="url(#gauge-grad-sol)" strokeWidth="12" strokeLinecap="round" fill="none"
              style={{ 
                strokeDasharray: `${Math.min((coupleStats.totalInteractions / 50) * 440, 440)}, 440`, 
                transform: 'rotate(-90deg)', transformOrigin: 'center',
                transition: 'stroke-dasharray 1s ease'
              }} 
            />
            <defs>
              <linearGradient id="gauge-grad-sol" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF9A8B" />
                <stop offset="100%" stopColor="#FF6A88" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '-10px' }}>
             <span style={{ fontSize: '36px', fontWeight: 900, color: '#FF4D6D', letterSpacing: '-2px' }}>{coupleStats?.totalInteractions || 0}</span>
             <span style={{ fontSize: '10px', fontWeight: 900, color: '#DDD', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '4px' }}>Interactions</span>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: '14px', fontWeight: 900, color: '#CCC', marginTop: '32px' }}>
           {coupleStats.totalInteractions >= 50 ? '축하드려요! 목표를 달성했습니다! 🥳' : `목표 50회 중 ${Math.round((coupleStats.totalInteractions / 50) * 100)}% 달성! 🎉`}
        </p>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', marginBottom: '24px', border: '1px solid #F5E6CC' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #8A60FF, #AC8AFF)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 20px rgba(138, 96, 255, 0.2)' }}>
            <Zap size={20} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08' }}>데이터 종합 분석</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {[
            { label: '영적 소통 (기도제목)', value: Math.min(Math.round((coupleStats.prayerCount / Math.max(coupleStats.totalInteractions, 1)) * 100), 100), color: '#8A60FF' },
            { label: '정서적 교감 (무드시그널)', value: Math.min(Math.round((coupleStats.signalCount / Math.max(coupleStats.totalInteractions, 1)) * 100), 100), color: '#FF8A9D' },
            { label: '일상 협력 (공유일정)', value: Math.min(Math.round((coupleStats.scheduleCount / Math.max(coupleStats.totalInteractions, 1)) * 100), 100), color: '#F5D060' }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 900 }}>
                <span style={{ color: '#2D1F08' }}>{item.label}</span>
                <span style={{ color: item.color }}>{item.value}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#F3F4F6', borderRadius: '100px', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }} transition={{ duration: 1, delay: idx * 0.1 }}
                  style={{ background: item.color, height: '100%', borderRadius: '100px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', border: '2px solid rgba(212, 175, 55, 0.25)', borderRadius: '40px', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <HattiCharacter state={isAnalyzing ? 'thinking' : 'floating'} size={80} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#2D1F08' }}>하티의 심층 처방전</span>
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#B08D3E', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '4px' }}>Spiritual Counseling Report</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {reportResult ? (
              <div style={{ fontSize: '15px', fontWeight: 600, lineHeight: 1.8, color: '#4D3A1A', whiteSpace: 'pre-wrap', textAlign: 'justify', fontStyle: 'italic' }}>
                {reportResult}
              </div>
            ) : (
              <>
                <section>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8A60FF', fontWeight: 900, fontSize: '14px', marginBottom: '16px' }}>
                    <Sparkles size={16} /> 영적 친밀도 분석
                  </h4>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#4D3A1A', lineHeight: 1.7, textAlign: 'justify', wordBreak: 'keep-all' }}>
                    아직 상세 분석 결과가 생성되지 않았습니다. 상단의 <strong>'리분석 요청'</strong> 버튼을 클릭하여 두 분만을 위한 특별한 리포트를 받아보세요. 하티가 두 분의 기록을 바탕으로 깊이 있는 조언을 준비해 드립니다.
                  </p>
                </section>

                <section style={{ paddingTop: '24px', borderTop: '1px solid rgba(212, 175, 55, 0.1)' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D4AF37', fontWeight: 900, fontSize: '14px', marginBottom: '16px' }}>
                    <BookOpen size={16} /> 언약적 사랑의 원리
                  </h4>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#4D3A1A', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '16px' }}>
                    "서로 시기를 다투지 말고, 오직 사랑 가운데서 진실한 것을 말하며 범사에 그에게까지 자랄지라."
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#4D3A1A', lineHeight: 1.7, textAlign: 'justify', wordBreak: 'keep-all' }}>
                    개혁주의 관점에서 결혼은 거룩한 언약(Covenant)입니다. 상대의 부족함을 채우는 것이 나의 사명임을 기억할 때, 진정한 기쁨이 차오를 것입니다.
                  </p>
                </section>
              </>
            )}
          </div>
      </div>
    </motion.div>
  );
};

export default SolutionView;
