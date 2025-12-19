
import React from 'react';
import { LayoutDashboard, BookOpen, Calendar, MessageSquare, Settings as SettingsIcon, LogOut, X } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
  compact?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, compact, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'subjects', icon: BookOpen, label: 'Curriculum' },
    { id: 'calendar', icon: Calendar, label: 'Study Plan' },
    { id: 'chat', icon: MessageSquare, label: 'Lumina AI' },
  ];

  const sidebarWidth = compact ? 'lg:w-20' : 'lg:w-64';
  const padding = compact ? 'p-3' : 'p-6';
  const itemPadding = compact ? 'px-3 py-3' : 'px-4 py-3';

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] lg:hidden animate-in fade-in duration-300" 
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-[80] bg-slate-900 text-slate-400 flex flex-col p-6 lg:relative lg:translate-x-0 transition-all duration-300 overflow-hidden
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0'}
        ${sidebarWidth} ${padding}
      `}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        
        <div className={`flex items-center gap-3 mb-10 text-white ${compact ? 'lg:justify-center' : ''}`}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className={`text-xl font-bold tracking-tight ${compact ? 'lg:hidden' : ''}`}>Lumina</span>
          <button onClick={onClose} className="lg:hidden ml-auto p-2 hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={compact ? item.label : ''}
              className={`w-full flex items-center gap-3 ${itemPadding} rounded-2xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-1' 
                  : 'hover:bg-slate-800 hover:text-slate-200'
              } ${compact ? 'lg:justify-center' : ''}`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className={`font-bold text-sm ${compact ? 'lg:hidden' : ''}`}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-800 space-y-2">
          <button 
            onClick={() => setActiveTab('settings')}
            title={compact ? 'Settings' : ''}
            className={`w-full flex items-center gap-3 ${itemPadding} rounded-2xl transition-all ${
              activeTab === 'settings' 
                ? 'bg-indigo-600 text-white shadow-xl translate-x-1' 
                : 'hover:bg-slate-800 hover:text-slate-200'
            } ${compact ? 'lg:justify-center' : ''}`}
          >
            <SettingsIcon className="w-5 h-5 shrink-0" />
            <span className={`font-bold text-sm ${compact ? 'lg:hidden' : ''}`}>Settings</span>
          </button>
          <button 
            onClick={() => { if(window.confirm('Log out from Lumina?')) onLogout(); }}
            title={compact ? 'Logout' : ''}
            className={`w-full flex items-center gap-3 ${itemPadding} rounded-2xl text-rose-400 hover:bg-rose-900/20 transition-all font-bold text-sm mt-4 ${compact ? 'lg:justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={compact ? 'lg:hidden' : ''}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
