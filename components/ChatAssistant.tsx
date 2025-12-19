
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, BrainCircuit } from 'lucide-react';
import { studyAssistant } from '../services/geminiService';
import { Note, ChatMessage } from '../types';

interface ChatAssistantProps {
  contextNote?: Note | null;
  darkMode?: boolean;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ contextNote, darkMode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const contextText = contextNote 
        ? `\n\n[Context from current note: "${contextNote.title}"]: ${contextNote.content}` 
        : "";
      
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const res = await studyAssistant.chat(userMessage + contextText, history);
      setMessages(prev => [...prev, { role: 'model', text: res || "I'm sorry, I couldn't process that." }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "An error occurred. Check your connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const textClass = darkMode ? 'text-slate-100' : 'text-slate-800';
  const bgClass = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`max-w-4xl mx-auto h-[calc(100vh-180px)] md:h-[calc(100vh-160px)] flex flex-col rounded-[2.5rem] border shadow-2xl overflow-hidden ${bgClass}`}>
      {/* Header */}
      <div className="bg-indigo-600 p-5 lg:p-6 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 lg:gap-4 overflow-hidden">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0">
            <BrainCircuit className="w-6 h-6 lg:w-7 lg:h-7" />
          </div>
          <div className="truncate">
            <h2 className="text-base lg:text-xl font-bold truncate">Lumina AI</h2>
            <p className="text-indigo-100 text-[10px] lg:text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Active Assistant
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className={`flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 transition-colors duration-300 ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-400">
            <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-3xl flex items-center justify-center shadow-sm ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <Sparkles className="w-6 h-6 lg:w-8 lg:h-8 text-indigo-400" />
            </div>
            <div className="max-w-[200px] lg:max-w-xs">
              <p className={`font-bold text-base lg:text-lg mb-1 ${textClass}`}>Hello! I'm Lumina.</p>
              <p className="text-[10px] lg:text-sm">"Explain recursion" or "Summarize my history notes".</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex gap-2 lg:gap-3 max-w-[90%] lg:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-indigo-600' : (darkMode ? 'bg-slate-800' : 'bg-white border border-slate-200')
              }`}>
                {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-indigo-600" />}
              </div>
              <div className={`p-3 lg:p-4 rounded-2xl shadow-sm text-xs lg:text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : (darkMode ? 'bg-slate-800 text-slate-300 border border-slate-700 rounded-tl-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none')
              }`}>
                {msg.text.split('\n').map((line, i) => (
                  <p key={i} className={line.startsWith('-') || line.startsWith('*') ? 'ml-4' : 'mb-2 last:mb-0'}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-2 lg:gap-3">
              <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center shrink-0 ${darkMode ? 'bg-slate-800' : 'bg-white border'}`}>
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className={`p-3 lg:p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
                <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce delay-75" />
                <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className={`p-4 lg:p-6 border-t shrink-0 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Type your question..."
            className={`w-full pl-4 lg:pl-6 pr-14 lg:pr-16 py-3 lg:py-4 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 text-xs lg:text-sm transition-colors ${darkMode ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-700'}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 lg:p-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
