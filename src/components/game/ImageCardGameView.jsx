import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Sparkles, RefreshCw } from 'lucide-react';

export const IMAGE_CARD_DATA = [
  { id: 1, category: "신앙", image: "/images/cards/bible.png", question: "성경책을 폈을 때 주님이 당신에게 가장 먼저 하실 말씀은 무엇일까요?" },
  { id: 2, category: "나눔", image: "/images/cards/bread.png", question: "떡을 떼는 마음으로 우리가 이웃에게 흘려보내야 할 주님의 사랑은?" },
  { id: 3, category: "일상", image: "/images/cards/city.png", question: "북적이는 도시 이미지처럼 요즘 일상이 너무 바쁘진 않나요? 주님 안에서의 쉼이 필요한가요?" },
  { id: 4, category: "시간", image: "/images/cards/clock.png", question: "우리의 시간이 아닌 하나님의 타이밍을 기다리며 인내해야 할 제목이 있나요?" },
  { id: 5, category: "휴식", image: "/images/cards/coffee.png", question: "따뜻한 커피 한 잔처럼 만남 속에서 서로에게 쉼이 되어주는 존재가 되고 싶나요?" },
  { id: 6, category: "동행", image: "/images/cards/couple_walk.png", question: "천천히 걷는 커플처럼 우리 관계에서 주님과 함께 보조를 맞춰야 할 부분은?" },
  { id: 7, category: "사랑", image: "/images/cards/cross.png", question: "십자가를 볼 때 당신의 마음속에 가장 먼저 떠오르는 고백은 무엇인가요?" },
  { id: 8, category: "생명", image: "/images/cards/desert_flower.png", question: "메마른 광야에서도 꽃을 피우시는 하나님의 생명력을 우리 삶 어디에서 느끼나요?" },
  { id: 9, category: "교제", image: "/images/cards/dinner_table.png", question: "풍성한 식탁처럼 우리가 주님 안에서 나누고 싶은 영적 교제는 어떤 모습인가요?" },
  { id: 10, category: "마음", image: "/images/cards/door_knock.png", question: "마음의 문을 두드리는 주님의 음성에 오늘 당신은 어떻게 응답하고 싶나요?" },
  { id: 11, category: "평화", image: "/images/cards/dove.png", question: "비둘기 같이 임하시는 성령님의 평화가 지금 당신의 마음 가득한가요?" },
  { id: 12, category: "섬김", image: "/images/cards/feet_washing.png", question: "제자들의 발을 씻기신 예수님처럼 내가 당신을 위해 낮아져 섬기고 싶은 점은?" },
  { id: 13, category: "치유", image: "/images/cards/forest.png", question: "울창한 숲에서 느껴지는 주님의 창조 섭리에 마음껏 숨을 쉬어 봐요. 지금 기분이 어떤가요?" },
  { id: 14, category: "평안", image: "/images/cards/lake.png", question: "잔잔한 호수 같은 평안함이 당신의 영혼에 지금 가득한가요?" },
  { id: 15, category: "말씀", image: "/images/cards/lamp.png", question: "내 발의 등이요 길의 빛이신 하나님의 말씀이 이번 주 당신을 어떻게 인도했나요?" },
  { id: 16, category: "비전", image: "/images/cards/mountain_top.png", question: "산 정상에서 바라보는 넓은 세상처럼 우리가 주님 안에서 품고 싶은 큰 꿈은?" },
  { id: 17, category: "소망", image: "/images/cards/open_tomb.png", question: "빈 무덤이 주는 부활의 소망이 당신의 삶에 어떤 힘이 되고 있나요?" },
  { id: 18, category: "성장", image: "/images/cards/plant_pot.png", question: "작은 화분의 새싹처럼 우리 믿음이 한 뼘 더 자라기 위해 무엇이 필요할까요?" },
  { id: 19, category: "기도", image: "/images/cards/praying.png", question: "간절히 기도하는 손처럼 지금 우리가 가장 간절히 구해야 할 기도는 무엇인가요?" },
  { id: 20, category: "계획", image: "/images/cards/puzzle.png", question: "흩어진 퍼즐 조각들이 맞춰지듯 우리 삶에 향한 하나님의 계획을 신뢰하고 있나요?" },
  { id: 21, category: "약속", image: "/images/cards/rainbow.png", question: "무지개 언약을 통해 주신 하나님의 변치 않는 약속 중 당신이 붙드는 것은?" },
  { id: 22, category: "믿음", image: "/images/cards/root.png", question: "말씀에 깊이 뿌리 내리고 흔들리지 않는 믿음의 사람이 되기 위한 우리의 노력은?" },
  { id: 23, category: "은혜", image: "/images/cards/sea.png", question: "끝없이 펼쳐진 바다처럼 한량없는 주님의 은혜를 오늘 어디에서 발견했나요?" },
  { id: 24, category: "인도", image: "/images/cards/shepherd.png", question: "선한 목자 되신 주님이 당신을 쉴 만한 물가로 인도하고 계심을 느끼나요?" },
  { id: 25, category: "약속", image: "/images/cards/starry_night.png", question: "수많은 별을 보여주며 약속하신 하나님처럼 우리 삶에 수놓인 축복을 돌아볼까요?" },
  { id: 26, category: "신뢰", image: "/images/cards/storm.png", question: "거센 폭풍우 속에서도 배 뒤편에서 주무시던 예수님의 평안이 당신에게 있나요?" },
  { id: 27, category: "소망", image: "/images/cards/sunset.png", question: "노을 지는 길 끝에서 우리는 어떤 밝은 내일을 주님 안에서 꿈꾸고 있을까요?" },
  { id: 28, category: "희생", image: "/images/cards/thorns.png", question: "가시관을 쓰신 주님의 흔적을 보며 나를 향한 그분의 절절한 사랑을 묵상해 봐요." },
  { id: 29, category: "연합", image: "/images/cards/vine.png", question: "포도나무에 붙어 있는 가지처럼 우리가 늘 주님 안에 거하기 위해 필요한 것은?" },
  { id: 30, category: "기록", image: "/images/cards/writing_hand.png", question: "생애 가운데 주님이 행하신 일들을 하나씩 써 내려간다면 가장 먼저 기록할 은혜는?" },
  { id: 31, category: "예배", image: "/images/cards/altar.png", question: "우리의 첫 정성을 주님께 드리는 '제단' 앞에 선 마음으로 오늘을 돌아볼까요?" },
  { id: 32, category: "새출발", image: "/images/cards/baptism_water.png", question: "새 생명의 상징인 세례의 물처럼, 우리가 새롭게 시작하고 싶은 변화는?" },
  { id: 33, category: "해방", image: "/images/cards/broken_chains.png", question: "주님의 은혜로 끊어진 사슬처럼, 우리를 억누르던 걱정에서 벗어날 준비가 되었나요?" },
  { id: 34, category: "소명", image: "/images/cards/burning_bush.png", question: "떨기나무 불꽃 가운데 부르신 하나님처럼, 지금 우리에게 주시는 특별한 부르심은?" },
  { id: 35, category: "빛", image: "/images/cards/candle_light.png", question: "어둠 속 작은 촛불처럼 우리가 세상의 빛으로 함께 밝혀가야 할 영역은 어디일까요?" },
  { id: 36, category: "경이", image: "/images/cards/canyon_light.png", question: "웅장한 자연의 신비 속에서 우리를 향한 하나님의 광대하심을 느껴보세요. 어떤 마음이 드나요?" },
  { id: 37, category: "순수", image: "/images/cards/child_playing.png", question: "천진난만한 아이처럼 하나님 아빠 앞에 가장 솔직해지고 싶은 당신의 모습은?" },
  { id: 38, category: "지혜", image: "/images/cards/elderly_wisdom.png", question: "믿음의 선조들이 남긴 지혜의 발자취를 따라 우리가 깊게 배워야 할 덕목은?" },
  { id: 39, category: "가족", image: "/images/cards/family_dinner.png", question: "따뜻한 가족 식탁처럼 우리 가문이 주님 안에서 대대로 이어가야 할 축복은?" },
  { id: 40, category: "우정", image: "/images/cards/friends_circle.png", question: "믿음의 동역자들과 함께하는 아름다운 동행을 위해 우리가 나누어야 할 것은?" },
  { id: 41, category: "긍헐", image: "/images/cards/helping_hands.png", question: "어려운 이웃에게 내미는 손길처럼 우리가 작은 예수로 살아가기 위해 실천할 일은?" },
  { id: 42, category: "시작", image: "/images/cards/morning_window.png", question: "매일 아침 창가에 비치는 햇살처럼, 우리 관계를 매일 새롭게 하시는 은혜는?" },
  { id: 43, category: "돌봄", image: "/images/cards/mother_child.png", question: "어미 닭이 새끼를 품듯 주님이 우리를 돌보고 계심을 가장 강하게 느낀 순간은?" },
  { id: 44, category: "축복", image: "/images/cards/olive_tree.png", question: "평화의 상징인 감람나무(올리브)처럼 우리 커플이 가는 곳마다 평화가 넘길 원하시나요?" },
  { id: 45, category: "진리", image: "/images/cards/open_book.png", question: "진리의 책 앞에 선 우리 커플이 평생 붙들어야 할 단 하나의 진리는 무엇인가요?" },
  { id: 46, category: "인도", image: "/images/cards/path_forest.png", question: "숲속 오솔길처럼 주님이 열어주시는 길을 의심 없이 걸어갈 용기가 우리에게 있나요?" },
  { id: 47, category: "권위", image: "/images/cards/shepherd_staff.png", question: "목자의 지팡이처럼 주님이 우리 가정을 바른 길로 인도하고 계심을 신뢰하나요?" },
  { id: 48, category: "거룩", image: "/images/cards/snow_mountain.png", question: "흰 눈으로 덮인 순결한 산처럼 주님 안에서 우리가 지켜가고 싶은 순결한 가치는?" },
  { id: 49, category: "환희", image: "/images/cards/spring_blossom.png", question: "겨울을 이겨내고 핀 봄꽃처럼 우리 관계에 찾아온 새로운 계절의 기쁨은?" },
  { id: 50, category: "대화", image: "/images/cards/tea_time.png", question: "차 한 잔의 평온함 속에서 우리가 주님과 깊이 나누고 싶은 비밀 이야기는?" },
  { id: 51, category: "보호", image: "/images/cards/umbrella_rain.png", question: "비바람을 막아주는 우산처럼 서로를 위해 주님의 그늘 아래 기도로 덮어주고 싶나요?" },
  { id: 52, category: "생수", image: "/images/cards/waterfall.png", question: "시원하게 쏟아지는 폭포수 같은 성령의 충만함이 지금 우리 커플에게 필요한가요?" },
  { id: 53, category: "결실", image: "/images/cards/wheat_field.png", question: "황금빛 밀밭처럼 우리가 주님 보시기에 아름다운 열매를 맺기 위해 준비할 것은?" },
  { id: 54, category: "찬양", image: "/images/cards/worship_hands.png", question: "두 손 들고 찬양하는 뜨거운 마음으로 우리 관계의 목적이 주님의 영광임을 선포해 볼까요?" }
];

const ImageCardGameView = ({ onBack, coupleCode, userRole, mainChannel, husbandInfo, wifeInfo }) => {
  const [gameMode, setGameMode] = useState('classic'); // 'classic' or 'pick2'
  const [category, setCategory] = useState('전체');
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [turnOwner, setTurnOwner] = useState(null);

  const [mainQuestion, setMainQuestion] = useState("");
  const [imagePool, setImagePool] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]); 
  const [isSharing, setIsSharing] = useState(false); 
  const [sharedCards, setSharedCards] = useState([]); 
  const [sessionCardCount, setSessionCardCount] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);
  
  const isMyTurn = turnOwner === userRole || !turnOwner;
  const partnerNickname = userRole === 'husband' ? (wifeInfo?.nickname || '아내') : (husbandInfo?.nickname || '남편');

  const broadcastRef = useRef(null);

  useEffect(() => {
    if (!mainChannel) return;
    broadcastRef.current = mainChannel;
    
    const sub = mainChannel.on('broadcast', { event: 'image-game-update' }, ({ payload }) => {
      if (payload.sender === userRole) return;
      
      if (payload.gameMode) setGameMode(payload.gameMode);
      if (payload.isFlipped !== undefined) setIsFlipped(payload.isFlipped);
      if (payload.turnOwner !== undefined) setTurnOwner(payload.turnOwner);
      if (payload.isSharing !== undefined) setIsSharing(payload.isSharing);
      if (payload.sharedCards) setSharedCards(payload.sharedCards);
      if (payload.mainQuestion) setMainQuestion(payload.mainQuestion);
      if (payload.imagePool) setImagePool(payload.imagePool);
      
      if (payload.questionId) {
        const q = IMAGE_CARD_DATA.find(item => String(item.id) === String(payload.questionId));
        if (q) setCurrentQuestion(q);
      }
    });

    return () => mainChannel.off('broadcast', { event: 'image-game-update' });
  }, [mainChannel, userRole]);

  useEffect(() => {
    if (currentQuestion) return;
    setCurrentQuestion(IMAGE_CARD_DATA[0]);
  }, []);

  const sendBroadcast = (updates) => {
    if (broadcastRef.current) {
      broadcastRef.current.send({
        type: 'broadcast',
        event: 'image-game-update',
        payload: { ...updates, sender: userRole, ts: Date.now() }
      });
    }
  };

  const drawNewCard = (targetCat = null) => {
    const activeCat = targetCat || category;
    let pool = activeCat === '전체' ? IMAGE_CARD_DATA : IMAGE_CARD_DATA.filter(q => q.category === activeCat);
    
    if (!pool || pool.length === 0) pool = IMAGE_CARD_DATA;
    if (pool.length > 1 && currentQuestion) pool = pool.filter(q => String(q.id) !== String(currentQuestion.id));
    if (pool.length === 0) return;

    let nextIdx = Math.floor(Math.random() * pool.length);
    setIsFlipped(false);
    setTurnOwner(userRole); 

    setTimeout(() => {
      const nextQ = pool[nextIdx];
      if (nextQ) {
        setCurrentQuestion(nextQ);
        sendBroadcast({ 
          questionId: nextQ.id,
          sender: userRole, 
          isFlipped: false, 
          turnOwner: userRole, 
          category: activeCat
        });
        
        // Count for completion modal
        const nextCount = sessionCardCount + 1;
        setSessionCardCount(nextCount);
        if (nextCount === 10) setShowFinishModal(true);
      }
    }, 300); 
  };

  const initPick2Mode = () => {
    const shuffled = [...IMAGE_CARD_DATA].sort(() => Math.random() - 0.5);
    const pool = shuffled.slice(0, 10);
    const qPool = [
      "최근 당신의 부부 생활을 가장 잘 나타내는 이미지는?",
      "우리의 미래가 어떤 모습이길 소망하시나요?",
      "오늘 당신의 마음 상태를 두 장의 카드로 표현한다면?",
      "주님이 우리 가정을 어떻게 보고 계실까요?",
      "우리가 서로에게 어떤 축복의 존재가 되고 싶나요?",
      "요즘 당신이 가정에서 가장 위로를 받는 지점은?"
    ];
    const q = qPool[Math.floor(Math.random() * qPool.length)];

    setImagePool(pool);
    setMainQuestion(q);
    setSelectedIndices([]);
    setIsSharing(false);
    setTurnOwner(userRole);

    sendBroadcast({
      gameMode: 'pick2',
      mainQuestion: q,
      imagePool: pool,
      isSharing: false,
      turnOwner: userRole
    });
  };

  const selectImage = (idx) => {
    if (isSharing || !isMyTurn) return;
    let newSelected = [...selectedIndices];
    if (newSelected.includes(idx)) {
      newSelected = newSelected.filter(i => i !== idx);
    } else {
      if (newSelected.length < 2) newSelected.push(idx);
      else newSelected = [newSelected[1], idx];
    }
    setSelectedIndices(newSelected);
  };

  const sharePick2 = () => {
    if (selectedIndices.length !== 2) return alert("이미지 2장을 선택해 주세요!");
    const cards = selectedIndices.map(i => imagePool[i]);
    setSharedCards(cards);
    setIsSharing(true);
    sendBroadcast({ isSharing: true, sharedCards: cards, turnOwner: userRole });

    // Count for completion modal
    const nextCount = sessionCardCount + 1;
    setSessionCardCount(nextCount);
    if (nextCount === 10) setShowFinishModal(true);
  };

  const resetPick2 = () => {
    if (!isMyTurn && isSharing) { setTurnOwner(userRole); initPick2Mode(); return; }
    if (!isMyTurn) return alert("상대방의 턴입니다!");
    initPick2Mode();
  };

  if (!currentQuestion) return <div className="p-10 text-center">Loading...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} 
      className="flex flex-col items-center p-4 bg-white" 
      style={{ minHeight: '100vh', paddingBottom: '160px', overflowY: 'auto' }}
    >
      {/* 🏁 Dialogue Finish Modal */}
      <AnimatePresence>
        {showFinishModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              style={{ background: 'white', borderRadius: '35px', width: '100%', maxWidth: '340px', padding: '45px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}
            >
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(171, 71, 188, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
                <Sparkles size={45} color="#AB47BC" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#2D1F08', marginBottom: '15px' }}>열 번째 이미지 동기화 완료!</h3>
              <p style={{ fontSize: '15.5px', color: '#8B7355', fontWeight: 600, lineHeight: 1.6, wordBreak: 'keep-all', marginBottom: '35px' }}>
                오늘 이미지를 통해 나눈 감성이<br/>
                서로를 더 깊게 이어주었나요? ✨<br/>
                이제 대화를 마무리하고 함께<br/>
                달콤한 휴식을 취해볼까요?
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                <button 
                  onClick={onBack}
                  style={{ width: '100%', padding: '20px', borderRadius: '22px', background: '#AB47BC', color: 'white', fontWeight: 900, fontSize: '17px', border: 'none' }}
                >
                  오늘의 대화 마무리하기
                </button>
                <button 
                  onClick={() => {
                    setShowFinishModal(false);
                    setSessionCardCount(11); // 더 이상 자동 트리거되지 않게
                  }}
                  style={{ width: '100%', padding: '15px', borderRadius: '20px', background: 'none', color: '#9C27B0', fontWeight: 800, fontSize: '14px', border: 'none' }}
                >
                  조금 더 대화할래요
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <header style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <ChevronLeft size={24} color="#AB47BC" />
          <span style={{ fontWeight: 900, color: '#AB47BC' }}>돌아가기</span>
        </button>
        <div style={{ display: 'flex', background: '#F3E5F5', borderRadius: '15px', padding: '3px' }}>
          {['classic', 'pick2'].map((m, i) => (
            <button 
              key={m}
              onClick={() => { setGameMode(m); if(m === 'pick2' && imagePool.length === 0) initPick2Mode(); sendBroadcast({ gameMode: m }); }}
              style={{ 
                padding: '6px 15px', borderRadius: '12px', border: 'none', fontSize: '12px', fontWeight: 900,
                background: gameMode === m ? 'white' : 'transparent',
                color: gameMode === m ? '#AB47BC' : '#9c27b0',
                boxShadow: gameMode === m ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              방식 {i+1}
            </button>
          ))}
        </div>
      </header>
      
      <div style={{ width: '100%', padding: '12px', borderRadius: '18px', background: isMyTurn ? 'rgba(171, 71, 188, 0.08)' : '#F3E5F5', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: isMyTurn ? '1.5px solid rgba(171, 71, 188, 0.3)' : '1px solid #EEE' }}>
        {isMyTurn ? <Sparkles size={16} color="#AB47BC" /> : <RefreshCw size={14} color="#9C27B0" className="animate-spin-slow" />}
        <span style={{ fontSize: '13px', fontWeight: 900, color: isMyTurn ? '#AB47BC' : '#9C27B0' }}>{isMyTurn ? "당신의 턴입니다. 마음을 나눠주세요!" : `${partnerNickname}님이 준비 중입니다...`}</span>
      </div>

      {gameMode === 'classic' ? (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '25px' }}>
             {['전체', '신앙', '사랑', '일상', '소망', '가족', '휴식'].map(cat => (
                <button 
                  key={cat} onClick={() => { setCategory(cat); setTimeout(() => drawNewCard(cat), 50); }}
                  style={{ 
                    padding: '8px 16px', borderRadius: '100px', border: 'none',
                    background: category === cat ? '#AB47BC' : '#F3E5F5', color: category === cat ? 'white' : '#AB47BC',
                    fontWeight: 900, fontSize: '12px'
                  }}
                >
                  {cat}
                </button>
             ))}
          </div>

          <div style={{ perspective: '1200px', width: '310px', height: '440px' }}>
            <motion.div
               animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6, type: 'spring' }}
               onClick={() => { if (!isMyTurn) return; setIsFlipped(!isFlipped); setTurnOwner(userRole); sendBroadcast({ isFlipped: !isFlipped, turnOwner: userRole }); }}
               style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', cursor: 'pointer' }}
            >
              <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', background: 'linear-gradient(135deg, #1A1A1A, #000000)', borderRadius: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <motion.div animate={{ x: ['-150%', '150%'] }} transition={{ repeat: Infinity, duration: 4 }} style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent, rgba(212, 175, 55, 0.15), transparent)', skewX: -30 }} />
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#B08D3E', marginBottom: '8px', letterSpacing: '1px' }}>부부의 마음을 이어주는</p>
                <h1 style={{ fontWeight: 500, fontSize: '36px', background: 'linear-gradient(to bottom, #F7E4BE, #D4AF37, #A17928)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'serif' }}>HEART SYNC</h1>
              </div>

              <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'white', borderRadius: '30px', border: '3px solid #AB47BC', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '100%', height: '65%', position: 'relative' }}>
                  <img src={currentQuestion.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src="https://via.placeholder.com/310x440"} />
                  <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 800 }}>{currentQuestion.category}</div>
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: '#2D1F08', lineHeight: 1.5, wordBreak: 'keep-all' }}>{currentQuestion.question}</p>
                </div>
              </div>
            </motion.div>
          </div>

          <button 
            onClick={() => isMyTurn && drawNewCard()}
            style={{ width: '100%', maxWidth: '310px', marginTop: '30px', padding: '18px', borderRadius: '20px', background: isMyTurn ? '#AB47BC' : '#CCC', color: 'white', fontWeight: 900, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <RefreshCw size={20} /> 다른 이미지 뽑기
          </button>
        </>
      ) : (
        <div style={{ width: '100%', maxWidth: '340px' }}>
           {!isSharing ? (
             <>
               <div style={{ background: '#F3E5F5', padding: '25px', borderRadius: '25px', marginBottom: '25px', textAlign: 'center' }}>
                 <p style={{ fontSize: '13px', color: '#AB47BC', fontWeight: 900, marginBottom: '10px' }}>오늘의 동기화 질문</p>
                 <h3 style={{ fontSize: '19px', fontWeight: 900, color: '#2D1F08', lineHeight: 1.4 }}>"{mainQuestion}"</h3>
                 <p style={{ fontSize: '12px', color: '#9c27b0', marginTop: '12px', fontWeight: 700 }}>위 질문에 답이 되는 이미지 2장을 골라주세요.</p>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '30px' }}>
                 {imagePool.map((card, idx) => (
                   <div key={idx} onClick={() => selectImage(idx)} style={{ position: 'relative', height: '140px', borderRadius: '18px', overflow: 'hidden', border: selectedIndices.includes(idx) ? '4px solid #AB47BC' : '2px solid #EEE' }}>
                     <img src={card.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     {selectedIndices.includes(idx) && (
                       <div style={{ position: 'absolute', inset: 0, background: 'rgba(171, 71, 188, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <div style={{ background: '#AB47BC', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{selectedIndices.indexOf(idx) + 1}</div>
                       </div>
                     )}
                   </div>
                 ))}
               </div>
                <div style={{ display: 'flex', gap: '10px', paddingBottom: '40px' }}>
                  <button onClick={resetPick2} style={{ flex: 1, padding: '18px', borderRadius: '20px', background: 'white', border: '2px solid #AB47BC', color: '#AB47BC', fontWeight: 900, fontSize: '15px' }}>다시 뽑기</button>
                  <button onClick={sharePick2} style={{ flex: 2, padding: '18px', borderRadius: '20px', background: '#AB47BC', color: 'white', fontWeight: 900, fontSize: '15px', opacity: selectedIndices.length === 2 ? 1 : 0.5, boxShadow: '0 10px 20px rgba(171, 71, 188, 0.2)' }}>상대방에게 공유</button>
                </div>
             </>
           ) : (
             <div className="text-center">
               <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#FDFCF0', padding: '30px', borderRadius: '35px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', border: '2px solid #F3E5F5' }}>
                 <p style={{ fontSize: '13px', color: '#AB47BC', fontWeight: 900, marginBottom: '20px' }}>우리만의 하트싱크 주제</p>
                 <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#2D1F08', marginBottom: '30px' }}>{mainQuestion}</h3>
                 <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px' }}>
                   {sharedCards.map((card, idx) => (
                     <div key={idx} style={{ width: '130px', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                       <img src={card.image} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                       <div style={{ padding: '8px', background: '#F3E5F5', fontSize: '11px', fontWeight: 800, color: '#AB47BC' }}>#{card.category}</div>
                     </div>
                   ))}
                 </div>
                 <div style={{ padding: '20px', background: 'white', borderRadius: '20px', border: '1px dashed #AB47BC' }}>
                   <p style={{ fontSize: '13px', color: '#6A4DCE', fontWeight: 800, lineHeight: 1.6 }}>{turnOwner === userRole ? "배우자에게 이 이미지를 고른 이유를 설명해 주세요. 🙂" : "배우자의 설명을 들으며 깊은 마음을 나눠보세요. 💬"}</p>
                 </div>
               </motion.div>
               <button onClick={resetPick2} style={{ marginTop: '30px', width: '100%', padding: '18px', borderRadius: '20px', background: '#AB47BC', color: 'white', fontWeight: 900, border: 'none' }}>새로운 대화 시작하기</button>
             </div>
           )}
        </div>
      )}
    </motion.div>
  );
};

export default ImageCardGameView;
