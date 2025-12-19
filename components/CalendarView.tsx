
import React, { useState } from 'react';
import { StudyEvent } from '../types';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Wand2, Sparkles, X, Check } from 'lucide-react';
import { studyAssistant } from '../services/geminiService';

interface CalendarViewProps {
  events: StudyEvent[];
  onAddEvent: (event: StudyEvent) => void;
  darkMode?: boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, onAddEvent, darkMode }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [aiPlan, setAiPlan] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<'study' | 'exam' | 'deadline'>('study');

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleOpenModal = (dateStr: string) => {
    setModalDate(dateStr);
    setEventTitle('');
    setEventType('study');
    setIsModalOpen(true);
  };

  const handleSaveEvent = () => {
    if (eventTitle.trim()) {
      onAddEvent({
        id: Date.now().toString(),
        title: eventTitle.trim(),
        date: modalDate,
        type: eventType,
      });
      setIsModalOpen(false);
    }
  };

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const plan = await studyAssistant.createStudyPlan('next week', ['Academic Growth', 'Exam Strategy']);
      setAiPlan(plan || "Could not generate plan.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const dayCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    dayCells.push(<div key={`empty-${i}`} className={`h-20 lg:h-32 border-b border-r ${darkMode ? 'border-slate-800 bg-slate-800/20' : 'border-slate-100 bg-slate-50/30'}`} />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(d).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayEvents = events.filter(e => e.date === dateStr);
    
    dayCells.push(
      <div 
        key={d} 
        onClick={() => handleOpenModal(dateStr)}
        className={`h-20 lg:h-32 border-b border-r p-1 lg:p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group relative cursor-pointer ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}
      >
        <span className={`text-[10px] lg:text-xs font-bold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{d}</span>
        <div className="mt-0.5 lg:mt-1 space-y-0.5 lg:space-y-1 overflow-hidden">
          {dayEvents.map(event => (
            <div key={event.id} className={`text-[8px] lg:text-[10px] p-0.5 lg:p-1 rounded truncate font-bold shadow-sm ${
              event.type === 'exam' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 
              event.type === 'deadline' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
            }`}>
              {event.title}
            </div>
          ))}
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleOpenModal(dateStr);
          }}
          className="absolute bottom-1 right-1 p-1.5 lg:p-2 bg-indigo-600 text-white shadow-lg rounded-xl opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all z-10 hover:scale-110 active:scale-95 border border-white/10"
          title="Add Event"
        >
          <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
        </button>
      </div>
    );
  }

  const cardBg = darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200';
  const textTitle = darkMode ? 'text-slate-100' : 'text-slate-800';

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className={`text-xl lg:text-2xl font-bold ${textTitle}`}>{monthName} {currentDate.getFullYear()}</h2>
          <div className={`flex border rounded-xl overflow-hidden shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <button onClick={prevMonth} className={`p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 border-r transition-colors ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={nextMonth} className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
        <button 
          onClick={handleGeneratePlan}
          disabled={isGeneratingPlan}
          className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-xs lg:text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {isGeneratingPlan ? 'Planning...' : 'AI Planner'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        <div className={`${cardBg} rounded-[2rem] border shadow-sm overflow-hidden lg:col-span-3`}>
          <div className={`grid grid-cols-7 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
              <div key={day} className="py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{day}</div>
            ))}
          </div>
          <div className={`grid grid-cols-7 border-l ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            {dayCells}
          </div>
        </div>

        <div className="space-y-6">
          <div className={`${cardBg} rounded-[2rem] border p-6 shadow-sm`}>
            <h3 className={`text-sm lg:text-base font-bold mb-4 flex items-center gap-2 ${textTitle}`}>
              <Wand2 className="w-4 h-4 text-indigo-500" />
              Revision Strategy
            </h3>
            {aiPlan ? (
              <div className={`text-xs leading-relaxed whitespace-pre-wrap animate-in fade-in duration-500 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {aiPlan}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Generate a plan to see AI revision schedules based on your workload.</p>
            )}
          </div>

          <div className={`${darkMode ? 'bg-slate-800/30' : 'bg-slate-50'} p-5 rounded-[2rem] border border-dashed ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Legend</h4>
            <div className="space-y-3">
              {[
                { label: 'Exams', color: 'bg-rose-500' },
                { label: 'Deadlines', color: 'bg-amber-500' },
                { label: 'Study Sessions', color: 'bg-indigo-500' }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 ${item.color} rounded-full`} />
                  <span className="text-[10px] lg:text-xs font-semibold text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} w-full max-w-sm rounded-[2.5rem] border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300`}>
            <div className="bg-indigo-600 p-6 lg:p-8 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg lg:text-xl font-bold">New Event</h3>
                <p className="text-indigo-100 text-[10px] uppercase font-bold tracking-widest mt-1">
                  {new Date(modalDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 lg:p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Task Title</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="e.g. Physics Lab Report"
                  className={`w-full px-5 py-4 rounded-2xl border-none text-base font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${darkMode ? 'bg-slate-800 placeholder:text-slate-600' : 'bg-slate-100 placeholder:text-slate-400'}`}
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEvent()}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['study', 'exam', 'deadline'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setEventType(type)}
                      className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border-2 ${
                        eventType === type 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                          : `${darkMode ? 'bg-slate-800 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-50 text-slate-500'} hover:border-slate-300`
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className={`flex-1 py-4 rounded-xl font-bold text-xs transition-all ${darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  Discard
                </button>
                <button 
                  onClick={handleSaveEvent}
                  disabled={!eventTitle.trim()}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
