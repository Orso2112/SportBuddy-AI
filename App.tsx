
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { Tab, UserProfile, Language, Theme, UserSport } from './types';
import Dashboard from './views/Dashboard';
import Coach from './views/Coach';
import Social from './views/Social';
import Maps from './views/Maps';
import Scout from './views/Scout';
import Chat from './views/Chat';
import { translations } from './i18n';
import { Globe, Moon, Sun, CheckCircle2, RefreshCw, Lock, Mail, User as UserIcon } from 'lucide-react';
import Logo from './components/Logo';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [coachSubView, setCoachSubView] = useState<'main' | 'history'>('main');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [isInitializing, setIsInitializing] = useState(true);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');

  // Registration Form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSports, setRegSports] = useState<string[]>([]);
  const [sportLevels, setSportLevels] = useState<Record<string, string>>({});
  const [avatarSeed, setAvatarSeed] = useState(Math.random().toString(36).substring(7));

  // Login Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('sportbuddy_user');
    const savedLang = localStorage.getItem('sportbuddy_lang') as Language;
    const savedTheme = localStorage.getItem('sportbuddy_theme') as Theme;
    
    // Explicitly cast JSON.parse result to UserProfile to avoid unknown/any issues
    if (savedUser) setUser(JSON.parse(savedUser) as UserProfile);
    if (savedLang) setLang(savedLang);
    if (savedTheme) setTheme(savedTheme);
    
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    // Ensure theme value is explicitly treated as string for localStorage
    localStorage.setItem('sportbuddy_theme', String(theme));
  }, [theme]);

  const t = translations[lang];

  const randomizeAvatar = () => {
    setAvatarSeed(Math.random().toString(36).substring(7));
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim() || regSports.length === 0) {
      alert(lang === 'it' ? 'Compila tutti i campi e seleziona almeno uno sport.' : 'Please fill all fields and select at least one sport.');
      return;
    }

    // Check if account already exists
    const existingUser = localStorage.getItem(`user_auth_${regEmail}`);
    if (existingUser) {
      alert(lang === 'it' ? 'Un account con questa email esiste già.' : 'An account with this email already exists.');
      return;
    }

    const selectedSports: UserSport[] = regSports.map(s => ({
      sport: s,
      level: sportLevels[s] || t.beginner
    }));

    const newUser: UserProfile = {
      name: regName,
      email: regEmail,
      password: regPassword,
      selectedSports,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`,
      stats: { workouts: 0, matches: 0, chats: 0 }
    };

    setUser(newUser);
    localStorage.setItem('sportbuddy_user', JSON.stringify(newUser));
    localStorage.setItem(`user_auth_${regEmail}`, JSON.stringify(newUser));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const savedUserAuth = localStorage.getItem(`user_auth_${loginEmail}`);
    if (savedUserAuth) {
      // Explicitly cast JSON.parse result to UserProfile
      const parsed: UserProfile = JSON.parse(savedUserAuth) as UserProfile;
      if (parsed.password === loginPassword) {
        setUser(parsed);
        localStorage.setItem('sportbuddy_user', JSON.stringify(parsed));
      } else {
        alert(lang === 'it' ? 'Password errata.' : 'Incorrect password.');
      }
    } else {
      alert(lang === 'it' ? 'Nessun account trovato con questa email.' : 'No account found with this email.');
      setAuthMode('signup');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab(Tab.DASHBOARD);
    localStorage.removeItem('sportbuddy_user');
  };

  // Fixed: renamed currentUser to avoid confusion and ensured strict typing
  const updateStats = (key: keyof UserProfile['stats']) => {
    const activeUser = user;
    if (!activeUser) return;
    
    const updatedUser: UserProfile = {
      ...activeUser,
      stats: { ...activeUser.stats, [key]: activeUser.stats[key] + 1 }
    };
    setUser(updatedUser);
    localStorage.setItem('sportbuddy_user', JSON.stringify(updatedUser));
    localStorage.setItem(`user_auth_${activeUser.email}`, JSON.stringify(updatedUser));
  };

  const navigateToTab = (tab: Tab, subView: 'main' | 'history' = 'main') => {
    setActiveTab(tab);
    if (tab === Tab.COACH) {
      setCoachSubView(subView);
    }
  };

  const toggleSportSelection = (sportLabel: string) => {
    if (regSports.includes(sportLabel)) {
      setRegSports(prev => prev.filter(s => s !== sportLabel));
      const newLevels = { ...sportLevels };
      delete newLevels[sportLabel];
      setSportLevels(newLevels);
    } else {
      if (regSports.length < 3) {
        setRegSports(prev => [...prev, sportLabel]);
        setSportLevels(prev => ({ ...prev, [sportLabel]: t.beginner }));
      }
    }
  };

  if (isInitializing) return null;

  if (!user) {
    const levels = [t.beginner, t.amateur, t.intermediate, t.specialist, t.advanced];
    const sportsList = Object.entries(t.sports);

    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-blue-600'} flex items-center justify-center p-4 transition-colors relative`}>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-indigo-900/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        </div>
        
        <div className={`${theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white'} rounded-[3rem] p-8 md:p-10 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-500 relative z-10 overflow-hidden`}>
          <div className="absolute top-8 right-8 flex gap-2">
             <button onClick={() => setLang(lang === 'en' ? 'it' : 'en')} className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-500'}`}>
                <Globe size={18} />
             </button>
             <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-500'}`}>
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
             </button>
          </div>

          <div className="flex flex-col items-center mb-8">
            <Logo size="md" className="mb-4" />
            <h1 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'} tracking-tight text-center`}>
              {authMode === 'signup' ? t.create_profile : t.login_btn}
            </h1>
          </div>
          
          {authMode === 'signup' ? (
            <form onSubmit={handleCreateAccount} className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-50 transition"></div>
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
                    className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-700 relative z-10 shadow-lg"
                    alt="Avatar Preview" 
                  />
                  <button 
                    type="button"
                    onClick={randomizeAvatar}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg z-20 hover:scale-110 active:rotate-180 transition-all border-2 border-white dark:border-gray-900"
                    title="Randomize Avatar"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">
                    <UserIcon size={12} /> {t.full_name}
                  </label>
                  <input 
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required 
                    className={`w-full ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 border-gray-200'} border-2 rounded-2xl px-5 py-3 text-sm outline-none focus:border-blue-500 transition-all`} 
                    placeholder="Alex Rivera" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">
                    <Mail size={12} /> {t.email_address}
                  </label>
                  <input 
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required 
                    className={`w-full ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 border-gray-200'} border-2 rounded-2xl px-5 py-3 text-sm outline-none focus:border-blue-500 transition-all`} 
                    placeholder="alex@example.com" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">
                  <Lock size={12} /> {lang === 'en' ? 'Password' : 'Password'}
                </label>
                <input 
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required 
                  className={`w-full ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 border-gray-200'} border-2 rounded-2xl px-5 py-3 text-sm outline-none focus:border-blue-500 transition-all`} 
                  placeholder="••••••••" 
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">{t.primary_sport}</label>
                  <span className="text-[10px] font-black text-blue-500 uppercase">{regSports.length} / 3</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[140px] overflow-y-auto no-scrollbar p-1">
                  {sportsList.map(([key, label]) => {
                    const sportLabel = label as string;
                    const isSelected = regSports.includes(sportLabel);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleSportSelection(sportLabel)}
                        className={`px-3 py-3 rounded-xl text-[9px] font-bold uppercase tracking-tight transition-all border-2 text-center truncate ${
                          isSelected 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                          : (theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200')
                        }`}
                      >
                        {sportLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {regSports.length > 0 && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">{t.exp_level}</label>
                  <div className="space-y-2">
                    {regSports.map((sport) => (
                      <div key={sport} className={`flex items-center gap-3 p-3 rounded-2xl border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="flex-1 text-[11px] font-black uppercase tracking-widest text-blue-500 truncate">{sport}</span>
                        <select 
                          value={sportLevels[sport]} 
                          onChange={(e) => setSportLevels({ ...sportLevels, [sport]: e.target.value })}
                          className={`bg-transparent outline-none text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                        >
                          {levels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 space-y-4">
                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all active:scale-95">
                  {t.create_btn}
                </button>
                <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {t.has_account}{' '}
                  <button type="button" onClick={() => setAuthMode('login')} className="text-blue-600 hover:underline">{t.login_btn}</button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">
                   <Mail size={12} /> {t.email_address}
                </label>
                <input 
                  type="email"
                  required 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={`w-full ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 border-gray-200'} border-2 rounded-2xl px-5 py-4 text-sm outline-none focus:border-blue-500 transition-all`} 
                  placeholder="Enter your email" 
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">
                   <Lock size={12} /> {lang === 'en' ? 'Password' : 'Password'}
                </label>
                <input 
                  type="password"
                  required 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={`w-full ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 border-gray-200'} border-2 rounded-2xl px-5 py-4 text-sm outline-none focus:border-blue-500 transition-all`} 
                  placeholder="••••••••" 
                />
              </div>
              <div className="pt-4 space-y-4">
                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all active:scale-95">
                  {t.login_btn}
                </button>
                <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {t.no_account}{' '}
                  <button type="button" onClick={() => setAuthMode('signup')} className="text-blue-600 hover:underline">{t.create_btn}</button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Explicitly narrow user to avoid inference issues in closures
  const currentUser: UserProfile = user as UserProfile;

  const renderContent = () => {
    switch (activeTab) {
      case Tab.DASHBOARD: return <Dashboard onNavigate={navigateToTab} user={currentUser} lang={lang} />;
      case Tab.COACH: return <Coach onAnalyze={() => updateStats('workouts')} lang={lang} currentView={coachSubView} setView={setCoachSubView} />;
      case Tab.SOCIAL: return <Social user={currentUser} onPost={() => updateStats('matches')} lang={lang} />;
      case Tab.MAPS: return <Maps lang={lang} />;
      case Tab.SCOUT: return <Scout lang={lang} />;
      case Tab.CHAT: return <Chat onChat={() => updateStats('chats')} lang={lang} />;
      default: return <Dashboard onNavigate={navigateToTab} user={currentUser} lang={lang} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={navigateToTab} 
      lang={lang} 
      // Fixed: explicitly ensuring the argument 'l' is treated as a string to resolve unknown type issues in localStorage.setItem
      setLang={(l: Language) => { setLang(l); localStorage.setItem('sportbuddy_lang', l as string); }} 
      theme={theme} 
      // Fix: Use an explicit callback to resolve Dispatch type inference compatibility with LayoutProps.setTheme
      setTheme={(t: Theme) => setTheme(t)}
      onLogout={handleLogout}
    >
      <div className="animate-in fade-in duration-500">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
