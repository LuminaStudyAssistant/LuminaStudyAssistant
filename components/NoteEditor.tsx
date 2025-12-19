
import React, { useState, useEffect } from 'react';
import { Note, Flashcard } from '../types';
import { X, Save, Sparkles, Wand2, Lightbulb, ListChecks, ChevronLeft } from 'lucide-react';
import { studyAssistant } from '../services/geminiService';

interface NoteEditorProps {
  note: Note;
  onClose: () => void;
  onSave: (content: string) => void;
  darkMode?: boolean;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onClose, onSave, darkMode }) => {
  const [content, setContent] = useState(note.content);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [summary, setSummary] = useState(note.summary || '');
  const [flashcards, setFlashcards] = useState<Flashcard[]>(note.flashcards || []);

  useEffect(() => {
    setContent(note.content);
    setSummary(note.summary || '');
    setFlashcards(note.flashcards || []);
  }, [note]);

  const handleSummarize = async () => {
    if (!content.trim()) return;
    setIsSummarizing(true);
    try {
      const res = await studyAssistant.summarizeNote(content);
      setSummary(res || '');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleFlashcards = async () => {
    if (!content.trim()) return;
    setIsGeneratingCards(true);
    try {
      const cards = await studyAssistant.generateFlashcards(content);
      setFlashcards(cards);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingCards(false);
    }
  };

  const textClass = darkMode ? 'text-slate-100' : 'text-slate-800';
  const bgClass = darkMode ? 'bg-slate-900' : 'bg-white';
  const borderClass = darkMode ? 'border-slate-800' : 'border-slate-200';

  return (
    <div className={`h-full flex flex-col ${bgClass} transition-colors duration-300`}>
      <div className={`h-16 border-b px-4 lg:px-6 flex items-center justify-between shrink-0 ${borderClass}`}>
        <div className="flex items-center gap-2 lg:gap-3 overflow-hidden">
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className={`font-bold text-sm lg:text-base truncate pr-2 ${textClass}`}>{note.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onSave(content)}
            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-bold transition-all"
          >
            <Save className="w-4 h-4" /> 
            <span className="hidden sm:inline">Save</span>
          </button>
          <button onClick={onClose} className="hidden lg:block p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <textarea
          className={`flex-1 w-full p-6 lg:p-8 text-base lg:text-lg leading-relaxed outline-none resize-none placeholder:text-slate-300 dark:placeholder:text-slate-700 bg-transparent ${textClass}`}
          placeholder="Start typing your study notes here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className={`h-[40%] border-t overflow-y-auto ${darkMode ? 'bg-slate-800/30' : 'bg-slate-50'} ${borderClass} custom-scrollbar`}>
          <div className="p-4 lg:p-6 pb-20 lg:pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h4 className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Lumina Tools
              </h4>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={handleSummarize}
                  disabled={isSummarizing}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border disabled:opacity-50 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  {isSummarizing ? 'Wait...' : 'Summarize'}
                </button>
                <button 
                  onClick={handleFlashcards}
                  disabled={isGeneratingCards}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border disabled:opacity-50 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <ListChecks className="w-3.5 h-3.5" />
                  {isGeneratingCards ? 'Thinking...' : 'Flashcards'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {summary && (
                <div className={`p-4 rounded-2xl border transition-all animate-in slide-in-from-bottom-2 duration-300 ${darkMode ? 'bg-slate-800 border-indigo-900/50' : 'bg-white border-indigo-100 shadow-sm'}`}>
                  <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                    <Lightbulb className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Key Concepts</span>
                  </div>
                  <div className={`text-sm leading-relaxed whitespace-pre-wrap ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {summary}
                  </div>
                </div>
              )}

              {flashcards.length > 0 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-3">
                    {flashcards.map((card, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'}`}>
                        <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-1 uppercase tracking-widest">Question</p>
                        <p className={`text-sm font-semibold mb-3 ${textClass}`}>{card.question}</p>
                        <div className="w-full h-px bg-slate-100 dark:bg-slate-700 my-2" />
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-widest">Answer</p>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{card.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!summary && !flashcards.length && !isSummarizing && !isGeneratingCards && (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400 italic">Generate AI insights to help with your studying.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
