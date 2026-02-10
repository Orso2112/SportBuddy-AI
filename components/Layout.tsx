
import React from 'react';
import { Home, Camera, Users, MapPin, Search, MessageSquare, Globe, Moon, Sun } from 'lucide-react';
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
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, lang, setLang, theme, setTheme }) => {
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
        <Logo size="sm" />
        
        <div className="flex items-center gap-3">
          <button onClick={() => setLang(lang === 'en' ? 'it' : 'en')} className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <Globe size={18} />
          </button>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <div className="hidden md:flex gap-1 ml-4">
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

      {/* Bottom Nav (Mobile) */}
      <nav className={`fixed bottom-0 left-0 right-0 glass border-t md:hidden flex justify-around items-center h-20 px-2 z-50 ${theme === 'dark' ? 'border-gray-800 bg-gray-900/70' : 'border-gray-200 bg-white/70'}`}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center w-full gap-1 transition-all ${
              activeTab === item.id 
                ? 'text-blue-600 scale-110' 
                : (theme === 'dark' ? 'text-gray-600' : 'text-gray-400')
            }`}
          >
            <item.icon size={22} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
