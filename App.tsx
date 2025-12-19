
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search,
  Sparkles,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import { Subject, Folder, Note, StudyEvent } from './types';
import { supabase } from './services/supabase';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import CalendarView from './components/CalendarView';
import ChatAssistant from './components/ChatAssistant';
import SubjectsList from './components/SubjectsList';
import Auth from './components/Auth';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [user, setUser] = useState<{ name: string; email: string; id: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subjects' | 'calendar' | 'chat' | 'settings'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [events, setEvents] = useState<StudyEvent[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);

  // Auth State Listener
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        const userName = metadata.full_name || session.user.email?.split('@')[0] || 'Student';
        setUser({
          id: String(session.user.id),
          name: typeof userName === 'string' ? userName : 'Student',
          email: String(session.user.email || '')
        });
      }
      setInitialLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        const userName = metadata.full_name || session.user.email?.split('@')[0] || 'Student';
        setUser({
          id: String(session.user.id),
          name: typeof userName === 'string' ? userName : 'Student',
          email: String(session.user.email || '')
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async (isInitial = false) => {
    if (!user) return;
    if (isInitial) setInitialLoading(true);
    else setIsSyncing(true);

    try {
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select(`
          id, name, color,
          folders (
            id, subject_id, name,
            notes (
              id, folder_id, title, content, created_at, summary
            )
          )
        `)
        .eq('user_id', user.id);

      if (subjectsError) throw subjectsError;

      const mappedSubjects: Subject[] = (subjectsData || []).map((s: any) => ({
        id: String(s.id),
        name: String(s.name),
        color: String(s.color),
        folders: (s.folders || []).map((f: any) => ({
          id: String(f.id),
          subjectId: String(f.subject_id),
          name: String(f.name),
          notes: (f.notes || []).map((n: any) => ({
            id: String(n.id),
            folderId: String(n.folder_id),
            title: String(n.title),
            content: String(n.content || ''),
            createdAt: String(n.created_at),
            summary: n.summary ? String(n.summary) : undefined
          }))
        }))
      }));

      setSubjects(mappedSubjects);

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id);

      if (eventsError) throw eventsError;
      setEvents((eventsData || []).map((e: any) => ({
        id: String(e.id),
        title: String(e.title),
        date: String(e.date),
        type: e.type as any,
        subjectId: e.subject_id ? String(e.subject_id) : undefined
      })));

    } catch (err: any) {
      console.error('Error fetching data:', err.message || err);
    } finally {
      if (isInitial) setInitialLoading(false);
      setIsSyncing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchData(true);
    }
  }, [user, fetchData]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('lumina_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setDarkMode(!!parsed.darkMode);
        setCompactView(!!parsed.compactView);
      } catch (e) {
        console.error("Settings parse error", e);
      }
    }
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSubjects([]);
    setEvents([]);
  };

  const handleSaveSettings = (newSettings: { darkMode: boolean; compactView: boolean }) => {
    setDarkMode(newSettings.darkMode);
    setCompactView(newSettings.compactView);
    localStorage.setItem('lumina_settings', JSON.stringify(newSettings));
  };

  const handleAddSubject = async (name: string) => {
    if (!user) {
      console.error("No authenticated user found.");
      return;
    }

    setSearchQuery('');

    const color = `bg-${['blue', 'indigo', 'purple', 'emerald', 'rose'][Math.floor(Math.random() * 5)]}-500`;
    
    // Optimistic UI update
    const tempId = 'temp-' + Date.now();
    const tempSubject: Subject = { 
      id: tempId, 
      name, 
      color, 
      folders: [] 
    };
    setSubjects(prev => [...prev, tempSubject]);

    const { data, error } = await supabase
      .from('subjects')
      .insert([{ 
        name, 
        color, 
        user_id: user.id 
      }])
      .select()
      .single();

    if (error) { 
      // Rollback optimistic update
      setSubjects(prev => prev.filter(s => s.id !== tempId));
      
      console.error('Database Add Subject Error:', JSON.stringify(error, null, 2)); 
      if (error.code === '42501') {
        alert('Permission Denied (RLS Policy Error):\n\nPlease ensure your Supabase "subjects" table has a policy that allows "INSERT" for authenticated users.\n\nYou can run this in Supabase SQL Editor:\nCREATE POLICY "Users can insert their own subjects" ON subjects FOR INSERT WITH CHECK (auth.uid() = user_id);');
      } else {
        alert('Failed to add subject: ' + (error.message || 'Check connection.'));
      }
      return; 
    }
    
    if (data) {
      // Replace temp with real data
      setSubjects(prev => prev.map(s => s.id === tempId ? {
        ...s,
        id: String(data.id)
      } : s));
      setExpandedSubjectId(String(data.id));
      setActiveTab('subjects');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!window.confirm('Delete subject and all contents?')) return;
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) { console.error('Delete Subject Error:', error.message || error); return; }
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const handleCreateFolder = async (subjectId: string, name: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('folders')
      .insert([{ name, subject_id: subjectId, user_id: user.id }])
      .select()
      .single();

    if (error) { console.error('Add Folder Error:', error.message || error); return; }

    const newFolder: Folder = { 
      id: String(data.id), 
      subjectId: String(data.subject_id), 
      name: String(data.name), 
      notes: [] 
    };

    setSubjects(prev => prev.map(s => s.id === subjectId ? { 
      ...s, 
      folders: [...s.folders, newFolder] 
    } : s));
  };

  const handleDeleteFolder = async (subjectId: string, folderId: string) => {
    if (!window.confirm('Delete folder and all notes?')) return;
    const { error } = await supabase.from('folders').delete().eq('id', folderId);
    if (error) { console.error('Delete Folder Error:', error.message || error); return; }

    setSubjects(prev => prev.map(s => s.id === subjectId ? { 
      ...s, 
      folders: s.folders.filter(f => f.id !== folderId) 
    } : s));
  };

  const handleCreateNote = async (folderId: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('notes')
      .insert([{ 
        title: 'Untitled Note', 
        content: '', 
        folder_id: folderId, 
        user_id: user.id 
      }])
      .select()
      .single();

    if (error) { console.error('Add Note Error:', error.message || error); return; }

    const newNote: Note = {
      id: String(data.id),
      folderId: String(data.folder_id),
      title: String(data.title),
      content: String(data.content || ''),
      createdAt: String(data.created_at)
    };

    setSubjects(prev => prev.map(sub => ({
      ...sub,
      folders: sub.folders.map(fold => fold.id === folderId ? { ...fold, notes: [...fold.notes, newNote] } : fold)
    })));
    setSelectedNote(newNote);
  };

  const handleUpdateNote = async (noteId: string, updates: Partial<Note>) => {
    if (!user) return;
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = String(updates.title);
    if (updates.content !== undefined) dbUpdates.content = String(updates.content);
    if (updates.summary !== undefined) dbUpdates.summary = updates.summary ? String(updates.summary) : null;

    const { error } = await supabase.from('notes').update(dbUpdates).eq('id', noteId);
    if (error) { console.error('Update Note Error:', error.message || error); return; }

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

  const handleAddEvent = async (e: Partial<StudyEvent>) => {
    if (!user) return;
    
    const dbEventPayload = {
      title: e.title,
      date: e.date,
      type: e.type,
      subject_id: e.subjectId || null,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('events')
      .insert([dbEventPayload])
      .select()
      .single();

    if (error) { 
      console.error('Add Event Error:', JSON.stringify(error, null, 2));
      alert('Failed to save event: ' + (error.message || 'Check connection.'));
      return; 
    }
    
    if (data) {
      const newEvent: StudyEvent = {
        id: String(data.id),
        title: String(data.title),
        date: String(data.date),
        type: data.type as any,
        subjectId: data.subject_id ? String(data.subject_id) : undefined
      };
      setEvents(prev => [...prev, newEvent]);
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.folders.some(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (initialLoading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
        <p className="text-slate-400 font-medium animate-pulse">Initializing your workspace...</p>
      </div>
    </div>
  );

  if (!user) return <Auth onLogin={(u) => setUser(u)} />;

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
                placeholder="Cloud search..." 
                className={`pl-10 pr-4 py-2 rounded-xl border-none text-sm focus:ring-2 focus:ring-indigo-500 w-48 lg:w-72 transition-all ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isSyncing && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Syncing</span>
              </div>
            )}
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
              {user.name && typeof user.name === 'string' ? user.name[0] : '?'}
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
                onAddSubject={handleAddSubject}
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
