
import React, { useState, useEffect } from 'react';
import { Subject, Folder, Note } from '../types';
import { Plus, Folder as FolderIcon, FileText, ChevronDown, ChevronRight, Trash2, FolderPlus, BookOpen, X, Check } from 'lucide-react';

interface SubjectsListProps {
  subjects: Subject[];
  onAddSubject: (name: string) => void;
  onDeleteSubject: (id: string) => void;
  onAddFolder: (subjectId: string, name: string) => void;
  onDeleteFolder: (subjectId: string, folderId: string) => void;
  onCreateNote: (folderId: string) => void;
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  externalExpandedId?: string | null;
  darkMode?: boolean;
  compact?: boolean;
}

const SubjectsList: React.FC<SubjectsListProps> = ({ 
  subjects, onAddSubject, onDeleteSubject, onAddFolder, onDeleteFolder, 
  onCreateNote, selectedNote, onSelectNote, externalExpandedId, darkMode, compact 
}) => {
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [activeFolderInput, setActiveFolderInput] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    if (externalExpandedId) {
      setExpandedSubjects(prev => Array.from(new Set([...prev, externalExpandedId])));
    }
  }, [externalExpandedId]);

  const toggleSubject = (id: string) => {
    setExpandedSubjects(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleAddSubjectSubmit = () => {
    const trimmed = newSubjectName.trim();
    if (trimmed) {
      onAddSubject(trimmed);
      setNewSubjectName('');
    }
  };

  const handleAddFolderSubmit = (subjectId: string) => {
    const trimmed = newFolderName.trim();
    if (trimmed) {
      onAddFolder(subjectId, trimmed);
      setNewFolderName('');
      setActiveFolderInput(null);
      if (!expandedSubjects.includes(subjectId)) {
        setExpandedSubjects(prev => [...prev, subjectId]);
      }
    }
  };

  const textMain = darkMode ? 'text-slate-100' : 'text-slate-800';
  const textSub = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 h-full pb-12 max-w-7xl mx-auto">
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between px-2 mb-2">
          <h2 className={`font-bold text-xs tracking-widest uppercase ${textSub}`}>Curriculum</h2>
          <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">{subjects.length} Subjects</span>
        </div>
        
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-280px)] pr-2 custom-scrollbar">
          {subjects.map(subject => (
            <div key={subject.id} className="space-y-2 group">
              <div className="flex items-center gap-2">
                <div 
                  className={`flex-1 flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    expandedSubjects.includes(subject.id) 
                      ? (darkMode ? 'bg-slate-800/50 border-slate-700 shadow-lg' : 'bg-white border-slate-200 shadow-md') 
                      : (darkMode ? 'bg-slate-800/20 border-transparent hover:bg-slate-800/40' : 'bg-white border-transparent hover:border-slate-100 shadow-sm')
                  }`}
                  onClick={() => toggleSubject(subject.id)}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className={`w-3 h-3 rounded-full ${subject.color} shrink-0`} />
                    <span className={`font-bold text-sm truncate ${textMain}`}>{subject.name}</span>
                  </div>
                  {expandedSubjects.includes(subject.id) ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteSubject(subject.id); }}
                  className="p-3 text-slate-400 hover:text-rose-500 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"
                  title="Delete Subject"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {expandedSubjects.includes(subject.id) && (
                <div className="ml-5 pl-5 border-l-2 border-slate-100 dark:border-slate-800 space-y-3 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                  {subject.folders.map(folder => (
                    <div key={folder.id} className="space-y-1">
                      <div className="flex items-center gap-2 group/folder">
                        <div 
                          className={`flex-1 flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                            expandedFolders.includes(folder.id) ? (darkMode ? 'bg-slate-800' : 'bg-slate-50') : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                          }`}
                          onClick={() => toggleFolder(folder.id)}
                        >
                          <FolderIcon className={`w-4 h-4 ${expandedFolders.includes(folder.id) ? 'text-indigo-500' : 'text-slate-400'}`} />
                          <span className={`text-xs font-bold ${textSub}`}>{folder.name}</span>
                          {expandedFolders.includes(folder.id) ? <ChevronDown className="w-3 h-3 ml-auto text-slate-300" /> : <ChevronRight className="w-3 h-3 ml-auto text-slate-300" />}
                        </div>
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteFolder(subject.id, folder.id); }}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover/folder:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {expandedFolders.includes(folder.id) && (
                        <div className="ml-4 space-y-1 pt-1">
                          {folder.notes.map(note => (
                            <button 
                              key={note.id}
                              onClick={() => onSelectNote(note)}
                              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs transition-all ${
                                selectedNote?.id === note.id 
                                  ? 'bg-indigo-600 text-white shadow-lg' 
                                  : 'text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                              }`}
                            >
                              <FileText className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate font-medium">{note.title}</span>
                            </button>
                          ))}
                          <button 
                            onClick={() => onCreateNote(folder.id)}
                            className="w-full flex items-center gap-3 p-2.5 rounded-xl text-[10px] font-bold text-indigo-500 hover:bg-indigo-50 transition-all mt-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>New Note</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {activeFolderInput === subject.id ? (
                    <div className="flex gap-2 p-1 animate-in slide-in-from-left-2">
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="Folder name..."
                        className={`flex-1 text-xs rounded-xl px-3 py-2 outline-none border focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200'}`}
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddFolderSubmit(subject.id);
                          if (e.key === 'Escape') setActiveFolderInput(null);
                        }}
                      />
                      <button onClick={() => handleAddFolderSubmit(subject.id)} className="p-2 bg-indigo-600 text-white rounded-xl"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setActiveFolderInput(null)} className="p-2 bg-slate-200 dark:bg-slate-700 rounded-xl"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setActiveFolderInput(subject.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-[10px] font-bold text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all"
                    >
                      <FolderPlus className="w-4 h-4" />
                      <span>New Folder</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          <div className="pt-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Course title..."
                className={`flex-1 text-sm rounded-2xl px-4 py-3 outline-none border focus:ring-2 focus:ring-indigo-500 transition-all ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200'}`}
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSubjectSubmit();
                }}
              />
              <button 
                onClick={handleAddSubjectSubmit}
                className="bg-indigo-600 text-white rounded-2xl p-3 shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 hidden lg:flex flex-col items-center justify-center">
        {!selectedNote ? (
          <div className={`h-full w-full flex flex-col items-center justify-center text-center p-12 rounded-[3rem] border-2 border-dashed ${darkMode ? 'bg-slate-800/10 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 ${darkMode ? 'bg-indigo-900/20' : 'bg-indigo-50'}`}>
              <BookOpen className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className={`text-2xl font-bold mb-3 ${textMain}`}>Ready to study?</h3>
            <p className="text-slate-400 max-w-sm mb-8 leading-relaxed text-sm">Select a subject or specific note from your curriculum to start working.</p>
          </div>
        ) : (
          <div className="text-slate-400 text-sm font-medium animate-pulse">
            Editing your note on the side panel...
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectsList;
