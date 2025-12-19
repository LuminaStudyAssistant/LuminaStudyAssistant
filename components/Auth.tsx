
import React, { useState } from 'react';
import { BookOpen, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface AuthProps {
  onLogin: (user: { name: string; email: string; id: string }) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          onLogin({ 
            id: data.user.id, 
            name: data.user.user_metadata?.full_name || email.split('@')[0], 
            email: data.user.email || email 
          });
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name }
          }
        });
        if (error) throw error;
        if (data.user) {
          onLogin({ 
            id: data.user.id, 
            name: name || email.split('@')[0], 
            email: data.user.email || email 
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in duration-500">
        <div className="p-8 lg:p-10 bg-indigo-600 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-700 opacity-50" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Lumina Study</h1>
            <p className="text-indigo-100 text-[10px] uppercase font-bold tracking-widest mt-2">Cloud-Powered Learning</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-6">
          <div className="space-y-1 text-center">
            <div className="inline-flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full">
              <button 
                type="button"
                onClick={() => { setIsLogin(true); setError(null); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${isLogin ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Login
              </button>
              <button 
                type="button"
                onClick={() => { setIsLogin(false); setError(null); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!isLogin ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 text-xs font-bold text-center border border-rose-100 dark:border-rose-900/30">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm dark:text-slate-100"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm dark:text-slate-100"
                placeholder="email@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm dark:text-slate-100"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />)}
            {isLogin ? 'Enter Workspace' : 'Create Account'}
          </button>

          <p className="text-center text-slate-400 text-[10px] leading-relaxed">
            Secured by Supabase Cloud Infrastructure.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Auth;
