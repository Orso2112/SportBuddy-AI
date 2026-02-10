
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, Plus, Image as ImageIcon, Zap } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Language } from '../types';
import { translations } from '../i18n';
import FormattedText from '../components/FormattedText';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

interface ChatProps {
  onChat: () => void;
  lang: Language;
}

const Chat: React.FC<ChatProps> = ({ onChat, lang }) => {
  const t = translations[lang];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickStarters = lang === 'en' 
    ? [
        { text: "Improve my vertical jump", icon: <Zap size={14} /> },
        { text: "Padel rules for beginners", icon: <Bot size={14} /> },
        { text: "10-min home cardio", icon: <Zap size={14} /> },
        { text: "Best recovery techniques", icon: <Bot size={14} /> }
      ]
    : [
        { text: "Migliora salto verticale", icon: <Zap size={14} /> },
        { text: "Regole Padel principianti", icon: <Bot size={14} /> },
        { text: "Cardio 10 min casa", icon: <Zap size={14} /> },
        { text: "Tecniche di recupero", icon: <Bot size={14} /> }
      ];

  useEffect(() => {
    setMessages([
      { role: 'bot', text: lang === 'en' ? 'Hello! I am your SportBuddy AI assistant. Ask me anything about training, sports, or nutrition!' : 'Ciao! Sono il tuo assistente SportBuddy AI. Chiedimi qualsiasi cosa su allenamento, sport o nutrizione!' }
    ]);
  }, [lang]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msgToSend = text || input;
    if (!msgToSend.trim() || loading) return;

    setMessages(prev => [...prev, { role: 'user', text: msgToSend }]);
    setInput('');
    setLoading(true);

    try {
      const response = await geminiService.chat(msgToSend, lang);
      setMessages(prev => [...prev, { role: 'bot', text: response || '...' }]);
      onChat();
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: lang === 'it' ? 'Scusa, si è verificato un errore.' : 'Sorry, an error occurred.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)] max-w-2xl mx-auto px-2 relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pt-6 pb-24 space-y-6 no-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[90%] md:max-w-[85%] px-6 py-5 rounded-[2.5rem] text-sm shadow-sm relative ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none shadow-xl shadow-blue-500/10' 
                : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-800'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${msg.role === 'bot' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-500' : 'bg-white/20 text-white'}`}>
                   {msg.role === 'bot' ? <Bot size={14} /> : <User size={14} />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest opacity-60`}>
                  {msg.role === 'bot' ? 'SportBuddy AI' : 'Me'}
                </span>
              </div>
              <div className="font-medium">
                {msg.role === 'bot' ? <FormattedText text={msg.text} /> : <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-900 px-8 py-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 rounded-bl-none flex items-center gap-2">
              <div className="flex gap-2.5">
                 <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-duration:0.6s]" />
                 <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.1s]" />
                 <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}

        {messages.length < 3 && !loading && (
          <div className="space-y-6 pt-10 px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                <Sparkles size={16} />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Suggested Prompts</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickStarters.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q.text)}
                  className="group text-left px-6 py-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/5 transition-all flex items-center gap-5 active:scale-95"
                >
                  <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0 shadow-sm">
                    {q.icon}
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors leading-tight">{q.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Transparent Input area: removed "shelf" or dark boxes */}
      <div className="absolute bottom-4 left-0 right-0 p-2 sm:p-4 pointer-events-none">
        <div className="relative flex items-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-200 dark:border-gray-800 rounded-[3rem] p-2.5 shadow-[0_20px_60px_-15px_rgba(37,99,235,0.25)] dark:shadow-none focus-within:ring-4 focus-within:ring-blue-500/10 transition-all overflow-hidden pointer-events-auto max-w-2xl mx-auto border-b-4 border-gray-100 dark:border-gray-800">
          <button className="p-4 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors group">
             <Plus size={22} className="group-hover:rotate-90 transition-transform" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.ask_question}
            className="flex-1 bg-transparent dark:text-white px-3 py-4 outline-none text-base font-medium placeholder-gray-400"
          />
          <div className="flex items-center gap-3 pr-2">
            <button className="p-4 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors hidden sm:flex">
               <ImageIcon size={22} />
            </button>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-4 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl shadow-blue-600/40 hover:scale-110 disabled:opacity-50 disabled:scale-100 transition-all active:scale-95 flex items-center justify-center border-b-4 border-blue-800"
            >
              <Send size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
