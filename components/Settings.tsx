
import React, { useState } from 'react';
import { Bell, Palette, Save, CheckCircle, User } from 'lucide-react';

interface SettingsProps {
  user: { name: string; email: string };
  onUpdateUser: (settings: { darkMode: boolean; compactView: boolean }) => void;
  initialDarkMode: boolean;
  initialCompactView: boolean;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, initialDarkMode, initialCompactView }) => {
  const [darkMode, setDarkMode] = useState(initialDarkMode);
  const [compactView, setCompactView] = useState(initialCompactView);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    onUpdateUser({ darkMode, compactView });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const cardBg = darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200';
  const textMain = darkMode ? 'text-slate-100' : 'text-slate-800';
  const textSub = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className={`flex flex-col sm:flex-row items-center gap-4 lg:gap-6 p-6 lg:p-8 rounded-[2rem] border shadow-sm ${cardBg}`}>
        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl lg:text-4xl font-bold shadow-xl shadow-indigo-500/10">
          {user.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h2 className={`text-xl lg:text-2xl font-bold ${textMain}`}>{user.name}</h2>
          <p className={`${textSub} text-sm font-medium`}>{user.email}</p>
          <div className="pt-2">
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold uppercase">Pro Student</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <section className={`p-6 rounded-[2rem] border shadow-sm space-y-6 ${cardBg}`}>
          <h3 className={`text-lg font-bold flex items-center gap-2 ${textMain}`}>
            <Palette className="w-5 h-5 text-indigo-500" />
            Workspace
          </h3>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <p className={`font-semibold text-sm ${textMain}`}>Dark Mode</p>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Focus better with a darker palette.</p>
              </div>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${darkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <p className={`font-semibold text-sm ${textMain}`}>Compact View</p>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Maximize screen space on desktop.</p>
              </div>
              <button 
                onClick={() => setCompactView(!compactView)}
                className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${compactView ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${compactView ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </section>

        <section className={`p-6 rounded-[2rem] border shadow-sm space-y-6 ${cardBg}`}>
          <h3 className={`text-lg font-bold flex items-center gap-2 ${textMain}`}>
            <Bell className="w-5 h-5 text-amber-500" />
            Notifications
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <p className={`font-semibold text-sm ${textMain}`}>Reminders (24h)</p>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-indigo-600" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <p className={`font-semibold text-sm ${textMain}`}>Session Alerts</p>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-indigo-600" />
            </label>
          </div>
        </section>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
        {showSaved && (
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle className="w-4 h-4" />
            Settings saved!
          </div>
        )}
        <button 
          onClick={handleSave}
          className="w-full sm:w-auto bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Save className="w-4 h-4" />
          Update Workspace
        </button>
      </div>

      <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-500/10">
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-bold mb-1">Export Data</h3>
          <p className="text-indigo-100 text-sm opacity-80">Download all your notes and study materials as a single file.</p>
        </div>
        <button className="whitespace-nowrap bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-2 text-sm">
          <Save className="w-4 h-4" />
          Export All (.ZIP)
        </button>
      </div>
    </div>
  );
};

export default Settings;
