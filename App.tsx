
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { Tab, UserProfile, Language, Theme } from './types';
import Dashboard from './views/Dashboard';
import Coach from './views/Coach';
import Social from './views/Social';
import Maps from './views/Maps';
import Scout from './views/Scout';
import Chat from './views/Chat';
import { translations } from './i18n';
import { Globe, Moon, Sun } from 'lucide-react';
import Logo from './components/Logo';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [coachSubView, setCoachSubView] = useState<'main' | 'history'>('main');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('sportbuddy_user');
    const savedLang = localStorage.getItem('sportbuddy_lang') as Language;
    const savedTheme = localStorage.getItem('sportbuddy_theme') as Theme;
    
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedLang) setLang(savedLang);
    if (savedTheme) setTheme(savedTheme);
    
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('sportbuddy_theme', theme);
  }, [theme]);

  const t = translations[lang];

  const handleCreateAccount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newUser: UserProfile = {
      name: formData.get('name') as string,
      sport: formData.get('sport') as string,
      level: formData.get('level') as string,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.get('name')}`,
      stats: { workouts: 0, matches: 0, chats: 0 }
    };
    setUser(newUser);
    localStorage.setItem('sportbuddy_user', JSON.stringify(newUser));
  };

  const updateStats = (key: keyof UserProfile['stats']) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      stats: { ...user.stats, [key]: user.stats[key] + 1 }
    };
    setUser(updatedUser);
    localStorage.setItem('sportbuddy_user', JSON.stringify(updatedUser));
  };

  const navigateToTab = (tab: Tab, subView: 'main' | 'history' = 'main') => {
    setActiveTab(tab);
    if (tab === Tab.COACH) {
      setCoachSubView(subView);
    }
  };

  if (isInitializing) return null;

  if (!user) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-blue-600'} flex items-center justify-center p-4 transition-colors overflow-hidden relative`}>
        {/* Background Decorative Circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-indigo-900/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        
        <div className={`${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-[2rem] p-6 md:p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-500 relative z-10`}>
          {/* Internal Header for Toggles */}
          <div className="absolute top-6 right-6 flex gap-1.5">
             <button onClick={() => setLang(lang === 'en' ? 'it' : 'en')} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                <Globe size={16} />
             </button>
             <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
             </button>
          </div>

          <div className="flex flex-col items-center mb-6">
            <Logo size="md" className="mb-4" />
            <h1 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'} tracking-tight`}>{t.create_profile}</h1>
            <p className="text-gray-500 text-[11px] font-medium text-center mt-1.5 max-w-[220px] leading-relaxed">{t.join_community}</p>
          </div>
          
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div>
              <label className="block text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1.5 px-1">{t.full_name}</label>
              <input name="name" required className={`w-full ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-500' : 'bg-gray-50 border-gray-200 placeholder-gray-400'} border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all`} placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1.5 px-1">{t.primary_sport}</label>
              <div className="relative">
                <select name="sport" className={`w-full ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl px-4 py-3 text-sm outline-none appearance-none shadow-sm transition-all`}>
                  {Object.entries(t.sports).map(([key, label]) => (
                    <option key={key} value={label}>{label}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1.5 px-1">{t.exp_level}</label>
              <div className="relative">
                <select name="level" className={`w-full ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl px-4 py-3 text-sm outline-none appearance-none shadow-sm transition-all`}>
                  <option value="Beginner">{t.beginner}</option>
                  <option value="Intermediate">{t.intermediate}</option>
                  <option value="Advanced">{t.advanced}</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/10 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all active:scale-95 mt-4">
              {t.create_btn}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case Tab.DASHBOARD: return <Dashboard onNavigate={navigateToTab} user={user} lang={lang} />;
      case Tab.COACH: return <Coach onAnalyze={() => updateStats('workouts')} lang={lang} currentView={coachSubView} setView={setCoachSubView} />;
      case Tab.SOCIAL: return <Social user={user} onPost={() => updateStats('matches')} lang={lang} />;
      case Tab.MAPS: return <Maps lang={lang} />;
      case Tab.SCOUT: return <Scout lang={lang} />;
      case Tab.CHAT: return <Chat onChat={() => updateStats('chats')} lang={lang} />;
      default: return <Dashboard onNavigate={navigateToTab} user={user} lang={lang} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={navigateToTab} 
      lang={lang} 
      setLang={(l) => { setLang(l); localStorage.setItem('sportbuddy_lang', l); }} 
      theme={theme} 
      setTheme={setTheme}
    >
      <div className="animate-in fade-in duration-500">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
