import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Trash2, 
  Clock, 
  MapPin, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const CalendarView = ({ schedules, onAddSchedule, onDeleteSchedule, onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ title: '', time: '09:00', location: '', type: 'normal' });

  // Calendar logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  const filteredSchedules = schedules?.filter(s => {
    const sDate = new Date(s.date);
    return sDate.getFullYear() === currentDate.getFullYear() && 
           sDate.getMonth() === currentDate.getMonth() && 
           sDate.getDate() === selectedDate;
  }) || [];

  const handleAdd = () => {
    if (!newSchedule.title) return;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    onAddSchedule({
      id: Date.now(),
      ...newSchedule,
      date: dateStr
    });
    setNewSchedule({ title: '', time: '09:00', location: '', type: 'normal' });
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#FDFCF0] pb-20">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
          <ChevronLeft size={20} color="#2D1F08" />
        </button>
        <h1 className="text-[20px] font-black text-[#2D1F08]">오늘의 일정</h1>
        <div className="w-10" />
      </div>

      <div className="px-6 flex-1 overflow-y-auto">
        {/* Calendar Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-[#D4AF37]/10 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] font-black text-[#2D1F08]">{currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}</h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-full transition-colors"><ChevronLeft size={20} color="#8B7355" /></button>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-0 rounded-full transition-colors"><ChevronRight size={20} color="#8B7355" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-4 text-center mb-4">
            {weekDays.map((d, i) => (
              <span key={d} className={`text-[12px] font-black ${i === 0 ? 'text-[#FF5E62]' : i === 6 ? 'text-[#8A60FF]' : 'text-gray-400'}`}>{d}</span>
            ))}
            
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
              const isSelected = day === selectedDate;
              const hasEvents = schedules?.some(s => {
                const d = new Date(s.date);
                return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
              });

              return (
                <button 
                  key={day} 
                  onClick={() => setSelectedDate(day)}
                  className="relative flex flex-col items-center justify-center h-10 transition-all"
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-black z-10
                    ${isSelected ? 'bg-[#D4AF37] text-white' : isToday ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-[#2D1F08]'}
                  `}>
                    {day}
                  </div>
                  {hasEvents && !isSelected && (
                    <div className="absolute bottom-0 w-1 h-1 bg-[#D4AF37] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Schedule List */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-black text-[#2D1F08]">
            {monthNames[currentDate.getMonth()]} {selectedDate}일 일정
          </h3>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 text-[13px] font-black text-[#D4AF37] bg-[#D4AF37]/10 px-4 py-2 rounded-full"
          >
            <Plus size={16} /> 일정 추가
          </button>
        </div>

        <div className="space-y-3 pb-10">
          {filteredSchedules.length === 0 ? (
            <div className="py-12 text-center bg-white/50 rounded-[28px] border-2 border-dashed border-[#D4AF37]/20">
              <CalendarIcon size={32} className="mx-auto text-[#D4AF37]/30 mb-3" />
              <p className="text-[14px] font-bold text-[#8B7355]/60">이날의 일정이 없습니다.</p>
            </div>
          ) : (
            filteredSchedules.map((s) => (
              <motion.div 
                key={s.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[24px] p-4 flex items-center gap-4 shadow-sm border border-[#D4AF37]/5"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex flex-col items-center justify-center text-[#D4AF37]">
                  <Clock size={18} />
                  <span className="text-[10px] font-black mt-0.5">{s.time}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-[15px] font-black text-[#2D1F08]">{s.title}</h4>
                  {s.location && (
                    <p className="text-[12px] font-semibold text-[#8B7355] flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> {s.location}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => onDeleteSchedule(s.id)}
                  className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-400 active:scale-90 transition-transform"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl z-10 p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[18px] font-black text-[#2D1F08]">새 일정 추가</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-black text-gray-400 ml-2 mb-1 block">일정 내용</label>
                  <input 
                    type="text" 
                    placeholder="예: 맛있는 저녁 식사"
                    value={newSchedule.title}
                    onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                    className="w-full bg-[#FDFCF0] border-none rounded-[18px] px-5 py-4 text-[14px] font-black focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[12px] font-black text-gray-400 ml-2 mb-1 block">시간</label>
                    <input 
                      type="time" 
                      value={newSchedule.time}
                      onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                      className="w-full bg-[#FDFCF0] border-none rounded-[18px] px-5 py-4 text-[14px] font-black focus:ring-2 focus:ring-[#D4AF37]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[12px] font-black text-gray-400 ml-2 mb-1 block">장소</label>
                    <input 
                      type="text" 
                      placeholder="장소 (선택)"
                      value={newSchedule.location}
                      onChange={(e) => setNewSchedule({...newSchedule, location: e.target.value})}
                      className="w-full bg-[#FDFCF0] border-none rounded-[18px] px-5 py-4 text-[14px] font-black focus:ring-2 focus:ring-[#D4AF37]"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleAdd}
                  disabled={!newSchedule.title}
                  className="w-full py-4 mt-2 bg-[#D4AF37] text-white rounded-[20px] text-[16px] font-black shadow-lg shadow-[#D4AF37]/30 disabled:opacity-50 transition-opacity"
                >
                  저장하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarView;
