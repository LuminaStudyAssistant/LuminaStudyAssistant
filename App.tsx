
import React, { useState, useEffect } from 'react';
import { 
  Search,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { Subject, Folder, Note, StudyEvent } from './types';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import CalendarView from './components/CalendarView';
import ChatAssistant from './components/ChatAssistant';
import SubjectsList from './components/SubjectsList';
import Auth from './components/Auth';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subjects' | 'calendar' | 'chat' | 'settings'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Settings State
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);

  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: '1',
      name: 'Computer Science 101',
      color: 'bg-indigo-500',
      folders: [
        {
          id: 'f1',
          subjectId: '1',
          name: 'Lecture Notes',
          notes: [
            { id: 'n1', folderId: 'f1', title: 'Data Structures Intro', content: 'Arrays and Linked Lists are fundamental...', createdAt: new Date().toISOString() }
          ]
        }
      ]
    },
    {
      id: '2',
      name: 'Modern History',
      color: 'bg-emerald-500',
      folders: []
    }
  ]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [events, setEvents] = useState<StudyEvent[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('lumina_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    const savedEvents = localStorage.getItem('lumina_events');
    if (savedEvents) setEvents(JSON.parse(savedEvents));

    const savedSettings = localStorage.getItem('lumina_settings');
    if (savedSettings) {
      const { darkMode: dm, compactView: cv } = JSON.parse(savedSettings);
      setDarkMode(dm);
      setCompactView(cv);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
    localStorage.setItem('lumina_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lumina_user');
  };

  const handleSaveSettings = (newSettings: { darkMode: boolean; compactView: boolean }) => {
    setDarkMode(newSettings.darkMode);
    setCompactView(newSettings.compactView);
    localStorage.setItem('lumina_settings', JSON.stringify(newSettings));
  };

  const handleAddSubject = (name: string) => {
    const newSub: Subject = {
      id: Date.now().toString(),
      name,
      color: `bg-${['blue', 'indigo', 'purple', 'emerald', 'rose'][Math.floor(Math.random() * 5)]}-500`,
      folders: []
    };
    setSubjects([...subjects, newSub]);
  };

  const handleDeleteSubject = (id: string) => {
    if (window.confirm('Delete this subject and all its contents?')) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const handleCreateFolder = (subjectId: string, name: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      subjectId,
      name,
      notes: []
    };
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, folders: [...s.folders, newFolder] } : s));
  };

  const handleDeleteFolder = (subjectId: string, folderId: string) => {
    if (window.confirm('Delete this folder and all its notes?')) {
      setSubjects(prev => prev.map(s => s.id === subjectId ? { 
        ...s, 
        folders: s.folders.filter(f => f.id !== folderId) 
      } : s));
    }
  };

  const handleUpdateNote = (noteId: string, updates: Partial<Note>) => {
    setSubjects(prev => prev.map(sub => ({
      ...sub,
      folders: sub.folders.map(fold => ({
        ...fold,
        notes: fold.notes.map(n => n.id === noteId ? { ...n, ...updates } : n)
      }))
    })));
    if (selectedNote?.id === noteId) {
      setSelectedNote(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleCreateNote = (folderId: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      folderId,
      title: 'Untitled Note',
      content: '',
      createdAt: new Date().toISOString()
    };
    
    setSubjects(prev => prev.map(sub => ({
      ...sub,
      folders: sub.folders.map(fold => fold.id === folderId ? { ...fold, notes: [...fold.notes, newNote] } : fold)
    })));
    setSelectedNote(newNote);
  };

  const handleAddEvent = (e: StudyEvent) => {
    setEvents(prev => {
      const updated = [...prev, e];
      localStorage.setItem('lumina_events', JSON.stringify(updated));
      return updated;
    });
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.folders.some(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!user) return <Auth onLogin={handleLogin} />;

  const themeClasses = darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';

  return (
    <div className={`flex h-screen overflow-hidden ${themeClasses} transition-colors duration-500`}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { 
          if (tab === 'calendar') setActiveTab('calendar');
          else setActiveTab(tab); 
          setIsSidebarOpen(false); 
        }} 
        onLogout={handleLogout} 
        compact={compactView}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full relative z-0">
        <header className={`h-16 border-b flex items-center justify-between px-4 lg:px-10 shrink-0 transition-all duration-300 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center gap-3 lg:gap-6 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base lg:text-lg font-bold tracking-tight capitalize truncate max-w-[120px] lg:max-w-none">{activeTab}</h1>
            <div className="relative hidden md:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                placeholder="Quick search..." 
                className={`pl-10 pr-4 py-2 rounded-xl border-none text-sm focus:ring-2 focus:ring-indigo-500 w-48 lg:w-72 transition-all ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 lg:gap-6">
            <button 
              onClick={() => setActiveTab('chat')}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-2xl text-xs lg:text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Ask Lumina</span>
              <span className="sm:hidden">AI</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className="w-9 h-9 lg:w-11 lg:h-11 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex items-center justify-center font-bold text-xs lg:text-sm hover:ring-4 hover:ring-indigo-100 dark:hover:ring-indigo-900/50 transition-all shrink-0 overflow-hidden"
            >
              {user.name[0]}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'dashboard' && (
              <Dashboard 
                subjects={filteredSubjects} 
                events={events} 
                onNoteClick={(note) => { setSelectedNote(note); setActiveTab('subjects'); }}
                onOpenSubject={(id) => { 
                  if (id === 'calendar') setActiveTab('calendar');
                  else { setExpandedSubjectId(id); setActiveTab('subjects'); }
                }}
                darkMode={darkMode}
              />
            )}
            {activeTab === 'subjects' && (
              <SubjectsList 
                subjects={filteredSubjects} 
                onAddSubject={handleAddSubject}
                onDeleteSubject={handleDeleteSubject}
                onAddFolder={handleCreateFolder}
                onDeleteFolder={handleDeleteFolder}
                onCreateNote={handleCreateNote}
                selectedNote={selectedNote}
                onSelectNote={setSelectedNote}
                onUpdateNote={handleUpdateNote}
                externalExpandedId={expandedSubjectId}
                darkMode={darkMode}
                compact={compactView}
              />
            )}
            {activeTab === 'calendar' && (
              <CalendarView events={events} onAddEvent={handleAddEvent} darkMode={darkMode} />
            )}
            {activeTab === 'chat' && (
              <ChatAssistant contextNote={selectedNote} darkMode={darkMode} />
            )}
            {activeTab === 'settings' && (
              <Settings 
                user={user} 
                onUpdateUser={handleSaveSettings} 
                initialDarkMode={darkMode} 
                initialCompactView={compactView} 
              />
            )}
          </div>
        </div>
      </main>

      {selectedNote && activeTab === 'subjects' && (
        <div className={`fixed inset-0 lg:relative lg:inset-auto lg:w-1/2 z-[100] lg:z-10 border-l flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl lg:shadow-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'}`}>
          <NoteEditor 
            note={selectedNote} 
            onClose={() => setSelectedNote(null)} 
            onSave={(content) => handleUpdateNote(selectedNote.id, { content })}
            darkMode={darkMode}
          />
        </div>
      )}
    </div>
  );
};

export default App;
