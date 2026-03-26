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

      // NOTE: In a production environment, this should call a secure backend edge function
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="report-page h-full bg-[#fdfaf5] overflow-y-auto p-5 pb-24">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onBack} className="p-2 -ml-2"><ChevronLeft size={24} color="#2D1F08" /></button>
        <span className="text-xl font-black text-[#2D1F08]">종합 분석 리포트</span>
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-sm mb-6 border border-[#F5E6CC]">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={20} color="#8A60FF" />
          <span className="text-lg font-black text-[#2D1F08]">하티의 정밀 AI 분석</span>
        </div>
        <p className="text-sm font-bold text-[#8B7355] leading-relaxed mb-8">
          최근 한 달간의 대화 패턴, 기도 제목, 감정 신호를 종합하여 AI 하티가 전하는 깊이 있는 조언을 만나보세요.
        </p>
        <button 
          onClick={handleDeepAnalysis}
          disabled={isAnalyzing}
          className={`w-full p-5 rounded-[24px] font-black text-white flex items-center justify-center gap-3 shadow-lg transition-all ${isAnalyzing ? 'bg-gray-300' : 'bg-gradient-to-br from-[#2D1F08] to-[#4D3A1A]'}`}
        >
          {isAnalyzing ? <RefreshCw size={20} className="animate-spin" /> : <Sparkles size={20} />}
          {isAnalyzing ? "리포트 작성 중..." : "새로운 분석 요청하기"}
        </button>
      </div>

      {/* 종합 지표 */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm mb-6 border border-[#F5E6CC]">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FF9A8B] to-[#FF6A88] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#FF6A8820]">
            <BarChart3 size={20} />
          </div>
          <span className="text-lg font-black text-[#2D1F08]">이번 달 종합 활동 지표</span>
        </div>
        
        <div className="flex flex-col items-center justify-center py-6 relative">
          <svg className="w-[180px] h-[180px]" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" stroke="rgba(0,0,0,0.03)" strokeWidth="12" fill="none" />
            <circle cx="80" cy="80" r="70" 
              stroke="url(#gauge-grad-sol)" strokeWidth="12" strokeLinecap="round" fill="none"
              style={{ 
                strokeDasharray: `${Math.min((coupleStats.totalInteractions / 50) * 440, 440)}, 440`, 
                transform: 'rotate(-90deg)', transformOrigin: 'center'
              }} 
            />
            <defs>
              <linearGradient id="gauge-grad-sol" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF9A8B" />
                <stop offset="100%" stopColor="#FF6A88" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center mt-[-10px]">
             <span className="text-4xl font-black text-[#FF4D6D] tracking-tighter">{coupleStats?.totalInteractions || 0}</span>
             <span className="text-xs font-black text-gray-300 uppercase tracking-widest mt-1">Interactions</span>
          </div>
        </div>
        <p className="text-center text-sm font-black text-gray-400 mt-8">
           {coupleStats.totalInteractions >= 50 ? '축하드려요! 목표를 달성했습니다! 🥳' : `목표 50회 중 ${Math.round((coupleStats.totalInteractions / 50) * 100)}% 달성! 🎉`}
        </p>
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-sm mb-6 border border-[#F5E6CC]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-[#8A60FF] to-[#AC8AFF] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#8A60FF20]">
            <Zap size={20} />
          </div>
          <span className="text-lg font-black text-[#2D1F08]">데이터 종합 분석</span>
        </div>

        <div className="space-y-6">
          {[
            { label: '영적 소통 (기도제목)', value: Math.min(Math.round((coupleStats.prayerCount / Math.max(coupleStats.totalInteractions, 1)) * 100), 100), color: '#8A60FF' },
            { label: '정서적 교감 (무드시그널)', value: Math.min(Math.round((coupleStats.signalCount / Math.max(coupleStats.totalInteractions, 1)) * 100), 100), color: '#FF8A9D' },
            { label: '일상 협력 (공유일정)', value: Math.min(Math.round((coupleStats.scheduleCount / Math.max(coupleStats.totalInteractions, 1)) * 100), 100), color: '#F5D060' }
          ].map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center text-sm font-black">
                <span className="text-[#2D1F08]">{item.label}</span>
                <span style={{ color: item.color }}>{item.value}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }} transition={{ duration: 1, delay: idx * 0.1 }}
                  style={{ background: item.color }} className="h-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl border-2 border-[#D4AF3740] rounded-[40px] p-8">
          <div className="flex items-center gap-4 mb-8">
            <HattiCharacter state={isAnalyzing ? 'thinking' : 'floating'} size={80} />
            <div className="flex flex-col">
              <span className="text-xl font-black text-[#2D1F08]">하티의 심층 처방전</span>
              <span className="text-[10px] font-black text-[#B08D3E] tracking-widest uppercase mt-1">Spiritual Counseling Report</span>
            </div>
          </div>

          <div className="space-y-8">
            {reportResult ? (
              <div className="text-[15px] font-bold leading-relaxed text-[#4D3A1A] whitespace-pre-wrap text-justify italic">
                {reportResult}
              </div>
            ) : (
              <>
                <section>
                  <h4 className="flex items-center gap-2 text-[#8A60FF] font-black text-sm mb-4">
                    <Sparkles size={16} /> 영적 친밀도 분석
                  </h4>
                  <p className="text-sm font-bold text-[#4D3A1A] leading-relaxed text-justify break-keep">
                    아직 상세 분석 결과가 생성되지 않았습니다. 상단의 <strong>'리분석 요청'</strong> 버튼을 클릭하여 두 분만을 위한 특별한 리포트를 받아보세요. 하티가 두 분의 기록을 바탕으로 깊이 있는 조언을 준비해 드립니다.
                  </p>
                </section>

                <section className="pt-6 border-t border-[#D4AF3720]">
                  <h4 className="flex items-center gap-2 text-[#D4AF37] font-black text-sm mb-4">
                    <BookOpen size={16} /> 언약적 사랑의 원리
                  </h4>
                  <p className="text-sm font-bold text-[#4D3A1A] leading-relaxed italic mb-4">
                    "서로 시기를 다투지 말고, 오직 사랑 가운데서 진실한 것을 말하며 범사에 그에게까지 자랄지라."
                  </p>
                  <p className="text-sm font-bold text-[#4D3A1A] leading-relaxed text-justify break-keep">
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
