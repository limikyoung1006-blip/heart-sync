import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '../../supabase';

export const CARD_DATA = [
  // --- 일상 (Daily) ---
  { id: 1, category: "일상", question: "오늘 하루 중 가장 행복했던 순간은 언제인가요?" },
  { id: 2, category: "일상", question: "최근에 본 영화나 책 중에서 가장 기억에 남는 장면은?" },
  { id: 3, category: "일상", question: "요즘 당신을 가장 웃게 만드는 것은 무엇인가요?" },
  { id: 10, category: "일상", question: "오늘 점심 메뉴 중 가장 맛있었던 건 뭐야?" },
  { id: 19, category: "일상", question: "지금 당장 먹고 싶은 야식은?" },
  { id: 101, category: "일상", question: "오늘 우리 기분을 가장 좋게 만든 사소한 일은?" },
  { id: 102, category: "일상", question: "지금 이 순간, 가장 감사하게 생각하는 세 가지는?" },
  { id: 103, category: "일상", question: "오늘 하루 중 나에게 꼭 고백하고 싶은 귀여운 실수는?" },
  { id: 104, category: "일상", question: "내일 아침, 우리가 함께 먹고 싶은 이상적인 조찬 메뉴는?" },
  { id: 105, category: "일상", question: "요즘 당신의 플레이리스트에서 무한 반복되는 노래는?" },
  { id: 106, category: "일상", question: "오늘 하루를 색깔로 표현한다면 어떤 색이야?" },
  { id: 107, category: "일상", question: "오늘 나에게 들은 말 중 가장 기분 좋았던 한마디는?" },
  { id: 108, category: "일상", question: "요즘 당신을 가장 설레게 하는 작은 기대감은 뭐야?" },
  { id: 109, category: "일상", question: "오늘 퇴근(일과) 후 나를 보자마자 들었던 첫 생각은?" },
  { id: 110, category: "일상", question: "최근에 산 물건 중 '이건 정말 잘 샀다' 싶은 건 뭐야? " },
  { id: 111, category: "일상", question: "오늘 하루 중 가장 평화롭고 조용했던 시간은 언제였어?" },
  { id: 112, category: "일상", question: "나랑 같이 해보고 싶은 아주 사소하고 일상적인 내기 있어?" },
  { id: 113, category: "일상", question: "지금 당장 나랑 편의점에 간다면 무엇을 사 올까?" },
  { id: 114, category: "일상", question: "오늘 하루 주님이 주신 가장 평범하지만 확실한 은혜는?" },
  { id: 115, category: "일상", question: "오늘 밤 잠들기 전, 나에게 꼭 듣고 싶은 자장가는?" },

  // --- 상상 (Imagination) ---
  { id: 4, category: "상상", question: "우리에게 갑자기 1,000만 원이 생긴다면 어디에 가장 먼저 쓰고 싶나요?" },
  { id: 5, category: "상상", question: "만약 우리가 하루 동안 서로의 몸이 바뀐다면 가장 해보고 싶은 일은?" },
  { id: 11, category: "상상", question: "무인도에 딱 세 가지만 가져갈 수 있다면 무엇을 선택할까?" },
  { id: 201, category: "상상", question: "만약 우리가 복권 100억에 당첨된다면, 제일 먼저 지을 우리 집의 모습은?" },
  { id: 202, category: "상상", question: "만약 우리가 하루 동안 동물이 된다면, 어떤 동물이 되어 서로를 지켜줄까?" },
  { id: 203, category: "상상", question: "만약 우리에게 타임머신이 있다면, 우리의 결혼 20주년으로 가볼까?" },
  { id: 204, category: "상상", question: "만약 우리에게 초능력을 하나 갖게 된다면, 나를 위해 어떤 능력을 쓰고 싶어?" },
  { id: 205, category: "상상", question: "만약 우리가 영화 속 주인공이라면, 어떤 장르의 영화였으면 좋겠어?" },
  { id: 206, category: "상상", question: "만약 우리가 투명인간이 된다면, 우리 둘이서만 가보고 싶은 비밀 장소는?" },
  { id: 207, category: "상상", question: "만약 우리가 원하는 나라에서 1년 동안 살 수 있다면 어디로 갈까?" },
  { id: 208, category: "상상", question: "만약 우리가 전설의 요리사가 된다면, 서로에게 바치고 싶은 '사랑의 요리' 이름은?" },
  { id: 209, category: "상상", question: "만약 우리에게 원하는 물건을 무엇이든 만들어주는 마법 지팡이가 생긴다면?" },
  { id: 210, category: "상상", question: "만약 우리가 세상의 모든 언어를 할 수 있게 된다면, 가장 먼저 대화하고 싶은 상대는?" },
  { id: 211, category: "상상", question: "만약 우리가 로봇 집사를 가질 수 있다면, 우리 가사를 위해 어떤 일을 시킬까?" },
  { id: 212, category: "상상", question: "만약 우리가 시간을 멈출 수 있다면, 나랑 가장 오래 멈춰있고 싶은 순간은?" },
  { id: 213, category: "상상", question: "만약 우리에게 무한한 예산의 쇼핑 시간이 1시간 주어진다면 무엇을 살래?" },
  { id: 214, category: "상상", question: "만약 우리에게 미래를 보는 거울이 있다면, 우리 자녀의 어떤 모습을 보고 싶어?" },
  { id: 215, category: "상상", question: "만약 우리가 하늘을 날 수 있다면, 오늘 밤 나를 어디로 데려다 줄 거야?" },
  { id: 216, category: "상상", question: "만약 우리 관계를 한 권의 책으로 쓴다면, 그 책의 마지막 문장은 무엇일까?" },

  // --- 추억 (Memory) ---
  { id: 6, category: "추억", question: "우리의 연애 시절 중 가장 다시 가보고 싶은 데이트 장소는?" },
  { id: 7, category: "추억", question: "당신이 기억하는 우리의 첫 키스는 어떤 느낌이었나요?" },
  { id: 12, category: "추억", question: "결혼식 날 가장 긴장됐던 순간이나 기억 남는 에피소드는?" },
  { id: 17, category: "추억", question: "우리가 처음 만났을 때 나의 첫인상은 어땠어?" },
  { id: 301, category: "추억", question: "우리 첫 만남 때 내가 입었던 옷이나 내 표정 기억나?" },
  { id: 302, category: "추억", question: "연애 시절, 나에게 가장 설레서 밤잠을 설쳤던 적이 있었어?" },
  { id: 303, category: "추억", question: "우리가 가장 크게 다퉜던 날, 화해하면서 느꼈던 솔직한 기분은?" },
  { id: 304, category: "추억", question: "부모님께 우리 만남을 처음 소개했던 날의 그 떨림이 기억나?" },
  { id: 305, category: "추억", question: "우리가 처음으로 같이 영화를 봤던 날, 영화 내용보다 더 기억 남는 건?" },
  { id: 306, category: "추억", question: "당신이 본 나의 모습 중 '이 사람과 평생 가야겠다'고 확신한 순간은?" },
  { id: 307, category: "추억", question: "우리가 함께 먹었던 음식 중 가장 실패했던(맛없었던) 메뉴 기억나?" },
  { id: 308, category: "추억", question: "입장할 때(혹은 약속의 날) 당신의 머릿속에 스친 생각은?" },
  { id: 309, category: "추억", question: "우리가 함께한 시간 중 가장 '우리다웠다'고 느꼈던 순간은 언제야?" },
  { id: 310, category: "추억", question: "나에게 받았던 선물 중 예상치 못해서 더 감동적이었던 것은?" },
  { id: 311, category: "추억", question: "힘들었던 시기, 내가 해준 어떤 행동이나 말이 당신을 다시 일으켜 세웠어?" },
  { id: 312, category: "추억", question: "우리가 처음으로 같이 찍은 사진 속의 우리 표정은 어때 보여?" },
  { id: 313, category: "추억", question: "당신이 기억하는 나의 가장 귀여웠던 '취중 진담'이나 실수는?" },
  { id: 314, category: "추억", question: "나랑 연애하면서 당신의 가치관이 가장 많이 변하게 된 계기는?" },
  { id: 315, category: "추억", question: "우리가 노년에 다시 꺼내 보고 싶은 소중한 '추억 상자'에 지금 무엇을 넣고 싶어?" },
  { id: 316, category: "추억", question: "우리가 처음으로 같이 맞췄던 커플 아이템, 아직도 간직하고 있어?" },

  // --- 관계 (Relationship) ---
  { id: 8, category: "관계", question: "내가 해주는 행동 중 당신이 가장 사랑받고 있다고 느끼는 순간은?" },
  { id: 9, category: "관계", question: "우리가 앞으로 10년 뒤에 어떤 모습으로 살고 있을 것 같나요?" },
  { id: 13, category: "관계", question: "요즘 나에게 서운했던 점이 있다면 사소한 거라도 말해줄래?" },
  { id: 18, category: "관계", question: "당신에게 '가족'이란 어떤 의미야?" },
  { id: 401, category: "관계", question: "내가 당신의 어떤 면을 가장 많이 닮아가고 있다고 느껴?" },
  { id: 402, category: "관계", question: "우리가 서로에게 가장 좋은 파트너이자 친구라고 느끼는 순간은 언제야?" },
  { id: 403, category: "관계", question: "나를 신뢰하고 의지할 수 있다고 확신하게 만드는 나의 구체적인 행동은?" },
  { id: 404, category: "관계", question: "우리의 관계를 한 단어(혹은 은유)로 표현한다면 뭐야? 그 이유는?" },
  { id: 405, category: "관계", question: "내가 당신에게 주는 사랑의 온도를 점수로 매긴다면 (0~100)?" },
  { id: 406, category: "관계", question: "우리가 갈등을 해결하는 방식 중 당신이 가장 좋아하는 과정은?" },
  { id: 407, category: "관계", question: "내가 당신의 삶에서 어떤 '색깔' 같은 존재가 되었으면 좋겠어?" },
  { id: 408, category: "관계", question: "나에게 말하지 못했던, 하지만 꼭 알아줬으면 하는 당신만의 사랑 표현 방식은?" },
  { id: 409, category: "관계", question: "내가 당신을 위해 했던 희생이나 배려 중 가장 마음 깊이 남은 것은?" },
  { id: 410, category: "관계", question: "나의 사소한 습관 중 당신이 의외로 사랑스럽게 느끼는 포인트가 있어?" },
  { id: 411, category: "관계", question: "내가 당신에게 어떤 '안식처'의 의미가 되는지 궁금해." },
  { id: 412, category: "관계", question: "우리 사이에서 '신뢰'가 깨지지 않기 위해 우리가 꼭 지켜야 할 약속은?" },
  { id: 413, category: "관계", question: "내가 당신에게 가장 힘이 되었던 조언이나 위로의 말이 있었어?" },
  { id: 414, category: "관계", question: "나에게 더 자주 듣고 싶은 애정 표현이나 칭찬이 있다면?" },
  { id: 415, category: "관계", question: "오늘 밤, 내가 당신을 얼마나 사랑하는지 다시 한번 확인할 수 있는 방법은?" },
  { id: 416, category: "관계", question: "당신이 나에게 주는 사랑 덕분에 당신 자신을 더 사랑하게 된 적이 있어?" },

  // --- 시크릿 (Secret) ---
  { id: "s1", category: "시크릿", question: "나만 알고 있는 나의 작은 습관 중에 배우자가 알게 되면 깜짝 놀랄 만한 것은?" },
  { id: "s2", category: "시크릿", question: "최근 배우자에게 말하지 못했지만 정말 고맙다고 느꼈던 아주 사소한 순간은?" },
  { id: "s3", category: "시크릿", question: "우리가 처음 만났을 때, 첫인상 외에 마음속으로만 생각했던 나의 진짜 속마음은?" },
  { id: "s4", category: "시크릿", question: "만약 우리에게 자유로운 24시간과 무제한 예산이 생긴다면, 가장 먼저 함께 하고 싶은 일은?" },
  { id: "s5", category: "시크릿", question: "최근 꿈속에서 배우자와 함께했던 장면 중 가장 기억에 남는 것은?" },
  { id: "s6", category: "시크릿", question: "사실 내가 입는 옷 중에서 당신이 정말 싫어하지만 참는 옷이 있어?" },
  { id: "s7", category: "시크릿", question: "나에게 자랑하고 싶었지만 쑥스러워서 대충 넘겼던 작은 성취는 뭐야?" },
  { id: "s8", category: "시크릿", question: "내가 자고 있을 때, 나를 보며 속으로 몰래 했던 다짐이나 고백이 있어?" },
  { id: "s9", category: "시크릿", question: "나에게 말하지 않은, 사실은 내가 꼭 고쳐줬으면 하는 아주 사소한 습관은?" },
  { id: "s10", category: "시크릿", question: "나 몰래 비상금을 모으고 있다면, 그 돈으로 나랑 가장 하고 싶은 일은?" },
  { id: "s11", category: "시크릿", question: "사실 내가 해준 요리 중 입에 안 맞았는데도 '맛있다'고 했던 메뉴는?" },
  { id: "s12", category: "시크릿", question: "내가 없을 때 당신이 몰래 즐기는 당신만의 '사소한 일탈'은 뭐야?" },
  { id: "s13", category: "시크릿", question: "살면서 가장 부끄러웠던 '이불킥' 유발 사건, 오늘만 나에게 공유해 줄래?" },
  { id: "s14", category: "시크릿", question: "사실 당신이 나에게 첫눈에 반한 게 아니었다면, 정확히 언제부터 나를 좋아했어?" },
  { id: "s15", category: "시크릿", question: "나에게 말하지 않은 당신만의 작은 고민이나 요즘 느끼는 스트레스가 있어?" },
  { id: "s16", category: "시크릿", question: "사실 내가 해준 선물 중, 마음에는 안 들지만 당신의 마음이 고마웠던 것은?" },
  { id: "s17", category: "시크릿", question: "나랑 연애하기 전, 당신이 꿈꿨던 이상형의 모습과 지금의 나는 얼마나 닮았어?" },
  { id: "s18", category: "시크릿", question: "내가 화났을 때 당신이 몰래 쓰는 당신만의 비밀 화해 전략이 있어?" },
  { id: "s19", category: "시크릿", question: "사실 우리 관계 초기, 당신이 나를 속였던 사소하고 귀여운 거짓말은?" },
  { id: "s20", category: "시크릿", question: "오늘 이 질문을 통해 나에게 처음으로 털어놓고 싶은 아주 작은 비밀은?" },

  // --- 신앙 (Faith) ---
  { id: 14, category: "신앙", question: "오늘 하루 주님이 주신 가장 큰 은혜의 순간은 언제였나요?" },
  { id: 15, category: "신앙", question: "우리가 자녀에게 물려주고 싶은 가장 소중한 신앙의 가치는?" },
  { id: 16, category: "신앙", question: "힘든 순간, 당신을 일으켜 세웠던 말씀 구절이 있나요?" },
  { id: 501, category: "신앙", question: "우리가 함께 기도할 때 당신의 마음속에 가장 크게 울리는 하나님의 음성은?" },
  { id: 502, category: "신앙", question: "당신의 인생에서 하나님이 가장 '인격적으로' 만나주셨던 결정적 순간은?" },
  { id: 503, category: "신앙", question: "우리가 교회 공동체에서 부부로서 함께 꿈꾸는 사역이나 봉사가 있어?" },
  { id: 504, category: "신앙", question: "하나님이 우리 두 사람을 만나게 하신 '진짜 이유'가 무엇이라고 생각해?" },
  { id: 505, category: "신앙", question: "신앙의 슬럼프가 왔을 때, 나의 어떤 모습이 당신에게 가장 큰 위로가 돼?" },
  { id: 506, category: "신앙", question: "배우자의 신앙 생활 중 당신이 몰래 본받고 싶어 했던 점은 뭐야?" },
  { id: 507, category: "신앙", question: "최근에 읽은 성경 구절 중, 우리 가정에 주시는 약속으로 붙든 것은?" },
  { id: 508, category: "신앙", question: "당신에게 '예수님'은 어떤 의미야? 한 문장으로 고백해 본다면?" },
  { id: 509, category: "신앙", question: "살면서 경험한 가장 극적이었거나 은혜로웠던 기도 응답의 경험은?" },
  { id: 510, category: "신앙", question: "우리 가정이 세상 속에서 '그리스도의 향기'를 어떻게 전하면 좋을까?" },
  { id: 511, category: "신앙", question: "성경 인물 중 우리 부부의 모습과 가장 닮았다고 느끼는 커플은 누구야?" },
  { id: 512, category: "신앙", question: "오늘 하루 하나님께서 당신을 통해 일하셨다고 느껴지는 흔적이 있어?" },
  { id: 513, category: "신앙", question: "우리가 십일조와 헌금 생활을 할 때, 어떤 마음가짐으로 드리고 싶어?" },
  { id: 514, category: "신앙", question: "주변 사람들이 우리를 볼 때, '하나님은 살아계시구나'라고 느끼게 될 포인트는?" },
  { id: 515, category: "신앙", question: "당신의 영적 성장을 위해 내가 영적인 파트너로서 더 보완해줬으면 하는 점은?" },
  { id: 516, category: "신앙", question: "당신이 가장 좋아하는 찬양의 가사가 지금 우리 상황에 주는 메시지는?" },
  { id: 517, category: "신앙", question: "오늘 밤, 우리가 함께 주님의 이름으로 축복하며 잠들고 싶은 기도의 제목은?" }
];

const CardGameView = ({ onBack, coupleCode, userRole, husbandInfo, wifeInfo, onUpdateMemo, mainChannel }) => {
  const [category, setCategory] = useState('일상');
  const [isFlipped, setIsFlipped] = useState(false);
  const filteredQuestions = useMemo(() => CARD_DATA.filter(q => q.category === category), [category]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [waiterRole, setWaiterRole] = useState(null);
  const [turnOwner, setTurnOwner] = useState(null);
  const [sessionCardCount, setSessionCardCount] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);

  const broadcastRef = useRef(null);

  useEffect(() => {
    if (!mainChannel) return;
    broadcastRef.current = mainChannel;
    
    const sub = mainChannel.on('broadcast', { event: 'game-update' }, ({ payload }) => {
      if (payload.sender === userRole) return;
      
      const applyUpdates = (data) => {
        if (data.category) setCategory(data.category);
        if (data.isFlipped !== undefined) setIsFlipped(data.isFlipped);
        if (data.isWaiting !== undefined) setIsWaiting(data.isWaiting);
        if (data.waiterRole !== undefined) setWaiterRole(data.waiterRole);
        if (data.turnOwner !== undefined) setTurnOwner(data.turnOwner);
        if (data.questionId) {
          const q = CARD_DATA.find(item => String(item.id) === String(data.questionId));
          if (q) setCurrentQuestion(q);
        }
      };
      applyUpdates(payload);
    });

    return () => mainChannel.off('broadcast', { event: 'game-update' });
  }, [mainChannel, userRole]);

  useEffect(() => {
    if (!coupleCode) return;
    
    const channel = supabase.channel(`game-db-sync-${coupleCode}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'card_game_state',
        filter: `couple_id=eq.${coupleCode}`
      }, payload => {
        const data = payload.new;
        if (data.category) setCategory(data.category);
        if (data.is_flipped !== undefined) setIsFlipped(data.is_flipped);
        if (data.is_waiting !== undefined) setIsWaiting(data.is_waiting);
        if (data.waiter_role !== undefined) setWaiterRole(data.waiter_role);
        if (data.turn_owner !== undefined) setTurnOwner(data.turn_owner);
        if (data.current_question_id) {
          const q = CARD_DATA.find(item => String(item.id) === String(data.current_question_id));
          if (q) setCurrentQuestion(q);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [coupleCode]);

  useEffect(() => {
    const fetchDB = async () => {
      const { data } = await supabase.from('card_game_state').select('*').eq('couple_id', coupleCode).single();
      if (data) {
        const cat = data.category || '일상';
        setCategory(cat);
        setIsFlipped(data.is_flipped || false);
        setIsWaiting(data.is_waiting || false);
        setWaiterRole(data.waiter_role || null);
        setTurnOwner(data.turn_owner || null);
        
        const q = CARD_DATA.find(item => String(item.id) === String(data.current_question_id));
        if (q) setCurrentQuestion(q);
      } else if (CARD_DATA.length > 0) {
          const initialQ = CARD_DATA.filter(i => i.category === '일상')[0];
          if (initialQ) setCurrentQuestion(initialQ);
      }
    };
    fetchDB();
  }, [coupleCode]);

  const sendBroadcast = (updates) => {
    if (broadcastRef.current) {
      broadcastRef.current.send({
        type: 'broadcast',
        event: 'game-update',
        payload: { ...updates, ts: Date.now(), sender: userRole }
      });
    }
  };

  const updateCardState = async (updates) => {
    if (updates.isFlipped === false && updates.questionId && broadcastRef.current) {
      broadcastRef.current.send({
        type: 'broadcast',
        event: 'card-game-call',
        payload: { category: updates.category || category, questionId: updates.questionId, sender: userRole }
      });
    }

    if (updates.category) setCategory(updates.category);
    if (updates.isFlipped !== undefined) setIsFlipped(updates.isFlipped);
    if (updates.isWaiting !== undefined) setIsWaiting(updates.isWaiting);
    if (updates.waiterRole !== undefined) setWaiterRole(updates.waiterRole);
    if (updates.turnOwner !== undefined) setTurnOwner(updates.turnOwner);
    if (updates.questionId) {
      const q = CARD_DATA.find(item => String(item.id) === String(updates.questionId));
      if (q) setCurrentQuestion(q);
    }

    sendBroadcast(updates);
    
    try {
      supabase.from('card_game_state').upsert({
        couple_id: coupleCode,
        category: updates.category || category,
        is_flipped: updates.isFlipped !== undefined ? updates.isFlipped : isFlipped,
        is_waiting: updates.isWaiting !== undefined ? updates.isWaiting : isWaiting,
        waiter_role: updates.waiterRole !== undefined ? updates.waiterRole : waiterRole,
        turn_owner: updates.turnOwner !== undefined ? updates.turnOwner : turnOwner,
        current_question_id: updates.questionId || currentQuestion?.id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'couple_id' }).then(() => {});
    } catch (e) {}
  };

  const drawNewCard = () => {
    if (turnOwner && turnOwner !== userRole) return;
    let pool = filteredQuestions;
    if (pool.length > 1 && currentQuestion) {
      pool = pool.filter(q => String(q.id) !== String(currentQuestion.id));
    }
    const nextQ = pool[Math.floor(Math.random() * pool.length)];
    setCurrentQuestion(nextQ);
    setIsFlipped(false);
    setIsWaiting(false);
    setWaiterRole(null);
    setTurnOwner(userRole);
    
    updateCardState({ 
      questionId: nextQ.id, 
      isFlipped: false, 
      isWaiting: false, 
      waiterRole: null, 
      turnOwner: userRole,
    });

    const nextCount = sessionCardCount + 1;
    setSessionCardCount(nextCount);
    if (nextCount === 10) setShowFinishModal(true);
  };

  const handOverTurn = () => {
    if (turnOwner && turnOwner !== userRole) return;
    const spouseRole = userRole === 'husband' ? 'wife' : 'husband';
    let pool = filteredQuestions;
    if (pool.length > 1 && currentQuestion) {
      pool = pool.filter(q => String(q.id) !== String(currentQuestion.id));
    }
    const nextQForSpouse = pool[Math.floor(Math.random() * pool.length)];

    setIsWaiting(true);
    setWaiterRole(userRole);
    setTurnOwner(spouseRole); 
    
    updateCardState({ 
      questionId: nextQForSpouse.id,
      isFlipped: false, 
      isWaiting: false, 
      waiterRole: userRole, 
      turnOwner: spouseRole,
    });
  };

  const toggleFlip = () => {
    let currentOwner = turnOwner;
    if (!currentOwner) {
      currentOwner = userRole;
      setTurnOwner(userRole);
    }
    
    if (currentOwner !== userRole) {
      alert(`현재는 ${currentOwner === 'husband' ? '남편' : '아내'}님의 차례입니다.`);
      return;
    }
    const nextFlip = !isFlipped;
    setIsFlipped(nextFlip);
    updateCardState({ isFlipped: nextFlip, turnOwner: userRole });
  };

  const changeCategory = (cat) => {
    if (turnOwner && turnOwner !== userRole) {
      alert("배우자가 질문을 선택 중입니다.");
      return;
    }
    setCategory(cat);
    setIsFlipped(false);
    setTurnOwner(userRole);
    
    const pool = CARD_DATA.filter(q => q.category === cat);
    if (pool.length > 0) {
      const nextQ = pool[Math.floor(Math.random() * pool.length)];
      setCurrentQuestion(nextQ);
      updateCardState({ category: cat, isFlipped: false, turnOwner: userRole, questionId: nextQ.id });
    } else {
      updateCardState({ category: cat, isFlipped: false, turnOwner: userRole });
    }
  };

  const claimTurn = () => {
    if (!turnOwner) {
      setTurnOwner(userRole);
      updateCardState({ turnOwner: userRole });
    } else if (turnOwner !== userRole) {
      alert(`현재는 ${turnOwner === 'husband' ? '남편' : '아내'}님의 차례입니다.`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center p-4" style={{ paddingBottom: '150px', paddingTop: '20px' }}>
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
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
                <Sparkles size={45} color="#D4AF37" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#2D1F08', marginBottom: '15px' }}>오늘의 열 번째 대화 완료!</h3>
              <p style={{ fontSize: '15.5px', color: '#8B7355', fontWeight: 600, lineHeight: 1.6, wordBreak: 'keep-all', marginBottom: '35px' }}>
                오늘 나눈 대화가 서로를 더 깊게<br/>
                이해하는 시간이 되셨나요? ✨<br/>
                이제 대화를 마무리하고 함께<br/>
                달콤한 휴식을 취해볼까요?
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                <button 
                  onClick={onBack}
                  style={{ width: '100%', padding: '20px', borderRadius: '22px', background: '#2D1F08', color: 'white', fontWeight: 900, fontSize: '17px', border: 'none' }}
                >
                  오늘의 대화 마무리하기
                </button>
                <button 
                  onClick={() => {
                    setShowFinishModal(false);
                    setSessionCardCount(11); 
                  }}
                  style={{ width: '100%', padding: '15px', borderRadius: '20px', background: 'none', color: '#B08D3E', fontWeight: 800, fontSize: '14px', border: 'none' }}
                >
                  조금 더 대화할래요
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="w-full flex items-center justify-start mb-2">
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0' }}>
          <ChevronLeft size={20} color="#8A60FF" strokeWidth={3} />
          <span style={{ fontSize: '14px', fontWeight: 900, color: '#8A60FF' }}>홈으로</span>
        </button>
      </div>

      <div className="w-full flex flex-col items-center mb-6">
        <div className="category-row-container w-full relative">
          <div className="category-row">
              {['일상', '상상', '추억', '관계', '신앙'].map(cat => (
                <div key={cat} className={`category-chip ${category === cat ? 'active' : ''}`} onClick={() => changeCategory(cat)}>
                  {cat}
                </div>
              ))}
          </div>
          <div className="scroll-hint">옆으로 밀어보기 ➔</div>
        </div>
      </div>
      <div className="flex flex-col items-center" style={{ marginTop: '5px', marginBottom: '15px' }}>
        <p className="card-subtitle" style={{ letterSpacing: '5px', color: '#8B6500', fontWeight: '900', fontSize: '13px', opacity: 0.8, marginBottom: '5px' }}>SELECT YOUR TOPIC</p>
        <p style={{ fontSize: '11px', color: '#8B7355', fontWeight: 700, letterSpacing: '-0.2px' }}>질문 주제를 먼저 고르세요</p>
        
        {isWaiting && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2" style={{ marginTop: '10px', background: 'rgba(255, 77, 109, 0.15)', padding: '6px 15px', borderRadius: '20px', border: '1px solid #FF4D6D40' }}>
            <div className="animate-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF4D6D' }} />
            <span style={{ fontSize: '12px', color: '#FF4D6D', fontWeight: 900 }}>배우자가 답변 중입니다...</span>
          </motion.div>
        )}

        <div style={{ marginTop: '10px', fontSize: '10px', color: '#B08D3E', fontWeight: 800, background: 'rgba(255,255,255,0.5)', padding: '5px 12px', borderRadius: '10px', border: '1px solid #D4AF3740' }}>
          코드: <span style={{ color: '#D4AF37' }}>{coupleCode}</span> | {userRole === 'husband' ? '남편' : '아내'} | 턴: {turnOwner ? (turnOwner === 'husband' ? '남편' : '아내') : '자유'}
        </div>
      </div>

      <div className="card-deck">
        <div className="card-float-anim">
          <div className={`talking-card ${isFlipped ? 'flipped' : ''}`} onClick={toggleFlip}>
            <div className="card-face card-front" style={{ background: "url('/card_bg.png') no-repeat center center", backgroundSize: 'cover', borderRadius: '32px', overflow: 'hidden' }}>
              <div className="card-pattern-box" style={{ justifyContent: 'flex-end', padding: '0 15px 30px', background: 'rgba(0,0,0,0.02)' }}>
                <div className="flex flex-col items-center">
                  <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', padding: '12px 28px', borderRadius: '100px', border: '1.5px solid rgba(255,215,0,0.35)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '2px', boxShadow: '0 12px 35px rgba(0,0,0,0.5)', width: 'fit-content', minWidth: '220px' }}>
                    <p className="brand-text" style={{ fontSize: '20px', letterSpacing: '3px', color: '#FFD700', margin: 0, textShadow: '0 0 10px rgba(255,215,0,0.5)', whiteSpace: 'nowrap' }}>QUESTION CARD</p>
                    <p style={{ fontSize: '11px', color: '#FFF3A3', fontWeight: 900, margin: 0, letterSpacing: '1.5px', opacity: 0.9, whiteSpace: 'nowrap' }}>질문카드 | 클릭해서 확인</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-face card-back" style={{ background: "url('/card_bg.png') no-repeat center center", backgroundSize: 'cover', borderRadius: '32px', overflow: 'hidden', padding: 0 }}>
              <div className="card-pattern-box" style={{ background: 'rgba(255,255,255,0.85)', margin: '12px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', padding: '24px 18px', height: 'calc(100% - 24px)', width: 'calc(100% - 24px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box', position: 'relative' }}>
                <div style={{ flexShrink: 0, marginBottom: '8px' }}>
                  <span className="compat-badge" style={{ background: '#FF4D6D', color: 'white', fontWeight: 900, padding: '6px 16px', borderRadius: '100px', fontSize: '11px' }}>{category}</span>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px 0' }}>
                  <h2 className="card-question" style={{ fontSize: currentQuestion?.question?.length > 40 ? '16px' : '20px', color: '#1a1a1a', lineHeight: 1.5, textAlign: 'center', wordBreak: 'keep-all', fontWeight: 800, margin: '0 10px' }}>
                    {currentQuestion?.question || "주제를 선택해주세요."}
                  </h2>
                </div>
                <div style={{ flexShrink: 0, width: '100%', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                  {(!turnOwner || turnOwner === userRole) ? (
                    <button className="send-to-spouse-btn" 
                      style={{ background: '#2D1F08', borderRadius: '100px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '0 24px', boxShadow: '0 8px 20px rgba(0,0,0,0.3)', width: '100%', maxWidth: '220px', border: '2px solid #F5D060', cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); handOverTurn(); }}
                    >
                      <span style={{ color: 'white', fontWeight: 900, fontSize: '14px' }}>답변 완료 & 턴 넘기기</span>
                      <RefreshCw size={16} color="#F5D060" />
                    </button>
                  ) : (
                    <div style={{ background: 'rgba(138, 96, 255, 0.12)', padding: '12px 18px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', border: '1.5px solid #8A60FF40', width: '90%' }}>
                      <div className="flex items-center gap-2">
                        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#8A60FF' }} />
                        <span style={{ fontSize: '10px', color: '#8A60FF', fontWeight: 900, letterSpacing: '1.5px' }}>LISTENING...</span>
                      </div>
                      <span style={{ fontSize: '14px', color: '#4B2691', fontWeight: 900, textAlign: 'center', wordBreak: 'keep-all' }}>{turnOwner === 'husband' ? '남편' : '아내'}님의 답변에 귀 기울여주세요</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isWaiting && (
        <div key={`bottom-actions-${turnOwner}`} className="flex flex-col items-center w-full" style={{ marginTop: '40px' }}>
          {turnOwner === userRole ? (
            <button className="draw-btn" onClick={drawNewCard} style={{ width: '100%', maxWidth: '300px' }}>다른 카드 뽑기</button>
          ) : turnOwner ? (
            <div style={{ background: 'rgba(0,0,0,0.05)', padding: '18px 45px', borderRadius: '100px', color: '#8B7355', fontWeight: 800, fontSize: '16px', border: '1.5px dashed rgba(138, 96, 255, 0.2)', textAlign: 'center', width: '100%', maxWidth: '300px' }}>배우자의 답변을 기다리는 중</div>
          ) : (
            <button className="draw-btn" onClick={claimTurn} style={{ width: '100%', maxWidth: '300px', background: 'linear-gradient(135deg, #F5D060, #C8970A)' }}>먼저 질문 뽑기</button>
          )}

          <div style={{ marginTop: '15px' }}>
            {turnOwner && (
              <button onClick={() => { setTurnOwner(null); updateCardState({ turnOwner: null }); }} style={{ background: 'none', border: 'none', color: '#B08D3E', fontSize: '12px', fontWeight: 800, textDecoration: 'underline' }}>턴 주도권 초기화하기 (자유 모드)</button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CardGameView;
