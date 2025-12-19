
import React, { useState } from 'react';
import { StudyEvent } from '../types';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Wand2, Sparkles, X, Check } from 'lucide-react';
import { studyAssistant } from '../services/geminiService';

interface CalendarViewProps {
  events: StudyEvent[];
  onAddEvent: (event: Partial<StudyEvent>) => void;
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
        title: eventTitle.trim(),
        date: modalDate,
        type: eventType,
      });
      setIsModalOpen(false);
    }
  };

  const dayCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    dayCells.push(<div key={`empty-${i}`} className={`h-24 lg:h-32 border-b border-r ${darkMode ? 'border-slate-800 bg-slate-800/10' : 'border-slate-100 bg-slate-50/20'}`} />);
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
        className={`h-24 lg:h-32 border-b border-r p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group relative cursor-pointer ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}
      >
        <span className={`text-[10px] lg:text-xs font-bold mb-1 block ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{d}</span>
        <div className="space-y-1 overflow-hidden">
          {dayEvents.map(event => (
            <div key={event.id} className={`text-[9px] lg:text-[10px] px-1.5 py-0.5 rounded truncate font-bold shadow-sm border ${
              event.type === 'exam' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
              event.type === 'deadline' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
              'bg-indigo-50 text-indigo-700 border-indigo-100'
            }`}>
              {event.title}
            </div>
          ))}
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="p-1.5 bg-indigo-600 rounded-lg shadow-lg">
             <Plus className="w-3 h-3 text-white" />
           </div>
        </div>
      </div>
    );
  }

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

  const cardBg = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textTitle = darkMode ? 'text-slate-100' : 'text-slate-800';

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
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
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {isGeneratingPlan ? 'Thinking...' : 'AI Study Plan'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className={`${cardBg} rounded-[2rem] border shadow-sm overflow-hidden lg:col-span-3`}>
          <div className={`grid grid-cols-7 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{day}</div>
            ))}
          </div>
          <div className={`grid grid-cols-7 border-l ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            {dayCells}
          </div>
        </div>

        <div className="space-y-6">
          <div className={`${cardBg} rounded-[2rem] border p-6 shadow-sm`}>
            <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${textTitle}`}>
              <Wand2 className="w-4 h-4 text-indigo-500" />
              Lumina Recommendations
            </h3>
            {aiPlan ? (
              <div className={`text-xs leading-relaxed whitespace-pre-wrap ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {aiPlan}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Generate a plan to see AI-powered revision schedules based on your workload.</p>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} w-full max-w-sm rounded-[2.5rem] border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300`}>
            <div className="bg-indigo-600 p-8 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Add Event</h3>
                <p className="text-indigo-100 text-[10px] uppercase font-bold tracking-widest mt-1">
                  {new Date(modalDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Description</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="e.g. Chapter 4 Review"
                  className={`w-full px-5 py-4 rounded-2xl border-none text-base font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${darkMode ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-900'}`}
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEvent()}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Category</label>
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
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEvent}
                  disabled={!eventTitle.trim()}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save
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
