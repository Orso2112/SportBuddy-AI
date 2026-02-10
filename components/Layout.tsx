
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
    { id: Tab.DASHBOARD, label: t.home, icon: Home },
    { id: Tab.COACH, label: t.coach, icon: Camera },
    { id: Tab.SOCIAL, label: t.social, icon: Users },
    { id: Tab.MAPS, label: t.maps, icon: MapPin },
    { id: Tab.SCOUT, label: t.scout, icon: Search },
    { id: Tab.CHAT, label: t.ai_chat, icon: MessageSquare },
  ];

  return (
    <div className={`flex flex-col min-h-screen pb-20 md:pb-0 md:pt-16 transition-colors ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Top Header */}
      <header className={`fixed top-0 left-0 right-0 glass border-b ${theme === 'dark' ? 'border-gray-800 bg-gray-900/70' : 'border-gray-200 bg-white/70'} h-16 flex items-center px-4 z-50 justify-between`}>
        <div className="flex items-center">
          <Logo size="sm" showText={true} />
        </div>
        
        <div className="flex items-center gap-1 sm:gap-3">
          <button onClick={() => setLang(lang === 'en' ? 'it' : 'en')} className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`} title="Change Language">
            <Globe size={18} />
          </button>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`} title="Toggle Theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={onLogout} className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-red-900/40 text-red-400' : 'hover:bg-red-50 text-red-500'}`} title={t.logout}>
            <LogOut size={18} />
          </button>
          
          <div className="hidden lg:flex gap-1 ml-4 border-l pl-4 border-gray-200 dark:border-gray-800">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-2 rounded-xl transition-all font-medium flex items-center gap-2 ${
                  activeTab === item.id 
                    ? (theme === 'dark' ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-50 text-blue-600') 
                    : (theme === 'dark' ? 'text-gray-500 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100')
                }`}
              >
                <item.icon size={18} />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 mt-16 md:mt-4">
        {children}
      </main>

      {/* Bottom Nav (Mobile/Tablet) */}
      <nav className={`fixed bottom-0 left-0 right-0 glass border-t lg:hidden flex justify-around items-center h-20 px-2 z-50 ${theme === 'dark' ? 'border-gray-800 bg-gray-900/70' : 'border-gray-200 bg-white/70'}`}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${
              activeTab === item.id 
                ? 'text-blue-600 scale-105' 
                : (theme === 'dark' ? 'text-gray-600' : 'text-gray-400')
            }`}
          >
            <item.icon size={22} className={activeTab === item.id ? 'stroke-[2.5px]' : ''} />
            <span className={`text-[9px] font-black uppercase tracking-tighter ${activeTab === item.id ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
