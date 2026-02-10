
import React, { useMemo } from 'react';
import { Tab, UserProfile, Language, WorkoutLog } from '../types';
import { Activity, Map as MapIcon, Users, Trophy, MessageSquare, Flame, Calendar, ChevronRight } from 'lucide-react';
import { translations } from '../i18n';

interface DashboardProps {
  onNavigate: (tab: Tab, subView?: 'main' | 'history') => void;
  user: UserProfile;
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, user, lang }) => {
  const t = translations[lang];
  
  const workouts: WorkoutLog[] = useMemo(() => {
    const saved = localStorage.getItem('sportbuddy_workouts');
    return saved ? JSON.parse(saved) : [];
  }, []);

  const streak = useMemo(() => {
    if (workouts.length === 0) return 0;
    
    const dates = workouts.map(w => new Date(w.timestamp).toDateString());
    const uniqueDates = Array.from(new Set(dates)).map(d => new Date(d));
    uniqueDates.sort((a, b) => b.getTime() - a.getTime());
    
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    // Check if user has worked out today or yesterday to continue streak
    if (new Date(uniqueDates[0]).toDateString() !== today && 
        new Date(uniqueDates[0]).toDateString() !== yesterday) {
      return 0;
    }
    
    let currentStreak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const diff = (uniqueDates[i].getTime() - uniqueDates[i+1].getTime()) / 86400000;
      if (Math.round(diff) === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
    return currentStreak;
  }, [workouts]);

  const stats = [
    { label: t.workouts, value: user.stats.workouts.toString(), icon: Activity, color: 'text-green-500' },
    { label: t.matches, value: user.stats.matches.toString(), icon: Users, color: 'text-blue-500' },
    { label: t.chats, value: user.stats.chats.toString(), icon: MessageSquare, color: 'text-yellow-500' },
  ];

  const features = [
    { id: Tab.COACH, title: t.ai_coach, desc: t.ai_coach_desc, icon: Activity, color: 'bg-blue-500' },
    { id: Tab.MAPS, title: t.smart_venues, desc: t.smart_venues_desc, icon: MapIcon, color: 'bg-green-500' },
    { id: Tab.SOCIAL, title: t.match_making, desc: t.match_making_desc, icon: Users, color: 'bg-indigo-500' },
    { id: Tab.SCOUT, title: t.auto_scout, desc: t.auto_scout_desc, icon: Trophy, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-1">{t.welcome}, {user.name.split(' ')[0]}!</h2>
            <p className="opacity-90 text-sm mb-4">{user.level} | {user.sport}</p>
            <div className="flex gap-4">
              <button 
                onClick={() => onNavigate(Tab.COACH)}
                className="bg-white text-blue-600 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:scale-105 active:scale-95 transition-all"
              >
                {t.start_training}
              </button>
              {streak > 0 && (
                <div className="flex items-center gap-1.5 bg-orange-500/20 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                  <Flame size={16} className="text-orange-400 animate-pulse" />
                  <span className="text-xs font-black tracking-widest">{streak} {t.streak}</span>
                </div>
              )}
            </div>
          </div>
          <img src={user.avatar} className="w-16 h-16 rounded-full border-2 border-white/20 bg-white/10 shadow-lg" alt="Avatar" />
        </div>
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
      </section>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center transition-all">
            <stat.icon className={stat.color} size={20} />
            <span className="text-xl font-bold mt-1 dark:text-white">{stat.value}</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 px-2">{t.explore}</h3>
          <div className="grid grid-cols-1 gap-4">
            {features.map((feat) => (
              <button
                key={feat.id}
                onClick={() => onNavigate(feat.id)}
                className="flex items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 text-left hover:border-blue-300 dark:hover:border-blue-500 transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl ${feat.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-md`}>
                  <feat.icon size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-100">{feat.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{feat.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t.recent_activity}</h3>
            {workouts.length > 0 && (
              <button onClick={() => onNavigate(Tab.COACH, 'history')} className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-1">
                {lang === 'en' ? 'History' : 'Cronologia'} <ChevronRight size={10} />
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {workouts.length === 0 ? (
              <div className="bg-white/50 dark:bg-gray-800/30 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-8 text-center">
                <p className="text-sm text-gray-400 font-medium">{t.no_activity}</p>
              </div>
            ) : (
              workouts.slice(0, 4).map((log) => (
                <div key={log.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-xl flex items-center justify-center">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{log.exercise}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {new Date(log.timestamp).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US', { day: 'numeric', month: 'short' })} • {new Date(log.timestamp).toLocaleTimeString(lang === 'it' ? 'it-IT' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-gray-100 dark:border-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
