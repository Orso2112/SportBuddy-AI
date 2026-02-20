
import React from 'react';
import { Home, Camera, Users, MapPin, Search, MessageSquare, Globe, Moon, Sun, LogOut } from 'lucide-react';
import { Tab, Language, Theme } from '../types';
import { translations } from '../i18n';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  lang: Language;
  setLang: (l: Language) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, lang, setLang, theme, setTheme, onLogout }) => {
  const t = translations[lang];
  
  const navItems = [
    { id: Tab.DASHBOARD, label: t.home, icon: Home, color: 'blue' },
    { id: Tab.COACH, label: t.coach, icon: Camera, color: 'emerald' },
    { id: Tab.SOCIAL, label: t.social, icon: Users, color: 'indigo' },
    { id: Tab.MAPS, label: t.maps, icon: MapPin, color: 'amber' },
    { id: Tab.SCOUT, label: t.scout, icon: Search, color: 'rose' },
    { id: Tab.CHAT, label: t.ai_chat, icon: MessageSquare, color: 'violet' },
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const themes: Record<string, any> = {
      blue: {
        active: theme === 'dark' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-blue-50 text-blue-600 border-blue-200',
        hover: theme === 'dark' ? 'hover:bg-blue-500/10' : 'hover:bg-blue-50',
        dot: 'bg-blue-500',
        icon: 'text-blue-500'
      },
      emerald: {
        active: theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-emerald-50 text-emerald-600 border-emerald-200',
        hover: theme === 'dark' ? 'hover:bg-emerald-500/10' : 'hover:bg-emerald-50',
        dot: 'bg-emerald-500',
        icon: 'text-emerald-500'
      },
      indigo: {
        active: theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' : 'bg-indigo-50 text-indigo-600 border-indigo-200',
        hover: theme === 'dark' ? 'hover:bg-indigo-500/10' : 'hover:bg-indigo-50',
        dot: 'bg-indigo-500',
        icon: 'text-indigo-500'
      },
      amber: {
        active: theme === 'dark' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-amber-50 text-amber-600 border-amber-200',
        hover: theme === 'dark' ? 'hover:bg-amber-500/10' : 'hover:bg-amber-50',
        dot: 'bg-amber-500',
        icon: 'text-amber-500'
      },
      rose: {
        active: theme === 'dark' ? 'bg-rose-500/20 text-rose-400 border-rose-500/50' : 'bg-rose-50 text-rose-600 border-rose-200',
        hover: theme === 'dark' ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50',
        dot: 'bg-rose-500',
        icon: 'text-rose-500'
      },
      violet: {
        active: theme === 'dark' ? 'bg-violet-500/20 text-violet-400 border-violet-500/50' : 'bg-violet-50 text-violet-600 border-violet-200',
        hover: theme === 'dark' ? 'hover:bg-violet-500/10' : 'hover:bg-violet-50',
        dot: 'bg-violet-500',
        icon: 'text-violet-500'
      }
    };
    return themes[color] || themes.blue;
  };

  return (
    <div className={`flex min-h-screen transition-colors ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sidebar - Consistent for all screens */}
      <aside className={`w-20 lg:w-64 flex flex-col border-r sticky top-0 h-screen z-50 transition-all duration-500 ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white shadow-2xl'}`}>
        <div className="p-4 lg:p-6 flex justify-center lg:justify-start overflow-hidden">
          <Logo size="sm" showText={false} className="lg:hidden" />
          <Logo size="sm" showText={true} className="hidden lg:flex" />
        </div>

        <nav className="flex-1 px-2 lg:px-3 space-y-2 mt-4 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const colors = getColorClasses(item.color, isActive);
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 p-3 lg:px-4 lg:py-3.5 rounded-2xl transition-all duration-300 border border-transparent group relative ${
                  isActive ? colors.active : `text-gray-500 ${colors.hover} hover:text-gray-900 dark:hover:text-gray-200`
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <item.icon size={22} className={`transition-transform duration-300 ${isActive ? 'scale-110 stroke-[2.5px]' : 'group-hover:scale-110'} ${isActive ? '' : colors.icon}`} />
                  {isActive && (
                    <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${colors.dot} shadow-[0_0_8px_rgba(0,0,0,0.3)]`} />
                  )}
                </div>
                <span className={`hidden lg:block text-sm font-bold tracking-tight transition-all ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                  {item.label}
                </span>
                
                {/* Tooltip for collapsed state */}
                <div className="lg:hidden absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                  {item.label}
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-2 lg:p-4 space-y-1 border-t border-gray-200/50 dark:border-gray-800/50">
          <button onClick={() => setLang(lang === 'en' ? 'it' : 'en')} className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <Globe size={20} />
            <span className="hidden lg:block text-xs font-bold uppercase tracking-widest">{lang === 'en' ? 'IT' : 'EN'}</span>
          </button>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span className="hidden lg:block text-xs font-bold uppercase tracking-widest">{theme === 'light' ? 'Dark' : 'Light'}</span>
          </button>
          <button onClick={onLogout} className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${theme === 'dark' ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-500'}`}>
            <LogOut size={20} />
            <span className="hidden lg:block text-xs font-bold uppercase tracking-widest">{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 transition-all duration-500 overflow-x-hidden">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
