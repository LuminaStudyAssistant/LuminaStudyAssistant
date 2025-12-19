
import React from 'react';
import { Subject, StudyEvent, Note } from '../types';
import { Clock, Calendar as CalendarIcon, BookOpen, ChevronRight, Activity } from 'lucide-react';

interface DashboardProps {
  subjects: Subject[];
  events: StudyEvent[];
  onNoteClick: (note: Note) => void;
  onOpenSubject: (id: string) => void;
  darkMode?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ subjects, events, onNoteClick, onOpenSubject, darkMode }) => {
  const recentNotes = subjects.flatMap(s => s.folders.flatMap(f => f.notes)).slice(0, 3);
  const upcomingEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3);

  const cardBg = darkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-200/60 shadow-sm';
  const textTitle = darkMode ? 'text-slate-100' : 'text-slate-800';
  const textBody = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 max-w-7xl mx-auto">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className={`text-2xl lg:text-3xl font-bold ${textTitle}`}>Your Overview</h2>
          <p className={`${textBody} mt-1 text-sm lg:text-base`}>Manage your curriculum and study progress effortlessly.</p>
        </div>
        <div className={`px-4 py-2 rounded-2xl flex items-center gap-3 ${darkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
           <Activity className="w-4 h-4 text-emerald-500" />
           <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Activity Active</span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-bold ${textTitle}`}>Active Subjects</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {subjects.length > 0 ? subjects.map(subject => (
              <div 
                key={subject.id} 
                onClick={() => onOpenSubject(subject.id)}
                className={`${cardBg} p-6 rounded-[2rem] border hover:border-indigo-400/50 hover:shadow-xl transition-all group cursor-pointer active:scale-[0.98]`}
              >
                <div className={`w-12 h-12 rounded-2xl ${subject.color} mb-5 flex items-center justify-center text-white shadow-lg`}>
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className={`font-bold ${textTitle} text-lg`}>{subject.name}</h4>
                <p className={`${textBody} text-xs mt-1.5 font-medium`}>{subject.folders.length} Folders · {subject.folders.reduce((acc, f) => acc + f.notes.length, 0)} Notes</p>
                <div className="mt-5 flex items-center text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all group-hover:translate-x-1">
                  Explore curriculum <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            )) : (
              <div className={`col-span-full py-16 text-center border border-dashed rounded-[2rem] ${darkMode ? 'bg-slate-800/20 border-slate-700' : 'bg-slate-100/50 border-slate-200'}`}>
                <p className="text-slate-400 text-sm font-medium">No subjects found. Start by creating your first course.</p>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4">
            <h3 className={`text-lg font-bold ${textTitle}`}>Recently Modified</h3>
            <div className="space-y-3">
              {recentNotes.length > 0 ? recentNotes.map(note => (
                <button
                  key={note.id}
                  onClick={() => onNoteClick(note)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all group ${darkMode ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/50' : 'bg-white border-slate-200/60 hover:border-indigo-300 hover:shadow-sm'}`}
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                      <Clock className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="text-left truncate">
                      <p className={`font-bold text-sm lg:text-base truncate ${textTitle}`}>{note.title}</p>
                      <p className="text-[10px] lg:text-xs text-slate-400 font-medium">Updated {new Date(note.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 shrink-0 group-hover:text-indigo-400 transition-colors" />
                </button>
              )) : (
                <p className="text-slate-400 italic text-sm py-4">No recent notes. Ready to start drafting?</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`${cardBg} p-8 rounded-[2.5rem] border shadow-sm`}>
            <h3 className={`text-lg font-bold mb-8 flex items-center gap-3 ${textTitle}`}>
              <CalendarIcon className="w-6 h-6 text-indigo-500" />
              Schedule
            </h3>
            <div className="space-y-6">
              {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                <div key={event.id} className="flex gap-5 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-1.5 shadow-sm shrink-0 ${
                      event.type === 'exam' ? 'bg-rose-500 ring-4 ring-rose-500/10' : 
                      event.type === 'deadline' ? 'bg-amber-500 ring-4 ring-amber-500/10' : 
                      'bg-indigo-500 ring-4 ring-indigo-500/10'
                    }`} />
                    <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 my-2 group-last:bg-transparent" />
                  </div>
                  <div className="pb-5">
                    <p className={`font-bold text-sm transition-colors ${textTitle}`}>{event.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
                         event.type === 'exam' ? 'bg-rose-50 text-rose-600' :
                         event.type === 'deadline' ? 'bg-amber-50 text-amber-600' :
                         'bg-indigo-50 text-indigo-600'
                       }`}>
                         {event.type}
                       </span>
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10">
                   <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                     <CalendarIcon className="w-7 h-7 text-slate-300" />
                   </div>
                   <p className="text-xs text-slate-400 font-medium">Your schedule is clear.</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => onOpenSubject('calendar')} 
              className="w-full mt-4 py-3 border border-slate-100 dark:border-slate-700 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              View Full Planner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
